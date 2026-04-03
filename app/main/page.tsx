"use client"
import { useAuth } from '@/context/AuthContext';
import Navbar from "./navbar"
import { useRouter } from 'next/navigation';

export default function Page() {
  const { user } = useAuth();
  const navigate = useRouter()
  return (
    <div>
    {user ? (
      <>
        <Navbar />
        <div>Sayfa içeriği burada</div>
      </>
  ) : (
    navigate.push("/login/sign-in")
  )}
  </div>);
}