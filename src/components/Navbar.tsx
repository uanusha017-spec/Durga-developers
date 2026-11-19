import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { COMPANY_INFO, IMAGES } from '../data/siteData';

export type PageId = 'home' | 'projects' | 'about' | 'contact' | 'admin';

interface NavbarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenSiteVisit: () => void;
}

const NAV_LINKS: { id: PageId; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'projects', label: 'Projects' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
  { id: 'admin', label: 'Admin' },
];

export function Navbar({ currentPage, onNavigate, onOpenSiteVisit }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (page: PageId) => {
    setMobileOpen(false);
    onNavigate(page);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E3DDDB]">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Official Shri Durga Developers Logo */}
        <button
          type="button"
          onClick={() => handleNavClick('home')}
          aria-label={COMPANY_INFO.name}
          className="inline-flex items-center shrink-0 cursor-pointer focus-visible:outline-[#8E2420]"
        >
          <img
            src={IMAGES.logo}
            alt="Shri Durga Developers & Promoters"
            className="h-12 sm:h-13 w-auto object-contain"
          />
        </button>

        {/* Zone 2: 5 Concise Single-Line Page Navigation Links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#4F4847]"
        >
          {NAV_LINKS.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-[#8E2420] after:origin-left after:transition-transform after:duration-200 ${
                  isActive
                    ? 'text-[#8E2420] font-semibold after:scale-x-100'
                    : 'hover:text-[#201D1E] after:scale-x-0 hover:after:scale-x-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenSiteVisit}
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-[#8E2420] hover:bg-[#721B18] rounded-sm transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Book Site Visit
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 text-[#201D1E] border border-[#E3DDDB] rounded-sm cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E3DDDB] bg-white px-6 py-5">
          <nav aria-label="Mobile Navigation" className="flex flex-col gap-2">
            {NAV_LINKS.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`py-2.5 text-left text-base font-medium border-b border-[#EFEAE8] last:border-b-0 cursor-pointer ${
                    isActive ? 'text-[#8E2420] font-semibold' : 'text-[#201D1E]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenSiteVisit();
              }}
              className="mt-3 w-full py-3 px-5 text-sm font-medium text-white bg-[#8E2420] hover:bg-[#721B18] rounded-sm transition-colors cursor-pointer"
            >
              Book Site Visit
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
