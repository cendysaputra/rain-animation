gsap.registerPlugin(ScrollTrigger);

const panels = document.querySelectorAll(".text-panel");
const dots = document.querySelectorAll(".dot");

// Set initial states
gsap.set(panels[0], { opacity: 1, y: 0 });
gsap.set(panels[1], { opacity: 0, y: 50 });
gsap.set(panels[2], { opacity: 0, y: 50 });

// Track active section untuk dots
let currentSection = 0;

function updateDots(index) {
  if (index === currentSection) return;
  currentSection = index;
  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === index);
  });
}

// Timeline yang di-scrub berdasarkan scroll, hero di-pin
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".hero",
    start: "top top",
    end: `+=${window.innerHeight * 3}`,
    pin: true,
    scrub: 1,
    onUpdate: (self) => {
      // Tentukan section aktif dari progress
      const progress = self.progress;
      if (progress < 0.3) {
        updateDots(0);
      } else if (progress < 0.7) {
        updateDots(1);
      } else {
        updateDots(2);
      }
    },
  },
});

// Transition 1: Panel 1 keluar → Panel 2 masuk
tl.to(panels[0], { opacity: 0, y: -40, duration: 1, ease: "power2.inOut" })
  .to(panels[1], { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, "-=0.5")
  // Jeda sebentar di panel 2
  .to({}, { duration: 0.8 })
  // Transition 2: Panel 2 keluar → Panel 3 masuk
  .to(panels[1], { opacity: 0, y: -40, duration: 1, ease: "power2.inOut" })
  .to(panels[2], { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, "-=0.5")
  // Jeda di panel 3
  .to({}, { duration: 0.8 });
