const ITEMS = [
  'Keyboard', 'Guitar', 'Drums', 'Vocals',
  'Bavdhan · Pune', '500+ Students', '10+ Years of Music',
  'All Age Groups', 'Free Demo Class', 'Expert Teachers',
]

export default function MarqueeStrip() {
  const repeated = [...ITEMS, ...ITEMS]

  return (
    <div className="bg-burgundy overflow-hidden py-3.5 border-y border-burgundy-dark">
      <div className="flex animate-marquee whitespace-nowrap">
        {repeated.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center text-cream font-body text-xs tracking-[0.18em] uppercase"
          >
            {item}
            <span className="text-gold mx-5 text-base leading-none">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}
