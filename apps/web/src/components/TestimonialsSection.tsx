import styles from "./TestimonialsSection.module.css";

const TESTIMONIALS = [
  {
    quote: "I used to spend 2 hours planning each class. Offbeat brings that down to 10 minutes — and my students say the routines feel more polished than ever.",
    name: "Maria Lopes",
    role: "Zumba instructor, Lisbon",
    initials: "ML",
    color: "#e85d5d",
  },
  {
    quote: "The share page is a game-changer. I send the link before class and students come in knowing the moves. We spend more time dancing, less time explaining.",
    name: "James Reid",
    role: "Pilates & Dance instructor, London",
    initials: "JR",
    color: "#5d9be8",
  },
  {
    quote: "I published three of my Bachata routines on the marketplace. Made back the Pro subscription cost in the first week. It's passive income from work I'm already doing.",
    name: "Ana Silva",
    role: "Bachata & Salsa instructor, Porto",
    initials: "AS",
    color: "#f5a9b8",
  },
] as const;

export function TestimonialsSection() {
  return (
    <section className={styles.section}>
      <div className={styles.eyebrow}>Instructors love it</div>
      <h2 className={styles.title}>Real results, real classes</h2>

      <div className={styles.grid}>
        {TESTIMONIALS.map((t) => (
          <div key={t.name} className={styles.card}>
            <div className={styles.quoteIcon}>"</div>
            <p className={styles.quote}>{t.quote}</p>
            <div className={styles.author}>
              <span className={styles.avatar} style={{ background: t.color }}>{t.initials}</span>
              <div>
                <div className={styles.name}>{t.name}</div>
                <div className={styles.role}>{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
