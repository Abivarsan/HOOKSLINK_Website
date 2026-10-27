/**
 * HOOKSLINK - 3D Cylindrical Ribbon Infinite Ticker
 * Interactive 3D revolving carousel cylinder featuring partner client brand cards,
 * with continuous rotation, drag/touch inertia, and pause-on-hover.
 */

export function initCylinderTicker(container) {
  if (!container) return;

  const ring = container.querySelector('.cylinder-ticker__ring');
  if (!ring) return;

  const cards = Array.from(ring.querySelectorAll('.cylinder-card'));
  const totalCards = cards.length;
  if (!totalCards) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Rotation physics & RPM configuration
  const targetRpm = parseFloat(container.dataset.rpm) || 2.0; // Revolutions Per Minute
  const degPerSecond = targetRpm * (360 / 60); // 2.0 RPM = 12 deg/sec (30s per 360 deg)

  let currentRotation = 0; // degrees
  let isDragging = false;
  let startX = 0;
  let prevX = 0;
  let velocity = 0;
  let animationId = null;
  let lastTime = performance.now();
  let userInteracting = false;
  let resumeTimer = null;

  // Responsive radius adjustment based on viewport
  function updateRadius() {
    const scene = container.querySelector('.cylinder-ticker__scene');
    const sceneWidth = scene ? scene.clientWidth : window.innerWidth;
    
    let radius = 410;
    if (sceneWidth < 480) {
      radius = 225;
    } else if (sceneWidth < 768) {
      radius = 290;
    } else if (sceneWidth < 1024) {
      radius = 350;
    } else {
      radius = 410;
    }

    ring.style.setProperty('--cylinder-radius', `${radius}px`);
  }

  updateRadius();
  window.addEventListener('resize', updateRadius, { passive: true });

  // Apply 3D rotation transform
  function applyTransform() {
    ring.style.transform = `rotateX(-10deg) rotateY(${currentRotation}deg)`;
  }

  // Animation frame loop using delta-time for exact RPM
  function tick(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    if (!prefersReducedMotion) {
      if (!isDragging) {
        if (Math.abs(velocity) > 0.01) {
          // Inertia decay
          currentRotation += velocity;
          velocity *= 0.92;
        } else if (!userInteracting) {
          // Smooth continuous auto-spin synchronized to exact RPM
          const deltaRotation = degPerSecond * dt;
          currentRotation = (currentRotation - deltaRotation) % 360;
        }
        applyTransform();
      }
    }

    animationId = requestAnimationFrame(tick);
  }

  // Pointer drag interactions
  function onPointerDown(e) {
    isDragging = true;
    userInteracting = true;
    clearTimeout(resumeTimer);
    startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    prevX = startX;
    velocity = 0;
    ring.classList.add('is-dragging');
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const dx = clientX - prevX;
    prevX = clientX;

    // Convert pixels to rotation angle
    const deltaDeg = dx * 0.35;
    currentRotation += deltaDeg;
    velocity = deltaDeg; // update velocity for throw inertia
    applyTransform();
  }

  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;
    ring.classList.remove('is-dragging');

    // Resume auto-rotation after short delay
    resumeTimer = setTimeout(() => {
      userInteracting = false;
    }, 1800);
  }

  // Mouse events
  container.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);

  // Touch events (mobile/tablet)
  container.addEventListener('touchstart', onPointerDown, { passive: true });
  window.addEventListener('touchmove', onPointerMove, { passive: true });
  window.addEventListener('touchend', onPointerUp);

  // Hover pause
  container.addEventListener('mouseenter', () => {
    userInteracting = true;
  });
  container.addEventListener('mouseleave', () => {
    if (!isDragging) {
      resumeTimer = setTimeout(() => {
        userInteracting = false;
      }, 1000);
    }
  });

  // Clicking a card brings it to the front
  cards.forEach((card, index) => {
    card.addEventListener('click', (e) => {
      if (Math.abs(velocity) > 0.5) {
        e.preventDefault();
        return;
      }
      // Angle for this card is index * (360 / totalCards)
      const targetAngle = -(index * (360 / totalCards));
      // Normalize rotation
      let diff = (targetAngle - currentRotation) % 360;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      
      currentRotation += diff;
      applyTransform();
    });
  });

  // Start tick loop
  animationId = requestAnimationFrame(tick);

  return {
    destroy() {
      if (animationId) cancelAnimationFrame(animationId);
      window.removeEventListener('resize', updateRadius);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
    }
  };
}
