'use client';

import Link from 'next/link';
import PCBTraces from '../../components/PCBTraces';
import NuanceGenerator from '../../components/NuanceGenerator';
import WebAudioProcessor from '../../components/WebAudioProcessor';

export default function ProjectsPage() {
  return (
    <main className="flex flex-col items-center min-h-screen p-8 relative">
      <PCBTraces />
      <h1 className="text-4xl font-extrabold mb-4 text-indigo-900 relative z-10">Portfolio</h1>
      <section className="max-w-3xl w-full bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 mb-8 relative z-10">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Resume</h2>
        <a href="/Resume Aymes 2025.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-green-600 underline transition">Download Resume (PDF)</a>
      </section>

      <section className="max-w-3xl w-full bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 mb-8 relative z-10">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Skills</h2>
        <ul className="list-disc ml-6 text-gray-700">
          <li><strong>Programming Languages:</strong> C/C++, Python, JavaScript, Matlab</li>
          <li><strong>Hardware:</strong> ARM Cortex-M, PCB Design, Sensors & Actuators, Communication Protocols</li>
          <li><strong>Software & Tools:</strong> EcoStruxure, Altium Designer, KiCad, Fusion360, Git</li>
          <li><strong>Networking & Systems:</strong> TCP/IP, BACnet/MSTP, Embedded Debugging, RTOS</li>
        </ul>
      </section>

      <section className="max-w-3xl w-full bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 mb-8 relative z-10">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Project Samples</h2>
        
        {/* Interactive AI Nuance Generator */}
        <div className="mb-6">
          <NuanceGenerator />
        </div>
        
        {/* Web Audio Processor */}
        <div className="mb-6">
          <WebAudioProcessor />
        </div>
        
        <ul className="space-y-4">
          <li>
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg border-l-4 border-purple-500">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">🎵</span>
                <span className="text-lg font-semibold text-purple-800">AI Song Nuance Generator</span>
                <span className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">NEW</span>
              </div>
              <p className="text-gray-700 mb-3">Advanced AI tool that adds unique, procedurally-generated musical nuances to songs. Try the instant browser version above, or download the complete tool with 10+ advanced audio effects for professional audio processing.</p>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded">Python</span>
                <span className="px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded">Web Audio API</span>
                <span className="px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded">AI/ML</span>
                <span className="px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded">Audio Processing</span>
                <span className="px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded">Flask</span>
                <span className="px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded">DSP</span>
              </div>
              <div className="flex gap-3">
                <a href="http://localhost:5001" target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:text-green-600 underline font-semibold transition">🚀 Try Live Demo</a>
                <span className="text-gray-500">|</span>
                <a href="https://github.com/gwell11/aymesglidwebsite/tree/main/nuance-generator" target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:text-green-600 underline transition">📁 View Code</a>
              </div>
              <p className="text-sm text-gray-600 mt-2 italic">Features: Real-time AI synthesis, 10 audio effects, parameter control, unique sound generation</p>
            </div>
          </li>
          <li>
            <a href="https://github.com/gwell11/handheld-synthesizer" target="_blank" rel="noopener noreferrer" className="text-indigo-700 hover:text-green-600 underline text-lg font-semibold transition">Synthesizer Project</a>
            <p className="text-gray-600 mt-1">A web-based synthesizer demonstrating UI, state management, and sound design. <Link href="/projects/synths/chords-lead" className="text-blue-600 hover:text-green-600 underline transition">View Web Version (incomplete)</Link></p>
            {/* Embed video or add screenshots here */}
          </li>
          <li>
            <a href="/Grid-Stabilizing-Frequency-Detector.pdf" target="_blank" rel="noopener noreferrer" className="text-indigo-700 hover:text-green-600 underline text-lg font-semibold transition">Grid Stabilizing Frequency Detector</a>
            <p className="text-gray-600 mt-1">A comprehensive engineering project focused on electrical grid stability and frequency detection systems. Demonstrates advanced circuit design and power system analysis capabilities.</p>
          </li>
          {/* Add more project samples here */}
        </ul>
      </section>

      <section className="max-w-3xl w-full bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 mb-8 relative z-10">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Awards & Certifications</h2>
        <ul className="list-disc ml-6 text-gray-700">
          <li>B.S in Electrical Engineering, UCF</li>
          {/* Add more awards/certifications here */}
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
