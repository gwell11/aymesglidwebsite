"use client";
import PCBTraces from "../../components/PCBTraces";

export default function AboutPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center relative">
      <PCBTraces />
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-10 max-w-3xl relative z-10">
        <h1 className="text-4xl font-extrabold mb-6 text-teal-800">About Me</h1>
        <div className="text-left space-y-4">
          <p className="text-lg text-gray-800 leading-relaxed mb-6">
            I&apos;m an Electrical Engineer and controls specialist who programs and commissions building management systems (BMS) across active commercial sites in the New York City area. My work spans DDC sequence development, BACnet/MSTP and Modbus networking, operator graphics, and field commissioning — backed by a hardware foundation in embedded systems and PCB design that lets me trace a fault from a software dashboard all the way to physical wiring.
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mb-4 pt-2 border-t border-gray-200">Experience</h2>

          <div className="mb-6">
            <p className="text-lg font-semibold text-teal-700 mb-1">
              Software Applications Engineer · Schneider Electric
            </p>
            <p className="text-sm text-gray-600 mb-3">
              Lyndhurst, NJ / NYC · September 2024 – Present
            </p>
            <div className="space-y-2 text-gray-700">
              <p>• Develop, program, and debug DDC control sequences for building management systems using scripting languages on programmable field controllers across <strong>5 active high-profile commercial sites</strong> in the NYC area.</p>
              <p>• Configure and troubleshoot operator interface graphics for BMS controllers, ensuring reliable communication with field hardware for accurate, real-time system control.</p>
              <p>• Manage networking protocols — IP addressing, Modbus integration, and BACnet/MSTP configuration — to ensure device communication and system reliability.</p>
              <p>• Troubleshoot hardware, firmware, and network issues with diagnostic tools, tracing faults from operator dashboards back to physical wiring, sensors, and panel terminations.</p>
              <p>• Deploy software/firmware updates and sequence enhancements alongside engineering and field teams, improving efficiency and reducing downtime.</p>
              <p>• <strong>Reduced site energy use by 10% on average</strong> through control sequence optimization and operational improvements.</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-lg font-semibold text-teal-700 mb-1">
              Research Assistant · Smart Infrastructure Data Analytics Lab
            </p>
            <p className="text-sm text-gray-600 mb-3">
              Orlando, FL · August 2023 – July 2024
            </p>
            <div className="space-y-2 text-gray-700">
              <p>• Designed and optimized embedded systems for smart home devices, improving energy efficiency by 20% and enhancing reliability.</p>
              <p>• Created schematics and PCB layouts in Altium Designer and Fusion 360 for power electronics circuits, meeting safety and manufacturing standards.</p>
              <p>• Validated hardware performance using oscilloscopes, function generators, and lab instrumentation to verify design specifications.</p>
              <p>• Applied power systems engineering principles (power flow, short-circuit analysis, voltage regulation) to enhance grid-connected device performance.</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-3 pt-2 border-t border-gray-200">Education</h2>
          <div>
            <p className="text-lg font-semibold text-teal-700">University of Central Florida (UCF)</p>
            <p className="text-gray-700">B.S. in Electrical Engineering · Orlando, FL · 2019 – 2024</p>
          </div>
        </div>
      </div>
    </main>
  );
}
