(() => {
  const mapQuery = "Landmark Plaza, Argwings Kodhek Road, Nairobi, Kenya";

  function updateContactDetails(main) {
    const replacements = new Map([
      [
        "Office details provided when appointments are confirmed",
        "Landmark Plaza, 4th Floor, Left Wing, Argwings Kodhek Road",
      ],
      ["Available on request", "+254 753 504 745 / +254 713 001 575"],
    ]);

    main.querySelectorAll("p").forEach((element) => {
      const replacement = replacements.get(element.textContent.trim());
      if (!replacement) return;

      element.textContent = replacement;
    });
  }

  function addMap() {
    if (window.location.pathname !== "/contact") return;

    const main = document.querySelector("main");
    if (!main || main.querySelector(".contact-map-section")) return;

    const contactGrid = main.querySelector("section .grid");
    if (!contactGrid) return;

    updateContactDetails(main);

    const section = document.createElement("section");
    section.className = "contact-map-section";
    section.setAttribute("aria-labelledby", "contact-map-heading");
    section.innerHTML = `
      <div class="contact-map-header">
        <div>
          <p class="contact-map-eyebrow">Visit our office</p>
          <h2 class="contact-map-title" id="contact-map-heading">Landmark Plaza, Argwings Kodhek Road</h2>
          <p class="contact-map-address">4th Floor, Left Wing · Nairobi, Kenya</p>
        </div>
        <a class="contact-map-link" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}" target="_blank" rel="noopener noreferrer">
          <i class="ri-direction-line" aria-hidden="true"></i>
          OPEN IN GOOGLE MAPS
        </a>
      </div>
      <iframe
        class="contact-map-frame"
        title="Google Map showing Forland & Company Advocates at Landmark Plaza"
        src="https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        allowfullscreen>
      </iframe>`;

    contactGrid.append(section);
  }

  addMap();
  const observer = new MutationObserver(addMap);
  observer.observe(document.getElementById("root"), { childList: true, subtree: true });
})();
