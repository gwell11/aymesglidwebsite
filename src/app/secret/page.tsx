"use client";
import { useRouter } from "next/navigation";

export default function SecretPage() {
  const router = useRouter();
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      {/* Home button in top-left corner */}
      <button
        style={{
          position: 'absolute',
          top: '2vh',
          left: '2vw',
          fontFamily: 'Papyrus, fantasy',
          fontSize: '1.2rem',
          background: 'rgba(255,255,255,0.7)',
          borderRadius: '8px',
          padding: '0.5rem 1rem',
          zIndex: 10,
          cursor: 'pointer',
        }}
        onClick={() => router.push("/")}
      >
        Home
      </button>
      <h1 className="text-5xl font-bold mb-6">🎉 Secret Area 🎉</h1>
      <p className="text-xl">You found the hidden part of the site! 🕵️‍♂️</p>
    </main>
  );
}
