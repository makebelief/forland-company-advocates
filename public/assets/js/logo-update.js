(() => {
  function updateLogo() {
    document
      .querySelectorAll("header a[aria-label*='home'], footer a[href='/']")
      .forEach((link) => {
        if (link.querySelector(".official-site-logo")) return;
        const logo = document.createElement("span");
        logo.setAttribute("role", "img");
        logo.setAttribute("aria-label", "Forland & Company Advocates");
        logo.className = "official-site-logo";
        link.replaceChildren(logo);
      });
  }

  updateLogo();
  new MutationObserver(updateLogo).observe(document.getElementById("root"), {
    childList: true,
    subtree: true,
  });
})();
