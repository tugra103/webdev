"use client"
import { z } from 'zod';
import { InputText } from 'primereact/inputtext';
import { useState } from 'react'
import { useRouter } from 'next/navigation';
import { Card} from 'primereact/card' 
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Button } from 'primereact/button';
import { setPersistence, browserLocalPersistence } from "firebase/auth";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDDDedXVLAJjLDdG_JWssnQKoN8Ks5R404",
  authDomain: "drr0-f7899.firebaseapp.com",
  projectId: "drr0-f7899",
  storageBucket: "drr0-f7899.firebasestorage.app",
  messagingSenderId: "338401368594",
  appId: "1:338401368594:web:56c7dd050cb52d6008d6cb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    submit?: string
  }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useRouter()

  const handleSubmit = async (data: typeof formData) => {
    try {
      setIsSubmitting(true)
      setErrors({})

      // Validate the form data
      const validatedData = signInSchema.parse(data)

      // Attempt sign in
          signInWithEmailAndPassword(auth, validatedData.email, validatedData.password)
            .then((userCredential) => {
              navigate.push('/main')
            })
            .catch((error) => {
              setErrors({ submit: error.message })
            })

    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-purple-50/30 p-4">
      <Card className="w-full max-w-md"
            title="Sign In">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit(formData)
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
<InputText
  id="email"
  name="email"
  type="email"
  value={formData.email}
  onChange={handleChange}
  required
  placeholder="Enter your email"
  className={`w-full p-2 rounded border ${
    errors.email ? 'border-red-500' : 'border-gray-300'
  }`}
/>
{errors.email && (
  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
)}
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <InputText
  id="password"
  name="password"
  type="password"
  value={formData.password}
  onChange={handleChange}
  required
  placeholder="Enter your email"
  className={`w-full p-2 rounded border ${
    errors.password ? 'border-red-500' : 'border-gray-300'
  }`}
/>
{errors.password && (
  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
)}
            </div>
            {errors.submit && <p className="text-center text-sm text-red-500">{errors.submit}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
      </Card>
    </div>
  )
}