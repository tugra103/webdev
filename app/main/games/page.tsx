"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/comporents/navbar";
import { useState } from "react";

import { ProgressSpinner } from 'primereact/progressspinner';
        
export default function Page() {
  const { user, loading } = useAuth();
  const router= useRouter()

  if (loading) return <ProgressSpinner /> // veya <Spinner />  ← BU OLMAZSA refresh'te user=null görür ve redirect eder

  if (!user) router.push("/webdev/login/sign-in");
    return (
    <div className="theme1">
      <Navbar />
      <div>Sayfa içeriği burada</div>
    </div>
    );
}