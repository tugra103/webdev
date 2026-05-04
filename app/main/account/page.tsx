"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Navbar from "@/comporents/navbar";
import { Card } from "primereact/card";
import { Avatar } from "primereact/avatar";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase";
import { updateProfile, getAuth, signOut } from "firebase/auth";
import { TabView, TabPanel } from 'primereact/tabview';
import { ProgressSpinner } from 'primereact/progressspinner';
        
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";



export default function Page() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [photoURL, setPhotoURL] = useState("");
  const [FriendCode, setFriendCode] = useState("");
  const [FriendReqs, setFriendReqs] = useState<Record<string, string>>({})
const [Friends, setFriends] = useState<Record<string, string>>({})

  // Arkadaşlar sekmesi için gerekli fonksiyonlar ve JSX
const { data: session } = useSession();
// 1. State'lere şunu ekle:
const [addCode, setAddCode] = useState("");
const [addError, setAddError] = useState("");
const [addSuccess, setAddSuccess] = useState("");

// 2. Fonksiyonlar:

const sendFriendReq = async () => {
  if (!user) return;
  setAddError("");
  setAddSuccess("");
  const targetUid = addCode.trim();
  if (!targetUid || targetUid === user.uid) {
    setAddError("Geçersiz kod.");
    return;
  }

  const targetRef = doc(db, "users", targetUid);
  const targetSnap = await getDoc(targetRef);
  if (!targetSnap.exists()) {
    setAddError("Kullanıcı bulunamadı.");
    return;
  }

  // Zaten arkadaş mı?
  if (Friends[targetUid]) {
    setAddError("Zaten arkadaşsınız.");
    return;
  }

  // İstek gönder → hedef kullanıcının friendreqs'ine ekle
  await setDoc(targetRef, {
    friendreqs: {
      ...targetSnap.data().friendreqs,
      [user.uid]: user.displayName ?? user.uid,
    }
  }, { merge: true });

  setAddSuccess("Arkadaşlık isteği gönderildi!");
  setAddCode("");
};

const acceptFriendReq = async (senderUid: string, senderName: string) => {
  // Her iki tarafa da arkadaş ekle
  if (!user) return;
  const newFriends = { ...Friends, [senderUid]: senderName };
  const newReqs = { ...FriendReqs };
  delete newReqs[senderUid];

  // Kendi dokümanını güncelle
  await setDoc(doc(db, "users", user.uid), {
    friends: newFriends,
    friendreqs: newReqs,
  }, { merge: true });

  // Karşı tarafın friendlist'ine de ekle
  const senderRef = doc(db, "users", senderUid);
  const senderSnap = await getDoc(senderRef);
  if (senderSnap.exists()) {
    await setDoc(senderRef, {
      friends: {
        ...senderSnap.data().friends,
        [user.uid]: user.displayName ?? user.uid,
      }
    }, { merge: true });
  }

  setFriends(newFriends);
  setFriendReqs(newReqs);
};

const rejectFriendReq = async (senderUid: string) => {
  if (!user) return;
  const newReqs = { ...FriendReqs };
  delete newReqs[senderUid];

  await setDoc(doc(db, "users", user.uid), {
    friendreqs: newReqs,
  }, { merge: true });

  setFriendReqs(newReqs);
};
  
  // ✅ Sayfa açılınca Firestore'dan fotoğrafı çek
  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      if (snap.exists()) {
        const data=snap.data();
        setPhotoURL(data.photoURL ?? "");
        setFriendCode(data.friendcode ?? "")
        setFriendReqs(data.friendreqs ?? {})
        setFriends(data.friends ?? {})
      }
    });
  }, [user]);

  useEffect(() => {
    if (!loading && !user) router.push("/login/sign-in");
  }, [user, loading]);
  const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        
        // ✅ Max 200x200 yap
        const MAX = 800;
        let { width, height } = img;
        if (width > height) {
          height = (height / width) * MAX;
          width = MAX;
        } else {
          width = (width / height) * MAX;
          height = MAX;
        }

        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);

        // ✅ 0.7 kalite ile JPEG'e çevir (~20-30KB olur)
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};
const changeUserData = async (data: any) => {
  if (!user) return;
  await setDoc(doc(db, "users", user.uid), data, { merge: true });
};
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = await compressImage(file)
      await setDoc(doc(db, "users", user.uid), { photoURL: base64 }, { merge: true });
      setPhotoURL(base64);
      setUploading(false);
      updateProfile(user, {
        photoURL: base64
      })
    };
    reader.readAsDataURL(file);
  };

  if (loading || !user) return <ProgressSpinner />;

  return (
    <div>
      <Navbar />
      <TabView className="theme1">
        <TabPanel header="Genel" className="theme1">
  <div className="flex min-h-screen justify-center items-start pt-12 px-4">
    <div className="w-full max-w-sm flex flex-col gap-4">

      {/* Profil Kartı */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center gap-4 shadow-sm">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />

        {/* Avatar */}
        <div
          className="cursor-pointer relative"
          onClick={() => fileInputRef.current?.click()}
        >
          <img
            src={photoURL || "https://primefaces.org/cdn/primereact/images/avatar/default.png"}
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity">
            <span className="text-white text-xs font-medium">
              {uploading ? "Yükleniyor..." : "Değiştir"}
            </span>
          </div>
        </div>

        {/* İsim */}
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-800">{user.displayName ?? "İsimsiz"}</p>
          <p className="text-xs text-gray-400 mt-1 font-mono truncate max-w-xs">{user.email}</p>
        </div>
      </div>

      {/* Ayarlar Kartı */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        
        {/* İsim Değiştir */}
        <button
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
          onClick={() => {
            const newName = prompt("Yeni Ad:", user.displayName ?? "");
            if (newName) {
              updateProfile(user, { displayName: newName });
              changeUserData({ displayName: newName, friendcode: user.uid });
            }
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <svg width="16" height="16" fill="none" stroke="#3b82f6" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <span className="text-sm text-gray-700">Görünen Ad</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">{user.displayName}</span>
            <svg width="16" height="16" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </div>
        </button>

        {/* Arkadaşlık Kodu */}
        <button
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
          onClick={() => navigator.clipboard.writeText(FriendCode || user.uid)}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
              <svg width="16" height="16" fill="none" stroke="#22c55e" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </div>
            <span className="text-sm text-gray-700">Arkadaşlık Kodu</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-mono truncate max-w-28">{(FriendCode || user.uid).slice(0, 10)}...</span>
            <svg width="16" height="16" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
              <rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
            </svg>
          </div>
        </button>
      </div>
{/*Mastodon bilgiler*/}
<div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <button
          className="w-full flex items-center gap-3 px-5 py-4 hover:bg-red-50 transition-colors"
          onClick={() => {
                try {
                  if (!session){
                    alert("Önce Hesabınla Giriş yap!")
                    signIn("mastodon")
                  }else{
                  const auth = getAuth(app);
                  await updateDoc(doc(db, "users", existingDocId), {
                    mastodonId: session?.user.id,
                  });}
                } catch {
                  // boşver
                }
          }}
        >
          <span className="text-sm text-red-500 font-medium">Mastodon Hesabını bağla</span>
        </button>
      </div>
      {/* Çıkış Kartı */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <button
          className="w-full flex items-center gap-3 px-5 py-4 hover:bg-red-50 transition-colors"
          onClick={() => signOut(getAuth())}
        >
          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
            <svg width="16" height="16" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </div>
          <span className="text-sm text-red-500 font-medium">Çıkış Yap</span>
        </button>
      </div>

    </div>
  </div>
</TabPanel>
        <TabPanel header="Arkadaşlar" className="theme1">
             <div className="p-4 flex flex-col gap-6 max-w-lg mx-auto">

    {/* Kendi Kodu */}
    <div className="border rounded-lg p-4 bg-blue-50">
      <p className="text-sm text-gray-500 mb-1">Arkadaşlık Kodun</p>
      <div className="flex items-center gap-2">
        <code className="font-mono text-sm bg-white border rounded px-2 py-1 flex-1 overflow-auto">
          {FriendCode || user.uid}
        </code>
        <button
          className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          onClick={() => navigator.clipboard.writeText(FriendCode || user.uid)}
        >
          Kopyala
        </button>
      </div>
    </div>

    {/* Arkadaş Ekle */}
    <div className="border rounded-lg p-4">
      <p className="font-semibold mb-2">Arkadaş Ekle</p>
      <div className="flex gap-2">
        <input
          className="border rounded px-3 py-1 flex-1 text-sm"
          placeholder="Arkadaşlık kodu gir..."
          value={addCode}
          onChange={(e) => setAddCode(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
          onClick={sendFriendReq}
        >
          Gönder
        </button>
      </div>
      {addError && <p className="text-red-500 text-xs mt-1">{addError}</p>}
      {addSuccess && <p className="text-green-500 text-xs mt-1">{addSuccess}</p>}
    </div>

    {/* Gelen İstekler */}
    {Object.keys(FriendReqs).length > 0 && (
      <div className="border rounded-lg p-4">
        <p className="font-semibold mb-2">Gelen İstekler</p>
        <div className="flex flex-col gap-2">
          {Object.entries(FriendReqs).map(([uid, name]) => (
            <div key={uid} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
              <span className="text-sm">{String(name)}</span>
              <div className="flex gap-2">
                <button
                  className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                  onClick={() => acceptFriendReq(uid, String(name))}
                >
                  Kabul
                </button>
                <button
                  className="text-xs bg-red-400 text-white px-2 py-1 rounded hover:bg-red-500"
                  onClick={() => rejectFriendReq(uid)}
                >
                  Reddet
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Arkadaş Listesi */}
    <div className="border rounded-lg p-4">
      <p className="font-semibold mb-2">Arkadaşlarım ({Object.keys(Friends).length})</p>
      {Object.keys(Friends).length === 0 ? (
        <p className="text-sm text-gray-400">Henüz arkadaşın yok.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {Object.entries(Friends).map(([uid, name]) => (
            <div key={uid} className="flex items-center gap-3 bg-gray-50 rounded px-3 py-2">
              <Avatar
                label={String(name).charAt(0).toUpperCase()}
                shape="circle"
                size="normal"
              />
              <span className="text-sm">{String(name)}</span>
            </div>
          ))}
        </div>
      )}
    </div>

  </div>
        </TabPanel>
      </TabView>
    </div>
  );
}