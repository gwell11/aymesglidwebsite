"use client";
import PCBTraces from "../../components/PCBTraces";

export default function AboutPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center relative">
      <PCBTraces />
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-10 max-w-3xl relative z-10">
        <h1 className="text-4xl font-extrabold mb-6 text-teal-800">About Me</h1>
        <div className="text-left space-y-4">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Current Position</h2>
            <p className="text-lg font-semibold text-teal-700 mb-1">
              Software Applications Engineer | Schneider Electric
            </p>
            <p className="text-sm text-gray-600 mb-3">
              Lyndhurst, NJ / NYC | September 2024 – Present
            </p>
          </div>
          
          <div className="space-y-3 text-gray-700">
            <p>
              • Develop, program, and debug control sequences for building automation systems using scripting languages on microcontroller-based controllers across three high-profile commercial sites in the New York City area.
            </p>
            <p>
              • Configure and set up BMS controllers and ensure they communicate effectively with field hardware for accurate system control.
            </p>
            <p>
              • Manage IP addressing, BACnet/MSTP network configuration, and device communications to ensure system reliability.
            </p>
            <p>
              • Troubleshoot hardware, firmware, and network issues using embedded system debugging techniques and diagnostic tools.
            </p>
            <p>
              • Deploy software and firmware updates and sequence enhancements in collaboration with engineering and field teams, improving efficiency and reducing downtime.
            </p>
            <p>
              • Work with third-party contractors during commissioning to verify system functionality and durability, quickly identifying and resolving programming issues as they arise.
            </p>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-lg text-gray-800 leading-relaxed">
          I&apos;m a Software Applications Engineer with a background in Electrical Engineering and embedded systems. I design and program hardware–software solutions, from building automation controls to custom electronics. My focus is on embedded development, PCB design, and creating interesting, useful and creative designs.
        </p>
          </div>
        </div>
      </div>
    </main>
  );
}
