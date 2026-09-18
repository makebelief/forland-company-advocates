export const site = {
  name: 'Forland & Company Advocates',
  shortName: 'Forland Advocates',
  origin: 'https://forlandcompanyadvocates.co.ke',
  email: 'forlandcompanyadvocates@gmail.com',
  telephone: '+254753504745',
  secondaryTelephone: '+254713001575',
  image: '/assets/media/hero-poster-nairobi.jpg',
  logo: '/favicon-logo-master.png',
  address: {
    streetAddress: 'Landmark Plaza, 4th Floor, Left Wing, Argwings Kodhek Road',
    addressLocality: 'Nairobi',
    addressRegion: 'Nairobi County',
    addressCountry: 'KE',
  },
};

const page = (title, description, options = {}) => ({
  title,
  description,
  type: options.type || 'website',
  schemaType: options.schemaType || 'WebPage',
  image: options.image || site.image,
  imageAlt: options.imageAlt || title.split(' | ')[0],
  serviceType: options.serviceType,
  datePublished: options.datePublished,
});

export const pages = {
  '/': page(
    'Law Firm in Nairobi, Kenya | Forland & Company Advocates',
    'Forland & Company Advocates is a Nairobi law firm advising businesses, investors and individuals on corporate, commercial, disputes, property and employment law in Kenya.',
    { schemaType: 'WebPage', imageAlt: 'Forland & Company Advocates, a law firm in Nairobi, Kenya' },
  ),
  '/about': page(
    'Forland & Company Advocates | Nairobi Law Firm',
    'Learn about Forland & Company Advocates, a Nairobi law firm providing practical, commercially focused legal counsel to businesses, investors and individuals in Kenya.',
    { schemaType: 'AboutPage', image: '/assets/media/client-sept18/gold-scales-office.jpg', imageAlt: 'Forland & Company Advocates in Nairobi, Kenya' },
  ),
  '/practice-areas': page(
    'Legal Services in Nairobi, Kenya | Forland Advocates',
    'Explore legal services in corporate law, litigation, real estate, employment, banking, data protection, immigration, succession, construction and e-mobility in Kenya.',
    { schemaType: 'CollectionPage', image: '/assets/media/client-practice/corporate-commercial.jpg', imageAlt: 'Legal services offered by Forland & Company Advocates in Kenya' },
  ),
  '/practice-areas/corporate-commercial': page(
    'Corporate & Commercial Lawyers Nairobi | Forland Advocates',
    'Corporate and commercial lawyers in Nairobi advising on company formation, contracts, governance, transactions, restructuring, due diligence and compliance in Kenya.',
    { image: '/assets/media/client-practice/corporate-commercial.jpg', imageAlt: 'Corporate and commercial legal services in Nairobi, Kenya', serviceType: 'Corporate and Commercial Law' },
  ),
  '/practice-areas/litigation-dispute': page(
    'Litigation & Dispute Resolution Lawyers Nairobi | Forland',
    'Litigation and dispute resolution lawyers in Nairobi representing clients in commercial, contractual, property, employment and shareholder disputes across Kenya.',
    { image: '/assets/media/client-practice/litigation-dispute.png', imageAlt: 'Litigation and dispute resolution legal services in Kenya', serviceType: 'Litigation and Dispute Resolution' },
  ),
  '/practice-areas/real-estate': page(
    'Real Estate & Conveyancing Lawyers Nairobi | Forland',
    'Nairobi real estate lawyers handling conveyancing, land due diligence, sales, purchases, leases, development, securities and property disputes across Kenya.',
    { image: '/assets/media/client-practice/real-estate.jpg', imageAlt: 'Real estate and conveyancing legal services in Kenya', serviceType: 'Real Estate and Conveyancing Law' },
  ),
  '/practice-areas/employment-labour': page(
    'Employment & Labour Lawyers Nairobi | Forland Advocates',
    'Employment and labour lawyers in Nairobi advising employers and employees on contracts, policies, compliance, discipline, termination, redundancy and disputes in Kenya.',
    { image: '/assets/media/client-practice/employment-labour.jpg', imageAlt: 'Employment and labour law services in Kenya', serviceType: 'Employment and Labour Law' },
  ),
  '/practice-areas/banking-finance': page(
    'Banking & Finance Lawyers Nairobi | Forland Advocates',
    'Banking and finance lawyers in Nairobi advising lenders, borrowers and investors on facilities, securities, mortgages, guarantees, restructuring and enforcement in Kenya.',
    { image: '/assets/media/client-practice/banking-finance.jpg', imageAlt: 'Banking and finance legal services in Kenya', serviceType: 'Banking and Finance Law' },
  ),
  '/practice-areas/technology-data-ip': page(
    'Data Protection & Technology Lawyers Kenya | Forland',
    'Kenyan lawyers advising on data protection, privacy, technology contracts, software licensing, trademarks, copyright, intellectual property and digital businesses.',
    { image: '/assets/media/client-practice/technology-data-protection.jpg', imageAlt: 'Data protection, technology and intellectual property legal services in Kenya', serviceType: 'Technology, Data Protection and Intellectual Property Law' },
  ),
  '/practice-areas/immigration-mobility': page(
    'Immigration & Work Permit Lawyers Kenya | Forland Advocates',
    'Kenya immigration lawyers assisting with work permits, passes, investor immigration, foreign employees, residency matters and corporate immigration compliance.',
    { image: '/assets/media/client-practice/immigration-mobility.jpg', imageAlt: 'Immigration and business mobility legal services in Kenya', serviceType: 'Immigration and Business Mobility Law' },
  ),
  '/practice-areas/estate-planning': page(
    'Succession & Estate Planning Lawyers Nairobi | Forland',
    'Succession and estate planning lawyers in Nairobi advising on wills, probate, letters of administration, trusts, estate distribution and family property matters in Kenya.',
    { image: '/assets/media/client-practice/family-succession-estate-planning.jpg', imageAlt: 'Succession and estate planning legal services in Kenya', serviceType: 'Family, Succession and Estate Planning Law' },
  ),
  '/practice-areas/construction-projects': page(
    'Construction & Projects Lawyers Kenya | Forland Advocates',
    'Construction lawyers in Kenya advising developers, contractors and investors on contracts, procurement, project documentation, financing, claims and dispute resolution.',
    { image: '/assets/media/client-practice/construction-projects.jpg', imageAlt: 'Construction, infrastructure and projects legal services in Kenya', serviceType: 'Construction, Infrastructure and Projects Law' },
  ),
  '/practice-areas/energy-emobility': page(
    'E-Mobility & Clean Energy Lawyers Kenya | Forland Advocates',
    'Legal counsel in Kenya for electric mobility, charging infrastructure, battery swapping, clean energy investment, sustainable transport and related commercial matters.',
    { image: '/assets/media/client-practice/electric-mobility.jpg', imageAlt: 'E-mobility and clean energy legal services in Kenya', serviceType: 'E-Mobility and Clean Energy Law' },
  ),
  '/insights': page(
    'Kenya Legal Insights for Business | Forland Advocates',
    'Practical Kenyan legal insights on company formation, commercial contracts, governance, property due diligence, employment compliance and electric mobility.',
    { schemaType: 'CollectionPage', image: '/assets/media/client-sept18/grow-legal-documents.jpg', imageAlt: 'Kenya legal insights for businesses and investors' },
  ),
  '/insights/establishing-business': page(
    'How to Establish a Business in Kenya: Legal Guide | Forland',
    'A practical legal guide to business structures, ownership, governance, contracts, intellectual property and continuing compliance when establishing a business in Kenya.',
    { type: 'article', schemaType: 'Article', image: '/assets/media/client-sept18/corporate-office.jpg', imageAlt: 'Legal considerations when establishing a business in Kenya', datePublished: '2026-09-02' },
  ),
  '/insights/commercial-agreement': page(
    'Commercial Agreements in Kenya: Legal Checklist | Forland',
    'A practical checklist for reviewing commercial agreements in Kenya, including scope, payment, liability, termination, confidentiality, IP and dispute resolution.',
    { type: 'article', schemaType: 'Article', image: '/assets/media/client-sept18/commercial-contract.jpg', imageAlt: 'Reviewing a commercial agreement in Kenya', datePublished: '2026-09-02' },
  ),
  '/insights/emobility-sector': page(
    'Kenya E-Mobility Sector: Legal Considerations | Forland',
    'Legal and commercial considerations for electric vehicles, charging networks, battery swapping, investment and sustainable mobility businesses operating in Kenya.',
    { type: 'article', schemaType: 'Article', image: '/assets/media/client-practice/electric-mobility.jpg', imageAlt: 'Legal considerations for Kenya e-mobility businesses', datePublished: '2026-09-02' },
  ),
  '/insights/corporate-governance': page(
    'Corporate Governance in Kenya: Practical Guide | Forland',
    'A practical guide to governance structures, director responsibilities, decision-making, company records and risk management for growing businesses in Kenya.',
    { type: 'article', schemaType: 'Article', image: '/assets/media/client-sept18/corporate-tax-documents.jpg', imageAlt: 'Corporate governance and compliance in Kenya', datePublished: '2026-09-02' },
  ),
  '/insights/property-due-diligence': page(
    'Property Due Diligence in Kenya: Buyer Guide | Forland',
    'A practical guide to the legal checks property buyers and investors should make in Kenya, including title review, searches, approvals and transaction documentation.',
    { type: 'article', schemaType: 'Article', image: '/assets/media/client-sept18/real-estate-apartments.jpg', imageAlt: 'Property due diligence for buyers and investors in Kenya', datePublished: '2026-09-02' },
  ),
  '/insights/employment-compliance': page(
    'Employment Compliance in Kenya: Employer Guide | Forland',
    'A practical guide for Kenyan employers on employment contracts, workplace policies, records, discipline, termination, redundancy and employee data compliance.',
    { type: 'article', schemaType: 'Article', image: '/assets/media/client-sept18/employment-agreement.jpg', imageAlt: 'Employment compliance and contracts in Kenya', datePublished: '2026-09-02' },
  ),
  '/our-team': page(
    'Asbjorn Ng’ani | Managing Partner | Forland Advocates',
    'Meet Asbjorn Ng’ani, Managing Partner and Advocate of the High Court of Kenya, and learn about the client-focused approach of Forland & Company Advocates in Nairobi.',
    { schemaType: 'ProfilePage', image: '/assets/media/client-sept18/team-collaboration.jpg', imageAlt: 'Forland & Company Advocates legal team in Nairobi' },
  ),
  '/contact': page(
    'Contact Forland & Company Advocates | Nairobi, Kenya',
    'Contact Forland & Company Advocates at Landmark Plaza, Argwings Kodhek Road, Nairobi, for corporate, commercial, property, employment and dispute-resolution advice.',
    { schemaType: 'ContactPage', image: '/assets/media/client-sept18/gold-scales-office.jpg', imageAlt: 'Contact Forland & Company Advocates in Nairobi, Kenya' },
  ),
  '/privacy-policy': page(
    'Privacy Policy | Forland & Company Advocates',
    'Read how Forland & Company Advocates collects, uses, protects and manages personal information submitted through this website.',
  ),
  '/terms-of-use': page(
    'Website Terms of Use | Forland & Company Advocates',
    'Read the terms governing use of the Forland & Company Advocates website, including legal-information, confidentiality and liability notices.',
  ),
};

export const lastModified = '2026-09-18';
