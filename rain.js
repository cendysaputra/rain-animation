const canvas = document.getElementById("rainCanvas");
const ctx = canvas.getContext("2d");

let width, height;
const raindrops = [];
const ripples = [];

// Config
const CONFIG = {
  dropCount: 35, // jumlah tetesan aktif
  dropSpeed: { min: 4, max: 9 }, // kecepatan jatuh (px per frame)
  dropLength: { min: 15, max: 35 }, // panjang garis hujan
  dropWidth: 1, // ketebalan garis
  dropColor: "rgba(0, 0, 0, 0.3)", // hitam transparan
  surfaceY: 0.85, // posisi "permukaan" air (% dari height)
  rippleMaxRadius: 140, // radius max ripple
  rippleDuration: 2, // detik untuk ripple expand + fade
  rippleRings: 3, // jumlah ring konsentris per ripple
  rippleColor: "0, 0, 0", // RGB hitam
  rippleEllipseRatio: 0.35, // rasio tinggi/lebar ellipse (perspektif)
};

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

// === RAINDROP CLASS ===
class Raindrop {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * width;
    this.y = Math.random() * -height; // mulai dari atas (offscreen)
    this.speed = CONFIG.dropSpeed.min + Math.random() * (CONFIG.dropSpeed.max - CONFIG.dropSpeed.min);
    this.length = CONFIG.dropLength.min + Math.random() * (CONFIG.dropLength.max - CONFIG.dropLength.min);
    this.opacity = 0.15 + Math.random() * 0.25;
    this.active = true;
  }

  update() {
    if (!this.active) return;
    this.y += this.speed;

    // Cek apakah sudah sampai permukaan
    const surfaceLevel = height * CONFIG.surfaceY + Math.random() * (height * 0.28);
    if (this.y >= surfaceLevel) {
      // Spawn ripple
      ripples.push(new Ripple(this.x, surfaceLevel));
      this.reset();
    }
  }

  draw() {
    if (!this.active) return;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x, this.y + this.length);
    ctx.strokeStyle = `rgba(0, 0, 0, ${this.opacity})`;
    ctx.lineWidth = CONFIG.dropWidth;
    ctx.stroke();
  }
}

// === RIPPLE CLASS ===
class Ripple {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.progress = 0; // 0 to 1
    this.active = true;
    this.maxRadius = CONFIG.rippleMaxRadius * (0.6 + Math.random() * 0.4);

    // Pakai GSAP untuk animasi progress
    gsap.to(this, {
      progress: 1,
      duration: CONFIG.rippleDuration,
      ease: "power2.out",
      onComplete: () => {
        this.active = false;
      },
    });
  }

  draw() {
    if (!this.active) return;

    for (let i = 0; i < CONFIG.rippleRings; i++) {
      const ringDelay = i * 0.15;
      const ringProgress = Math.max(0, this.progress - ringDelay);
      if (ringProgress <= 0) continue;

      const radius = ringProgress * this.maxRadius;
      const opacity = Math.max(0, (1 - ringProgress) * 0.3);

      ctx.beginPath();
      ctx.ellipse(this.x, this.y, radius, radius * CONFIG.rippleEllipseRatio, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${CONFIG.rippleColor}, ${opacity})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

// === INIT RAINDROPS ===
for (let i = 0; i < CONFIG.dropCount; i++) {
  const drop = new Raindrop();
  drop.y = Math.random() * height; // spread awal biar gak serentak
  raindrops.push(drop);
}

// === ANIMATION LOOP ===
function animate() {
  ctx.clearRect(0, 0, width, height);

  // Update & draw raindrops
  raindrops.forEach((drop) => {
    drop.update();
    drop.draw();
  });

  // Draw ripples (cleanup inactive)
  for (let i = ripples.length - 1; i >= 0; i--) {
    ripples[i].draw();
    if (!ripples[i].active) {
      ripples.splice(i, 1);
    }
  }

  requestAnimationFrame(animate);
}

animate();
