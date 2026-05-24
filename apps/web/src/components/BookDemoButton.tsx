import Link from 'next/link'

interface BookDemoButtonProps {
  course?: string
  className?: string
  children?: React.ReactNode
}

export default function BookDemoButton({ course, className, children }: BookDemoButtonProps) {
  const href = course ? `/book-demo?course=${course}` : '/book-demo'
  return (
    <Link href={href} className={className ?? 'btn-primary'}>
      {children ?? 'Book Free Demo'}
    </Link>
  )
}
