import { FaGuitar, FaWaveSquare, FaRegClock } from 'react-icons/fa';

export default function BassSynthPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 max-w-2xl text-center">
        <h1 className="text-4xl font-extrabold mb-2 tracking-tight text-gray-800 flex items-center justify-center gap-3">
          <FaGuitar className="text-green-600" /> Bass Synth <FaWaveSquare className="text-teal-600" />
        </h1>
        <p className="mb-6 text-lg text-gray-700">
          Bass synth coming soon! Lay down deep grooves and basslines with the software version of the Bass Synth.
        </p>
        <div className="flex flex-col items-center gap-6 mt-8">
          <div className="flex gap-4">
            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg text-xl transition-all duration-200">Play Bass</button>
          </div>
          <div className="flex gap-2 mt-4">
            <FaGuitar className="text-3xl text-green-600" />
            <FaWaveSquare className="text-3xl text-teal-600" />
            <FaRegClock className="text-3xl text-yellow-600" />
          </div>
          <div className="mt-8 text-sm text-gray-600">(Interactive bass synth coming soon!)</div>
        </div>
      </div>
    </main>
  );
}
