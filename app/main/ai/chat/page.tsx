"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, ReactElement } from "react";
import Navbar from "@/comporents/navbar";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase";
import { ProgressSpinner } from "primereact/progressspinner";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import Message from "@/comporents/message";
import { OpenRouter } from '@openrouter/sdk';
const REACT_INTERNAL_OBJECT_DONT_TOUCH_OR_YOU_WILL_BE_FIRED = "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"


const client = new OpenRouter({
    apiKey: REACT_INTERNAL_OBJECT_DONT_TOUCH_OR_YOU_WILL_BE_FIRED
});

interface Chat {
    role: string;
    content: string;
}

export default function Page() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [value, setValue] = useState<string>('');
    const [photoURL, setPhotoURL] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [dataLoading, setDataLoading] = useState<boolean>(true);
    const [chats, setChats] = useState<Chat[]>([{ content: "Sen bir yapayzekasın. Adın donut.exe" , role: "system" }]);
    const chatsRef = useRef<HTMLUListElement>(null);

    const scrollToBot = (): void => {
        if (chatsRef.current) {
            chatsRef.current.scrollTop = chatsRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBot();
    }, [chats]);

    const submitMessage = async (e?: React.MouseEvent | React.KeyboardEvent): Promise<void> => {
        e?.preventDefault();
        if (!value.trim()) return;

        setChats((prev) => [
            ...prev,
            {
                role: "user",
                content: {value},
            },
        ]);


        setValue("");
        let rep = await client.chat.send({chatRequest:{
            model: "openai/gpt-oss-120b:free",
            messages: chats,
            temperature: 0.7, // ← Type-checked
            stream: false     // ← Response type changes based on this
        }} );
        setChats((prev) => [
            ...prev,
            {
                role: "assistant",
                content: <p>{rep.choices?.[0]?.message?.content}</p>,
            },
        ]);


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
        <div className="flex h-screen items-center justify-center bg-white">
            <ProgressSpinner />
        </div>
    );

    if (!user) return null;

    return (
        <div className="flex flex-col h-screen bg-white text-black">
            <Navbar />

            {/* Chat area */}
            <ul
                ref={chatsRef}
                className="flex-1 overflow-y-auto px-4 py-6 space-y-1 scroll-smooth
                    [&::-webkit-scrollbar]:w-1.5
                    [&::-webkit-scrollbar-track]:bg-transparent
                    [&::-webkit-scrollbar-thumb]:bg-black/10
                    [&::-webkit-scrollbar-thumb]:rounded-full"
            >
                {chats.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40 select-none">
                        <svg className="w-12 h-12 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-black/60 text-sm font-medium">Henüz mesaj yok</p>
                    </div>
                )}

                {chats.map((chat: Chat, index: number) => (
                    <Message key={index} chat={chat} user={username} />
                ))}
            </ul>

            {/* Input bar */}
            <div className="px-4 pb-6 pt-2">
                <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3 shadow-sm
                    focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-200
                    transition-all duration-200">

                    {/* Avatar */}
                    {photoURL && (
                        <img
                            src={photoURL}
                            alt={username}
                            className="w-7 h-7 rounded-full object-cover flex-shrink-0 opacity-100"
                        />
                    )}

                    <input
                        type="text"
                        value={value}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
                        onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && submitMessage(e)}
                        placeholder="Bir şeyler yaz..."
                        className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 caret-blue-500"
                    />

                    {/* Clear button */}
                    {value && (
                        <button
                            onClick={() => setValue('')}
                            className="p-1 rounded-full text-gray-400 hover:text-black hover:bg-gray-200 transition-all duration-150"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}

                    {/* Send button */}
                    <button
                        onClick={submitMessage}
                        disabled={!value.trim()}
                        className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200
                            ${value.trim()
                                ? "bg-blue-500 hover:bg-blue-600 shadow text-white"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        <svg className="w-4 h-4 translate-x-px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>

                </div>
            </div>
        </div>
    );
}