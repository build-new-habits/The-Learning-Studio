/* ==========================================================================
   The Learning Studio — Settings Panel
   21/07/26 v1

   Replaces the Session 2 3-button accessibility row (assets/js/
   accessibility.js — now unreferenced, left in the repo rather than
   deleted). Eight independent preferences, stored in localStorage ONLY:

     tls-scheme          : 'default' | 'warm' | 'dark' | 'high-contrast'
     tls-font             : 'default' | 'dyslexia' | 'serif' | 'mono'
     tls-text-size        : '14'..'24' (px, string)
     tls-line-spacing     : '1.2'..'2.2' (string)
     tls-letter-spacing   : '0'..'0.12' (em, string)
     tls-reduced-motion   : 'on' | 'off'
     tls-enhanced-focus   : 'on' | 'off'
     tls-underline-links  : 'on' | 'off'

   Hard constraint carried over unchanged from Session 2: no personal
   data, no identifiers, no cookies, no network transmission. These
   eight string values are the only thing ever written to storage.

   'dark' and 'high-contrast' scheme values both apply the same
   body.theme-high-contrast class already built in base.css/card.css/
   finder.css — see the tokens.css comment for why.
   ========================================================================== */

(function () {
  'use strict';

  var KEYS = {
    scheme: 'tls-scheme',
    font: 'tls-font',
    textSize: 'tls-text-size',
    lineSpacing: 'tls-line-spacing',
    letterSpacing: 'tls-letter-spacing',
    motion: 'tls-reduced-motion',
    focus: 'tls-enhanced-focus',
    underline: 'tls-underline-links'
  };

  var DEFAULTS = {
    scheme: 'default',
    font: 'default',
    textSize: '17',
    lineSpacing: '1.75',
    letterSpacing: '0',
    motion: 'off',
    focus: 'off',
    underline: 'off'
  };

  var SCHEME_CLASS = {
    default: '',
    warm: 'scheme-warm',
    dark: 'theme-high-contrast',
    'high-contrast': 'theme-high-contrast'
  };

  var FONT_CLASS = {
    default: '',
    dyslexia: 'font-dyslexia',
    serif: 'font-serif',
    mono: 'font-mono'
  };

  function safeGet(key, fallback) {
    try {
      var value = window.localStorage.getItem(key);
      return value === null ? fallback : value;
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

  function safeRemove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      /* no-op */
    }
  }

  function announce(message) {
    var status = document.getElementById('settings-status');
    if (status) {
      status.textContent = message;
    }
  }

  /* ----- Apply functions ----- */

  function applyScheme(value, opts) {
    Object.keys(SCHEME_CLASS).forEach(function (key) {
      if (SCHEME_CLASS[key]) {
        document.body.classList.remove(SCHEME_CLASS[key]);
      }
    });
    if (SCHEME_CLASS[value]) {
      document.body.classList.add(SCHEME_CLASS[value]);
    }
    document.querySelectorAll('[data-setting="scheme"]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-value') === value ? 'true' : 'false');
    });
    if (opts && opts.announce) {
      announce('Colour scheme set to ' + value.replace('-', ' '));
    }
  }

  function applyFont(value, opts) {
    Object.keys(FONT_CLASS).forEach(function (key) {
      if (FONT_CLASS[key]) {
        document.body.classList.remove(FONT_CLASS[key]);
      }
    });
    if (FONT_CLASS[value]) {
      document.body.classList.add(FONT_CLASS[value]);
    }
    document.querySelectorAll('[data-setting="font"]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-value') === value ? 'true' : 'false');
    });
    if (opts && opts.announce) {
      announce('Font set to ' + value);
    }
  }

  function applyTextSize(value, opts) {
    document.body.style.setProperty('--user-text-size', value + 'px');
    var display = document.getElementById('text-size-value');
    if (display) {
      display.textContent = value + 'px';
    }
    var input = document.getElementById('text-size-range');
    if (input && input.value !== value) {
      input.value = value;
    }
    if (opts && opts.announce) {
      announce('Text size set to ' + value + ' pixels');
    }
  }

  function applyLineSpacing(value, opts) {
    document.body.style.setProperty('--user-line-height', value);
    var display = document.getElementById('line-spacing-value');
    if (display) {
      display.textContent = parseFloat(value).toFixed(2);
    }
    var input = document.getElementById('line-spacing-range');
    if (input && input.value !== value) {
      input.value = value;
    }
    if (opts && opts.announce) {
      announce('Line spacing set to ' + parseFloat(value).toFixed(2));
    }
  }

  function applyLetterSpacing(value, opts) {
    document.body.style.setProperty('--user-letter-spacing', value + 'em');
    var display = document.getElementById('letter-spacing-value');
    if (display) {
      display.textContent = parseFloat(value).toFixed(2) + 'em';
    }
    var input = document.getElementById('letter-spacing-range');
    if (input && input.value !== value) {
      input.value = value;
    }
    if (opts && opts.announce) {
      announce('Letter spacing set to ' + parseFloat(value).toFixed(2) + ' em');
    }
  }

  function applyMotion(state, opts) {
    var isReduced = state === 'on';
    document.body.classList.toggle('motion-reduced', isReduced);
    var input = document.getElementById('toggle-motion');
    if (input) {
      input.checked = isReduced;
    }
    if (opts && opts.announce) {
      announce(isReduced ? 'Reduce motion on' : 'Reduce motion off');
    }
  }

  function applyFocus(state, opts) {
    var isEnhanced = state === 'on';
    document.body.classList.toggle('enhanced-focus', isEnhanced);
    var input = document.getElementById('toggle-focus');
    if (input) {
      input.checked = isEnhanced;
    }
    if (opts && opts.announce) {
      announce(isEnhanced ? 'Enhanced focus outlines on' : 'Enhanced focus outlines off');
    }
  }

  function applyUnderline(state, opts) {
    var isUnderlined = state === 'on';
    document.body.classList.toggle('underline-links', isUnderlined);
    var input = document.getElementById('toggle-underline');
    if (input) {
      input.checked = isUnderlined;
    }
    if (opts && opts.announce) {
      announce(isUnderlined ? 'Underline all links on' : 'Underline all links off');
    }
  }

  /* ----- Panel open/close ----- */

  var lastFocusedElement = null;

  function openPanel() {
    var overlay = document.getElementById('settings-overlay');
    var trigger = document.getElementById('settings-trigger');
    if (!overlay) {
      return;
    }
    lastFocusedElement = document.activeElement;
    overlay.classList.add('open');
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'true');
    }
    var closeBtn = document.getElementById('settings-close');
    if (closeBtn) {
      closeBtn.focus();
    }
    document.addEventListener('keydown', handleKeydown);
  }

  function closePanel() {
    var overlay = document.getElementById('settings-overlay');
    var trigger = document.getElementById('settings-trigger');
    if (!overlay) {
      return;
    }
    overlay.classList.remove('open');
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'false');
    }
    document.removeEventListener('keydown', handleKeydown);
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      closePanel();
    }
  }

  /* ----- Reset ----- */

  function resetAll() {
    Object.keys(KEYS).forEach(function (name) {
      safeRemove(KEYS[name]);
    });
    applyScheme(DEFAULTS.scheme, { announce: false });
    applyFont(DEFAULTS.font, { announce: false });
    applyTextSize(DEFAULTS.textSize, { announce: false });
    applyLineSpacing(DEFAULTS.lineSpacing, { announce: false });
    applyLetterSpacing(DEFAULTS.letterSpacing, { announce: false });
    applyMotion(DEFAULTS.motion, { announce: false });
    applyFocus(DEFAULTS.focus, { announce: false });
    applyUnderline(DEFAULTS.underline, { announce: false });
    announce('All settings reset to defaults');
  }

  /* ----- Init ----- */

  function init() {
    var scheme = safeGet(KEYS.scheme, DEFAULTS.scheme);
    var font = safeGet(KEYS.font, DEFAULTS.font);
    var textSize = safeGet(KEYS.textSize, DEFAULTS.textSize);
    var lineSpacing = safeGet(KEYS.lineSpacing, DEFAULTS.lineSpacing);
    var letterSpacing = safeGet(KEYS.letterSpacing, DEFAULTS.letterSpacing);
    var motion = safeGet(KEYS.motion, DEFAULTS.motion);
    var focus = safeGet(KEYS.focus, DEFAULTS.focus);
    var underline = safeGet(KEYS.underline, DEFAULTS.underline);

    applyScheme(scheme);
    applyFont(font);
    applyTextSize(textSize);
    applyLineSpacing(lineSpacing);
    applyLetterSpacing(letterSpacing);
    applyMotion(motion);
    applyFocus(focus);
    applyUnderline(underline);

    var trigger = document.getElementById('settings-trigger');
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'false');
      trigger.addEventListener('click', openPanel);
    }

    var closeBtn = document.getElementById('settings-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', closePanel);
    }

    var overlay = document.getElementById('settings-overlay');
    if (overlay) {
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
          closePanel();
        }
      });
    }

    document.querySelectorAll('[data-setting="scheme"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var value = btn.getAttribute('data-value');
        safeSet(KEYS.scheme, value);
        applyScheme(value, { announce: true });
      });
    });

    document.querySelectorAll('[data-setting="font"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var value = btn.getAttribute('data-value');
        safeSet(KEYS.font, value);
        applyFont(value, { announce: true });
      });
    });

    var textSizeInput = document.getElementById('text-size-range');
    if (textSizeInput) {
      textSizeInput.addEventListener('input', function () {
        safeSet(KEYS.textSize, textSizeInput.value);
        applyTextSize(textSizeInput.value, { announce: false });
      });
      textSizeInput.addEventListener('change', function () {
        announce('Text size set to ' + textSizeInput.value + ' pixels');
      });
    }

    var lineSpacingInput = document.getElementById('line-spacing-range');
    if (lineSpacingInput) {
      lineSpacingInput.addEventListener('input', function () {
        safeSet(KEYS.lineSpacing, lineSpacingInput.value);
        applyLineSpacing(lineSpacingInput.value, { announce: false });
      });
      lineSpacingInput.addEventListener('change', function () {
        announce('Line spacing set to ' + parseFloat(lineSpacingInput.value).toFixed(2));
      });
    }

    var letterSpacingInput = document.getElementById('letter-spacing-range');
    if (letterSpacingInput) {
      letterSpacingInput.addEventListener('input', function () {
        safeSet(KEYS.letterSpacing, letterSpacingInput.value);
        applyLetterSpacing(letterSpacingInput.value, { announce: false });
      });
      letterSpacingInput.addEventListener('change', function () {
        announce('Letter spacing set to ' + parseFloat(letterSpacingInput.value).toFixed(2) + ' em');
      });
    }

    var motionInput = document.getElementById('toggle-motion');
    if (motionInput) {
      motionInput.addEventListener('change', function () {
        var value = motionInput.checked ? 'on' : 'off';
        safeSet(KEYS.motion, value);
        applyMotion(value, { announce: true });
      });
    }

    var focusInput = document.getElementById('toggle-focus');
    if (focusInput) {
      focusInput.addEventListener('change', function () {
        var value = focusInput.checked ? 'on' : 'off';
        safeSet(KEYS.focus, value);
        applyFocus(value, { announce: true });
      });
    }

    var underlineInput = document.getElementById('toggle-underline');
    if (underlineInput) {
      underlineInput.addEventListener('change', function () {
        var value = underlineInput.checked ? 'on' : 'off';
        safeSet(KEYS.underline, value);
        applyUnderline(value, { announce: true });
      });
    }

    var resetBtn = document.getElementById('settings-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', resetAll);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
