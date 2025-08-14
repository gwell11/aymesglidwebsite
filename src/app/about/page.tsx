"use client";
import { useRouter } from "next/navigation";

export default function AboutPage() {
  const router = useRouter();
  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen bg-white"
    >
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
      <span style={{ fontFamily: 'cursive', fontSize: '2.5rem', color: '#222' }}>
        Nash is gay and its okay
      </span>
    </main>
  );
}
