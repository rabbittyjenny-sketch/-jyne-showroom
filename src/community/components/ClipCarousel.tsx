// Copied from the Creatr365 repo (src/components/clips/ClipCarousel.tsx): the same sliding row of clip cards
// (embla carousel, prev/next buttons, cut-off last card), drawn with the iDEAS365 blog card style.
import { useEffect, useState, type ReactNode } from 'react';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { parseYouTubeId, youTubeThumb } from '@/lib/youtube';
import { ArrowLeft, ArrowRight, Play } from 'lucide-react';

export interface ClipCardItem {
  id: string;
  title: string;
  summary?: string | null;
  cover_image_url?: string | null;
  video_url: string | null;
}

export function ClipCarousel<T extends ClipCardItem>({ items, color, onOpen, ctaLabel, header }: {
  items: T[]; color: string; onOpen: (item: T) => void; ctaLabel: string; header: ReactNode;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    if (!api) return;
    const sync = () => { setCanPrev(api.canScrollPrev()); setCanNext(api.canScrollNext()); };
    sync();
    api.on('select', sync);
    api.on('reInit', sync);
    return () => { api.off('select', sync); api.off('reInit', sync); };
  }, [api]);

  return (
    <>
      <div className="cm-group-head">
        <div className="min-w-0">{header}</div>
        {items.length > 1 && (
          <div className="cm-nav">
            <button onClick={() => api?.scrollPrev()} disabled={!canPrev} aria-label="คลิปก่อนหน้า"><ArrowLeft className="w-4 h-4" aria-hidden="true" /></button>
            <button onClick={() => api?.scrollNext()} disabled={!canNext} aria-label="คลิปถัดไป"><ArrowRight className="w-4 h-4" aria-hidden="true" /></button>
          </div>
        )}
      </div>
      <Carousel setApi={setApi} opts={{ align: 'start', containScroll: 'trimSnaps', dragFree: true }}>
        {/* room for the card's lift + hard shadow inside the clipped row */}
        <CarouselContent className="pr-4 pt-2 pb-5">
          {items.map((item) => {
            const vid = parseYouTubeId(item.video_url);
            const pic = item.cover_image_url || (vid ? youTubeThumb(vid) : null);
            return (
              <CarouselItem key={item.id} className="basis-[85%] sm:basis-[48%] lg:basis-[32%]">
                <button onClick={() => onOpen(item)} className="cm-card cm-card-media" data-color={color}>
                  <span className="cm-cover">
                    {pic && <img src={pic} alt="" loading="lazy" />}
                    <span className="cm-play"><Play className="w-4 h-4 fill-current" aria-hidden="true" /></span>
                  </span>
                  <span className="cm-card-body">
                    <h3>{item.title}</h3>
                    {item.summary && <p>{item.summary}</p>}
                    <span className="cm-more">{ctaLabel} →</span>
                  </span>
                </button>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </>
  );
}
