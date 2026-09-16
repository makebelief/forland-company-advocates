(() => {
  // Forland & Company Advocates — contact phone wiring
  // WhatsApp/business line displayed first; direct call line displayed after a slash.
  const CALL_DISPLAY = "+254 713 001 575";
  const CALL_TEL     = "tel:+254713001575";
  const WA_DISPLAY   = "+254 753 504 745";
  const WA_URL       = "https://wa.me/254753504745";
  const COMBINED     = `${WA_DISPLAY} / ${CALL_DISPLAY}`;
  const MARK         = "data-forland-phone";

  function buildPhoneGroup() {
    const span = document.createElement("span");
    span.setAttribute(MARK, "group");

    const wa = document.createElement("a");
    wa.href = WA_URL;
    wa.target = "_blank";
    wa.rel = "noopener noreferrer";
    wa.setAttribute("aria-label", "Chat with us on WhatsApp: " + WA_DISPLAY);
    wa.textContent = WA_DISPLAY;

    const separator = document.createTextNode(" / ");

    const call = document.createElement("a");
    call.href = CALL_TEL;
    call.setAttribute("aria-label", "Call " + CALL_DISPLAY);
    call.textContent = CALL_DISPLAY;

    span.append(wa, separator, call);
    return span;
  }

  // Convert any displayed firm phone number into the requested dual-number format.
  function linkNumber(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const matches = [];
    let node;
    while ((node = walker.nextNode())) {
      const text = (node.nodeValue || "").trim();
      if (text === WA_DISPLAY || text === "+254 713 001 575" || text === "0713 001 575" || text === "0713001575" || text === CALL_DISPLAY || text === COMBINED) {
        matches.push(node);
      }
    }

    matches.forEach((textNode) => {
      const parent = textNode.parentElement;
      if (!parent || parent.closest(`[${MARK}="group"]`)) return;
      if (parent.tagName === "A" || parent.closest("a")) return;
      parent.replaceChild(buildPhoneGroup(), textNode);
    });
  }

  // Phone icons continue to dial the direct-call number.
  function linkIcon(root) {
    const icons = root.querySelectorAll("i.ri-phone-line, i.ri-phone-fill");
    icons.forEach((icon) => {
      if (icon.closest("a")) return;
      const anchor = document.createElement("a");
      anchor.href = CALL_TEL;
      anchor.setAttribute("aria-label", "Call " + CALL_DISPLAY);
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
