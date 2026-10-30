(function () {
  var loaded = false;

  function loadAnalytics() {
    if (loaded) return;
    loaded = true;

    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=G-XHTK8R6WEK";
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", "G-XHTK8R6WEK");
  }

  function scheduleAnalytics() {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(loadAnalytics, { timeout: 8000 });
    } else {
      window.setTimeout(loadAnalytics, 5000);
    }
  }

  function scheduleAnalyticsAfterReady() {
    if (document.body.classList.contains("is-ready")) {
      scheduleAnalytics();
      return;
    }
    var observer = new MutationObserver(function () {
      if (!document.body.classList.contains("is-ready")) return;
      observer.disconnect();
      scheduleAnalytics();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    window.setTimeout(function () {
      observer.disconnect();
      scheduleAnalytics();
    }, 20000);
  }

  window.addEventListener("pointerdown", loadAnalytics, { once: true, passive: true });
  window.addEventListener("keydown", loadAnalytics, { once: true });
  if (document.readyState === "complete") {
    scheduleAnalyticsAfterReady();
  } else {
    window.addEventListener("load", scheduleAnalyticsAfterReady, { once: true });
  }
})();
