"use client";
import { useRouter, usePathname } from "next/navigation";
import { FaArrowLeft } from 'react-icons/fa';

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Don't show the button on the homepage
  if (pathname === '/') {
    return null;
  }

  return (
    <button
      onClick={() => router.back()}
      className="fixed top-6 left-6 z-50 flex items-center justify-center w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-gray-200 transition"
      aria-label="Go back"
    >
      <FaArrowLeft className="text-gray-800" />
    </button>
  );
}
