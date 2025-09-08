import Link from 'next/link';

export default function SynthsPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Synths</h1>
        <ul className="space-y-4">
          <li>
            <Link href="/projects/synths/chords-lead" className="text-teal-600 hover:text-green-600 hover:underline text-xl block p-2 rounded hover:bg-green-50 transition">Chords/Lead Synth</Link>
          </li>
          <li>
            <Link href="/projects/synths/drums" className="text-teal-600 hover:text-green-600 hover:underline text-xl block p-2 rounded hover:bg-green-50 transition">Drums Synth</Link>
          </li>
          <li>
            <Link href="/projects/synths/bass" className="text-teal-600 hover:text-green-600 hover:underline text-xl block p-2 rounded hover:bg-green-50 transition">Bass Synth</Link>
          </li>
        </ul>
      </div>
    </main>
  );
}
