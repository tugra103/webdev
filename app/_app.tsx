// pages/_app.tsx
"use client"
import { FingerprintProvider } from '@fingerprint/react'
import {AppProps} from 'next/app'

export default function MyApp({Component, pageProps}: AppProps) {
  return (
    <FingerprintProvider
      apiKey="GZPxUkuA0MLMwf37sk9s"
      region="eu"
    >
      <Component {...pageProps} />
    </FingerprintProvider>
  )
}