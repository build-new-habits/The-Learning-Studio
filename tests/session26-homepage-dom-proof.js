// Session 26 evidence script — real DOM proof of the restructured
// homepage, not a visual mock. Loads the actual shipped index.html via
// jsdom and asserts:
//   1. The exact headline, Path A copy, and Path B label appear verbatim.
//   2. Path A links to finder.html.
//   3. Exactly 4 tiles render, in order, each with the exact title,
//      description and (where specified) sub-line text from the brief.
//   4. Digital Innovation has no sub-line — wait, it does; only Library
//      has no sub-line — verified against the brief's copy block.
//   5. Href fix: Digital Inclusion no longer points at finder.html.
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const repoRoot = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
const dom = new JSDOM(html);
const document = dom.window.document;

let failures = 0;
function check(label, condition) {
  console.log(`  [${condition ? "OK" : "FAIL"}] ${label}`);
  if (!condition) failures++;
}

console.log("--- Headline & Path A ---");
const headline = document.querySelector(".path-headline");
check('Headline text is exactly "I need help — which one do I go to?"',
  headline && headline.textContent.trim() === "I need help — which one do I go to?");

const pathALink = document.querySelector(".path-a-link");
check('Path A link text is exactly "Tell me what you\'re doing"',
  pathALink && pathALink.textContent.trim() === "Tell me what you're doing");
check('Path A links to finder.html',
  pathALink && pathALink.getAttribute("href") === "finder.html");

console.log("\n--- Path B label ---");
const pathBLabel = document.querySelector(".path-b-label");
check('Path B label text is exactly "I already know the area I need"',
  pathBLabel && pathBLabel.textContent.trim() === "I already know the area I need");

console.log("\n--- Tiles ---");
const tiles = [...document.querySelectorAll(".tile-grid > li > a.tile")];
check("Exactly 4 tiles render", tiles.length === 4);

const expected = [
  {
    title: "Digital Foundations",
    desc: "Building confidence with the everyday Microsoft 365 tools every role depends on — email, Teams, files, and accessibility as a habit from day one.",
    subline: "Start here if digital tools feel new, or you want to lock in the basics.",
  },
  {
    title: "Digital Inclusion",
    desc: "Using digital tools purposefully so every learner can access, participate and succeed — assistive technology, accessible design, and inclusive practice for SEND, ESOL and beyond.",
    subline: "Start here if you're comfortable day-to-day and want your practice to be more inclusive.",
  },
  {
    title: "Digital Innovation",
    desc: "Reshaping what's possible with digital and AI — building workflows, leading change, and helping good practice spread beyond your own room.",
    subline: "Start here if you're ready to experiment, lead, or explore AI.",
  },
  {
    title: "Library",
    desc: "Every tool, guide and resource in one place — browse by type instead of by situation.",
    subline: null,
  },
];

expected.forEach((exp, i) => {
  const tile = tiles[i];
  console.log(`\nTile ${i + 1}: ${exp.title}`);
  if (!tile) {
    console.error(`  [FAIL] Tile ${i + 1} does not exist`);
    failures++;
    return;
  }
  const title = tile.querySelector(".tile__title");
  const desc = tile.querySelector(".tile__desc");
  const subline = tile.querySelector(".tile__subline");
  check("Title matches exactly", title && title.textContent.trim() === exp.title);
  check("Description matches exactly", desc && desc.textContent.trim() === exp.desc);
  if (exp.subline === null) {
    check("No sub-line present (Library)", subline === null);
  } else {
    check("Sub-line matches exactly", subline && subline.textContent.trim() === exp.subline);
  }
});

console.log("\n--- Href fix ---");
const inclusionTile = tiles[1];
const inclusionHref = inclusionTile && inclusionTile.getAttribute("href");
console.log(`  Digital Inclusion href = "${inclusionHref}"`);
check("Digital Inclusion no longer points at finder.html", inclusionHref !== "finder.html");

console.log("\n--- No rating/confidence/skill-level inputs introduced ---");
const forbiddenInputs = document.querySelectorAll("select, input[type=radio], input[type=range], input[type=number]");
// text-size / line-spacing / letter-spacing / read-aloud-speed ranges are
// pre-existing Settings panel controls, unrelated to this session's
// Path A/B content — exclude those by id.
const preexistingIds = new Set([
  "text-size-range", "line-spacing-range", "letter-spacing-range", "read-aloud-speed-range",
]);
const newForbidden = [...forbiddenInputs].filter(el => !preexistingIds.has(el.id));
check("No new self-rating/confidence/skill-level form controls", newForbidden.length === 0);

console.log(`\n${failures > 0 ? failures + " FAILURE(S)" : "All checks passed"} — DOM proof ${failures > 0 ? "did not pass" : "passed"}.`);
process.exit(failures > 0 ? 1 : 0);
