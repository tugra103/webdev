"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase";

export default function AuthCallback() {
  const { data: session, status } = useSession();
  const [msg, setMsg] = useState("Yükleniyor...");
  const router = useRouter();

  useEffect(() => {
    // Race condition önleme: component unmount olursa yönlendirme yapma
    let cancelled = false;

    if (status === "loading") {
      setMsg("Oturum kontrol ediliyor...");
      return;
    }

    // session veya user.id yoksa erken çık
    if (!session?.user?.id) {
      setMsg("Oturum bulunamadı.");
      return;
    }

    async function check() {
      setMsg("Kullanıcı aranıyor...");

      try {
        const q = query(
          collection(db, "users"),
          where("mastodonId", "==", session!.user.id)
        );
        const snap = await getDocs(q);

        if (cancelled) return; // Unmount sonrası state güncelleme

        if (snap.empty) {
          setMsg("Profil oluşturuluyor...");
          router.replace("/complete-profile");
        } else {
          setMsg("Yönlendiriliyor...");
          router.replace("/auth/verify-password");
        }
      } catch (err) {
        if (!cancelled) setMsg("Bir hata oluştu. Lütfen tekrar deneyin.");
        console.error(err);
      }
    }

    check();

    // Cleanup: component unmount olduğunda çalışmayı durdur
    return () => {
      cancelled = true;
    };
  }, [session, status, router]); // router dependency eklendi

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600 animate-pulse">{msg}</p>
    </div>
  );
}