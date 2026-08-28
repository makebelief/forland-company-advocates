(() => {
  const shared = new Map([
    ["Practical legal solutions for business, investment and growth. A Kenyan law firm committed to integrity, excellence and innovation.", "Providing strategic legal counsel for today's opportunities and challenges."],
    ["Available on request", "+254 713 001 575"],
    ["Use the secure inquiry form", "forlandcompanyadvocates@gmail.com"],
    ["Office details provided when appointments are confirmed", "Landmark Plaza, 4th Floor, Left Wing, Argwings Kodhek Road"],
  ]);

  const home = new Map([
    ["Practical Legal Solutions for Business, Investment & Growth", "Expertise. Strategy. Results."],
    ["A Kenyan law firm delivering practical, timely and client-focused legal solutions to businesses, investors and individuals.", "Forland & Company Advocates is a modern Kenyan law firm providing practical, strategic and client-focused legal solutions to businesses, investors, entrepreneurs and individuals."],
    ["Legal Advice That Moves Your Objectives Forward", "Legal Advice With Your Objectives in Mind"],
    ["We believe effective legal advice should help clients make better decisions. Whether you are building a business, negotiating an agreement or planning your estate, we provide clear, practical and timely counsel.", "We believe that effective legal advice should go beyond identifying what the law says. It should help you understand your position, assess your options and make confident decisions."],
    ["Legal Services Built Around Your Objectives", "Practical Solutions. Strategic Advice."],
    ["Structuring, documenting and guiding the commercial transactions that establish and grow businesses.", "We advise businesses, entrepreneurs, investors and organisations on the legal issues that arise throughout the life of a business."],
    ["Resolving commercial and civil disputes through clear strategy, negotiation and, where needed, litigation.", "Strategic advice and representation aimed at protecting your interests and achieving effective resolution."],
    ["Guiding property acquisitions, transfers, leases and financing with rigorous title diligence.", "Protecting property transactions and investments through careful legal due diligence."],
    ["Practical support for the employment relationship, from contracts to compliance and dispute resolution.", "Helping employers and employees navigate the workplace from contracts through disputes."],
    ["Advising lenders and borrowers on security, loan documentation and financing transactions.", "Supporting lenders, borrowers, businesses and investors in financing and financial transactions."],
    ["Estate Planning & Private Client", "Family, Succession & Estate Planning"],
    ["Protecting wealth and securing succession for families, business owners and private clients.", "Protecting families, assets and legacies through succession and estate planning."],
    ["Immigration & Mobility", "Immigration & Business Mobility"],
    ["Supporting businesses, investors and expatriates with Kenyan immigration and mobility matters.", "Supporting individuals, investors and businesses moving across borders."],
    ["Energy, E-Mobility & Sustainable Transport", "Electric Mobility, Clean Energy & Sustainable Transport"],
    ["Advising the businesses and investors shaping Kenya’s clean energy and electric mobility future.", "Legal solutions for emerging mobility and energy businesses across Kenya and the region."],
    ["Legal Support for Every Stage of Business", "Building, Structuring & Protecting Businesses"],
    ["We advise companies, entrepreneurs, investors and institutions on the structures, agreements and transactions required to establish, operate, protect and grow their businesses.", "Our corporate and commercial practice covers day-to-day legal advisory and complex transactions, helping clients structure their affairs, manage risk and pursue commercial opportunities."],
    ["Why Forland?", "Practical. Strategic. Client-Focused."],
    ["Legal matters involve business objectives, investments, relationships and long-term plans. We understand the full picture.", "We consider not only the immediate legal issue but also the wider commercial, financial and practical implications."],
    ["New ideas and technology to meet an evolving world.", "Clear, practical advice that clients can understand, evaluate and use."],
    ["A Clear Path from Inquiry to Action", "Understand. Analyse. Strategise. Act."],
    ["Understand your circumstances and objectives.", "Understand the facts, circumstances, concerns and objectives."],
    ["Identify legal issues, risks and available options.", "Analyse the applicable law, documents, evidence and risks."],
    ["Develop a practical approach aligned with your goals.", "Develop a strategy suited to your objectives."],
    ["Guide the matter forward with timely support.", "Implement the chosen strategy with focused legal support."],
    ["Legal Solutions for the Future of Mobility and Energy", "Supporting the Businesses of Tomorrow"],
    ["The transition toward electric mobility, renewable energy and sustainable transport is creating new business models and regulatory challenges. We advise businesses and investors in this evolving landscape.", "The transition towards electric mobility, clean energy and sustainable transport is creating new opportunities for businesses and investors across Kenya and the wider region."],
    ["Doing Business in Kenya", "Legal Support for International Clients"],
    ["Kenya offers significant opportunities for businesses and investors in East Africa. We assist international companies, foreign investors, expatriates and diaspora clients with legal matters connected to Kenya.", "We assist individuals, businesses and investors with legal interests or activities in Kenya, providing local legal support and guidance on Kenyan law and regulatory requirements."],
    ["Let’s Move Your Matter Forward.", "Let's Discuss Your Legal Needs"],
    ["Whether you are building a business, entering a transaction, investing in Kenya or resolving a dispute, we are ready to help.", "Whether you require assistance with a business transaction, legal dispute, investment, property matter, regulatory issue or another legal concern, we invite you to speak with us."],
  ]);

  const about = new Map([
    ["Practical Legal Counsel. Clear Commercial Thinking.", "A Different Approach to Legal Practice"],
    ["A Kenyan law firm committed to delivering practical, timely and client-focused legal solutions.", "Practical, strategic and high-quality legal services to individuals, businesses, investors and organisations."],
    ["A Modern Kenyan Law Firm", "Practical Law. Strategic Thinking."],
    ["Forland & Company Advocates delivers practical, timely and client-focused legal solutions to businesses, investors, entrepreneurs, institutions and individuals.", "Forland & Company Advocates is a modern Kenyan law firm providing practical, strategic and high-quality legal services to individuals, businesses, investors and organisations."],
    ["Established on the principles of integrity, excellence and innovation, we combine sound legal knowledge with an understanding of the commercial realities that shape our clients' decisions.", "We believe that good legal practice is about more than knowing the law. It requires an understanding of the client, the circumstances in which a legal issue arises and the objectives that need to be achieved."],
    ["How We Work", "Understand. Analyse. Strategise. Act."],
    ["Commercial Focus", "Understand"],
    ["Legal advice must serve commercial objectives. We combine sound law with practical understanding.", "We begin by listening to the facts, circumstances, concerns and objectives behind each matter."],
    ["Practical & Timely", "Analyse"],
    ["Clear, actionable advice within useful timeframes so clients can make confident decisions.", "We examine the applicable law, documents, evidence, risks and relevant circumstances."],
    ["Client-Focused", "Strategise & Act"],
    ["We understand your circumstances first, then tailor our approach to the outcome you need.", "We develop a strategy suited to the client's objectives and assist in implementing the chosen course of action."],
    ["The Principles That Guide Us", "The Standards That Guide Our Work"],
    ["Honesty, professionalism and respect in everything we do.", "Honesty, professionalism and respect for our ethical obligations."],
    ["High standards of legal work and professional service.", "Rigorous analysis, careful research, thorough preparation and continuous professional development."],
    ["Supporting Clients at Every Stage", "More Than a Lawyer for the Moment"],
    ["From start-ups and SMEs to established companies, investors and families, we provide commercially focused legal support across the business and investment lifecycle.", "We value relationships that extend beyond a single legal matter and aim to become a trusted legal adviser and long-term partner."],
  ]);

  const practice = new Map([
    ...home,
    ["Legal Services Built Around Your Objectives", "Legal Expertise. Practical Solutions. Strategic Advice."],
    ["Commercially focused legal support across the full business and investment lifecycle.", "Legal advice and representation across commercial, contentious, transactional and advisory matters."],
  ]);

  const insights = new Map([
    ["Insights for Better Legal and Commercial Decisions", "Legal Knowledge. Commercial Perspective. Practical Guidance."],
    ["Practical perspectives on the legal and commercial considerations shaping business in Kenya.", "Practical legal commentary and updates designed to help businesses, investors, professionals and individuals understand developments that may affect them."],
  ]);

  const contact = new Map([
    ["Let’s Move Your Matter Forward.", "Let's Discuss Your Legal Needs"],
    ["Whether you are building a business, entering a transaction, investing in Kenya or resolving a dispute, we are ready to help.", "Whether you require legal advice, representation, assistance with a transaction, support with a business project or ongoing legal counsel, we are available to discuss your requirements."],
    ["Get in Touch", "Speak With Us"],
    ["Share a brief description of your matter and a member of our team will respond to arrange a suitable time to discuss your objectives.", "Tell us briefly about your legal matter and our team will get in touch with you."],
    ["Phone", "Telephone"],
    ["Monday–Friday, by appointment", "Monday – Friday, 8:00 a.m. – 5:00 p.m."],
    ["SUBMIT YOUR INQUIRY", "SUBMIT ENQUIRY"],
    ["Visit our office", "Find Our Office"],
  ]);

  const routeMaps = { "/": home, "/about": about, "/practice-areas": practice, "/insights": insights, "/contact": contact };

  function replaceText(root, map) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const original = node.nodeValue;
      const trimmed = original.trim();
      const replacement = map.get(trimmed);
      if (!replacement) continue;
      node.nodeValue = original.replace(trimmed, replacement);
    }
  }

  function apply() {
    const main = document.querySelector("main");
    if (main) {
      replaceText(main, shared);
      replaceText(main, routeMaps[window.location.pathname] || new Map());
    }
    const footer = document.querySelector("footer");
    if (footer) replaceText(footer, shared);
  }

  apply();
  new MutationObserver(apply).observe(document.getElementById("root"), { childList: true, subtree: true });
})();
