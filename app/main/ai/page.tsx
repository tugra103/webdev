"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/comporents/navbar";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase";


import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
        
import { ProgressSpinner } from "primereact/progressspinner";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";

export default function Page() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [photoURL, setPhotoURL] = useState("");
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login/sign-in");
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setPhotoURL(data.photoURL ?? "");
      }
      setDataLoading(false);
    });
  }, [user]);

  if (loading || dataLoading) return (
    <div className="flex h-screen items-center justify-center">
      <ProgressSpinner />
    </div>
  );
  if (!user) return null;
  const [value, setValue] = useState('');

  return (
    <div>
        <Navbar/>
        <div className="card flex justify-content-center">
            <InputText className="rounded-full" value={value} onChange={(e) => setValue(e.target.value)} />
            <Button icon="pi pi-check" rounded text aria-label="Filter" />
        </div>
    </div>
    )
  
}