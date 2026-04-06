"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "../../comporents/navbar";
import {useEffect, useState } from "react";
export default function Page() {
  const { user } = useAuth();

  // client-side mount olmadan render etmeye çalışma
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null; // veya loading skeleton
  if (!user) return <div>Lütfen giriş yapın</div>;
    return (
    <div>
      <Navbar />
      <div>Sayfa içeriği burada</div>
    </div>
    )
}