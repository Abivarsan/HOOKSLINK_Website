/**
 * HOOKSLINK - 'Zero-Gravity/Antigravity' Quantum Orbit Warp Interactive Background Engine
 * High-performance 2D Canvas physics simulation featuring:
 * - 3D Bernoulli Lemniscate particle nexus (#E0F2FE sky blue, #38BDF8 turquoise, #FCD34D warm gold)
 * - Zero-G weightless drift, stellar gas flicker, and breakaway ascending stray stars
 * - Interactive magnetic cursor repulsion with spring-damped return physics
 * - 3D warped spacetime coordinate grid with gravitational cursor deflection
 * - Multi-layer parallax scroll & dynamic HUD coordinate matrix
 */

export function initQuantumOrbit(container) {
  if (!container) return;

  const canvas = container.querySelector('#quantum-orbit-canvas') || container.querySelector('canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const latElem = container.querySelector('[data-coord-lat]');
  const lngElem = container.querySelector('[data-coord-lng]');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let animationId = null;
  let isVisible = true;
  let scrollY = 0;

  // Pointer tracking & magnetic field coordinates
  const mouse = {
    x: -9999,
    y: -9999,
    targetX: -9999,
    targetY: -9999,
    isHovering: false,
    radius: 140, // Repulsion buffer radius
    force: 8.5
  };

  // Color palettes matching the design brief
  const COLOR_PALETTES = [
    { r: 224, g: 242, b: 254 }, // #E0F2FE Sky Blue (Core Stars)
    { r: 56,  g: 189, b: 248 }, // #38BDF8 Turquoise (Plasma Streams)
    { r: 252, g: 211, b: 77  }, // #FCD34D Warm Gold (Cosmic Core)
    { r: 129, g: 140, b: 248 }  // #818CF8 Cyber Indigo (Deep Nebula Dust)
  ];

  // 3D Perspective Rotation Constants
  const TILT_X = -0.28; // ~-16 deg pitch (tilt top backward)
  const TILT_Y = 0.12;  // ~7 deg yaw
  const TILT_Z = -0.06; // ~-3.5 deg roll
  const cosX = Math.cos(TILT_X), sinX = Math.sin(TILT_X);
  const cosY = Math.cos(TILT_Y), sinY = Math.sin(TILT_Y);
  const cosZ = Math.cos(TILT_Z), sinZ = Math.sin(TILT_Z);
  const FOV = 850;

  let particles = [];
  let strayStars = [];
  let gridNodes = [];

  function resize() {
    const rect = container.getBoundingClientRect();
    width = rect.width || window.innerWidth;
    height = rect.height || window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);

    initParticles();
    initGrid();
  }

  // 3D coordinate transformation & projection
  function project3D(x0, y0, z0, cx, cy) {
    // Rotate around X
    const y1 = y0 * cosX - z0 * sinX;
    const z1 = y0 * sinX + z0 * cosX;

    // Rotate around Y
    const x2 = x0 * cosY + z1 * sinY;
    const z2 = -x0 * sinY + z1 * cosY;

    // Rotate around Z
    const x3 = x2 * cosZ - y1 * sinZ;
    const y3 = x2 * sinZ + y1 * cosZ;

    // Perspective projection
    const scale = FOV / (FOV + z2);
    return {
      x: cx + x3 * scale,
      y: cy + y3 * scale,
      z: z2,
      scale: scale
    };
  }

  // Parametric Lemniscate equation: returns {x, y, z}
  function getLemniscatePoint(t, radiusA, radiusB, radiusC) {
    const sinT = Math.sin(t);
    const cosT = Math.cos(t);
    const denom = 1 + sinT * sinT;

    return {
      x: (radiusA * cosT) / denom,
      y: (radiusB * sinT * cosT) / denom,
      z: radiusC * sinT
    };
  }

  function initParticles() {
    const isMobile = width < 768;
    const particleCount = isMobile ? 1100 : 2300;
    particles = new Array(particleCount);

    const radiusA = Math.min(width * 0.38, 520);
    const radiusB = radiusA * 0.50;
    const radiusC = radiusA * 0.30;

    for (let i = 0; i < particleCount; i++) {
      const t = Math.random() * Math.PI * 2;
      const speed = 0.0006 + Math.random() * 0.0018;

      // Gaussian cross-sectional dispersion around orbit track
      const dispersion = (Math.random() + Math.random() + Math.random() - 1.5) * (isMobile ? 18 : 28);
      const angleOffset = Math.random() * Math.PI * 2;

      // Color selection (45% Sky Blue, 35% Turquoise, 18% Gold, 2% Pulsar)
      const randColor = Math.random();
      let colorIndex = 0;
      let isPulsar = false;

      if (randColor < 0.45) {
        colorIndex = 0; // Sky Blue
      } else if (randColor < 0.80) {
        colorIndex = 1; // Turquoise
      } else if (randColor < 0.98) {
        colorIndex = 2; // Warm Gold
      } else {
        colorIndex = 0;
        isPulsar = true; // Sparkling 4-point diffraction spike star
      }

      particles[i] = {
        t: t,
        speed: speed,
        dispX: (Math.random() - 0.5) * dispersion,
        dispY: (Math.random() - 0.5) * dispersion,
        dispZ: (Math.random() - 0.5) * (dispersion * 0.7),
        size: isPulsar ? (2.2 + Math.random() * 1.2) : (0.75 + Math.random() * 1.6),
        color: COLOR_PALETTES[colorIndex],
        alpha: 0.25 + Math.random() * 0.75,
        flickerPhase: Math.random() * Math.PI * 2,
        flickerSpeed: 0.02 + Math.random() * 0.05,
        isPulsar: isPulsar,
        // Interactive repulsion displacement & velocity
        repelX: 0,
        repelY: 0,
        vx: 0,
        vy: 0,
        // Zero-G upward drift offset
        driftVy: -0.04 - Math.random() * 0.08,
        driftVx: 0.02 + Math.random() * 0.04
      };
    }

    // Initialize breakaway stray stars (~60 active)
    const strayCount = isMobile ? 32 : 64;
    strayStars = new Array(strayCount);
    for (let i = 0; i < strayCount; i++) {
      strayStars[i] = createStrayStar(radiusA, radiusB, radiusC, true);
    }
  }

  function createStrayStar(radiusA, radiusB, radiusC, randomStart) {
    const t = Math.random() * Math.PI * 2;
    const pt = getLemniscatePoint(t, radiusA, radiusB, radiusC);
    const cx = width * 0.5;
    const cy = height * 0.46;
    const proj = project3D(pt.x, pt.y, pt.z, cx, cy);

    const maxAge = 90 + Math.floor(Math.random() * 120);

    return {
      x: proj.x + (Math.random() - 0.5) * 30,
      y: proj.y + (randomStart ? (Math.random() - 0.5) * 120 : 0),
      vx: (Math.random() - 0.45) * 0.35,
      vy: -0.35 - Math.random() * 0.75, // Weightless zero-G ascent
      size: 0.8 + Math.random() * 1.5,
      color: Math.random() > 0.4 ? COLOR_PALETTES[0] : COLOR_PALETTES[1],
      age: randomStart ? Math.floor(Math.random() * maxAge) : 0,
      maxAge: maxAge,
      alpha: 0.7
    };
  }

  // 3D Warped Spacetime Coordinate Grid
  function initGrid() {
    gridNodes = [];
    const rows = 14;
    const cols = 18;
    const stepX = width / cols;
    const stepY = height / rows;

    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        gridNodes.push({
          baseX: c * stepX,
          baseY: r * stepY,
          currX: c * stepX,
          currY: r * stepY,
          vx: 0,
          vy: 0
        });
      }
    }
  }

  function renderGrid(cx, cy, radiusA) {
    ctx.save();
    ctx.lineWidth = 0.8;

    // Draw perspective longitude & latitude warp lines
    const ringCount = 7;
    const mouseActive = mouse.isHovering && mouse.x > 0;

    for (let i = 1; i <= ringCount; i++) {
      const rA = radiusA * (0.35 + i * 0.28);
      const rB = rA * 0.42;

      ctx.beginPath();
      const segments = 48;
      for (let s = 0; s <= segments; s++) {
        const angle = (s / segments) * Math.PI * 2;
        let x0 = Math.cos(angle) * rA;
        let y0 = Math.sin(angle) * rB;
        let z0 = Math.sin(angle * 2) * (rA * 0.15);

        const proj = project3D(x0, y0, z0, cx, cy - scrollY * 0.12);

        // Subtle gravitational warp under mouse
        if (mouseActive) {
          const dx = proj.x - mouse.x;
          const dy = proj.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 180 && dist > 0) {
            const warp = (1 - dist / 180) * 14;
            proj.x += (dx / dist) * warp;
            proj.y += (dy / dist) * warp;
          }
        }

        if (s === 0) {
          ctx.moveTo(proj.x, proj.y);
        } else {
          ctx.lineTo(proj.x, proj.y);
        }
      }
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.035 + (i % 2 === 0 ? 0.025 : 0)})`;
      ctx.stroke();
    }

    // Faint intersecting orbital elliptical constellation paths
    for (let o = 0; o < 2; o++) {
      ctx.beginPath();
      const sign = o === 0 ? 1 : -1;
      const orbA = radiusA * 0.95;
      const orbB = radiusA * 0.45;

      for (let s = 0; s <= 60; s++) {
        const u = (s / 60) * Math.PI * 2;
        const x0 = Math.cos(u) * orbA;
        const y0 = Math.sin(u) * orbB * 0.7 + sign * Math.sin(u) * 20;
        const z0 = Math.sin(u) * orbB * 0.85;

        const proj = project3D(x0, y0, z0, cx, cy - scrollY * 0.18);
        if (s === 0) ctx.moveTo(proj.x, proj.y);
        else ctx.lineTo(proj.x, proj.y);
      }
      ctx.strokeStyle = o === 0 ? 'rgba(56, 189, 248, 0.14)' : 'rgba(129, 140, 248, 0.12)';
      ctx.stroke();
    }

    ctx.restore();
  }

  // Draw 4-point star diffraction spike (pulsar glow)
  function drawPulsarSpike(ctx, x, y, size, alpha) {
    ctx.save();
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.85})`;
    ctx.lineWidth = 1;

    const arm = size * 3.2;
    ctx.beginPath();
    ctx.moveTo(x - arm, y);
    ctx.lineTo(x + arm, y);
    ctx.moveTo(x, y - arm);
    ctx.lineTo(x, y + arm);
    ctx.stroke();

    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Main Animation Loop
  function tick(timestamp) {
    if (!isVisible) {
      animationId = requestAnimationFrame(tick);
      return;
    }

    ctx.clearRect(0, 0, width, height);

    const cx = width * 0.5;
    const cy = height * 0.46; // Center slightly above midpoint to allow hero text breathing room
    const radiusA = Math.min(width * 0.38, 520);
    const radiusB = radiusA * 0.50;
    const radiusC = radiusA * 0.30;

    // Smooth mouse coordinates interpolation
    mouse.x += (mouse.targetX - mouse.x) * 0.25;
    mouse.y += (mouse.targetY - mouse.y) * 0.25;

    // 1. Render 3D Warped Spacetime Grid
    renderGrid(cx, cy, radiusA);

    // 2. Render & Update Particle Nexus (Infinite Lemniscate)
    const particleLen = particles.length;
    const mouseActive = mouse.isHovering && mouse.x > 0;

    for (let i = 0; i < particleLen; i++) {
      const p = particles[i];

      if (!prefersReducedMotion) {
        // Orbit progression along parametric t
        p.t = (p.t + p.speed) % (Math.PI * 2);
        p.flickerPhase += p.flickerSpeed;
      }

      // Base 3D lemniscate coordinates + local cross-sectional dispersion
      const basePt = getLemniscatePoint(p.t, radiusA, radiusB, radiusC);
      const x0 = basePt.x + p.dispX;
      const y0 = basePt.y + p.dispY;
      const z0 = basePt.z + p.dispZ;

      // Project into 2D screen coordinates with parallax scroll factor
      const proj = project3D(x0, y0, z0, cx, cy - scrollY * 0.24);

      // Magnetic Cursor Repulsion & Spring Easing Physics
      if (mouseActive) {
        const dx = (proj.x + p.repelX) - mouse.x;
        const dy = (proj.y + p.repelY) - mouse.y;
        const dist = Math.hypot(dx, dy);

        if (dist < mouse.radius && dist > 0) {
          // Force is inversely proportional to distance (weightless scatter)
          const force = (1 - dist / mouse.radius) * mouse.force;
          const angle = Math.atan2(dy, dx);
          p.vx += Math.cos(angle) * force;
          p.vy += Math.sin(angle) * force;
        }
      }

      // Spring-damped return loop
      p.vx = (p.vx - p.repelX * 0.08) * 0.86;
      p.vy = (p.vy - p.repelY * 0.08) * 0.86;
      p.repelX += p.vx;
      p.repelY += p.vy;

      const finalX = proj.x + p.repelX;
      const finalY = proj.y + p.repelY;

      // Opacity oscillation (stellar gas shimmer)
      const flicker = 0.75 + Math.sin(p.flickerPhase) * 0.25;
      const finalAlpha = Math.min(1, Math.max(0, p.alpha * flicker * proj.scale));
      const renderSize = Math.max(0.6, p.size * proj.scale);

      // Render Particle
      if (p.isPulsar && renderSize > 1.8) {
        drawPulsarSpike(ctx, finalX, finalY, renderSize, finalAlpha);
      } else {
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${finalAlpha})`;
        ctx.beginPath();
        ctx.arc(finalX, finalY, renderSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. Render Breakaway Zero-G Stray Stars
    const strayLen = strayStars.length;
    for (let i = 0; i < strayLen; i++) {
      const s = strayStars[i];

      if (!prefersReducedMotion) {
        s.x += s.vx;
        s.y += s.vy;
        s.age++;
      }

      const lifeRatio = s.age / s.maxAge;
      const alpha = Math.max(0, s.alpha * (1 - lifeRatio));

      ctx.fillStyle = `rgba(${s.color.r}, ${s.color.g}, ${s.color.b}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y - scrollY * 0.32, s.size, 0, Math.PI * 2);
      ctx.fill();

      // Respawn when life expires
      if (s.age >= s.maxAge || s.y < -50) {
        strayStars[i] = createStrayStar(radiusA, radiusB, radiusC, false);
      }
    }

    animationId = requestAnimationFrame(tick);
  }

  // Pointer & Scroll Event Handlers
  function onPointerMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.targetX = e.clientX - rect.left;
    mouse.targetY = e.clientY - rect.top;
    mouse.isHovering = true;

    // Update real-time HUD coordinates
    if (latElem && lngElem) {
      const normX = mouse.targetX / width;
      const normY = mouse.targetY / height;
      const lat = (51.5074 + (normY - 0.5) * 0.04).toFixed(4);
      const lng = (-0.1278 + (normX - 0.5) * 0.06).toFixed(4);
      latElem.textContent = lat;
      lngElem.textContent = lng;
    }
  }

  function onPointerLeave() {
    mouse.targetX = -9999;
    mouse.targetY = -9999;
    mouse.isHovering = false;
  }

  function onScroll() {
    scrollY = window.scrollY || window.pageYOffset || 0;
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  container.addEventListener('mousemove', onPointerMove, { passive: true });
  container.addEventListener('mouseleave', onPointerLeave, { passive: true });
  container.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches[0]) {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.touches[0].clientX - rect.left;
      mouse.targetY = e.touches[0].clientY - rect.top;
      mouse.isHovering = true;
    }
  }, { passive: true });
  container.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.touches[0].clientX - rect.left;
      mouse.targetY = e.touches[0].clientY - rect.top;
    }
  }, { passive: true });
  container.addEventListener('touchend', onPointerLeave, { passive: true });

  // IntersectionObserver to conserve CPU/GPU when out of viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
    });
  }, { threshold: 0.05 });

  observer.observe(container);

  // Initialize and run
  resize();
  animationId = requestAnimationFrame(tick);

  return {
    destroy() {
      if (animationId) cancelAnimationFrame(animationId);
      observer.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      container.removeEventListener('mousemove', onPointerMove);
      container.removeEventListener('mouseleave', onPointerLeave);
    }
  };
}
