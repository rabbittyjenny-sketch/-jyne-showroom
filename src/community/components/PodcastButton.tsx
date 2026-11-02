// Copied from the Creatr365 repo (src/components/podcast/PodcastButton.tsx); button restyled to the iDEAS365 pages.
import React, { useState } from 'react';
import { Headphones } from 'lucide-react';
import { CassettePlayerDialog, type PodcastArticle } from './CassettePlayerDialog';

interface Props {
  /** Pass the article; the button renders only when it has an audio file. */
  article: {
    id: string; title: string; audio_url?: string | null; audio_duration_sec?: number | null;
    audio_title?: string | null; audio_image_url?: string | null;
  };
  className?: string;
}

/** The single "ฟังเป็น Podcast" entry point on /articles/:slug. */
export const PodcastButton: React.FC<Props> = ({ article, className = '' }) => {
  const [open, setOpen] = useState(false);
  if (!article.audio_url) return null;
  const track: PodcastArticle = {
    id: article.id,
    // the podcast's own name if the admin set one, otherwise the article title
    title: article.audio_title?.trim() || article.title,
    audio_url: article.audio_url,
    audio_duration_sec: article.audio_duration_sec,
    image_url: article.audio_image_url || null,
  };
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`cm-btn ${className}`}
      >
        <Headphones className="w-4 h-4" aria-hidden="true" /> ฟังเป็น Podcast
      </button>
      <CassettePlayerDialog article={open ? track : null} onClose={() => setOpen(false)} />
    </>
  );
};

export default PodcastButton;
