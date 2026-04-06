"use client";

import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "../../../comporents/navbar";
import { Card} from 'primereact/card'
import { Avatar } from "primereact/avatar";

import {useState } from "react";
export default function Page() {
  const { user, loading } = useAuth();
  const router= useRouter()

  if (loading) return null; // veya <Spinner />  ← BU OLMAZSA refresh'te user=null görür ve redirect eder

  if (!user) router.redirect("/login");
    return (
    <div>
        <Navbar />
        <Card className="round-md h-full w-full place-content-center">
            <Avatar
                image={user?.photoURL ?? "https://primefaces.org/cdn/primereact/images/avatar/default.png"}
                shape="circle"
            />
            <div>
                {user?.displayName}
            </div>
        </Card>      
    </div>
    );
}