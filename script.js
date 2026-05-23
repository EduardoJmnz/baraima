
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
  // La botella empieza a aparecer hasta que Historia ya entro al viewport, no desde Hero.
  const isHistoryVisible = rect.top <= vh * 0.16 && rect.bottom > vh * 0.2;
  const processActive = document.body.classList.contains("process-parallax-active");
  const mixologyActive = document.body.classList.contains("mixology-active");
  document.body.classList.toggle("history-bottle-visible", isHistoryVisible && !processActive && !mixologyActive);
  const progress = Math.min(Math.max((vh - rect.top) / (vh + rect.height), 0), 1);

  // La botella pertenece a Historia: sube ligeramente con el bloque y no queda fija de forma eterna.
  const historyTop = 52 + (progress - 0.5) * -18;
  const rotate = 14 + (progress - 0.5) * -8;

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
  const enterProgress = clamp01((vh - rect.top) / (vh * 1.05));
  // En Proceso el contenido sube al entrar, se queda fijo y la ola blanca lo cubre antes de que se despegue.
  const leaveProgress = clamp01((-rect.top - vh * 0.95) / (vh * 0.85));
  const processVisible = rect.top < vh && rect.bottom > -vh * 0.35;

  if (historyBottle) {
    document.body.classList.toggle("process-parallax-active", processVisible);
    document.body.classList.toggle("process-wave-covering", leaveProgress > 0.03);
    // El sticky de CSS mantiene el texto estable; no alternamos fixed para evitar brincos visuales.

    if (processVisible) {
      // La misma botella de Historia se reutiliza en Proceso: mantiene un margen real de 200px al borde derecho en desktop.
      const edgeGap = vw < 700 ? -vw * 0.18 : (vw < 980 ? 70 : 200);
      const startWidth = vw < 700 ? Math.min(vw * 0.64, 360) : Math.min(Math.max(vw * 0.29, 300), 470);
      const endWidth = vw < 700 ? Math.min(vw * 0.72, 390) : Math.min(Math.max(vw * 0.33, 360), 560);
      const startLeft = vw - edgeGap - startWidth;
      const endLeft = vw - edgeGap - endWidth;
      const startTop = vh * 0.52;
      const endTop = vh * 0.52;
      const startRotate = 14;
      const endRotate = -10;

      historyBottle.style.setProperty("--sharedBottleLeft", `${lerp(startLeft, endLeft, enterProgress)}px`);
      historyBottle.style.setProperty("--sharedBottleTop", `${lerp(startTop, endTop, enterProgress)}px`);
      historyBottle.style.setProperty("--sharedBottleWidth", `${lerp(startWidth, endWidth, enterProgress)}px`);
      historyBottle.style.setProperty("--sharedBottleRotate", `${lerp(startRotate, endRotate, enterProgress)}deg`);
    } else {
      document.body.classList.remove("process-parallax-active", "process-wave-covering", "process-copy-locked");
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

const lightSectionsForUi = Array.from(document.querySelectorAll(".mixology-section, .quote-section, .products-section, .white-section, [data-ui-theme='light'], [data-ui-theme='warm']"));

function isPointInsideLightSection(x, y) {
  return lightSectionsForUi.some((section) => {
    const rect = section.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  });
}

function updateWhiteSectionUi() {
  if (!lightSectionsForUi.length) return;
  const vw = window.innerWidth || 1;
  const vh = window.innerHeight || 1;

  // La UI fija cambia cuando sus zonas entran al campo visual del bloque claro.
  const topUiOnLight = isPointInsideLightSection(vw * 0.5, 64) || isPointInsideLightSection(vw - 82, 64);
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
    const targetSrc = (onLight || lightSiteVisible || document.body.classList.contains("recipe-page")) ? "assets/logo-red.png" : "assets/logo-white.png";
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
    href: "recipe.html?recipe=spritz"
  },
  anejo: {
    title: "AÑEJO",
    subtitle: "Suave e intenso.",
    description: "Un ron de carácter más profundo, pensado para momentos pausados. Sus notas cálidas acompañan recetas con personalidad y rituales donde el sabor se disfruta con calma.",
    href: "recipe.html?recipe=mojito"
  },
  cubaraima: {
    title: "CUBARAIMA",
    subtitle: "Tropical y cremoso.",
    description: "Una expresión ideal para cocteles tropicales: redonda, amable y lista para mezclarse con frutas, hielo y sobremesas largas que saben a Caribe.",
    href: "recipe.html?recipe=colada"
  }
};

const productTabs = document.querySelectorAll(".products-tab");
const productName = document.getElementById("productName");
const productSubtitle = document.getElementById("productSubtitle");
const productDescription = document.getElementById("productDescription");
const productCta = document.getElementById("productCta");

const productsContent = document.querySelector(".products-content");
let currentProductKey = "blanco";
let productAnimationLock = false;

function updateProductContent(item) {
  if (productName) productName.textContent = item.title;
  if (productSubtitle) productSubtitle.textContent = item.subtitle;
  if (productDescription) productDescription.textContent = item.description;
  if (productCta) productCta.setAttribute("href", item.href);
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

function openStoresModal() {
  if (!storesModal) return;
  storesModal.classList.remove("is-closing");
  storesModal.classList.add("is-open");
  storesModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("stores-modal-active");
  window.setTimeout(() => storesModal.querySelector("input")?.focus(), 320);
}

function closeStoresModal() {
  if (!storesModal || !storesModal.classList.contains("is-open")) return;
  storesModal.classList.add("is-closing");
  window.setTimeout(() => {
    storesModal.classList.remove("is-open", "is-closing");
    storesModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("stores-modal-active");
  }, 620);
}

storesModalOpen?.addEventListener("click", openStoresModal);
storesModalClose?.addEventListener("click", closeStoresModal);
storesModal?.addEventListener("click", (event) => {
  if (event.target === storesModal) closeStoresModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && storesModal?.classList.contains("is-open")) closeStoresModal();
});

/* V65: close Stores modal with scroll gesture instead of relying on internal panel scroll */
let storesModalTouchStartY = null;

storesModal?.addEventListener("wheel", (event) => {
  if (!storesModal.classList.contains("is-open")) return;
  if (Math.abs(event.deltaY) < 12) return;
  event.preventDefault();
  closeStoresModal();
}, { passive: false });

storesModal?.addEventListener("touchstart", (event) => {
  if (!storesModal.classList.contains("is-open")) return;
  storesModalTouchStartY = event.touches?.[0]?.clientY ?? null;
}, { passive: true });

storesModal?.addEventListener("touchmove", (event) => {
  if (!storesModal.classList.contains("is-open") || storesModalTouchStartY === null) return;
  const currentY = event.touches?.[0]?.clientY ?? storesModalTouchStartY;
  const distance = storesModalTouchStartY - currentY;
  if (Math.abs(distance) < 26) return;
  event.preventDefault();
  storesModalTouchStartY = null;
  closeStoresModal();
}, { passive: false });
