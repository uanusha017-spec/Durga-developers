import { useEffect, useState } from 'react';
import { ArrowUpRight, Check, Copy, MapPin, Phone, X } from 'lucide-react';
import { COMPANY_INFO, OngoingProject } from '../data/siteData';
import { ResilientImage } from './ResilientImage';

interface ProjectDossierModalProps {
  project: OngoingProject | null;
  onClose: () => void;
  onBookSiteVisit: (projectName: string) => void;
}

export function ProjectDossierModal({
  project,
  onClose,
  onBookSiteVisit,
}: ProjectDossierModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!project) return;
    setCopied(false);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [project, onClose]);

  if (!project) return null;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${project.name}, ${project.address}`
  )}`;

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(project.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#1B1615]/65 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dossier-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl h-full bg-[#F9F8F7] text-[#201D1E] overflow-y-auto border-l border-[#E3DDDB] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Drawer Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 sm:px-8 py-5 bg-[#F9F8F7]/95 backdrop-blur-sm border-b border-[#E3DDDB]">
          <div className="min-w-0">
            <p className="text-xs text-[#6B6260] flex items-center gap-2 truncate">
              <span className="text-[#8E2420] font-medium">{project.category}</span>
              <span aria-hidden="true">·</span>
              <span>{project.location}</span>
            </p>
            <h2
              id="dossier-title"
              className="font-display text-2xl sm:text-3xl font-semibold text-[#201D1E] truncate"
            >
              {project.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close project dossier"
            className="w-10 h-10 inline-flex items-center justify-center border border-[#E3DDDB] text-[#201D1E] hover:bg-[#F2EFEF] rounded-sm shrink-0 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Photograph */}
        <div className="aspect-[16/10] w-full bg-[#EFEAE8] overflow-hidden shrink-0">
          <ResilientImage
            src={project.image}
            alt={`${project.name} — ${project.location}`}
            className={`w-full h-full object-cover ${project.imagePosition || 'object-center'}`}
          />
        </div>

        {/* Dossier Body */}
        <div className="px-6 sm:px-8 py-8 space-y-10 flex-1">
          <div className="space-y-4">
            {project.association && (
              <p className="text-xs font-medium text-[#E86A17]">{project.association}</p>
            )}
            <p className="text-base leading-relaxed text-[#3F3837]">{project.summary}</p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E3DDDB]">
              <div>
                <p className="text-xs text-[#6B6260]">Configuration</p>
                <p className="mt-1 font-mono text-sm font-medium tabular-nums text-[#201D1E]">
                  {project.highlightMetric}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#6B6260]">Inventory / Scale</p>
                <p className="mt-1 font-mono text-sm font-medium tabular-nums text-[#201D1E]">
                  {project.secondaryMetric}
                </p>
              </div>
            </div>
          </div>

          {/* 01. Project Overview */}
          <section className="space-y-3 pt-6 border-t border-[#E3DDDB]">
            <h3 className="font-display text-2xl font-semibold text-[#201D1E]">
              01. Project Overview
            </h3>
            <p className="text-sm sm:text-base leading-relaxed text-[#4F4847]">
              {project.overview}
            </p>
          </section>

          {/* 02. Key Specifications */}
          <section className="space-y-4 pt-6 border-t border-[#E3DDDB]">
            <h3 className="font-display text-2xl font-semibold text-[#201D1E]">
              02. Key Specifications
            </h3>
            <ul className="divide-y divide-[#EAE4E2] border-y border-[#EAE4E2]">
              {project.specifications.map((spec, idx) => (
                <li
                  key={spec}
                  className="py-3 flex items-baseline gap-4 text-sm text-[#2E2928]"
                >
                  <span className="font-mono text-xs tabular-nums text-[#8E2420] shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span>{spec}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 03. Prime Location & Connectivity */}
          <section className="space-y-5 pt-6 border-t border-[#E3DDDB]">
            <div>
              <h3 className="font-display text-2xl font-semibold text-[#201D1E]">
                03. Prime Location &amp; Connectivity
              </h3>
              <p className="mt-1 text-sm text-[#5C5452]">
                Strategically positioned in Hubballi–Dharwad with direct access to arterial corridors and civic hubs.
              </p>
            </div>

            <div className="p-5 bg-[#F2EFEF] border border-[#E3DDDB] rounded-sm space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-[#6B6260]">Official Site Address</p>
                  <p className="text-sm font-medium text-[#201D1E] leading-relaxed">
                    {project.address}
                  </p>
                </div>
                <MapPin className="w-4 h-4 text-[#8E2420] shrink-0 mt-1" aria-hidden="true" />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#201D1E] bg-white border border-[#D8D0CE] hover:border-[#8E2420] rounded-sm transition-colors whitespace-nowrap cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#8E2420]" />
                      <span>Address Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Address</span>
                    </>
                  )}
                </button>

                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#8E2420] hover:underline whitespace-nowrap"
                >
                  <span>View on Google Maps</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {project.transit.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[#6B6260] mb-3">
                  Transit &amp; Key Distances
                </p>
                <div className="divide-y divide-[#EAE4E2] border-y border-[#EAE4E2]">
                  {project.transit.map((item) => (
                    <div
                      key={`${item.landmark}-${item.time}`}
                      className="py-3 flex items-center justify-between gap-4 text-sm"
                    >
                      <span className="text-[#2E2928]">{item.landmark}</span>
                      <span className="font-mono text-xs font-medium tabular-nums text-[#8E2420] shrink-0">
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Sticky Footer Action Bar */}
        <div className="sticky bottom-0 px-6 sm:px-8 py-4 bg-[#F9F8F7] border-t border-[#E3DDDB] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <a
            href={COMPANY_INFO.phoneHref}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[#201D1E] border border-[#D8D0CE] hover:border-[#201D1E] rounded-sm transition-colors whitespace-nowrap"
          >
            <Phone className="w-4 h-4 text-[#8E2420]" />
            <span className="font-mono tabular-nums">{COMPANY_INFO.phoneDisplay}</span>
          </a>

          <button
            type="button"
            onClick={() => onBookSiteVisit(project.name)}
            className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white bg-[#8E2420] hover:bg-[#721B18] rounded-sm transition-colors whitespace-nowrap cursor-pointer"
          >
            Schedule Site Visit
          </button>
        </div>
      </div>
    </div>
  );
}
