/**
 * HOOKSLINK - Dual-Loop Continuous Water Flow Animation Engine
 * Simulates realistic liquid water flowing smoothly and continuously
 * through a smaller concentric loop nestled inside a larger loop.
 */

export function initFluidLoop(container) {
  if (!container) return;

  const canvas = container.querySelector('#water-loop-canvas') || container;
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Respect reduced motion preferences
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Display scaling for high-DPI displays (Retina)
  let dpr = window.devicePixelRatio || 1;
  let width = 0;
  let height = 0;

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width || 460;
    height = rect.height || 260;
    dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }

  resizeCanvas();

  // Animation state
  let animationFrameId = null;
  let isVisible = true;
  let time = 0;
  let mouse = { x: -1000, y: -1000, active: false };
  let ripples = [];

  // Track geometry parameters
  // Outer Loop: W1, H1, R1
  // Inner Loop: W2, H2, R2
  function getGeometry() {
    const cx = width / 2;
    const cy = height / 2;

    const outerW = Math.min(width * 0.78, 360);
    const outerH = Math.min(height * 0.72, 175);
    const outerRadius = outerH * 0.44;

    const innerW = outerW * 0.52;
    const innerH = outerH * 0.48;
    const innerRadius = innerH * 0.46;

    return {
      cx, cy,
      outer: { w: outerW, h: outerH, r: outerRadius, tubeWidth: 20 },
      inner: { w: innerW, h: innerH, r: innerRadius, tubeWidth: 14 }
    };
  }

  /**
   * Evaluates a point along a stadium/rounded racetrack curve
   * t in [0, 1) normalized loop coordinate
   */
  function getLoopPoint(t, cx, cy, w, h, r) {
    // A racetrack has 4 segments:
    // 1. Top straight: from (-w/2 + r, -h/2) to (w/2 - r, -h/2)
    // 2. Right arc: center (w/2 - r, 0), radius r, from -PI/2 to PI/2
    // 3. Bottom straight: from (w/2 - r, h/2) to (-w/2 + r, h/2)
    // 4. Left arc: center (-w/2 + r, 0), radius r, from PI/2 to 3*PI/2
    const straightL = Math.max(10, w - 2 * r);
    const arcL = Math.PI * r;
    const totalL = 2 * straightL + 2 * arcL;

    let dist = (t % 1) * totalL;
    if (dist < 0) dist += totalL;

    let x, y, nx, ny; // position and normal vector

    if (dist <= straightL) {
      // Top straight (moving right)
      const u = dist / straightL;
      x = cx - straightL / 2 + u * straightL;
      y = cy - h / 2;
      nx = 0;
      ny = -1;
    } else if (dist <= straightL + arcL) {
      // Right arc (moving down)
      const arcDist = dist - straightL;
      const angle = -Math.PI / 2 + (arcDist / arcL) * Math.PI;
      const arcCx = cx + straightL / 2;
      const arcCy = cy;
      x = arcCx + Math.cos(angle) * r;
      y = arcCy + Math.sin(angle) * r;
      nx = Math.cos(angle);
      ny = Math.sin(angle);
    } else if (dist <= 2 * straightL + arcL) {
      // Bottom straight (moving left)
      const u = (dist - straightL - arcL) / straightL;
      x = cx + straightL / 2 - u * straightL;
      y = cy + h / 2;
      nx = 0;
      ny = 1;
    } else {
      // Left arc (moving up)
      const arcDist = dist - (2 * straightL + arcL);
      const angle = Math.PI / 2 + (arcDist / arcL) * Math.PI;
      const arcCx = cx - straightL / 2;
      const arcCy = cy;
      x = arcCx + Math.cos(angle) * r;
      y = arcCy + Math.sin(angle) * r;
      nx = Math.cos(angle);
      ny = Math.sin(angle);
    }

    return { x, y, nx, ny };
  }

  // Generate continuous fluid bubbles/particles
  const OUTER_PARTICLE_COUNT = 45;
  const INNER_PARTICLE_COUNT = 32;

  const outerParticles = Array.from({ length: OUTER_PARTICLE_COUNT }, (_, i) => ({
    t: (i / OUTER_PARTICLE_COUNT) + (Math.random() * 0.05),
    speed: 0.0016 + Math.random() * 0.0008,
    radius: 1.4 + Math.random() * 2.2,
    lateralOffset: (Math.random() - 0.5) * 10,
    wobbleSpeed: 2 + Math.random() * 3,
    alpha: 0.4 + Math.random() * 0.5,
    streak: 2 + Math.random() * 4
  }));

  const innerParticles = Array.from({ length: INNER_PARTICLE_COUNT }, (_, i) => ({
    t: (i / INNER_PARTICLE_COUNT) + (Math.random() * 0.05),
    // Inner loop flows slightly faster per fluid vortex dynamics
    speed: 0.0024 + Math.random() * 0.0010,
    radius: 1.2 + Math.random() * 1.8,
    lateralOffset: (Math.random() - 0.5) * 6,
    wobbleSpeed: 2.5 + Math.random() * 3,
    alpha: 0.45 + Math.random() * 0.5,
    streak: 1.5 + Math.random() * 3
  }));

  // Inter-loop cross-flow particles that cycle between outer and inner loops
  const CROSS_PARTICLE_COUNT = 10;
  const crossParticles = Array.from({ length: CROSS_PARTICLE_COUNT }, (_, i) => ({
    progress: i / CROSS_PARTICLE_COUNT,
    fromOuter: i % 2 === 0,
    speed: 0.003 + Math.random() * 0.002,
    radius: 1.6 + Math.random() * 1.6,
    alpha: 0.6
  }));

  /**
   * Trace the racetrack path on a 2D context
   */
  function traceLoopPath(cx, cy, w, h, r) {
    const straightL = Math.max(10, w - 2 * r);
    ctx.beginPath();
    // Start at top straight left
    ctx.moveTo(cx - straightL / 2, cy - h / 2);
    ctx.lineTo(cx + straightL / 2, cy - h / 2);
    ctx.arc(cx + straightL / 2, cy, r, -Math.PI / 2, Math.PI / 2, false);
    ctx.lineTo(cx - straightL / 2, cy + h / 2);
    ctx.arc(cx - straightL / 2, cy, r, Math.PI / 2, (3 * Math.PI) / 2, false);
    ctx.closePath();
  }

  // Pointer interactions
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;

    // Trigger ripple on mouse movement
    if (Math.random() < 0.2) {
      ripples.push({
        x: mouse.x,
        y: mouse.y,
        radius: 2,
        maxRadius: 36,
        alpha: 0.7
      });
    }
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    ripples.push({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      radius: 4,
      maxRadius: 55,
      alpha: 1.0
    });
  });

  // Render loop
  function render() {
    if (!isVisible) {
      animationFrameId = requestAnimationFrame(render);
      return;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const geo = getGeometry();
    time += prefersReducedMotion ? 0 : 0.016;

    // 1. Draw subtle ambient fluid back-glow
    const ambientGlow = ctx.createRadialGradient(geo.cx, geo.cy, 20, geo.cx, geo.cy, geo.outer.w * 0.65);
    ambientGlow.addColorStop(0, 'rgba(6, 182, 212, 0.16)');
    ambientGlow.addColorStop(0.4, 'rgba(56, 189, 248, 0.08)');
    ambientGlow.addColorStop(0.8, 'rgba(99, 102, 241, 0.03)');
    ambientGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = ambientGlow;
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Glass Conduit Channels (Background Dark Glass Tubes)
    [geo.outer, geo.inner].forEach((loop, idx) => {
      // Tube trench shadow / dark base
      traceLoopPath(geo.cx, geo.cy, loop.w, loop.h, loop.r);
      ctx.lineWidth = loop.tubeWidth;
      ctx.strokeStyle = 'rgba(10, 18, 34, 0.85)';
      ctx.stroke();

      // Soft water stream foundation
      traceLoopPath(geo.cx, geo.cy, loop.w, loop.h, loop.r);
      ctx.lineWidth = loop.tubeWidth - 4;
      const baseGrad = ctx.createLinearGradient(0, geo.cy - loop.h, width, geo.cy + loop.h);
      baseGrad.addColorStop(0, 'rgba(2, 132, 199, 0.35)');
      baseGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.45)');
      baseGrad.addColorStop(1, 'rgba(56, 189, 248, 0.38)');
      ctx.strokeStyle = baseGrad;
      ctx.stroke();

      // Outer glass walls with specular reflections
      traceLoopPath(geo.cx, geo.cy, loop.w, loop.h, loop.r);
      ctx.lineWidth = loop.tubeWidth;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
      ctx.stroke();

      traceLoopPath(geo.cx, geo.cy, loop.w, loop.h, loop.r);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.stroke();
    });

    // 3. Draw Continuous Water Wave Pulses (Sinusoidal Moving Streams)
    if (!prefersReducedMotion) {
      // Outer Loop Fluid Stream
      ctx.save();
      traceLoopPath(geo.cx, geo.cy, geo.outer.w, geo.outer.h, geo.outer.r);
      ctx.lineWidth = geo.outer.tubeWidth - 6;
      ctx.setLineDash([40, 20, 60, 25, 80, 30]);
      ctx.lineDashOffset = -time * 85;
      const outerFlowGrad = ctx.createLinearGradient(0, 0, width, height);
      outerFlowGrad.addColorStop(0, 'rgba(56, 189, 248, 0.7)');
      outerFlowGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.85)');
      outerFlowGrad.addColorStop(1, 'rgba(125, 211, 252, 0.7)');
      ctx.strokeStyle = outerFlowGrad;
      ctx.stroke();
      ctx.restore();

      // Inner Loop Fluid Stream (Counter or synchronized high-speed circulation)
      ctx.save();
      traceLoopPath(geo.cx, geo.cy, geo.inner.w, geo.inner.h, geo.inner.r);
      ctx.lineWidth = geo.inner.tubeWidth - 4;
      ctx.setLineDash([30, 15, 50, 20, 70, 25]);
      ctx.lineDashOffset = -time * 110;
      const innerFlowGrad = ctx.createLinearGradient(0, height, width, 0);
      innerFlowGrad.addColorStop(0, 'rgba(6, 182, 212, 0.85)');
      innerFlowGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.95)');
      innerFlowGrad.addColorStop(1, 'rgba(99, 102, 241, 0.75)');
      ctx.strokeStyle = innerFlowGrad;
      ctx.stroke();
      ctx.restore();
    }

    // 4. Inter-Loop Circulating Fluid Connectors (Vertical transfer channels)
    const connectX1 = geo.cx - geo.inner.w * 0.38;
    const connectX2 = geo.cx + geo.inner.w * 0.38;
    const connectYTop1 = geo.cy - geo.outer.h / 2;
    const connectYTop2 = geo.cy - geo.inner.h / 2;
    const connectYBot1 = geo.cy + geo.inner.h / 2;
    const connectYBot2 = geo.cy + geo.outer.h / 2;

    // Cross stream vertical guides
    ctx.save();
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
    ctx.beginPath();
    ctx.moveTo(connectX1, connectYTop1);
    ctx.lineTo(connectX1, connectYTop2);
    ctx.moveTo(connectX2, connectYBot1);
    ctx.lineTo(connectX2, connectYBot2);
    ctx.stroke();
    ctx.restore();

    // 5. Render Moving Micro-Bubbles & Liquid Droplets
    // Outer loop particles
    outerParticles.forEach(p => {
      if (!prefersReducedMotion) {
        p.t += p.speed;
        if (p.t >= 1) p.t -= 1;
      }

      const pt = getLoopPoint(p.t, geo.cx, geo.cy, geo.outer.w, geo.outer.h, geo.outer.r);
      const wobble = Math.sin(time * p.wobbleSpeed + p.t * 20) * 2;
      const px = pt.x + pt.nx * (p.lateralOffset + wobble);
      const py = pt.y + pt.ny * (p.lateralOffset + wobble);

      // Mouse distance influence
      let scale = 1;
      if (mouse.active) {
        const dx = px - mouse.x;
        const dy = py - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 70) {
          scale = 1 + (1 - dist / 70) * 0.8;
          p.t += 0.001; // local acceleration
        }
      }

      // Draw bubble body
      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, p.radius * scale, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(224, 242, 254, ${p.alpha})`;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.fill();

      // Specular glint on bubble
      ctx.beginPath();
      ctx.arc(px - p.radius * 0.3, py - p.radius * 0.3, p.radius * 0.35 * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();
    });

    // Inner loop particles
    innerParticles.forEach(p => {
      if (!prefersReducedMotion) {
        p.t += p.speed;
        if (p.t >= 1) p.t -= 1;
      }

      const pt = getLoopPoint(p.t, geo.cx, geo.cy, geo.inner.w, geo.inner.h, geo.inner.r);
      const wobble = Math.sin(time * p.wobbleSpeed + p.t * 24) * 1.5;
      const px = pt.x + pt.nx * (p.lateralOffset + wobble);
      const py = pt.y + pt.ny * (p.lateralOffset + wobble);

      let scale = 1;
      if (mouse.active) {
        const dx = px - mouse.x;
        const dy = py - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 60) {
          scale = 1 + (1 - dist / 60) * 0.7;
          p.t += 0.0012;
        }
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, p.radius * scale, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(186, 230, 253, ${p.alpha})`;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 6;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px - p.radius * 0.3, py - p.radius * 0.3, p.radius * 0.3 * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();
    });

    // 6. Cross-loop circulating droplets
    if (!prefersReducedMotion) {
      crossParticles.forEach(p => {
        p.progress += p.speed;
        if (p.progress >= 1) p.progress -= 1;

        let px, py;
        if (p.fromOuter) {
          // Drops down from top outer to top inner
          px = connectX1 + Math.sin(time * 3 + p.progress * 6) * 1.5;
          py = connectYTop1 + p.progress * (connectYTop2 - connectYTop1);
        } else {
          // Drops down from bottom inner to bottom outer
          px = connectX2 + Math.cos(time * 3 + p.progress * 6) * 1.5;
          py = connectYBot1 + p.progress * (connectYBot2 - connectYBot1);
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(125, 211, 252, ${p.alpha})`;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      });
    }

    // 7. Interactive Ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.radius += 1.4;
      r.alpha -= 0.022;

      if (r.alpha <= 0 || r.radius >= r.maxRadius) {
        ripples.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(56, 189, 248, ${r.alpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    // 8. Surface Specular Highlights (Glass tube top reflections)
    [geo.outer, geo.inner].forEach(loop => {
      ctx.save();
      traceLoopPath(geo.cx, geo.cy, loop.w, loop.h, loop.r);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.setLineDash([loop.w * 0.35, loop.w * 0.65]);
      ctx.lineDashOffset = -loop.w * 0.1;
      ctx.stroke();
      ctx.restore();
    });

    ctx.restore();

    animationFrameId = requestAnimationFrame(render);
  }

  // Viewport visibility optimization via IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
    });
  }, { threshold: 0.05 });

  observer.observe(canvas);

  // Resize handling
  window.addEventListener('resize', () => {
    resizeCanvas();
  }, { passive: true });

  // Start animation
  render();

  return {
    destroy() {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    }
  };
}
