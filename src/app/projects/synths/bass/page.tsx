import { FaGuitar, FaWaveSquare, FaRegClock } from 'react-icons/fa';

export default function BassSynthPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-green-900 via-teal-700 to-blue-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none select-none" style={{background: 'radial-gradient(circle at 50% 50%, #fff 0%, transparent 70%)'}} />
      <h1 className="text-4xl font-extrabold mb-2 tracking-tight drop-shadow-lg flex items-center gap-3">
        <FaGuitar className="text-green-300 animate-bounce" /> Bass Synth <FaWaveSquare className="text-blue-400 animate-pulse" />
      </h1>
      <p className="mb-6 text-lg max-w-xl text-center bg-black/40 rounded-lg px-6 py-3 shadow-lg">
        Bass synth coming soon! Lay down deep grooves and basslines with the software version of the Bass Synth.
      </p>
      <div className="flex flex-col items-center gap-6 mt-8">
        <div className="flex gap-4">
          <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg text-xl transition-all duration-200">Play Bass</button>
        </div>
        <div className="flex gap-2 mt-4 animate-pulse">
          <FaGuitar className="text-3xl text-green-200" />
          <FaWaveSquare className="text-3xl text-blue-200" />
          <FaRegClock className="text-3xl text-yellow-200" />
        </div>
        <div className="mt-8 text-sm text-gray-200/80">(Interactive bass synth coming soon!)</div>
      </div>
    </main>
  );
}
