"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/comporents/navbar";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase";
import { ProgressSpinner } from "primereact/progressspinner";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";

export default function Page() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [value, setValue] = useState('');
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

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />

            {/* Google-style centered layout */}
            <div className="flex flex-col items-center justify-center flex-1 gap-6 px-4">

                {/* Logo / Title */}
                <h1 className="text-5xl font-normal tracking-tight text-gray-700 select-none">
                    My<span className="text-blue-500">App</span>
                </h1>

                {/* Search bar */}
                <div className="flex items-center w-full max-w-xl border border-gray-300 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-shadow duration-200 focus-within:shadow-md focus-within:border-transparent focus-within:ring-2 focus-within:ring-blue-400">
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && console.log('search:', value)}
                        placeholder="Birşeyler Yaz..."
                        className="flex-1 outline-none text-sm text-gray-700 bg-transparent placeholder-gray-400"
                    />
                    {value && (
                        <button
                            onClick={() => setValue('')}
                            className="text-gray-400 hover:text-gray-600 mr-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                    <button
                        onClick={() => setValue('')}
                        className="text-gray-400 hover:text-gray-600 mr-2"
                    >
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                        </svg>
                    </button>
                </div>
                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={() => console.log('search:', value)}
                        className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 hover:shadow-sm rounded-md border border-transparent transition-all duration-150 cursor-pointer"
                    >
                        Ara
                    </button>
                    <button
                        onClick={() => setValue('')}
                        className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 hover:shadow-sm rounded-md border border-transparent transition-all duration-150 cursor-pointer"
                    >
                        Temizle
                    </button>
                </div>
            </div>
        </div>
    );
}