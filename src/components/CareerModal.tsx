import { FormEvent, useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { CareerRole } from '../data/siteData';
import { submitEnquiry } from '../firebase';

interface CareerModalProps {
  role: CareerRole | null;
  onClose: () => void;
}

export function CareerModal({ role, onClose }: CareerModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [experience, setExperience] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!role) return;
    setName('');
    setPhone('');
    setEmail('');
    setExperience('');
    setNote('');
    setError('');
    setSubmitting(false);
    setSubmitted(false);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [role, onClose]);

  if (!role) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanedPhone = phone.replace(/[^\d+]/g, '');
    if (name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (cleanedPhone.length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await submitEnquiry({
        type: 'career',
        name,
        phone,
        email,
        projectOrRole: role.title,
        category: experience || role.department,
        message: note,
      });
      setSubmitted(true);
    } catch {
      setError('Could not save your application right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1B1615]/65 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="career-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#F9F8F7] border border-[#E3DDDB] rounded-sm text-[#201D1E]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 sm:px-8 py-5 bg-[#F9F8F7] border-b border-[#E3DDDB]">
          <div>
            <p className="text-xs text-[#6B6260]">
              Role {role.number} · {role.department} · Hubballi
            </p>
            <h2
              id="career-modal-title"
              className="font-display text-2xl sm:text-3xl font-semibold text-[#201D1E]"
            >
              Apply for {role.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close application modal"
            className="w-10 h-10 inline-flex items-center justify-center border border-[#E3DDDB] hover:bg-[#F2EFEF] rounded-sm cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {submitted ? (
            <div className="py-10 text-center space-y-4">
              <CheckCircle2 className="w-10 h-10 text-[#8E2420] mx-auto stroke-[1.5]" />
              <h3 className="font-display text-3xl font-semibold text-[#201D1E]">
                Application Saved
              </h3>
              <p className="text-sm text-[#4F4847] max-w-md mx-auto leading-relaxed">
                Thank you, {name}. Your application for the{' '}
                <span className="font-medium text-[#201D1E]">{role.title}</span> role has been
                stored in our Hubballi HR portal. We will contact you at {phone} or {email}.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-6 py-2.5 text-sm font-medium text-white bg-[#8E2420] hover:bg-[#721B18] rounded-sm cursor-pointer"
              >
                Return to Careers
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-[#E3DDDB]">
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-[#201D1E]">Key Responsibilities</h3>
                  <ul className="space-y-2 text-xs leading-relaxed text-[#4F4847]">
                    {role.responsibilities.map((item) => (
                      <li key={item} className="flex items-baseline gap-2">
                        <span className="text-[#8E2420]">—</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-[#201D1E]">Desired Requirements</h3>
                  <ul className="space-y-2 text-xs leading-relaxed text-[#4F4847]">
                    {role.requirements.map((item) => (
                      <li key={item} className="flex items-baseline gap-2">
                        <span className="text-[#8E2420]">—</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="career-name" className="block text-xs font-medium text-[#4F4847] mb-1.5">
                      Full Name
                    </label>
                    <input
                      id="career-name"
                      type="text"
                      required
                      maxLength={100}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8D0CE] rounded-sm focus:border-[#8E2420] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="career-phone" className="block text-xs font-medium text-[#4F4847] mb-1.5">
                      Phone Number
                    </label>
                    <input
                      id="career-phone"
                      type="tel"
                      required
                      maxLength={25}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98XXX XXXXX"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8D0CE] rounded-sm focus:border-[#8E2420] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="career-email" className="block text-xs font-medium text-[#4F4847] mb-1.5">
                      Email Address
                    </label>
                    <input
                      id="career-email"
                      type="email"
                      required
                      maxLength={120}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8D0CE] rounded-sm focus:border-[#8E2420] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="career-exp" className="block text-xs font-medium text-[#4F4847] mb-1.5">
                      Experience Level
                    </label>
                    <select
                      id="career-exp"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8D0CE] rounded-sm focus:border-[#8E2420] focus:outline-none"
                    >
                      <option value="">Select experience</option>
                      <option value="Fresher / Graduate">Fresher / Graduate</option>
                      <option value="1–2 Years">1–2 Years</option>
                      <option value="3–5 Years">3–5 Years</option>
                      <option value="5+ Years">5+ Years</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="career-note" className="block text-xs font-medium text-[#4F4847] mb-1.5">
                    Brief Summary of Experience
                  </label>
                  <textarea
                    id="career-note"
                    rows={3}
                    maxLength={1500}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Share your background, education, or notice period..."
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8D0CE] rounded-sm focus:border-[#8E2420] focus:outline-none"
                  />
                </div>

                {error && (
                  <p role="alert" className="text-xs font-medium text-[#8E2420]">
                    {error}
                  </p>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 text-sm font-medium text-[#5C5452] hover:text-[#201D1E] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 text-sm font-medium text-white bg-[#8E2420] hover:bg-[#721B18] disabled:opacity-60 rounded-sm transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {submitting ? 'Submitting…' : 'Submit Application'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
