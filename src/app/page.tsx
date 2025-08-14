
"use client";
import Mascot from "../components/Mascot";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen"
      style={{
        backgroundImage: 'url(/drawing.png)',
        backgroundSize: '60vmin 60vmin', // square size
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
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
      <Mascot />
      {/* Briefcase image removed */}
      <div style={{ position: 'absolute', bottom: '10vh', left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <button
          className="text-2xl font-bold tracking-wide text-gray-800 dark:text-gray-100 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 px-6 py-2 rounded transition"
          style={{ fontFamily: 'Papyrus, fantasy' }}
          onClick={() => router.push("/home")}
        >
          Enter
        </button>
      </div>
    </div>
  );
}
