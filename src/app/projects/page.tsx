import Link from 'next/link';

export default function ProjectsPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-6">Projects</h1>
      <ul className="space-y-4">
        <li>
          <Link href="/projects/synths" className="text-blue-600 hover:underline text-2xl">Synths</Link>
        </li>
        {/* Add more project categories here if needed */}
      </ul>
    </main>
  );
}
