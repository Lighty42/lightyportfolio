const createWheelButton = (direction, label, el) => {
  const button = el("button", `wheel-arrow wheel-arrow-${direction}`);
  const icon = el("img");

  button.type = "button";
  button.setAttribute("aria-label", label);
  icon.src = `media/icons/Arrow${direction === "left" ? "Left" : "Right"}.png`;
  icon.alt = "";
  icon.setAttribute("aria-hidden", "true");

  button.append(icon);

  return button;
};

window.renderWheel = ({ root, items, cardBuilder, emptyText, el }) => {
  root.replaceChildren();

  const validItems = items.filter((item) => cardBuilder(item));

  if (!validItems.length) {
    root.append(el("div", "empty-state", emptyText));
    return;
  }

  let start = 0;
  const visibleCount = Math.min(validItems.length, 3);
  const wheel = el("div", `horizontal-wheel${validItems.length > 3 ? " has-arrows" : ""}`);
  const track = el("div", "wheel-track");

  track.style.setProperty("--visible-items", visibleCount);

  const draw = (visibleNow = false) => {
    const cards = Array.from({ length: visibleCount }, (_, offset) => {
      const item = validItems[(start + offset) % validItems.length];

      return cardBuilder(item, visibleNow);
    }).filter(Boolean);

    track.replaceChildren(...cards);
  };

  draw();

  if (validItems.length > 3) {
    const previous = createWheelButton("left", "Show previous items", el);
    const next = createWheelButton("right", "Show next items", el);

    previous.addEventListener("click", () => {
      start = (start - 1 + validItems.length) % validItems.length;
      draw(true);
    });

    next.addEventListener("click", () => {
      start = (start + 1) % validItems.length;
      draw(true);
    });

    wheel.append(previous, track, next);
  } else {
    wheel.append(track);
  }

  root.append(wheel);
};
