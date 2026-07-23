// Session 15 evidence script — real DOM proof, not a visual mock.
// Loads the actual shipped library.html via jsdom and asserts:
//   1. Each category heading (h3.category-heading) is immediately
//      followed by a ul.finder-options that is aria-labelledby that
//      heading's id.
//   2. Every link inside that list points to a resource whose JSON
//      file (content/resources/<id>.json) actually has that category.
//   3. All 10 resources in content/resources appear exactly once,
//      total across all groups.
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const repoRoot = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(repoRoot, "library.html"), "utf8");
const dom = new JSDOM(html);
const document = dom.window.document;

const headings = [...document.querySelectorAll("h3.category-heading")];
let failures = 0;
let totalLinksSeen = 0;
const seenIds = new Set();

headings.forEach(h => {
    const headingText = h.textContent.trim();
    const headingId = h.id;
    const list = h.nextElementSibling;

    if (!list || list.tagName !== "UL" || !list.classList.contains("finder-options")) {
        console.error(`[FAIL] Heading "${headingText}" is not immediately followed by a ul.finder-options`);
        failures++;
        return;
    }
    if (list.getAttribute("aria-labelledby") !== headingId) {
        console.error(`[FAIL] List under "${headingText}" is not aria-labelledby="${headingId}"`);
        failures++;
    }

    const links = [...list.querySelectorAll("a.finder-option")];
    console.log(`\n${headingText}  (id="${headingId}")`);
    links.forEach(a => {
        totalLinksSeen++;
        const href = a.getAttribute("href"); // content/resources/<id>.html
        const resourceId = path.basename(href, ".html");
        seenIds.add(resourceId);
        const jsonPath = path.join(repoRoot, "content/resources", `${resourceId}.json`);
        if (!fs.existsSync(jsonPath)) {
            console.error(`  [FAIL] ${resourceId}: no matching JSON file at content/resources/${resourceId}.json`);
            failures++;
            return;
        }
        const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
        const match = data.category === headingText;
        console.log(`  - ${resourceId}: json category = "${data.category}"  ${match ? "OK" : "MISMATCH"}`);
        if (!match) failures++;
    });
});

const allResourceIds = fs.readdirSync(path.join(repoRoot, "content/resources"))
    .filter(f => f.endsWith(".json"))
    .map(f => path.basename(f, ".json"));

console.log(`\nTotal links rendered in library.html: ${totalLinksSeen}`);
console.log(`Total resource JSON files in content/resources: ${allResourceIds.length}`);

const missing = allResourceIds.filter(id => !seenIds.has(id));
if (missing.length) {
    console.error(`[FAIL] Resources that exist but are not linked in library.html: ${missing.join(", ")}`);
    failures++;
}
const duplicates = totalLinksSeen !== seenIds.size;
if (duplicates) {
    console.error(`[FAIL] A resource link appears more than once in library.html`);
    failures++;
}

if (failures > 0) {
    console.error(`\n${failures} FAILURE(S) — DOM proof did not pass.`);
    process.exit(1);
} else {
    console.log(`\nAll ${headings.length} category groups render correctly, every group's links match its heading's category in JSON, and all ${allResourceIds.length} resources appear exactly once.`);
    process.exit(0);
}
