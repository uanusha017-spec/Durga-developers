import { useEffect } from 'react';
import { X } from 'lucide-react';
import { JournalArticle } from '../data/siteData';

interface ArticleDrawerProps {
  article: JournalArticle | null;
  onClose: () => void;
  onBookConsultation: () => void;
}

export function ArticleDrawer({
  article,
  onClose,
  onBookConsultation,
}: ArticleDrawerProps) {
  useEffect(() => {
    if (!article) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [article, onClose]);

  if (!article) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#1B1615]/65 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="article-drawer-title"
      onClick={onClose}
    >
      <article
        className="relative w-full max-w-2xl h-full bg-[#F9F8F7] text-[#201D1E] overflow-y-auto border-l border-[#E3DDDB] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 sm:px-8 py-5 bg-[#F9F8F7]/95 backdrop-blur-sm border-b border-[#E3DDDB]">
          <div className="text-xs text-[#6B6260] flex items-center gap-2">
            <span className="font-mono tabular-nums text-[#8E2420]">{article.number}</span>
            <span aria-hidden="true">·</span>
            <span>{article.category}</span>
            <span aria-hidden="true">·</span>
            <span>{article.readTime}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close article"
            className="w-10 h-10 inline-flex items-center justify-center border border-[#E3DDDB] text-[#201D1E] hover:bg-[#F2EFEF] rounded-sm cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 sm:px-10 py-10 space-y-8 flex-1">
          <header className="space-y-4">
            <h2
              id="article-drawer-title"
              className="font-display text-3xl sm:text-4xl font-semibold leading-tight text-[#201D1E]"
            >
              {article.title}
            </h2>
            <p className="text-xs text-[#6B6260]">
              Shri Durga Developers Editorial Journal · Hubballi Real Estate Insights
            </p>
          </header>

          <div className="space-y-5 text-base leading-relaxed text-[#3F3837]">
            {article.content.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          <section className="p-6 bg-[#F2EFEF] border border-[#E3DDDB] rounded-sm space-y-4">
            <h3 className="font-display text-xl font-semibold text-[#201D1E]">
              Key Buyer Takeaways
            </h3>
            <ul className="space-y-2.5 text-sm text-[#3F3837]">
              {article.keyTakeaways.map((point, idx) => (
                <li key={idx} className="flex items-baseline gap-3">
                  <span className="font-mono text-xs tabular-nums text-[#8E2420] shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="sticky bottom-0 px-6 sm:px-10 py-5 bg-[#F9F8F7] border-t border-[#E3DDDB] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <p className="text-xs text-[#5C5452]">
            Planning to inspect our Vastu-compliant homes or plotted layouts in Hubballi?
          </p>
          <button
            type="button"
            onClick={() => {
              onClose();
              onBookConsultation();
            }}
            className="px-5 py-2.5 text-sm font-medium text-white bg-[#8E2420] hover:bg-[#721B18] rounded-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Speak With Advisory Team
          </button>
        </div>
      </article>
    </div>
  );
}
