const STATS = [
  { value: '75%', label: 'de CVs son descartados por ATS antes de ser leídos' },
  { value: '40%', label: 'más entrevistas con un CV optimizado para ATS' },
  { value: '6s', label: 'promedio que un reclutador mira tu CV' },
  { value: '98%', label: 'de Fortune 500 usan sistemas ATS' },
];

export function StatsBar() {
  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
