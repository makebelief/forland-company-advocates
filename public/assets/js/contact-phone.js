(() => {
  // Forland & Company Advocates — contact phone wiring
  // NEW number = official firm + WhatsApp number (displayed, linked to WhatsApp)
  // OLD number = phone-call number (phone icons dial it, pre-filled in the dial pad)
  const OLD_DISPLAY = "+254 713 001 575";
  const OLD_SHORT   = "0713 001 575";
  const OLD_TEL     = "tel:+254713001575";
  const NEW_DISPLAY = "+254 753 504 745";
  const WHATSAPP    = "https://wa.me/254753504745";
  const MARK        = "data-forland-phone";

  // Wrap a displayed phone value (new number) in a WhatsApp link.
  function linkNumber(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const text = (node.nodeValue || "").trim();
      if (text !== NEW_DISPLAY && text !== OLD_DISPLAY) continue;
      const parent = node.parentElement;
      if (!parent || parent.tagName === "A" || parent.closest("a")) continue;
      const a = document.createElement("a");
      a.href = WHATSAPP;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.setAttribute("aria-label", "Chat with us on WhatsApp: " + NEW_DISPLAY);
      a.textContent = NEW_DISPLAY;
      a.setAttribute(MARK, "number");
      parent.replaceChild(a, node);
    }
  }

  // Wrap every phone icon so that clicking it opens the dial pad pre-filled
  // with the OLD (phone-call) number. Slides the icon only — not its siblings.
  function linkIcon(root) {
    const icons = root.querySelectorAll("i.ri-phone-line, i.ri-phone-fill");
    icons.forEach((icon) => {
      if (icon.closest("a")) return;
      if (icon.parentElement && icon.parentElement.closest("a")) return;
      const anchor = document.createElement("a");
      anchor.href = OLD_TEL;
      anchor.setAttribute("aria-label", "Call " + OLD_SHORT);
      anchor.setAttribute(MARK, "call");
      const parent = icon.parentElement;
      parent.insertBefore(anchor, icon);
      anchor.appendChild(icon);
    });
  }

  function apply() {
    const main = document.querySelector("main");
    if (main) {
      linkNumber(main);
      linkIcon(main);
    }
    const footer = document.querySelector("footer");
    if (footer) {
      linkNumber(footer);
      linkIcon(footer);
    }
  }

  apply();
  new MutationObserver(apply).observe(document.getElementById("root"), {
    childList: true,
    subtree: true,
  });
})();