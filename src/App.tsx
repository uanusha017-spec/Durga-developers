import { FormEvent, useEffect, useMemo, useState } from 'react';
import { onSnapshot, orderBy, query } from 'firebase/firestore';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Mail,
  MapPin,
  Phone,
  Search,
} from 'lucide-react';
import {
  CAREER_ROLES,
  COMPANY_INFO,
  COMPLETED_PROJECTS,
  CareerRole,
  CompletedProject,
  FAQS,
  HERO_SLIDES,
  HONORS,
  IMAGES,
  JOURNAL_ARTICLES,
  JournalArticle,
  ONGOING_PROJECTS,
  OngoingProject,
  PROPERTY_JOURNEY,
  ProjectCategory,
  QUALITY_PILLARS,
  SERVICES,
  TESTIMONIALS,
} from './data/siteData';
import {
  OperationType,
  StoredProperty,
  collection,
  db,
  handleFirestoreError,
  submitEnquiry,
  submitSubscriber,
} from './firebase';
import { Navbar, PageId } from './components/Navbar';
import { BackgroundCarouselBanner } from './components/BackgroundCarouselBanner';
import { ResilientImage } from './components/ResilientImage';
import { ProjectDossierModal } from './components/ProjectDossierModal';
import { ArticleDrawer } from './components/ArticleDrawer';
import { CareerModal } from './components/CareerModal';
import { SiteVisitModal } from './components/SiteVisitModal';
import { AdminPanel } from './components/AdminPanel';

type OngoingFilter = 'All' | ProjectCategory;
type CompletedFilter = 'All' | 'Apartments' | 'Layouts';

function mapStoredToOngoing(item: StoredProperty): OngoingProject {
  const imageSrc = IMAGES[item.imageKey] || IMAGES.layouts;
  const transit = (item.transitHighlights || []).map((line) => {
    const parts = line.split('-').map((s) => s.trim());
    if (parts.length >= 2) {
      return { landmark: parts[0], time: parts.slice(1).join(' - ') };
    }
    return { landmark: line, time: 'Nearby' };
  });

  return {
    id: item.id,
    name: item.name,
    category: item.category,
    location: item.location,
    summary: item.summary,
    overview: item.overview,
    specifications: item.specifications,
    address: item.address,
    transit,
    highlightMetric: item.highlightMetric,
    secondaryMetric: item.secondaryMetric,
    image: imageSrc,
    imagePosition: item.imageKey === 'layouts' ? 'object-top' : 'object-center',
  };
}

export default function App() {
  // Multi-page navigation
  const [currentPage, setCurrentPage] = useState<PageId>('home');

  // Live Firestore-backed custom properties
  const [storedProperties, setStoredProperties] = useState<StoredProperty[]>([]);

  // Interactive Portfolio & Archive Filters
  const [ongoingFilter, setOngoingFilter] = useState<OngoingFilter>('All');
  const [projectSearch, setProjectSearch] = useState('');
  const [completedFilter, setCompletedFilter] = useState<CompletedFilter>('All');

  // Modals & Drawers
  const [activeProject, setActiveProject] = useState<OngoingProject | null>(null);
  const [activeArticle, setActiveArticle] = useState<JournalArticle | null>(null);
  const [activeRole, setActiveRole] = useState<CareerRole | null>(null);
  const [siteVisitOpen, setSiteVisitOpen] = useState(false);
  const [siteVisitProject, setSiteVisitProject] = useState('');

  // Testimonials Pagination (2 per view across 8 reviews = 4 pages)
  const [testimonialPage, setTestimonialPage] = useState(0);
  const totalTestimonialPages = Math.ceil(TESTIMONIALS.length / 2);

  // FAQ Accordion
  const [openFaqIndex, setOpenFaqIndex] = useState<number>(0);

  // Contact Inquiry Form (permanently persisted to Firestore)
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactInterest, setContactInterest] = useState('Residential Plots & Layouts');
  const [contactMessage, setContactMessage] = useState('');
  const [contactError, setContactError] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Newsletter Footer Form (permanently persisted to Firestore)
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<
    'idle' | 'submitting' | 'error' | 'success'
  >('idle');

  // Real-time public subscription to Admin-added properties in Firestore
  useEffect(() => {
    const q = query(collection(db, 'properties'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs: StoredProperty[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<StoredProperty, 'id'>),
        }));
        setStoredProperties(docs);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'properties');
      }
    );
    return () => unsub();
  }, []);

  const allOngoingProjects = useMemo(() => {
    const dbOngoing = storedProperties
      .filter((p) => p.status === 'Ongoing')
      .map(mapStoredToOngoing);
    return [...dbOngoing, ...ONGOING_PROJECTS];
  }, [storedProperties]);

  const allCompletedProjects = useMemo(() => {
    const dbCompleted: CompletedProject[] = storedProperties
      .filter((p) => p.status === 'Completed')
      .map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category === 'Apartments' ? 'Apartments' : 'Layouts',
        location: p.location,
      }));
    return [...dbCompleted, ...COMPLETED_PROJECTS];
  }, [storedProperties]);

  const navigateTo = (page: PageId) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredOngoing = useMemo(() => {
    const queryText = projectSearch.trim().toLowerCase();
    return allOngoingProjects.filter((proj) => {
      const matchesCategory = ongoingFilter === 'All' || proj.category === ongoingFilter;
      const matchesQuery =
        !queryText ||
        proj.name.toLowerCase().includes(queryText) ||
        proj.location.toLowerCase().includes(queryText) ||
        proj.summary.toLowerCase().includes(queryText);
      return matchesCategory && matchesQuery;
    });
  }, [allOngoingProjects, ongoingFilter, projectSearch]);

  const filteredCompleted = useMemo(() => {
    if (completedFilter === 'All') return allCompletedProjects;
    return allCompletedProjects.filter((proj) => proj.category === completedFilter);
  }, [allCompletedProjects, completedFilter]);

  const visibleTestimonials = TESTIMONIALS.slice(
    testimonialPage * 2,
    testimonialPage * 2 + 2
  );

  const openSiteVisitModal = (projectName = '') => {
    setActiveProject(null);
    setSiteVisitProject(projectName);
    setSiteVisitOpen(true);
  };

  const handleInspectProjectById = (projectId: string) => {
    const found = allOngoingProjects.find((p) => p.id === projectId);
    if (found) {
      setActiveProject(found);
    }
  };

  const handleSelectTypology = (category: ProjectCategory) => {
    setOngoingFilter(category);
    navigateTo('projects');
  };

  const handleContactSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanedPhone = contactPhone.replace(/[^\d+]/g, '');
    if (contactName.trim().length < 2) {
      setContactError('Please enter your full name.');
      return;
    }
    if (cleanedPhone.length < 10) {
      setContactError('Please enter a valid 10-digit phone number.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      setContactError('Please enter a valid email address.');
      return;
    }
    setContactError('');
    setContactSubmitting(true);
    try {
      await submitEnquiry({
        type: 'contact',
        name: contactName,
        phone: contactPhone,
        email: contactEmail,
        projectOrRole: contactInterest,
        category: contactInterest,
        message: contactMessage,
      });
      setContactSubmitted(true);
    } catch {
      setContactError('Unable to save your enquiry right now. Please try again.');
    } finally {
      setContactSubmitting(false);
    }
  };

  const handleNewsletterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail.trim())) {
      setNewsletterStatus('error');
      return;
    }
    setNewsletterStatus('submitting');
    try {
      await submitSubscriber(newsletterEmail);
      setNewsletterStatus('success');
      setNewsletterEmail('');
    } catch {
      setNewsletterStatus('error');
    }
  };

  const featuredArticle = JOURNAL_ARTICLES[0];
  const secondaryArticles = JOURNAL_ARTICLES.slice(1);

  const ongoingCounts = {
    All: allOngoingProjects.length,
    Apartments: allOngoingProjects.filter((p) => p.category === 'Apartments').length,
    Layouts: allOngoingProjects.filter((p) => p.category === 'Layouts').length,
    Commercial: allOngoingProjects.filter((p) => p.category === 'Commercial').length,
  };

  const completedCounts = {
    All: allCompletedProjects.length,
    Apartments: allCompletedProjects.filter((p) => p.category === 'Apartments').length,
    Layouts: allCompletedProjects.filter((p) => p.category === 'Layouts').length,
  };

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#F9F8F7] text-[#201D1E]">
      <Navbar
        currentPage={currentPage}
        onNavigate={navigateTo}
        onOpenSiteVisit={() => openSiteVisitModal('')}
      />

      <main className="flex-1">
        {/* =================================================================
            PAGE 1: HOME PAGE (FULL-BLEED HERO BACKGROUND CAROUSEL)
           ================================================================= */}
        {currentPage === 'home' && (
          <>
            <BackgroundCarouselBanner
              slides={HERO_SLIDES}
              initialSlideIndex={0}
              minHeightClass="min-h-[600px] lg:min-h-[660px]"
              onInspectProject={handleInspectProjectById}
            >
              <div className="max-w-[1320px] w-full mx-auto px-6 lg:px-10 py-16 lg:py-24">
                <div className="max-w-3xl space-y-7">
                  <p className="text-xs sm:text-sm font-medium tracking-wide text-[#F28C38]">
                    Hubballi, Karnataka · An ISO 9001:2015 Certified Company · Since 2012
                  </p>

                  <h1 className="font-display text-[clamp(2.65rem,4.8vw,4.35rem)] font-semibold leading-[1.04] tracking-[-0.01em] text-white">
                    {COMPANY_INFO.heroHeadline}
                  </h1>

                  <p className="text-base sm:text-lg leading-relaxed text-[#E6DFDD] max-w-2xl">
                    {COMPANY_INFO.heroSubheadline}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => navigateTo('projects')}
                      className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-medium text-white bg-[#8E2420] hover:bg-[#721B18] rounded-sm transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>Explore Ongoing Projects</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => openSiteVisitModal('')}
                      className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-medium text-white border border-white/35 hover:border-[#F28C38] bg-[#16100F]/45 rounded-sm transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Schedule Site Visit
                    </button>
                  </div>

                  <p className="text-xs text-[#D5CCC9] pt-4 border-t border-white/15">
                    We Build Your Dreams! · Approved Site Layout Plans ·{' '}
                    <a
                      href={COMPANY_INFO.phoneHref}
                      className="font-mono tabular-nums text-white hover:text-[#F28C38] transition-colors"
                    >
                      {COMPANY_INFO.phoneDisplay}
                    </a>
                  </p>
                </div>
              </div>
            </BackgroundCarouselBanner>

            {/* Full-Width 4-Column Proof Strip */}
            <section className="bg-white border-b border-[#E3DDDB]">
              <div className="max-w-[1320px] mx-auto px-6 lg:px-10 grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x divide-[#E3DDDB]">
                {COMPANY_INFO.metrics.map((metric) => (
                  <div key={metric.label} className="py-7 px-4 first:pl-0 lg:px-8 lg:first:pl-0">
                    <p className="font-mono text-2xl sm:text-3xl font-medium tabular-nums text-[#8E2420]">
                      {metric.value}
                    </p>
                    <p className="mt-1.5 text-sm font-semibold text-[#201D1E]">{metric.label}</p>
                    <p className="mt-0.5 text-xs text-[#6B6260]">{metric.detail}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Typology Showcase Triptych */}
            <section className="py-20 lg:py-26 border-b border-[#E3DDDB]">
              <div className="max-w-[1320px] mx-auto px-6 lg:px-10 space-y-14">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
                  <div className="lg:col-span-7 space-y-3">
                    <p className="text-xs font-medium text-[#8E2420]">
                      01. Active Developments Across Hubballi &amp; Dharwad
                    </p>
                    <h2 className="font-display text-4xl sm:text-5xl font-semibold text-[#201D1E] leading-[1.08]">
                      Crafted Spaces for Families, Landowners &amp; Enterprises
                    </h2>
                  </div>
                  <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4">
                    <p className="text-sm sm:text-base leading-relaxed text-[#5C5452]">
                      Explore {ongoingCounts.All} active developments spanning boutique apartments,
                      HDMC &amp; KHB/UDA approved residential layouts, and prime Shirur Park
                      commercial spaces.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigateTo('projects')}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8E2420] hover:text-[#721B18] cursor-pointer whitespace-nowrap"
                    >
                      <span>View Full Property Portfolio</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      index: '01',
                      category: 'Apartments' as ProjectCategory,
                      title: 'Premium Apartments',
                      count: `${ongoingCounts.Apartments} Ongoing Projects`,
                      caption:
                        'Low-density G+3 & G+4 residences with independent walls, natural ventilation, and Vastu planning across Vidya Nagar, Akshay Colony & Bengeri.',
                      image: IMAGES.apartments,
                      pos: 'object-center',
                    },
                    {
                      index: '02',
                      category: 'Layouts' as ProjectCategory,
                      title: 'Residential Layouts',
                      count: `${ongoingCounts.Layouts} Ongoing Layouts`,
                      caption:
                        'Title-verified 30×40, 30×50, and 9×15 residential plots with 30-ft asphalt roads, underground electricity, and drinking water across Gamangatti, Sattur & Gopanakoppa.',
                      image: IMAGES.layouts,
                      pos: 'object-top',
                    },
                    {
                      index: '03',
                      category: 'Commercial' as ProjectCategory,
                      title: 'Commercial Spaces',
                      count: `${ongoingCounts.Commercial} Flagship Complex`,
                      caption:
                        'High-visibility corporate offices and retail showrooms at Jhanvi Trinity Square in Shirur Park with dedicated parking and 100% common power backup.',
                      image: IMAGES.commercial,
                      pos: 'object-center',
                    },
                  ].map((item) => (
                    <button
                      key={item.category}
                      type="button"
                      onClick={() => handleSelectTypology(item.category)}
                      className="group text-left bg-white border border-[#E3DDDB] hover:border-[#8E2420] rounded-sm overflow-hidden transition-colors duration-200 flex flex-col cursor-pointer"
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden bg-[#EFEAE8]">
                        <ResilientImage
                          src={item.image}
                          alt={item.title}
                          className={`w-full h-full object-cover ${item.pos} group-hover:scale-[1.03] transition-transform duration-300`}
                        />
                      </div>
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <p className="text-xs text-[#6B6260] flex items-center gap-2">
                            <span className="font-mono tabular-nums text-[#E86A17] font-medium">
                              {item.index}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{item.count}</span>
                          </p>
                          <h3 className="font-display text-2xl font-semibold text-[#201D1E]">
                            {item.title}
                          </h3>
                          <p className="text-sm leading-relaxed text-[#5C5452]">{item.caption}</p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8E2420] group-hover:translate-x-0.5 transition-transform">
                          <span>Browse {item.category}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Featured / Newly Added Ongoing Developments Highlight */}
                <div className="pt-4 space-y-6">
                  <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#E3DDDB]">
                    <h3 className="font-display text-3xl font-semibold text-[#201D1E]">
                      Featured &amp; Latest Properties
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setOngoingFilter('All');
                        navigateTo('projects');
                      }}
                      className="text-xs font-semibold text-[#8E2420] hover:underline cursor-pointer whitespace-nowrap"
                    >
                      Explore All {ongoingCounts.All} Ongoing Projects →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allOngoingProjects.slice(0, 6).map((project, idx) => (
                      <article
                        key={project.id}
                        className="bg-white border border-[#E3DDDB] hover:border-[#8E2420] rounded-sm p-6 flex flex-col justify-between space-y-5 transition-colors"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2 text-xs text-[#6B6260]">
                            <span>
                              <span className="text-[#8E2420] font-medium">{project.category}</span>{' '}
                              · {project.location}
                            </span>
                            <span className="font-mono tabular-nums text-[#8F8482]">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                          </div>
                          <h4 className="font-display text-2xl font-semibold text-[#201D1E]">
                            {project.name}
                          </h4>
                          <p className="text-sm leading-relaxed text-[#5C5452]">
                            {project.summary}
                          </p>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-[#EFEAE8]">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono tabular-nums font-medium text-[#201D1E]">
                              {project.highlightMetric}
                            </span>
                            <span className="font-mono tabular-nums text-[#6B6260]">
                              {project.secondaryMetric}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => setActiveProject(project)}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8E2420] hover:text-[#721B18] cursor-pointer"
                            >
                              <span>Inspect Dossier</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openSiteVisitModal(project.name)}
                              className="text-xs font-medium text-[#5C5452] hover:text-[#201D1E] underline underline-offset-4 cursor-pointer"
                            >
                              Book Visit
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Services & 4-Step Property Journey */}
            <section className="py-20 lg:py-26 bg-[#F2EFEF] border-b border-[#E3DDDB]">
              <div className="max-w-[1320px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-16">
                <div className="lg:col-span-6 space-y-9">
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-[#8E2420]">
                      02. Expertise &amp; Solutions
                    </p>
                    <h2 className="font-display text-4xl sm:text-5xl font-semibold text-[#201D1E] leading-[1.08]">
                      Comprehensive Real Estate Services Tailored for You
                    </h2>
                  </div>

                  <div className="divide-y divide-[#DDD5D3] border-y border-[#DDD5D3]">
                    {SERVICES.map((service) => (
                      <div key={service.number} className="py-6 space-y-2">
                        <h3 className="font-display text-2xl font-semibold text-[#201D1E]">
                          <span className="font-mono text-sm font-normal text-[#E86A17] mr-3 tabular-nums">
                            {service.number}
                          </span>
                          {service.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-[#5C5452] pl-0 sm:pl-9">
                          {service.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-[#E3DDDB] rounded-sm">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-[#6B6260]">
                        Direct Sales Advisory Desk
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-[#201D1E]">
                        <a
                          href={COMPANY_INFO.phoneHref}
                          className="font-mono tabular-nums hover:text-[#8E2420]"
                        >
                          {COMPANY_INFO.phoneDisplay}
                        </a>
                        <span className="text-[#C2B8B6]" aria-hidden="true">
                          /
                        </span>
                        <a href={COMPANY_INFO.emailHref} className="hover:text-[#8E2420]">
                          {COMPANY_INFO.email}
                        </a>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => openSiteVisitModal('')}
                      className="px-5 py-2.5 text-xs font-medium text-white bg-[#8E2420] hover:bg-[#721B18] rounded-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Talk to Sales Executive
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-6 space-y-9">
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-[#8E2420]">
                      Property Journey · Ask · Explore · Verify · Own
                    </p>
                    <h2 className="font-display text-4xl sm:text-5xl font-semibold text-[#201D1E] leading-[1.08]">
                      Hassle-Free Ways to Own Your Dream Home
                    </h2>
                  </div>

                  <ol className="space-y-4">
                    {PROPERTY_JOURNEY.map((step) => (
                      <li
                        key={step.number}
                        className="p-6 bg-white border border-[#E3DDDB] rounded-sm flex items-start gap-5"
                      >
                        <span className="font-mono text-sm font-medium tabular-nums text-[#E86A17] pt-1 shrink-0">
                          {step.number}
                        </span>
                        <div className="space-y-1.5">
                          <div className="flex items-baseline gap-2.5">
                            <h3 className="font-display text-2xl font-semibold text-[#201D1E]">
                              {step.title}
                            </h3>
                            <span className="text-xs text-[#8A7F7D]">· {step.subtitle}</span>
                          </div>
                          <p className="text-sm leading-relaxed text-[#5C5452]">
                            {step.description}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </section>

            {/* Client Testimonials Showcase */}
            <section className="py-20 lg:py-26 bg-[#1B1615] text-[#F5F1F0] border-b border-[#332927]">
              <div className="max-w-[1320px] mx-auto px-6 lg:px-10 space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="space-y-3 max-w-2xl">
                    <p className="text-xs tracking-wide text-[#F28C38]">
                      03. Celebrating Our Happy Customers
                    </p>
                    <h2 className="font-display text-4xl sm:text-5xl font-semibold text-white leading-[1.08]">
                      What Homebuyers &amp; Investors Say Across Hubballi
                    </h2>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-xs tabular-nums text-[#B5AAA8] mr-2">
                      {String(testimonialPage + 1).padStart(2, '0')} /{' '}
                      {String(totalTestimonialPages).padStart(2, '0')}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setTestimonialPage((prev) =>
                          prev === 0 ? totalTestimonialPages - 1 : prev - 1
                        )
                      }
                      aria-label="Previous testimonials"
                      className="w-11 h-11 inline-flex items-center justify-center border border-[#443734] hover:border-[#F28C38] text-white rounded-sm transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setTestimonialPage((prev) =>
                          prev === totalTestimonialPages - 1 ? 0 : prev + 1
                        )
                      }
                      aria-label="Next testimonials"
                      className="w-11 h-11 inline-flex items-center justify-center border border-[#443734] hover:border-[#F28C38] text-white rounded-sm transition-colors cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {visibleTestimonials.map((item) => (
                    <blockquote
                      key={item.id}
                      className="p-8 bg-[#251E1D] border border-[#3A2F2D] rounded-sm flex flex-col justify-between space-y-8"
                    >
                      <div className="space-y-4">
                        <p className="text-xs text-[#F28C38]">
                          {item.theme} · Verified Homebuyer
                        </p>
                        <p className="font-display text-2xl sm:text-[1.65rem] leading-snug text-white">
                          “{item.quote}”
                        </p>
                      </div>
                      <footer className="pt-5 border-t border-[#3A2F2D] flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-white">{item.name}</p>
                          <p className="text-xs text-[#B5AAA8]">{item.location}</p>
                        </div>
                        <span className="font-mono text-xs tabular-nums text-[#F28C38]">
                          5.0 / 5.0
                        </span>
                      </footer>
                    </blockquote>
                  ))}
                </div>
              </div>
            </section>

            {/* Real Estate Knowledge Journal Preview */}
            <section className="py-20 lg:py-26 border-b border-[#E3DDDB]">
              <div className="max-w-[1320px] mx-auto px-6 lg:px-10 space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="space-y-3 max-w-2xl">
                    <p className="text-xs font-medium text-[#8E2420]">
                      04. Real Estate Knowledge &amp; Journal
                    </p>
                    <h2 className="font-display text-4xl sm:text-5xl font-semibold text-[#201D1E] leading-[1.08]">
                      Practical Architecture &amp; Property Buying Insights
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateTo('contact')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-white bg-[#8E2420] hover:bg-[#721B18] rounded-sm self-start md:self-auto cursor-pointer whitespace-nowrap"
                  >
                    <span>Speak With Property Advisor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                  <article className="lg:col-span-5 p-8 bg-[#F2EFEF] border border-[#E3DDDB] rounded-sm space-y-6">
                    <p className="text-xs text-[#6B6260]">
                      Featured Insight · {featuredArticle.category} · {featuredArticle.readTime}
                    </p>
                    <h3 className="font-display text-3xl font-semibold text-[#201D1E] leading-tight">
                      {featuredArticle.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[#4F4847]">
                      {featuredArticle.excerpt}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveArticle(featuredArticle)}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#8E2420] hover:text-[#721B18] cursor-pointer"
                    >
                      <span>Read Full Insight</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </article>

                  <div className="lg:col-span-7 divide-y divide-[#E3DDDB] border-y border-[#E3DDDB]">
                    {secondaryArticles.map((article) => (
                      <article
                        key={article.id}
                        className="py-5 flex flex-col sm:flex-row sm:items-start justify-between gap-5"
                      >
                        <div className="space-y-1.5 max-w-xl">
                          <p className="text-xs text-[#6B6260] flex items-center gap-2">
                            <span className="font-mono tabular-nums text-[#E86A17] font-medium">
                              {article.number}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{article.category}</span>
                            <span aria-hidden="true">·</span>
                            <span>{article.readTime}</span>
                          </p>
                          <h3 className="font-display text-2xl font-semibold text-[#201D1E] leading-snug">
                            {article.title}
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveArticle(article)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8E2420] hover:text-[#721B18] shrink-0 self-start sm:pt-1 cursor-pointer whitespace-nowrap"
                        >
                          <span>Read Article</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* =================================================================
            PAGE 2: PROJECTS PAGE (FULL-BLEED CAROUSEL BACKGROUND + LIVE DB)
           ================================================================= */}
        {currentPage === 'projects' && (
          <>
            <BackgroundCarouselBanner
              slides={HERO_SLIDES}
              initialSlideIndex={1}
              minHeightClass="min-h-[380px] lg:min-h-[430px]"
              onInspectProject={handleInspectProjectById}
            >
              <div className="max-w-[1320px] w-full mx-auto px-6 lg:px-10 py-14 lg:py-20">
                <div className="max-w-3xl space-y-5">
                  <p className="text-xs sm:text-sm font-medium text-[#F28C38]">
                    Ongoing &amp; Completed Portfolio · {ongoingCounts.All} Active ·{' '}
                    {completedCounts.All} Delivered
                  </p>
                  <h1 className="font-display text-[clamp(2.4rem,4.3vw,3.85rem)] font-semibold leading-[1.06] text-white">
                    We Plan &amp; Build Exceptional Real Estate Developments
                  </h1>
                  <p className="text-base text-[#E6DFDD] leading-relaxed max-w-2xl">
                    Browse all active residential layouts, boutique apartments, and commercial
                    developments across Vidya Nagar, Gamangatti, Gopanakoppa, Sattur, and Bengeri,
                    synchronized in real time with our database.
                  </p>
                </div>
              </div>
            </BackgroundCarouselBanner>

            {/* Interactive Ongoing Developments Directory */}
            <section className="py-16 lg:py-24 border-b border-[#E3DDDB]">
              <div className="max-w-[1320px] mx-auto px-6 lg:px-10 space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E3DDDB]">
                  <div
                    role="tablist"
                    aria-label="Filter ongoing projects by category"
                    className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#F2EFEF] border border-[#E3DDDB] rounded-sm self-start"
                  >
                    {(['All', 'Apartments', 'Layouts', 'Commercial'] as OngoingFilter[]).map(
                      (tab) => {
                        const isActive = ongoingFilter === tab;
                        return (
                          <button
                            key={tab}
                            role="tab"
                            type="button"
                            aria-selected={isActive}
                            onClick={() => setOngoingFilter(tab)}
                            className={`px-4 py-2 text-xs font-medium rounded-sm transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                              isActive
                                ? 'bg-[#8E2420] text-white'
                                : 'text-[#4F4847] hover:text-[#201D1E]'
                            }`}
                          >
                            {tab}{' '}
                            <span className="font-mono tabular-nums opacity-80">
                              ({ongoingCounts[tab]})
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>

                  <div className="relative w-full md:w-72">
                    <Search
                      className="w-4 h-4 text-[#7D7270] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                      placeholder="Search project or locality..."
                      aria-label="Search ongoing projects"
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#D8D0CE] rounded-sm placeholder:text-[#8F8482] focus:border-[#8E2420] focus:outline-none"
                    />
                  </div>
                </div>

                {filteredOngoing.length === 0 ? (
                  <div className="py-16 text-center border border-[#E3DDDB] bg-white rounded-sm space-y-3">
                    <p className="font-display text-2xl text-[#201D1E]">
                      No projects match “{projectSearch}”
                    </p>
                    <p className="text-sm text-[#5C5452]">
                      Try searching for Vidya Nagar, Gamangatti, Gopanakoppa, or Sattur.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setOngoingFilter('All');
                        setProjectSearch('');
                      }}
                      className="mt-2 px-4 py-2 text-xs font-medium text-[#8E2420] border border-[#8E2420] rounded-sm cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOngoing.map((project, idx) => (
                      <article
                        key={project.id}
                        className="bg-white border border-[#E3DDDB] hover:border-[#8E2420] rounded-sm overflow-hidden flex flex-col justify-between transition-colors duration-150"
                      >
                        <div>
                          <div className="aspect-[16/10] w-full bg-[#EFEAE8] overflow-hidden">
                            <ResilientImage
                              src={project.image}
                              alt={project.name}
                              className={`w-full h-full object-cover ${
                                project.imagePosition || 'object-center'
                              }`}
                            />
                          </div>
                          <div className="p-6 space-y-3">
                            <div className="flex items-center justify-between gap-2 text-xs text-[#6B6260]">
                              <span>
                                <span className="text-[#8E2420] font-medium">
                                  {project.category}
                                </span>{' '}
                                · {project.location}
                              </span>
                              <span className="font-mono tabular-nums text-[#8F8482] shrink-0">
                                {String(idx + 1).padStart(2, '0')}
                              </span>
                            </div>
                            <h2 className="font-display text-2xl font-semibold text-[#201D1E] leading-snug">
                              {project.name}
                            </h2>
                            <p className="text-sm leading-relaxed text-[#5C5452]">
                              {project.summary}
                            </p>
                          </div>
                        </div>

                        <div className="px-6 pb-6 pt-4 border-t border-[#EFEAE8] space-y-4">
                          <div className="flex items-center justify-between gap-3 text-xs">
                            <span className="font-mono tabular-nums font-medium text-[#201D1E]">
                              {project.highlightMetric}
                            </span>
                            <span className="font-mono tabular-nums text-[#6B6260]">
                              {project.secondaryMetric}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <button
                              type="button"
                              onClick={() => setActiveProject(project)}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8E2420] hover:text-[#721B18] cursor-pointer whitespace-nowrap"
                            >
                              <span>Inspect Dossier &amp; Specs</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openSiteVisitModal(project.name)}
                              className="text-xs font-medium text-[#5C5452] hover:text-[#201D1E] underline underline-offset-4 cursor-pointer whitespace-nowrap"
                            >
                              Book Visit
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Completed Landmarks Archive */}
            <section className="py-16 lg:py-24 bg-[#F2EFEF] border-b border-[#E3DDDB]">
              <div className="max-w-[1320px] mx-auto px-6 lg:px-10 space-y-12">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <p className="text-xs font-medium text-[#8E2420]">
                      Delivered Track Record · {completedCounts.All} Completed Landmarks
                    </p>
                    <h2 className="font-display text-4xl font-semibold text-[#201D1E]">
                      Completed Apartments &amp; Residential Layouts
                    </h2>
                  </div>

                  <div
                    role="tablist"
                    aria-label="Filter completed projects"
                    className="inline-flex items-center gap-1 p-1 bg-white border border-[#E3DDDB] rounded-sm self-start"
                  >
                    {(['All', 'Apartments', 'Layouts'] as CompletedFilter[]).map((tab) => {
                      const isActive = completedFilter === tab;
                      return (
                        <button
                          key={tab}
                          role="tab"
                          type="button"
                          aria-selected={isActive}
                          onClick={() => setCompletedFilter(tab)}
                          className={`px-4 py-2 text-xs font-medium rounded-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            isActive
                              ? 'bg-[#8E2420] text-white'
                              : 'text-[#4F4847] hover:text-[#201D1E]'
                          }`}
                        >
                          {tab}{' '}
                          <span className="font-mono tabular-nums opacity-80">
                            ({completedCounts[tab]})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white border border-[#E3DDDB] rounded-sm overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0">
                    {filteredCompleted.map((item, idx) => (
                      <div
                        key={item.id}
                        className={`p-6 flex items-start justify-between gap-4 border-b border-[#EDE8E6] ${
                          idx % 2 === 0 ? 'md:border-r' : ''
                        }`}
                      >
                        <div className="flex items-baseline gap-4 min-w-0">
                          <span className="font-mono text-xs tabular-nums text-[#8F8482] shrink-0">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <div className="space-y-1 min-w-0">
                            <h3 className="font-display text-2xl font-semibold text-[#201D1E]">
                              {item.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-[#5C5452] leading-relaxed">
                              {item.location}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-[#8E2420] whitespace-nowrap shrink-0 pt-1">
                          {item.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-4">
                  {QUALITY_PILLARS.map((pillar, idx) => (
                    <div key={pillar.title} className="space-y-2 pt-5 border-t border-[#D6CDCB]">
                      <p className="font-mono text-xs tabular-nums text-[#E86A17]">
                        {String(idx + 1).padStart(2, '0')}
                      </p>
                      <h3 className="font-display text-2xl font-semibold text-[#201D1E]">
                        {pillar.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-[#5C5452]">{pillar.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* =================================================================
            PAGE 3: ABOUT, LEADERSHIP, HONORS & CAREERS (CAROUSEL BACKGROUND)
           ================================================================= */}
        {currentPage === 'about' && (
          <>
            <BackgroundCarouselBanner
              slides={HERO_SLIDES}
              initialSlideIndex={2}
              minHeightClass="min-h-[380px] lg:min-h-[430px]"
              onInspectProject={handleInspectProjectById}
            >
              <div className="max-w-[1320px] w-full mx-auto px-6 lg:px-10 py-14 lg:py-20">
                <div className="max-w-3xl space-y-5">
                  <p className="text-xs sm:text-sm font-medium text-[#F28C38]">
                    About Shri Durga Developers · Leadership, Accolades &amp; Careers
                  </p>
                  <h1 className="font-display text-[clamp(2.4rem,4.3vw,3.85rem)] font-semibold leading-[1.06] text-white">
                    Building Trust. Creating Futures Across Karnataka &amp; Maharashtra.
                  </h1>
                  <p className="text-base text-[#E6DFDD] leading-relaxed max-w-2xl">
                    Over 15 years of architectural discipline, ISO 9001:2015 certified execution,
                    and more than 1,800 properties delivered under the visionary leadership of Shri
                    Veeresh N. Undi.
                  </p>
                </div>
              </div>
            </BackgroundCarouselBanner>

            {/* Founder & Studio Craftsmanship */}
            <section className="py-18 lg:py-24 border-b border-[#E3DDDB]">
              <div className="max-w-[1320px] mx-auto px-6 lg:px-10 space-y-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
                  <div className="lg:col-span-5 overflow-hidden rounded-sm border border-[#E3DDDB] min-h-[320px]">
                    <ResilientImage
                      src={IMAGES.studio}
                      alt="Shri Durga Developers architectural planning studio"
                      className="w-full h-full lg:h-full object-cover object-center"
                    />
                  </div>

                  <div className="lg:col-span-7 flex flex-col justify-between space-y-8 py-1">
                    <div className="space-y-4">
                      <p className="text-xs font-medium text-[#8E2420]">
                        Founder&apos;s Message · Leadership &amp; Governance
                      </p>
                      <h2 className="font-display text-4xl sm:text-5xl font-semibold text-[#201D1E] leading-[1.08]">
                        Building the Future of Real Estate
                      </h2>
                    </div>

                    <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#4F4847]">
                      <p>
                        <strong className="font-semibold text-[#201D1E]">
                          {COMPANY_INFO.founderName}
                        </strong>
                        , Managing Director of Shri Durga Group of Companies, is the Founder and
                        Promoter who has steered the company&apos;s consistent growth for over a
                        decade. Guided by a clear vision and people-centric leadership, he has
                        established the organization as a trusted real estate brand across Karnataka
                        and Maharashtra.
                      </p>
                      <p>
                        Under his leadership, the company has delivered Residential Apartments,
                        Commercial Spaces, and Planned Layouts recognized for superior construction
                        quality, thoughtful design, and keen attention to detail—driven by an
                        unwavering focus on Innovation, Uncompromising Quality, and On-time
                        Delivery.
                      </p>
                      <p>
                        Supported by qualified Architects, Engineers, and Dedicated Sales
                        Professionals, our commitment to execution discipline is reinforced by{' '}
                        <strong className="font-semibold text-[#201D1E]">
                          ISO 9001:2015 certification
                        </strong>
                        , awarded after international assessment of our quality management systems.
                      </p>
                    </div>

                    <div className="pt-5 border-t border-[#E3DDDB] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="font-display text-2xl font-semibold text-[#201D1E]">
                          {COMPANY_INFO.founderName}
                        </p>
                        <p className="text-xs text-[#6B6260]">{COMPANY_INFO.founderTitle}</p>
                      </div>
                      <p className="font-mono text-xs tabular-nums text-[#8E2420]">
                        ISO 9001:2015 Certified Practice
                      </p>
                    </div>
                  </div>
                </div>

                {/* Honors & Accolades */}
                <div className="space-y-8">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-[#8E2420]">Honors &amp; Accolades</p>
                    <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#201D1E]">
                      Recognized for Uncompromising Quality
                    </h2>
                  </div>

                  <div className="divide-y divide-[#E3DDDB] border-y border-[#E3DDDB]">
                    {HONORS.map((honor) => (
                      <div
                        key={honor.number}
                        className="py-7 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start"
                      >
                        <div className="lg:col-span-2 flex items-baseline gap-3">
                          <span className="font-mono text-xs tabular-nums text-[#8F8482]">
                            {honor.number}
                          </span>
                          <span className="font-mono text-sm font-medium tabular-nums text-[#8E2420]">
                            {honor.year}
                          </span>
                        </div>
                        <div className="lg:col-span-4 space-y-1">
                          <h3 className="font-display text-2xl font-semibold text-[#201D1E]">
                            {honor.title}
                          </h3>
                          <p className="text-xs text-[#6B6260]">{honor.organization}</p>
                        </div>
                        <div className="lg:col-span-6 space-y-1.5">
                          <p className="text-sm font-semibold text-[#201D1E]">
                            {honor.distinction}
                          </p>
                          <p className="text-sm leading-relaxed text-[#5C5452]">
                            {honor.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Careers Band (Connected to Firestore) */}
            <section className="py-18 lg:py-24 bg-[#F2EFEF] border-b border-[#E3DDDB]">
              <div className="max-w-[1320px] mx-auto px-6 lg:px-10 space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
                  <div className="lg:col-span-7 space-y-3">
                    <p className="text-xs font-medium text-[#8E2420]">
                      Career Opportunities · 3 Open Roles in Hubballi
                    </p>
                    <h2 className="font-display text-4xl sm:text-5xl font-semibold text-[#201D1E] leading-[1.08]">
                      Participate. Learn. Build a Life-Long Career.
                    </h2>
                  </div>
                  <div className="lg:col-span-5">
                    <p className="text-sm sm:text-base text-[#5C5452] leading-relaxed">
                      Join Hubballi&apos;s trusted real estate team with direct leadership
                      mentorship and career advancement. All applications are saved directly to our
                      Admin HR Portal.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {CAREER_ROLES.map((role) => (
                    <div
                      key={role.id}
                      className="bg-white border border-[#E3DDDB] rounded-sm p-7 flex flex-col justify-between space-y-6"
                    >
                      <div className="space-y-3">
                        <p className="text-xs text-[#6B6260] flex items-center gap-2">
                          <span className="font-mono tabular-nums text-[#E86A17] font-medium">
                            {role.number}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{role.department}</span>
                        </p>
                        <h3 className="font-display text-3xl font-semibold text-[#201D1E]">
                          {role.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-[#5C5452]">{role.summary}</p>
                      </div>

                      <div className="pt-4 border-t border-[#EFEAE8] flex items-center justify-between">
                        <span className="text-xs text-[#6B6260]">Vidyanagar, Hubballi</span>
                        <button
                          type="button"
                          onClick={() => setActiveRole(role)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8E2420] hover:text-[#721B18] cursor-pointer whitespace-nowrap"
                        >
                          <span>View &amp; Apply</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* =================================================================
            PAGE 4: CONTACT, OFFICES & FAQS (FULL-BLEED CAROUSEL BACKGROUND)
           ================================================================= */}
        {currentPage === 'contact' && (
          <>
            <BackgroundCarouselBanner
              slides={HERO_SLIDES}
              initialSlideIndex={3}
              minHeightClass="min-h-[380px] lg:min-h-[430px]"
              onInspectProject={handleInspectProjectById}
            >
              <div className="max-w-[1320px] w-full mx-auto px-6 lg:px-10 py-14 lg:py-20">
                <div className="max-w-3xl space-y-5">
                  <p className="text-xs sm:text-sm font-medium text-[#F28C38]">
                    Contact Shri Durga Developers · Hubballi &amp; Mumbai Offices
                  </p>
                  <h1 className="font-display text-[clamp(2.4rem,4.3vw,3.85rem)] font-semibold leading-[1.06] text-white">
                    Start Your Property Journey With Us Today
                  </h1>
                  <p className="text-base text-[#E6DFDD] leading-relaxed max-w-2xl">
                    Reach our Hubballi property advisory desk directly for approved site plans,
                    pricing schedules, legal document verification, and guided site tours.
                  </p>
                </div>
              </div>
            </BackgroundCarouselBanner>

            <section className="py-18 lg:py-24">
              <div className="max-w-[1320px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-16">
                {/* Left 6 Cols: FAQs + Offices */}
                <div className="lg:col-span-6 space-y-12">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-[#8E2420]">
                        Buyer Clarity · Frequently Asked Questions
                      </p>
                      <h2 className="font-display text-4xl font-semibold text-[#201D1E] leading-tight">
                        Everything You Need to Know Before Owning Property
                      </h2>
                    </div>

                    <div className="divide-y divide-[#E3DDDB] border-y border-[#E3DDDB]">
                      {FAQS.map((faq, idx) => {
                        const isOpen = openFaqIndex === idx;
                        return (
                          <div key={faq.question}>
                            <button
                              type="button"
                              onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                              aria-expanded={isOpen}
                              className="w-full py-4 flex items-center justify-between gap-4 text-left cursor-pointer group"
                            >
                              <span className="text-sm sm:text-base font-medium text-[#201D1E] group-hover:text-[#8E2420] transition-colors">
                                {faq.question}
                              </span>
                              <ChevronDown
                                className={`w-4 h-4 text-[#6B6260] shrink-0 transition-transform duration-200 ${
                                  isOpen ? 'rotate-180 text-[#8E2420]' : ''
                                }`}
                              />
                            </button>
                            {isOpen && (
                              <p className="pb-5 text-sm leading-relaxed text-[#5C5452]">
                                {faq.answer}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-5">
                    <h3 className="font-display text-2xl font-semibold text-[#201D1E]">
                      Our Offices
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {COMPANY_INFO.offices.map((office) => (
                        <div
                          key={office.label}
                          className="p-5 bg-[#F2EFEF] border border-[#E3DDDB] rounded-sm flex flex-col justify-between space-y-4"
                        >
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-[#8E2420]">{office.label}</p>
                            <p className="text-sm leading-relaxed text-[#3F3837]">
                              {office.address}
                            </p>
                          </div>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              office.mapQuery
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#201D1E] hover:text-[#8E2420]"
                          >
                            <MapPin className="w-3.5 h-3.5 text-[#8E2420]" />
                            <span>View on Google Maps</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right 6 Cols: Direct Contact Enquiry Form (Saves permanently to Firestore) */}
                <div className="lg:col-span-6">
                  <div className="p-8 sm:p-10 bg-white border border-[#E3DDDB] rounded-sm space-y-8">
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-[#8E2420]">Let&apos;s Talk</p>
                      <h2 className="font-display text-4xl font-semibold text-[#201D1E] leading-tight">
                        Send a Property Enquiry
                      </h2>
                      <p className="text-sm text-[#5C5452] leading-relaxed">
                        Every enquiry is saved directly to our sales database so our Hubballi
                        advisory team can respond promptly with approved plans and pricing.
                      </p>
                    </div>

                    {contactSubmitted ? (
                      <div className="py-10 px-6 bg-[#F2EFEF] border border-[#E3DDDB] rounded-sm text-center space-y-4">
                        <CheckCircle2 className="w-10 h-10 text-[#8E2420] mx-auto stroke-[1.5]" />
                        <h3 className="font-display text-3xl font-semibold text-[#201D1E]">
                          Enquiry Stored Successfully
                        </h3>
                        <p className="text-sm text-[#4F4847] leading-relaxed max-w-md mx-auto">
                          Thank you, {contactName}. Your enquiry regarding{' '}
                          <span className="font-medium text-[#201D1E]">{contactInterest}</span> has
                          been saved permanently in our system. Our sales executive will contact you
                          shortly.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setContactSubmitted(false);
                            setContactName('');
                            setContactPhone('');
                            setContactEmail('');
                            setContactMessage('');
                          }}
                          className="px-5 py-2.5 text-xs font-medium text-[#8E2420] border border-[#8E2420] rounded-sm cursor-pointer"
                        >
                          Submit Another Enquiry
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleContactSubmit} noValidate className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="contact-name"
                              className="block text-xs font-medium text-[#4F4847] mb-1.5"
                            >
                              Full Name
                            </label>
                            <input
                              id="contact-name"
                              type="text"
                              required
                              maxLength={100}
                              value={contactName}
                              onChange={(e) => setContactName(e.target.value)}
                              placeholder="Your full name"
                              className="w-full px-3.5 py-2.5 text-sm bg-[#F9F8F7] border border-[#D8D0CE] rounded-sm focus:bg-white focus:border-[#8E2420] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="contact-phone"
                              className="block text-xs font-medium text-[#4F4847] mb-1.5"
                            >
                              Mobile Number
                            </label>
                            <input
                              id="contact-phone"
                              type="tel"
                              required
                              maxLength={25}
                              value={contactPhone}
                              onChange={(e) => setContactPhone(e.target.value)}
                              placeholder="+91 96063 41017"
                              className="w-full px-3.5 py-2.5 text-sm bg-[#F9F8F7] border border-[#D8D0CE] rounded-sm focus:bg-white focus:border-[#8E2420] focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="contact-email"
                              className="block text-xs font-medium text-[#4F4847] mb-1.5"
                            >
                              Email Address
                            </label>
                            <input
                              id="contact-email"
                              type="email"
                              required
                              maxLength={120}
                              value={contactEmail}
                              onChange={(e) => setContactEmail(e.target.value)}
                              placeholder="you@example.com"
                              className="w-full px-3.5 py-2.5 text-sm bg-[#F9F8F7] border border-[#D8D0CE] rounded-sm focus:bg-white focus:border-[#8E2420] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="contact-interest"
                              className="block text-xs font-medium text-[#4F4847] mb-1.5"
                            >
                              Property Category
                            </label>
                            <select
                              id="contact-interest"
                              value={contactInterest}
                              onChange={(e) => setContactInterest(e.target.value)}
                              className="w-full px-3.5 py-2.5 text-sm bg-[#F9F8F7] border border-[#D8D0CE] rounded-sm focus:bg-white focus:border-[#8E2420] focus:outline-none"
                            >
                              <option value="Residential Plots & Layouts">
                                Residential Plots &amp; Layouts
                              </option>
                              <option value="Premium Apartments">Premium Apartments</option>
                              <option value="Commercial Spaces (Jhanvi Trinity Square)">
                                Commercial Spaces (Jhanvi Trinity Square)
                              </option>
                              <option value="Legal & Site Visit Consultation">
                                Legal &amp; Site Visit Consultation
                              </option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="contact-message"
                            className="block text-xs font-medium text-[#4F4847] mb-1.5"
                          >
                            Preferred Locality, Plot Size or Questions
                          </label>
                          <textarea
                            id="contact-message"
                            rows={4}
                            maxLength={1500}
                            value={contactMessage}
                            onChange={(e) => setContactMessage(e.target.value)}
                            placeholder="e.g., Looking for a 30×40 North-facing plot near Gamangatti or an apartment in Vidya Nagar..."
                            className="w-full px-3.5 py-2.5 text-sm bg-[#F9F8F7] border border-[#D8D0CE] rounded-sm focus:bg-white focus:border-[#8E2420] focus:outline-none"
                          />
                        </div>

                        {contactError && (
                          <p role="alert" className="text-xs font-medium text-[#8E2420]">
                            {contactError}
                          </p>
                        )}

                        <button
                          type="submit"
                          disabled={contactSubmitting}
                          className="w-full py-3.5 px-6 text-sm font-medium text-white bg-[#8E2420] hover:bg-[#721B18] disabled:opacity-60 rounded-sm transition-colors cursor-pointer"
                        >
                          {contactSubmitting
                            ? 'Saving Enquiry…'
                            : 'Request Property Consultation'}
                        </button>
                      </form>
                    )}

                    <div className="pt-6 border-t border-[#EFEAE8] grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <a
                        href={COMPANY_INFO.phoneHref}
                        className="flex items-center gap-3 text-[#201D1E] hover:text-[#8E2420] transition-colors"
                      >
                        <Phone className="w-4 h-4 text-[#8E2420] shrink-0" />
                        <span className="font-mono tabular-nums">
                          {COMPANY_INFO.phoneDisplay}
                        </span>
                      </a>
                      <a
                        href={COMPANY_INFO.emailHref}
                        className="flex items-center gap-3 text-[#201D1E] hover:text-[#8E2420] transition-colors"
                      >
                        <Mail className="w-4 h-4 text-[#8E2420] shrink-0" />
                        <span className="truncate">{COMPANY_INFO.email}</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* =================================================================
            PAGE 5: ADMIN PANEL (PERMANENT FIRESTORE DATABASE CONSOLE)
           ================================================================= */}
        {currentPage === 'admin' && (
          <AdminPanel onBackToSite={() => navigateTo('home')} />
        )}
      </main>

      {/* =================================================================
          QUIET ARCHITECTURAL FOOTER (MATCHED TO OFFICIAL LOGO)
         ================================================================= */}
      {currentPage !== 'admin' && (
        <footer className="bg-[#1B1615] text-[#D8CFCB] border-t border-[#332927]">
          <div className="max-w-[1320px] mx-auto px-6 lg:px-10 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
            {/* Official Logo Badge on Clean White Plate */}
            <div className="lg:col-span-4 space-y-4">
              <div className="inline-block bg-white px-4 py-2.5 rounded-sm">
                <img
                  src={IMAGES.logo}
                  alt="Shri Durga Developers & Promoters"
                  className="h-11 w-auto object-contain"
                />
              </div>
              <p className="font-display italic text-lg text-[#F28C38]">{COMPANY_INFO.tagline}</p>
              <p className="text-xs leading-relaxed text-[#B5AAA8] max-w-xs">
                Shri Durga Developers &amp; Promoters — An ISO 9001:2015 certified real estate firm
                delivering title-verified layouts, apartments, and commercial spaces in Hubballi.
              </p>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-semibold text-white">Navigation</h3>
              <ul className="space-y-2.5 text-sm">
                {(
                  [
                    { label: 'Home', page: 'home' },
                    { label: 'Projects Portfolio', page: 'projects' },
                    { label: 'About & Careers', page: 'about' },
                    { label: 'Contact & FAQs', page: 'contact' },
                    { label: 'Admin Console', page: 'admin' },
                  ] as { label: string; page: PageId }[]
                ).map((link) => (
                  <li key={link.page}>
                    <button
                      type="button"
                      onClick={() => navigateTo(link.page)}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="lg:col-span-3 space-y-4">
              <h3 className="text-xs font-semibold text-white">Head Office</h3>
              <p className="text-sm leading-relaxed text-[#B5AAA8]">
                #No 2A Upper Ground Floor, Gurudev Landmark, Near More Bazar, Vidyanagar, Hubballi,
                Karnataka – 580021
              </p>
              <div className="space-y-1.5 text-sm">
                <p>
                  <a
                    href={COMPANY_INFO.phoneHref}
                    className="font-mono tabular-nums text-white hover:text-[#F28C38] transition-colors"
                  >
                    {COMPANY_INFO.phoneDisplay}
                  </a>
                </p>
                <p>
                  <a
                    href={COMPANY_INFO.emailHref}
                    className="text-[#D8CFCB] hover:text-white transition-colors"
                  >
                    {COMPANY_INFO.email}
                  </a>
                </p>
              </div>
            </div>

            {/* Stay Updated Newsletter (Saved Permanently to Firestore) */}
            <div className="lg:col-span-3 space-y-4">
              <h3 className="text-xs font-semibold text-white">Stay Updated</h3>
              <p className="text-xs leading-relaxed text-[#B5AAA8]">
                Receive updates on new Hubballi layout launches, approved site plans, and real
                estate insights.
              </p>
              <form onSubmit={handleNewsletterSubmit} noValidate className="space-y-2.5">
                <div className="flex gap-2">
                  <input
                    type="email"
                    maxLength={120}
                    value={newsletterEmail}
                    onChange={(e) => {
                      setNewsletterEmail(e.target.value);
                      if (newsletterStatus !== 'idle') setNewsletterStatus('idle');
                    }}
                    placeholder="Email address"
                    aria-label="Email address for project updates"
                    className="w-full px-3 py-2 text-xs bg-[#251E1D] border border-[#443734] text-white placeholder:text-[#968A88] rounded-sm focus:border-[#F28C38] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={newsletterStatus === 'submitting'}
                    className="px-4 py-2 text-xs font-medium text-white bg-[#8E2420] hover:bg-[#721B18] disabled:opacity-60 rounded-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Subscribe
                  </button>
                </div>
                {newsletterStatus === 'error' && (
                  <p role="alert" className="text-xs text-[#FCA5A5]">
                    Please enter a valid email address.
                  </p>
                )}
                {newsletterStatus === 'success' && (
                  <p role="status" className="text-xs text-[#86EFAC]">
                    Subscribed and saved to Shri Durga Developers updates.
                  </p>
                )}
              </form>
            </div>
          </div>

          <div className="border-t border-[#332927]">
            <div className="max-w-[1320px] mx-auto px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#968A88]">
              <p>
                © {new Date().getFullYear()} Shri Durga Developers &amp; Promoters. All rights
                reserved.
              </p>
              <p>Vidyanagar, Hubballi · Mumbai Corporate Office · Approved Site Layout Plans</p>
            </div>
          </div>
        </footer>
      )}

      {/* Interactive Drawers & Modals */}
      <ProjectDossierModal
        project={activeProject}
        onClose={() => setActiveProject(null)}
        onBookSiteVisit={(projectName) => openSiteVisitModal(projectName)}
      />

      <ArticleDrawer
        article={activeArticle}
        onClose={() => setActiveArticle(null)}
        onBookConsultation={() => openSiteVisitModal('')}
      />

      <CareerModal role={activeRole} onClose={() => setActiveRole(null)} />

      <SiteVisitModal
        open={siteVisitOpen}
        initialProject={siteVisitProject}
        projects={allOngoingProjects}
        onClose={() => setSiteVisitOpen(false)}
      />
    </div>
  );
}
