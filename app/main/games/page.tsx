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
    const itemRenderer = (item: any) => (
      <a className="flex align-items-center p-menuitem-link" style={{ gap: "10px" }} href={item.url ?? ""}>
        <span className={item.icon} />
        <span style={{ fontFamily: "Syne, sans-serif" }}>{item.label}</span>
        {item.badge && <Badge value={item.badge} />}
        {item.shortcut && <span className="shortcut-pill">{item.shortcut}</span>}
      </a>
    );
  
    return (
    <div className="theme1">
      <Navbar />
      <div>

      </div>
    </div>
    );
}