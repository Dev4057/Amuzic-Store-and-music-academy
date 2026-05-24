import type { Metadata } from 'next'
import HeroSection from '@/components/home/HeroSection'
import MarqueeStrip from '@/components/MarqueeStrip'
import CourseHighlights from '@/components/home/CourseHighlights'
import WhyChooseUs from '@/components/home/WhyChooseUs'
import TeachersSection from '@/components/home/TeachersSection'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import GalleryTeaser from '@/components/home/GalleryTeaser'
import CtaSection from '@/components/home/CtaSection'

export const metadata: Metadata = {
  title: 'Amuzic Academy — Music Classes in Bavdhan, Pune',
  description:
    'Learn keyboard, guitar, drums & vocals at Amuzic Academy, Bakaji Corner, Bavdhan, Pune. Expert teachers, all age groups. Book your free demo class today!',
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <MarqueeStrip />
      <CourseHighlights />
      <WhyChooseUs />
      <TeachersSection />
      <TestimonialsSection />
      <GalleryTeaser />
      <CtaSection />
    </>
  )
}
