'use client';

import Link from 'next/link';
import PCBTraces from '../../components/PCBTraces';
import SimpleAudioProcessor from '../../components/SimpleAudioProcessor';

export default function ProjectsPage() {
  return (
    <main className="flex flex-col items-center min-h-screen p-8 relative">
      <PCBTraces />
      <h1 className="text-4xl font-extrabold mb-4 text-indigo-900 relative z-10">Portfolio</h1>
      <section className="max-w-3xl w-full bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 mb-8 relative z-10">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Resume</h2>
        <a href="/Aymes-Glidewell-Resume.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-green-600 underline transition">Download Resume (PDF)</a>
      </section>

      <section className="max-w-3xl w-full bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 mb-8 relative z-10">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Skills</h2>
        <ul className="list-disc ml-6 text-gray-700 space-y-1">
          <li><strong>Programming:</strong> C/C++, Python, JavaScript, MATLAB</li>
          <li><strong>BMS & Controls Software:</strong> EcoStruxure, Automated Logic Control, Continuum, DDC sequence development, operator graphics</li>
          <li><strong>Networking & Systems:</strong> BACnet/MSTP, Modbus, TCP/IP, DHCP, IP addressing, RTOS</li>
          <li><strong>Mechanical & Cooling:</strong> Chillers, CRAC/CRAH units, AHUs, VAV boxes, RTUs, VFDs, pumps, valves, dampers &amp; actuators</li>
          <li><strong>Electrical &amp; Metering:</strong> UPS &amp; power monitoring (EPMS), BTU/flow/power meters</li>
          <li><strong>Hardware:</strong> PCB design, ARM Cortex-M microcontrollers, sensors &amp; actuators, UART/SPI/I2C</li>
          <li><strong>Tools:</strong> Altium Designer, Fusion 360, oscilloscope, function generator, multimeter, Git</li>
        </ul>
      </section>

      <section className="max-w-3xl w-full bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 mb-8 relative z-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Featured Projects</h2>

        <ul className="space-y-6">
          <li>
            <h3 className="text-lg font-semibold text-indigo-700">Demand-Side Response Water Heater Controller</h3>
            <p className="text-gray-600 mt-1">Built a real-time controls system on an MSP430 microcontroller that monitors grid frequency and modulates a 30A load via a solid-state relay in ~11&nbsp;ms — sensor-to-actuator control logic directly analogous to BMS field control. Designed the analog front-end and multi-board PCB architecture for point-to-point measurement of frequency, voltage, current, and temperature, achieving 1% frequency accuracy while isolating high-voltage circuitry from sensitive measurement signals.</p>
          </li>
          <li>
            <a href="/Grid-Stabilizing-Frequency-Detector.pdf" target="_blank" rel="noopener noreferrer" className="text-indigo-700 hover:text-green-600 underline text-lg font-semibold transition">Grid-Stabilizing Frequency Detector (PDF)</a>
            <p className="text-gray-600 mt-1">An engineering report on electrical grid stability and frequency detection, demonstrating circuit design and power-system analysis.</p>
          </li>
        </ul>
      </section>

      <section className="max-w-3xl w-full bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 mb-8 relative z-10">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Creative Coding</h2>
        <p className="text-gray-600 mb-4 text-sm">Side projects exploring embedded audio, DSP, and front-end interfaces.</p>

        <div className="mb-6">
          <SimpleAudioProcessor className="w-full" />
        </div>

        <ul className="space-y-4">
          <li>
            <a href="https://github.com/gwell11/handheld-synthesizer" target="_blank" rel="noopener noreferrer" className="text-indigo-700 hover:text-green-600 underline text-lg font-semibold transition">Handheld Synthesizer</a>
            <p className="text-gray-600 mt-1">A web-based synthesizer demonstrating UI, state management, and sound design. <Link href="/projects/synths/chords-lead" className="text-blue-600 hover:text-green-600 underline transition">View web version</Link></p>
          </li>
        </ul>
      </section>

      <section className="max-w-3xl w-full bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 mb-8 relative z-10">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Awards & Certifications</h2>
        <ul className="list-disc ml-6 text-gray-700">
          <li>B.S in Electrical Engineering, UCF</li>
        </ul>
      </section>

      <section className="max-w-3xl w-full bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 mb-8 relative z-10">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Contact</h2>
        <ul className="list-none ml-0 text-gray-700">
          <li>Email: <a href="mailto:aymes.glidewell@gmail.com" className="text-blue-600 hover:text-green-600 underline transition">aymes.glidewell@gmail.com</a></li>
          <li>LinkedIn: <a href="https://www.linkedin.com/in/aymes-glidewell" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-green-600 underline transition">aymes-glidewell</a></li>
        </ul>
      </section>
    </main>
  );
}
