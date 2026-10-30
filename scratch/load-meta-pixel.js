(function () {
  var loaded = false;
  var PIXEL_ID = "4532996743652549";

  function loadMetaPixel() {
    if (loaded) return;
    loaded = true;

    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

    window.fbq("init", PIXEL_ID);

    if (typeof window.trackMetaPageView === "function") {
      window.trackMetaPageView();
    } else {
      window.fbq("track", "PageView");
    }
  }

  function scheduleMetaPixel() {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(loadMetaPixel, { timeout: 8000 });
    } else {
      window.setTimeout(loadMetaPixel, 5000);
    }
  }

  function scheduleMetaPixelAfterReady() {
    if (document.body.classList.contains("is-ready")) {
      scheduleMetaPixel();
      return;
    }
    var observer = new MutationObserver(function () {
      if (!document.body.classList.contains("is-ready")) return;
      observer.disconnect();
      scheduleMetaPixel();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    window.setTimeout(function () {
      observer.disconnect();
      scheduleMetaPixel();
    }, 20000);
  }

  window.addEventListener("pointerdown", loadMetaPixel, { once: true, passive: true });
  window.addEventListener("keydown", loadMetaPixel, { once: true, passive: true });
  if (document.readyState === "complete") {
    scheduleMetaPixelAfterReady();
  } else {
    window.addEventListener("load", scheduleMetaPixelAfterReady, { once: true });
  }
})();
