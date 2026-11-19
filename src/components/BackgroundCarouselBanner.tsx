import { ReactNode, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { HeroSlide } from '../data/siteData';
import { ResilientImage } from './ResilientImage';

interface BackgroundCarouselBannerProps {
  slides: HeroSlide[];
  initialSlideIndex?: number;
  minHeightClass?: string;
  showSlideCaptionBar?: boolean;
  onInspectProject?: (projectId: string) => void;
  children: ReactNode;
}

export function BackgroundCarouselBanner({
  slides,
  initialSlideIndex = 0,
  minHeightClass = 'min-h-[360px] lg:min-h-[420px]',
  showSlideCaptionBar = true,
  onInspectProject,
  children,
}: BackgroundCarouselBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialSlideIndex % slides.length);

  useEffect(() => {
    setCurrentIndex(initialSlideIndex % slides.length);
  }, [initialSlideIndex, slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const activeSlide = slides[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <section
      className={`relative w-full overflow-hidden bg-[#1B1615] text-white border-b border-[#382D2B] flex flex-col justify-between ${minHeightClass}`}
      aria-roledescription="carousel"
      aria-label="Shri Durga Developers architectural showcase background"
    >
      {/* Full-Bleed Crossfading Architectural Background Images */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                isActive ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <ResilientImage
                src={slide.image}
                alt={slide.alt}
                fallbackLabel={slide.title}
                className="w-full h-full object-cover object-center scale-[1.01]"
              />
            </div>
          );
        })}

        {/* Measured Deep Charcoal-Crimson Editorial Scrim for 4.5:1+ Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#16100F]/92 via-[#1A1312]/76 to-[#1A1312]/48" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#16100F]/88 via-transparent to-[#16100F]/35" />
      </div>

      {/* Foreground Page Hero / Banner Content */}
      <div className="relative z-10 w-full flex-1 flex items-center">{children}</div>

      {/* Full-Width Bottom Architectural Carousel Controls Bar */}
      {showSlideCaptionBar && (
        <div className="relative z-10 border-t border-white/15 bg-[#16100F]/60 backdrop-blur-[3px]">
          <div className="max-w-[1320px] mx-auto px-6 lg:px-10 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Active Slide Metadata + Inspect Trigger */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
              <span className="font-mono tabular-nums text-[#F28C38] font-medium">
                {activeSlide.index} / {String(slides.length).padStart(2, '0')}
              </span>
              <span className="font-medium text-white">{activeSlide.title}</span>
              <span className="text-white/40" aria-hidden="true">
                ·
              </span>
              <span className="text-[#DED7D5]">{activeSlide.location}</span>
              <span className="hidden sm:inline text-white/40" aria-hidden="true">
                ·
              </span>
              <span className="hidden sm:inline text-[#C9C0BE]">{activeSlide.highlight}</span>

              {onInspectProject && (
                <button
                  type="button"
                  onClick={() => onInspectProject(activeSlide.projectId)}
                  className="inline-flex items-center gap-1 text-[#F28C38] hover:text-white font-medium transition-colors cursor-pointer whitespace-nowrap ml-1"
                >
                  <span>Inspect Project</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Slide Selector Track + Prev/Next Controls */}
            <div className="flex items-center gap-4 shrink-0">
              <div
                className="flex items-center gap-2"
                role="tablist"
                aria-label="Choose background architectural slide"
              >
                {slides.map((slide, idx) => {
                  const isSelected = idx === currentIndex;
                  return (
                    <button
                      key={slide.id}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      aria-label={`Show slide ${slide.index}: ${slide.title}`}
                      onClick={() => setCurrentIndex(idx)}
                      className="py-2 px-1 cursor-pointer"
                    >
                      <span
                        className={`block h-[2px] transition-all duration-200 ${
                          isSelected
                            ? 'w-7 bg-[#E86A17]'
                            : 'w-4 bg-white/35 hover:bg-white/70'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous background slide"
                  className="w-8 h-8 inline-flex items-center justify-center border border-white/25 hover:border-[#E86A17] text-white rounded-sm transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next background slide"
                  className="w-8 h-8 inline-flex items-center justify-center border border-white/25 hover:border-[#E86A17] text-white rounded-sm transition-colors cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
