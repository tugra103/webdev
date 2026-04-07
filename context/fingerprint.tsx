
"use client"
import { FingerprintProvider } from '@fingerprint/react'

export function FingerPrinter({ children }: { children: React.ReactNode }) {
  return (
    <FingerprintProvider
          apiKey="EL5ywQASbag88DLIMvWw"
          region="eu"
        >
      {children}
    </FingerprintProvider>
  );
}