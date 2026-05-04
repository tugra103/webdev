// app/auth/callback/page.tsx
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase";

export default function AuthCallback() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading" || !session) return;

    async function check() {
      const q = query(
        collection(db, "users"),
        where("mastodonId", "==", session!.user.id)
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        router.replace("/complete-profile");
      } else {
        router.replace("/auth/verify-password");
      }
    }

    check();
  }, [session, status]);

  return <p>Yükleniyor...</p>;
}