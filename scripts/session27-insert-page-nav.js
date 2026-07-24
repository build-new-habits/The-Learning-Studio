// Session 27 — inserts a .page-nav row immediately after the skip-link
// and before <header class="site-header"> on every targeted page.
// Idempotent: skips any file that already has a .page-nav.
const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..");

function insertNav(filePath, navHtml) {
  const full = path.join(repoRoot, filePath);
  let html = fs.readFileSync(full, "utf8");

  if (html.includes('class="page-nav"')) {
    console.log(`  SKIP (already has page-nav): ${filePath}`);
    return;
  }

  const marker = '<a class="skip-link" href="#main-content">Skip to main content</a>\n\n';
  if (!html.includes(marker)) {
    console.error(`  [FAIL] Skip-link marker not found in expected form: ${filePath}`);
    process.exitCode = 1;
    return;
  }

  html = html.replace(marker, marker + navHtml + "\n\n");
  fs.writeFileSync(full, html, "utf8");
  console.log(`  OK: ${filePath}`);
}

function backHomeNav(backLabel, backHref, homeHref) {
  return `<nav class="page-nav" aria-label="Page navigation">\n  <a href="${backHref}">← Back to ${backLabel}</a>\n  <a href="${homeHref}">🏠 Home</a>\n</nav>`;
}

function homeOnlyNav(homeHref) {
  return `<nav class="page-nav" aria-label="Page navigation">\n  <a href="${homeHref}">🏠 Home</a>\n</nav>`;
}

// ----- 10 card pages: Back to Finder + Home -----
console.log("Card pages (Back to Finder + Home):");
const cardDirs = ["content/digital-foundations", "content/digital-inclusion"];
cardDirs.forEach(dir => {
  fs.readdirSync(path.join(repoRoot, dir))
    .filter(f => f.endsWith(".html"))
    .forEach(f => {
      insertNav(`${dir}/${f}`, backHomeNav("Finder", "../../finder.html", "../../index.html"));
    });
});

// ----- 30 resource pages: Back to Library + Home -----
console.log("\nResource pages (Back to Library + Home):");
fs.readdirSync(path.join(repoRoot, "content/resources"))
  .filter(f => f.endsWith(".html"))
  .forEach(f => {
    insertNav(`content/resources/${f}`, backHomeNav("Library", "../../library.html", "../../index.html"));
  });

// ----- finder.html / library.html: Home only -----
console.log("\nfinder.html / library.html (Home only):");
insertNav("finder.html", homeOnlyNav("index.html"));
insertNav("library.html", homeOnlyNav("index.html"));

// ----- digital-foundations.html / digital-inclusion.html: Home only -----
// Not in the original Session 27 brief (they didn't exist yet when it was
// written) — added for consistency with finder.html/library.html, since
// they're the same kind of top-level browse page. Flagged in the summary.
console.log("\ndigital-foundations.html / digital-inclusion.html (Home only, added for consistency):");
insertNav("digital-foundations.html", homeOnlyNav("index.html"));
insertNav("digital-inclusion.html", homeOnlyNav("index.html"));

console.log("\nDone.");
