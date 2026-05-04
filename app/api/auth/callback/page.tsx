// app/auth/callback/page.tsx
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthCallback() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) return;

    if (session.user.isNewUser) {
      router.replace("/complete-profile");
    } else {
      router.replace("/main");
    }
  }, [session, status]);

  return <p>Yükleniyor...</p>;
}