
import Link from "next/link";
import Mascot from "../../components/Mascot";

export default function HomeInner() {
  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen"
      style={{
    backgroundImage: 'url(/drawingcouple.png)',
    backgroundSize: '60vmin 60vmin',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
    <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">Aymes Glidewell</h1>
    <nav className="flex flex-wrap gap-6 text-lg font-medium">
      <Link href="/about" className="hover:underline">About</Link>
      <Link href="/projects" className="hover:underline">Projects</Link>
    </nav>
    </main>
  );
}
