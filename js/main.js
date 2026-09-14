/* IAMWYSE — shared site behaviors */
document.addEventListener("DOMContentLoaded", () => {

  /* ---- Header scroll state ---- */
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Mobile nav ---- */
  const toggle = document.querySelector(".nav-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  if (toggle && mobileNav) {
    toggle.addEventListener("click", () => {
      toggle.classList.toggle("is-open");
      mobileNav.classList.toggle("is-open");
      document.body.style.overflow = mobileNav.classList.contains("is-open") ? "hidden" : "";
    });
    mobileNav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
      toggle.classList.remove("is-open");
      mobileNav.classList.remove("is-open");
      document.body.style.overflow = "";
    }));
  }

  /* ---- Scroll reveal ---- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---- Typewriter headline ---- */
  const typeEl = document.getElementById("heroType");
  if (typeEl) {
    let words = [];
    try { words = JSON.parse(typeEl.getAttribute("data-words") || "[]"); } catch (e) { words = []; }
    if (!words.length) words = [typeEl.textContent.trim()];
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      typeEl.textContent = words[0];
    } else {
      let wordIndex = 0, charIndex = 0, deleting = false;
      const TYPE_SPEED = 65, DELETE_SPEED = 35, HOLD = 1400, GAP = 350;
      const tick = () => {
        const current = words[wordIndex];
        if (!deleting) {
          charIndex++;
          typeEl.textContent = current.slice(0, charIndex);
          if (charIndex === current.length) {
            deleting = true;
            setTimeout(tick, HOLD);
            return;
          }
          setTimeout(tick, TYPE_SPEED);
        } else {
          charIndex--;
          typeEl.textContent = current.slice(0, charIndex);
          if (charIndex === 0) {
            deleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            setTimeout(tick, GAP);
            return;
          }
          setTimeout(tick, DELETE_SPEED);
        }
      };
      setTimeout(tick, 500);
    }
  }

  /* ---- Marquee duplication (seamless loop) ---- */
  document.querySelectorAll(".marquee__track").forEach((track) => {
    track.innerHTML += track.innerHTML;
  });

  /* ---- Testimonial carousel arrows ---- */
  document.querySelectorAll(".carousel").forEach((carousel) => {
    const track = carousel.querySelector(".carousel__track");
    const prev = carousel.parentElement.querySelector('[data-carousel="prev"]');
    const next = carousel.parentElement.querySelector('[data-carousel="next"]');
    const scrollAmount = () => (track.querySelector(".testi-card")?.offsetWidth || 320) + 24;
    if (prev) prev.addEventListener("click", () => track.scrollBy({ left: -scrollAmount(), behavior: "smooth" }));
    if (next) next.addEventListener("click", () => track.scrollBy({ left: scrollAmount(), behavior: "smooth" }));
  });

  /* ---- FAQ accordion ---- */
  document.querySelectorAll(".accordion-item__q").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".accordion-item");
      const wasOpen = item.classList.contains("is-open");
      item.parentElement.querySelectorAll(".accordion-item").forEach((i) => i.classList.remove("is-open"));
      if (!wasOpen) item.classList.add("is-open");
    });
  });

  /* ---- Gallery filters ---- */
  const filterBtns = document.querySelectorAll(".gallery-filters button");
  const galleryItems = document.querySelectorAll(".gallery-grid figure");
  if (filterBtns.length && galleryItems.length) {
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        const filter = btn.getAttribute("data-filter");
        galleryItems.forEach((item) => {
          const match = filter === "all" || item.getAttribute("data-cat") === filter;
          item.style.display = match ? "" : "none";
        });
      });
    });
  }

  /* ---- Booking checkbox cards ---- */
  document.querySelectorAll(".check-card").forEach((card) => {
    const input = card.querySelector("input");
    if (!input) return;
    card.addEventListener("click", () => {
      if (input.type === "radio") {
        card.parentElement.querySelectorAll(".check-card").forEach((c) => c.classList.remove("is-checked"));
        input.checked = true;
        card.classList.add("is-checked");
      } else {
        input.checked = !input.checked;
        card.classList.toggle("is-checked", input.checked);
      }
    });
  });

  /* ---- Simple form intercepts (no backend wired) ---- */
  document.querySelectorAll("form[data-demo-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const note = form.querySelector(".form-note");
      if (note) {
        note.textContent = "Thanks — this demo form isn't connected yet. Wire it up to your email/CRM of choice.";
        note.style.display = "block";
      }
    });
  });

  /* ---- YouTube hover-to-play cards ---- */
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".yt-hover-card").forEach((card) => {
    const id = card.getAttribute("data-yt-id");
    if (!id || reducedMotion) return;
    let frame = null;
    const load = () => {
      if (frame) return;
      frame = document.createElement("iframe");
      frame.className = "yt-hover-card__frame";
      const origin = encodeURIComponent(window.location.origin);
      frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3&origin=${origin}`;
      frame.setAttribute("allow", "autoplay; encrypted-media");
      frame.setAttribute("title", "YouTube video preview");
      card.insertBefore(frame, card.querySelector(".yt-hover-card__content"));
    };
    const unload = () => {
      if (frame) { frame.remove(); frame = null; }
    };
    card.addEventListener("mouseenter", load);
    card.addEventListener("mouseleave", unload);
    card.addEventListener("focusin", load);
    card.addEventListener("focusout", unload);
  });

  /* ---- Timeline fill width (uses count of items) ---- */
  document.querySelectorAll(".timeline").forEach((tl) => {
    const items = tl.querySelectorAll(".timeline__item").length;
    const fill = tl.querySelector(".timeline__line-fill");
    if (fill && items > 1) fill.style.width = "100%";
  });

});
