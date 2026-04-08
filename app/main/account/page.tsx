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
  const [FriendReqs, setFriendReqs] =useState({})
  const [Friends, setFriends] =useState({})
  
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
    if (!loading && !user) router.push("/webdev/login/sign-in");
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
      <TabView>
        <TabPanel header="Genel">
          <div className="flex min-h-screen justify-center items-center h-full w-full">
<div className="flex items-center rounded-md flex-col gap-4 border-solid outline-2 outline-blue-500 h-fit w-fit">
  <input
    type="file"
    ref={fileInputRef}
    onChange={handleFileChange}
    className="hidden"
    accept="image/*"
  />

  <div
    className="cursor-pointer relative w-fit"
    onClick={() => fileInputRef.current?.click()}
  >
    <Avatar
      image={photoURL || "https://primefaces.org/cdn/primereact/images/avatar/default.png"}
      shape="circle"
      size="xlarge"
    />
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 hover:opacity-100 transition">
      <span className="text-white text-xs">
        {uploading ? "Yükleniyor..." : "Değiştir"}
      </span>
    </div>
  </div>

    

  <div className="text-center">
    <p className="font-semibold text-lg">{user?.displayName}</p>
    <button
      className="text-sm text-blue-500 hover:underline mt-1"
      onClick={() => {
        const newName = prompt("Yeni Ad:", user?.displayName ?? "");
        if (newName) updateProfile(user, { displayName: newName });
      }}
    >
      Değiştir
    </button>
      <button type="button" onClick={()=>{
    const auth = getAuth();
    signOut(auth)
  }}>Çıkış Yap</button>
  </div>
</div>
    
    
    
          </div>
        </TabPanel>
        <TabPanel header="Arkadaşlar">
           <div>Yakında Aktif</div>
        </TabPanel>
      </TabView>
    </div>
  );
}