// app/auth/callback/page.tsx
"use client";
import {useState} from "react"
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase";

export default function AuthCallback() {
  const { data: session, status } = useSession();
  const { msg, setMsg}= useState("")
  const router = useRouter();

  useEffect(() => {
    if (status === "loading" || !session) return;

    async function check() {
      setMsg("Kullanıcı Aranıyor")
      const q = query(
        collection(db, "users"),
        where("mastodonId", "==", session!.user.id)
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        setMsg("Kullanıcı Bulunamadı, profil oluşturuluyor")
        router.replace("/complete-profile");
      } else {
        setMsg("Kullanıcı Bulundu")
        router.replace("/auth/verify-password");
      }
    }

    check();
  }, [session, status]);

  return <p>{msg}</p>;
}