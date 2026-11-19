export type ProjectCategory = 'Apartments' | 'Layouts' | 'Commercial';

export interface TransitDistance {
  landmark: string;
  time: string;
}

export interface OngoingProject {
  id: string;
  name: string;
  category: ProjectCategory;
  location: string;
  summary: string;
  overview: string;
  specifications: string[];
  address: string;
  transit: TransitDistance[];
  highlightMetric: string;
  secondaryMetric: string;
  image: string;
  imagePosition?: string;
  association?: string;
}

export interface CompletedProject {
  id: string;
  name: string;
  category: 'Apartments' | 'Layouts';
  location: string;
}

export interface ServiceItem {
  number: string;
  title: string;
  description: string;
}

export interface JourneyStep {
  number: string;
  title: string;
  subtitle: string;
  description: string;
}

export interface HonorItem {
  number: string;
  year: string;
  title: string;
  organization: string;
  distinction: string;
  description: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  theme: string;
  quote: string;
  location: string;
}

export interface JournalArticle {
  id: string;
  number: string;
  category: string;
  title: string;
  excerpt: string;
  readTime: string;
  content: string[];
  keyTakeaways: string[];
}

export interface CareerRole {
  id: string;
  number: string;
  title: string;
  department: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface HeroSlide {
  id: string;
  projectId: string;
  index: string;
  category: ProjectCategory;
  title: string;
  location: string;
  highlight: string;
  image: string;
  alt: string;
}

export const IMAGES = {
  logo: '/src/assets/images/shri_durga_developers_logo.webp',
  hero: '/src/assets/images/hero_hubballi_residences_1795064931096.jpg',
  heroTwilightApartments: '/src/assets/images/hero_carousel_twilight_apartments_1795065374843.jpg',
  heroPlottedAvenue: '/src/assets/images/hero_carousel_plotted_avenue_1795065376023.jpg',
  heroCommercialPlaza: '/src/assets/images/hero_carousel_commercial_plaza_1795065375663.jpg',
  apartments: '/src/assets/images/apartments_skyline_showcase_1795064931015.jpg',
  layouts: '/src/assets/images/layouts_planned_township_1795064930446.jpg',
  commercial: '/src/assets/images/commercial_trinity_square_1795064929442.jpg',
  studio: '/src/assets/images/founder_architecture_studio_1795064931054.jpg',
} as const;

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-silver-oak',
    projectId: 'jhanvi-silver-oak',
    index: '01',
    category: 'Apartments',
    title: 'Jhanvi Silver Oak',
    location: 'Shantinagar / Bengeri, Hubballi',
    highlight: 'G+4 Floors · 40 Luxury Flats · Independent Walls',
    image: IMAGES.heroTwilightApartments,
    alt: 'Jhanvi Silver Oak — Five-storey boutique twilight residential apartment elevation in Hubballi',
  },
  {
    id: 'slide-nandanam',
    projectId: 'jhanvi-nandanam-residency',
    index: '02',
    category: 'Layouts',
    title: 'Jhanvi Nandanam Residency',
    location: 'Opposite IIIT Sattur, Dharwad',
    highlight: '9.00m Asphalt Roads · HDMC & KHB/UDA Approved',
    image: IMAGES.heroPlottedAvenue,
    alt: 'Jhanvi Nandanam Residency — Wide paved avenue roads and landscaped park in planned residential layout',
  },
  {
    id: 'slide-trinity-square',
    projectId: 'jhanvi-trinity-square',
    index: '03',
    category: 'Commercial',
    title: 'Jhanvi Trinity Square',
    location: 'Shirur Park, Vidya Nagar',
    highlight: 'Prime Retail & Corporate Offices · Wide Frontage',
    image: IMAGES.heroCommercialPlaza,
    alt: 'Jhanvi Trinity Square — Modern glass and stone commercial complex at twilight in Vidya Nagar',
  },
  {
    id: 'slide-skyline-square',
    projectId: 'jhanvi-skyline-square',
    index: '04',
    category: 'Apartments',
    title: 'Jhanvi Skyline Square',
    location: 'Vidya Nagar, Hubballi',
    highlight: 'G+3 Floors · 40 Exclusive Vastu Residences',
    image: IMAGES.hero,
    alt: 'Jhanvi Skyline Square — Contemporary courtyard residences with sunlit balconies in Vidya Nagar',
  },
];

export const COMPANY_INFO = {
  name: 'Shri Durga Developers & Promoters',
  shortName: 'Shri Durga Developers',
  tagline: 'Building Trust. Creating Futures.',
  heroHeadline: "Building Karnataka's Future, One Home at a Time",
  heroSubheadline:
    'Trusted ISO 9001:2015 certified real estate developers crafting legally approved residential layouts, boutique apartments, and landmark commercial spaces across Hubballi and North Karnataka.',
  phoneDisplay: '+91 960-634-1017',
  phoneHref: 'tel:+919606341017',
  email: 'info@shridurgadevelopers.in',
  emailHref: 'mailto:info@shridurgadevelopers.in',
  founderName: 'Shri Veeresh N. Undi',
  founderTitle: 'Managing Director & Founder, Shri Durga Group of Companies',
  offices: [
    {
      label: 'Head & Branch Office — Hubballi',
      address:
        '#No 2A, Upper Ground Floor, Gurudev Landmark, Near More Bazar, Vidyanagar, Hubballi, Karnataka – 580021',
      mapQuery:
        'Gurudev Landmark Near More Bazar Vidyanagar Hubballi Karnataka 580021',
    },
    {
      label: 'Corporate Office — Mumbai',
      address:
        '#401 Bhaveshwar Kutir, 19 Rajawadi Road, Near Sanyas Ashram, Mumbai, Maharashtra – 400077',
      mapQuery: 'Bhaveshwar Kutir 19 Rajawadi Road Ghatkopar Mumbai Maharashtra 400077',
    },
  ],
  metrics: [
    { value: '1,800+', label: 'Properties Delivered', detail: 'Families & investors across Karnataka' },
    { value: '15+', label: 'Years of Excellence', detail: 'Consistent on-time project delivery' },
    { value: 'ISO 9001:2015', label: 'Quality Certified', detail: 'Internationally assessed standards' },
    { value: '100%', label: 'Title Verified', detail: 'HDMC & KHB/UDA compliant approvals' },
  ],
};

export const ONGOING_PROJECTS: OngoingProject[] = [
  // Apartments (5)
  {
    id: 'jhanvi-skyline-square',
    name: 'Jhanvi Skyline Square',
    category: 'Apartments',
    location: 'Vidya Nagar, Hubballi',
    highlightMetric: 'G+3 Floors',
    secondaryMetric: '40 Exclusive Flats',
    summary:
      'A thoughtfully designed four-storey premium residential development in Vidyanagar, limited to 40 exclusive homes for refined, peaceful urban living.',
    overview:
      'Every residence is carefully planned to maximize natural light, ventilation, and functionality, ensuring a comfortable living experience for modern families. With elegant architecture, quality construction, and a focus on everyday convenience, Jhanvi Skyline Square brings together modern luxury and practical living.',
    specifications: [
      'G+3 Floors low-density elevation',
      '40 Exclusive Flats for Sale',
      'Dedicated Children Play Area',
      '100% Vastu Compliant floor plans',
      'Independent Wall construction for privacy',
      '24/7 CCTV Facility & secured entry',
    ],
    address: '32, Chetana Colony, Om Sai Purshottam, Vidya Nagar, Hubballi, Karnataka 580021',
    transit: [
      { landmark: 'Vidya Nagar Main Road', time: '3 Mins' },
      { landmark: 'KLE Technological University', time: '5 Mins' },
      { landmark: 'Hubballi Railway Station', time: '10 Mins' },
      { landmark: 'Hubballi Airport', time: '12 Mins' },
    ],
    image: IMAGES.apartments,
  },
  {
    id: 'jhanvi-greenwood',
    name: 'Jhanvi Greenwood',
    category: 'Apartments',
    location: 'Akshay Colony, Hubballi',
    highlightMetric: 'G+4 Floors',
    secondaryMetric: '20 Boutique Flats',
    summary:
      'A residential apartment project blending modern architecture with a calm, nature-inspired setting in Phase 4, Akshay Colony.',
    overview:
      'Jhanvi Greenwood features Vastu-compliant homes with spacious interiors, ample natural light, and well-defined living spaces that enhance everyday comfort. With essential amenities, secure surroundings, and excellent connectivity to Gokul Road and the airport, the project offers long-term value for families.',
    specifications: [
      'G+4 Floors contemporary structure',
      '20 Flats for Sale in an intimate community',
      'Dedicated Children Play Area',
      '100% Vastu Compliant residences',
      'Independent Wall privacy design',
      'Comprehensive CCTV Facility',
    ],
    address: 'Phase 4, Akshay Colony, Hubballi, Karnataka 580021',
    transit: [
      { landmark: 'Chetana PU College', time: '4 Mins' },
      { landmark: 'Gokul Road Corridor', time: '5 Mins' },
      { landmark: 'Hubballi Airport', time: '8 Mins' },
      { landmark: 'Super Specialty Hospital', time: '10 Mins' },
    ],
    image: IMAGES.hero,
  },
  {
    id: 'jhanvi-prestige-palace',
    name: 'Jhanvi Prestige Palace',
    category: 'Apartments',
    location: 'Near Shirur Park, Vidya Nagar',
    highlightMetric: 'G+4 Floors',
    secondaryMetric: '10 Exclusive Flats',
    summary:
      'An ultra-private boutique apartment residence near Shirur Park combining elegant architecture with one of Hubballi’s prime neighborhoods.',
    overview:
      'Jhanvi Prestige Palace features well-designed homes with spacious layouts, ample natural light, and essential amenities that enhance everyday comfort and safety. With only 10 select residences in Vidyanagar, it offers unmatched privacy and enduring appreciation.',
    specifications: [
      'G+4 Floors boutique building',
      '10 Exclusive Flats for Sale',
      'Dedicated Children Play Area',
      'Vastu Compliant layout design',
      'Independent Wall for every residence',
      'CCTV Surveillance Facility',
    ],
    address: '3, Om Sai Purshottam Nagar, Vidya Nagar, Hubballi, Karnataka 580021',
    transit: [
      { landmark: 'Shirur Park', time: '2 Mins' },
      { landmark: 'Vidya Nagar Commercial Hub', time: '4 Mins' },
      { landmark: 'BVB Campus', time: '6 Mins' },
      { landmark: 'Hubballi Railway Station', time: '12 Mins' },
    ],
    image: IMAGES.apartments,
  },
  {
    id: 'jhanvi-royal-enclave',
    name: 'Jhanvi Royal Enclave',
    category: 'Apartments',
    location: 'Behind Amruth Theatre, Vidya Nagar',
    highlightMetric: 'G+4 Floors',
    secondaryMetric: '30 Select Flats',
    summary:
      'Thoughtfully planned residential living in central Vidyanagar designed for seamless connectivity, family comfort, and lasting value.',
    overview:
      'Located just one minute from Amruth Theatre Road and close to the BRTS Transit Station, Jhanvi Royal Enclave brings together organized planning, independent-wall residences, and essential amenities for families and discerning investors.',
    specifications: [
      'G+4 Floors residential elevation',
      '30 Flats for Sale',
      'Children Play Area',
      'Vastu Compliant residences',
      'Independent Wall construction',
      '24/7 CCTV Facility',
    ],
    address: 'Chandra Niwas, Behind Amruth Theatre Road, Vidya Nagar, Hubballi, Karnataka 580021',
    transit: [
      { landmark: 'Amruth Theatre Road', time: '1 Min' },
      { landmark: 'Vidya Nagar Center', time: '3 Mins' },
      { landmark: 'BRTS Transit Station', time: '5 Mins' },
      { landmark: 'KLE Hospital', time: '8 Mins' },
    ],
    image: IMAGES.hero,
  },
  {
    id: 'jhanvi-silver-oak',
    name: 'Jhanvi Silver Oak',
    category: 'Apartments',
    location: 'Shantinagar / Bengeri, Hubballi',
    highlightMetric: 'G+4 Floors',
    secondaryMetric: '40 Luxury Flats',
    association: 'In association with Shambhavi Twin City LLP',
    summary:
      'A five-storey residential address in Bengeri Extension offering an exclusive collection of luxurious homes for 40 select families.',
    overview:
      'Jhanvi Silver Oak is crafted for those who aspire to live large, with spacious, well-ventilated homes that offer comfort, security, and peace of mind. More than an apartment, it is a sophisticated lifestyle address connecting seamlessly to Keshwapur and Hubballi Junction.',
    specifications: [
      'G+4 Floors five-storey architecture',
      '40 Luxury Flats for Sale',
      'Children Play Area',
      'Vastu Compliant floor layouts',
      'Independent Wall construction',
      'CCTV Surveillance Facility',
    ],
    address: '22, Bengeri Extension, Shantinagar, Hubballi, Karnataka 580023',
    transit: [
      { landmark: 'Gopankoppa Road', time: '3 Mins' },
      { landmark: 'APMC Market Complex', time: '6 Mins' },
      { landmark: 'Keshwapur Commercial Hub', time: '7 Mins' },
      { landmark: 'Hubballi Railway Station', time: '8 Mins' },
    ],
    image: IMAGES.apartments,
  },

  // Layouts (8)
  {
    id: 'jhanvi-nandanam-residency',
    name: 'Jhanvi Nandanam Residency',
    category: 'Layouts',
    location: 'Opposite IIIT Sattur, Dharwad',
    highlightMetric: '9.00m Asphalt Roads',
    secondaryMetric: '9×12 & 9×15 Plots',
    summary:
      'An institutional-corridor residential layout directly opposite IIIT Sattur with 9.00-meter internal asphalt roads and full HDMC & KHB/UDA bylaw compliance.',
    overview:
      'Jhanvi Nandanam Residency features thoughtfully planned residential plots equipped with underground drainage, surface drains, dedicated water supply lines, underground electricity, and scenic landscaped park and Civic Amenity (CA) spaces.',
    specifications: [
      'Opposite IIIT Sattur & 30m Widen Main Access Road',
      'Wide 9.00 Mtr Internal Asphalt Roads',
      'Plot Dimensions: 9×12, 9×15, 9 Wide & Odd Size Plots',
      '100% Vastu Compliant Layout Planning',
      'HDMC & KHB/UDA Bylaws Approved',
      'Underground Drainage (UGD) & Surface Drains',
      'Dedicated Water Supply Line & Underground Electricity',
      'Landscaped Park & Civic Amenities (CA) Spaces',
    ],
    address: 'Opposite IIIT Sattur, Near SDM Dental College, Dharwad, Karnataka 580009',
    transit: [
      { landmark: 'IIIT Sattur Campus', time: 'Opposite' },
      { landmark: 'SDM Dental College', time: '5 Mins' },
      { landmark: 'SDM Hospital', time: '6 Mins' },
      { landmark: 'Rashtrotthana Vidya Kendra', time: '8 Mins' },
    ],
    image: IMAGES.layouts,
    imagePosition: 'object-top',
  },
  {
    id: 'natures-nest',
    name: 'Nature Nest',
    category: 'Layouts',
    location: 'Gamangatti, Hubballi',
    highlightMetric: '30 Ft Wide Roads',
    secondaryMetric: '30×40 & 30×50 Sq Ft',
    summary:
      'A nature-inspired planned residential layout near Kariyamma Devi Temple balancing calm green surroundings with effortless NH48 and Airport access.',
    overview:
      'Nature Nest features well-defined Vastu plots, wide 30-foot internal roads, drinking water plus borewell provisions, and underground electricity — offering a calm, sustainable setting without compromising on everyday city connectivity.',
    specifications: [
      '30 Feet Wide Internal Roads',
      '30×40, 30×50 Sq ft and odd size plots',
      'Facing: North, East and West plots',
      '100% Vastu Compliant layout',
      'Drinking Water + Borewell connectivity',
      'Underground Electricity network',
    ],
    address: 'Near Kariyamma Devi Temple, Gamangatti, Hubballi, Karnataka 580025',
    transit: [
      { landmark: 'Gamangatti Temple', time: '2 Mins' },
      { landmark: 'Pune – Bengaluru NH48', time: '6 Mins' },
      { landmark: 'Navanagar Hub', time: '8 Mins' },
      { landmark: 'Hubballi Airport', time: '10 Mins' },
    ],
    image: IMAGES.layouts,
    imagePosition: 'object-top',
  },
  {
    id: 'adviti-park',
    name: 'Adviti Park',
    category: 'Layouts',
    location: 'Gamanagatti, Hubballi',
    highlightMetric: '30 Ft Wide Roads',
    secondaryMetric: '30×40 & 30×50 Sq Ft',
    summary:
      'A thoughtfully developed residential layout in Gamanagatti built for peaceful living, reliable civic infrastructure, and strong long-term appreciation.',
    overview:
      'Adviti Park features well-defined residential plots, wide internal roads, and complete utility provisioning just minutes from Pune–Bengaluru NH48 and Navanagar Administrative Hub — ideal for building a custom home or securing a sound land investment.',
    specifications: [
      '30 Feet Wide Internal Roads',
      '30×40, 30×50 Sq ft and odd size plots',
      'Facing: North, East and West options',
      'Vastu Compliant planning',
      'Drinking Water + Borewell provision',
      'Underground Electricity infrastructure',
    ],
    address: '93JJ+968, Gamanagatti, Hubballi, Karnataka 580025',
    transit: [
      { landmark: 'Pune – Bengaluru NH48', time: '5 Mins' },
      { landmark: 'Navanagar Administrative Hub', time: '8 Mins' },
      { landmark: 'Hubballi Airport', time: '10 Mins' },
      { landmark: 'SDM Medical College & Hospital', time: '12 Mins' },
    ],
    image: IMAGES.layouts,
    imagePosition: 'object-top',
  },
  {
    id: 'jhanvi-divinity-park',
    name: 'Jhanvi Divinity Park',
    category: 'Layouts',
    location: 'Gamanagatti Road, Hubballi',
    highlightMetric: '30 Ft Wide Roads',
    secondaryMetric: 'HDMC Planning Zone',
    summary:
      'A serene residential layout along Gamanagatti Road offering direct HDMC Town Planning Zone access and seamless connectivity to Tarihal and Airport Road.',
    overview:
      'Jhanvi Divinity Park delivers well-proportioned plots with wide internal roads, essential utilities, and a calm neighborhood atmosphere tailored for families planning their dream home or investors seeking steady capital growth.',
    specifications: [
      '30 Feet Wide Internal Roads',
      '30×40, 30×50 Sq ft and odd size plots',
      'Facing: North, East and West',
      'Vastu Compliant layout design',
      'Drinking Water + Borewell supply',
      'Underground Electricity cabling',
    ],
    address: '93FM+HF, Hubballi, Karnataka 580025',
    transit: [
      { landmark: 'Gamanagatti Temple', time: '3 Mins' },
      { landmark: 'Tarihal Industrial Area', time: '4 Mins' },
      { landmark: 'Airport Road', time: '8 Mins' },
      { landmark: 'HDMC Town Planning Zone', time: 'Direct Access' },
    ],
    image: IMAGES.layouts,
    imagePosition: 'object-top',
  },
  {
    id: 'aarvij-nest-ph-iv',
    name: 'Aarvij Nest Ph IV',
    category: 'Layouts',
    location: 'Gopanakoppa, Hubballi',
    highlightMetric: '30 Ft Wide Roads',
    secondaryMetric: 'Phase IV Expansion',
    summary:
      'Following three successful completed phases, Aarvij Nest Ph IV continues our trusted residential legacy in the well-established Gopanakoppa education corridor.',
    overview:
      'Aarvij Nest Ph IV offers well-planned plots with practical dimensions, wide roads, and essential civic amenities that ensure safety, comfort, and lasting residential value near Unkal–Gopanakoppa Road and JK School.',
    specifications: [
      '30 Feet Wide Internal Roads',
      '30×40, 30×50 Sq ft and odd size plots',
      'Facing: North, East and West',
      'Vastu Compliant site plan',
      'Drinking Water + Borewell access',
      'Underground Electricity lines',
    ],
    address: '94VW+GF, Gopanakoppa, Hubballi, Karnataka 580032',
    transit: [
      { landmark: 'Unkal – Gopanakoppa Road', time: '2 Mins' },
      { landmark: 'JK School & Education Zone', time: '4 Mins' },
      { landmark: 'Keshwapur Circle', time: '8 Mins' },
      { landmark: 'Gabbur Bypass NH48', time: '12 Mins' },
    ],
    image: IMAGES.layouts,
    imagePosition: 'object-top',
  },
  {
    id: 'aarvi-pearl-residency',
    name: 'Aarvi Pearl Residency',
    category: 'Layouts',
    location: 'Gopanakoppa, Hubballi',
    highlightMetric: '30 Ft Wide Roads',
    secondaryMetric: '30×40 & 30×50 Sq Ft',
    summary:
      'An elegant residential layout in Gopanakoppa positioned minutes from Chinmaya School, Keshwapur Main Road, and Hubballi Central Railway Station.',
    overview:
      'Aarvi Pearl Residency combines structured residential planning, underground utilities, and clear legal documentation — making it a compelling address for families building long-term homes in North Hubballi.',
    specifications: [
      '30 Feet Wide Internal Roads',
      '30×40, 30×50 Sq ft and odd size plots',
      'Facing: North, East and West',
      'Vastu Compliant plot grid',
      'Drinking Water + Borewell facility',
      'Underground Electricity',
    ],
    address: '95PC+H8, Gopanakoppa, Hubballi, Karnataka 580023',
    transit: [
      { landmark: 'Gopanakoppa Circle', time: '3 Mins' },
      { landmark: 'Chinmaya School', time: '5 Mins' },
      { landmark: 'Keshwapur Main Road', time: '7 Mins' },
      { landmark: 'Hubballi Central Railway Station', time: '10 Mins' },
    ],
    image: IMAGES.layouts,
    imagePosition: 'object-top',
  },
  {
    id: 'aarvi-rosilian-park',
    name: 'Aarvi Rosilian Park',
    category: 'Layouts',
    location: 'Gopanakoppa, Hubballi',
    highlightMetric: '30 Ft Wide Roads',
    secondaryMetric: 'Clear Title Approved',
    summary:
      'A distinguished plotted community near JK School Campus and Unkal Lake Ring Road featuring clear legal titles and complete infrastructure.',
    overview:
      'Aarvi Rosilian Park delivers spacious plot configurations, peaceful surroundings, and reliable civic utilities designed for families and investors seeking an established Hubballi neighborhood.',
    specifications: [
      '30×40, 30×50 & odd size plots',
      'Wide 30 Feet Internal Roads',
      'Underground Electricity',
      'North, East & West facing plots',
      'Clear titles & legally approved',
      'Essential civic infrastructure ready',
    ],
    address: 'C534+XR, Gopanakoppa, Hubballi, Karnataka 580032',
    transit: [
      { landmark: 'JK School Campus', time: '3 Mins' },
      { landmark: 'Gopanakoppa Hub', time: '4 Mins' },
      { landmark: 'Unkal Lake Ring Road', time: '8 Mins' },
      { landmark: 'Keshwapur Suburb', time: '9 Mins' },
    ],
    image: IMAGES.layouts,
    imagePosition: 'object-top',
  },
  {
    id: 'west-avenue',
    name: 'West Avenue',
    category: 'Layouts',
    location: 'Revadihal, Hubballi',
    highlightMetric: '30 Ft Wide Roads',
    secondaryMetric: 'Growth Corridor',
    summary:
      'A future-ready plotted residential development in Revadihal positioned directly along the expanding Revadihal Industrial Corridor and Hubballi–Dharwad Expressway.',
    overview:
      'West Avenue features thoughtfully developed Vastu plots with wide roads, drinking water, borewell support, and underground electricity — combining serene residential planning with rapid corridor growth.',
    specifications: [
      '30 Feet Wide Internal Roads',
      '30×40, 30×50 Sq ft and odd size plots',
      'Facing: North, East and West',
      'Vastu Compliant layout',
      'Drinking Water + Borewell',
      'Underground Electricity',
    ],
    address: 'Revadihal, Hubballi, Karnataka 580030',
    transit: [
      { landmark: 'Revadihal Industrial Corridor', time: '2 Mins' },
      { landmark: 'Hubballi–Dharwad Expressway', time: '8 Mins' },
      { landmark: 'APMC Hubballi', time: '10 Mins' },
      { landmark: 'Railway Junction', time: '14 Mins' },
    ],
    image: IMAGES.layouts,
    imagePosition: 'object-top',
  },

  // Commercial (1)
  {
    id: 'jhanvi-trinity-square',
    name: 'Jhanvi Trinity Square',
    category: 'Commercial',
    location: 'Shirur Park, Vidya Nagar',
    highlightMetric: 'Prime Retail & Offices',
    secondaryMetric: 'Shirur Park Frontage',
    summary:
      'A prestigious commercial landmark in the heart of Vidya Nagar designed for corporate offices, flagship retail showrooms, and high-yield business investments.',
    overview:
      'Crafted with contemporary architecture, high-efficiency floor plates, dedicated customer and executive parking, high-speed elevators, and 24/7 security surveillance, Jhanvi Trinity Square provides the distinguished business address your enterprise deserves.',
    specifications: [
      'Prime Commercial Location at Shirur Park',
      'Flexible Retail & Corporate Office Floor Plates',
      'High Visibility & Wide Street Frontage',
      'Dedicated Customer & Executive Parking',
      'High-Speed Elevators',
      '24/7 CCTV & Security Surveillance',
      '100% Power Backup for Common Areas',
      'Vastu Compliant Commercial Planning',
    ],
    address: 'Shirur Park, Vidya Nagar, Hubballi, Karnataka 580021',
    transit: [
      { landmark: 'Shirur Park Junction', time: '1 Min' },
      { landmark: 'BRTS Corridor', time: '3 Mins' },
      { landmark: 'BVB Engineering Campus', time: '5 Mins' },
      { landmark: 'Hubballi Airport', time: '12 Mins' },
    ],
    image: IMAGES.commercial,
  },
];

export const COMPLETED_PROJECTS: CompletedProject[] = [
  // Completed Apartments (5)
  {
    id: 'jhanvi-heritage',
    name: 'Jhanvi Heritage',
    category: 'Apartments',
    location: 'Near Chinmaya School, Bhavani Nagar, Hubballi, Karnataka',
  },
  {
    id: 'kailash-vihar',
    name: 'Kailash Vihar',
    category: 'Apartments',
    location: 'Sundar Nagar, Near JK School, Hubballi, Karnataka',
  },
  {
    id: 'krishna-nilayam',
    name: 'Krishna Nilayam',
    category: 'Apartments',
    location: 'Adarsh Nagar, Hubballi, Karnataka',
  },
  {
    id: 'neelgiri-garden',
    name: 'Neelgiri Garden',
    category: 'Apartments',
    location: 'Keshwapur, Hubballi, Karnataka',
  },
  {
    id: 'jhanvi-grand',
    name: 'Jhanvi Grand',
    category: 'Apartments',
    location: 'Hubballi, Karnataka',
  },

  // Completed Layouts (8)
  {
    id: 'vandan',
    name: 'Vandan',
    category: 'Layouts',
    location: 'Sattur, Hubballi, Karnataka',
  },
  {
    id: 'vasudha-colony',
    name: 'Vasudha Colony',
    category: 'Layouts',
    location: 'Kusugal APMC Road, Hubballi, Karnataka',
  },
  {
    id: 'aarvi-park-1',
    name: 'Aarvi Park I',
    category: 'Layouts',
    location: 'Near Kariyamma Temple, Gamangatti, Hubballi, Karnataka',
  },
  {
    id: 'aarvij-nest-1',
    name: 'Aarvij Nest Ph I',
    category: 'Layouts',
    location: 'Near Unkal Gopanakoppa Road, Hubballi, Karnataka',
  },
  {
    id: 'aarvij-nest-2',
    name: 'Aarvij Nest Ph II',
    category: 'Layouts',
    location: 'Behind JK School, Hubballi, Karnataka',
  },
  {
    id: 'aarvij-nest-3',
    name: 'Aarvij Nest Ph III',
    category: 'Layouts',
    location: 'Near JK School, Hubballi, Karnataka',
  },
  {
    id: 'jhanvi-golden-residency',
    name: 'Jhanvi Golden Residency',
    category: 'Layouts',
    location: 'Navanagar, Hubballi, Karnataka',
  },
  {
    id: 'rani-empress',
    name: 'Rani Empress',
    category: 'Layouts',
    location: 'Near Don Bosco School, Sutagatti, Hubballi, Karnataka',
  },
];

export const QUALITY_PILLARS = [
  {
    title: 'Modern Design',
    description: 'Thoughtfully crafted floor plans and layouts built for contemporary family living.',
  },
  {
    title: 'Quality Assured',
    description: 'Constructed with certified materials and ISO 9001:2015 audited engineering standards.',
  },
  {
    title: 'Prime Locations',
    description: 'Strategically positioned across Hubballi–Dharwad corridors for steady growth and connectivity.',
  },
  {
    title: 'Happy Families',
    description: 'Over 1,800+ properties handed over with pride, clear titles, and lasting neighborhood trust.',
  },
];

export const SERVICES: ServiceItem[] = [
  {
    number: '01.',
    title: 'Expert Property Advisory',
    description:
      'Personalized guidance to help homebuyers and investors compare neighborhoods, evaluate appreciation potential, and make confident property decisions.',
  },
  {
    number: '02.',
    title: 'Legal & Documentation Assistance',
    description:
      'Complete support with HDMC and KHB/UDA approvals, title verifications, sale agreements, registrations, and bank loan compliance for a hassle-free handover.',
  },
  {
    number: '03.',
    title: 'Direct Sales Executive Consultation',
    description:
      'Speak directly with our experienced Hubballi advisory desk for transparent pricing, live plot availability, floor plans, and guided site inspections.',
  },
];

export const PROPERTY_JOURNEY: JourneyStep[] = [
  {
    number: '01',
    title: 'Talk To Our Sales Executive',
    subtitle: 'Ask',
    description:
      'Connect with our advisory team to understand project details, pricing, amenities, and investment benefits with complete clarity.',
  },
  {
    number: '02',
    title: 'Book For Site Visit',
    subtitle: 'Explore',
    description:
      'Schedule a guided site visit to walk the layout or apartment firsthand, inspect road widths, and experience the surrounding neighborhood.',
  },
  {
    number: '03',
    title: 'Buy Or Prebook Property',
    subtitle: 'Verify',
    description:
      'Select your preferred plot orientation or apartment unit with transparent pricing, verified approvals, and clear milestone timelines.',
  },
  {
    number: '04',
    title: 'End To End Documentation',
    subtitle: 'Own',
    description:
      'We manage all legal formalities—from title verification and sales agreements to sub-registrar deed execution—for a worry-free ownership transfer.',
  },
];

export const HONORS: HonorItem[] = [
  {
    number: '01',
    year: '2023–2024',
    title: 'RED FM Business Excellence Award',
    organization: '93.5 RED FM & Media Excellence Network',
    distinction: 'Excellence in Real Estate & Urban Infrastructure',
    description:
      'Conferred in recognition of outstanding performance in real estate delivery, structural integrity, and building thriving residential communities across North Karnataka.',
  },
  {
    number: '02',
    year: '2022–2023',
    title: 'Vijayavani Brand Leadership Honor',
    organization: 'Vijayavani & VRL Group Achievers Summit',
    distinction: 'Most Trusted Real Estate Brand',
    description:
      'Awarded for over a decade of unblemished trust, transparent governance, customer-centric project executions, and setting quality standards in residential layouts.',
  },
  {
    number: '03',
    year: '2021–2022',
    title: 'North Karnataka Leadership Award',
    organization: 'North Karnataka Real Estate Leadership Forum',
    distinction: 'Pioneer in Planned Layouts & Infrastructure',
    description:
      'Recognizing visionary leadership in expanding quality housing, modern amenities, and sustainable township developments across Karnataka and Maharashtra.',
  },
];

export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'mahesh-bennal',
    name: 'Mahesh Bennal',
    theme: 'Dream Home',
    location: 'Hubballi',
    quote:
      'My real estate journey was made simple by working with their hard-working crew. Finding my dream home became a wonderful experience thanks to their knowledge and individualized approach.',
  },
  {
    id: 'priya-desai',
    name: 'Priya Desai',
    theme: 'Legal Assurance',
    location: 'Hubballi',
    quote:
      'I was worried about legal papers before buying property, but they cleared all my doubts with patience. The process was simple, and I got my dream plot in a good location. I truly trust their work.',
  },
  {
    id: 'laxman-hiragannavar',
    name: 'Laxman Hiragannavar',
    theme: 'Expert Advisory',
    location: 'Hubballi',
    quote:
      'Sales representatives are absolutely outstanding in their expertise and comprehensive industry understanding. Thanks to their leadership and assistance.',
  },
  {
    id: 'anita-shetty',
    name: 'Anita Shetty',
    theme: 'Family Future',
    location: 'Bengeri, Hubballi',
    quote:
      'Their staff is very polite and responsive. They showed me multiple options in Bengeri and helped me choose the best one for my budget. I am happy that I chose Shri Durga Developers for my family’s future.',
  },
  {
    id: 'hanumantapa-harkuni',
    name: 'Hanumantapa Harkuni',
    theme: 'Exceeded Expectations',
    location: 'Hubballi',
    quote:
      'They helped us find a home that exceeded our expectations and they genuinely understood our needs. Highly advisable.',
  },
  {
    id: 'sneha-patil',
    name: 'Sneha Patil',
    theme: 'Transparent Investment',
    location: 'Karnataka',
    quote:
      'As a working woman, I wanted a safe and smart investment. They shared all details clearly and never forced me to decide fast. Today I feel proud that I invested with a genuine and transparent developer.',
  },
  {
    id: 'ravi-kumar',
    name: 'Ravi Kumar',
    theme: 'Honest Guidance',
    location: 'Vidyanagar, Hubballi',
    quote:
      'Shri Durga Developers helped me buy my first plot in Vidyanagar. The team explained everything clearly and guided me with full honesty. I felt very confident and safe about my investment.',
  },
  {
    id: 'meera-joshi',
    name: 'Meera Joshi',
    theme: 'Stress-Free Process',
    location: 'NRI / Outstation Buyer',
    quote:
      'I was staying outside Hubballi and needed someone reliable to guide me. Their team regularly updated me, handled documents, and made everything smooth. Buying a property with them was stress-free and comfortable.',
  },
];

export const JOURNAL_ARTICLES: JournalArticle[] = [
  {
    id: 'functional-kitchen-layout',
    number: '01',
    category: 'Kitchen Design',
    title: 'Importance of a Functional Kitchen Layout for Everyday Convenience',
    excerpt:
      'The kitchen is often referred to as the heart of a home, a place where families gather, meals are prepared, and memories are created. A poorly planned kitchen can make even simple tasks frustrating, while a well-thought-out layout transforms cooking into a seamless experience.',
    readTime: '4 min read',
    content: [
      'The kitchen is often referred to as the heart of a home, a place where families gather, meals are prepared, and daily routines unfold. A poorly planned kitchen creates unnecessary congestion and fatigue, whereas an ergonomically zoned layout turns everyday meal preparation into an effortless experience.',
      'Architectural work-triangle planning—optimizing the distance between the cooking hob, sink, and refrigerator—minimizes wasted steps while leaving ample counter expanse for preparation and appliances. Dedicated utility balconies adjacent to the kitchen keep heavy washing and storage neatly separated from the cooking core.',
      'Cross-ventilation and natural daylight are equally critical in Indian households. At Shri Durga Developers, apartment kitchens are oriented according to Vastu principles with direct exhaust shafts, ample window openings, and durable granite surfaces designed to age gracefully over decades.',
    ],
    keyTakeaways: [
      'Position sink, stove, and refrigerator in a clear ergonomic work triangle.',
      'Separate wet utility zones to keep the main kitchen clutter-free.',
      'Prioritize natural cross-ventilation and dedicated chimney exhaust ducts.',
    ],
  },
  {
    id: 'waterproofing-modern-homes',
    number: '02',
    category: 'Home Protection',
    title: 'The Importance of Waterproofing in Modern Homes',
    excerpt:
      'A home is more than just a shelter; it is a sanctuary that protects you and your loved ones. Waterproofing is one of the most essential yet often overlooked aspects of home construction and maintenance.',
    readTime: '3 min read',
    content: [
      'A home is more than a shelter; it is a long-term sanctuary protecting your family and investment. Yet waterproofing remains one of the most critical—and frequently under-discussed—pillars of enduring civil engineering.',
      'Unchecked moisture infiltration weakens concrete reinforcement, leads to dampness and efflorescence on interior walls, and causes costly repainting cycles after every monsoon season. Preventing water ingress during structural execution is dramatically more effective than superficial post-handover repairs.',
      'Comprehensive multi-stage waterproofing across sunken bathroom slabs, terrace parapets, exterior masonry joints, and overhead water tanks ensures dry, healthy indoor air quality and preserves the structural longevity of your residence.',
    ],
    keyTakeaways: [
      'Insist on chemical and crystalline waterproofing in terraces and wet areas.',
      'Proper slope grading on balconies prevents stagnant rainwater accumulation.',
      'Quality exterior elastomeric coatings shield facades through monsoon cycles.',
    ],
  },
  {
    id: 'energy-efficient-homes',
    number: '03',
    category: 'Sustainability',
    title: 'Energy-Efficient Homes: How Sustainable Design Saves Money and the Environment',
    excerpt:
      'Modern homes are evolving beyond mere shelters; they have become reflections of lifestyle, values, and responsibility. Energy-efficient homes represent a smart investment for both the planet and your wallet.',
    readTime: '4 min read',
    content: [
      'Modern residences are evolving beyond enclosed structures into responsive environments that reflect comfort, financial prudence, and environmental responsibility. Passive architectural design is the single highest-impact way to lower household energy costs.',
      'Strategic building orientation, deep sun-shading balconies, and independent wall separation significantly reduce midday thermal gain during Hubballi’s warm summers, lowering air-conditioning demand naturally.',
      'Combined with abundant daylighting, low-flow water fixtures, rainwater harvesting pits in plotted layouts, and LED common-area illumination, energy-conscious developments reduce recurring utility bills while elevating resale value.',
    ],
    keyTakeaways: [
      'Cross-ventilation and independent walls cut indoor summer heat buildup.',
      'Natural daylighting reduces daytime electrical consumption across living rooms.',
      'Rainwater harvesting and underground utilities future-proof plotted layouts.',
    ],
  },
  {
    id: 'balconies-outdoor-spaces',
    number: '04',
    category: 'Lifestyle',
    title: 'The Role of Balconies and Outdoor Spaces in Enhancing Lifestyle',
    excerpt:
      'In modern homes, attention is often drawn to interiors. Yet outdoor spaces — balconies, terraces, and gardens — play an equally important role in defining the quality of life.',
    readTime: '3 min read',
    content: [
      'While buyers naturally focus on living room dimensions and bedroom finishes, transitional outdoor spaces—wide sit-out balconies, landscaped community parks, and tree-lined avenues—play a decisive role in daily well-being.',
      'A thoughtfully proportioned balcony invites morning sunlight, fresh air, and quiet conversation over tea, extending the perceived footprint of an apartment without sacrificing privacy.',
      'In our plotted layouts like Nature Nest and Jhanvi Nandanam Residency, dedicated landscaped parks, Civic Amenity spaces, and 30-foot wide walkable roads create a breathing neighborhood fabric where children play safely and neighbors genuinely connect.',
    ],
    keyTakeaways: [
      'Generous balconies act as natural thermal buffers and sunlit extensions.',
      'Landscaped layout parks foster community wellness and family recreation.',
      'Green views consistently enhance long-term property desirability.',
    ],
  },
  {
    id: 'quality-construction-priority',
    number: '05',
    category: 'Buying Guide',
    title: 'Why Quality Construction Should Be Your Top Priority When Buying a Home',
    excerpt:
      'Buying a home is one of the most significant investments anyone can make in a lifetime. Beyond the floor plan and location, the quality of construction determines how well a home stands the test of time.',
    readTime: '5 min read',
    content: [
      'Acquiring a home or residential plot is among the most meaningful financial commitments a family makes. While location and floor plan capture initial attention, construction discipline and engineering standards determine how peacefully you will live for decades to come.',
      'True quality starts below the surface: soil testing, certified steel and concrete grades, plumb masonry, concealed electrical conduits, and strict adherence to approved structural drawings. In residential layouts, it means properly compacted 9-meter or 30-foot asphalt roads, underground drainage, and clear demarcation.',
      'Guided by ISO 9001:2015 quality management practices and over 15 years of execution across 1,800+ delivered properties, Shri Durga Developers invites every buyer to inspect materials, verify approvals, and visit our completed Hubballi landmarks before making a decision.',
    ],
    keyTakeaways: [
      'Evaluate a developer’s completed past projects to judge aging and maintenance.',
      'Verify ISO quality processes, clear titles, and municipal bylaws compliance.',
      'Prioritize structural integrity and infrastructure over cosmetic staging.',
    ],
  },
];

export const CAREER_ROLES: CareerRole[] = [
  {
    id: 'telecaller',
    number: '01',
    title: 'Telecaller',
    department: 'Customer Operations',
    summary:
      'Responsible for engaging prospective and current homebuyers over the phone, understanding buyer preferences, presenting suitable projects, and coordinating follow-ups with our site advisory team.',
    responsibilities: [
      'Strong verbal communication and active listening abilities',
      'Tailoring property presentations in response to customer requirements',
      'Acquiring, organizing, and retaining accurate contact databases',
      'Interacting across calls, email, chat, and digital inquiry channels',
      'Recommending suitable plots, apartments, or commercial options',
      'Ensuring seamless handoffs of site-visit opportunities to sales executives',
    ],
    requirements: [
      'Graduate or Post Graduate in any field',
      '0–2 years of proven experience in telecalling or client coordination',
      'Strong interpersonal and follow-up management skills',
      'Personable, adaptable, and eager to build genuine customer relationships',
    ],
  },
  {
    id: 'sales-marketing',
    number: '02',
    title: 'Sales & Marketing',
    department: 'Business Growth & Strategy',
    summary:
      'Drive revenue and client trust across Hubballi–Dharwad by developing structured business plans, achieving sales milestones, collaborating on lead generation, and mentoring the field sales team.',
    responsibilities: [
      'Developing business plans and achieving planned project sales targets',
      'Conducting guided site visits and transparent buyer consultations',
      'Coordinating with the marketing team on regional lead generation campaigns',
      'Facilitating training programs and performance activities for sales executives',
      'Maintaining long-term relationships with homebuyers, investors, and channel partners',
    ],
    requirements: [
      'Graduate or MBA in Marketing, Business, or Real Estate preferred',
      'Proven track record in real estate or high-value consultative sales',
      'Deep familiarity with Hubballi–Dharwad residential and commercial markets',
      'Strong negotiation, presentation, and team leadership capabilities',
    ],
  },
  {
    id: 'accountant',
    number: '03',
    title: 'Accountant',
    department: 'Finance & Governance',
    summary:
      'Support critical financial governance by maintaining accurate project accounts, managing statutory compliance, conducting internal audits, and reconciling banking statements throughout the year.',
    responsibilities: [
      'Collecting, tracking, and verifying company and project financial records',
      'Preparing for financial audits and maintaining transparent compliance trails',
      'Reconciling bank statements, vendor ledgers, and customer payment schedules',
      'Supporting GST, TDS, and real estate regulatory financial reporting',
    ],
    requirements: [
      'B.Com / M.Com or equivalent qualification in Accounting & Finance',
      'Proficiency in Tally, Excel, and real estate project accounting workflows',
      'High attention to detail, integrity, and statutory compliance knowledge',
      'Strong analytical and financial documentation skills',
    ],
  },
];

export const FAQS: FaqItem[] = [
  {
    question: 'What is the process of buying a property?',
    answer:
      'The process begins with selecting your preferred plot, apartment, or commercial space, verifying all title documents with our legal desk, paying the booking token, completing the sales agreement formalities, and finally executing the registered sale deed at the sub-registrar office.',
  },
  {
    question: 'What documents should I verify before purchasing a property?',
    answer:
      'Before purchasing, you should verify the Mother Deed and clear title chain, NA (Non-Agricultural) conversion order, HDMC / KHB / UDA sanctioned layout plan or building plan approval, Encumbrance Certificate (EC), and latest property tax receipts. Our team shares a complete verification docket for every project.',
  },
  {
    question: 'How do I know if a property is legally approved?',
    answer:
      'All Shri Durga Developers projects adhere strictly to HDMC, KHB/UDA, and applicable RERA/local municipal bylaws. During your office or site visit, our legal assistance team walks you through original approval orders, sanctioned site layout maps, and title verification reports.',
  },
  {
    question: 'What payment options are usually available when buying a property?',
    answer:
      'We offer structured, transparent payment schedules aligned with booking, agreement execution, construction or development milestones, and final registration. Payments are accepted via standard banking channels (RTGS, NEFT, cheque, and approved home loan disbursements).',
  },
  {
    question: 'Can I apply for a home loan for the property?',
    answer:
      'Yes. Because our residential layouts and apartment projects carry clear legal titles and statutory approvals, buyers can avail home or plot loans from leading nationalized and private sector banks. Our documentation team assists with all required bank legal papers.',
  },
  {
    question: 'When does the property ownership officially transfer to the buyer?',
    answer:
      'Official legal ownership transfers to the buyer upon execution and registration of the Sale Deed at the jurisdictional Sub-Registrar Office, followed by Khata/mutation transfer into the buyer’s name.',
  },
];
