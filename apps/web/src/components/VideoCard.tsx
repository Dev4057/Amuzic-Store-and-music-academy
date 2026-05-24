import type { ShowcaseVideo } from '@amuzic/shared'

interface VideoCardProps {
  video: ShowcaseVideo
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  return match ? match[1] : null
}

export default function VideoCard({ video }: VideoCardProps) {
  const ytId = getYouTubeId(video.video_url)

  return (
    <div className="card overflow-hidden group">
      <div className="aspect-video bg-ink relative overflow-hidden">
        {ytId ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <span className="font-heading italic text-6xl text-cream/20 select-none">♫</span>
            <span className="text-xs font-body text-cream/30 uppercase tracking-wider">Performance coming soon</span>
          </div>
        )}
      </div>

      <div className="p-5">
        <span className="text-xs font-body font-medium text-burgundy uppercase tracking-[0.12em]">{video.course}</span>
        <h3 className="font-heading text-base font-semibold text-ink mt-1 mb-1 leading-snug">{video.title}</h3>
        <p className="text-sm text-ink/45 font-body">By {video.student_name}</p>
      </div>
    </div>
  )
}
