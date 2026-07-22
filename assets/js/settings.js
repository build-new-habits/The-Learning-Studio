/* ==========================================================================
   The Learning Studio — Settings Panel
   21/07/26 v1

   Depends on assets/css/tokens.css and assets/css/base.css being loaded
   first. Structure follows the reference pattern supplied for this
   session; every colour below is one of the four core tokens, an
   alpha-derived value of one of them (see tokens.css for the contrast
   maths behind each), or the one named/justified exception
   (--color-warm-surface). No other new colours are introduced.

   Touch targets: several controls in the original reference pattern
   (pill buttons, close button) were sized smaller than 44x44px. They
   are deliberately enlarged here to meet --touch-target-min — a
   departure from the reference's visual density, made for WCAG 2.2 AA
   compliance (Blueprint Section 9: "Accessibility ... non-negotiable").
   Native range slider thumbs are left at browser-default size; only
   accent-color is set. Per WCAG 2.5.8, control size set by the user
   agent and unmodified by the author is exempt from the 44px minimum.
   ========================================================================== */

/* ----- Overlay + panel ----- */

.sett-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: var(--panel-overlay);
  z-index: 200;
  align-items: flex-start;
  justify-content: flex-end;
}

.sett-overlay.open {
  display: flex;
}

.sett-panel {
  background: var(--color-white);
  width: min(400px, 100vw);
  height: 100vh;
  overflow-y: auto;
  padding: 1.5rem;
  border-left: 2px solid var(--color-surface);
  position: relative;
}

.sett-title {
  font-family: var(--font-body);
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-ink);
  margin: 0 0 0.25rem;
}

.sett-close {
  position: absolute;
  top: 0.9rem;
  right: 1rem;
  min-height: var(--touch-target-min);
  min-width: var(--touch-target-min);
  background: none;
  border: 2px solid var(--panel-border-strong);
  border-radius: 0.5rem;
  padding: 0.25rem 0.75rem;
  cursor: pointer;
  color: var(--color-ink);
  font-family: var(--font-body);
  font-size: 0.875rem;
}

.sett-close:hover {
  background: var(--color-surface);
}

/* ----- Section groups ----- */

.sg {
  margin-bottom: 1.25rem;
  border-top: 1px solid var(--panel-border);
  padding-top: 0.9rem;
}

.sg-label {
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-ink);
  display: block;
  margin-bottom: 0.5rem;
}

.sdesc {
  font-size: 0.8125rem;
  color: var(--color-ink-muted);
  margin: 0.3rem 0 0;
  line-height: 1.5;
}

/* ----- Pill button group (colour scheme / font) ----- */

.btn-grp {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.bchoice {
  min-height: var(--touch-target-min);
  background: var(--color-white);
  border: 2px solid var(--panel-border-strong);
  border-radius: 100px;
  padding: 0.5rem 1rem;
  font-family: var(--font-body);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-ink);
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.bchoice:hover {
  border-color: var(--color-action);
}

.bchoice[aria-pressed="true"] {
  background: var(--panel-active-tint);
  border-color: var(--color-action);
  color: var(--color-ink);
  font-weight: 700;
}

/* ----- Sliders (text size / line spacing / letter spacing) ----- */

.range-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.range-row input[type="range"] {
  flex: 1;
  accent-color: var(--color-action);
  min-height: var(--touch-target-min); /* generous hit area around the native thumb */
}

.rval {
  font-family: var(--font-body);
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--color-ink);
  min-width: 3.2rem;
  text-align: right;
}

/* ----- Toggle rows (motion / focus / underline) ----- */

.srow {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-height: var(--touch-target-min);
  margin-bottom: 0.35rem;
}

.srow label {
  font-size: 0.9375rem;
  color: var(--color-ink);
  flex: 1;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.tslider {
  position: absolute;
  inset: 0;
  background: var(--panel-border-strong);
  border-radius: 100px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.tslider::before {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  left: 3px;
  top: 3px;
  background: var(--color-white);
  border-radius: 50%;
  transition: transform 0.2s ease;
}

.toggle input:checked + .tslider {
  background: var(--color-action);
}

.toggle input:checked + .tslider::before {
  transform: translateX(20px);
}

.toggle input:focus-visible + .tslider {
  outline: 3px solid var(--color-ink);
  outline-offset: 2px;
  border-radius: 100px;
}

/* ----- Read aloud (Session 11) — real browser-native text-to-speech.
   #read-aloud-group ships with the `hidden` attribute in every page's
   HTML by default; assets/js/readaloud.js only ever removes it, and
   only once it has confirmed window.speechSynthesis support. If that
   script fails to load, or the browser has no speech support, the
   group simply never appears — see readaloud.js for the full note. ----- */

.ra-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  min-height: var(--touch-target-min);
  margin: 0.6rem 0 0.9rem;
  padding: 0.6rem 1rem;
  background: var(--color-white);
  color: var(--color-ink);
  border: 2px solid var(--color-ink);
  border-radius: 0.25rem;
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
}

.ra-toggle:hover {
  background: var(--color-surface);
}

.ra-toggle[aria-pressed="true"] {
  background: var(--panel-active-tint);
  border-color: var(--color-action);
}

.ra-icon {
  flex-shrink: 0;
}

.ra-speed-row {
  margin-top: 0.25rem;
}

.ra-speed-row .sg-label {
  margin-bottom: 0.5rem;
}

/* ----- Reset button ----- */

.sett-reset {
  width: 100%;
  min-height: var(--touch-target-min);
  margin-top: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--color-white);
  color: var(--color-ink);
  border: 2px solid var(--color-ink);
  border-radius: 0.25rem;
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
}

.sett-reset:hover {
  background: var(--color-surface);
}

/* ----- Immersive Reader link (card pages only) ----- */

.immersive-reader-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: var(--touch-target-min);
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
  background-color: var(--color-white);
  color: var(--color-ink);
  border: 2px solid var(--color-ink);
  border-radius: 0.25rem;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.875rem;
}

.immersive-reader-link:hover {
  border-color: var(--color-action);
  color: var(--color-action);
}

.ir-icon {
  flex-shrink: 0;
}

/* ----- Dark scheme — Session 9: unchanged ink/white pairing, moved
   to its own body.theme-dark class (previously shared with High
   contrast under body.theme-high-contrast) ----- */

body.theme-dark .sett-panel {
  background: var(--color-ink);
  border-left-color: var(--color-white);
}

body.theme-dark .sett-title,
body.theme-dark .sg-label,
body.theme-dark .rval,
body.theme-dark .srow label {
  color: var(--color-white);
}

body.theme-dark .sdesc {
  color: var(--color-white);
}

body.theme-dark .sett-close,
body.theme-dark .bchoice,
body.theme-dark .sett-reset {
  background: var(--color-ink);
  color: var(--color-white);
  border-color: var(--color-white);
}

body.theme-dark .bchoice[aria-pressed="true"] {
  background: var(--color-action);
  border-color: var(--color-white);
  color: var(--color-white);
}

body.theme-dark .immersive-reader-link {
  background: var(--color-ink);
  color: var(--color-white);
  border-color: var(--color-white);
}

body.theme-dark .ra-toggle {
  background: var(--color-ink);
  color: var(--color-white);
  border-color: var(--color-white);
}

body.theme-dark .ra-toggle[aria-pressed="true"] {
  background: var(--color-action);
  border-color: var(--color-white);
  color: var(--color-white);
}

/* ----- High contrast scheme — Session 9: true black/yellow ----- */

body.theme-high-contrast .sett-panel {
  background: var(--color-hc-background);
  border-left-color: var(--color-hc-text);
}

body.theme-high-contrast .sett-title,
body.theme-high-contrast .sg-label,
body.theme-high-contrast .rval,
body.theme-high-contrast .srow label {
  color: var(--color-hc-text);
}

body.theme-high-contrast .sdesc {
  color: var(--color-hc-text);
}

body.theme-high-contrast .sett-close,
body.theme-high-contrast .bchoice,
body.theme-high-contrast .sett-reset {
  background: var(--color-hc-background);
  color: var(--color-hc-text);
  border-color: var(--color-hc-text);
}

body.theme-high-contrast .bchoice[aria-pressed="true"] {
  background: var(--color-hc-text);
  border-color: var(--color-hc-text);
  color: var(--color-hc-background);
}

body.theme-high-contrast .immersive-reader-link {
  background: var(--color-hc-background);
  color: var(--color-hc-text);
  border-color: var(--color-hc-text);
}

body.theme-high-contrast .ra-toggle {
  background: var(--color-hc-background);
  color: var(--color-hc-text);
  border-color: var(--color-hc-text);
}

body.theme-high-contrast .ra-toggle[aria-pressed="true"] {
  background: var(--color-hc-text);
  border-color: var(--color-hc-text);
  color: var(--color-hc-background);
}

/* ----- Warm scheme — panel and Immersive Reader link pick up the
   cream background; body-level rules for the rest live in base.css ----- */

body.scheme-warm .sett-panel {
  background: var(--color-warm-surface);
}

body.scheme-warm .immersive-reader-link {
  background: var(--color-warm-surface);
}
