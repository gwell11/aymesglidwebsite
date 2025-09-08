"use client";
import { FaEnvelope, FaLinkedin, FaGithub } from 'react-icons/fa';
import PCBTraces from "../../components/PCBTraces";

export default function ContactPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center relative">
      <PCBTraces />
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-10 max-w-2xl relative z-10">
        <h1 className="text-4xl font-extrabold mb-4 text-teal-800">Get In Touch</h1>
        <p className="text-lg text-gray-700 mb-8">
          I&apos;m always open to discussing new projects, creative ideas, or opportunities to be part of an ambitious team. Feel free to reach out.
        </p>
        <a
          href="mailto:aymes.glidewell@gmail.com"
          className="inline-flex items-center justify-center bg-teal-600 text-white px-8 py-4 rounded-lg shadow-lg hover:bg-green-600 transition text-xl font-semibold"
        >
          <FaEnvelope className="mr-3" />
          Email Me
        </a>
        <div className="mt-10 flex justify-center gap-8">
          <a href="https://www.linkedin.com/in/aymes-glidewell" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-green-600 transition">
            <FaLinkedin size={32} />
          </a>
          <a href="https://github.com/gwell11" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-green-600 transition">
            <FaGithub size={32} />
          </a>
        </div>
      </div>
    </main>
  );
}
