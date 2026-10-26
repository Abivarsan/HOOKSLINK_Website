/**
 * HOOKSLINK - Interactive AI Growth ROI Calculator Widget
 */

export function initRoiCalculator(widget) {
  if (!widget) return;

  const slider = widget.querySelector('[data-roi-slider]');
  const budgetDisplay = widget.querySelector('[data-roi-budget]');
  const goalButtons = Array.from(widget.querySelectorAll('[data-roi-goal]'));

  const outTraffic = widget.querySelector('[data-roi-traffic]');
  const outLeads = widget.querySelector('[data-roi-leads]');
  const outMultiple = widget.querySelector('[data-roi-multiple]');
  const outHours = widget.querySelector('[data-roi-hours]');

  if (!slider) return;

  let currentGoal = 'growth'; // 'growth' | 'traffic' | 'leads'

  // Model calculation multipliers
  const models = {
    growth: { trafficMult: 5.8, leadsMult: 0.042, roiMult: 3.8, hoursBase: 45 },
    traffic: { trafficMult: 7.2, leadsMult: 0.031, roiMult: 3.2, hoursBase: 35 },
    leads: { trafficMult: 4.5, leadsMult: 0.055, roiMult: 4.2, hoursBase: 50 }
  };

  function animateNumber(element, targetVal, prefix = '', suffix = '') {
    if (!element) return;
    const currentText = element.textContent.replace(/[^0-9.]/g, '');
    const startVal = parseFloat(currentText) || 0;
    const duration = 280;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuad
      const ease = 1 - (1 - progress) * (1 - progress);
      const val = startVal + (targetVal - startVal) * ease;

      if (Number.isInteger(targetVal)) {
        element.textContent = `${prefix}${Math.round(val).toLocaleString()}${suffix}`;
      } else {
        element.textContent = `${prefix}${val.toFixed(1)}${suffix}`;
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  function calculate() {
    const budget = parseInt(slider.value, 10);
    if (budgetDisplay) {
      budgetDisplay.textContent = `£${budget.toLocaleString()}`;
    }

    const model = models[currentGoal] || models.growth;

    const projectedTraffic = Math.round(budget * model.trafficMult);
    const projectedLeads = Math.round(budget * model.leadsMult);
    const projectedRoi = model.roiMult;
    const hoursSaved = Math.round(model.hoursBase + (budget / 500));

    animateNumber(outTraffic, projectedTraffic, '+');
    animateNumber(outLeads, projectedLeads, '+');
    animateNumber(outMultiple, projectedRoi, '', 'x');
    animateNumber(outHours, hoursSaved, '+', ' hrs');
  }

  slider.addEventListener('input', calculate);

  goalButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      goalButtons.forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
      currentGoal = btn.getAttribute('data-roi-goal') || 'growth';
      calculate();
    });
  });

  // Initial calculation
  calculate();
}
