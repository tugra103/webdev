"use client";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "../../comporents/navbar";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase";
import { ProgressSpinner } from "primereact/progressspinner";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";

export default function Page() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [friends, setFriends] = useState<Record<string, string>>({});
  const [friendReqs, setFriendReqs] = useState<Record<string, string>>({});
  const [photoURL, setPhotoURL] = useState("");
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login/sign-in");
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setFriends(data.friends ?? {});
        setFriendReqs(data.friendreqs ?? {});
        setPhotoURL(data.photoURL ?? "");
      }
      setDataLoading(false);
    });
  }, [user]);

  if (loading || dataLoading) return (
    <div className="flex h-screen items-center justify-center">
      <ProgressSpinner />
    </div>
  );
  if (!user) return null;

  const initials = (user.displayName ?? "?")
    .split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const friendList = Object.entries(friends);
  const onlineCount = Math.floor(friendList.length * 0.4); // gerçek online için ayrı field lazım

  const now = new Date();
  const dateStr = now.toLocaleDateString("tr-TR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">
              Merhaba, {user.displayName ?? "Kullanıcı"} 👋
            </h1>
            <p className="text-sm text-gray-400 mt-1 capitalize">{dateStr}</p>
          </div>
          <img
            src={photoURL || "https://primefaces.org/cdn/primereact/images/avatar/default.png"}
            className="w-11 h-11 rounded-full object-cover border-2 border-white shadow"
          />
        </div>

        {/* Stat kartları */}
        <div className="grid grid-cols-3 gap-3 mb-5">
{[
  { label: "Profil", sub: "Düzenle", icon: "👤", href: "/webdev/main/account", bg: "bg-blue-50" },
  { label: "Arkadaş", sub: "Ekle", icon: "➕", href: "/webdev/main/account", bg: "bg-green-50" },
  { label: "İstekler", sub: `${Object.keys(friendReqs).length} bekliyor`, icon: "🔔", href: "/webdev/main/account", bg: "bg-amber-50" },
  { label: "Mesaj", sub: "Yakında", icon: "💬", href: "#", bg: "bg-purple-50" },
].map((a) => {
  return (
    //commit olsun diye var bu comment
    <a
      key={a.label}
      href={a.href}
      className="flex flex-col items-start gap-1 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors bg-white"
    >
      <div className={`w-8 h-8 rounded-lg ${a.bg} flex items-center justify-center text-base`}>
        {a.icon}
      </div>
      <p className="text-xs font-medium mt-1">{a.label}</p>
      <p className="text-xs text-gray-400">{a.sub}</p>
    </a>
  );
})}
        </div>

        <div className="grid grid-cols-5 gap-4 mb-5">

          {/* Arkadaş listesi */}
          <div className="col-span-3 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500 mb-4">Arkadaşlar</p>
            {friendList.length === 0 ? (
              <p className="text-sm text-gray-300 py-4 text-center">Henüz arkadaşın yok.</p>
            ) : (
              <div className="flex flex-col gap-1">
                {friendList.slice(0, 5).map(([uid, name]) => (
                  <div key={uid} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-xs font-medium text-blue-800 flex-shrink-0">
                      {String(name).charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm">{String(name)}</span>
                    <div className="ml-auto w-2 h-2 rounded-full bg-gray-200" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hızlı işlemler */}
          <div className="col-span-2 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500 mb-4">Hızlı işlemler</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Profil", sub: "Düzenle", icon: "👤", href: "/webdev/main/account", bg: "bg-blue-50" },
                { label: "Arkadaş", sub: "Ekle", icon: "➕", href: "/webdev/main/account", bg: "bg-green-50" },
                { label: "İstekler", sub: `${Object.keys(friendReqs).length} bekliyor`, icon: "🔔", href: "/webdev/main/account", bg: "bg-amber-50" },
                { label: "Mesaj", sub: "Yakında", icon: "💬", href: "#", bg: "bg-purple-50" },
              ].map((a) => (
                <a
                  key={a.label}
                  href={a.href}
                  className="flex flex-col items-start gap-1 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg ${a.bg} flex items-center justify-center text-base`}>
                    {a.icon}
                  </div>
                  <p className="text-xs font-medium mt-1">{a.label}</p>
                  <p className="text-xs text-gray-400">{a.sub}</p>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Arkadaşlık istekleri */}
        {Object.keys(friendReqs).length > 0 && (
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500 mb-4">Gelen arkadaşlık istekleri</p>
            <div className="flex flex-col gap-2">
              {Object.entries(friendReqs).map(([uid, name]) => (
                <div key={uid} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-xs font-medium text-amber-800">
                    {String(name).charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm">{String(name)}</span>
                  <a
                    href="/webdev/main/accound"
                    className="ml-auto text-xs bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Yanıtla
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}