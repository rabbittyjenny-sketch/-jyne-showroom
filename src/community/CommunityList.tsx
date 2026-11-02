// COMMUNITY HARBOR list — page structure copied from the Creatr365 repo (src/pages/Articles.tsx):
// the same three groups, clip row playing in-site, internal / external / clip cards. Data: i365_articles only.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { parseYouTubeId, youTubeThumb } from '@/lib/youtube';
import { Chrome } from './Chrome';
import { ClipCarousel } from './components/ClipCarousel';
import { ClipPlayerDialog, type PlayableClip } from './components/ClipPlayerDialog';
import { COLOR_HEX, GROUPS, KIND_LABEL, type ArticleRow } from './shared';

export default function CommunityList() {
  const [items, setItems] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState<{ clip: PlayableClip; color: string; label: string } | null>(null);

  useEffect(() => {
    document.title = 'COMMUNITY HARBOR - iDEAS365';
    supabase.from('i365_articles').select('*').eq('is_active', true).order('sort_order')
      .then(({ data, error }) => { if (error) setFailed(true); setItems((data as unknown as ArticleRow[]) || []); setLoading(false); });
  }, []);

  const renderCard = (a: ArticleRow, color: string) => {
    // a YouTube link plays in-site, also when it was saved in "External URL"
    const videoId = parseYouTubeId(a.video_url) ?? parseYouTubeId(a.target_url);
    const isInternal = !!a.body || a.target_url.startsWith('/');
    const cover = a.cover_image_url || (videoId ? youTubeThumb(videoId) : null);
    const inner = (
      <>
        {cover && <span className="cm-cover"><img src={cover} alt={a.title} loading="lazy" /></span>}
        <span className="cm-card-body">
          <span className="cm-tag">{KIND_LABEL[a.kind] || a.kind}</span>
          <h3>{a.title}</h3>
          <p>{a.summary}</p>
          <span className="cm-meta">
            <span className="cm-more">{videoId ? 'ดูคลิป' : isInternal ? 'อ่านต่อ' : 'ดูเพิ่มเติม ↗'} →</span>
            {a.author && <span>{a.author}</span>}
          </span>
        </span>
      </>
    );
    const cls = `cm-card${cover ? ' cm-card-media' : ''}`;
    if (videoId) {
      return <button key={a.id} type="button" className={cls} data-color={color}
        onClick={() => setPlaying({ clip: { ...a, video_url: a.video_url || a.target_url }, color, label: KIND_LABEL[a.kind] || 'คลิป' })}>{inner}</button>;
    }
    return isInternal
      ? <Link key={a.id} to={`/community/${a.slug}`} className={cls} data-color={color}>{inner}</Link>
      : <a key={a.id} href={a.target_url} target="_blank" rel="noopener noreferrer" className={cls} data-color={color}>{inner}</a>;
  };

  return (
    <Chrome back="/index.html">
      <main className="cm-main">
        <h1 className="cm-title">COMMUNITY<br />HARBOR</h1>
        <p className="cm-subtitle">ชุมชน บทความ ข่าวสาร</p>
        {loading ? <p className="cm-status">กำลังโหลด…</p> : failed ? <p className="cm-status">โหลดเนื้อหาไม่สำเร็จ ลองใหม่อีกครั้ง</p> : (
          <div className="cm-groups">
            {GROUPS.map((group) => {
              const groupItems = items.filter((i) => group.kinds.includes(i.kind));
              const isClips = group.kinds.includes('video');
              const clipItems = isClips ? groupItems.filter((i) => parseYouTubeId(i.video_url)) : [];
              const gridItems = isClips ? groupItems.filter((i) => !parseYouTubeId(i.video_url)) : groupItems;
              const header = <h2 className="cm-group-title"><i style={{ background: COLOR_HEX[group.color] }} aria-hidden="true" />{group.label}</h2>;
              return (
                <section key={group.label}>
                  {clipItems.length > 0 ? (
                    <ClipCarousel items={clipItems} color={group.color} ctaLabel="ดูคลิป" header={header}
                      onOpen={(a) => setPlaying({ clip: a, color: group.color, label: group.label })} />
                  ) : <div className="cm-group-head">{header}</div>}
                  {clipItems.length > 0 && gridItems.length === 0 ? null : groupItems.length === 0 ? (
                    <div className="cm-empty">ยังไม่มีเนื้อหาในหมวดนี้ — กลับมาดูใหม่เร็ว ๆ นี้</div>
                  ) : (
                    <div className="cm-grid">{gridItems.map((a) => renderCard(a, group.color))}</div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </main>
      <ClipPlayerDialog clip={playing?.clip ?? null} onClose={() => setPlaying(null)} label={playing?.label ?? ''} accent={COLOR_HEX[playing?.color ?? 'blue']} />
    </Chrome>
  );
}
