/**
 * HOOKSLINK - Contact Form Validation & Handler
 */

export function initContactForm(formEl) {
  if (!formEl) return;

  const successAlert = formEl.querySelector('[data-form-success]');
  const errorAlert = formEl.querySelector('[data-form-error]');
  const submitBtn = formEl.querySelector('button[type="submit"]');

  function validateField(input) {
    const group = input.closest('.form-group');
    if (!group) return true;

    const errorMsg = group.querySelector('.form-error-msg');
    let isValid = true;
    let message = '';

    if (input.required && !input.value.trim()) {
      isValid = false;
      message = `${input.getAttribute('data-field-name') || 'This field'} is required.`;
    } else if (input.type === 'email' && input.value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.value.trim())) {
        isValid = false;
        message = 'Please enter a valid email address.';
      }
    }

    if (!isValid) {
      group.classList.add('has-error');
      if (errorMsg) errorMsg.textContent = message;
    } else {
      group.classList.remove('has-error');
    }

    return isValid;
  }

  // Real-time validation on blur and input
  const inputs = formEl.querySelectorAll('input:not([type="hidden"]), select, textarea');
  inputs.forEach((input) => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.closest('.form-group')?.classList.contains('has-error')) {
        validateField(input);
      }
    });
  });

  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Check Honeypot field (anti-spam)
    const honeypot = formEl.querySelector('input[name="_honey"]');
    if (honeypot && honeypot.value) {
      console.warn('Bot detected');
      return;
    }

    // Validate all fields
    let formIsValid = true;
    inputs.forEach((input) => {
      if (!validateField(input)) {
        formIsValid = false;
      }
    });

    if (!formIsValid) {
      const firstInvalid = formEl.querySelector('.form-group.has-error input, .form-group.has-error select, .form-group.has-error textarea');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Submit state
    const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Send Message';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending Enquiry...';
    }

    if (successAlert) successAlert.style.display = 'none';
    if (errorAlert) errorAlert.style.display = 'none';

    try {
      const formData = new FormData(formEl);
      const action = formEl.getAttribute('action');

      if (action && action.startsWith('http')) {
        const response = await fetch(action, {
          method: 'POST',
          body: formData,
          headers: { Accept: 'application/json' }
        });

        if (response.ok) {
          showSuccess();
        } else {
          showError();
        }
      } else {
        // Fallback simulation / demonstration for static hosting
        await new Promise((resolve) => setTimeout(resolve, 800));
        showSuccess();
      }
    } catch (err) {
      console.error('Submission error:', err);
      showError();
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    }
  });

  function showSuccess() {
    formEl.reset();
    if (successAlert) {
      successAlert.style.display = 'block';
      successAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function showError() {
    if (errorAlert) {
      errorAlert.style.display = 'block';
      errorAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
}
