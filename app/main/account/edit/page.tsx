"use client";
import { useAuth } from "@/context/AuthContext";
import { updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";
import Navbar from "@/comporents/navbar";
import { Card } from "primereact/card";
import { Avatar } from "primereact/avatar";

// ✅ PrimeReact CSS — bunlar yoksa card gözükmez
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";

export default function Page() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [photoURL, setPhotoURL] = useState(user?.photoURL ?? "");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      // ✅ Storage'a yükle
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);

      // ✅ URL al
      const url = await getDownloadURL(storageRef);

      // ✅ Firebase Auth profilini güncelle
      await updateProfile(user, { photoURL: url });

      setPhotoURL(url);
    } catch (err) {
      console.error("Yükleme hatası:", err);
    } finally {
      setUploading(false);
    }
  };
  const { user, loading } = useAuth();
  const router = useRouter();

  // ✅ render sırasında değil, effect içinde
  useEffect(() => {
    if (!loading && !user) {
      router.push("/webdev/login/sign-in");
    }
  }, [user, loading]);

  if (loading) return null;
  if (!user) return null; // ✅ redirect olana kadar boş göster

  return (
    <div>
      <Navbar />
      <Card className="rounded-md w-full h-screen place-content-center">
        <div>
            <Avatar
                image={user?.photoURL ?? "https://primefaces.org/cdn/primereact/images/avatar/default.png"}
                shape="circle"
                size="xlarge"
            />
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />
            <div onclick={() => fileInputRef.current?.click()}>
                Fotografı Değiştir
            </div>
        </div>
        <div>
            <div>{user?.displayName}</div>
            <div onclick={
                updateProfile(auth.currentUser, {
                    displayName: prompt("Yeni İsim:")
                })
            }>
                İsmini değiştir
            </div>
        </div>
      </Card>
    </div>
  );
}