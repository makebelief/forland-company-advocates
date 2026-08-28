(() => {
  const p = (text) => `<p>${text}</p>`;
  const button = (text, href = "/contact", alt = false) =>
    `<a class="owner-button${alt ? " alt" : ""}" href="${href}">${text}</a>`;
  const hero = (kicker, title, intro, actions = "") =>
    `<section class="owner-hero"><div class="owner-kicker">${kicker}</div><h1>${title}</h1><p>${intro}</p>${actions ? `<div class="owner-actions">${actions}</div>` : ""}</section>`;
  const section = (title, body, kicker = "") =>
    `<section class="owner-section">${kicker ? `<div class="owner-kicker">${kicker}</div>` : ""}<h2>${title}</h2>${body}</section>`;

  const audiences = [
    [
      "Businesses & Companies",
      "We advise businesses at different stages of their development, from establishment and structuring to expansion, commercial transactions, regulatory compliance and dispute resolution. We work with companies seeking both one-off legal assistance and continuing legal support for their operations.",
    ],
    [
      "Entrepreneurs & Founders",
      "We assist entrepreneurs and founders with business structuring, agreements, investments, partnerships, employment matters, intellectual property and other legal issues that arise as a business develops.",
    ],
    [
      "Investors",
      "We advise local and international investors on investments, transactions, property, corporate structures, commercial agreements and regulatory requirements, helping them understand and manage legal risks.",
    ],
    [
      "Property Owners & Developers",
      "We assist property owners, developers, landlords, tenants and other stakeholders with transactions and legal matters relating to real estate and development.",
    ],
    [
      "Employers & Employees",
      "We advise both employers and employees on contracts, workplace issues, disciplinary processes, termination, disputes and compliance with employment law.",
    ],
    [
      "Financial Institutions & Borrowers",
      "We provide legal support in relation to financing arrangements, securities, loan documentation, debt recovery and related commercial matters.",
    ],
    [
      "Technology & Digital Businesses",
      "We advise technology companies and digital businesses on commercial agreements, data protection, intellectual property, technology transactions and regulatory issues.",
    ],
    [
      "International Clients",
      "We assist individuals, businesses and investors with legal interests or activities in Kenya, providing local legal support and guidance on Kenyan law.",
    ],
    [
      "Individuals & Families",
      "We provide legal advice and representation in matters including property, succession and estate planning, employment, disputes and immigration.",
    ],
  ];

  const values = [
    [
      "We Listen",
      "We begin by understanding the client, the circumstances and the objective to be achieved.",
    ],
    [
      "We Think Strategically",
      "We consider not only the immediate legal issue but also the wider commercial, financial and practical implications.",
    ],
    [
      "We Communicate Clearly",
      "We believe clients should understand their legal position and the options available to them. We strive to provide clear and straightforward advice.",
    ],
    [
      "We Focus on Solutions",
      "Our objective is not simply to identify problems. We work with our clients to determine practical and legally sound ways forward.",
    ],
    [
      "We Build Long-Term Relationships",
      "We seek to become trusted legal advisers, supporting clients when legal problems arise and when they are making important decisions and pursuing new opportunities.",
    ],
  ];

  const services = [
    [
      "corporate-commercial",
      "01",
      "Corporate & Commercial Law",
      "Building, Structuring & Protecting Businesses",
      "We advise businesses, entrepreneurs, investors and organisations on legal issues throughout the life of a business. Our focus is helping clients structure their affairs, manage risk and pursue commercial opportunities.",
      [
        "Company incorporation and registration",
        "Corporate structuring and restructuring",
        "Shareholders' agreements",
        "Partnership and joint venture arrangements",
        "Corporate governance",
        "Directors' duties and advisory",
        "Commercial contracts and agreements",
        "Business acquisitions and disposals",
        "Mergers and corporate reorganisations",
        "Corporate and commercial due diligence",
        "Legal audits and risk assessments",
        "Contract audits and reviews",
        "Regulatory and corporate compliance",
        "Franchise, distribution and agency arrangements",
        "General commercial advisory",
      ],
    ],
    [
      "litigation-dispute",
      "02",
      "Litigation & Dispute Resolution",
      "Protecting Your Position. Pursuing the Right Outcome.",
      "We provide strategic advice and representation aimed at protecting our clients' interests and achieving effective resolution, assessing each dispute on its facts, evidence, legal merits and commercial implications.",
      [
        "Civil and commercial litigation",
        "Contractual disputes",
        "Debt recovery",
        "Property and land disputes",
        "Employment disputes",
        "Commercial and shareholder disputes",
        "Injunctions and interlocutory applications",
        "Judicial review",
        "Negotiation and settlement",
        "Mediation",
        "Arbitration and alternative dispute resolution",
        "Representation before courts and relevant tribunals",
      ],
    ],
    [
      "real-estate",
      "03",
      "Real Estate & Conveyancing",
      "Protecting Property Transactions & Investments",
      "We advise purchasers, sellers, property owners, developers, landlords, tenants and investors on transactions and disputes involving land and real estate.",
      [
        "Sale and purchase of property",
        "Conveyancing",
        "Transfer and registration of property",
        "Land due diligence",
        "Property searches and title review",
        "Leases and tenancy agreements",
        "Landlord and tenant matters",
        "Development agreements",
        "Property financing and related securities",
        "Mortgages and charges",
        "Real estate joint ventures",
        "Land and property disputes",
      ],
    ],
    [
      "employment-labour",
      "04",
      "Employment & Labour Law",
      "Helping Employers & Employees Navigate the Workplace",
      "We advise clients from the beginning of the employment relationship through to its conclusion and any disputes that may arise.",
      [
        "Employment contracts",
        "Employment policies and staff handbooks",
        "Human resource documentation",
        "Employment compliance reviews",
        "Disciplinary procedures",
        "Performance management",
        "Termination of employment",
        "Redundancy and restructuring",
        "Workplace grievances",
        "Employment disputes",
        "Workplace investigations",
        "Representation before courts and labour institutions",
      ],
    ],
    [
      "banking-finance",
      "05",
      "Banking & Finance",
      "Supporting Financing & Financial Transactions",
      "We advise lenders, borrowers, businesses and investors on financing and financial transactions, helping clients understand obligations, structure transactions and protect their interests.",
      [
        "Loan and facility agreements",
        "Financing documentation",
        "Security documentation",
        "Mortgages and charges",
        "Debentures",
        "Guarantees and indemnities",
        "Corporate borrowing",
        "Asset finance",
        "Debt restructuring",
        "Debt recovery and enforcement",
        "Due diligence for financing transactions",
      ],
    ],
    [
      "technology",
      "06",
      "Technology, Data Protection & Intellectual Property",
      "Legal Support for the Digital Economy",
      "We advise technology companies, digital businesses, organisations and individuals on legal issues arising from technology, data and intellectual property.",
      [
        "Data protection and privacy advisory",
        "Data protection compliance reviews and audits",
        "Data processing agreements",
        "Privacy policies and notices",
        "Technology contracts",
        "Software licensing",
        "Software development agreements",
        "Website and platform terms",
        "Intellectual property protection",
        "Trademark and copyright matters",
        "Confidentiality agreements",
        "Technology and data-related disputes",
      ],
    ],
    [
      "immigration-mobility",
      "07",
      "Immigration & Business Mobility",
      "Supporting Individuals, Investors & Businesses Moving Across Borders",
      "We assist individuals, companies and organisations with immigration and business mobility matters arising from their activities in Kenya.",
      [
        "Work permits",
        "Entry permits",
        "Passes",
        "Residency-related matters",
        "Investor immigration",
        "Business immigration",
        "Immigration compliance",
        "Corporate immigration support",
        "Advisory for foreign employees and executives",
      ],
    ],
    [
      "estate-planning",
      "08",
      "Family, Succession & Estate Planning",
      "Protecting Families, Assets & Legacies",
      "We advise clients on planning, administration and transfer of estates and family assets, helping reduce uncertainty and potential future disputes.",
      [
        "Wills",
        "Estate planning",
        "Succession planning",
        "Probate and administration",
        "Letters of administration",
        "Estate distribution",
        "Trusts and related arrangements",
        "Family property matters",
        "Succession disputes",
        "Estate-related litigation",
        "Intergenerational wealth transfer",
      ],
    ],
    [
      "construction",
      "09",
      "Construction, Infrastructure & Projects",
      "Legal Support From Project Inception to Completion",
      "We support developers, contractors, consultants, investors and project owners with the contracts, regulatory requirements and legal risks involved in construction and infrastructure projects.",
      [
        "Construction contracts",
        "Contractor and subcontractor agreements",
        "Development agreements",
        "Project documentation",
        "Procurement and commercial contracts",
        "Construction due diligence",
        "Regulatory and contractual compliance",
        "Project financing documentation",
        "Claims and dispute management",
        "Construction disputes",
      ],
    ],
    [
      "energy-emobility",
      "10",
      "Electric Mobility, Clean Energy & Sustainable Transport",
      "Legal Solutions for Emerging Mobility & Energy Businesses",
      "We provide integrated legal support to electric vehicle businesses, charging infrastructure developers, battery-swapping operators, fleet operators, technology companies, investors, financiers and clean-energy enterprises.",
      [
        "Corporate structuring",
        "Commercial agreements",
        "Distribution and dealership arrangements",
        "Electric vehicle transactions",
        "Charging infrastructure agreements",
        "Battery-swapping arrangements",
        "Fleet and mobility agreements",
        "Energy and supply agreements",
        "Investment and financing arrangements",
        "Regulatory and licensing advisory",
        "Technology and data protection",
        "Project documentation",
        "Legal due diligence",
        "Dispute resolution",
      ],
    ],
  ];

  function home() {
    return (
      hero(
        "Forland & Company Advocates",
        "Expertise. Strategy. Results.",
        "Providing strategic legal counsel for today's opportunities and challenges.",
        button("Speak to an Advocate") +
          button("Our Legal Services", "/practice-areas", true),
      ) +
      `<div class="owner-wrap">` +
      section(
        "Legal Advice With Your Objectives in Mind",
        p(
          "Legal matters rarely exist in isolation. A commercial agreement can affect your business relationships. A property transaction can represent a significant investment. A dispute can interrupt your operations. A regulatory requirement can determine whether a business can enter a market or expand.",
        ) +
          p(
            "We take the time to understand the circumstances behind each matter and the outcome our client is seeking. Our approach combines legal analysis, strategic thinking and practical advice to help clients make informed decisions and take appropriate action.",
          ),
      ) +
      section(
        "What We Do",
        p(
          "We provide legal services across a range of practice areas relevant to our clients' personal, commercial and professional needs, including Corporate & Commercial Law, Litigation & Dispute Resolution, Conveyancing & Real Estate, Employment & Labour Law, Banking & Finance, Technology & Data Protection, Intellectual Property, Immigration, Estate Planning & Succession, and other specialised areas.",
        ) + button("Explore Our Legal Services", "/practice-areas"),
      ) +
      section(
        "Who We Serve",
        p(
          "Our clients come to us with different legal needs, but they share a common requirement: legal advice that understands their circumstances and helps them move forward.",
        ) +
          `<div class="owner-grid">${audiences.map(([h, b]) => `<article class="owner-card"><h3>${h}</h3><p>${b}</p></article>`).join("")}</div>`,
      ) +
      section(
        "Electric Mobility, Clean Energy & Sustainable Transport",
        p(
          "The transition towards electric mobility, clean energy and sustainable transport is creating new opportunities for businesses and investors across Kenya and the wider region.",
        ) +
          p(
            "We have developed a particular focus on legal support for electric vehicle manufacturers and dealers, charging infrastructure developers, battery-swapping operators, fleet operators, transport businesses, technology companies, investors, financiers and clean-energy enterprises.",
          ) +
          p(
            "Our legal support extends across corporate structuring, commercial agreements, investment and financing transactions, regulatory matters, property, technology, employment, data protection and dispute resolution.",
          ),
        "Supporting the Businesses of Tomorrow",
      ) +
      section(
        "Practical. Strategic. Client-Focused.",
        `<div class="owner-grid">${values.map(([h, b]) => `<article class="owner-card"><h3>${h}</h3><p>${b}</p></article>`).join("")}</div>`,
        "Why Forland & Company Advocates?",
      ) +
      section(
        "A Legal Partner for Important Decisions",
        p(
          "The right legal advice can protect an investment, prevent a dispute, strengthen a transaction or provide clarity at a critical moment.",
        ) +
          p(
            "We seek to understand our clients' businesses, investments and objectives so that we can provide legal support that is relevant to where they are today and where they intend to go.",
          ) +
          p(
            "<strong>Your objectives matter. Our role is to help you pursue them with the benefit of sound legal advice and strategic counsel.</strong>",
          ) +
          button("Let's Discuss Your Legal Needs"),
      ) +
      `</div>`
    );
  }

  function about() {
    const standards = [
      [
        "Integrity",
        "Honesty, professionalism and respect for our ethical obligations.",
      ],
      [
        "Excellence",
        "Rigorous analysis, careful research, thorough preparation and continuous professional development.",
      ],
      [
        "Client Focus",
        "The client's objectives remain at the centre of our work.",
      ],
      [
        "Responsiveness",
        "Clear communication and efficient responses to clients' needs.",
      ],
      [
        "Strategic Thinking",
        "Attention to the wider implications, risks and opportunities surrounding a matter.",
      ],
      [
        "Practicality",
        "Advice clients can understand, evaluate and use to make informed decisions.",
      ],
    ];
    return (
      hero(
        "About Us",
        "A Different Approach to Legal Practice",
        "A modern Kenyan law firm providing practical, strategic and high-quality legal services to individuals, businesses, investors and organisations.",
      ) +
      `<div class="owner-wrap">` +
      section(
        "A Different Approach to Legal Practice",
        p(
          "Good legal practice is about more than knowing the law. It requires an understanding of the client, the circumstances in which a legal issue arises and the objectives that need to be achieved.",
        ) +
          p(
            "We look beyond the immediate legal question to understand the wider context of each matter. This enables us to provide advice that is clear, commercially aware and capable of being acted upon.",
          ),
      ) +
      section(
        "Understand. Analyse. Strategise. Act.",
        `<div class="owner-grid">${[
          [
            "01. Understand",
            "We listen to the facts, circumstances, concerns and objectives behind each matter.",
          ],
          [
            "02. Analyse",
            "We examine the applicable law, documents, evidence, risks and relevant circumstances.",
          ],
          [
            "03. Strategise",
            "We consider available options and develop a strategy suited to the client's objectives.",
          ],
          [
            "04. Act",
            "We implement the chosen strategy through documents, negotiation, regulatory engagement, transactions, dispute resolution or court representation.",
          ],
        ]
          .map(
            ([h, b]) =>
              `<article class="owner-card"><h3>${h}</h3><p>${b}</p></article>`,
          )
          .join("")}</div>`,
        "Our Approach",
      ) +
      section(
        "Practical Law. Strategic Thinking.",
        p(
          "Clients come to us because they have a problem to solve, a decision to make, a transaction to complete, an opportunity to pursue or a risk to manage.",
        ) +
          p(
            "Our responsibility is to bridge the gap between <strong>legal knowledge and practical decision-making</strong>, giving clients clarity about their position and confidence about what to do next.",
          ),
        "Our Philosophy",
      ) +
      section(
        "Understanding the Business Behind the Legal Matter",
        p(
          "Businesses operate within environments shaped by commercial pressures, regulation, financing, technology, competition and relationships. Legal advice should therefore be informed by the commercial context in which a client operates.",
        ) +
          p(
            "This enables us to provide advice that is solution-oriented, commercially conscious and relevant to the decisions our clients need to make.",
          ),
        "Our Commercial Mindset",
      ) +
      section(
        "The Standards That Guide Our Work",
        `<div class="owner-grid">${standards.map(([h, b]) => `<article class="owner-card"><h3>${h}</h3><p>${b}</p></article>`).join("")}</div>`,
        "Our Values",
      ) +
      section(
        "More Than a Lawyer for the Moment",
        p(
          "We value relationships that extend beyond a single legal matter. Our aim is to become a <strong>trusted legal adviser and long-term partner</strong>, supporting clients as their operations develop and their legal needs evolve.",
        ),
        "Building Long-Term Client Relationships",
      ) +
      section(
        "Building a Respected Kenyan Law Firm",
        p(
          "To build a respected and trusted Kenyan law firm recognised for professional excellence, practical legal solutions, strategic thinking and meaningful client relationships.",
        ),
        "Our Vision",
      ) +
      section(
        "Legal Advice That Moves Clients Forward",
        p(
          "To provide clear, practical and strategic legal services that enable our clients to protect their interests, manage legal risk, resolve disputes, pursue opportunities and achieve their objectives with confidence.",
        ),
        "Our Mission",
      ) +
      section(
        "A Modern Practice for a Changing Environment",
        p(
          "Technology is transforming businesses. New industries are emerging. Investment structures are becoming increasingly sophisticated, while data, privacy, electric mobility and clean energy are creating new commercial and regulatory considerations.",
        ) +
          p(
            "We are committed to building a practice that remains commercially relevant, technologically aware and responsive to the changing needs of our clients.",
          ),
        "Looking Ahead",
      ) +
      button("Have a Legal Matter to Discuss?") +
      `</div>`
    );
  }

  function practice() {
    return (
      hero(
        "Legal Services",
        "Legal Expertise. Practical Solutions. Strategic Advice.",
        "Legal advice and representation across commercial, contentious, transactional and advisory matters.",
        button("Speak to an Advocate"),
      ) +
      `<div class="owner-wrap">${services.map(([id, no, name, tag, desc, items]) => `<section class="owner-service" id="${id}"><div class="owner-kicker">${no} · ${name}</div><h2>${tag}</h2><p>${desc}</p><h3>Our services include</h3><ul class="owner-list">${items.map((i) => `<li>${i}</li>`).join("")}</ul>${button("Discuss This Matter")}</section>`).join("")}${section("Integrated Legal Support for Complex Matters", p("Some legal matters do not fit neatly within a single practice area. Where a matter involves multiple legal considerations, we bring together the relevant areas of our practice to provide coordinated legal advice and support."))}</div>`
    );
  }

  function team() {
    return (
      hero(
        "Our Team",
        "Counsel You Can Trust",
        "Experienced Counsel. Strategic Thinking. Personal Attention.",
      ) +
      `<div class="owner-wrap">` +
      section(
        "Asbjorn Ng’ani",
        `<h3>Managing Partner | Advocate of the High Court of Kenya</h3>${p("Asbjorn Ng’ani is an Advocate of the High Court of Kenya and the Managing Partner of Forland & Company Advocates.")}${p("His practice spans corporate and commercial law, banking and finance, real estate and conveyancing, employment and labour law, technology and data protection, intellectual property, immigration, succession and estate planning, construction and infrastructure, and litigation and dispute resolution.")}${p("He brings a commercially aware approach to legal practice, seeking to understand the client's broader objectives and develop legal strategies that are both technically sound and capable of being implemented in practice.")}${p("His professional interests include electric mobility, clean energy, sustainable transport and digital businesses. As Managing Partner, he is responsible for the firm's strategic direction and is committed to developing a modern, client-focused practice built on expertise, strategy and results.")}`,
      ) +
      section(
        "Clear Thinking. Strategic Advice. Practical Action.",
        `<div class="owner-grid">${[
          [
            "Understanding the Client",
            "We listen carefully to the facts, circumstances and objectives.",
          ],
          [
            "Technical Excellence",
            "Careful legal research, analysis and preparation.",
          ],
          [
            "Commercial Awareness",
            "Attention to the commercial and practical consequences of legal decisions.",
          ],
          [
            "Collaboration",
            "Coordinated advice across different areas of law and with other professional advisers.",
          ],
          ["Responsiveness", "Timely communication and clear guidance."],
        ]
          .map(
            ([h, b]) =>
              `<article class="owner-card"><h3>${h}</h3><p>${b}</p></article>`,
          )
          .join("")}</div>`,
        "Our Professional Approach",
      ) +
      section(
        "Professional Development & Excellence",
        p(
          "The law, technology, business environment and regulatory landscape are constantly evolving. We are committed to continuous professional development, knowledge-sharing and continuous improvement.",
        ),
      ) +
      button("Work With Our Team") +
      `</div>`
    );
  }

  function insights() {
    return (
      hero(
        "Insights",
        "Legal Knowledge. Commercial Perspective. Practical Guidance.",
        "Practical legal commentary and updates designed to help businesses, investors, professionals and individuals understand developments that may affect them.",
      ) +
      `<div class="owner-wrap">` +
      section(
        "Our Latest Insights",
        p(
          "The legal and commercial environment is constantly evolving. New legislation and regulations are introduced. Courts continue to develop the law through decisions. Businesses face emerging risks and opportunities, while technology transforms established industries and creates new sectors.",
        ) +
          p(
            "We aim to make legal information clear, relevant and useful—particularly where a legal development has practical or commercial implications.",
          ),
      ) +
      section(
        "Important Notice",
        p(
          "The information published on this page is provided for general informational purposes only and does not constitute legal advice.",
        ) +
          p(
            "Legal issues are fact-specific and may require consideration of the applicable law, circumstances and current legal developments. Readers should seek professional legal advice before acting or relying on information contained in any article or publication.",
          ),
      ) +
      `</div>`
    );
  }

  function contact() {
    const options = services
      .map(([, , name]) => `<option>${name}</option>`)
      .join("");
    return (
      hero(
        "Contact Us",
        "Let's Discuss Your Legal Needs",
        "Whether you require legal advice, representation, assistance with a transaction, support with a business project or ongoing legal counsel, we are available to discuss your requirements.",
      ) +
      `<div class="owner-wrap"><section class="owner-section"><div class="owner-contact-grid"><aside class="owner-contact-card"><div class="owner-kicker">Speak With Us</div><h2>Forland & Company Advocates</h2><p>Landmark Plaza, 4th Floor, Left Wing<br>Argwings Kodhek Road<br>Nairobi, Kenya</p><p><strong>Telephone:</strong> <a href="tel:+254713001575">+254 713 001 575</a><br><strong>Email:</strong> <a href="mailto:forlandcompanyadvocates@gmail.com">forlandcompanyadvocates@gmail.com</a></p><p><strong>Office Hours</strong><br>Monday – Friday<br>8:00 a.m. – 5:00 p.m.</p><p><em>Appointments outside regular office hours may be arranged where appropriate.</em></p></aside><form class="owner-form" name="contact" method="POST" data-netlify="true"><input type="hidden" name="form-name" value="contact"><div class="owner-kicker">Send Us an Enquiry</div><h2>Tell Us About Your Matter</h2><label for="owner-name">Full Name*</label><input id="owner-name" name="name" required><label for="owner-company">Company / Organisation</label><input id="owner-company" name="company"><label for="owner-email">Email Address*</label><input id="owner-email" type="email" name="email" required><label for="owner-phone">Telephone Number*</label><input id="owner-phone" type="tel" name="phone" required><label for="owner-area">What Can We Assist You With?*</label><select id="owner-area" name="practice_area" required><option value="">Select a Practice Area</option>${options}<option>Other</option></select><label for="owner-message">Briefly Tell Us About Your Matter*</label><textarea id="owner-message" name="message" required></textarea><fieldset><legend>Preferred Method of Contact</legend>${["Telephone", "Email", "WhatsApp", "In-person consultation", "Video consultation"].map((x) => `<label><input type="radio" name="preferred_contact" value="${x}"> ${x}</label>`).join("")}</fieldset><label for="owner-time">Preferred Time to Contact You</label><input id="owner-time" name="preferred_time"><button class="owner-button" type="submit">SUBMIT ENQUIRY</button></form></div></section><section class="contact-map-section" aria-labelledby="owner-map-title"><div class="contact-map-header"><div><p class="contact-map-eyebrow">Find Our Office</p><h2 class="contact-map-title" id="owner-map-title">Visit Forland & Company Advocates</h2><p class="contact-map-address">Landmark Plaza, Argwings Kodhek Road, Nairobi</p></div><a class="contact-map-link" href="https://www.google.com/maps/search/?api=1&query=Landmark%20Plaza%2C%20Argwings%20Kodhek%20Road%2C%20Nairobi%2C%20Kenya" target="_blank" rel="noopener noreferrer">VIEW ON GOOGLE MAPS</a></div><iframe class="contact-map-frame" title="Google Map showing Forland & Company Advocates at Landmark Plaza" src="https://www.google.com/maps?q=Landmark%20Plaza%2C%20Argwings%20Kodhek%20Road%2C%20Nairobi%2C%20Kenya&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></section>${section("Need Legal Advice?", p("You do not need to have a complete understanding of your legal position before contacting us. If you are uncertain about your rights, obligations or available options, we can assist you in assessing the matter and determining the appropriate course of action."))}</div>`
    );
  }

  const pages = {
    "/": home,
    "/about": about,
    "/practice-areas": practice,
    "/team": team,
    "/insights": insights,
    "/contact": contact,
  };

  function brand() {
    document
      .querySelectorAll("header a[aria-label*='home'], footer a[href='/']")
      .forEach((link) => {
        if (link.querySelector(".owner-logo")) return;
        link.innerHTML = `<img class="owner-logo" src="/assets/media/forland-logo.png" alt="Forland & Company Advocates">`;
      });
    const desktop = document.querySelector("header nav .hidden.lg\\:flex");
    if (desktop && !desktop.querySelector("a[href='/team']")) {
      const link = document.createElement("a");
      link.href = "/team";
      link.textContent = "TEAM";
      link.className =
        "nav-underline text-sm font-medium tracking-wide text-primary-800";
      desktop.insertBefore(link, desktop.lastElementChild);
    }
    const mobile = document.querySelector("header .px-6.py-8.flex.flex-col");
    if (mobile && !mobile.querySelector("a[href='/team']")) {
      const link = document.createElement("a");
      link.href = "/team";
      link.textContent = "Team";
      link.className =
        "py-4 text-lg font-medium text-primary-800 border-b border-background-200";
      mobile.insertBefore(link, mobile.lastElementChild);
    }
  }

  let applied = "";
  function apply() {
    brand();
    const path = window.location.pathname.replace(/\/$/, "") || "/";
    const render = pages[path];
    const main = document.querySelector("main");
    if (
      !render ||
      !main ||
      (applied === path && main.classList.contains("owner-page"))
    )
      return;
    main.className = "owner-page";
    main.innerHTML = render();
    applied = path;
    if (window.location.hash)
      setTimeout(
        () => document.querySelector(window.location.hash)?.scrollIntoView(),
        50,
      );
  }

  apply();
  new MutationObserver(apply).observe(document.getElementById("root"), {
    childList: true,
    subtree: true,
  });
  window.addEventListener("popstate", () => {
    applied = "";
    setTimeout(apply);
  });
})();
