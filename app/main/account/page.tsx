"use client";

import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "../../../comporents/navbar";
import { Card} from 'primereact/card'
import { Avatar } from "primereact/avatar";

export default function Page() {
  const { user } = useAuth();
  const router = useRouter()
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