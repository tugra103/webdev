"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/comporents/navbar";
import { useState } from "react";
import {Menu} from "primereact/menu"
import { ProgressSpinner } from 'primereact/progressspinner';
        
export default function Page() {
  const { user, loading } = useAuth();
  const router= useRouter()

  if (loading) return <ProgressSpinner /> // veya <Spinner />  ← BU OLMAZSA refresh'te user=null görür ve redirect eder
  /* 
  
      <a className="flex align-items-center p-menuitem-link" style={{ gap: "10px" }} href={item.url ?? ""}>
        <span className={item.icon} />
        <span style={{ fontFamily: "Syne, sans-serif" }}>{item.label}</span>
        {item.badge && <Badge value={item.badge} />}
        {item.shortcut && <span className="shortcut-pill">{item.shortcut}</span>}
      </a>  
  
  */ 
  if (!user) router.push("/webdev/login/sign-in");
const items = [
  {
    name: "Ürün 1",
    url: "/urun-1",
    imgurl: "https://example.com/img1.jpg"
  },
  {
    name: "Ürün 2",
    url: "/urun-2",
    imgurl: "https://example.com/img2.jpg"
  }
];

const itemRenderer = (item: any) => (
  <a
    href={item.url ?? ""}
    className="flex flex-col p-menuitem-link border border-gray-200 rounded-lg overflow-hidden p-2 gap-2 no-underline w-full"
  >
    <div className="self-start">
      <span>{item.name}</span>
    </div>
    <img
      src={item.imgurl}
      className="w-full object-cover rounded-md block"
    />
  </a>
);
// items array'ine template ekle
const menuItems = items.map(item => ({
  ...item,
  template: () => itemRenderer(item)
}));

// Component içinde kullan

    return (
    <div className="theme1">
      <Navbar />
      <div className="w-full h-full">
        <div className="w-full flex flex-col gap-2 overflow-y-auto">
          {items.map((item) => itemRenderer(item))}
        </div>
      </div>
    </div>
    );
}