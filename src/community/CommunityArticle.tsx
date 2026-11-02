// One COMMUNITY HARBOR article — copied from the Creatr365 repo (src/pages/ArticleDetail.tsx):
// a whole designed HTML / structured article fills the page; otherwise cover, meta, title, summary,
// podcast, body (or the external link), tags. Data: i365_articles only.
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Chrome } from './Chrome';
import { ArticleBody, isDocumentHtml } from './components/ArticleBody';
import { PodcastButton } from './components/PodcastButton';
import { COLOR_HEX, KIND_LABEL, colorOfKind, type ArticleRow } from './shared';

export default function CommunityArticle() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<ArticleRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    supabase.from('i365_articles').select('*').eq('slug', slug).eq('is_active', true).maybeSingle()
      .then(({ data }) => {
        const a = data as unknown as ArticleRow | null;
        setArticle(a);
        document.title = `${a ? a.title : 'ไม่พบบทความ'} - iDEAS365`;
        const meta = document.querySelector('meta[name="description"]');
        if (a && meta) meta.setAttribute('content', a.meta_description || a.summary);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <Chrome back="/community"><p className="cm-status" style={{ paddingTop: 140 }}>กำลังโหลด…</p></Chrome>;

  if (!article) return (
    <Chrome back="/community">
      <div className="cm-post" style={{ textAlign: 'center' }}>
        <p className="cm-status">ไม่พบบทความนี้</p>
        <Link to="/community" className="cm-btn">← บทความทั้งหมด</Link>
      </div>
    </Chrome>
  );

  const footer = (
    <div className="cm-post-footer">
      <Link to="/community" className="cm-link">← บทความทั้งหมด</Link>
      <a href="/index.html" className="cm-link">MAIN MENU →</a>
    </div>
  );

  // a whole HTML file with its own design is shown as the file itself, full width
  if (isDocumentHtml(article.body)) return (
    <Chrome back="/community">
      <main style={{ paddingTop: 96 }}>
        {article.audio_url && <div className="cm-post" style={{ padding: '0 20px 16px' }}><PodcastButton article={article} /></div>}
        <ArticleBody html={article.body!} scrollOffset={80} />
        <div className="cm-post" style={{ paddingTop: 0 }}>{footer}</div>
      </main>
    </Chrome>
  );

  const color = COLOR_HEX[colorOfKind(article.kind)];
  const date = new Date(article.updated_at || article.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <Chrome back="/community">
      <main className="cm-post">
        {article.cover_image_url && <img className="cm-post-hero" src={article.cover_image_url} alt={article.title} />}
        <div className="cm-post-meta">
          <span className="cm-post-cat" style={{ background: color, color: color === COLOR_HEX.yellow ? '#1A1A1A' : '#fff' }}>{KIND_LABEL[article.kind] || article.kind}</span>
          <span className="cm-post-date">{date}</span>
          {article.author && <span className="cm-post-date">· {article.author}</span>}
        </div>
        <h1 className="cm-post-title">{article.title}</h1>
        <p className="cm-post-excerpt">{article.summary}</p>
        {article.audio_url && <div style={{ margin: '-16px 0 36px' }}><PodcastButton article={article} /></div>}
        {article.body ? <ArticleBody html={article.body} /> : article.target_url ? (
          <div className="cm-external">
            <p className="cm-post-date" style={{ marginBottom: 16 }}>บทความนี้อยู่บนเว็บไซต์ภายนอก</p>
            <a href={article.target_url} target="_blank" rel="noopener noreferrer" className="cm-btn">อ่านบทความต้นฉบับ ↗</a>
          </div>
        ) : null}
        {article.tags && article.tags.length > 0 && <div className="cm-tags">{article.tags.map((t) => <span key={t}>{t}</span>)}</div>}
        {footer}
      </main>
    </Chrome>
  );
}
