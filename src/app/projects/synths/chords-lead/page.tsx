import { FaGuitar, FaMusic, FaWaveSquare } from 'react-icons/fa';

export default function ChordsLeadSynthPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-purple-900 via-indigo-700 to-blue-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none select-none" style={{background: 'radial-gradient(circle at 60% 40%, #fff 0%, transparent 70%)'}} />
      <h1 className="text-4xl font-extrabold mb-2 tracking-tight drop-shadow-lg flex items-center gap-3">
        <FaGuitar className="text-yellow-300 animate-pulse" /> Chords/Lead Synth <FaWaveSquare className="text-pink-400 animate-bounce" />
      </h1>
      <p className="mb-6 text-lg max-w-xl text-center bg-black/40 rounded-lg px-6 py-3 shadow-lg">
        Try out the software version of the Chords/Lead Synth! Play chords, leads, and experiment with sound. (Demo coming soon)
      </p>
      <div className="flex flex-col items-center gap-6 mt-8">
        <div className="flex gap-4">
          <button className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg text-xl transition-all duration-200">Play Chord</button>
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg text-xl transition-all duration-200">Play Lead</button>
        </div>
        <div className="flex gap-2 mt-4 animate-pulse">
          <FaMusic className="text-3xl text-yellow-200" />
          <FaMusic className="text-3xl text-pink-200" />
          <FaMusic className="text-3xl text-blue-200" />
        </div>
        <div className="mt-8 text-sm text-gray-200/80">(Interactive synth UI coming soon!)</div>
      </div>
    </main>
  );
}
