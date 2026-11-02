import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* === Projects Slider Controller START === */
/**
 * @param {HTMLElement | Document} [container]
 */
export function initProjectsSlider(container) {
  if (typeof window === "undefined") return () => {};

  const root = container || document;
  const slider = root.querySelector(".projects-slider");
  const viewport = root.querySelector(".projects-slider-viewport");
  const track = root.querySelector(".projects-slider-track");
  const prevBtn = root.querySelector(".projects-slider-prev");
  const nextBtn = root.querySelector(".projects-slider-next");

  if (!slider || !viewport || !track) return () => {};

  // Clean up any previously cloned items (prevent duplicate clones in React StrictMode/re-renders)
  track
    .querySelectorAll(".projects-slider-item[data-clone]")
    .forEach((el) => el.remove());

  // Grab all original slides directly from the DOM
  const originalItems = [
    ...track.querySelectorAll(".projects-slider-item:not([data-clone])"),
  ];
  const count = originalItems.length;
  if (!count) return () => {};

  // Clone items to both ends for infinite seamless looping
  const clonePrepend = document.createDocumentFragment();
  const cloneAppend = document.createDocumentFragment();

  originalItems.forEach((item) => {
    const pre = item.cloneNode(true);
    pre.setAttribute("data-clone", "true");
    pre.setAttribute("aria-hidden", "true");
    clonePrepend.appendChild(pre);

    const post = item.cloneNode(true);
    post.setAttribute("data-clone", "true");
    post.setAttribute("aria-hidden", "true");
    cloneAppend.appendChild(post);
  });

  track.prepend(clonePrepend);
  track.appendChild(cloneAppend);

  const allItems = [...track.querySelectorAll(".projects-slider-item")];

  let stepWidth = 0;
  let totalOriginalWidth = 0;
  let baseOffset = 0;
  let targetX = 0;
  let currentActiveIndex = 0;

  // Animation state object managed by GSAP
  const pos = { x: 0 };

  // Dragging & gesture state
  let isPointerDown = false;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let velocity = 0;
  let lastTimestamp = 0;
  const velocityHistory = [];

  // Animation & tweening state
  let isTweening = false;
  const tweenDuration = 0.72; // seconds for GSAP

  // Calculate the horizontal offset to place a specific slide at the center of the viewport
  function getCenterOffset(index) {
    const item = originalItems[index];
    if (!item) return baseOffset;
    return (
      track.offsetLeft +
      item.offsetLeft +
      item.offsetWidth / 2 -
      viewport.clientWidth / 2
    );
  }

  function wrapCoordinates() {
    if (!totalOriginalWidth) return;
    const half = totalOriginalWidth / 2;

    while (pos.x > baseOffset + half) {
      pos.x -= totalOriginalWidth;
      targetX -= totalOriginalWidth;
    }
    while (pos.x < baseOffset - half) {
      pos.x += totalOriginalWidth;
      targetX += totalOriginalWidth;
    }
  }

  function render() {
    track.style.transform = `translate3d(${-pos.x}px, 0, 0)`;
  }

  function updateMeasurements() {
    if (!originalItems.length) return;
    const first = originalItems[0];
    const second = originalItems[1];
    const gap = parseFloat(window.getComputedStyle(track).gap) || 0;

    stepWidth = second
      ? second.offsetLeft - first.offsetLeft
      : first.offsetWidth + gap;

    totalOriginalWidth = stepWidth * count;
    baseOffset = getCenterOffset(0);

    if (pos.x === 0) {
      pos.x = baseOffset;
      targetX = baseOffset;
    }

    wrapCoordinates();
    render();
  }

  // GSAP Ticker loop for ultra-smooth inertia & drag interpolation
  function tick(time, deltaTime) {
    if (isTweening) return;

    const dt = Math.min(deltaTime / 1000, 0.1);

    if (isDragging) {
      // Follow pointer directly with light smoothing
      pos.x += (targetX - pos.x) * 0.45;
      wrapCoordinates();
      render();
    } else {
      // Inertia after flick with soft deceleration
      if (Math.abs(velocity) > 0.05) {
        targetX += velocity * dt * 1000;
        velocity *= Math.pow(0.92, dt * 60);
      } else {
        velocity = 0;
      }

      // Smooth interpolation towards targetX
      const diff = targetX - pos.x;
      const hasMotion = Math.abs(diff) > 0.05 || Math.abs(velocity) > 0.05;

      if (hasMotion) {
        if (Math.abs(diff) > 0.05) {
          pos.x += diff * 0.18;
        } else {
          pos.x = targetX;
        }
        wrapCoordinates();
        render();
      }
    }
  }

  gsap.ticker.add(tick);

  // Programmatic slide transition (arrows / keyboard) powered by GSAP
  function slideBy(direction) {
    gsap.killTweensOf(pos);
    velocity = 0;

    let baseIndex;
    if (isTweening) {
      baseIndex = currentActiveIndex;
    } else {
      const currentCenter = pos.x + viewport.clientWidth / 2;
      let nearestIndex = 0;
      let minDistance = Infinity;

      originalItems.forEach((item, idx) => {
        const itemCenter =
          track.offsetLeft + item.offsetLeft + item.offsetWidth / 2;
        const dist = Math.abs(itemCenter - currentCenter);
        if (dist < minDistance) {
          minDistance = dist;
          nearestIndex = idx;
        }
      });
      baseIndex = nearestIndex;
    }

    currentActiveIndex = (baseIndex + direction + count) % count;
    let newX = getCenterOffset(currentActiveIndex);

    // Calculate shortest wrapping direction
    let diff = newX - pos.x;
    while (diff > totalOriginalWidth / 2) {
      newX -= totalOriginalWidth;
      diff = newX - pos.x;
    }
    while (diff < -totalOriginalWidth / 2) {
      newX += totalOriginalWidth;
      diff = newX - pos.x;
    }

    isTweening = true;
    lastScrollY = window.scrollY;

    gsap.to(pos, {
      x: newX,
      duration: tweenDuration,
      ease: "power4.out",
      onUpdate: () => {
        wrapCoordinates();
        render();
      },
      onComplete: () => {
        isTweening = false;
        targetX = pos.x;
        wrapCoordinates();
        render();
      },
    });
  }

  // Prev / Next button click handlers
  const onPrevClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    slideBy(-1);
  };
  const onNextClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    slideBy(1);
  };

  if (prevBtn) prevBtn.addEventListener("click", onPrevClick);
  if (nextBtn) nextBtn.addEventListener("click", onNextClick);

  // Pointer / Drag Gestures (Mouse & Touch)
  function onPointerDown(e) {
    if (e.target.closest(".projects-slider-arrow")) return;

    if (isTweening) {
      gsap.killTweensOf(pos);
      isTweening = false;
      targetX = pos.x;
    }

    isPointerDown = true;
    isDragging = false;
    velocity = 0;
    velocityHistory.length = 0;

    startX = e.clientX ?? (e.touches && e.touches[0].clientX);
    startY = e.clientY ?? (e.touches && e.touches[0].clientY);
    lastX = startX;
    lastTimestamp = performance.now();
  }

  function onPointerMove(e) {
    if (!isPointerDown) return;

    const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
    const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);
    const deltaX = clientX - lastX;
    const totalX = clientX - startX;
    const totalY = clientY - startY;

    if (!isDragging) {
      if (Math.abs(totalX) > 6 && Math.abs(totalX) > Math.abs(totalY)) {
        isDragging = true;
        viewport.classList.add("is-dragging");
      } else if (Math.abs(totalY) > 8) {
        isPointerDown = false;
        return;
      }
    }

    if (isDragging) {
      if (e.cancelable) e.preventDefault();
      targetX -= deltaX * 1.15;

      const now = performance.now();
      const dt = now - lastTimestamp;
      if (dt > 0) {
        const v = -deltaX / dt;
        velocityHistory.push(v);
        if (velocityHistory.length > 5) velocityHistory.shift();
      }

      lastX = clientX;
      lastTimestamp = now;
    }
  }

  function onPointerUp() {
    if (!isPointerDown && !isDragging) return;

    if (isDragging) {
      viewport.classList.remove("is-dragging");
      if (velocityHistory.length > 0) {
        const avgVel =
          velocityHistory.reduce((a, b) => a + b, 0) / velocityHistory.length;
        velocity = avgVel * 0.85;
      }
      lastScrollY = window.scrollY;
    }

    isPointerDown = false;
    isDragging = false;
  }

  viewport.addEventListener("mousedown", onPointerDown);
  window.addEventListener("mousemove", onPointerMove, { passive: false });
  window.addEventListener("mouseup", onPointerUp);

  viewport.addEventListener("touchstart", onPointerDown, { passive: true });
  window.addEventListener("touchmove", onPointerMove, { passive: false });
  window.addEventListener("touchend", onPointerUp);
  window.addEventListener("touchcancel", onPointerUp);

  function isSliderInView() {
    const rect = slider.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
  }

  let wasInView = false;
  let lastScrollY = typeof window !== "undefined" ? window.scrollY : 0;
  const scrollFactor = 0.45;

  const onScroll = () => {
    const currentScrollY = window.scrollY;
    const inView = isSliderInView();

    if (!inView) {
      wasInView = false;
      lastScrollY = currentScrollY;
      return;
    }

    // When entering view for the first time, anchor baseline without any jump
    if (!wasInView) {
      wasInView = true;
      lastScrollY = currentScrollY;
      return;
    }

    const deltaScroll = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;

    if (!isDragging) {
      if (isTweening) {
        gsap.killTweensOf(pos);
        isTweening = false;
        targetX = pos.x;
      }
      // Clamp delta to prevent sudden momentum spikes
      const clampedDelta = Math.max(-100, Math.min(100, deltaScroll));
      targetX -= clampedDelta * scrollFactor;
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  // Horizontal Trackpad / Shift-Wheel Swipe
  const onWheel = (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 2) {
      if (!isDragging) {
        if (isTweening) {
          gsap.killTweensOf(pos);
          isTweening = false;
          targetX = pos.x;
        }
        targetX += e.deltaX * 0.85;
      }
    }
  };
  slider.addEventListener("wheel", onWheel, { passive: true });

  // Keyboard navigation
  const onKeyDown = (e) => {
    if (!isSliderInView()) return;
    if (e.key === "ArrowLeft") {
      slideBy(-1);
    } else if (e.key === "ArrowRight") {
      slideBy(1);
    }
  };
  window.addEventListener("keydown", onKeyDown);

  // Images loading & resize observation
  allItems.forEach((item) => {
    const img = item.querySelector("img");
    if (img && !img.complete) {
      img.addEventListener("load", updateMeasurements, { once: true });
    }
  });

  window.addEventListener("resize", updateMeasurements);

  // Measure initial dimensions
  updateMeasurements();
  requestAnimationFrame(updateMeasurements);
  const timer1 = setTimeout(updateMeasurements, 80);
  const timer2 = setTimeout(updateMeasurements, 300);

  // Return cleanup function
  return () => {
    clearTimeout(timer1);
    clearTimeout(timer2);
    gsap.ticker.remove(tick);
    gsap.killTweensOf(pos);

    if (prevBtn) prevBtn.removeEventListener("click", onPrevClick);
    if (nextBtn) nextBtn.removeEventListener("click", onNextClick);
    viewport.removeEventListener("mousedown", onPointerDown);
    window.removeEventListener("mousemove", onPointerMove);
    window.removeEventListener("mouseup", onPointerUp);
    viewport.removeEventListener("touchstart", onPointerDown);
    window.removeEventListener("touchmove", onPointerMove);
    window.removeEventListener("touchend", onPointerUp);
    window.removeEventListener("touchcancel", onPointerUp);
    window.removeEventListener("scroll", onScroll);
    slider.removeEventListener("wheel", onWheel);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("resize", updateMeasurements);

    // Remove cloned slides so DOM stays clean
    track
      .querySelectorAll(".projects-slider-item[data-clone]")
      .forEach((el) => el.remove());
  };
}
/* === Projects Slider Controller END === */
