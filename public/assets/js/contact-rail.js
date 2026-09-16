(() => {
  const rail = document.createElement('aside');
  rail.className = 'contact-rail';
  rail.setAttribute('aria-label', 'Quick contact options');
  rail.innerHTML = `
    <button class="contact-rail-toggle" type="button" aria-label="Hide quick contact options" aria-expanded="true">
      <i class="ri-arrow-right-line contact-rail-arrow" aria-hidden="true"></i>
    </button>
    <div class="contact-rail-actions">
      <a class="contact-rail-link" href="https://wa.me/254753504745" target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp">
        <i class="ri-whatsapp-line" aria-hidden="true"></i>
      </a>
      <a class="contact-rail-link" href="tel:+254713001575" aria-label="Call 0713 001 575">
        <i class="ri-phone-fill" aria-hidden="true"></i>
      </a>
    </div>`;

  const toggle = rail.querySelector('.contact-rail-toggle');
  toggle.addEventListener('click', () => {
    const collapsed = rail.classList.toggle('is-collapsed');
    toggle.setAttribute('aria-expanded', String(!collapsed));
    toggle.setAttribute('aria-label', collapsed ? 'Show quick contact options' : 'Hide quick contact options');
  });

  document.body.appendChild(rail);
})();
