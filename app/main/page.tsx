"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "./navbar";

export default function Page() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div>
      <Navbar />
      <div>Sayfa içeriği burada</div>
    </div>
  );
}