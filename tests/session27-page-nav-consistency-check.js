// Session 27 — MANDATORY consistency check across every targeted file.
// For each file, parses the .page-nav block and verifies:
//   1. The nav exists, in the right place (right after skip-link, before
//      <header class="site-header">).
//   2. It has the correct link(s) for its category (Back+Home, or
//      Home-only for finder/library/area-index pages).
//   3. Every href actually resolves to a real file on disk (not just a
//      plausible-looking relative path).
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const repoRoot = path.join(__dirname, "..");
let failures = 0;
let checked = 0;

function resolveHref(fileDir, href) {
  return path.normalize(path.join(fileDir, href));
}

function checkFile(filePath, expectedLinks) {
  checked++;
  const full = path.join(repoRoot, filePath);
  const fileDir = path.dirname(full);
  const html = fs.readFileSync(full, "utf8");
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const nav = document.querySelector("nav.page-nav");
  if (!nav) {
    console.error(`  [FAIL] ${filePath}: no nav.page-nav found`);
    failures++;
    return;
  }

  // Placement: immediately after skip-link, before header.site-header
  const skipLink = document.querySelector("a.skip-link");
  const header = document.querySelector("header.site-header");
  const placementOk = skipLink && header &&
    skipLink.nextElementSibling === nav &&
    nav.nextElementSibling === header;
  if (!placementOk) {
    console.error(`  [FAIL] ${filePath}: page-nav is not placed directly between skip-link and header.site-header`);
    failures++;
  }

  const links = [...nav.querySelectorAll("a")];
  if (links.length !== expectedLinks.length) {
    console.error(`  [FAIL] ${filePath}: expected ${expectedLinks.length} link(s), found ${links.length}`);
    failures++;
    return;
  }

  let ok = true;
  expectedLinks.forEach((exp, i) => {
    const a = links[i];
    const text = a.textContent.trim();
    const href = a.getAttribute("href");
    if (text !== exp.text) {
      console.error(`  [FAIL] ${filePath}: link ${i + 1} text "${text}" !== expected "${exp.text}"`);
      failures++;
      ok = false;
    }
    if (href !== exp.href) {
      console.error(`  [FAIL] ${filePath}: link ${i + 1} href "${href}" !== expected "${exp.href}"`);
      failures++;
      ok = false;
    }
    const resolved = resolveHref(fileDir, href);
    if (!fs.existsSync(resolved)) {
      console.error(`  [FAIL] ${filePath}: link ${i + 1} href "${href}" does not resolve to a real file (resolved: ${path.relative(repoRoot, resolved)})`);
      failures++;
      ok = false;
    }
  });

  if (ok && placementOk) {
    console.log(`  OK: ${filePath}`);
  }
}

console.log("=== Card pages (expect: Back to Finder + Home) ===");
["content/digital-foundations", "content/digital-inclusion"].forEach(dir => {
  fs.readdirSync(path.join(repoRoot, dir))
    .filter(f => f.endsWith(".html"))
    .forEach(f => {
      checkFile(`${dir}/${f}`, [
        { text: "← Back to Finder", href: "../../finder.html" },
        { text: "🏠 Home", href: "../../index.html" },
      ]);
    });
});

console.log("\n=== Resource pages (expect: Back to Library + Home) ===");
fs.readdirSync(path.join(repoRoot, "content/resources"))
  .filter(f => f.endsWith(".html"))
  .forEach(f => {
    checkFile(`content/resources/${f}`, [
      { text: "← Back to Library", href: "../../library.html" },
      { text: "🏠 Home", href: "../../index.html" },
    ]);
  });

console.log("\n=== finder.html / library.html (expect: Home only) ===");
checkFile("finder.html", [{ text: "🏠 Home", href: "index.html" }]);
checkFile("library.html", [{ text: "🏠 Home", href: "index.html" }]);

console.log("\n=== digital-foundations.html / digital-inclusion.html (expect: Home only) ===");
checkFile("digital-foundations.html", [{ text: "🏠 Home", href: "index.html" }]);
checkFile("digital-inclusion.html", [{ text: "🏠 Home", href: "index.html" }]);

console.log(`\nChecked ${checked} files.`);
console.log(`${failures > 0 ? failures + " FAILURE(S)" : "All checks passed"} — consistency check ${failures > 0 ? "did not pass" : "passed"}.`);
process.exit(failures > 0 ? 1 : 0);
