"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "../../comporents/navbar";

export default function Page() {
  const { user } = useAuth();
    return (
    <div>
      <Navbar />
      <div>Sayfa içeriği burada</div>
    </div>
    )
}