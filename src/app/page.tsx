
"use client";
import Mascot from "../components/Mascot";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PCBTraces from "../components/PCBTraces";


export default function Home() {
  const router = useRouter();
  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-gray-900 relative">
      <PCBTraces />
      {/* Main Content */}
      <section className="flex flex-col items-center justify-center text-center px-4 mt-20 relative z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-10 max-w-3xl">
          <h1 className="text-5xl font-extrabold mb-2 text-teal-800">Aymes Glidewell</h1>
          <h2 className="text-2xl font-medium mb-6 text-gray-700">Software Application Engineer</h2>
          <p className="text-lg text-gray-800 mb-8">
            I'm a Software Applications Engineer with a background in Electrical Engineering and embedded systems. I design and program hardware–software solutions, from building automation controls to custom electronics. My focus is on software and embedded development, PCB design, and creating interesting, user friendly products.
          </p>
          <button
            className="bg-teal-600 text-white px-8 py-3 rounded-lg shadow-lg hover:bg-green-600 transition text-xl font-semibold"
            onClick={() => router.push('/projects')}
          >
            View Portfolio
          </button>
        </div>
      </section>
    </main>
  );
}
