"use client";

export default function Error({ error }: { error: Error }) {
  return (
    <div style={{ padding: 20 }}>
      <h1>HATA YAKALANDI 💀</h1>
      <pre>{error.message}</pre>
      <pre>{error.stack}</pre>
    </div>
  );
}