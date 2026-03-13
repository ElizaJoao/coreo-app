import type { Choreography } from "@coreo/shared";

export default function Home() {
  const sample: Choreography = { id: "1", name: "Warmup Flow", style: "Zumba" };

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Coreo</h1>
      <p>Web app scaffold is running.</p>
      <pre
        style={{
          background: "#111",
          color: "#eee",
          padding: 16,
          borderRadius: 8,
          overflowX: "auto"
        }}
      >
        {JSON.stringify(sample, null, 2)}
      </pre>
    </main>
  );
}

