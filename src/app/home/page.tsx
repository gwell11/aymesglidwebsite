
"use client";
import Link from "next/link";
import Mascot from "../../components/Mascot";
import { useRouter } from "next/navigation";

export default function HomeInner() {
  const router = useRouter();
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
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
      <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">Aymes Glidewell</h1>
      <nav className="flex flex-wrap gap-6 text-lg font-medium relative">
        <Link href="/about" className="hover:text-green-600 hover:underline">About</Link>
  <Link href="/projects" className="hover:text-green-600 hover:underline">Projects</Link>
  <Link href="/projects/synths" className="hover:text-green-600 hover:underline">Synths</Link>
      </nav>
    </main>
  );
}
