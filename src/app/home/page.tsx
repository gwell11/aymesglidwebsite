
"use client";
import Link from "next/link";
import Mascot from "../../components/Mascot";
import { useRouter } from "next/navigation";

export default function HomeInner() {
  const router = useRouter();
  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen"
      style={{
        backgroundImage: 'url(/drawingcouple.png)',
        backgroundSize: '60vmin 60vmin',
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
      <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">Aymes Glidewell</h1>
      <nav className="flex flex-wrap gap-6 text-lg font-medium relative">
        <Link href="/about" className="hover:underline">About</Link>
        <div className="group relative">
          <Link href="/projects" className="hover:underline">Projects</Link>
          <div className="hidden group-hover:flex flex-col absolute left-0 mt-2 bg-white border rounded shadow-lg z-20 min-w-[180px]">
            <Link href="/projects/synths" className="px-4 py-2 hover:bg-gray-100 border-b">Synths</Link>
            <div className="flex flex-col pl-4">
              <Link href="/projects/synths/chords-lead" className="px-4 py-2 hover:bg-gray-100">Chords/Lead</Link>
              <Link href="/projects/synths/drums" className="px-4 py-2 hover:bg-gray-100">Drums</Link>
              <Link href="/projects/synths/bass" className="px-4 py-2 hover:bg-gray-100">Bass</Link>
            </div>
          </div>
        </div>
      </nav>
    </main>
  );
}
