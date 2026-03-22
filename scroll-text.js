const panels = document.querySelectorAll(".text-panel");
const dots = document.querySelectorAll(".dot");

let current = 0;
let isAnimating = false;

gsap.set(panels[0], { opacity: 1, y: 0 });
gsap.set(panels[1], { opacity: 0, y: 50 });
gsap.set(panels[2], { opacity: 0, y: 50 });

function updateDots(index) {
  dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
}

function goTo(index) {
  if (isAnimating || index === current || index < 0 || index >= panels.length) return;

  const prev = current;
  current = index;
  isAnimating = true;

  const direction = index > prev ? 1 : -1;

  gsap.to(panels[prev], {
    opacity: 0,
    y: -40 * direction,
    duration: 0.6,
    ease: "power2.inOut",
  });

  gsap.fromTo(
    panels[current],
    { opacity: 0, y: 40 * direction },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out",
      delay: 0.1,
      onComplete: () => {
        isAnimating = false;
      },
    }
  );

  updateDots(current);
}

// Wheel scroll
window.addEventListener("wheel", (e) => {
  if (e.ctrlKey) return;
  e.preventDefault();
  if (e.deltaY > 0) goTo(current + 1);
  else goTo(current - 1);
}, { passive: false });

// Arrow keys
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown" || e.key === "ArrowRight") goTo(current + 1);
  if (e.key === "ArrowUp" || e.key === "ArrowLeft") goTo(current - 1);
});

// Dot navigation
dots.forEach((dot, i) => {
  dot.addEventListener("click", () => goTo(i));
});
