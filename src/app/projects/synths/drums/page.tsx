import { FaDrum, FaDrumSteelpan, FaRegClock } from 'react-icons/fa';

export default function DrumsSynthPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-yellow-900 via-orange-700 to-red-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none select-none" style={{background: 'radial-gradient(circle at 40% 60%, #fff 0%, transparent 70%)'}} />
      <h1 className="text-4xl font-extrabold mb-2 tracking-tight drop-shadow-lg flex items-center gap-3">
        <FaDrum className="text-yellow-300 animate-bounce" /> Drums Synth <FaDrumSteelpan className="text-pink-400 animate-pulse" />
      </h1>
      <p className="mb-6 text-lg max-w-xl text-center bg-black/40 rounded-lg px-6 py-3 shadow-lg">
        Drum machine coming soon! Tap out beats and rhythms with the software version of the Drums Synth.
      </p>
      <div className="flex flex-col items-center gap-6 mt-8">
        <div className="flex gap-4">
          <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg text-xl transition-all duration-200">Kick</button>
          <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg text-xl transition-all duration-200">Snare</button>
          <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg text-xl transition-all duration-200">Hi-Hat</button>
        </div>
        <div className="flex gap-2 mt-4 animate-pulse">
          <FaDrum className="text-3xl text-yellow-200" />
          <FaDrumSteelpan className="text-3xl text-pink-200" />
          <FaRegClock className="text-3xl text-blue-200" />
        </div>
        <div className="mt-8 text-sm text-gray-200/80">(Interactive drum machine coming soon!)</div>
      </div>
    </main>
  );
}
