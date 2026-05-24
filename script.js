
const siteTopbar = document.querySelector(".topbar");
const siteScrollIndicator = document.querySelector(".scroll");
const menuButton = document.getElementById("menuButton");
const menuOverlay = document.getElementById("menuOverlay");
const menuClose = document.getElementById("menuClose");
const topbarLogo = document.querySelector(".topbar .logo");

/* Promote fixed UI outside section stacking contexts so it never sits under Mixologia or waves. */
if (siteTopbar && siteTopbar.parentElement !== document.body) document.body.appendChild(siteTopbar);
if (siteScrollIndicator && siteScrollIndicator.parentElement !== document.body) document.body.appendChild(siteScrollIndicator);
if (menuOverlay && menuOverlay.parentElement !== document.body) document.body.appendChild(menuOverlay);

function openMenu() {
  if (!menuButton || !menuOverlay) return;
  menuOverlay.classList.remove("is-closing");
  menuOverlay.classList.add("is-open");
  menuButton.classList.add("is-open");
  document.body.classList.add("menu-open");
  menuButton.setAttribute("aria-expanded", "true");
  menuOverlay.setAttribute("aria-hidden", "false");
}

function closeMenuAnimated() {
  if (!menuButton || !menuOverlay) return;
  menuOverlay.classList.add("is-closing");
  menuOverlay.classList.remove("is-open");
  menuButton.classList.remove("is-open");
  document.body.classList.remove("menu-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuOverlay.setAttribute("aria-hidden", "true");
  window.setTimeout(() => menuOverlay.classList.remove("is-closing"), 720);
}

if (menuButton) {
  menuButton.addEventListener("click", () => {
    if (menuOverlay?.classList.contains("is-open")) closeMenuAnimated();
    else openMenu();
  });
}

if (menuClose) menuClose.addEventListener("click", closeMenuAnimated);

if (menuOverlay) {
  menuOverlay.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenuAnimated);
  });
}

/* History bottle parallax */
const historyBottle = document.getElementById("historyBottle");
const historyBottleImg = historyBottle ? historyBottle.querySelector("img") : null;
const CAN_DESKTOP_SRC = "assets/cubaraima-can.png";
const CAN_MOBILE_HISTORY_SRC = "assets/cubaraima-can.png";
const CAN_MOBILE_PROCESS_SRC = "assets/cubaraima-can.png";
function setSharedCanSource(mode) {
  if (!historyBottleImg) return;
  const nextSrc = mode === "mobile-process"
    ? CAN_MOBILE_PROCESS_SRC
    : mode === "mobile-history"
      ? CAN_MOBILE_HISTORY_SRC
      : CAN_DESKTOP_SRC;
  const current = historyBottleImg.getAttribute("src") || "";
  if (!current.endsWith(nextSrc)) historyBottleImg.setAttribute("src", nextSrc);
}
if (historyBottle && historyBottle.parentElement !== document.body) document.body.appendChild(historyBottle);
let historyTicking = false;

function updateHistoryBottle() {
  if (!historyBottle) {
    historyTicking = false;
    return;
  }

  const section = document.querySelector(".history-section");
  if (!section) {
    historyTicking = false;
    return;
  }

  const rect = section.getBoundingClientRect();
  const vh = window.innerHeight || 1;
  const vw = window.innerWidth || 1;
  const isMobileViewport = vw < 700;
  if (isMobileViewport) {
    // Mobile can choreography is handled exclusively by the final mobile controller near the end of this file.
    // Do not let the legacy desktop/history parallax states fight it.
    document.body.classList.remove("history-bottle-visible", "mobile-can-was-history");
    setSharedCanSource("mobile-history");
    historyTicking = false;
    return;
  }
  // Mobile V164: Historia can exits earlier and smoother, before Proceso copy begins to take focus.
  const historyExitLine = isMobileViewport ? vh * 0.62 : vh * 0.2;
  const isHistoryVisible = rect.top <= vh * 0.16 && rect.bottom > historyExitLine;
  const processActive = document.body.classList.contains("process-parallax-active");
  const mixologyActive = document.body.classList.contains("mixology-active") || document.body.classList.contains("light-site-background");
  const processRectForHistory = document.getElementById("proceso")?.getBoundingClientRect();
  // V166 mobile: once Proceso is close enough to take over, Historia must not re-trigger.
  // This fixes the can flashing back after its first smooth exit.
  const historyCanHandoffOpen = isMobileViewport ? (!processRectForHistory || processRectForHistory.top > vh * 0.82) : true;
  const historyCanActive = isHistoryVisible && historyCanHandoffOpen && !processActive && !mixologyActive;
  document.body.classList.toggle("history-bottle-visible", historyCanActive);
  if (isMobileViewport && historyCanActive) {
    document.body.classList.add("mobile-can-was-history");
    document.body.classList.remove("mobile-can-was-process");
  }
  setSharedCanSource(isMobileViewport ? "mobile-history" : "desktop");
  const progress = Math.min(Math.max((vh - rect.top) / (vh + rect.height), 0), 1);

  // La botella pertenece a Historia: sube ligeramente con el bloque y no queda fija de forma eterna.
  const historyTop = 52 + (progress - 0.5) * -18;
  const rotate = 0;

  historyBottle.style.setProperty("--historyBottleTop", `${historyTop}vh`);
  historyBottle.style.setProperty("--historyBottleRotate", `${rotate}deg`);

  historyTicking = false;
}

function requestHistoryBottle() {
  if (!historyTicking) {
    requestAnimationFrame(updateHistoryBottle);
    historyTicking = true;
  }
}

window.addEventListener("scroll", requestHistoryBottle, { passive: true });
window.addEventListener("resize", requestHistoryBottle);
requestHistoryBottle();

/* History modal */
const historyModalOpen = document.getElementById("historyModalOpen");
const historyModal = document.getElementById("historyModal");

let historyClosing = false;
let waveDoneTimer = null;

function openHistoryModal() {
  if (!historyModal) return;

  historyClosing = false;
  clearTimeout(waveDoneTimer);

  historyModal.classList.remove("is-open", "is-closing", "red-closing", "wave-done");
  historyModal.scrollTop = 0;

  void historyModal.offsetHeight;

  historyModal.classList.add("is-open");
  document.body.classList.add("history-modal-active");
  historyModal.setAttribute("aria-hidden", "false");

  waveDoneTimer = window.setTimeout(() => {
    historyModal.classList.add("wave-done");
  }, 950);
}

function getHistoryRedCloseWave() {
  let wave = document.querySelector(".history-red-close-wave");
  if (wave) return wave;

  wave = document.createElement("div");
  wave.className = "history-red-close-wave";
  wave.setAttribute("aria-hidden", "true");
  wave.innerHTML = `
    <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
      <path d="M0,52 C160,82 270,20 430,50 C610,84 720,78 875,48 C1040,16 1160,82 1440,40 L1440,120 L0,120 Z"></path>
    </svg>
    <div class="history-red-close-wave__body"></div>
  `;
  document.body.appendChild(wave);
  return wave;
}

function closeHistoryModalWithRedWave() {
  if (!historyModal || historyClosing || !historyModal.classList.contains("is-open")) return;

  historyClosing = true;
  clearTimeout(waveDoneTimer);

  historyModal.classList.add("is-closing");
  historyModal.classList.remove("is-open", "red-closing", "wave-done");
  historyModal.style.overflowY = "hidden";

  window.setTimeout(() => {
    historyModal.classList.remove("is-open", "is-closing", "red-closing", "wave-done");
    historyModal.setAttribute("aria-hidden", "true");
    historyModal.style.overflowY = "";
    document.body.classList.remove("history-modal-active");
    historyClosing = false;
  }, 720);
}


if (historyModalOpen) {
  historyModalOpen.addEventListener("click", openHistoryModal);
}

const historyModalClose = document.getElementById("historyModalClose");
if (historyModalClose) {
  historyModalClose.addEventListener("click", closeHistoryModalWithRedWave);
}

if (historyModal) {
  historyModal.addEventListener("scroll", () => {
    const maxScroll = historyModal.scrollHeight - historyModal.clientHeight;
    if (maxScroll <= 0) return;

    const distanceToBottom = maxScroll - historyModal.scrollTop;

    if (distanceToBottom < 8) {
      closeHistoryModalWithRedWave();
    }
  }, { passive: true });
}

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  if (historyModal?.classList.contains("is-open")) {
    closeHistoryModalWithRedWave();
  }

  if (menuOverlay?.classList.contains("is-open")) {
    closeMenuAnimated();
  }
});

/* Process block: same bottle moves from Historia to Proceso + white wave transition */
const processSection = document.getElementById("proceso");
const processWave = document.querySelector(".process-next-wave");
let processTicking = false;

function clamp01(value) {
  return Math.min(Math.max(value, 0), 1);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function updateProcessBlock() {
  if (!processSection) {
    processTicking = false;
    return;
  }

  const rect = processSection.getBoundingClientRect();
  const vh = window.innerHeight || 1;
  const vw = window.innerWidth || 1;
  // V161: mobile timing refined. On mobile the process can should not appear
  // until the History copy has already left, and it should remain longer in Proceso.
  const isMobileViewport = vw < 700;
  // V166 mobile: Proceso can appears after Historia has exited, then stays visible long enough.
  const enterStart = isMobileViewport ? vh * 0.56 : vh * 0.82;
  const enterProgress = clamp01((enterStart - rect.top) / (vh * (isMobileViewport ? 0.34 : 0.95)));
  const leaveProgress = isMobileViewport
    ? clamp01((-rect.top - vh * 1.18) / (vh * 0.54))
    : clamp01((-rect.top - vh * 1.16) / (vh * 0.82));
  const processVisible = rect.top < enterStart && rect.bottom > (isMobileViewport ? vh * 0.10 : -vh * 0.35);

  if (historyBottle && !isMobileViewport) {
    const mixologySection = document.querySelector(".mixology-section");
    const mixologyTop = mixologySection ? mixologySection.getBoundingClientRect().top : Infinity;
    const isMobileCanTiming = vw < 700;
    const whiteWaveStarted = isMobileCanTiming
      ? (leaveProgress > 0.48 || mixologyTop < vh * 0.60)
      : (leaveProgress > 0.08 || mixologyTop < vh * 0.94);

    const processCanActive = processVisible && !whiteWaveStarted;
    document.body.classList.toggle("process-parallax-active", processCanActive);
    document.body.classList.toggle("process-wave-covering", isMobileCanTiming ? (leaveProgress > 0.46 || mixologyTop < vh * 0.64) : (leaveProgress > 0.05 || mixologyTop < vh));
    document.body.classList.toggle("process-can-hidden", whiteWaveStarted || document.body.classList.contains("light-site-background") || document.body.classList.contains("mixology-active"));
    if (isMobileCanTiming && processCanActive) {
      document.body.classList.add("mobile-can-was-process");
      document.body.classList.remove("mobile-can-was-history");
    }
    // El sticky de CSS mantiene el texto estable; no alternamos fixed para evitar brincos visuales.

    if (processVisible) {
      setSharedCanSource((window.innerWidth || 1) < 700 ? "mobile-process" : "desktop");
      // La misma lata de Historia viaja hacia Proceso: empieza a la derecha y termina grande a la izquierda como en PROCESS.pdf.
      // V139: match the exact Historia visual position as the start of the Proceso motion,
      // so the can does not jump when the scroll transition begins.
      const isMobileMotion = vw < 700;
      // V153 mobile: the can starts from the same visual position used in Historia
      // (text left / can right), so the transition does not jump or fake-start.
      const historyWidth = isMobileMotion ? Math.min(vw * 0.83, 360) : Math.min(Math.max(vw * 0.276, 290), 456);
      const processWidth = isMobileMotion ? Math.min(vw * 0.78, 340) : Math.min(Math.max(vw * 0.36, 420), 610);
      const historyRight = isMobileMotion ? -vw * 0.42 : (vw < 980 ? (vw < 620 ? vw * 0.04 : vw * 0.08) : Math.min(Math.max(vw * 0.18, 150), 290));
      const startLeft = vw - historyRight - historyWidth;
      const endLeft = isMobileMotion ? -vw * 0.28 : Math.max(-80, vw * 0.07);
      const historyRect = document.querySelector('.history-section')?.getBoundingClientRect();
      const historyProgress = clamp01((vh - (historyRect?.top || 0)) / (vh + (historyRect?.height || vh)));
      const desktopStartTop = vh * (52 + ((historyProgress - 0.5) * -18)) / 100;
      const startTop = isMobileMotion ? vh * 0.425 : desktopStartTop;
      const endTop = isMobileMotion ? vh * 0.50 : vh * 0.49 + 75;
      const startRotate = isMobileMotion ? -13 : 0;
      const endRotate = isMobileMotion ? 13 : -11;

      if (isMobileMotion) {
        // V157 mobile: Historia and Proceso use separate entrance moments.
        // Do not interpolate horizontally between sections on mobile; it caused a sideways/jumpy transition.
        // Historia can hides, then the same element appears from the left in Proceso with CSS diagonal-up animation.
        historyBottle.style.setProperty("--sharedBottleLeft", `${endLeft}px`);
        historyBottle.style.setProperty("--sharedBottleTop", `${endTop}px`);
        historyBottle.style.setProperty("--sharedBottleWidth", `${processWidth}px`);
        historyBottle.style.setProperty("--sharedBottleRotate", `${endRotate}deg`);
      } else {
        historyBottle.style.setProperty("--sharedBottleLeft", `${lerp(startLeft, endLeft, enterProgress)}px`);
        historyBottle.style.setProperty("--sharedBottleTop", `${lerp(startTop, endTop, enterProgress)}px`);
        historyBottle.style.setProperty("--sharedBottleWidth", `${lerp(historyWidth, processWidth, enterProgress)}px`);
        historyBottle.style.setProperty("--sharedBottleRotate", `${lerp(startRotate, endRotate, enterProgress)}deg`);
      }
    } else {
      document.body.classList.remove("process-parallax-active", "process-wave-covering", "process-copy-locked", "process-can-hidden");
    }
  }

  if (processWave) {
    const waveY = 100 - leaveProgress * 100;
    processWave.style.setProperty("--processWaveY", `${waveY}%`);
  }

  if (typeof updateWhiteSectionUi === "function") updateWhiteSectionUi();

  processTicking = false;
}

function requestProcessBlock() {
  if (!processTicking) {
    requestAnimationFrame(updateProcessBlock);
    processTicking = true;
  }
}

window.addEventListener("scroll", requestProcessBlock, { passive: true });
window.addEventListener("resize", requestProcessBlock);
requestProcessBlock();

/* V165: mobile can guardrail.
   The mobile can is allowed only while Historia or Proceso are meaningfully on screen.
   This prevents the fixed shared element from getting stuck when scrolling back up/down quickly. */
function updateMobileCanBoundsGuard() {
  const vw = window.innerWidth || 1;
  if (vw >= 700) {
    document.body.classList.remove("mobile-can-force-hidden");
    return;
  }
  const vh = window.innerHeight || 1;
  const historia = document.getElementById("historia") || document.querySelector(".history-section");
  const proceso = document.getElementById("proceso") || document.querySelector(".process-section");
  const h = historia ? historia.getBoundingClientRect() : null;
  const pr = proceso ? proceso.getBoundingClientRect() : null;
  const historyAllowed = h && h.top < vh * 0.96 && h.bottom > vh * 0.34 && (!pr || pr.top > vh * 0.78);
  const processAllowed = pr && pr.top < vh * 0.70 && pr.bottom > vh * 0.10;
  const allowed = Boolean(historyAllowed || processAllowed);
  document.body.classList.toggle("mobile-can-force-hidden", !allowed);
  if (!allowed) {
    document.body.classList.remove(
      "history-bottle-visible",
      "process-parallax-active",
      "process-wave-covering",
      "process-can-hidden",
      "mobile-can-was-history",
      "mobile-can-was-process"
    );
  }
}
window.addEventListener("scroll", updateMobileCanBoundsGuard, { passive: true });
window.addEventListener("resize", updateMobileCanBoundsGuard);
updateMobileCanBoundsGuard();

const lightSectionsForUi = Array.from(document.querySelectorAll(".mixology-section, .quote-section, .products-section, .rituales-section, .white-section, [data-ui-theme='light'], [data-ui-theme='warm']"));

function isPointInsideLightSection(x, y) {
  return lightSectionsForUi.some((section) => {
    const rect = section.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  });
}


function isRedNavbarZoneActive() {
  const redWave = document.querySelector('.products-red-wave');
  const rituales = document.querySelector('#rituales, .rituales-section');
  const navY = 64;
  const waveActive = (() => {
    if (!redWave) return false;
    const rect = redWave.getBoundingClientRect();
    return rect.top <= navY && rect.bottom >= navY;
  })();
  const ritualesActive = (() => {
    if (!rituales) return false;
    const rect = rituales.getBoundingClientRect();
    return rect.top <= 140 && rect.bottom > 0;
  })();
  return waveActive || ritualesActive;
}

function updateWhiteSectionUi() {
  if (!lightSectionsForUi.length) return;
  const vw = window.innerWidth || 1;
  const vh = window.innerHeight || 1;

  // La UI fija cambia cuando sus zonas entran al campo visual del bloque claro.
  const processWaveForUi = document.querySelector(".process-next-wave");
  const processWaveRectForUi = processWaveForUi ? processWaveForUi.getBoundingClientRect() : null;
  const mobileWhiteWaveTouchesNav = vw < 700 && processWaveRectForUi ? processWaveRectForUi.top <= 0 : true;
  const topUiOnLight = mobileWhiteWaveTouchesNav && (isPointInsideLightSection(vw * 0.5, 64) || isPointInsideLightSection(vw - 82, 64));
  const scrollUiOnLight = isPointInsideLightSection(vw - 64, vh - 120);
  const onLight = topUiOnLight || scrollUiOnLight;
  const lightSiteVisible = lightSectionsForUi.some((section) => {
    const rect = section.getBoundingClientRect();
    // El sitio cambia a hueso solo cuando la seccion clara ya llego al viewport superior.
    return rect.top <= 2 && rect.bottom > 0;
  });

  const mixologyActive = lightSectionsForUi.some((section) => {
    const rect = section.getBoundingClientRect();
    // Se activa hasta que Mixologia ya esta entrando como bloque, no mientras la ola apenas la revela.
    return section.classList.contains("mixology-section") && rect.top <= 6 && rect.bottom > 0;
  });

  document.body.classList.toggle("on-white-section", onLight || lightSiteVisible);
  document.body.classList.toggle("light-site-background", lightSiteVisible);
  document.body.classList.toggle("mixology-active", mixologyActive);

  const mixologyHeader = document.querySelector(".mixology-header");
  let hideMixologyLogo = document.body.classList.contains("recipe-page");
  if (mixologyHeader) {
    const headerRect = mixologyHeader.getBoundingClientRect();
    // When the Mixologia content reaches the centered reading position, remove the logo so it does not collide.
    hideMixologyLogo = hideMixologyLogo || (headerRect.top <= 120 && headerRect.bottom > 0);
  }
  document.body.classList.toggle("mixology-logo-hidden", hideMixologyLogo);

  if (topbarLogo) {
    const redNavActive = isRedNavbarZoneActive();
    document.body.classList.toggle("nav-red-active", redNavActive);
    const targetSrc = redNavActive
      ? "assets/logo-white.png"
      : ((onLight || lightSiteVisible || document.body.classList.contains("recipe-page")) ? "assets/logo-red.png" : "assets/logo-white.png");
    if (!topbarLogo.getAttribute("src")?.endsWith(targetSrc)) {
      topbarLogo.setAttribute("src", targetSrc);
    }
  }
}
window.addEventListener("scroll", updateWhiteSectionUi, { passive: true });
window.addEventListener("resize", updateWhiteSectionUi);
updateWhiteSectionUi();

/* V29: process modal with wave open and scroll close */
const processModalOpen = document.getElementById("processModalOpen");
const processModal = document.getElementById("processModal");
let processModalClosing = false;

function openProcessModal() {
  if (!processModal) return;
  processModalClosing = false;
  processModal.classList.remove("is-open", "auto-closing");
  processModal.scrollTop = 0;
  void processModal.offsetHeight;
  processModal.classList.add("is-open");
  document.body.classList.add("process-modal-active");
  processModal.setAttribute("aria-hidden", "false");
}

function closeProcessModalWithWave() {
  if (!processModal || processModalClosing || !processModal.classList.contains("is-open")) return;
  processModalClosing = true;
  processModal.classList.add("auto-closing");
  processModal.classList.remove("is-open");
  processModal.style.overflowY = "hidden";

  window.setTimeout(() => {
    processModal.classList.remove("is-open", "auto-closing");
    processModal.setAttribute("aria-hidden", "true");
    processModal.style.overflowY = "";
    document.body.classList.remove("process-modal-active");
    processModalClosing = false;
  }, 720);
}


if (processModalOpen) {
  processModalOpen.addEventListener("click", openProcessModal);
}

if (processModal) {
  processModal.addEventListener("scroll", () => {
    const maxScroll = processModal.scrollHeight - processModal.clientHeight;
    if (maxScroll <= 0) return;
    const distanceToBottom = maxScroll - processModal.scrollTop;
    if (distanceToBottom < 8) closeProcessModalWithWave();
  }, { passive: true });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && processModal?.classList.contains("is-open")) {
    closeProcessModalWithWave();
  }
});

/* V56: logo returns to hero */
if (topbarLogo) {
  topbarLogo.setAttribute("role", "button");
  topbarLogo.setAttribute("tabindex", "0");
  topbarLogo.addEventListener("click", () => {
    if (document.body.classList.contains("recipe-page")) {
      window.location.href = "index.html#hero";
      return;
    }
    const hero = document.getElementById("hero");
    if (hero) hero.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.location.hash = "hero";
  });
  topbarLogo.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      topbarLogo.click();
    }
  });
}

/* V58: Products tabs */
const productsData = {
  blanco: {
    title: "BLANCO",
    subtitle: "Fresco y cristalino.",
    description: "Su perfil fresco y cristalino revela notas suaves de caña y cítricos ligeros, creando un ron versátil, elegante y fácil de disfrutar. Perfecto para mixología, sobremesas largas y momentos que merecen servirse sin prisa.",
    href: "recipe.html?recipe=spritz",
    image: "assets/baraima-bottle.png"
  },
  anejo: {
    title: "AÑEJO",
    subtitle: "Suave e intenso.",
    description: "Un ron de carácter más profundo, pensado para momentos pausados. Sus notas cálidas acompañan recetas con personalidad y rituales donde el sabor se disfruta con calma.",
    href: "recipe.html?recipe=mojito",
    image: "assets/baraima-anejo-bottle.png",
    variant: "anejo"
  },
  cubaraima: {
    title: "CUBARAIMA",
    subtitle: "Tropical y listo.",
    description: "Ron & cola caribeña en lata: fresco, práctico y perfecto para rituales más casuales. Una mezcla vibrante para disfrutar bien fría, con el carácter de Baraima en cada trago.",
    href: "recipe.html?recipe=colada",
    image: "assets/cubaraima-can.png",
    variant: "can"
  }
};

const productTabs = document.querySelectorAll(".products-tab");
const productName = document.getElementById("productName");
const productSubtitle = document.getElementById("productSubtitle");
const productDescription = document.getElementById("productDescription");
const productCta = document.getElementById("productCta");
const productBottleImg = document.querySelector(".products-bottle img");
const productBottleWrap = document.querySelector(".products-bottle");

const productsContent = document.querySelector(".products-content");
let currentProductKey = "blanco";
let productAnimationLock = false;
if (productBottleWrap) productBottleWrap.dataset.productVisual = "bottle";

function updateProductContent(item) {
  if (productName) productName.textContent = item.title;
  if (productSubtitle) productSubtitle.textContent = item.subtitle;
  if (productDescription) productDescription.textContent = item.description;
  if (productCta) productCta.setAttribute("href", item.href);
  if (productBottleImg && item.image) productBottleImg.setAttribute("src", item.image);
  if (productBottleWrap) {
    productBottleWrap.classList.toggle("is-can", item.variant === "can");
    productBottleWrap.classList.toggle("is-anejo", item.variant === "anejo");
    productBottleWrap.dataset.productVisual = item.variant || "bottle";
  }
}

productTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const key = tab.dataset.product;
    const item = productsData[key];
    if (!item || key === currentProductKey || productAnimationLock) return;

    productTabs.forEach((button) => button.classList.remove("is-active"));
    tab.classList.add("is-active");
    currentProductKey = key;

    if (!productsContent) {
      updateProductContent(item);
      return;
    }

    productAnimationLock = true;
    productsContent.classList.remove("is-sliding-in");
    productsContent.classList.add("is-sliding-out");

    window.setTimeout(() => {
      updateProductContent(item);
      productsContent.classList.remove("is-sliding-out");
      void productsContent.offsetWidth;
      productsContent.classList.add("is-sliding-in");
    }, 220);

    window.setTimeout(() => {
      productsContent.classList.remove("is-sliding-in", "is-sliding-out");
      productAnimationLock = false;
    }, 700);
  });
});


/* V64: stores keeps red nav/bubbles and opens location search modal */
const storesSection = document.getElementById("stores");
function updateStoresUi() {
  if (!storesSection) return;
  const rect = storesSection.getBoundingClientRect();
  const isStoresActive = rect.top <= 70 && rect.bottom > 70;
  document.body.classList.toggle("stores-active", isStoresActive);
  if (isStoresActive && topbarLogo) {
    topbarLogo.setAttribute("src", "assets/logo-white.png");
  }
}
window.addEventListener("scroll", updateStoresUi, { passive: true });
window.addEventListener("resize", updateStoresUi);
updateStoresUi();

const storesModalOpen = document.getElementById("storesModalOpen");
const storesModal = document.getElementById("storesModal");
const storesModalClose = document.getElementById("storesModalClose");

let storesClosing = false;
let storesFocusTimer = null;

function openStoresModal() {
  if (!storesModal) return;
  storesClosing = false;
  window.clearTimeout(storesFocusTimer);
  storesModal.classList.remove("is-open", "is-closing");
  storesModal.scrollTop = 0;
  storesModal.querySelector(".stores-modal-panel")?.scrollTo?.(0, 0);
  void storesModal.offsetHeight;
  storesModal.classList.add("is-open");
  storesModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("stores-modal-active");
  storesFocusTimer = window.setTimeout(() => storesModal.querySelector("input")?.focus(), 420);
}

function closeStoresModal() {
  if (!storesModal || storesClosing || !storesModal.classList.contains("is-open")) return;
  storesClosing = true;
  window.clearTimeout(storesFocusTimer);
  storesModal.classList.add("is-closing");
  storesModal.classList.remove("is-open");
  storesModal.style.overflowY = "hidden";
  window.setTimeout(() => {
    storesModal.classList.remove("is-open", "is-closing");
    storesModal.setAttribute("aria-hidden", "true");
    storesModal.scrollTop = 0;
    storesModal.style.overflowY = "";
    document.body.classList.remove("stores-modal-active");
    storesClosing = false;
  }, 720);
}

storesModalOpen?.addEventListener("click", openStoresModal);
storesModalClose?.addEventListener("click", closeStoresModal);
storesModal?.addEventListener("click", (event) => {
  if (event.target === storesModal) closeStoresModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && storesModal?.classList.contains("is-open")) closeStoresModal();
});

/* V71: disabled blog/article links + contact modal */
document.querySelectorAll(".no-link").forEach((link) => {
  link.addEventListener("click", (event) => event.preventDefault());
});

const contactModalOpen = document.getElementById("contactModalOpen");
const contactModal = document.getElementById("contactModal");
const contactModalClose = document.getElementById("contactModalClose");

function openContactModal() {
  if (!contactModal) return;
  contactModal.classList.remove("is-closing");
  contactModal.scrollTop = 0;
  contactModal.classList.add("is-open");
  contactModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("contact-modal-active");
  window.setTimeout(() => contactModal.querySelector("input")?.focus(), 420);
}

function closeContactModal() {
  if (!contactModal || !contactModal.classList.contains("is-open")) return;
  contactModal.classList.add("is-closing");
  window.setTimeout(() => {
    contactModal.classList.remove("is-open", "is-closing");
    contactModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("contact-modal-active");
  }, 620);
}

contactModalOpen?.addEventListener("click", openContactModal);
contactModalClose?.addEventListener("click", closeContactModal);
contactModal?.addEventListener("click", (event) => {
  if (event.target === contactModal) closeContactModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && contactModal?.classList.contains("is-open")) closeContactModal();
});

/* V75: Hide global bubbles and scroll indicator while footer is visible */
const footerSection = document.getElementById("footer");
function updateFooterUi() {
  if (!footerSection) return;
  const rect = footerSection.getBoundingClientRect();
  const vh = window.innerHeight || 1;
  const footerVisible = rect.top < vh * 0.92 && rect.bottom > 0;
  document.body.classList.toggle("footer-active", footerVisible);
}
window.addEventListener("scroll", updateFooterUi, { passive: true });
window.addEventListener("resize", updateFooterUi);
updateFooterUi();


/* V82: close contact modal when ENVIAR is pressed */
const contactFormSubmitCloseV82 = document.querySelector("#contactModal .contact-form");
contactFormSubmitCloseV82?.addEventListener("submit", (event) => {
  event.preventDefault();
  closeContactModal();
});
contactFormSubmitCloseV82?.querySelector('button[type="submit"]')?.addEventListener("click", (event) => {
  event.preventDefault();
  closeContactModal();
});


/* V86: force original white bubbles while Historia or Proceso is active */
function updateHistoriaProcesoBubbleThemeV86() {
  const sections = [
    document.getElementById("historia"),
    document.getElementById("proceso")
  ].filter(Boolean);

  const active = sections.some((section) => {
    const rect = section.getBoundingClientRect();
    const y = Math.min(120, (window.innerHeight || 0) * 0.28);
    return rect.top <= y && rect.bottom >= y;
  });

  document.body.classList.toggle("historia-proceso-bubbles-white", active);
}

window.addEventListener("scroll", updateHistoriaProcesoBubbleThemeV86, { passive: true });
window.addEventListener("resize", updateHistoriaProcesoBubbleThemeV86);
updateHistoriaProcesoBubbleThemeV86();


/* V87: restore menu close button behavior */
const menuCloseV87 = document.getElementById("menuClose") || document.querySelector(".menu-close");
menuCloseV87?.addEventListener("click", () => {
  const menu =
    document.getElementById("menu") ||
    document.querySelector(".menu-overlay") ||
    document.querySelector(".site-menu") ||
    document.querySelector(".menu-panel")?.closest("aside");

  if (typeof closeMenu === "function") {
    closeMenu();
    return;
  }

  if (menu) {
    menu.classList.remove("is-open", "open", "active");
    menu.setAttribute("aria-hidden", "true");
  }

  document.body.classList.remove("menu-open", "nav-open", "is-menu-open");
});


/* V87: stronger active state for Historia/Proceso bubble color */
function updateHistoriaProcesoBubbleThemeV87() {
  const historia = document.getElementById("historia");
  const proceso = document.getElementById("proceso");
  const points = [
    80,
    (window.innerHeight || 0) * 0.25,
    (window.innerHeight || 0) * 0.5
  ];

  function sectionActive(section) {
    if (!section) return false;
    const rect = section.getBoundingClientRect();
    return points.some((y) => rect.top <= y && rect.bottom >= y);
  }

  const hActive = sectionActive(historia);
  const pActive = sectionActive(proceso);

  document.body.classList.toggle("history-active", hActive);
  document.body.classList.toggle("process-active", pActive);
  document.body.classList.toggle("proceso-active", pActive);
  document.body.classList.toggle("historia-proceso-bubbles-white", hActive || pActive);
}

window.addEventListener("scroll", updateHistoriaProcesoBubbleThemeV87, { passive: true });
window.addEventListener("resize", updateHistoriaProcesoBubbleThemeV87);
updateHistoriaProcesoBubbleThemeV87();

/* V96: Smooth reveal on scroll. Applies only to text nodes/elements and images, not bubbles or backgrounds. */
(function initSmoothScrollReveal(){
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealSelectors = [
    "main section h1",
    "main section h2",
    "main section h3",
    "main section h4",
    "main section p",
    "main section a",
    "main section button",
    "main section img",
    "main section .history-number",
    "main section .section-kicker",
    "main section .stores-title",
    "main section .contact-title"
  ].join(",");

  const blockedSelectors = [
    ".section-bubbles",
    ".always-bubbles",
    ".spark-field",
    ".menu-overlay",
    ".history-modal",
    ".process-modal",
    ".modal-wave",
    ".process-next-wave",
    ".scroll",
    ".topbar"
  ].join(",");

  const elements = Array.from(document.querySelectorAll(revealSelectors)).filter((el) => {
    if (!el || el.closest(blockedSelectors)) return false;
    // Los productos debajo de cada cocktail deben verse desde el primer render,
    // no depender del observer ni de volver desde recipe.html.
    if (el.matches(".mixology-card-copy p, .products-tabs, .products-tab")) {
      el.classList.remove("scroll-reveal-item", "is-visible");
      el.style.opacity = "1";
      el.style.visibility = "visible";
      el.style.transform = "none";
      el.style.filter = "none";
      return false;
    }
    if (el.classList.contains("scroll-reveal-item")) return false;
    return true;
  });

  elements.forEach((el, index) => {
    el.classList.add("scroll-reveal-item");
    el.style.transitionDelay = `${Math.min((index % 5) * 70, 280)}ms`;
  });

  if (reduceMotion) {
    elements.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
      else entry.target.classList.remove("is-visible");
    });
  }, {
    threshold:0.18,
    rootMargin:"0px 0px -8% 0px"
  });

  elements.forEach((el) => observer.observe(el));
})();


/* V104 REAL: mantener visible el menú selector de Mis Rones desde el primer render. */
document.querySelectorAll('.products-tabs, .products-tab').forEach((el) => {
  el.classList.remove('scroll-reveal-item', 'is-visible');
  el.style.opacity = '1';
  el.style.visibility = 'visible';
  el.style.transform = 'none';
  el.style.filter = 'none';
});

/* V111: Cambia la navegacion a rojo cuando la UI entra en la ola roja de Mis Rones o en Rituales. */
(function initDynamicRedNavbar(){
  const redWave = document.querySelector('.products-red-wave');
  const rituales = document.querySelector('#rituales, .rituales-section');
  const logo = document.querySelector('.topbar .logo');
  const redLogo = 'assets/logo-red.png';
  const whiteLogo = 'assets/logo-white.png';

  function rectCoversNavZone(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const y = 64;
    return rect.top <= y && rect.bottom >= y;
  }

  function sectionStarted(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return rect.top <= 140 && rect.bottom > 0;
  }

  function updateRedNavbar() {
    const active = isRedNavbarZoneActive();
    document.body.classList.toggle('nav-red-active', active);

    if (!logo) return;
    if (active) {
      if (!logo.getAttribute('src')?.endsWith(whiteLogo)) logo.setAttribute('src', whiteLogo);
      return;
    }

    if (typeof updateWhiteSectionUi === 'function') {
      updateWhiteSectionUi();
    } else if (!document.body.classList.contains('on-white-section') && !document.body.classList.contains('light-site-background')) {
      if (!logo.getAttribute('src')?.endsWith(whiteLogo)) logo.setAttribute('src', whiteLogo);
    }
  }

  window.addEventListener('scroll', updateRedNavbar, { passive: true });
  window.addEventListener('resize', updateRedNavbar);
  updateRedNavbar();
})();

/* V114 REAL: asegurar src del logo blanco en navbar roja, despues de todos los handlers previos. */
(function forceWhiteLogoOnRedNav(){
  const logo = document.querySelector('.topbar .logo');
  if (!logo) return;
  function syncLogo(){
    const active = document.body.classList.contains('nav-red-active') || (typeof isRedNavbarZoneActive === 'function' && isRedNavbarZoneActive());
    if (active && !logo.getAttribute('src')?.endsWith('assets/logo-white.png')) {
      logo.setAttribute('src', 'assets/logo-white.png');
    }
  }
  window.addEventListener('scroll', syncLogo, { passive:true });
  window.addEventListener('resize', syncLogo);
  syncLogo();
})();


/* V145: active state for cleaned menu. Default regular, current section bold. */
(function initMenuCurrentSection(){
  const links = Array.from(document.querySelectorAll('.menu-nav a[href^="#"]'));
  if (!links.length) return;
  const pairs = links.map((link) => {
    const id = link.getAttribute('href').slice(1);
    const section = document.getElementById(id);
    return { link, section };
  }).filter((item) => item.section);

  function getCurrent(){
    const probeY = Math.min(window.innerHeight * 0.42, 360);
    let current = pairs[0];
    for (const item of pairs) {
      const rect = item.section.getBoundingClientRect();
      if (rect.top <= probeY && rect.bottom > probeY) {
        current = item;
        break;
      }
      if (rect.top <= probeY) current = item;
    }
    return current;
  }

  function sync(){
    const current = getCurrent();
    links.forEach((link) => link.classList.remove('is-current'));
    if (current && current.link) current.link.classList.add('is-current');
  }

  window.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);
  document.addEventListener('DOMContentLoaded', sync);
  sync();
})();

/* V149: close Stores modal when the user reaches the end of its scroll,
   mirroring Historia's scroll-to-close behavior. */
(function(){
  const modal = document.getElementById('storesModal');
  if (!modal) return;
  let closingByScroll = false;
  function triggerCloseFromBottom(){
    if (!modal.classList.contains('is-open') || closingByScroll) return;
    const maxScroll = modal.scrollHeight - modal.clientHeight;
    if (maxScroll <= 12) return;
    const distanceToBottom = maxScroll - modal.scrollTop;
    if (distanceToBottom <= 10) {
      closingByScroll = true;
      if (typeof closeStoresModal === 'function') closeStoresModal();
      window.setTimeout(() => { closingByScroll = false; }, 760);
    }
  }
  modal.addEventListener('scroll', triggerCloseFromBottom, { passive:true });
  modal.addEventListener('touchend', () => window.setTimeout(triggerCloseFromBottom, 80), { passive:true });
})();

/* V169: removed legacy V167 mobile can controller to avoid duplicate state conflicts. */


/* V169: removed legacy V168 mobile can controller to avoid duplicate state conflicts. */



/* V169: single mobile-only Cubaraima can controller.
   Desktop remains controlled by the original handlers. On mobile this is the only
   controller allowed to show the shared can, preventing old rules from leaving it
   stuck vertical or visible outside Historia/Proceso. */
(function setupMobileCanV169(){
  const can = document.getElementById("historyBottle");
  if (!can) return;

  const v169States = [
    "v169-off",
    "v169-history-in",
    "v169-history-out",
    "v169-process-pre",
    "v169-process-in",
    "v169-process-out"
  ];
  const legacyCanClasses = [
    "history-bottle-visible",
    "process-parallax-active",
    "process-wave-covering",
    "process-can-hidden",
    "mobile-can-was-history",
    "mobile-can-was-process",
    "mobile-can-force-hidden",
    "mobile-can-v167",
    "v167-hidden",
    "v167-history",
    "v167-history-exit",
    "v167-process-pre",
    "v167-process",
    "v167-process-exit",
    "v167-hide-now",
    "mobile-can-v168",
    "v168-hard-hidden",
    "v168-history-in",
    "v168-history-out",
    "v168-process-pre",
    "v168-process-in",
    "v168-process-out",
    "v168-force-hidden"
  ];

  let currentState = "";
  let ticking = false;
  let hideTimer = null;

  function isMobile(){
    return (window.innerWidth || 1) < 700;
  }

  function clearLegacyCanState(){
    document.body.classList.remove(...legacyCanClasses);
  }

  function applyState(state){
    clearLegacyCanState();
    document.body.classList.add("mobile-can-v169");
    if (state === currentState) return;
    document.body.classList.remove(...v169States);
    document.body.classList.add(state);
    currentState = state;

    if (hideTimer) {
      window.clearTimeout(hideTimer);
      hideTimer = null;
    }
    // Let exit transitions finish, then fully remove visibility so the can never
    // remains touch/paint-active below Proceso.
    if (state === "v169-off") {
      hideTimer = window.setTimeout(() => {
        if (currentState === "v169-off") document.body.classList.add("v169-off-complete");
      }, 760);
    } else {
      document.body.classList.remove("v169-off-complete");
    }
  }

  function clearForDesktop(){
    if (hideTimer) window.clearTimeout(hideTimer);
    hideTimer = null;
    currentState = "";
    document.body.classList.remove("mobile-can-v169", "v169-off-complete", ...v169States);
  }

  function update(){
    ticking = false;
    if (!isMobile()) {
      clearForDesktop();
      return;
    }

    const vh = window.innerHeight || 1;
    const history = document.getElementById("historia") || document.querySelector(".history-section");
    const process = document.getElementById("proceso") || document.querySelector(".process-section");
    const mixology = document.querySelector(".mixology-section");
    if (!history || !process) {
      applyState("v169-off");
      return;
    }

    const h = history.getBoundingClientRect();
    const p = process.getBoundingClientRect();
    const m = mixology ? mixology.getBoundingClientRect() : { top: Infinity };

    // Hard guard: outside these two blocks, the can must be fully hidden.
    const beforeHistory = h.top > vh * 0.98;
    const afterProcess = m.top < vh * 0.86 || p.bottom < vh * 0.18;
    if (beforeHistory || afterProcess) {
      applyState("v169-off");
      return;
    }

    // HISTORIA: one clean cycle. It exits before Proceso takes over.
    if (h.top < vh * 0.96 && p.top > vh * 0.88) {
      applyState("v169-history-in");
      return;
    }
    if (p.top <= vh * 0.88 && p.top > vh * 0.70) {
      applyState("v169-history-out");
      return;
    }

    // Clean handoff gap: no can between Historia exit and Proceso entrance.
    if (p.top <= vh * 0.70 && p.top > vh * 0.56) {
      applyState("v169-process-pre");
      return;
    }

    // PROCESO: enter after Historia is gone, stay visible through most of Proceso,
    // then exit before the next white block/wave.
    if (p.top <= vh * 0.56 && m.top > vh * 0.78 && p.bottom > vh * 0.16) {
      applyState("v169-process-in");
      return;
    }
    if (m.top <= vh * 0.78 || p.bottom <= vh * 0.16) {
      applyState("v169-process-out");
      return;
    }

    applyState("v169-off");
  }

  function request(){
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener("scroll", request, { passive:true });
  window.addEventListener("resize", request);
  window.addEventListener("orientationchange", request);
  request();
})();

/* V171: clean local mobile can controller.
   This avoids the older fixed shared-can state machine on mobile. */
(function setupCleanLocalMobileCans(){
  const history = document.getElementById('historia') || document.querySelector('.history-section');
  const process = document.getElementById('proceso') || document.querySelector('.process-section');
  const mixology = document.querySelector('.mixology-section');
  if (!history || !process) return;

  let ticking = false;

  function isMobile(){
    return (window.innerWidth || 1) < 700;
  }

  function clearSectionStates(){
    history.classList.remove('mobile-local-can-visible','mobile-local-can-exit');
    process.classList.remove('mobile-local-can-visible','mobile-local-can-exit');
  }

  function update(){
    ticking = false;

    if (!isMobile()) {
      clearSectionStates();
      return;
    }

    /* Neutralize every legacy mobile/fixed-can class without affecting desktop. */
    document.body.classList.remove(
      'mobile-can-v169','v169-off','v169-history-in','v169-history-out',
      'v169-process-pre','v169-process-in','v169-process-out','v169-off-complete',
      'mobile-can-v168','mobile-can-v167','mobile-can-force-hidden',
      'history-bottle-visible','process-parallax-active','process-wave-covering',
      'mobile-can-was-history','mobile-can-was-process','process-can-hidden'
    );

    const vh = window.innerHeight || 1;
    const h = history.getBoundingClientRect();
    const p = process.getBoundingClientRect();
    const m = mixology ? mixology.getBoundingClientRect() : { top: Infinity };

    clearSectionStates();

    /* Historia: visible while the approved mobile composition is in view.
       Exit starts before Proceso text takes over. */
    if (h.top < vh * 0.92 && p.top > vh * 0.72 && h.bottom > vh * 0.22) {
      history.classList.add('mobile-local-can-visible');
      return;
    }
    if (p.top <= vh * 0.72 && p.top > vh * 0.56) {
      history.classList.add('mobile-local-can-exit');
      return;
    }

    /* Proceso: appears after Historia has already faded out, remains through the
       useful part of Proceso, and exits before Mixologia / the white wave takes over. */
    if (p.top <= vh * 0.56 && p.bottom > vh * 0.26 && m.top > vh * 0.82) {
      process.classList.add('mobile-local-can-visible');
      return;
    }
    if ((m.top <= vh * 0.82 || p.bottom <= vh * 0.26) && p.bottom > 0) {
      process.classList.add('mobile-local-can-exit');
    }
  }

  function request(){
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener('scroll', request, { passive:true });
  window.addEventListener('resize', request);
  window.addEventListener('orientationchange', request);
  request();
})();
