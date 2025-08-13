
import Link from "next/link";
import Mascot from "../../components/Mascot";

export default function HomeInner() {
  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen"
      style={{
        backgroundImage: 'url(/IMG_2031.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
  <Mascot full />
      <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">Your Name</h1>
      <nav className="flex flex-wrap gap-6 text-lg font-medium">
        <Link href="/about" className="hover:underline">About</Link>
        <Link href="/projects" className="hover:underline">Projects</Link>
        <Link href="/music" className="hover:underline">Music</Link>
        <Link href="/resume" className="hover:underline">Resume</Link>
        <Link href="/contact" className="hover:underline">Contact</Link>
      </nav>
    </main>
  );
}
