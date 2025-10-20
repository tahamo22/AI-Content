import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">AI Interview Assistant</h1>
      <p className="text-gray-600">Practice interviews with real-time feedback and bilingual support.</p>
      <Link href="/interview" className="inline-block rounded bg-blue-600 px-4 py-2 text-white">Start Interview</Link>
    </div>
  );
}
