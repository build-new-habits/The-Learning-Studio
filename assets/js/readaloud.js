/* ==========================================================================
   The Learning Studio — Read Aloud
   21/07/26 v1 — Session 11

   Genuine in-page text-to-speech using the browser's native Web Speech
   API (window.speechSynthesis). No backend, no API key, no external
   service — everything here runs locally in the visitor's browser.

   This replaces the "deferred" placeholder that sat in the Settings
   panel's Read Aloud group since Session 7. It does NOT replace or
   remove the separate "Open in Immersive Reader" link that appears on
   card and resource pages (that link is a plain anchor in the HTML,
   untouched by this file) — it points to Microsoft's own guidance and
   stays useful for M365 documents specifically, which this control
   does not touch.

   Scope of what gets read: the page's Digital Practice Card or
   Resource content where one is present ([data-card-src] /
   [data-resource-src] — the same container render-card.js and
   render-resource.js render into), falling back to #main-content on
   pages with neither (index, finder, library) so the control still
   does something sensible there rather than silently failing.

   Hard constraints:
     - Browser-native only. No API keys, no network request of any
       kind is made by this file.
     - Fully keyboard operable — a native <button> and a native
       <input type="range">, nothing built from non-interactive
       elements.
     - Graceful degradation — the markup for #read-aloud-group ships
       with the `hidden` attribute already set in every page. This
       script only ever *removes* that attribute, and only after
       confirming window.speechSynthesis and SpeechSynthesisUtterance
       both exist. A browser without support, or a page where this
       script fails to load at all, simply never reveals the control —
       no error state is shown, per the brief.

   Preference stored in localStorage (this file's own concern, kept
   separate from settings.js's eight keys):
     tls-read-rate : '0.75'..'1.75' (string) — same convention as the
     other tls- prefixed keys: no personal data, no identifiers.
   ========================================================================== */

(function () {
  'use strict';

  var RATE_KEY = 'tls-read-rate';
  var DEFAULT_RATE = '1';

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

  function announce(message) {
    var status = document.getElementById('settings-status');
    if (status) {
      status.textContent = message;
    }
  }

  /* ----- Reading target ----- */

  function getReadableText() {
    var target = document.querySelector('[data-card-src], [data-resource-src]') ||
      document.getElementById('main-content');
    if (!target) {
      return '';
    }
    var clone = target.cloneNode(true);
    var strip = clone.querySelectorAll('[aria-hidden="true"], script, style, svg');
    for (var i = 0; i < strip.length; i++) {
      if (strip[i].parentNode) {
        strip[i].parentNode.removeChild(strip[i]);
      }
    }
    var raw = clone.textContent || '';
    return raw.replace(/\s+/g, ' ').trim();
  }

  /* ----- Init ----- */

  function init() {
    var group = document.getElementById('read-aloud-group');
    if (!group) {
      return;
    }

    var supported = 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function';
    if (!supported) {
      /* Leave `hidden` in place — no control, no error, per the brief. */
      return;
    }

    var synth = window.speechSynthesis;
    var toggleBtn = document.getElementById('read-aloud-toggle');
    var toggleLabel = document.getElementById('read-aloud-toggle-label');
    var playIcon = group.querySelector('.ra-icon-play');
    var pauseIcon = group.querySelector('.ra-icon-pause');
    var speedInput = document.getElementById('read-aloud-speed-range');
    var speedValue = document.getElementById('read-aloud-speed-value');

    var currentRate = parseFloat(safeGet(RATE_KEY, DEFAULT_RATE));
    if (isNaN(currentRate)) {
      currentRate = parseFloat(DEFAULT_RATE);
    }

    var currentUtterance = null;
    var keepAliveTimer = null;

    /* Chrome has a long-standing bug where speechSynthesis stops an
       utterance after roughly 15 seconds of continuous speaking. The
       standard workaround is a periodic pause/resume "kick" while
       speech is active. Harmless no-op in browsers that don't need it. */
    function startKeepAlive() {
      stopKeepAlive();
      keepAliveTimer = window.setInterval(function () {
        if (synth.speaking && !synth.paused) {
          synth.pause();
          synth.resume();
        }
      }, 10000);
    }

    function stopKeepAlive() {
      if (keepAliveTimer) {
        window.clearInterval(keepAliveTimer);
        keepAliveTimer = null;
      }
    }

    function setState(state) {
      /* state: 'idle' | 'playing' | 'paused' */
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-pressed', state === 'idle' ? 'false' : 'true');
      }
      if (playIcon && pauseIcon) {
        if (state === 'playing') {
          playIcon.setAttribute('hidden', '');
          pauseIcon.removeAttribute('hidden');
        } else {
          pauseIcon.setAttribute('hidden', '');
          playIcon.removeAttribute('hidden');
        }
      }
      if (toggleLabel) {
        if (state === 'playing') {
          toggleLabel.textContent = 'Pause reading';
        } else if (state === 'paused') {
          toggleLabel.textContent = 'Resume reading';
        } else {
          toggleLabel.textContent = 'Read this page aloud';
        }
      }
    }

    function speakFromStart(opts) {
      var text = getReadableText();
      if (!text) {
        announce('There is no readable content on this page yet.');
        setState('idle');
        return;
      }
      synth.cancel();
      var utterance = new window.SpeechSynthesisUtterance(text);
      utterance.rate = currentRate;
      utterance.onend = function () {
        stopKeepAlive();
        setState('idle');
      };
      utterance.onerror = function () {
        stopKeepAlive();
        setState('idle');
      };
      currentUtterance = utterance;
      synth.speak(utterance);
      setState('playing');
      startKeepAlive();
      if (opts && opts.announce) {
        announce('Reading started');
      }
    }

    function handleToggle() {
      if (synth.speaking && !synth.paused) {
        synth.pause();
        setState('paused');
        announce('Reading paused');
      } else if (synth.paused && currentUtterance) {
        synth.resume();
        setState('playing');
        announce('Reading resumed');
      } else {
        speakFromStart({ announce: true });
      }
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', handleToggle);
    }

    if (speedInput) {
      speedInput.value = String(currentRate);
      if (speedValue) {
        speedValue.textContent = currentRate + 'x';
      }
      speedInput.addEventListener('input', function () {
        if (speedValue) {
          speedValue.textContent = speedInput.value + 'x';
        }
      });
      speedInput.addEventListener('change', function () {
        currentRate = parseFloat(speedInput.value);
        safeSet(RATE_KEY, speedInput.value);
        announce('Reading speed set to ' + speedInput.value + ' times');
        /* The Web Speech API applies rate per-utterance — it cannot be
           changed on one already in progress. If something is playing
           or paused, restart it from the beginning at the new speed
           rather than silently ignoring the change. */
        if (synth.speaking || synth.paused) {
          speakFromStart({ announce: false });
        }
      });
    }

    /* Stop cleanly if the browser tab is being left mid-read — most
       browsers do this automatically, but cancel() is cheap and avoids
       an orphaned utterance keeping the keep-alive timer running. */
    window.addEventListener('beforeunload', function () {
      stopKeepAlive();
      synth.cancel();
    });

    group.removeAttribute('hidden');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
