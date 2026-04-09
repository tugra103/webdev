// pages/index.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // your auth hook
import { ProgressSpinner } from "primereact/progressspinner";
export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth(); // however you get the user

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login/sign-in");
    } else {
      router.push("/main");
    }
  }, [user, isLoading, router]);

  // Render a fallback while redirecting
  return (<div className="flex h-screen items-center justify-center">
            <ProgressSpinner />
          </div>);
}