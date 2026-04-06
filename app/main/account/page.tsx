"use client";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";
import Navbar from "../../../comporents/navbar";
import { Card } from "primereact/card";
import { Avatar } from "primereact/avatar";

// ✅ PrimeReact CSS — bunlar yoksa card gözükmez
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";

export default function Page() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // ✅ render sırasında değil, effect içinde
  useEffect(() => {
    if (!loading && !user) {
      router.push("/webdev/login/sign-in");
    }
  }, [user, loading]);

  if (loading) return null;
  if (!user) return null; // ✅ redirect olana kadar boş göster

  return (
    <div>
      <Navbar />
      <Card className="rounded-md w-full h-full place-content-center">
        <Avatar
          image={user?.photoURL ?? "https://primefaces.org/cdn/primereact/images/avatar/default.png"}
          shape="circle"
        />
        <div>{user?.displayName}</div>
      </Card>
    </div>
  );
}