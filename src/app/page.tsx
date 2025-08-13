
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
  <Mascot />
  {/* Briefcase image removed */}
      <button
        className="mt-6 text-2xl font-bold tracking-wide text-gray-800 dark:text-gray-100 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 px-6 py-2 rounded transition"
        onClick={() => router.push("/home")}
      >
        Enter
      </button>
    </div>
  );
}
