// page.tsx
import { Suspense } from "react";
import ChatPage from "./ChatPage"; // mevcut kodun taşınacağı dosya

export default function Page() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"></div>}>
            <ChatPage />
        </Suspense>
    );
}