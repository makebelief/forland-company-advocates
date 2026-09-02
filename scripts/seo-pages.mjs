export const site = {
  name: 'Forland & Company Advocates',
  shortName: 'Forland Advocates',
  origin: 'https://forlandcompanyadvocates.co.ke',
  email: 'forlandcompanyadvocates@gmail.com',
  telephone: '+254713001575',
  image: '/assets/media/hero-poster-nairobi.jpg',
  logo: '/favicon-logo-master.png',
};

const page = (title, description, type = 'website') => ({ title, description, type });

export const pages = {
  '/': page(
    'Corporate & Commercial Lawyers in Nairobi | Forland Advocates',
    'Nairobi law firm advising businesses, investors and individuals on corporate, commercial, property, disputes, employment, finance and investment law in Kenya.',
  ),
  '/about': page(
    'About Our Nairobi Law Firm | Forland Advocates',
    'Meet Forland & Company Advocates, a Nairobi law firm providing strategic, commercially focused legal counsel to businesses, investors and individuals in Kenya.',
  ),
  '/practice-areas': page(
    'Legal Services & Practice Areas in Kenya | Forland Advocates',
    'Explore our legal services in corporate law, litigation, property, employment, banking, technology, immigration, succession, construction and clean energy.',
  ),
  '/practice-areas/corporate-commercial': page(
    'Corporate & Commercial Lawyers Kenya | Forland Advocates',
    'Corporate and commercial lawyers in Nairobi advising on company formation, contracts, governance, transactions, restructuring, due diligence and compliance in Kenya.',
  ),
  '/practice-areas/litigation-dispute': page(
    'Litigation & Dispute Resolution Lawyers Kenya | Forland Advocates',
    'Strategic representation in Kenyan commercial, contractual, property, employment and shareholder disputes, including negotiation, mediation, arbitration and litigation.',
  ),
  '/practice-areas/real-estate': page(
    'Real Estate & Conveyancing Lawyers Kenya | Forland Advocates',
    'Nairobi property lawyers handling conveyancing, land due diligence, sales, purchases, leases, developments, securities and real estate disputes across Kenya.',
  ),
  '/practice-areas/employment-labour': page(
    'Employment & Labour Lawyers Kenya | Forland Advocates',
    'Employment lawyers advising Kenyan employers and employees on contracts, policies, compliance, discipline, termination, redundancy and workplace disputes.',
  ),
  '/practice-areas/banking-finance': page(
    'Banking & Finance Lawyers Kenya | Forland Advocates',
    'Legal advice for lenders, borrowers and investors on loans, securities, mortgages, guarantees, restructuring, enforcement and financing transactions in Kenya.',
  ),
  '/practice-areas/technology-data-ip': page(
    'Technology, Data Protection & IP Lawyers Kenya | Forland Advocates',
    'Kenyan legal counsel for technology contracts, data protection compliance, privacy, software licensing, trademarks, copyright and digital businesses.',
  ),
  '/practice-areas/immigration-mobility': page(
    'Immigration & Business Mobility Lawyers Kenya | Forland Advocates',
    'Kenya immigration legal services for work permits, passes, investor immigration, foreign employees, residency matters and corporate immigration compliance.',
  ),
  '/practice-areas/estate-planning': page(
    'Succession & Estate Planning Lawyers Kenya | Forland Advocates',
    'Legal advice on wills, trusts, probate, letters of administration, succession planning, estate distribution and family property matters in Kenya.',
  ),
  '/practice-areas/construction-projects': page(
    'Construction & Infrastructure Lawyers Kenya | Forland Advocates',
    'Legal support for Kenyan construction and infrastructure projects, including contracts, procurement, financing, due diligence, claims and dispute resolution.',
  ),
  '/practice-areas/energy-emobility': page(
    'Clean Energy & E-Mobility Lawyers Kenya | Forland Advocates',
    'Legal counsel for electric mobility, charging infrastructure, battery swapping, clean energy investment, sustainable transport and related regulation in Kenya.',
  ),
  '/insights': page(
    'Kenya Legal Insights for Business | Forland Advocates',
    'Practical Kenyan legal insights on business formation, commercial contracts, governance, property, employment compliance and electric mobility.',
  ),
  '/insights/establishing-business': page(
    'Establishing a Business in Kenya: Legal Guide | Forland Advocates',
    'A practical legal guide to choosing a structure, registering, governing and maintaining regulatory compliance when establishing a business in Kenya.',
    'article',
  ),
  '/insights/commercial-agreement': page(
    'Commercial Agreements in Kenya: Drafting Guide | Forland Advocates',
    'Key legal issues Kenyan businesses should address when reviewing and negotiating commercial agreements, obligations, risk allocation and dispute clauses.',
    'article',
  ),
  '/insights/emobility-sector': page(
    'Kenya E-Mobility Sector: Legal Considerations | Forland Advocates',
    'Legal and regulatory considerations for electric vehicles, charging networks, battery swapping, investment and sustainable mobility businesses in Kenya.',
    'article',
  ),
  '/insights/corporate-governance': page(
    'Corporate Governance in Kenya: Practical Guide | Forland Advocates',
    'A practical guide to governance structures, director duties, decision-making, records and risk management for companies operating in Kenya.',
    'article',
  ),
  '/insights/property-due-diligence': page(
    'Property Due Diligence in Kenya: Buyer Guide | Forland Advocates',
    'What property buyers and investors should verify before completing a land or real estate transaction in Kenya, from title searches to approvals.',
    'article',
  ),
  '/insights/employment-compliance': page(
    'Employment Compliance in Kenya: Employer Guide | Forland Advocates',
    'A practical guide for Kenyan employers covering contracts, records, workplace policies, discipline, termination, redundancy and employee data.',
    'article',
  ),
  '/our-team': page(
    'Our Legal Team | Forland & Company Advocates Nairobi',
    'Meet Asbjorn Ng’ani, Managing Partner and Advocate of the High Court of Kenya, and learn about the client-focused approach of our Nairobi law firm.',
  ),
  '/contact': page(
    'Contact Our Nairobi Lawyers | Forland Advocates',
    'Contact Forland & Company Advocates at Landmark Plaza, Argwings Kodhek Road, Nairobi, for strategic legal advice and representation in Kenya.',
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

export const lastModified = '2026-09-02';
