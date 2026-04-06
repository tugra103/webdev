"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "../../comporents/navbar";
import { useState } from "react";
export default function Page() {
  // Herhangi bir protected route / middleware
  const { user, loading } = useAuth();
  const router= useRouter()

  if (loading) return null; // veya <Spinner />  ← BU OLMAZSA refresh'te user=null görür ve redirect eder

  if (!user) router.redirect("/login");

    return (
    <div>
      <Navbar />
      <div>Sayfa içeriği burada</div>
    </div>
    )
}