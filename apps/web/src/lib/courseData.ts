import type { CourseSlug } from '@amuzic/shared'

export interface CourseDetail {
  slug: CourseSlug
  name: string
  tagline: string
  description: string
  longDescription: string
  fee: number
  admissionFee: number
  duration: number
  teacher: string
  teacherInitials: string
  teacherBio: string
  levels: { name: string; duration: string; description: string }[]
  whatYouLearn: string[]
  whoIsItFor: string[]
  faq: { q: string; a: string }[]
}

const COURSES: CourseDetail[] = [
  {
    slug: 'keyboard',
    name: 'Keyboard',
    tagline: 'From first notes to full compositions',
    description: 'A structured keyboard program for all ages. Learn theory, technique, and musicality.',
    longDescription:
      'Keyboard is the perfect entry point into music. The visual layout of the keys makes music theory intuitive — students can see scales, chords, and harmony physically laid out before them. Our keyboard course at Amuzic Academy takes students from their very first notes all the way to performing full compositions, with a curriculum that balances Western classical tradition with Carnatic scales and popular contemporary styles.',
    fee: 1500,
    admissionFee: 2000,
    duration: 12,
    teacher: 'Gopal',
    teacherInitials: 'G',
    teacherBio: 'Classically trained with 12+ years of teaching experience. Gopal has a gift for making complex theory feel natural.',
    levels: [
      { name: 'Foundation', duration: '3 months', description: 'Note reading, posture, scales in C major, simple melodies.' },
      { name: 'Elementary', duration: '3 months', description: 'Chord triads, left-hand coordination, simple songs.' },
      { name: 'Intermediate', duration: '3 months', description: 'Two-hand independence, arpeggios, Carnatic ragas intro.' },
      { name: 'Advanced', duration: '3 months', description: 'Complex compositions, sight-reading, stage performance.' },
    ],
    whatYouLearn: [
      'Staff notation & sight-reading',
      'Major, minor & modal scales',
      'Chord progressions & harmonization',
      'Carnatic & Western fusion',
      'Performance & stage presence',
      'Music composition basics',
    ],
    whoIsItFor: [
      'Children aged 5 and above',
      'Adults learning music for the first time',
      'Students wanting a theory-rich foundation',
      'Anyone who finds other instruments intimidating',
    ],
    faq: [
      { q: 'Do I need to own a keyboard?', a: 'No. Instruments are available at the academy for practice during class. We recommend purchasing one for home practice after the first month.' },
      { q: 'What age is ideal to start?', a: 'Children can start as young as 5. Adults of any age are welcome — many of our most enthusiastic students started after 40.' },
      { q: 'How long until I can play real songs?', a: 'Most students play their first recognisable song within 4–6 weeks. By month 3, you\'ll have a small repertoire.' },
    ],
  },
  {
    slug: 'guitar',
    name: 'Guitar',
    tagline: 'Acoustic rhythm, chords, and your favourite songs',
    description: 'Learn guitar the right way — technique first, songs you love second.',
    longDescription:
      'Guitar is one of the most popular instruments in the world, and for good reason — it\'s portable, versatile, and deeply satisfying to play. Our guitar program begins with proper posture and hand position (which most self-taught guitarists never learn), then progresses through open chords, barre chords, strumming patterns, and fingerpicking. We use songs the students actually want to play, from Bollywood hits to rock classics, as the vehicle for learning technique.',
    fee: 1500,
    admissionFee: 2000,
    duration: 12,
    teacher: 'Gopal',
    teacherInitials: 'G',
    teacherBio: 'Expert in both rhythm and lead guitar. Gopal has performed at venues across Pune and brings real-world musical insight.',
    levels: [
      { name: 'Foundation', duration: '3 months', description: 'Open chords (C, G, D, Am, Em), basic strumming, first songs.' },
      { name: 'Elementary', duration: '3 months', description: 'Barre chords, strumming variations, chord transitions.' },
      { name: 'Intermediate', duration: '3 months', description: 'Fingerpicking, power chords, intro to lead guitar.' },
      { name: 'Advanced', duration: '3 months', description: 'Soloing, scales, full song arrangements, stage performance.' },
    ],
    whatYouLearn: [
      'Open & barre chord mastery',
      'Strumming & fingerpicking techniques',
      'Bollywood, pop & rock styles',
      'Basic music theory for guitar',
      'Lead guitar fundamentals',
      'Song arrangement & transposition',
    ],
    whoIsItFor: [
      'Beginners who\'ve always wanted to play guitar',
      'Self-taught players wanting to fix bad habits',
      'Teens and young adults',
      'Professionals wanting a creative outlet',
    ],
    faq: [
      { q: 'Acoustic or electric?', a: 'We start on acoustic guitar. It builds finger strength and proper technique. Electric guitar is introduced at the intermediate level.' },
      { q: 'Do I need my own guitar?', a: 'Guitars are available at the academy. For home practice, we\'ll guide you on what to buy within your budget.' },
      { q: 'Can I learn Bollywood songs?', a: 'Absolutely. We use popular Hindi and English songs throughout the curriculum to keep learning engaging and relevant.' },
    ],
  },
  {
    slug: 'drums',
    name: 'Drums',
    tagline: 'Rhythm, coordination, groove, and power',
    description: 'More than just hitting things — drums develop discipline, coordination, and musicality.',
    longDescription:
      'Drumming is a full-body, full-brain workout. It develops bilateral coordination, improves focus, reduces stress, and — most importantly — is enormously fun. Jay Nawale\'s drum program at Amuzic Academy begins with rudiments and proper stick technique before progressing through groove patterns, fills, and full song performance. Students are regularly placed in ensemble situations so they can experience what it feels like to lock in with other musicians.',
    fee: 1800,
    admissionFee: 2500,
    duration: 12,
    teacher: 'Jay Nawale',
    teacherInitials: 'J',
    teacherBio: 'Professional drummer with extensive live performance experience. Jay specialises in rock, pop, jazz, and Bollywood rhythms.',
    levels: [
      { name: 'Foundation', duration: '3 months', description: 'Grip, posture, basic rudiments, hi-hat & bass drum coordination.' },
      { name: 'Elementary', duration: '3 months', description: 'Rock & pop grooves, simple fills, first full songs.' },
      { name: 'Intermediate', duration: '3 months', description: 'Jazz brushwork, complex fills, groove variations, odd meters.' },
      { name: 'Advanced', duration: '3 months', description: 'Advanced technique, ghost notes, studio-ready drumming, ensemble performance.' },
    ],
    whatYouLearn: [
      '40 essential rudiments',
      'Rock, pop, jazz & Bollywood grooves',
      'Four-limb coordination',
      'Fill patterns and variations',
      'Dynamics and ghost notes',
      'Playing to a click track',
    ],
    whoIsItFor: [
      'High-energy kids who need a productive outlet',
      'Rhythm-lovers of all ages',
      'Existing musicians wanting to add percussion',
      'Anyone who\'s ever tapped their fingers on a desk',
    ],
    faq: [
      { q: 'Is drumming too loud for apartments?', a: 'Practice pads are used for home practice — they\'re nearly silent. Full kit practice happens at the academy.' },
      { q: 'What age can kids start?', a: 'We accept students from age 7 for drums, as it requires some physical coordination and the ability to follow instructions.' },
      { q: 'Will it help with other instruments?', a: 'Enormously. A strong rhythmic foundation makes learning any other instrument significantly easier.' },
    ],
  },
  {
    slug: 'vocals',
    name: 'Vocals',
    tagline: 'Pitch, range, breath — and the confidence to sing',
    description: 'Vocal training for those who want to sing well, and those who simply want to stop being afraid to.',
    longDescription:
      'Most people believe singing is either a talent you\'re born with or not. That\'s simply not true. The voice is an instrument — and like any instrument, it responds to proper training, consistent practice, and good technique. Our vocal program covers breathing mechanics, posture, pitch accuracy, range development, and the all-important emotional delivery that separates a good singer from a memorable one. Whether you want to perform on stage or simply sing for yourself, this course will transform your relationship with your voice.',
    fee: 1500,
    admissionFee: 2000,
    duration: 12,
    teacher: 'Manisha',
    teacherInitials: 'M',
    teacherBio: 'Trained in Hindustani classical and contemporary vocal styles with 5+ years of dedicated teaching experience. Manisha helps students find their unique voice with warmth and precision.',
    levels: [
      { name: 'Foundation', duration: '3 months', description: 'Breathing exercises, basic pitch training, simple scales and songs.' },
      { name: 'Elementary', duration: '3 months', description: 'Resonance, vowel shaping, minor scales, first performance songs.' },
      { name: 'Intermediate', duration: '3 months', description: 'Range expansion, vibrato intro, classical raga basics.' },
      { name: 'Advanced', duration: '3 months', description: 'Performance technique, mic technique, advanced raga, stage confidence.' },
    ],
    whatYouLearn: [
      'Diaphragmatic breathing',
      'Pitch accuracy & ear training',
      'Vocal range expansion',
      'Hindi, English & classical songs',
      'Stage presence & performance',
      'Microphone technique',
    ],
    whoIsItFor: [
      'Absolute beginners who think they "can\'t sing"',
      'Intermediate singers wanting to fix technique',
      'Students preparing for auditions',
      'Anyone who loves singing and wants to do it better',
    ],
    faq: [
      { q: 'I have a bad voice. Can I still learn?', a: 'This is the most common misconception we encounter. Vocal quality is largely trained, not innate. Give us 3 months and you\'ll be surprised.' },
      { q: 'Do you teach Bollywood songs?', a: 'Yes — Hindi film songs are a central part of our repertoire. We also cover ghazals, Marathi songs, and English pop.' },
      { q: 'Is there a minimum age for vocals?', a: 'We accept students from age 7. Children\'s voices are still developing, so we take a gentle, age-appropriate approach.' },
    ],
  },
]

export function getCourseBySlug(slug: string): CourseDetail | undefined {
  return COURSES.find((c) => c.slug === slug)
}

export function getAllCourseSlugs(): CourseSlug[] {
  return COURSES.map((c) => c.slug)
}

export { COURSES }
