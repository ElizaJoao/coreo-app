import styles from "./FeaturesSection.module.css";

const STEPS = [
  {
    num: "01",
    title: "Describe your class",
    body: "Choose a style, set the duration and difficulty, pick your audience, and add any notes. Takes under a minute.",
  },
  {
    num: "02",
    title: "AI builds the sequence",
    body: "Claude generates 8–14 moves with realistic timings that sum to your class duration, plus a warm-up and cool-down.",
  },
  {
    num: "03",
    title: "Edit and teach",
    body: "Reorder moves, tweak descriptions and durations, add your own cues — then walk into class with a plan that's truly yours.",
  },
];

const FEATURES = [
  {
    icon: "🎵",
    title: "Music suggestions",
    body: "Every plan gets an AI-recommended track with title, artist, and BPM matched to your class style and tempo.",
  },
  {
    icon: "🎬",
    title: "Video demos per move",
    body: "Pro plan: each move comes with a YouTube search link so you or your students can see the exact movement before class.",
    plan: "Pro",
  },
  {
    icon: "🔗",
    title: "Student share page",
    body: "Pro plan: share a clean, read-only link with your class — they see the full sequence, timings, and video references.",
    plan: "Pro",
  },
  {
    icon: "💬",
    title: "Verbal cues, word for word",
    body: "Max plan: the AI writes the exact phrases you say out loud — energetic, rhythmic coaching language for every move.",
    plan: "Max",
  },
  {
    icon: "▶",
    title: "Rehearsal Mode",
    body: "Max plan: fullscreen timed walkthrough that auto-advances through moves so you can rehearse hands-free before class.",
    plan: "Max",
  },
  {
    icon: "✏️",
    title: "Live sequence editor",
    body: "Reorder moves with arrows, edit names and descriptions inline, adjust durations — changes save instantly.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className={styles.section}>
      {/* How it works */}
      <div className={styles.eyebrow}>How it works</div>
      <h2 className={styles.title}>Three steps from idea to class plan</h2>

      <div className={styles.steps}>
        {STEPS.map((s) => (
          <div key={s.num} className={styles.step}>
            <span className={styles.stepNum}>{s.num}</span>
            <h3 className={styles.stepTitle}>{s.title}</h3>
            <p className={styles.stepBody}>{s.body}</p>
          </div>
        ))}
      </div>

      {/* Feature grid */}
      <div className={styles.divider} />
      <div className={styles.eyebrow} style={{ marginTop: 0 }}>Features</div>
      <h2 className={styles.title}>Everything you need to run a great class</h2>

      <div className={styles.featureGrid}>
        {FEATURES.map((f) => (
          <div key={f.title} className={styles.featureCard}>
            <div className={styles.featureIcon}>{f.icon}</div>
            <div className={styles.featureContent}>
              <div className={styles.featureTitleRow}>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                {f.plan && (
                  <span className={`${styles.planTag} ${f.plan === "Max" ? styles.planTagMax : styles.planTagPro}`}>
                    {f.plan}
                  </span>
                )}
              </div>
              <p className={styles.featureBody}>{f.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
