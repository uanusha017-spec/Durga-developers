import { FormEvent, useEffect, useState } from 'react';
import { CheckCircle2, Phone, X } from 'lucide-react';
import { COMPANY_INFO, OngoingProject } from '../data/siteData';
import { submitEnquiry } from '../firebase';

interface SiteVisitModalProps {
  open: boolean;
  initialProject?: string;
  projects: OngoingProject[];
  onClose: () => void;
}

export function SiteVisitModal({
  open,
  initialProject = '',
  projects,
  onClose,
}: SiteVisitModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [project, setProject] = useState(initialProject);
  const [preferredDate, setPreferredDate] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setProject(initialProject);
    setError('');
    setSubmitting(false);
    setSubmitted(false);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, initialProject, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanedPhone = phone.replace(/[^\d+]/g, '');
    if (name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (cleanedPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await submitEnquiry({
        type: 'site_visit',
        name,
        phone,
        email,
        projectOrRole: project || 'General Site Visit',
        category: 'Guided Site Inspection',
        preferredDate,
        message: preferredDate ? `Preferred visit date: ${preferredDate}` : '',
      });
      setSubmitted(true);
    } catch {
      setError('Unable to save your site visit right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1B1615]/65 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="site-visit-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#F9F8F7] border border-[#E3DDDB] rounded-sm text-[#201D1E]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 px-6 sm:px-8 py-5 border-b border-[#E3DDDB]">
          <div>
            <p className="text-xs text-[#6B6260]">
              Hubballi Advisory Desk · {COMPANY_INFO.phoneDisplay}
            </p>
            <h2
              id="site-visit-title"
              className="font-display text-2xl sm:text-3xl font-semibold text-[#201D1E]"
            >
              Book a Guided Site Visit
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close site visit booking modal"
            className="w-10 h-10 inline-flex items-center justify-center border border-[#E3DDDB] hover:bg-[#F2EFEF] rounded-sm cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {submitted ? (
            <div className="py-6 text-center space-y-4">
              <CheckCircle2 className="w-10 h-10 text-[#8E2420] mx-auto stroke-[1.5]" />
              <h3 className="font-display text-3xl font-semibold text-[#201D1E]">
                Site Visit Confirmed
              </h3>
              <p className="text-sm text-[#4F4847] leading-relaxed">
                Thank you, {name}. Your booking has been saved permanently to our Hubballi sales
                desk. Our executive will call you on{' '}
                <span className="font-mono tabular-nums text-[#201D1E]">{phone}</span>
                {project ? ` regarding ${project}` : ''}.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-[#8E2420] hover:bg-[#721B18] rounded-sm cursor-pointer"
                >
                  Done
                </button>
                <a
                  href={COMPANY_INFO.phoneHref}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#201D1E] border border-[#D8D0CE] rounded-sm"
                >
                  <Phone className="w-4 h-4 text-[#8E2420]" />
                  <span>Call Directly</span>
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label htmlFor="visit-name" className="block text-xs font-medium text-[#4F4847] mb-1.5">
                  Full Name
                </label>
                <input
                  id="visit-name"
                  type="text"
                  required
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8D0CE] rounded-sm focus:border-[#8E2420] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="visit-phone" className="block text-xs font-medium text-[#4F4847] mb-1.5">
                    Mobile Number
                  </label>
                  <input
                    id="visit-phone"
                    type="tel"
                    required
                    maxLength={25}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 96063 41017"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8D0CE] rounded-sm focus:border-[#8E2420] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="visit-email" className="block text-xs font-medium text-[#4F4847] mb-1.5">
                    Email (Optional)
                  </label>
                  <input
                    id="visit-email"
                    type="email"
                    maxLength={120}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8D0CE] rounded-sm focus:border-[#8E2420] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="visit-project" className="block text-xs font-medium text-[#4F4847] mb-1.5">
                    Project of Interest
                  </label>
                  <select
                    id="visit-project"
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8D0CE] rounded-sm focus:border-[#8E2420] focus:outline-none"
                  >
                    <option value="">General Property Consultation</option>
                    {projects.map((item) => (
                      <option key={item.id} value={item.name}>
                        {item.name} ({item.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="visit-date" className="block text-xs font-medium text-[#4F4847] mb-1.5">
                    Preferred Visit Date
                  </label>
                  <input
                    id="visit-date"
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8D0CE] rounded-sm focus:border-[#8E2420] focus:outline-none"
                  />
                </div>
              </div>

              {error && (
                <p role="alert" className="text-xs font-medium text-[#8E2420]">
                  {error}
                </p>
              )}

              <div className="pt-3 flex items-center justify-between gap-4 border-t border-[#EAE4E2]">
                <span className="text-xs text-[#6B6260]">
                  Complimentary site tour &amp; legal docket walkthrough
                </span>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-[#8E2420] hover:bg-[#721B18] disabled:opacity-60 rounded-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {submitting ? 'Saving…' : 'Confirm Site Visit'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
