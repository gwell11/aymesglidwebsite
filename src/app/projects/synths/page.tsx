import Link from 'next/link';

export default function SynthsPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Synths</h1>
      <ul className="space-y-4">
        <li>
          <Link href="/projects/synths/chords-lead" className="text-blue-600 hover:underline text-xl">Chords/Lead Synth</Link>
        </li>
        <li>
          <Link href="/projects/synths/drums" className="text-blue-600 hover:underline text-xl">Drums Synth</Link>
        </li>
        <li>
          <Link href="/projects/synths/bass" className="text-blue-600 hover:underline text-xl">Bass Synth</Link>
        </li>
      </ul>
    </main>
  );
}
