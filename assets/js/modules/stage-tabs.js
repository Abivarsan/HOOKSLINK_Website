/**
 * HOOKSLINK - Interactive Service Stage Switcher with Sliding Pill Indicator
 */

export function initStageTabs(container) {
  if (!container) return;

  const tablist = container.querySelector('[role="tablist"]');
  const tabs = Array.from(container.querySelectorAll('[role="tab"]'));
  const pillIndicator = container.querySelector('.stage-tabs__pill');
  const targets = Array.from(document.querySelectorAll('[data-stage-target]'));

  if (!tabs.length) return;

  function updatePill(activeTab) {
    if (!pillIndicator || !tablist) return;
    const tabRect = activeTab.getBoundingClientRect();
    const listRect = tablist.getBoundingClientRect();
    const left = tabRect.left - listRect.left;
    pillIndicator.style.transform = `translateX(${left}px)`;
    pillIndicator.style.width = `${tabRect.width}px`;
  }

  function activateTab(tab) {
    tabs.forEach(t => {
      t.setAttribute('aria-selected', 'false');
      t.classList.remove('is-active');
    });

    tab.setAttribute('aria-selected', 'true');
    tab.classList.add('is-active');
    updatePill(tab);

    const stageValue = tab.getAttribute('data-stage');
    targets.forEach(el => {
      const elStage = el.getAttribute('data-stage-target');
      if (stageValue === 'all' || elStage === stageValue) {
        el.style.display = '';
        requestAnimationFrame(() => {
          el.classList.remove('is-hidden');
          el.classList.add('is-active-stage');
        });
      } else {
        el.classList.add('is-hidden');
        el.classList.remove('is-active-stage');
        setTimeout(() => {
          if (el.classList.contains('is-hidden')) {
            el.style.display = 'none';
          }
        }, 200);
      }
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab));

    tab.addEventListener('keydown', (e) => {
      let targetIndex = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        targetIndex = (index + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        targetIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (e.key === 'Home') {
        targetIndex = 0;
      } else if (e.key === 'End') {
        targetIndex = tabs.length - 1;
      }

      if (targetIndex !== null) {
        e.preventDefault();
        tabs[targetIndex].focus();
        activateTab(tabs[targetIndex]);
      }
    });
  });

  // Initial pill positioning
  const initialTab = tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0];
  if (initialTab) {
    activateTab(initialTab);
    window.addEventListener('resize', () => updatePill(initialTab), { passive: true });
  }
}
