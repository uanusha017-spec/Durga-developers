import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, onSnapshot, orderBy, query } from 'firebase/firestore';
import {
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Inbox,
  Lock,
  LogOut,
  Mail,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import {
  BOOTSTRAPPED_ADMIN_EMAIL,
  EnquiryStatus,
  EnquiryType,
  OperationType,
  PropertyFormInput,
  PropertyImageKey,
  PropertyStatus,
  StoredEnquiry,
  StoredProperty,
  StoredSubscriber,
  auth,
  collection,
  createPropertyRecord,
  db,
  googleProvider,
  handleFirestoreError,
  removeEnquiry,
  removePropertyRecord,
  removeSubscriber,
  updateEnquiryAdmin,
  updatePropertyRecord,
} from '../firebase';
import { IMAGES, ProjectCategory } from '../data/siteData';
import { ResilientImage } from './ResilientImage';

interface AdminPanelProps {
  onBackToSite: () => void;
}

type AdminTab = 'enquiries' | 'properties' | 'subscribers';

const IMAGE_OPTIONS: { key: PropertyImageKey; label: string; src: string }[] = [
  { key: 'heroTwilightApartments', label: 'Twilight Luxury Apartments', src: IMAGES.heroTwilightApartments },
  { key: 'heroPlottedAvenue', label: 'Planned Plotted Layout Avenue', src: IMAGES.heroPlottedAvenue },
  { key: 'heroCommercialPlaza', label: 'Modern Commercial Complex', src: IMAGES.heroCommercialPlaza },
  { key: 'hero', label: 'Courtyard Residence View', src: IMAGES.hero },
  { key: 'apartments', label: 'Daylight Boutique Apartment', src: IMAGES.apartments },
  { key: 'layouts', label: 'Aerial Township Plots', src: IMAGES.layouts },
  { key: 'commercial', label: 'Dusk Retail & Office Hub', src: IMAGES.commercial },
];

const EMPTY_PROPERTY_FORM: PropertyFormInput = {
  name: '',
  category: 'Layouts',
  status: 'Ongoing',
  location: '',
  highlightMetric: '30 Ft Wide Roads',
  secondaryMetric: '30×40 & 30×50 Sq Ft',
  summary: '',
  overview: '',
  address: '',
  specifications: [
    '30 Feet Wide Internal Roads',
    '100% Vastu Compliant Planning',
    'Drinking Water + Borewell',
    'Underground Electricity',
  ],
  transitHighlights: ['Hubballi Airport - 10 Mins', 'Vidya Nagar Hub - 8 Mins'],
  imageKey: 'heroPlottedAvenue',
};

function formatDate(ts?: { toDate?: () => Date } | null): string {
  if (!ts || typeof ts.toDate !== 'function') return 'Just now';
  try {
    return ts.toDate().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function enquiryTypeLabel(type: EnquiryType): string {
  if (type === 'site_visit') return 'Site Visit';
  if (type === 'career') return 'Career';
  return 'Contact';
}

function statusTextColor(status: EnquiryStatus): string {
  switch (status) {
    case 'new':
      return 'text-[#8E2420] font-semibold';
    case 'contacted':
      return 'text-[#B45309] font-medium';
    case 'scheduled':
      return 'text-[#166534] font-medium';
    case 'closed':
      return 'text-[#6B6260]';
  }
}

export function AdminPanel({ onBackToSite }: AdminPanelProps) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authCheckingRole, setAuthCheckingRole] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authInfo, setAuthInfo] = useState('');

  // Username/Email & Password Login State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submittingAuth, setSubmittingAuth] = useState(false);
  const [verifyingSession, setVerifyingSession] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('enquiries');

  // Live Firestore collections
  const [enquiries, setEnquiries] = useState<StoredEnquiry[]>([]);
  const [properties, setProperties] = useState<StoredProperty[]>([]);
  const [subscribers, setSubscribers] = useState<StoredSubscriber[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Enquiry filtering & drawer
  const [enquiryTypeFilter, setEnquiryTypeFilter] = useState<'all' | EnquiryType>('all');
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState<'all' | EnquiryStatus>('all');
  const [enquirySearch, setEnquirySearch] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState<StoredEnquiry | null>(null);
  const [editEnquiryStatus, setEditEnquiryStatus] = useState<EnquiryStatus>('new');
  const [editEnquiryNotes, setEditEnquiryNotes] = useState('');
  const [savingEnquiry, setSavingEnquiry] = useState(false);
  const [enquiryToast, setEnquiryToast] = useState('');

  // Property Add / Edit Form
  const [propertyFormOpen, setPropertyFormOpen] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [propForm, setPropForm] = useState<PropertyFormInput>(EMPTY_PROPERTY_FORM);
  const [specsText, setSpecsText] = useState(EMPTY_PROPERTY_FORM.specifications.join('\n'));
  const [transitText, setTransitText] = useState(EMPTY_PROPERTY_FORM.transitHighlights.join('\n'));
  const [propFormError, setPropFormError] = useState('');
  const [savingProperty, setSavingProperty] = useState(false);
  const [propertyToast, setPropertyToast] = useState('');

  // Auth listener + RBAC check
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthError('');
      if (!currentUser) {
        setIsAdmin(false);
        setAuthReady(true);
        return;
      }

      setAuthCheckingRole(true);
      try {
        if (
          currentUser.emailVerified &&
          currentUser.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()
        ) {
          setIsAdmin(true);
        } else if (currentUser.emailVerified) {
          const adminSnap = await getDoc(doc(db, 'admins', currentUser.uid));
          setIsAdmin(adminSnap.exists());
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      } finally {
        setAuthCheckingRole(false);
        setAuthReady(true);
      }
    });
    return () => unsub();
  }, []);

  // Attach real-time Firestore listeners ONLY when verified admin is authenticated
  useEffect(() => {
    if (!authReady || !user || !isAdmin) {
      setEnquiries([]);
      setProperties([]);
      setSubscribers([]);
      setLoadingData(false);
      return;
    }

    setLoadingData(true);

    const unsubEnquiries = onSnapshot(
      query(collection(db, 'enquiries'), orderBy('createdAt', 'desc')),
      (snap) => {
        const items: StoredEnquiry[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<StoredEnquiry, 'id'>),
        }));
        setEnquiries(items);
        setLoadingData(false);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'enquiries')
    );

    const unsubProperties = onSnapshot(
      query(collection(db, 'properties'), orderBy('createdAt', 'desc')),
      (snap) => {
        const items: StoredProperty[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<StoredProperty, 'id'>),
        }));
        setProperties(items);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'properties')
    );

    const unsubSubscribers = onSnapshot(
      query(collection(db, 'subscribers'), orderBy('createdAt', 'desc')),
      (snap) => {
        const items: StoredSubscriber[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<StoredSubscriber, 'id'>),
        }));
        setSubscribers(items);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'subscribers')
    );

    return () => {
      unsubEnquiries();
      unsubProperties();
      unsubSubscribers();
    };
  }, [authReady, user, isAdmin]);

  const resolveAdminEmail = (rawInput: string): string => {
    const cleaned = rawInput.trim().toLowerCase();
    if (cleaned === 'admin' || cleaned === 'shridurga' || cleaned === 'shridurga_admin') {
      return BOOTSTRAPPED_ADMIN_EMAIL;
    }
    return cleaned;
  };

  const formatAuthError = (err: unknown): string => {
    const code = (err as { code?: string })?.code || '';
    switch (code) {
      case 'auth/operation-not-allowed':
        return 'Email/Password sign-in is not yet enabled in Firebase Console. Enable "Email/Password" under Authentication -> Sign-in method, or sign in with Google below.';
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Invalid username or password. Check your credentials or use "Set Up Password" if this is your first login.';
      case 'auth/invalid-email':
        return 'Please enter the admin username ("admin") or a valid email address.';
      case 'auth/email-already-in-use':
        return 'An account for this email already exists. Switch to "Sign In" or use "Forgot Password?".';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters long.';
      case 'auth/too-many-requests':
        return 'Too many login attempts. Please wait a moment and try again.';
      default:
        return err instanceof Error ? err.message : 'Unable to complete sign-in.';
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthInfo('');

    const resolvedEmail = resolveAdminEmail(loginUsername);
    if (!resolvedEmail) {
      setAuthError('Please enter your admin username or email.');
      return;
    }
    if (loginPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    setSubmittingAuth(true);
    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, resolvedEmail, loginPassword);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, resolvedEmail, loginPassword);
        try {
          await sendEmailVerification(cred.user);
          setAuthInfo(
            `Admin password created for ${resolvedEmail}. A verification email has been sent—please verify your inbox to unlock database access.`
          );
        } catch {
          setAuthInfo(`Account created for ${resolvedEmail}. Please verify your email address.`);
        }
      }
      setLoginPassword('');
    } catch (err) {
      setAuthError(formatAuthError(err));
    } finally {
      setSubmittingAuth(false);
    }
  };

  const handlePasswordReset = async () => {
    setAuthError('');
    setAuthInfo('');
    const resolvedEmail = resolveAdminEmail(loginUsername || 'admin');
    if (!resolvedEmail.includes('@')) {
      setAuthError('Enter your admin username ("admin") or email address first.');
      return;
    }
    setSubmittingAuth(true);
    try {
      await sendPasswordResetEmail(auth, resolvedEmail);
      setAuthInfo(`Password reset link sent to ${resolvedEmail}. Check your inbox.`);
    } catch (err) {
      setAuthError(formatAuthError(err));
    } finally {
      setSubmittingAuth(false);
    }
  };

  const handleResendVerification = async () => {
    if (!auth.currentUser) return;
    setAuthError('');
    setAuthInfo('');
    setVerifyingSession(true);
    try {
      await sendEmailVerification(auth.currentUser);
      setAuthInfo(`Verification email sent to ${auth.currentUser.email}.`);
    } catch (err) {
      setAuthError(formatAuthError(err));
    } finally {
      setVerifyingSession(false);
    }
  };

  const handleRefreshVerification = async () => {
    if (!auth.currentUser) return;
    setAuthError('');
    setAuthInfo('');
    setVerifyingSession(true);
    try {
      await auth.currentUser.reload();
      await auth.currentUser.getIdToken(true);
      const refreshed = auth.currentUser;
      setUser(refreshed);
      if (refreshed.emailVerified) {
        if (refreshed.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()) {
          setIsAdmin(true);
        } else {
          const adminSnap = await getDoc(doc(db, 'admins', refreshed.uid));
          setIsAdmin(adminSnap.exists());
        }
      } else {
        setAuthError('Email is still not verified. Please click the verification link in your inbox first.');
      }
    } catch (err) {
      setAuthError(formatAuthError(err));
    } finally {
      setVerifyingSession(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    setAuthInfo('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to sign in with Google.';
      if (!msg.includes('popup-closed-by-user')) {
        setAuthError(msg);
      }
    }
  };

  const handleSignOut = async () => {
    setAuthError('');
    setAuthInfo('');
    await signOut(auth);
  };

  const filteredEnquiries = useMemo(() => {
    const q = enquirySearch.trim().toLowerCase();
    return enquiries.filter((item) => {
      const matchesType = enquiryTypeFilter === 'all' || item.type === enquiryTypeFilter;
      const matchesStatus = enquiryStatusFilter === 'all' || item.status === enquiryStatusFilter;
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.projectOrRole.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q);
      return matchesType && matchesStatus && matchesQuery;
    });
  }, [enquiries, enquiryTypeFilter, enquiryStatusFilter, enquirySearch]);

  const openEnquiryDetail = (item: StoredEnquiry) => {
    setSelectedEnquiry(item);
    setEditEnquiryStatus(item.status);
    setEditEnquiryNotes(item.adminNotes || '');
    setEnquiryToast('');
  };

  const handleSaveEnquiryUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry) return;
    setSavingEnquiry(true);
    try {
      await updateEnquiryAdmin(selectedEnquiry.id, editEnquiryStatus, editEnquiryNotes);
      setSelectedEnquiry({
        ...selectedEnquiry,
        status: editEnquiryStatus,
        adminNotes: editEnquiryNotes,
      });
      setEnquiryToast('Enquiry status and notes saved to database.');
    } finally {
      setSavingEnquiry(false);
    }
  };

  const handleDeleteEnquiry = async (id: string) => {
    await removeEnquiry(id);
    if (selectedEnquiry?.id === id) {
      setSelectedEnquiry(null);
    }
  };

  const openAddPropertyForm = () => {
    setEditingPropertyId(null);
    setPropForm(EMPTY_PROPERTY_FORM);
    setSpecsText(EMPTY_PROPERTY_FORM.specifications.join('\n'));
    setTransitText(EMPTY_PROPERTY_FORM.transitHighlights.join('\n'));
    setPropFormError('');
    setPropertyFormOpen(true);
  };

  const openEditPropertyForm = (item: StoredProperty) => {
    setEditingPropertyId(item.id);
    setPropForm({
      name: item.name,
      category: item.category,
      status: item.status,
      location: item.location,
      highlightMetric: item.highlightMetric,
      secondaryMetric: item.secondaryMetric,
      summary: item.summary,
      overview: item.overview,
      address: item.address,
      specifications: item.specifications,
      transitHighlights: item.transitHighlights,
      imageKey: item.imageKey,
    });
    setSpecsText(item.specifications.join('\n'));
    setTransitText(item.transitHighlights.join('\n'));
    setPropFormError('');
    setPropertyFormOpen(true);
  };

  const handleSaveProperty = async (e: FormEvent) => {
    e.preventDefault();
    if (propForm.name.trim().length < 2) {
      setPropFormError('Property name must be at least 2 characters.');
      return;
    }
    if (propForm.location.trim().length < 2) {
      setPropFormError('Please enter the Hubballi/Dharwad locality.');
      return;
    }
    if (propForm.summary.trim().length < 10) {
      setPropFormError('Short summary must be at least 10 characters.');
      return;
    }
    if (propForm.overview.trim().length < 10) {
      setPropFormError('Architectural overview must be at least 10 characters.');
      return;
    }
    if (propForm.address.trim().length < 5) {
      setPropFormError('Please provide the official site address.');
      return;
    }

    const parsedSpecs = specsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 12);
    const parsedTransit = transitText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 8);

    if (parsedSpecs.length === 0) {
      setPropFormError('Please include at least one key specification.');
      return;
    }

    setPropFormError('');
    setSavingProperty(true);

    const payload: PropertyFormInput = {
      ...propForm,
      specifications: parsedSpecs,
      transitHighlights: parsedTransit,
    };

    try {
      if (editingPropertyId) {
        await updatePropertyRecord(editingPropertyId, payload);
        setPropertyToast(`Updated "${payload.name}" in live database.`);
      } else {
        await createPropertyRecord(payload);
        setPropertyToast(`Published "${payload.name}" permanently to live database.`);
      }
      setPropertyFormOpen(false);
    } finally {
      setSavingProperty(false);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    await removePropertyRecord(id);
    setPropertyToast('Property removed from database.');
  };

  // Loading auth state
  if (!authReady || authCheckingRole) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-[#F9F8F7] px-6 py-20">
        <div className="text-center space-y-3">
          <p className="font-mono text-xs text-[#8E2420]">Verifying Admin Session</p>
          <p className="font-display text-2xl text-[#201D1E]">Connecting to Cloud Database…</p>
        </div>
      </div>
    );
  }

  // Unauthenticated Username & Password + Google Login Page
  if (!user) {
    return (
      <div className="min-h-[82vh] flex items-center justify-center bg-[#F9F8F7] px-6 py-14">
        <div className="max-w-md w-full bg-white border border-[#E3DDDB] rounded-sm p-8 sm:p-10 space-y-6">
          <div className="space-y-4">
            <img
              src={IMAGES.logo}
              alt="Shri Durga Developers & Promoters"
              className="h-14 w-auto object-contain"
            />
            <div className="pt-1 space-y-1.5">
              <p className="text-xs font-medium text-[#8E2420]">
                Authorized Staff Portal · Cloud Database
              </p>
              <h1 className="font-display text-3xl font-semibold text-[#201D1E]">
                Admin Panel Login
              </h1>
              <p className="text-sm leading-relaxed text-[#5C5452]">
                Sign in with your administrator username and password to manage properties,
                contact enquiries, and site visit requests.
              </p>
            </div>
          </div>

          {/* Login / First-Time Password Setup Toggle */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#F2EFEF] border border-[#E3DDDB] rounded-sm">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setAuthError('');
                setAuthInfo('');
              }}
              className={`py-2 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                authMode === 'login'
                  ? 'bg-[#201D1E] text-white'
                  : 'text-[#5C5452] hover:text-[#201D1E]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setAuthError('');
                setAuthInfo('');
              }}
              className={`py-2 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                authMode === 'register'
                  ? 'bg-[#201D1E] text-white'
                  : 'text-[#5C5452] hover:text-[#201D1E]'
              }`}
            >
              Set Up Password
            </button>
          </div>

          {authError && (
            <p
              role="alert"
              className="text-xs font-medium text-[#8E2420] bg-[#FDF2F2] border border-[#F5C6C5] px-3.5 py-2.5 rounded-sm leading-relaxed"
            >
              {authError}
            </p>
          )}

          {authInfo && (
            <p
              role="status"
              className="text-xs font-medium text-[#166534] bg-[#F0FDF4] border border-[#BBF7D0] px-3.5 py-2.5 rounded-sm leading-relaxed"
            >
              {authInfo}
            </p>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="admin-username"
                className="block text-xs font-medium text-[#3F3837]"
              >
                Username or Admin Email
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-[#7D7270] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-username"
                  type="text"
                  autoComplete="username"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder={`admin or ${BOOTSTRAPPED_ADMIN_EMAIL}`}
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-[#FAF9F8] border border-[#D8D0CE] rounded-sm focus:bg-white focus:border-[#8E2420] focus:outline-none"
                  required
                />
              </div>
              <p className="text-[11px] text-[#6B6260]">
                Admin username: <span className="font-mono text-[#201D1E]">admin</span> (linked to{' '}
                <span className="font-mono text-[#201D1E]">{BOOTSTRAPPED_ADMIN_EMAIL}</span>)
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-medium text-[#3F3837]"
                >
                  {authMode === 'login' ? 'Password' : 'Create Admin Password'}
                </label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    className="text-[11px] font-medium text-[#8E2420] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#7D7270] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder={authMode === 'login' ? 'Enter your password' : 'Minimum 6 characters'}
                  className="w-full pl-9 pr-10 py-2.5 text-sm bg-[#FAF9F8] border border-[#D8D0CE] rounded-sm focus:bg-white focus:border-[#8E2420] focus:outline-none"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#7D7270] hover:text-[#201D1E] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingAuth}
              className="w-full py-3 px-5 text-sm font-medium text-white bg-[#8E2420] hover:bg-[#721B18] disabled:opacity-60 rounded-sm transition-colors cursor-pointer"
            >
              {submittingAuth
                ? authMode === 'login'
                  ? 'Signing In…'
                  : 'Setting Up Account…'
                : authMode === 'login'
                ? 'Sign In to Admin Panel'
                : 'Create Admin Password'}
            </button>
          </form>

          <div className="relative flex items-center py-1">
            <div className="flex-1 border-t border-[#E3DDDB]" />
            <span className="px-3 text-[11px] uppercase tracking-wider text-[#7D7270]">or</span>
            <div className="flex-1 border-t border-[#E3DDDB]" />
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 px-5 text-xs font-medium text-[#201D1E] bg-white border border-[#D8D0CE] hover:border-[#201D1E] rounded-sm transition-colors cursor-pointer"
            >
              Sign in with Google ({BOOTSTRAPPED_ADMIN_EMAIL})
            </button>
            <button
              type="button"
              onClick={onBackToSite}
              className="w-full py-2 px-5 text-xs font-medium text-[#5C5452] hover:text-[#201D1E] transition-colors cursor-pointer"
            >
              Return to Public Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Signed-in Email Verification Gate (required by Firestore rules)
  if (!user.emailVerified) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-[#F9F8F7] px-6 py-16">
        <div className="max-w-md w-full bg-white border border-[#E3DDDB] rounded-sm p-8 space-y-5">
          <p className="text-xs font-medium text-[#8E2420]">Email Verification Required</p>
          <h1 className="font-display text-3xl font-semibold text-[#201D1E]">
            Verify Your Admin Email
          </h1>
          <p className="text-sm leading-relaxed text-[#5C5452]">
            Signed in as <span className="font-mono text-[#201D1E]">{user.email}</span>. For
            database security, please click the verification link sent to your email inbox, then
            refresh your session below.
          </p>

          {authError && (
            <p role="alert" className="text-xs font-medium text-[#8E2420] bg-[#FDF2F2] border border-[#F5C6C5] px-3.5 py-2.5 rounded-sm">
              {authError}
            </p>
          )}

          {authInfo && (
            <p role="status" className="text-xs font-medium text-[#166534] bg-[#F0FDF4] border border-[#BBF7D0] px-3.5 py-2.5 rounded-sm">
              {authInfo}
            </p>
          )}

          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              disabled={verifyingSession}
              onClick={handleRefreshVerification}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#8E2420] hover:bg-[#721B18] disabled:opacity-60 rounded-sm cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{verifyingSession ? 'Checking…' : "I've Verified — Refresh Session"}</span>
            </button>
            <button
              type="button"
              disabled={verifyingSession}
              onClick={handleResendVerification}
              className="w-full px-5 py-2.5 text-xs font-medium text-[#201D1E] border border-[#D8D0CE] hover:border-[#201D1E] rounded-sm cursor-pointer"
            >
              Resend Verification Email
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full px-5 py-2 text-xs font-medium text-[#5C5452] hover:text-[#201D1E] cursor-pointer"
            >
              Sign Out / Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Signed-in Non-Admin Gate
  if (!isAdmin) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-[#F9F8F7] px-6 py-16">
        <div className="max-w-md w-full bg-white border border-[#E3DDDB] rounded-sm p-8 space-y-5">
          <p className="text-xs font-medium text-[#8E2420]">Access Restricted</p>
          <h1 className="font-display text-3xl font-semibold text-[#201D1E]">
            Admin Role Required
          </h1>
          <p className="text-sm leading-relaxed text-[#5C5452]">
            Signed in as <span className="font-mono text-[#201D1E]">{user.email}</span>. This
            account does not have administrator permissions for Shri Durga Developers. Please sign
            in with the authorized administrator account ({BOOTSTRAPPED_ADMIN_EMAIL}).
          </p>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSignOut}
              className="px-5 py-2.5 text-sm font-medium text-white bg-[#8E2420] hover:bg-[#721B18] rounded-sm cursor-pointer"
            >
              Switch Account
            </button>
            <button
              type="button"
              onClick={onBackToSite}
              className="px-5 py-2.5 text-sm font-medium text-[#4F4847] border border-[#E3DDDB] rounded-sm cursor-pointer"
            >
              Back to Site
            </button>
          </div>
        </div>
      </div>
    );
  }

  const newEnquiryCount = enquiries.filter((e) => e.status === 'new').length;
  const siteVisitCount = enquiries.filter((e) => e.type === 'site_visit').length;

  return (
    <div className="min-h-[85vh] bg-[#F9F8F7] text-[#201D1E] flex flex-col lg:flex-row border-b border-[#E3DDDB]">
      {/* Left Workspace Sidebar */}
      <aside className="w-full lg:w-64 bg-[#1B1615] text-[#EDE8E6] border-b lg:border-b-0 lg:border-r border-[#332927] flex flex-col justify-between shrink-0">
        <div className="p-6 space-y-8">
          <div className="space-y-1">
            <p className="font-mono text-[11px] text-[#F28C38]">Firestore Live Database</p>
            <h1 className="font-display text-2xl font-semibold text-white">Admin Console</h1>
          </div>

          <nav aria-label="Admin sections" className="space-y-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('enquiries')}
              className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm rounded-sm transition-colors cursor-pointer ${
                activeTab === 'enquiries'
                  ? 'bg-[#8E2420] text-white font-medium'
                  : 'text-[#CFC6C4] hover:bg-[#28201E] hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Inbox className="w-4 h-4" />
                <span>Enquiries</span>
              </span>
              <span className="font-mono text-xs tabular-nums opacity-90">{enquiries.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('properties')}
              className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm rounded-sm transition-colors cursor-pointer ${
                activeTab === 'properties'
                  ? 'bg-[#8E2420] text-white font-medium'
                  : 'text-[#CFC6C4] hover:bg-[#28201E] hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4" />
                <span>Properties</span>
              </span>
              <span className="font-mono text-xs tabular-nums opacity-90">{properties.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('subscribers')}
              className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm rounded-sm transition-colors cursor-pointer ${
                activeTab === 'subscribers'
                  ? 'bg-[#8E2420] text-white font-medium'
                  : 'text-[#CFC6C4] hover:bg-[#28201E] hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>Subscribers</span>
              </span>
              <span className="font-mono text-xs tabular-nums opacity-90">
                {subscribers.length}
              </span>
            </button>
          </nav>
        </div>

        <div className="p-6 border-t border-[#332927] space-y-4">
          <div className="space-y-0.5 min-w-0">
            <p className="text-xs font-medium text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F28C38] shrink-0" />
              <span className="truncate">{user.displayName || 'Administrator'}</span>
            </p>
            <p className="text-[11px] font-mono text-[#A69C9A] truncate">{user.email}</p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-medium text-[#EDE8E6] border border-[#3E3230] hover:border-[#F28C38] rounded-sm transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Breadcrumb Bar */}
        <div className="bg-white border-b border-[#E3DDDB] px-6 lg:px-10 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-[#6B6260] flex items-center gap-2">
            <span>Shri Durga Developers</span>
            <span aria-hidden="true">/</span>
            <span>Admin Console</span>
            <span aria-hidden="true">/</span>
            <span className="text-[#201D1E] font-medium capitalize">{activeTab}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openAddPropertyForm}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#8E2420] hover:bg-[#721B18] rounded-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Property</span>
            </button>
            <button
              type="button"
              onClick={onBackToSite}
              className="px-4 py-2 text-xs font-medium text-[#201D1E] border border-[#D8D0CE] hover:border-[#201D1E] rounded-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              View Live Website
            </button>
          </div>
        </div>

        {/* Summary KPI Strip */}
        <div className="bg-white border-b border-[#E3DDDB] grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x divide-[#E3DDDB]">
          <div className="px-6 py-5">
            <p className="text-xs text-[#6B6260]">Stored Enquiries</p>
            <p className="mt-1 font-mono text-2xl font-medium tabular-nums text-[#201D1E]">
              {enquiries.length}
            </p>
          </div>
          <div className="px-6 py-5">
            <p className="text-xs text-[#6B6260]">New / Unreviewed</p>
            <p className="mt-1 font-mono text-2xl font-medium tabular-nums text-[#8E2420]">
              {newEnquiryCount}
            </p>
          </div>
          <div className="px-6 py-5">
            <p className="text-xs text-[#6B6260]">Site Visit Requests</p>
            <p className="mt-1 font-mono text-2xl font-medium tabular-nums text-[#E86A17]">
              {siteVisitCount}
            </p>
          </div>
          <div className="px-6 py-5">
            <p className="text-xs text-[#6B6260]">Database Properties</p>
            <p className="mt-1 font-mono text-2xl font-medium tabular-nums text-[#201D1E]">
              {properties.length}
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-6 lg:p-10 space-y-6 flex-1">
          {/* ===============================================================
              TAB 1: ENQUIRIES & LEADS INBOX
             =============================================================== */}
          {activeTab === 'enquiries' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Type Filter */}
                  <div className="inline-flex items-center gap-1 p-1 bg-[#F2EFEF] border border-[#E3DDDB] rounded-sm">
                    {(
                      [
                        { id: 'all', label: 'All Types' },
                        { id: 'contact', label: 'Contact' },
                        { id: 'site_visit', label: 'Site Visits' },
                        { id: 'career', label: 'Careers' },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setEnquiryTypeFilter(t.id)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-sm cursor-pointer whitespace-nowrap ${
                          enquiryTypeFilter === t.id
                            ? 'bg-[#201D1E] text-white'
                            : 'text-[#5C5452] hover:text-[#201D1E]'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Status Filter */}
                  <select
                    aria-label="Filter enquiries by status"
                    value={enquiryStatusFilter}
                    onChange={(e) =>
                      setEnquiryStatusFilter(e.target.value as 'all' | EnquiryStatus)
                    }
                    className="px-3 py-2 text-xs bg-white border border-[#D8D0CE] rounded-sm focus:border-[#8E2420] focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-[#7D7270] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    value={enquirySearch}
                    onChange={(e) => setEnquirySearch(e.target.value)}
                    placeholder="Search name, phone, project..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#D8D0CE] rounded-sm focus:border-[#8E2420] focus:outline-none"
                  />
                </div>
              </div>

              {loadingData ? (
                <div className="bg-white border border-[#E3DDDB] rounded-sm p-8 text-sm text-[#6B6260]">
                  Loading stored enquiries from Firestore…
                </div>
              ) : filteredEnquiries.length === 0 ? (
                <div className="bg-white border border-[#E3DDDB] rounded-sm p-12 text-center space-y-3">
                  <p className="font-display text-2xl text-[#201D1E]">No Enquiries Found</p>
                  <p className="text-sm text-[#6B6260] max-w-md mx-auto">
                    Every contact enquiry, guided site visit request, and career application
                    submitted on the website is stored permanently here in real time.
                  </p>
                </div>
              ) : (
                <div className="bg-white border border-[#E3DDDB] rounded-sm overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E3DDDB] bg-[#F9F8F7] text-xs font-semibold text-[#5C5452]">
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Phone / Email</th>
                        <th className="py-3 px-4">Project / Interest</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Received</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EDE8E6] text-xs sm:text-sm">
                      {filteredEnquiries.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-[#FAF8F7] transition-colors cursor-pointer"
                          onClick={() => openEnquiryDetail(item)}
                        >
                          <td className="py-3.5 px-4 whitespace-nowrap text-xs text-[#5C5452]">
                            {enquiryTypeLabel(item.type)}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-[#201D1E] whitespace-nowrap">
                            {item.name}
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-mono text-xs tabular-nums text-[#201D1E]">
                              {item.phone}
                            </p>
                            {item.email && (
                              <p className="text-xs text-[#6B6260] truncate max-w-[180px]">
                                {item.email}
                              </p>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-[#3F3837] max-w-[220px] truncate">
                            {item.projectOrRole || item.category || 'General Consultation'}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-xs capitalize">
                            <span className={statusTextColor(item.status)}>{item.status}</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs tabular-nums text-[#6B6260] whitespace-nowrap">
                            {formatDate(item.createdAt)}
                          </td>
                          <td
                            className="py-3.5 px-4 text-right whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => openEnquiryDetail(item)}
                              className="text-xs font-medium text-[#8E2420] hover:underline mr-3 cursor-pointer"
                            >
                              Manage
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteEnquiry(item.id)}
                              aria-label={`Delete enquiry from ${item.name}`}
                              className="inline-flex items-center text-[#7D7270] hover:text-[#8E2420] cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ===============================================================
              TAB 2: PROPERTY MANAGER (CREATE, EDIT, DELETE IN FIRESTORE)
             =============================================================== */}
          {activeTab === 'properties' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl font-semibold text-[#201D1E]">
                    Permanent Property Listings
                  </h2>
                  <p className="text-xs sm:text-sm text-[#5C5452]">
                    Every property added here is saved permanently in Firestore and immediately
                    published on the live Projects &amp; Home pages.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openAddPropertyForm}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-white bg-[#8E2420] hover:bg-[#721B18] rounded-sm transition-colors self-start sm:self-auto whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Property</span>
                </button>
              </div>

              {propertyToast && (
                <div className="flex items-center justify-between gap-3 px-4 py-3 bg-[#F2EFEF] border border-[#D8D0CE] text-xs text-[#201D1E] rounded-sm">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#166534]" />
                    <span>{propertyToast}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setPropertyToast('')}
                    aria-label="Dismiss notification"
                    className="text-[#6B6260] hover:text-[#201D1E] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {properties.length === 0 ? (
                <div className="bg-white border border-[#E3DDDB] rounded-sm p-12 text-center space-y-4">
                  <p className="font-display text-2xl text-[#201D1E]">
                    No Custom Database Properties Added Yet
                  </p>
                  <p className="text-sm text-[#6B6260] max-w-md mx-auto">
                    All 27 baseline Hubballi developments are displayed by default. Add a new
                    apartment, layout, or commercial listing to store it permanently in Firestore.
                  </p>
                  <button
                    type="button"
                    onClick={openAddPropertyForm}
                    className="px-5 py-2.5 text-xs font-medium text-white bg-[#8E2420] hover:bg-[#721B18] rounded-sm cursor-pointer"
                  >
                    Add First Property
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {properties.map((prop) => {
                    const imgSrc =
                      IMAGE_OPTIONS.find((opt) => opt.key === prop.imageKey)?.src || IMAGES.layouts;
                    return (
                      <div
                        key={prop.id}
                        className="bg-white border border-[#E3DDDB] rounded-sm overflow-hidden flex flex-col sm:flex-row"
                      >
                        <div className="sm:w-44 h-40 sm:h-auto shrink-0 bg-[#EFEAE8]">
                          <ResilientImage
                            src={imgSrc}
                            alt={prop.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4 min-w-0">
                          <div className="space-y-1.5">
                            <p className="text-xs text-[#6B6260]">
                              <span className="text-[#8E2420] font-medium">{prop.status}</span> ·{' '}
                              {prop.category} · {prop.location}
                            </p>
                            <h3 className="font-display text-2xl font-semibold text-[#201D1E] truncate">
                              {prop.name}
                            </h3>
                            <p className="text-xs text-[#5C5452] line-clamp-2">{prop.summary}</p>
                          </div>

                          <div className="pt-3 border-t border-[#EDE8E6] flex items-center justify-between gap-3">
                            <span className="font-mono text-[11px] tabular-nums text-[#5C5452] truncate">
                              {prop.highlightMetric}
                            </span>
                            <div className="flex items-center gap-3 shrink-0">
                              <button
                                type="button"
                                onClick={() => openEditPropertyForm(prop)}
                                className="inline-flex items-center gap-1 text-xs font-medium text-[#8E2420] hover:underline cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProperty(prop.id)}
                                className="inline-flex items-center gap-1 text-xs font-medium text-[#7D7270] hover:text-[#8E2420] cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===============================================================
              TAB 3: NEWSLETTER SUBSCRIBERS
             =============================================================== */}
          {activeTab === 'subscribers' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-3xl font-semibold text-[#201D1E]">
                  Project Update Subscribers
                </h2>
                <p className="text-xs sm:text-sm text-[#5C5452]">
                  Permanent list of buyers subscribed to Hubballi launch updates and insights.
                </p>
              </div>

              {subscribers.length === 0 ? (
                <div className="bg-white border border-[#E3DDDB] rounded-sm p-10 text-center text-sm text-[#6B6260]">
                  No newsletter subscribers recorded yet.
                </div>
              ) : (
                <div className="bg-white border border-[#E3DDDB] rounded-sm overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E3DDDB] bg-[#F9F8F7] text-xs font-semibold text-[#5C5452]">
                        <th className="py-3 px-4">Email Address</th>
                        <th className="py-3 px-4">Subscribed On</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EDE8E6] text-sm">
                      {subscribers.map((sub) => (
                        <tr key={sub.id} className="hover:bg-[#FAF8F7]">
                          <td className="py-3 px-4 flex items-center gap-2 text-[#201D1E]">
                            <Mail className="w-3.5 h-3.5 text-[#8E2420]" />
                            <span>{sub.email}</span>
                          </td>
                          <td className="py-3 px-4 font-mono text-xs tabular-nums text-[#6B6260]">
                            {formatDate(sub.createdAt)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => removeSubscriber(sub.id)}
                              className="text-xs text-[#7D7270] hover:text-[#8E2420] cursor-pointer"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* =================================================================
          ENQUIRY INSPECTOR DRAWER
         ================================================================= */}
      {selectedEnquiry && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-[#1B1615]/60 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedEnquiry(null)}
        >
          <div
            className="w-full max-w-lg h-full bg-[#F9F8F7] border-l border-[#E3DDDB] overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-[#F9F8F7] border-b border-[#E3DDDB] px-6 py-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-[#8E2420] font-medium">
                  {enquiryTypeLabel(selectedEnquiry.type)} · {formatDate(selectedEnquiry.createdAt)}
                </p>
                <h3 className="font-display text-2xl font-semibold text-[#201D1E]">
                  {selectedEnquiry.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                aria-label="Close enquiry detail"
                className="w-9 h-9 inline-flex items-center justify-center border border-[#E3DDDB] rounded-sm cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              <dl className="grid grid-cols-2 gap-4 text-xs bg-white border border-[#E3DDDB] p-4 rounded-sm">
                <div>
                  <dt className="text-[#6B6260]">Phone</dt>
                  <dd className="mt-1 font-mono font-medium tabular-nums text-[#201D1E]">
                    <a href={`tel:${selectedEnquiry.phone}`} className="hover:text-[#8E2420]">
                      {selectedEnquiry.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-[#6B6260]">Email</dt>
                  <dd className="mt-1 text-[#201D1E] break-all">
                    {selectedEnquiry.email || 'Not provided'}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#6B6260]">Project / Role</dt>
                  <dd className="mt-1 font-medium text-[#201D1E]">
                    {selectedEnquiry.projectOrRole || 'General'}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#6B6260]">Category / Experience</dt>
                  <dd className="mt-1 text-[#201D1E]">{selectedEnquiry.category || '—'}</dd>
                </div>
                {selectedEnquiry.preferredDate && (
                  <div className="col-span-2">
                    <dt className="text-[#6B6260]">Preferred Visit Date</dt>
                    <dd className="mt-1 font-mono tabular-nums text-[#201D1E]">
                      {selectedEnquiry.preferredDate}
                    </dd>
                  </div>
                )}
              </dl>

              {selectedEnquiry.message && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-[#5C5452]">Customer Message</p>
                  <p className="p-4 bg-white border border-[#E3DDDB] rounded-sm text-sm leading-relaxed text-[#2F2A29]">
                    {selectedEnquiry.message}
                  </p>
                </div>
              )}

              <form onSubmit={handleSaveEnquiryUpdate} className="space-y-4 pt-4 border-t border-[#E3DDDB]">
                <div>
                  <label htmlFor="enq-status" className="block text-xs font-medium text-[#4F4847] mb-1.5">
                    Follow-Up Status
                  </label>
                  <select
                    id="enq-status"
                    value={editEnquiryStatus}
                    onChange={(e) => setEditEnquiryStatus(e.target.value as EnquiryStatus)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8D0CE] rounded-sm focus:border-[#8E2420] focus:outline-none"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="scheduled">Site Visit Scheduled</option>
                    <option value="closed">Closed / Completed</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="enq-notes" className="block text-xs font-medium text-[#4F4847] mb-1.5">
                    Internal Sales Executive Notes
                  </label>
                  <textarea
                    id="enq-notes"
                    rows={4}
                    maxLength={1000}
                    value={editEnquiryNotes}
                    onChange={(e) => setEditEnquiryNotes(e.target.value)}
                    placeholder="Record call outcome, preferred plot dimensions, or scheduled follow-up..."
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8D0CE] rounded-sm focus:border-[#8E2420] focus:outline-none"
                  />
                </div>

                {enquiryToast && (
                  <p className="text-xs font-medium text-[#166534]">{enquiryToast}</p>
                )}

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleDeleteEnquiry(selectedEnquiry.id)}
                    className="px-4 py-2 text-xs font-medium text-[#8E2420] border border-[#E3DDDB] hover:border-[#8E2420] rounded-sm cursor-pointer"
                  >
                    Delete Record
                  </button>
                  <button
                    type="submit"
                    disabled={savingEnquiry}
                    className="px-5 py-2.5 text-xs font-medium text-white bg-[#8E2420] hover:bg-[#721B18] disabled:opacity-60 rounded-sm cursor-pointer"
                  >
                    {savingEnquiry ? 'Saving…' : 'Save Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================
          ADD / EDIT PROPERTY MODAL
         ================================================================= */}
      {propertyFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1B1615]/65 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          onClick={() => setPropertyFormOpen(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-[#F9F8F7] border border-[#E3DDDB] rounded-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-[#F9F8F7] border-b border-[#E3DDDB] px-6 sm:px-8 py-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[#8E2420]">Permanent Firestore Listing</p>
                <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#201D1E]">
                  {editingPropertyId ? 'Edit Property Listing' : 'Add New Property Listing'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPropertyFormOpen(false)}
                aria-label="Close property form"
                className="w-9 h-9 inline-flex items-center justify-center border border-[#E3DDDB] rounded-sm cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProperty} noValidate className="p-6 sm:p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prop-name" className="block text-xs font-medium text-[#4F4847] mb-1.5">
                    Property Name
                  </label>
                  <input
                    id="prop-name"
                    type="text"
                    required
                    maxLength={120}
                    value={propForm.name}
                    onChange={(e) => setPropForm({ ...propForm, name: e.target.value })}
                    placeholder="e.g. Jhanvi Emerald Enclave"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8D0CE] rounded-sm focus:border-[#8E2420] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="prop-location" className="block text-xs font-medium text-[#4F4847] mb-1.5">
                    Locality / Area
                  </label>
                  <input
                    id="prop-location"
                    type="text"
                    required
                    maxLength={140}
                    value={propForm.location}
                    onChange={(e) => setPropForm({ ...propForm, location: e.target.value })}
                    placeholder="e.g. Vidya Nagar, Hubballi"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8D0CE] rounded-sm focus:border-[#8E2420] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="prop-category" className="block text-xs font-medium text-[#4F4847] mb-1.5">
                    Category
                  </label>
                  <select
                    id="prop-category"
                    value={propForm.category}
                    onChange={(e) =>
                      setPropForm({ ...propForm, category: e.target.value as ProjectCategory })
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8D0CE] rounded-sm focus:border-[#8E2420] focus:outline-none"
                  >
                    <option value="Apartments">Apartments</option>
                    <option value="Layouts">Layouts</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="prop-status" className="block text-xs font-medium text-[#4F4847] mb-1.5">
                    Project Stage
                  </label>
                  <select
                    id="prop-status"
                    value={propForm.status}
                    onChange={(e) =>
                      setPropForm({ ...propForm, status: e.target.value as PropertyStatus })
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8D0CE] rounded-sm focus:border-[#8E2420] focus:outline-none"
                  >
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="prop-image" className="block text-xs font-medium text-[#4F4847] mb-1.5">
                    Architectural Photo
                  </label>
                  <select
                    id="prop-image"
                    value={propForm.imageKey}
                    onChange={(e) =>
                      setPropForm({ ...propForm, imageKey: e.target.value as PropertyImageKey })
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8D0CE] rounded-sm focus:border-[#8E2420] focus:outline-none"
                  >
                    {IMAGE_OPTIONS.map((opt) => (
                      <option key={opt.key} value={opt.key}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prop-metric1" className="block text-xs font-medium text-[#4F4847] mb-1.5">
                    Primary Configuration
                  </label>
                  <input
                    id="prop-metric1"
                    type="text"
                    required
                    maxLength={80}
                    value={propForm.highlightMetric}
                    onChange={(e) => setPropForm({ ...propForm, highlightMetric: e.target.value })}
                    placeholder="e.g. G+4 Floors or 30 Ft Wide Roads"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8D0CE] rounded-sm focus:border-[#8E2420] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="prop-metric2" className="block text-xs font-medium text-[#4F4847] mb-1.5">
                    Inventory / Plot Sizes
                  </label>
                  <input
                    id="prop-metric2"
                    type="text"
                    required
                    maxLength={80}
                    value={propForm.secondaryMetric}
                    onChange={(e) => setPropForm({ ...propForm, secondaryMetric: e.target.value })}
                    placeholder="e.g. 30 Flats or 30×40 & 30×50 Sq Ft"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8D0CE] rounded-sm focus:border-[#8E2420] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="prop-address" className="block text-xs font-medium text-[#4F4847] mb-1.5">
                  Official Site Address
                </label>
                <input
                  id="prop-address"
                  type="text"
                  required
                  maxLength={240}
                  value={propForm.address}
                  onChange={(e) => setPropForm({ ...propForm, address: e.target.value })}
                  placeholder="Full site address with PIN code"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8D0CE] rounded-sm focus:border-[#8E2420] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="prop-summary" className="block text-xs font-medium text-[#4F4847] mb-1.5">
                  Short Card Summary
                </label>
                <textarea
                  id="prop-summary"
                  rows={2}
                  required
                  maxLength={500}
                  value={propForm.summary}
                  onChange={(e) => setPropForm({ ...propForm, summary: e.target.value })}
                  placeholder="2-sentence overview displayed on property cards..."
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8D0CE] rounded-sm focus:border-[#8E2420] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="prop-overview" className="block text-xs font-medium text-[#4F4847] mb-1.5">
                  Full Project Overview
                </label>
                <textarea
                  id="prop-overview"
                  rows={3}
                  required
                  maxLength={1500}
                  value={propForm.overview}
                  onChange={(e) => setPropForm({ ...propForm, overview: e.target.value })}
                  placeholder="Detailed description displayed inside the architectural project dossier..."
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D8D0CE] rounded-sm focus:border-[#8E2420] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prop-specs" className="block text-xs font-medium text-[#4F4847] mb-1.5">
                    Key Specifications (one per line)
                  </label>
                  <textarea
                    id="prop-specs"
                    rows={4}
                    value={specsText}
                    onChange={(e) => setSpecsText(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-mono bg-white border border-[#D8D0CE] rounded-sm focus:border-[#8E2420] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="prop-transit" className="block text-xs font-medium text-[#4F4847] mb-1.5">
                    Transit Distances (Landmark - Time)
                  </label>
                  <textarea
                    id="prop-transit"
                    rows={4}
                    value={transitText}
                    onChange={(e) => setTransitText(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-mono bg-white border border-[#D8D0CE] rounded-sm focus:border-[#8E2420] focus:outline-none"
                  />
                </div>
              </div>

              {propFormError && (
                <p role="alert" className="text-xs font-medium text-[#8E2420]">
                  {propFormError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E3DDDB]">
                <button
                  type="button"
                  onClick={() => setPropertyFormOpen(false)}
                  className="px-4 py-2 text-sm text-[#5C5452] hover:text-[#201D1E] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProperty}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-[#8E2420] hover:bg-[#721B18] disabled:opacity-60 rounded-sm cursor-pointer"
                >
                  {savingProperty
                    ? 'Saving to Database…'
                    : editingPropertyId
                    ? 'Save Changes'
                    : 'Publish Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
