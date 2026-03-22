# Rain Animation Background — Agent Guide untuk Claude Code

## Overview

Buat 1 section fullscreen (100vh) dengan background animasi tetesan hujan menggunakan GSAP. Hujan berupa garis hitam tipis yang jatuh, lalu saat menyentuh "permukaan" bawah akan menghasilkan efek ripple (lingkaran konsentris yang menyebar lalu menghilang). Background utama putih dengan grain texture.

## Tech Stack

- HTML, CSS, JavaScript (vanilla)
- GSAP 3 (via CDN)
- Canvas API untuk animasi hujan & ripple

## Step 1 — Setup Project

```bash
touch index.html style.css rain.js
```

## Step 2 — HTML Structure (`index.html`)

```html
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Rain Animation</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <section class="hero">
      <!-- Grain overlay via CSS pseudo-element -->
      <!-- Canvas untuk animasi hujan -->
      <canvas id="rainCanvas"></canvas>
    </section>

    <!-- GSAP CDN -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <script src="rain.js"></script>
  </body>
</html>
```

## Step 3 — CSS Styling (`style.css`)

Aturan styling:

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.hero {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #e8e8e8; /* off-white / light gray base */
}

/* Grain overlay pakai pseudo-element */
.hero::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
  opacity: 0.4;
  /* Grain texture pakai SVG filter noise */
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 128px 128px;
}

#rainCanvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

/* Responsive padding jika mau taruh konten di atas canvas */
.hero-content {
  position: relative;
  z-index: 3;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px; /* tablet */
}

@media (max-width: 480px) {
  .hero-content {
    padding: 0 16px; /* mobile */
  }
}
```

## Step 4 — Rain Animation Logic (`rain.js`)

Ini adalah inti animasinya. Pakai Canvas API + GSAP untuk kontrol timing.

### Konsep Animasi:

1. **Raindrops**: Garis vertikal hitam tipis yang jatuh dari atas ke bawah
2. **Ripples**: Saat raindrop sampai di "permukaan" (sekitar 70-85% tinggi canvas), raindrop menghilang dan muncul ripple berupa lingkaran konsentris yang menyebar (radius membesar) lalu fade out
3. **Ripple perspective**: Ripple digambar sebagai ellipse (bukan circle) untuk efek perspektif — seolah dilihat dari atas dengan sedikit sudut

### Implementasi:

```javascript
const canvas = document.getElementById("rainCanvas");
const ctx = canvas.getContext("2d");

let width, height;
const raindrops = [];
const ripples = [];

// Config
const CONFIG = {
  dropCount: 60, // jumlah tetesan aktif
  dropSpeed: { min: 4, max: 9 }, // kecepatan jatuh (px per frame)
  dropLength: { min: 15, max: 35 }, // panjang garis hujan
  dropWidth: 1, // ketebalan garis
  dropColor: "rgba(0, 0, 0, 0.3)", // hitam transparan
  surfaceY: 0.72, // posisi "permukaan" air (% dari height)
  rippleMaxRadius: 80, // radius max ripple
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
    const surfaceLevel = height * CONFIG.surfaceY + Math.random() * (height * 0.15);
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
```

## Step 5 — Polish & Tuning

### Gradient overlay buat depth

Tambahin gradient gelap di bagian bawah section biar kesan "permukaan air" lebih kuat:

```css
.hero::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40%;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.08));
}
```

### Performance tips:

- `dropCount` di 60 udah cukup smooth. Kalau mau lebih dense naikin ke 80-100 tapi test di mobile dulu
- Canvas `willReadFrequently: false` (default) udah oke karena kita cuma write
- `requestAnimationFrame` udah otomatis pause kalau tab gak aktif

### Optional — Splash particle kecil:

Kalau mau lebih detail, tambahin tiny particles yang muncul ke atas saat raindrop hit surface (kayak percikan kecil). Tapi ini opsional dan bisa ditambahin nanti.

## Struktur File Final

```
rain-animation/
├── index.html
├── style.css
└── rain.js
```

## Catatan Penting

- Semua animasi jalan di Canvas, jadi ringan dan performant
- GSAP dipakai khusus untuk ripple easing (power2.out bikin ripple expand yang natural)
- Background grain pakai inline SVG filter di CSS, gak perlu file tambahan
- Responsive: canvas otomatis resize, padding konten 24px tablet / 16px mobile
- Warna: background putih/grain, hujan hitam line, ripple hitam transparan
