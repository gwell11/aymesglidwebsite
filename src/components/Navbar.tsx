"use client";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  return (
    <nav className="w-full flex justify-end items-center py-6 px-8 absolute top-0 left-0 z-50">
      <ul className="flex gap-8 text-lg font-semibold text-gray-800 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2">
        <li><button onClick={() => router.push('/projects')} className="hover:text-green-600 transition">Portfolio</button></li>
        <li><button onClick={() => router.push('/about')} className="hover:text-green-600 transition">About</button></li>
        <li><button onClick={() => router.push('/contact')} className="hover:text-green-600 transition">Contact</button></li>
        <li><a href="https://www.linkedin.com/in/aymes-glidewell" target="_blank" rel="noopener noreferrer" className="hover:text-green-600 transition">LinkedIn</a></li>
      </ul>
    </nav>
  );
}
