/* ==========================================================================
   The Learning Studio — Accessibility Controls
   20/07/26 v1

   Three independent preferences, stored in localStorage ONLY:
     tls-text-size : 'default' | 'medium' | 'large'
     tls-contrast  : 'default' | 'high-contrast'
     tls-motion    : 'system'  | 'reduced'

   Hard constraint: no personal data, no identifiers, no cookies,
   no network transmission. These three string values are the only
   thing ever written to storage.
   ========================================================================== */

(function () {
  'use strict';

  var KEYS = {
    textSize: 'tls-text-size',
    contrast: 'tls-contrast',
    motion: 'tls-motion'
  };

  var TEXT_SIZE_STEPS = ['default', 'medium', 'large'];

  var TEXT_SIZE_LABELS = {
    default: 'Default',
    medium: 'Medium',
    large: 'Large'
  };

  var TEXT_SIZE_CLASS = {
    default: '',
    medium: 'text-size-medium',
    large: 'text-size-large'
  };

  function safeGet(key, fallback) {
    try {
      return window.localStorage.getItem(key) || fallback;
    } catch (e) {
      return fallback;
    }
  }

  function safeSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      /* localStorage unavailable — preference persists for this page view only */
    }
  }

  function announce(message) {
    var status = document.getElementById('a11y-status');
    if (status) {
      status.textContent = message;
    }
  }

  function applyTextSize(step, opts) {
    Object.keys(TEXT_SIZE_CLASS).forEach(function (key) {
      if (TEXT_SIZE_CLASS[key]) {
        document.body.classList.remove(TEXT_SIZE_CLASS[key]);
      }
    });

    if (TEXT_SIZE_CLASS[step]) {
      document.body.classList.add(TEXT_SIZE_CLASS[step]);
    }

    var button = document.getElementById('a11y-text-size');
    if (button) {
      button.textContent = 'Text size: ' + TEXT_SIZE_LABELS[step];
    }

    if (opts && opts.announce) {
      announce('Text size set to ' + TEXT_SIZE_LABELS[step]);
    }
  }

  function applyContrast(mode, opts) {
    var isHighContrast = mode === 'high-contrast';
    document.body.classList.toggle('theme-high-contrast', isHighContrast);

    var button = document.getElementById('a11y-contrast');
    if (button) {
      button.setAttribute('aria-pressed', isHighContrast ? 'true' : 'false');
    }

    if (opts && opts.announce) {
      announce(isHighContrast ? 'High contrast on' : 'High contrast off');
    }
  }

  function applyMotion(mode, opts) {
    var isReduced = mode === 'reduced';
    document.body.classList.toggle('motion-reduced', isReduced);

    var button = document.getElementById('a11y-motion');
    if (button) {
      button.setAttribute('aria-pressed', isReduced ? 'true' : 'false');
    }

    if (opts && opts.announce) {
      announce(isReduced ? 'Reduced motion on' : 'Reduced motion off');
    }
  }

  function nextTextSize(current) {
    var index = TEXT_SIZE_STEPS.indexOf(current);
    if (index === -1) {
      index = 0;
    }
    return TEXT_SIZE_STEPS[(index + 1) % TEXT_SIZE_STEPS.length];
  }

  function init() {
    var textSize = safeGet(KEYS.textSize, 'default');
    var contrast = safeGet(KEYS.contrast, 'default');
    var motion = safeGet(KEYS.motion, 'system');

    applyTextSize(textSize);
    applyContrast(contrast);
    applyMotion(motion);

    var textSizeButton = document.getElementById('a11y-text-size');
    if (textSizeButton) {
      textSizeButton.addEventListener('click', function () {
        var current = safeGet(KEYS.textSize, 'default');
        var next = nextTextSize(current);
        safeSet(KEYS.textSize, next);
        applyTextSize(next, { announce: true });
      });
    }

    var contrastButton = document.getElementById('a11y-contrast');
    if (contrastButton) {
      contrastButton.addEventListener('click', function () {
        var current = safeGet(KEYS.contrast, 'default');
        var next = current === 'high-contrast' ? 'default' : 'high-contrast';
        safeSet(KEYS.contrast, next);
        applyContrast(next, { announce: true });
      });
    }

    var motionButton = document.getElementById('a11y-motion');
    if (motionButton) {
      motionButton.addEventListener('click', function () {
        var current = safeGet(KEYS.motion, 'system');
        var next = current === 'reduced' ? 'system' : 'reduced';
        safeSet(KEYS.motion, next);
        applyMotion(next, { announce: true });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
