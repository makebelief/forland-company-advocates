(() => {
  const nativeFetch = window.fetch.bind(window);
  const endpoint =
    "https://formsubmit.co/ajax/forlandcompanyadvocates@gmail.com";

  window.fetch = (input, init = {}) => {
    const url = typeof input === "string" ? input : input?.url;
    const method = String(init.method || "GET").toUpperCase();
    const body = init.body;

    if (
      url === "/" &&
      method === "POST" &&
      typeof body === "string" &&
      body.includes("form-name=contact")
    ) {
      const fields = new URLSearchParams(body);
      fields.delete("form-name");
      fields.set("_subject", "New website enquiry — Forland & Company Advocates");
      fields.set("_template", "table");
      fields.set("_captcha", "false");

      return nativeFetch(endpoint, {
        ...init,
        headers: {
          ...init.headers,
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: fields.toString(),
      });
    }

    return nativeFetch(input, init);
  };
})();
