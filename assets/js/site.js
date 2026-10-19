/* HOTEL ND MANOR — shared, dependency-free interactions for all five pages. */
(function () {
  "use strict";

  var cfg = window.NDM_CONFIG || {};
  var hotel = cfg.hotel || {};
  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (selector, scope) { return (scope || document).querySelector(selector); };
  var $$ = function (selector, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); };

  function setText(selector, value) {
    if (!value) return;
    $$(selector).forEach(function (node) { node.textContent = value; });
  }

  function applyConfiguration() {
    var images = cfg.images || {};
    $$('img[data-media]').forEach(function (image) {
      var path = images[image.getAttribute("data-media")];
      if (path && image.getAttribute("src") !== path) image.setAttribute("src", path);
      watchImage(image);
    });
    $$('[data-phone-link]').forEach(function (link) { if (hotel.phoneTel) link.href = "tel:" + hotel.phoneTel; });
    setText('[data-phone-display]', hotel.phoneDisplay);
    $$('[data-email-link]').forEach(function (link) { if (hotel.email) link.href = "mailto:" + hotel.email; });
    setText('[data-email-text]', hotel.email);
    $$('[data-whatsapp-link]').forEach(function (link) {
      if (!hotel.whatsapp) return;
      link.href = whatsappUrl("Hello HOTEL ND MANOR, I would like to enquire about a stay. Please share current availability and rates. Thank you!");
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    });
    $$('[data-map-link]').forEach(function (link) { if (hotel.maps) { link.href = hotel.maps; link.target = "_blank"; link.rel = "noopener noreferrer"; } });
    $$('[data-directions-link]').forEach(function (link) { if (hotel.directions) { link.href = hotel.directions; link.target = "_blank"; link.rel = "noopener noreferrer"; } });
    $$('[data-instagram-link]').forEach(function (link) { if (hotel.instagram) { link.href = hotel.instagram; link.target = "_blank"; link.rel = "noopener noreferrer"; } });
    setText('[data-hotel-address]', hotel.address);
    setText('[data-check-in]', hotel.checkIn);
    setText('[data-check-out]', hotel.checkOut);

    var year = $("[data-year]");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  function watchImage(image) {
    var frame = image.closest(".media-frame");
    var fail = function () {
      if (frame) frame.classList.add("is-missing");
      else image.style.visibility = "hidden";
      var galleryItem = image.closest("[data-gallery-item]");
      if (galleryItem) {
        galleryItem.disabled = true;
        galleryItem.setAttribute("aria-disabled", "true");
      }
    };
    var success = function () {
      if (frame) frame.classList.remove("is-missing");
      var galleryItem = image.closest("[data-gallery-item]");
      if (galleryItem) {
        galleryItem.disabled = false;
        galleryItem.removeAttribute("aria-disabled");
      }
    };
    image.addEventListener("error", fail, { once: true });
    image.addEventListener("load", success, { once: true });
    if (image.complete) {
      if (image.naturalWidth > 0) success();
      else fail();
    }
  }

  function whatsappUrl(message) {
    return "https://wa.me/" + (hotel.whatsapp || "") + "?text=" + encodeURIComponent(message);
  }

  function showToast(message, isError) {
    var region = $("#toastRegion");
    if (!region) return;
    var toast = document.createElement("div");
    toast.className = "toast" + (isError ? " toast--error" : "");
    toast.setAttribute("role", isError ? "alert" : "status");
    toast.textContent = message;
    region.appendChild(toast);
    window.setTimeout(function () { toast.style.opacity = "0"; toast.style.transition = "opacity .35s ease"; }, 3500);
    window.setTimeout(function () { toast.remove(); }, 3900);
  }

  function setFormFeedback(node, message, isError) {
    if (!node) return;
    node.hidden = !message;
    node.textContent = message || "";
    node.classList.toggle("form-feedback--error", Boolean(isError));
    node.classList.toggle("form-feedback--success", Boolean(message) && !isError);
    node.setAttribute("role", isError ? "alert" : "status");
    node.setAttribute("aria-live", isError ? "assertive" : "polite");
  }

  /* Full-viewport intro: session-once, muted autoplay, reduced-motion and error fallbacks. */
  function initIntro() {
    var overlay = $("#introOverlay");
    if (!overlay) return;
    if (!root.classList.contains("intro-pending")) return;

    if (window.__NDMIntroFailsafe) window.clearTimeout(window.__NDMIntroFailsafe);
    var video = $("#introVideo", overlay);
    var skip = $("[data-intro-skip]", overlay);
    var playButton = $("[data-intro-play]", overlay);
    var status = $("[data-intro-status]", overlay);
    var introSlot = cfg.videoSlots && cfg.videoSlots.intro;
    if (!introSlot || introSlot.available === false || !introSlot.src) {
      root.classList.remove("intro-pending");
      overlay.setAttribute("aria-hidden", "true");
      return;
    }
    var introPosterPath = (introSlot && introSlot.poster) || (cfg.media && cfg.media.introPoster);
    if (introPosterPath) {
      var introPoster = $(".intro-overlay__poster", overlay);
      if (introPoster) introPoster.src = introPosterPath;
      if (video) video.poster = introPosterPath;
    }
    var finished = false;
    var started = false;
    var fallbackTimer = 0;
    var loadTimer = 0;
    overlay.setAttribute("aria-hidden", "false");

    function finishIntro() {
      if (finished) return;
      finished = true;
      window.clearTimeout(fallbackTimer);
      window.clearTimeout(loadTimer);
      try { window.sessionStorage.setItem("ndm_intro_seen", "1"); } catch (e) { /* session storage may be disabled */ }
      if (video) video.pause();
      root.classList.remove("intro-pending");
      overlay.classList.add("is-leaving");
      overlay.setAttribute("aria-hidden", "true");
      window.setTimeout(function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, reduceMotion ? 40 : 950);
    }

    function showFallback() {
      if (finished || started) return;
      window.clearTimeout(loadTimer);
      if (video) { try { video.pause(); } catch (e) {} }
      if (playButton) playButton.hidden = true;
      if (status) status.textContent = "The hotel film is being prepared · enter whenever you are ready";
      fallbackTimer = window.setTimeout(finishIntro, reduceMotion ? 500 : 2600);
    }

    function showAutoplayControl() {
      if (finished || started) return;
      if (status) status.textContent = "Tap to play the hotel film, or skip the introduction";
      if (playButton) playButton.hidden = false;
    }

    function startVideo() {
      if (!video || finished || reduceMotion) return;
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      var source = introSlot && introSlot.available !== false ? introSlot.src : "";
      if (!source) { showFallback(); return; }
      if (!video.src || video.dataset.sourceSet !== "true") {
        video.src = source;
        video.dataset.sourceSet = "true";
        video.load();
      }
      loadTimer = window.setTimeout(function () {
        if (!started && video.readyState < 2) showFallback();
      }, 6200);
      var playResult;
      try { playResult = video.play(); }
      catch (error) { showFallback(); return; }
      if (playResult && typeof playResult.then === "function") {
        playResult.then(function () {
          if (finished) return;
          window.clearTimeout(loadTimer);
          if (playButton) playButton.hidden = true;
          if (status) status.textContent = "";
        }).catch(function (error) {
          if (error && error.name === "NotAllowedError") showAutoplayControl();
          else showFallback();
        });
      }
    }

    if (skip) skip.addEventListener("click", finishIntro);
    if (playButton) playButton.addEventListener("click", function () {
      playButton.hidden = true;
      if (status) status.textContent = "";
      startVideo();
    });
    if (video) {
      video.addEventListener("playing", function () {
        started = true;
        window.clearTimeout(loadTimer);
        window.clearTimeout(fallbackTimer);
        overlay.classList.add("has-video");
        if (playButton) playButton.hidden = true;
        if (status) status.textContent = "";
      });
      video.addEventListener("ended", finishIntro);
      video.addEventListener("error", showFallback);
    }
    document.addEventListener("keydown", function introKey(event) {
      if (!root.classList.contains("intro-pending")) {
        document.removeEventListener("keydown", introKey);
        return;
      }
      if (event.key === "Escape") finishIntro();
    });

    if (reduceMotion) {
      if (status) status.textContent = "";
      window.setTimeout(finishIntro, 900);
      return;
    }
    if (skip) window.setTimeout(function () { if (!finished) skip.focus({ preventScroll: true }); }, 0);
    startVideo();
  }

  /* Video hero: poster stays visible unless a real hotel video plays. */
  function initHeroVideo() {
    var hero = $("[data-home-hero]");
    if (!hero) return;
    var video = $("[data-hero-video]", hero);
    var poster = $("[data-hero-poster]", hero);
    var toggle = $("[data-motion-toggle]", hero);
    var heroSlot = cfg.videoSlots && cfg.videoSlots.homeHero;
    var heroPosterPath = (heroSlot && heroSlot.poster) || (cfg.media && cfg.media.homeHeroPoster);
    var source = heroSlot && heroSlot.available !== false ? heroSlot.src : "";
    if (poster && heroPosterPath) poster.src = heroPosterPath;
    if (!video || !source || reduceMotion) {
      if (toggle) toggle.hidden = true;
      return;
    }
    if (heroPosterPath) video.poster = heroPosterPath;
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.src = source;
    video.load();
    video.addEventListener("playing", function () {
      hero.classList.add("has-video");
      if (toggle) toggle.hidden = false;
    });
    video.addEventListener("error", function () {
      hero.classList.remove("has-video");
      if (toggle) toggle.hidden = true;
    });
    var play = video.play();
    if (play && typeof play.catch === "function") play.catch(function () { hero.classList.remove("has-video"); });
    if (toggle) {
      toggle.addEventListener("click", function () {
        if (video.paused) {
          var request = video.play();
          if (request && typeof request.catch === "function") request.catch(function () {});
          toggle.setAttribute("aria-pressed", "false");
          toggle.textContent = "Pause motion";
        } else {
          video.pause();
          toggle.setAttribute("aria-pressed", "true");
          toggle.textContent = "Play motion";
        }
      });
    }
  }

  /* Responsive menu: keyboard closable, focus returns to its trigger. */
  function initNavigation() {
    var header = $("[data-site-header]");
    var toggle = $("[data-menu-toggle]");
    var menu = $("#mobileMenu");
    var close = $("[data-menu-close]");
    var backdrop = $("[data-menu-backdrop]");
    var page = document.body.getAttribute("data-page");
    if (menu) {
      menu.setAttribute("aria-hidden", "true");
      menu.setAttribute("inert", "");
    }
    $$('[data-page-link]').forEach(function (link) {
      if (link.getAttribute("data-page-link") === page) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });

    function closeMenu(restore) {
      if (!menu || !menu.classList.contains("is-open")) return;
      menu.classList.remove("is-open");
      menu.setAttribute("aria-hidden", "true");
      menu.setAttribute("inert", "");
      document.body.classList.remove("menu-open");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
      if (restore && toggle) toggle.focus();
    }
    function openMenu() {
      if (!menu || !toggle) return;
      menu.classList.add("is-open");
      menu.setAttribute("aria-hidden", "false");
      menu.removeAttribute("inert");
      document.body.classList.add("menu-open");
      toggle.setAttribute("aria-expanded", "true");
      if (close) close.focus();
    }
    if (toggle) toggle.addEventListener("click", function () {
      if (menu && menu.classList.contains("is-open")) closeMenu(true); else openMenu();
    });
    if (close) close.addEventListener("click", function () { closeMenu(true); });
    if (backdrop) backdrop.addEventListener("click", function () { closeMenu(true); });
    if (menu) $$('a', menu).forEach(function (link) { link.addEventListener("click", function () { closeMenu(false); }); });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu(true);
      if (event.key === "Tab" && menu && menu.classList.contains("is-open")) {
        var focusables = $$('a[href], button:not([disabled]):not([tabindex="-1"])', menu).filter(function (node) { return !node.hidden; });
        if (!focusables.length) return;
        var first = focusables[0], last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    if (header) {
      var update = function () { header.classList.toggle("is-scrolled", window.scrollY > 12); };
      update();
      window.addEventListener("scroll", update, { passive: true });
    }
  }

  /* Existing room walk-through clips are kept as optional, lazy, muted previews. */
  function initRoomVideos() {
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    var videos = $$('[data-room-video]');
    if (!videos.length) return;
    var videoSlots = cfg.videoSlots || {};
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var video = entry.target;
        var frame = video.closest(".media-frame");
        if (entry.isIntersecting) {
          var slot = videoSlots[video.getAttribute("data-room-video")];
          var source = slot && slot.available !== false ? slot.src : "";
          if (!source) return;
          if (!video.dataset.sourceSet) {
            video.src = source;
            video.dataset.sourceSet = "true";
            video.load();
          }
          var request = video.play();
          if (request && typeof request.catch === "function") request.catch(function () {});
        } else {
          video.pause();
          if (frame) frame.classList.remove("has-video");
        }
      });
    }, { rootMargin: "180px 0px 180px 0px", threshold: 0.05 });
    videos.forEach(function (video) {
      video.muted = true;
      video.defaultMuted = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      video.addEventListener("playing", function () { var frame = video.closest(".media-frame"); if (frame) frame.classList.add("has-video"); });
      video.addEventListener("error", function () { var frame = video.closest(".media-frame"); if (frame) frame.classList.remove("has-video"); });
      observer.observe(video);
    });
    if (window.matchMedia) {
      var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      var pauseForReduced = function (event) { if (event.matches) videos.forEach(function (video) { video.pause(); var frame = video.closest(".media-frame"); if (frame) frame.classList.remove("has-video"); }); };
      if (motionQuery.addEventListener) motionQuery.addEventListener("change", pauseForReduced);
    }
  }

  function createNode(tagName, className, text) {
    var node = document.createElement(tagName);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  /* Gallery records are data-driven and capped so one image-heavy page stays light. */
  function renderGalleryFromConfig(grid) {
    var items = Array.isArray(cfg.galleryItems) ? cfg.galleryItems : [];
    if (!items.length) return;
    var limit = Math.max(1, Math.min(20, Number(cfg.galleryLimit) || 20));
    grid.textContent = "";
    items.slice(0, limit).forEach(function (item) {
      var captionText = item.caption || "HOTEL ND MANOR photograph";
      var tile = createNode("button", "gallery-tile" + (item.layout === "tall" ? " gallery-tile--tall" : item.layout === "wide" ? " gallery-tile--wide" : ""));
      tile.type = "button";
      tile.setAttribute("data-gallery-item", "");
      tile.setAttribute("data-category", item.category || "interiors");
      tile.setAttribute("data-caption", captionText);
      tile.setAttribute("data-alt", item.alt || captionText + " at HOTEL ND MANOR");
      tile.setAttribute("aria-label", "Open photograph: " + captionText);

      var frame = createNode("span", "media-frame");
      var image = createNode("img");
      var imagePath = item.imageKey && cfg.images ? cfg.images[item.imageKey] : "";
      image.alt = item.alt || captionText + " at HOTEL ND MANOR";
      image.loading = "lazy";
      image.decoding = "async";
      if (imagePath) {
        image.src = imagePath;
        tile.setAttribute("data-src", imagePath);
      } else {
        frame.classList.add("is-missing");
        tile.disabled = true;
        tile.setAttribute("aria-disabled", "true");
      }
      var placeholder = createNode("span", "media-placeholder");
      placeholder.setAttribute("aria-hidden", "true");
      placeholder.appendChild(createNode("span", "media-placeholder__mark", "ND"));
      placeholder.appendChild(createNode("span", "", item.placeholder || (item.category === "events" ? "Event photography" : item.category === "rooms" ? "Room photography" : "Hotel photography")));
      frame.appendChild(image);
      frame.appendChild(placeholder);
      tile.appendChild(frame);

      var tileCaption = createNode("span", "gallery-tile__caption");
      tileCaption.appendChild(createNode("span", "", captionText));
      tileCaption.appendChild(createNode("span", "", "↗")).setAttribute("aria-hidden", "true");
      tile.appendChild(tileCaption);
      grid.appendChild(tile);
      watchImage(image);
    });
  }

  /* Optional walkthrough clips load only after a deliberate tap, never on page load. */
  function initVideoSlots() {
    var slots = cfg.videoSlots || {};
    $$('[data-video-slot]').forEach(function (frame) {
      var slot = slots[frame.getAttribute("data-video-slot")];
      var video = $("[data-video-player]", frame);
      var poster = $("[data-video-poster]", frame);
      var placeholder = $("[data-video-placeholder]", frame);
      var playButton = $("[data-video-play]", frame);
      var available = Boolean(slot && slot.src && slot.available !== false && video && playButton);
      if (slot && slot.poster && poster) {
        poster.src = slot.poster;
        poster.alt = "";
        watchImage(poster);
      }
      if (!available) {
        frame.classList.add("is-unavailable");
        if (playButton) playButton.hidden = true;
        if (video) video.hidden = true;
        if (placeholder) placeholder.classList.add("is-placeholder-visible");
        return;
      }
      video.controls = true;
      video.muted = true;
      video.playsInline = true;
      video.preload = "none";
      video.setAttribute("playsinline", "");
      playButton.hidden = false;
      playButton.addEventListener("click", function () {
        if (!video.dataset.sourceSet) {
          video.src = slot.src;
          video.dataset.sourceSet = "true";
          video.load();
        }
        video.hidden = false;
        frame.classList.add("has-player");
        var request = video.play();
        if (request && typeof request.catch === "function") request.catch(function () {
          video.hidden = true;
          frame.classList.remove("has-player");
          if (placeholder) placeholder.classList.add("is-placeholder-visible");
          playButton.hidden = false;
        });
      });
      video.addEventListener("playing", function () {
        playButton.hidden = true;
        if (placeholder) placeholder.classList.remove("is-placeholder-visible");
      });
      video.addEventListener("error", function () {
        video.hidden = true;
        frame.classList.remove("has-player");
        playButton.hidden = false;
        if (placeholder) placeholder.classList.add("is-placeholder-visible");
        showToast("This hotel video is not available yet.", true);
      });
    });
  }

  function getRoomById(id) {
    var rooms = Array.isArray(cfg.roomCatalog) ? cfg.roomCatalog : [];
    for (var index = 0; index < rooms.length; index += 1) if (rooms[index].id === id) return rooms[index];
    return null;
  }

  function initRoomCatalog() {
    var grid = $("[data-room-grid]");
    if (!grid) return;
    var rooms = Array.isArray(cfg.roomCatalog) ? cfg.roomCatalog : [];
    var dialog = $("#roomDetailsDialog");
    var modalImage = $("[data-room-dialog-image]", dialog);
    var modalMedia = $("[data-room-dialog-media]", dialog);
    var modalImageFrame = modalImage && modalImage.closest(".media-frame");
    var modalVideo = $("[data-room-dialog-video]", dialog);
    var modalVideoButton = $("[data-room-dialog-video-play]", dialog);
    var activeVideoSlot = null;
    var returnFocus = null;

    function setRoomFeatures(list, features) {
      if (!list) return;
      list.textContent = "";
      (features || []).forEach(function (feature) { list.appendChild(createNode("li", "", feature)); });
    }
    function showRoomDetails(room, opener) {
      if (!dialog) return;
      returnFocus = opener || document.activeElement;
      var title = $("[data-room-dialog-title]", dialog);
      var label = $("[data-room-dialog-label]", dialog);
      var description = $("[data-room-dialog-description]", dialog);
      var meta = $("[data-room-dialog-meta]", dialog);
      var bookingLink = $("[data-room-dialog-book]", dialog);
      if (title) title.textContent = room.name;
      if (label) label.textContent = room.categoryLabel || "Room category";
      if (description) description.textContent = room.description || "Contact the hotel to confirm room details for your stay.";
      if (meta) meta.textContent = (room.meta || []).join(" · ");
      setRoomFeatures($("[data-room-dialog-features]", dialog), room.features);
      if (bookingLink) bookingLink.href = "booking.html?room=" + encodeURIComponent(room.id) + "#enquiry";

      var imagePath = room.imageKey && cfg.images ? cfg.images[room.imageKey] : "";
      activeVideoSlot = room.videoSlot && cfg.videoSlots ? cfg.videoSlots[room.videoSlot] : null;
      var hasVideo = Boolean(activeVideoSlot && activeVideoSlot.src && activeVideoSlot.available !== false);
      var hasMedia = Boolean(imagePath || hasVideo);
      if (modalMedia) modalMedia.hidden = !hasMedia;
      if (dialog) dialog.classList.toggle("room-dialog--text-only", !hasMedia);
      if (modalImage) {
        modalImage.alt = room.imageAlt || (imagePath ? room.name + " at HOTEL ND MANOR" : "");
        if (imagePath) {
          modalImage.src = imagePath;
          if (modalImageFrame) modalImageFrame.classList.remove("is-missing");
          watchImage(modalImage);
        } else {
          modalImage.removeAttribute("src");
          if (modalImageFrame) modalImageFrame.classList.remove("is-missing");
        }
      }
      if (modalVideo) {
        modalVideo.pause();
        modalVideo.removeAttribute("src");
        modalVideo.load();
        modalVideo.dataset.sourceSet = "";
        modalVideo.hidden = true;
        if (modalImageFrame) modalImageFrame.classList.remove("has-video");
      }
      if (modalVideoButton) modalVideoButton.hidden = !(activeVideoSlot && activeVideoSlot.src && activeVideoSlot.available !== false);

      if (typeof dialog.showModal === "function") dialog.showModal();
      else { dialog.setAttribute("open", ""); document.body.classList.add("menu-open"); }
      var closeButton = $("[data-room-dialog-close]", dialog);
      if (closeButton) closeButton.focus();
    }

    rooms.forEach(function (room) {
      var card = $("[data-room-id='" + room.id + "']", grid);
      if (!card) return;
      var name = $("[data-room-name]", card);
      var label = $("[data-room-label]", card);
      var meta = $("[data-room-meta]", card);
      var description = $("[data-room-description]", card);
      var video = $("[data-room-video]", card);
      var features = $("[data-room-features]", card);
      var openButton = $("[data-room-open]", card);
      var bookLink = $("[data-room-book]", card);
      if (name) name.textContent = room.name;
      if (label) label.textContent = room.categoryLabel || "Room category";
      if (meta) meta.textContent = (room.meta || []).join(" · ");
      if (description) description.textContent = room.description || "Contact the hotel to confirm room details for your stay.";
      setRoomFeatures(features, room.features);
      if (video) {
        var slot = room.videoSlot && cfg.videoSlots ? cfg.videoSlots[room.videoSlot] : null;
        if (slot && slot.available !== false && slot.src) {
          video.setAttribute("data-room-video", room.videoSlot);
          if (slot.poster) video.poster = slot.poster;
        } else video.removeAttribute("data-room-video");
      }
      if (openButton) {
        openButton.setAttribute("data-room-open", room.id);
        openButton.addEventListener("click", function () { showRoomDetails(room, openButton); });
      }
      if (bookLink) bookLink.href = "booking.html?room=" + encodeURIComponent(room.id) + "#enquiry";
    });

    if (modalVideoButton) modalVideoButton.addEventListener("click", function () {
      if (!activeVideoSlot || !modalVideo) return;
      if (!modalVideo.dataset.sourceSet) {
        modalVideo.src = activeVideoSlot.src;
        modalVideo.dataset.sourceSet = "true";
        modalVideo.load();
      }
      modalVideo.hidden = false;
      if (modalImageFrame) modalImageFrame.classList.add("has-video");
      var request = modalVideo.play();
      if (request && typeof request.catch === "function") request.catch(function () {
        modalVideo.hidden = true;
        if (modalImageFrame) modalImageFrame.classList.remove("has-video");
        showToast("This room video could not be played.", true);
      });
    });
    if (modalVideo) modalVideo.addEventListener("error", function () {
      modalVideo.hidden = true;
      if (modalImageFrame) modalImageFrame.classList.remove("has-video");
      showToast("This room video is not available yet.", true);
    });
    if (dialog) {
      $$('[data-room-dialog-close]', dialog).forEach(function (button) { button.addEventListener("click", function () { if (dialog.close) dialog.close(); else { dialog.removeAttribute("open"); document.body.classList.remove("menu-open"); } }); });
      dialog.addEventListener("click", function (event) {
        if (event.target === dialog) { if (dialog.close) dialog.close(); else { dialog.removeAttribute("open"); document.body.classList.remove("menu-open"); } }
      });
      dialog.addEventListener("close", function () {
        if (modalVideo) { modalVideo.pause(); modalVideo.removeAttribute("src"); modalVideo.dataset.sourceSet = ""; modalVideo.load(); }
        if (returnFocus && returnFocus.focus) returnFocus.focus();
      });
    }
  }

  function initContactActions() {
    var dialog = $("#contactDialog");
    if (!dialog) return;
    var title = $("[data-contact-title]", dialog);
    var description = $("[data-contact-description]", dialog);
    var options = $("[data-contact-options]", dialog);
    var returnFocus = null;

    function addContactOption(label, display, href, action, external, afterChoose) {
      var link = createNode("a", "contact-option");
      link.href = href;
      link.appendChild(createNode("span", "contact-option__label", label));
      link.appendChild(createNode("strong", "", display));
      link.appendChild(createNode("span", "contact-option__action", action));
      if (external) { link.target = "_blank"; link.rel = "noopener noreferrer"; }
      if (afterChoose) link.addEventListener("click", afterChoose);
      options.appendChild(link);
    }
    function openContact(kind, trigger, customMessage, feedbackNode) {
      if (!options) return;
      returnFocus = trigger;
      options.textContent = "";
      if (kind === "call") {
        if (title) title.textContent = "Call HOTEL ND MANOR";
        if (description) description.textContent = "Choose a hotel line to place your call.";
        (hotel.calls || []).forEach(function (item) {
          if (!item.tel) return;
          addContactOption(item.label || "Hotel line", item.display || item.tel, "tel:" + item.tel, "Call this number", false);
        });
      } else {
        if (title) title.textContent = "WhatsApp HOTEL ND MANOR";
        if (description) description.textContent = customMessage
          ? "Choose either official WhatsApp number. Your enquiry opens as a draft; review it and press Send in WhatsApp."
          : "Choose an official WhatsApp number to open a direct chat. Nothing is sent automatically.";
        var defaultMessage = "Hello HOTEL ND MANOR, I would like to enquire about a room or event. Please share current availability and rates. Thank you!";
        (hotel.whatsapps || []).forEach(function (item) {
          if (!item.number) return;
          var baseUrl = item.url || "https://wa.me/" + item.number;
          var separator = baseUrl.indexOf("?") === -1 ? "?" : "&";
          var targetUrl = baseUrl + separator + "text=" + encodeURIComponent(customMessage || defaultMessage);
          var afterChoose = feedbackNode ? function () {
            setFormFeedback(feedbackNode, "WhatsApp opened with your enquiry draft. Review the details and press Send in WhatsApp; the hotel will confirm availability, rates and arrangements directly.", false);
            if (typeof dialog.close === "function") dialog.close();
            else { dialog.removeAttribute("open"); document.body.classList.remove("menu-open"); }
          } : null;
          addContactOption(item.label || "WhatsApp", item.display || item.number, targetUrl, "Open WhatsApp", true, afterChoose);
        });
      }
      if (typeof dialog.showModal === "function") dialog.showModal();
      else { dialog.setAttribute("open", ""); document.body.classList.add("menu-open"); }
      var closeButton = $("[data-contact-close]", dialog);
      if (closeButton) closeButton.focus();
    }
    window.NDMOpenContactChoice = function (trigger, customMessage, feedbackNode) {
      openContact("whatsapp", trigger, customMessage, feedbackNode);
    };
    $$('[data-contact-open]').forEach(function (trigger) {
      trigger.addEventListener("click", function () { openContact(trigger.getAttribute("data-contact-open"), trigger); });
    });
    $$('[data-whatsapp-link]').forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        openContact("whatsapp", link);
      });
    });
    $$('[data-contact-close]', dialog).forEach(function (button) { button.addEventListener("click", function () { if (dialog.close) dialog.close(); else { dialog.removeAttribute("open"); document.body.classList.remove("menu-open"); } }); });
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) { if (dialog.close) dialog.close(); else { dialog.removeAttribute("open"); document.body.classList.remove("menu-open"); } }
    });
    dialog.addEventListener("close", function () { if (returnFocus && returnFocus.focus) returnFocus.focus(); });
  }

  function initEventEnquiry() {
    var form = $("[data-event-enquiry]");
    if (!form) return;
    var eventDate = $("#eventDate", form);
    var phone = $("#eventPhone", form);
    var nameInput = $("#eventName", form);
    var honeypot = $("[name='eventWebsite']", form);
    var feedback = $("[data-event-feedback]", form);
    var submitButton = $("button[type='submit']", form);
    var today = new Date();
    if (eventDate) eventDate.min = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");

    function setPhoneValidity() {
      if (!phone) return;
      var digits = phone.value.replace(/\D/g, "");
      var allowedCharacters = /^\+?[0-9\s().-]+$/.test(phone.value.trim());
      phone.setCustomValidity(phone.value && (!allowedCharacters || digits.length < 8 || digits.length > 15) ? "Use only digits, spaces, parentheses, periods, hyphens and an optional leading +; include 8 to 15 digits." : "");
    }
    function setNameValidity() {
      if (!nameInput) return;
      nameInput.setCustomValidity(nameInput.value && !nameInput.value.trim() ? "Please enter your name." : "");
    }
    if (phone) phone.addEventListener("input", function () { phone.setCustomValidity(""); });
    if (nameInput) nameInput.addEventListener("input", function () { nameInput.setCustomValidity(""); });
    form.addEventListener("input", function () { setFormFeedback(feedback, "", false); });
    form.addEventListener("change", function () { setFormFeedback(feedback, "", false); });
    if (eventDate) eventDate.addEventListener("change", function () { setFormFeedback(feedback, "", false); });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (honeypot && honeypot.value) return;
      setNameValidity();
      setPhoneValidity();
      if (!form.reportValidity()) {
        setFormFeedback(feedback, "Please review the highlighted event details and correct any errors.", true);
        return;
      }
      var value = function (id) { var field = $("#" + id, form); return field ? field.value.trim() : ""; };
      var message = [
        "Hello HOTEL ND MANOR, I would like to enquire about an indoor event.",
        "Event type: " + value("eventType"),
        "Preferred date: " + value("eventDate"),
        "Approximate guest count: " + value("eventGuests"),
        "Name: " + value("eventName"),
        "Phone: " + value("eventPhone"),
        value("eventMessage") ? "Additional details: " + value("eventMessage") : "",
        "Please confirm date availability, capacity, arrangements and any rates directly. This is an enquiry only, not a confirmed event booking.",
        "I will review this draft and press Send in WhatsApp."
      ].filter(Boolean).join("\n");
      setFormFeedback(feedback, "Choose either official WhatsApp number. Your message will open as a draft; review it and press Send in WhatsApp. The hotel will confirm availability and arrangements manually.", false);
      if (typeof window.NDMOpenContactChoice === "function") window.NDMOpenContactChoice(submitButton, message, feedback);
      else setFormFeedback(feedback, "WhatsApp contact choices could not be opened. Please call the hotel or try again.", true);
    });
    if (submitButton) submitButton.disabled = false;
  }

  function initBookingForm() {
    var form = $("#enquiryForm");
    if (!form) return;
    var checkin = $("#checkin", form);
    var checkout = $("#checkout", form);
    var eventDate = $("#bookingEventDate", form);
    var adultCount = $("#adultCount", form);
    var childCount = $("#childCount", form);
    var maxRoomGuests = cfg.occupancy && Number(cfg.occupancy.maxGuestsPerRoom) || 3;
    var phone = $("#guestPhone", form);
    var nameInput = $("#guestName", form);
    var honeypot = $("[name='website']", form);
    var submitButton = $("[data-submit-whatsapp]", form);
    var roomSelect = $("#roomType", form);
    var typeSelect = $("#enquiryType", form);
    var feedback = $("[data-booking-feedback]", form);
    var conditionalGroups = $$('[data-booking-fields]', form);

    function isoLocal(date) {
      var year = date.getFullYear();
      var month = String(date.getMonth() + 1).padStart(2, "0");
      var day = String(date.getDate()).padStart(2, "0");
      return year + "-" + month + "-" + day;
    }
    function localToday() {
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    }
    function updateDateRules() {
      var today = localToday();
      if (checkin) checkin.min = isoLocal(today);
      if (eventDate) eventDate.min = isoLocal(today);
      if (checkout) {
        var earliest = new Date(today);
        if (checkin && checkin.value) {
          var parts = checkin.value.split("-").map(Number);
          earliest = new Date(parts[0], parts[1] - 1, parts[2]);
        }
        earliest.setDate(earliest.getDate() + 1);
        checkout.min = isoLocal(earliest);
        var invalid = Boolean(checkin && checkin.value && checkout.value && checkout.value <= checkin.value);
        checkout.setCustomValidity(invalid ? "Check-out must be after check-in." : "");
      }
    }
    function updateConditionalFields() {
      var type = typeSelect ? typeSelect.value : "";
      conditionalGroups.forEach(function (group) {
        var groupType = group.getAttribute("data-booking-fields");
        var show = (groupType === "room" && type === "room-booking") ||
          (groupType === "event" && ["wedding", "indoor-banquet", "family-function", "private-event"].indexOf(type) !== -1);
        group.hidden = !show;
        group.disabled = !show;
      });
      updateGuestCountValidity();
      setFormFeedback(feedback, "", false);
    }
    function setPhoneValidity() {
      if (!phone) return;
      var digits = phone.value.replace(/\D/g, "");
      var allowedCharacters = /^\+?[0-9\s().-]+$/.test(phone.value.trim());
      phone.setCustomValidity(phone.value && (!allowedCharacters || digits.length < 8 || digits.length > 15) ? "Use only digits, spaces, parentheses, periods, hyphens and an optional leading +; include 8 to 15 digits." : "");
    }
    function setNameValidity() {
      if (!nameInput) return;
      nameInput.setCustomValidity(nameInput.value && !nameInput.value.trim() ? "Please enter your name." : "");
    }
    function updateGuestCountValidity() {
      if (!adultCount || !childCount) return { valid: true, field: "", message: "" };
      var result = typeof window.NDMValidateOccupancy === "function"
        ? window.NDMValidateOccupancy(adultCount.value, childCount.value, maxRoomGuests)
        : { valid: Number(adultCount.value) >= 1 && Number(adultCount.value) + Number(childCount.value || 0) <= maxRoomGuests, field: "occupancy", message: "Adults and children together cannot exceed " + maxRoomGuests + " guests per room." };
      adultCount.setCustomValidity(result.field === "adults" ? result.message : "");
      childCount.setCustomValidity(result.field === "children" || result.field === "occupancy" ? result.message : "");
      return result;
    }
    function validateForm() {
      updateDateRules();
      setNameValidity();
      setPhoneValidity();
      updateGuestCountValidity();
      return form.reportValidity();
    }
    function fieldValue(id) {
      var node = $("#" + id, form);
      return node ? node.value.trim() : "";
    }
    function selectedLabel(select) {
      if (!select || select.selectedIndex < 0) return "";
      return select.options[select.selectedIndex].textContent.trim();
    }
    function values() {
      return {
        type: fieldValue("enquiryType"),
        typeLabel: selectedLabel(typeSelect),
        name: fieldValue("guestName"),
        phone: fieldValue("guestPhone"),
        email: fieldValue("guestEmail"),
        room: fieldValue("roomType"),
        checkin: fieldValue("checkin"),
        checkout: fieldValue("checkout"),
        adults: fieldValue("adultCount"),
        children: fieldValue("childCount"),
        eventDate: fieldValue("bookingEventDate"),
        eventGuests: fieldValue("bookingEventGuests"),
        message: fieldValue("guestMessage")
      };
    }
    function messageFor(v) {
      var lines = [
        "Hello HOTEL ND MANOR, I would like to make an enquiry.",
        "Enquiry type: " + v.typeLabel,
        "Name: " + v.name,
        "Phone: " + v.phone,
        v.email ? "Email: " + v.email : ""
      ];
      if (v.type === "room-booking") {
        lines.push("Room category: " + v.room);
        lines.push("Check-in: " + v.checkin);
        lines.push("Check-out: " + v.checkout);
        lines.push("Adults: " + v.adults);
        if (v.children !== "") lines.push("Children: " + v.children);
        lines.push("Maximum 3 guests per room. Any rate quoted is for 2 guests. Additional-person charges apply; please confirm the amount directly.");
        lines.push("Please confirm availability, final room rate and booking details directly.");
      } else if (["wedding", "indoor-banquet", "family-function", "private-event"].indexOf(v.type) !== -1) {
        lines.push("Preferred event date: " + v.eventDate);
        lines.push("Approximate event guest count: " + v.eventGuests);
        lines.push("Please confirm event-date availability, capacity, arrangements and any rates directly.");
      } else {
        lines.push("Please reply with the relevant information.");
      }
      if (v.message) lines.push("Additional message: " + v.message);
      lines.push("This is an enquiry only, not a confirmed reservation or event booking.");
      lines.push("I will review this draft and press Send in WhatsApp.");
      return lines.filter(Boolean).join("\n");
    }
    function applyQueryPreselection() {
      if (!window.URLSearchParams) return;
      var params = new URLSearchParams(window.location.search);
      var requestedRoom = params.get("room");
      var requestedRoomData = requestedRoom ? getRoomById(requestedRoom) : null;
      if (requestedRoomData && roomSelect) {
        Array.prototype.some.call(roomSelect.options, function (option) {
          if (option.textContent.trim() === requestedRoomData.name) { roomSelect.value = option.value; return true; }
          return false;
        });
        if (typeSelect) typeSelect.value = "room-booking";
      }
      var requestedType = params.get("type");
      if (requestedType && typeSelect) {
        var normalized = requestedType.toLowerCase().replace(/[^a-z]/g, "");
        var types = {
          roombooking: "room-booking", wedding: "wedding", indoorbanquet: "indoor-banquet",
          familyfunction: "family-function", privateevent: "private-event", generalenquiry: "general-enquiry"
        };
        if (types[normalized]) typeSelect.value = types[normalized];
      }
    }

    applyQueryPreselection();
    updateConditionalFields();
    updateDateRules();
    if (typeSelect) typeSelect.addEventListener("change", updateConditionalFields);
    [adultCount, childCount].forEach(function (field) {
      if (!field) return;
      field.addEventListener("input", updateGuestCountValidity);
      field.addEventListener("change", updateGuestCountValidity);
    });
    if (checkin) checkin.addEventListener("change", updateDateRules);
    if (checkout) checkout.addEventListener("change", updateDateRules);
    if (eventDate) eventDate.addEventListener("change", updateDateRules);
    if (phone) phone.addEventListener("input", function () { phone.setCustomValidity(""); });
    if (nameInput) nameInput.addEventListener("input", function () { nameInput.setCustomValidity(""); });
    form.addEventListener("input", function () { setFormFeedback(feedback, "", false); });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (honeypot && honeypot.value) return;
      if (!validateForm()) {
        setFormFeedback(feedback, "Please review the highlighted details. Check the date order, phone number and required fields.", true);
        return;
      }
      var message = messageFor(values());
      setFormFeedback(feedback, "Choose either official WhatsApp number. Your message will open as a draft; review it and press Send in WhatsApp. The hotel confirms availability, final rates and booking details manually.", false);
      if (typeof window.NDMOpenContactChoice === "function") window.NDMOpenContactChoice(submitButton, message, feedback);
      else setFormFeedback(feedback, "WhatsApp contact choices could not be opened. Please call the hotel or try again.", true);
    });
    if (submitButton) submitButton.disabled = false;
  }

  function initGallery() {
    var grid = $("[data-gallery-grid]");
    var dialog = $("#galleryLightbox");
    if (!grid) return;
    var tiles = $$('[data-gallery-item]', grid);
    var filters = $$('[data-gallery-filter]');
    var count = $("[data-gallery-count]");
    var image = $("[data-lightbox-image]", dialog);
    var caption = $("[data-lightbox-caption]", dialog);
    var current = 0;
    var returnFocus = null;
    renderGalleryFromConfig(grid);
    tiles = $$('[data-gallery-item]', grid);

    function visibleTiles() { return tiles.filter(function (tile) { return !tile.hidden && !tile.disabled; }); }
    function updateCount() { if (count) count.textContent = visibleTiles().length + " photographs"; }
    filters.forEach(function (filter) {
      filter.addEventListener("click", function () {
        var value = filter.getAttribute("data-gallery-filter");
        filters.forEach(function (button) { button.setAttribute("aria-pressed", button === filter ? "true" : "false"); });
        tiles.forEach(function (tile) { tile.hidden = value !== "all" && tile.getAttribute("data-category") !== value; });
        updateCount();
      });
    });
    updateCount();
    if (!dialog || !image) return;

    function openTile(tile) {
      returnFocus = tile;
      current = visibleTiles().indexOf(tile);
      if (current < 0) current = 0;
      showCurrent();
      if (typeof dialog.showModal === "function") dialog.showModal();
      else { dialog.setAttribute("open", ""); document.body.classList.add("menu-open"); }
    }
    function showCurrent() {
      var list = visibleTiles();
      if (!list.length) return;
      current = (current + list.length) % list.length;
      var tile = list[current];
      var img = $("img", tile);
      image.src = tile.getAttribute("data-src") || (img && img.currentSrc) || (img && img.src) || "";
      image.alt = tile.getAttribute("data-alt") || (img && img.alt) || "HOTEL ND MANOR photograph";
      if (caption) caption.textContent = tile.getAttribute("data-caption") || "";
    }
    tiles.forEach(function (tile) {
      tile.addEventListener("click", function () { openTile(tile); });
    });
    $$('[data-lightbox-close]', dialog).forEach(function (button) {
      button.addEventListener("click", function () {
        if (typeof dialog.close === "function") dialog.close();
        else { dialog.removeAttribute("open"); document.body.classList.remove("menu-open"); }
      });
    });
    $$('[data-lightbox-step]', dialog).forEach(function (button) {
      button.addEventListener("click", function () {
        current += Number(button.getAttribute("data-lightbox-step"));
        showCurrent();
      });
    });
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) {
        if (typeof dialog.close === "function") dialog.close();
        else { dialog.removeAttribute("open"); document.body.classList.remove("menu-open"); }
      }
    });
    document.addEventListener("keydown", function (event) {
      if (!dialog.open) return;
      if (event.key === "ArrowRight") { current += 1; showCurrent(); }
      if (event.key === "ArrowLeft") { current -= 1; showCurrent(); }
    });
    var touchStart = null;
    dialog.addEventListener("touchstart", function (event) {
      if (!dialog.open || !event.touches || event.touches.length !== 1) return;
      touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }, { passive: true });
    dialog.addEventListener("touchend", function (event) {
      if (!touchStart || !event.changedTouches || !event.changedTouches.length) return;
      var deltaX = event.changedTouches[0].clientX - touchStart.x;
      var deltaY = event.changedTouches[0].clientY - touchStart.y;
      touchStart = null;
      if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) return;
      current += deltaX < 0 ? 1 : -1;
      showCurrent();
    }, { passive: true });
    dialog.addEventListener("touchcancel", function () { touchStart = null; }, { passive: true });
    image.addEventListener("error", function () {
      image.removeAttribute("src");
      image.alt = "Photograph unavailable";
      if (caption) caption.textContent = "This photograph is temporarily unavailable.";
    });
    dialog.addEventListener("close", function () {
      image.removeAttribute("src");
      if (returnFocus && returnFocus.focus) {
        try { returnFocus.focus({ preventScroll: true }); } catch (error) { returnFocus.focus(); }
      }
    });
  }

  function initAnchorScroll() {
    $$('a[href^="#"]').forEach(function (link) {
      var href = link.getAttribute("href");
      if (!href || href === "#" || href.length < 2) return;
      link.addEventListener("click", function (event) {
        var target = $(href);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        if (history && history.replaceState) history.replaceState(null, "", href);
      });
    });
    if (location.hash) {
      var target = $(location.hash);
      if (target && target.tagName === "DETAILS") target.open = true;
    }
  }



  /* One-time scroll reveals are progressive enhancement: targets are never hidden by default. */
  function initScrollReveals() {
    if (reduceMotion || typeof window.IntersectionObserver !== "function") return;

    var groupedSelectors = [
      "#main .room-card", "#main .fact-card", "#main .portal-card",
      "#main .gallery-tile", "#main .gallery-preview__more",
      "#main .policy-card", "#main .policy-article", "#main .faq-item",
      "#main .enquiry-form", "#main .event-form", "#main .event-feature__copy",
      "#main .event-enquiry-copy", "#main .event-media-row__copy",
      "#main .contact-card", "#main .address-panel", "#main .about-contact__address",
      "#main .about-contact__actions", "#main .video-slot__caption",
      "#main .editorial-caption", "#main .amenity-list li",
      "#main .policy-summary", "#main .policy-index",
      ".site-footer .footer-brand", ".site-footer .footer-col", ".site-footer .footer-bottom"
    ].join(",");
    var selectors = [
      "#main h1", "#main h2", "#main h3", "#main p:not(.section-kicker)",
      "#main .section-kicker", "#main .section-copy", "#main .page-intro__note",
      "#main .button", "#main .text-link", "#main .form-help", "#main .form-disclaimer",
      "#main .filter-button", ".site-footer .footer-brand", ".site-footer .footer-col", ".site-footer .footer-bottom"
    ].join(",");
    var unique = [];
    var seen = new Set();
    $$(selectors).forEach(function (node) {
      if (seen.has(node) || node.hidden || node.closest(".intro-overlay")) return;
      seen.add(node);
      if (!node.matches(groupedSelectors) && node.closest(groupedSelectors)) return;
      unique.push(node);
    });
    if (!unique.length) return;

    var observer = new window.IntersectionObserver(function (entries) {
      var visible = entries.filter(function (entry) { return entry.isIntersecting; });
      visible.sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });
      visible.forEach(function (entry, index) {
        var node = entry.target;
        observer.unobserve(node);
        if (node.dataset.revealPlayed === "true") return;
        node.dataset.revealPlayed = "true";
        node.style.setProperty("--reveal-delay", String((index % 4) * 55) + "ms");
        node.classList.add("is-text-revealing");
        var settled = false;
        function cleanup() {
          if (settled) return;
          settled = true;
          node.classList.remove("is-text-revealing");
          node.style.removeProperty("--reveal-delay");
          node.removeEventListener("animationend", onAnimationEnd);
        }
        function onAnimationEnd(event) {
          if (event.target === node) cleanup();
        }
        node.addEventListener("animationend", onAnimationEnd);
        window.setTimeout(cleanup, 1100);
      });
    }, { rootMargin: "0px 0px -7% 0px", threshold: 0.05 });
    unique.forEach(function (node) { observer.observe(node); });
  }

  /* Photo entrances wait for both a real viewport intersection and a successful image load. */
  function initMediaReveals() {
    if (reduceMotion || typeof window.IntersectionObserver !== "function") return;
    var images = $$("#main .media-frame img");
    if (!images.length) return;

    var observer = new window.IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var image = entry.target;
        observer.unobserve(image);
        function revealLoadedImage() {
          var frame = image.closest(".media-frame");
          if (image.dataset.imageRevealPlayed === "true" || !image.complete || !image.naturalWidth) return;
          if (frame && (frame.classList.contains("has-video") || frame.classList.contains("is-missing"))) return;
          image.dataset.imageRevealPlayed = "true";
          image.classList.add("is-image-revealing");
          var settled = false;
          function cleanup() {
            if (settled) return;
            settled = true;
            image.classList.remove("is-image-revealing");
            image.removeEventListener("animationend", onAnimationEnd);
          }
          function onAnimationEnd(event) {
            if (event.target === image) cleanup();
          }
          image.addEventListener("animationend", onAnimationEnd);
          window.setTimeout(cleanup, 950);
        }
        if (image.complete) revealLoadedImage();
        else {
          image.addEventListener("load", revealLoadedImage, { once: true });
          image.addEventListener("error", function () {}, { once: true });
        }
      });
    }, { rootMargin: "120px 0px", threshold: 0.05 });
    images.forEach(function (image) { observer.observe(image); });
  }

  /* Keep fixed actions out of the way of forms, contact panels and essential footer links. */
  function initFloatingContact() {
    var widget = $(".floating-contact");
    if (!widget) return;
    var obstacleSelector = "form, .contact-card, .address-panel, .site-footer, [data-cookie-banner], .cookie-banner";
    var frameQueued = false;

    function updateVisibility() {
      frameQueued = false;
      var widgetRect = widget.getBoundingClientRect();
      var obscured = document.body.classList.contains("menu-open");
      if (!obscured && widgetRect.width && widgetRect.height) {
        obscured = $$(obstacleSelector).some(function (node) {
          if (node === widget || node.hidden || node.closest("[hidden]")) return false;
          var rect = node.getBoundingClientRect();
          if (!rect.width || !rect.height) return false;
          return rect.left < widgetRect.right && rect.right > widgetRect.left && rect.top < widgetRect.bottom && rect.bottom > widgetRect.top;
        });
      }
      widget.classList.toggle("is-obscured", obscured);
      widget.setAttribute("aria-hidden", obscured ? "true" : "false");
      if (obscured) widget.setAttribute("inert", "");
      else widget.removeAttribute("inert");
    }
    function scheduleUpdate() {
      if (frameQueued) return;
      frameQueued = true;
      if (typeof window.requestAnimationFrame === "function") window.requestAnimationFrame(updateVisibility);
      else window.setTimeout(updateVisibility, 40);
    }

    updateVisibility();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    document.addEventListener("focusin", scheduleUpdate);
    document.addEventListener("focusout", scheduleUpdate);
    if (typeof window.ResizeObserver === "function") {
      var resizeObserver = new window.ResizeObserver(scheduleUpdate);
      resizeObserver.observe(widget);
      $$(obstacleSelector).forEach(function (node) { resizeObserver.observe(node); });
    }
    if (typeof window.MutationObserver === "function") {
      var bodyObserver = new window.MutationObserver(scheduleUpdate);
      bodyObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    }
  }

  applyConfiguration();
  initIntro();
  initNavigation();
  initHeroVideo();
  initRoomCatalog();
  initEventEnquiry();
  initContactActions();
  initVideoSlots();
  initRoomVideos();
  initBookingForm();
  initGallery();
  initScrollReveals();
  initMediaReveals();
  initFloatingContact();
  initAnchorScroll();
})();
