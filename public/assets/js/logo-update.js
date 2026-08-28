(() => {
  function updateLogo() {
    document
      .querySelectorAll("header a[aria-label*='home'], footer a[href='/']")
      .forEach((link) => {
        if (link.querySelector(".official-site-logo")) return;
        const logo = document.createElement("img");
        logo.src = "/assets/media/forland-logo.png";
        logo.alt = "Forland & Company Advocates";
        logo.className = "official-site-logo";
        logo.width = 695;
        logo.height = 177;
        link.replaceChildren(logo);
      });
  }

  updateLogo();
  new MutationObserver(updateLogo).observe(document.getElementById("root"), {
    childList: true,
    subtree: true,
  });
})();
