"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Navbar from "@/comporents/navbar";
import { Card } from "primereact/card";
import { Avatar } from "primereact/avatar";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";

export default function Page() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [photoURL, setPhotoURL] = useState("");
  
  // ✅ Sayfa açılınca Firestore'dan fotoğrafı çek
  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      if (snap.exists()) setPhotoURL(snap.data().photoURL ?? "");
    });
  }, [user]);

  useEffect(() => {
    if (!loading && !user) router.push("/webdev/login/sign-in");
  }, [user, loading]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      await setDoc(doc(db, "users", user.uid), { photoURL: base64 }, { merge: true });
      setPhotoURL(base64);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  if (loading || !user) return null;

  return (
    <div>
      <Navbar />
      <div className="rounded-md w-full h-full place-content-center theme1">

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

        <div>{user?.displayName}</div>
      </div>
    </div>
  );
}