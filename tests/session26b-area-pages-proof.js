// Session 26 follow-up evidence script — real DOM proof, cross-checked
// against the actual card JSON, not a visual mock. For each of
// digital-foundations.html and digital-inclusion.html, asserts:
//   1. Every link on the page resolves to a real card JSON file.
//   2. That card's pyramid_layers actually includes this area.
//   3. Every card anywhere in content/ whose pyramid_layers includes
//      this area is listed on the page — nothing missing, nothing
//      extra, no duplicates.
//   4. index.html's Digital Foundations / Digital Inclusion tiles
//      point at these two pages, not at finder.html or each other.
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const repoRoot = path.join(__dirname, "..");
let failures = 0;
function check(label, condition) {
  console.log(`  [${condition ? "OK" : "FAIL"}] ${label}`);
  if (!condition) failures++;
}

// Collect every card JSON in content/digital-foundations and content/digital-inclusion
const cardDirs = ["content/digital-foundations", "content/digital-inclusion"];
const allCards = [];
cardDirs.forEach(dir => {
  fs.readdirSync(path.join(repoRoot, dir))
    .filter(f => f.endsWith(".json"))
    .forEach(f => {
      const data = JSON.parse(fs.readFileSync(path.join(repoRoot, dir, f), "utf8"));
      allCards.push({ dir, id: data.id, pyramid_layers: data.pyramid_layers || [] });
    });
});

function checkAreaPage(pageFile, areaLabel) {
  console.log(`\n=== ${pageFile} (${areaLabel}) ===`);
  const html = fs.readFileSync(path.join(repoRoot, pageFile), "utf8");
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const links = [...document.querySelectorAll("a.finder-option")];
  const linkedIds = new Set();

  links.forEach(a => {
    const href = a.getAttribute("href"); // content/<area>/<id>.html
    const id = path.basename(href, ".html");
    linkedIds.add(id);
    const card = allCards.find(c => c.id === id);
    if (!card) {
      console.error(`  [FAIL] ${id}: no matching card JSON found anywhere`);
      failures++;
      return;
    }
    const belongs = card.pyramid_layers.includes(areaLabel);
    console.log(`  - ${id}: pyramid_layers = ${JSON.stringify(card.pyramid_layers)}  ${belongs ? "OK" : "MISMATCH — listed but not tagged for this area"}`);
    if (!belongs) failures++;
  });

  check("No duplicate links on the page", links.length === linkedIds.size);

  const shouldBeListed = allCards.filter(c => c.pyramid_layers.includes(areaLabel)).map(c => c.id);
  const missing = shouldBeListed.filter(id => !linkedIds.has(id));
  if (missing.length) {
    console.error(`  [FAIL] Tagged for ${areaLabel} but missing from the page: ${missing.join(", ")}`);
    failures++;
  } else {
    console.log(`  [OK] All ${shouldBeListed.length} cards tagged "${areaLabel}" are listed`);
  }
}

checkAreaPage("digital-foundations.html", "Digital Foundations");
checkAreaPage("digital-inclusion.html", "Digital Inclusion");

console.log("\n=== index.html tile wiring ===");
const indexHtml = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
const indexDom = new JSDOM(indexHtml);
const indexDoc = indexDom.window.document;
const items = [...indexDoc.querySelectorAll(".path-b-item")];
const foundationsHref = items[0].querySelector("a").getAttribute("href");
const inclusionHref = items[1].querySelector("a").getAttribute("href");
console.log(`  Digital Foundations tile -> ${foundationsHref}`);
console.log(`  Digital Inclusion tile -> ${inclusionHref}`);
check("Digital Foundations tile links to digital-foundations.html", foundationsHref === "digital-foundations.html");
check("Digital Inclusion tile links to digital-inclusion.html", inclusionHref === "digital-inclusion.html");
check("The two tiles no longer point to the same place", foundationsHref !== inclusionHref);

console.log(`\n${failures > 0 ? failures + " FAILURE(S)" : "All checks passed"} — evidence ${failures > 0 ? "did not pass" : "passed"}.`);
process.exit(failures > 0 ? 1 : 0);
