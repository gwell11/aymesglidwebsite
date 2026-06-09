
"use client";
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
          <h2 className="text-2xl font-medium mb-4 text-gray-700">Systems Applications Engineer</h2>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {["BMS / DDC Controls", "BACnet/MSTP", "Modbus", "Embedded Systems", "PCB Design"].map((tag) => (
              <span key={tag} className="text-sm font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-full px-3 py-1">
                {tag}
              </span>
            ))}
          </div>
          <p className="text-lg text-gray-800 mb-8">
            Electrical Engineer and controls specialist experienced in programming and commissioning building management systems (BMS) across active commercial sites. Skilled in DDC sequence development, BACnet/MSTP and Modbus networking, operator graphics, and field commissioning — with a hardware foundation in embedded systems and the ability to trace faults from software dashboards to physical wiring.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              className="bg-teal-600 text-white px-8 py-3 rounded-lg shadow-lg hover:bg-green-600 transition text-xl font-semibold"
              onClick={() => router.push('/projects')}
            >
              View Portfolio
            </button>
            <a
              href="/Aymes-Glidewell-Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-teal-700 border-2 border-teal-600 px-8 py-3 rounded-lg shadow-lg hover:bg-teal-50 transition text-xl font-semibold"
            >
              Download Resume
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
