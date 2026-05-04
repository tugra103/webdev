"use client";
import { z } from "zod";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, app } from "@/app/firebase";

const schema = z.object({
  password: z.string().min(1, "Şifre zorunlu."),
});

export default function VerifyPassword() {
  const { data: session } = useSession();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ password?: string; submit?: string }>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = schema.safeParse({ password });
    if (!result.success) {
      setErrors({ password: result.error.error[0].message });
      return;
    }

    setLoading(true);
    try {
      const q = query(
        collection(db, "users"),
        where("mastodonId", "==", session?.user.id)
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        setErrors({ submit: "Kullanıcı bulunamadı." });
        return;
      }

      const email = snap.docs[0].data().email;
      const auth = getAuth(app);
      await signInWithEmailAndPassword(auth, email, password);

      router.replace("/main");
    } catch (e: any) {
      setErrors({ submit: "Şifre yanlış." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-purple-50/30 p-4">
      <Card className="w-full max-w-md" title="Kimliğini Doğrula">
        <form onSubmit={handleSubmit} className="space-y-4">

          <p className="text-sm text-gray-500">
            @{session?.user.name} olarak devam ediyorsun
          </p>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Şifre
            </label>
            <InputText
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              required
              placeholder="Şifreni gir"
              className={`w-full p-2 rounded border ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {errors.submit && (
            <p className="text-center text-sm text-red-500">{errors.submit}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Kontrol ediliyor..." : "Giriş Yap"}
          </Button>

        </form>
      </Card>
    </div>
  );
}