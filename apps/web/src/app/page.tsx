import type { Choreography } from "@coreo/shared";

export default function Home() {
  const sample: Choreography = { id: "1", name: "Warmup Flow", style: "Zumba" };

  return (
    <main className="p-6">
      <h1 className="mt-0 text-3xl font-semibold tracking-tight">Coreo</h1>
      <p>Web app scaffold is running.</p>
      <pre className="mt-4 overflow-x-auto rounded-lg bg-zinc-900/80 p-4 text-sm text-zinc-100">
        {JSON.stringify(sample, null, 2)}
      </pre>
    </main>
  );
}

