(() => {
  'use strict';

  const scriptElement = document.currentScript;
  const measurementId = scriptElement?.dataset.measurementId || 'G-084LNP4DC1';
  const storageKey = 'forland.analyticsConsent.v1';
  let analyticsLoaded = false;
  let consentGranted = false;
  let lastTrackedPage = '';

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500,
  });

  const readChoice = () => {
    try {
      return window.localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  };

  const saveChoice = (choice) => {
    try {
      window.localStorage.setItem(storageKey, choice);
    } catch {
      // Consent still applies for this page if storage is unavailable.
    }
  };

  const clearAnalyticsCookies = () => {
    document.cookie.split(';').forEach((cookie) => {
      const name = cookie.split('=')[0].trim();
      if (name === '_ga' || name.startsWith('_ga_')) {
        const expiry = 'Max-Age=0; path=/; SameSite=Lax';
        document.cookie = `${name}=; ${expiry}`;
        document.cookie = `${name}=; ${expiry}; domain=.${window.location.hostname}`;
      }
    });
  };

  const trackPageView = () => {
    if (!consentGranted) return;
    const page = `${window.location.pathname}${window.location.search}`;
    if (page === lastTrackedPage) return;
    lastTrackedPage = page;
    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: page,
    });
  };

  const loadAnalytics = () => {
    if (analyticsLoaded) {
      trackPageView();
      return;
    }

    analyticsLoaded = true;
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      send_page_view: false,
      anonymize_ip: true,
    });

    const analyticsScript = document.createElement('script');
    analyticsScript.async = true;
    analyticsScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    analyticsScript.dataset.forlandAnalytics = 'true';
    document.head.appendChild(analyticsScript);
    trackPageView();
  };

  const applyConsent = (choice) => {
    consentGranted = choice === 'granted';
    window.gtag('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: consentGranted ? 'granted' : 'denied',
    });

    if (consentGranted) loadAnalytics();
    else clearAnalyticsCookies();
  };

  const renderControls = () => {
    const wrapper = document.createElement('div');
    wrapper.id = 'forland-analytics-consent';
    wrapper.innerHTML = `
      <section class="analytics-consent" role="dialog" aria-modal="false" aria-labelledby="analytics-consent-title" aria-describedby="analytics-consent-copy">
        <div class="analytics-consent__copy">
          <h2 id="analytics-consent-title">Your privacy choices</h2>
          <p id="analytics-consent-copy">We use optional Google Analytics cookies to understand how visitors use this website and improve it. Advertising storage stays disabled. You can accept analytics or continue with essential website functions only. Read our <a href="/privacy-policy">Privacy Policy</a>.</p>
        </div>
        <div class="analytics-consent__actions">
          <button type="button" data-consent="denied">Essential only</button>
          <button type="button" class="analytics-consent__accept" data-consent="granted">Accept analytics</button>
        </div>
      </section>
      <button type="button" class="analytics-consent__manage" aria-label="Manage analytics privacy preferences">Privacy settings</button>
    `;
    document.body.appendChild(wrapper);

    const banner = wrapper.querySelector('.analytics-consent');
    const manageButton = wrapper.querySelector('.analytics-consent__manage');

    const showBanner = () => {
      banner.hidden = false;
      manageButton.hidden = true;
      window.requestAnimationFrame(() => banner.classList.add('is-visible'));
    };

    const hideBanner = () => {
      banner.classList.remove('is-visible');
      window.setTimeout(() => {
        banner.hidden = true;
        manageButton.hidden = false;
      }, 220);
    };

    wrapper.querySelectorAll('[data-consent]').forEach((button) => {
      button.addEventListener('click', () => {
        const choice = button.dataset.consent;
        saveChoice(choice);
        applyConsent(choice);
        hideBanner();
      });
    });

    manageButton.addEventListener('click', showBanner);

    const savedChoice = readChoice();
    if (savedChoice === 'granted' || savedChoice === 'denied') {
      banner.hidden = true;
      manageButton.hidden = false;
      applyConsent(savedChoice);
    } else {
      manageButton.hidden = true;
      showBanner();
    }
  };

  const trackNavigation = () => {
    const handleRouteChange = () => window.setTimeout(trackPageView, 0);
    ['pushState', 'replaceState'].forEach((method) => {
      const original = window.history[method];
      window.history[method] = function wrappedHistoryMethod(...args) {
        const result = original.apply(this, args);
        handleRouteChange();
        return result;
      };
    });
    window.addEventListener('popstate', handleRouteChange);
  };

  const trackLeadActions = () => {
    document.addEventListener('click', (event) => {
      if (!consentGranted) return;
      const link = event.target.closest('a[href]');
      if (!link) return;
      const href = link.href;
      let eventName = '';
      if (href.startsWith('tel:')) eventName = 'phone_click';
      else if (href.startsWith('mailto:')) eventName = 'email_click';
      else if (/https?:\/\/(wa\.me|api\.whatsapp\.com)/i.test(href)) eventName = 'whatsapp_click';
      else if (new URL(href, window.location.href).pathname === '/contact') eventName = 'contact_click';
      if (eventName) window.gtag('event', eventName, { link_url: href });
    });

    document.addEventListener('submit', (event) => {
      if (!consentGranted) return;
      const form = event.target;
      if (form instanceof HTMLFormElement && (form.name === 'contact' || form.querySelector('[name="form-name"][value="contact"]'))) {
        window.gtag('event', 'generate_lead', { form_name: 'contact' });
      }
    });
  };

  const initialise = () => {
    renderControls();
    trackNavigation();
    trackLeadActions();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
  } else {
    initialise();
  }
})();
