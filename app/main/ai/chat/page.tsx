"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Navbar from "@/comporents/navbar";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase";
import { ProgressSpinner } from "primereact/progressspinner";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import Message from "@/comporents/message";

import { ReactElement } from "react";

interface Chat {
    username: string;
    content: ReactElement;
    img: string;
}

export default function Page() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [value, setValue] = useState<string>('');
    const [photoURL, setPhotoURL] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [dataLoading, setDataLoading] = useState<boolean>(true);
    const [chats, setChats] = useState<Chat[]>([]);
    const chatsRef = useRef<HTMLUListElement>(null);

    const scrollToBot = (): void => {
        if (chatsRef.current) {
            chatsRef.current.scrollTop = chatsRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBot();
    }, [chats]);

    const submitMessage = (e?: React.MouseEvent | React.KeyboardEvent): void => {
        e?.preventDefault();
        if (!value.trim()) return;

        setChats((prev) => [
            ...prev,
            {
                username: username,
                content: <p>{value}</p>,
                img: photoURL,
            },
        ]);

        setValue("");
    };

    useEffect(() => {
        if (!loading && !user) router.push("/login/sign-in");
    }, [user, loading]);

    useEffect(() => {
        if (!user) return;
        getDoc(doc(db, "users", user.uid)).then((snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setPhotoURL(data.photoURL ?? "");
                setUsername(data?.displayName ?? "");
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
        <div>
            <Navbar />
            <ul className="chats" ref={chatsRef}>
                {chats.map((chat: Chat, index: number) => (
                    <Message key={index} chat={chat} user={username} />
                ))}
            </ul>
            <div className="flex items-center w-full max-w-xl border border-gray-300 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-shadow duration-200 focus-within:shadow-md focus-within:border-transparent focus-within:ring-2 focus-within:ring-blue-400">
                <input
                    type="text"
                    value={value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && submitMessage(e)}
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
                    onClick={submitMessage}
                    className="text-gray-400 hover:text-gray-600 mr-2"
                >
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                </button>
            </div>
        </div>
    );
}