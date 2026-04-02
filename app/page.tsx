// pages/index.tsx
"use client";
import { FingerprintProvider } from '@fingerprint/react'
import {AppProps} from 'next/app'

import {useVisitorData} from '@fingerprint/react'

export default function Home() {
  const {isLoading, error, data, getData} = useVisitorData(
    {immediate: true}
  )

  return (
    <FingerprintProvider
      apiKey="GZPxUkuA0MLMwf37sk9s"
      region="eu"
    >
          <div>
      <button onClick={() => getData()}>
        Reload data
      </button>
      <p>VisitorId: {isLoading ? 'Loading...' : data?.visitor_id}</p>
      <p>Full visitor data:</p>
      <pre>{error ? error.message : JSON.stringify(data, null, 2)}</pre>
    </div>
    </FingerprintProvider>
  )
}