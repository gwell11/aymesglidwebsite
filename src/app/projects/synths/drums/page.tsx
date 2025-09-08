import { FaDrum, FaDrumSteelpan, FaRegClock } from 'react-icons/fa';

export default function DrumsSynthPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 max-w-2xl text-center">
        <h1 className="text-4xl font-extrabold mb-2 tracking-tight text-gray-800 flex items-center justify-center gap-3">
          <FaDrum className="text-orange-600" /> Drums Synth <FaDrumSteelpan className="text-pink-600" />
        </h1>
        <p className="mb-6 text-lg text-gray-700">
          Drum machine coming soon! Tap out beats and rhythms with the software version of the Drums Synth.
        </p>
        <div className="flex flex-col items-center gap-6 mt-8">
          <div className="flex gap-4">
            <button className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg text-xl transition-all duration-200">Kick</button>
            <button className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg text-xl transition-all duration-200">Snare</button>
            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg text-xl transition-all duration-200">Hi-Hat</button>
          </div>
          <div className="flex gap-2 mt-4">
            <FaDrum className="text-3xl text-orange-600" />
            <FaDrumSteelpan className="text-3xl text-pink-600" />
            <FaRegClock className="text-3xl text-blue-600" />
          </div>
          <div className="mt-8 text-sm text-gray-600">(Interactive drum machine coming soon!)</div>
        </div>
      </div>
    </main>
  );
}
