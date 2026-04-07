
"use client"
import { FingerprintProvider } from '@fingerprint/react'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <FingerprintProvider
          apiKey="GZPxUkuA0MLMwf37sk9s"
          region="eu"
        >
      {children}
    </FingerprintProvider>
  );
}