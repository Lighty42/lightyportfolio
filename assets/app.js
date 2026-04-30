const files = {
  work: "portfolio-stuff/items.json",
  pricing: "portfolio-stuff/pricing.json",
  testimonials: "portfolio-stuff/testimonials.json",
};

const roots = {
  work: document.querySelector("#portfolio-root"),
  pricing: document.querySelector("#pricing-root"),
  testimonials: document.querySelector("#testimonials-root"),
};

const el = (tag, className = "", text = "") => {
  const node = document.createElement(tag);

  if (className) node.className = className;

  if (text) node.textContent = text;

  return node;
};

const addText = (parent, tag, className, text) => { // im going to crash out
  if (!text) return;

  parent.append(el(tag, className, text));
};

const load = async (file) => {
  const response = await fetch(file, { cache: "no-store" });

  if (!response.ok) throw new Error(file);

  return response.json();
};

const mediaType = (src) => {
  const path = src.split("?")[0].toLowerCase();

  return /\.(mp4|webm|ogg|mov)$/.test(path) 
    ? "video" : "image";
};

const renderMedia = (media = [], title = "Portfolio item") => {
  if (!media.length) return null;

  const gallery = el("div", `media-gallery ${media.length === 1 ? "single-media" : "multi-media"}`);

  gallery.setAttribute("aria-label", `${title} media`);

  media.forEach((src) => {
    const frame = el("figure", "media-frame");

    if (mediaType(src) === "video") {

      const video = el("video");

      video.src = src;
      video.controls = true; // WHY DO I HAVE TO ENABLE CONTROLS FOR IT TO WORK ON MOBILE BROWSERS WHY IS THIS A THING IT SHOULD JUST BE ENABLED BY DEFAULT
      video.playsInline = true;
      video.preload = "metadata";
      frame.append(video);

    } else {

      const image = el("img");
      image.src = src;
      image.alt = title;
      image.loading = "lazy";
      frame.append(image);

    }

    gallery.append(frame);
  });

  return gallery;
};

const renderWorkText = (item) => {
  if (!item.title && !item.description) return null;

  const body = el("div", "project-body");

  addText(body, "h3", "", item.title);
  addText(body, "p", "project-description", item.description);

  return body;
};

const renderPriceText = (item) => {
  if (!item.type && !item.price && !item.description) return null;

  const body = el("div", "price-body");

  addText(body, "h3", "", item.type);
  addText(body, "p", "price-value", item.price);
  addText(body, "p", "price-description", item.description);

  return body;
};

const createWorkCard = (item, visibleNow = false) => {
  const card = el("article", `work-card reveal${visibleNow ? " is-visible" : ""}`);
  const media = renderMedia(item.media, item.title);
  const text = renderWorkText(item);

  if (!media && !text) return null;

  if (media) card.append(media);
  if (text) card.append(text);

  return card;
};

const createTestimonialCard = (item, visibleNow = false) => {
  const card = el("article", `testimonial-card reveal${visibleNow ? " is-visible" : ""}`);
  const head = el("div", "testimonial-head");
  const person = el("div", "person-line");

  addText(person, "h3", "", item.person);
  addText(person, "p", "", item.role);

  head.append(person, el("span", "score-chip", `${item.score}/10`));
  card.append(head);

  addText(card, "p", "testimonial-message", item.message);

  return card;
};

const renderWork = ({ items = [] }) => {
  window.renderWheel({
    root: roots.work,
    items,
    cardBuilder: createWorkCard,
    emptyText: "son, add portfolio items",
    el,
  });
};

const renderPricing = ({ items = [], note = "" }) => {
  roots.pricing.replaceChildren();

  if (!items.length) {
    roots.pricing.append(el("div", "empty-state", "add pricing items you absolute chudcore"));
    return;
  }

  items.forEach((item) => {
    const card = el("article", "price-card reveal");
    const media = renderMedia(item.media, item.type);
    const text = renderPriceText(item);

    if (!media && !text) return;

    if (media) card.append(media);
    if (text) card.append(text);

    roots.pricing.append(card);
  });

  if (!roots.pricing.children.length) {
    roots.pricing.append(el("div", "empty-state", "stop getting past the first check, add more pricing items"));
  }

  addText(roots.pricing, "p", "pricing-note reveal", note);
};

const renderTestimonials = ({ testimonials = [] }) => {
  window.renderWheel({
    root: roots.testimonials,
    items: testimonials,
    cardBuilder: createTestimonialCard,
    emptyText: "add testimonials, fat noob, imagine being so noob bro",
    el,
  });
};

const revealStuff = () => {
  const hiddenThings = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    hiddenThings.forEach((thing) => thing.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");

        observer.unobserve(entry.target);
      });
    },

    { threshold: 0.12 }
  );

  hiddenThings.forEach((thing) => observer.observe(thing));
};

const renderError = (root, file) => {
  root.replaceChildren(el("div", "error-state", `FUCK, ${file} DIDNT LOAD OH SHIT FUCK SHIT OH GOD NO`));
};

const init = async () => {
  revealStuff();

  const [work, pricing, testimonials] = await Promise.allSettled([
    load(files.work),
    load(files.pricing),
    load(files.testimonials),
  ]);

  work.status === "fulfilled" ? renderWork(work.value) : renderError(roots.work, files.work);
  pricing.status === "fulfilled" ? renderPricing(pricing.value) : renderError(roots.pricing, files.pricing);

  testimonials.status === "fulfilled"
    ? renderTestimonials(testimonials.value)
    : renderError(roots.testimonials, files.testimonials);

  revealStuff();
};

init();
