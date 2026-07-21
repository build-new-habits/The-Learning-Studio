// 21/07/26 v2 — Session 10: adds resource.schema.json validation and the
// digital_practice_resources reference check (card tag key must exist on
// the card, resource id it points to must resolve to a real file in
// /content/resources). Card vs Resource is now determined by folder
// (…/content/resources/…), not by the presence of an "id" field, since
// both types carry one.
const Ajv = require("ajv");
const fs = require("fs");
const path = require("path");

const ajv = new Ajv();
const contentDir = path.join(__dirname, "../content");
const resourcesDir = path.join(contentDir, "resources");

// Load Schemas
const cardSchema = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/card.schema.json"), "utf8"));
const routeSchema = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/route.schema.json"), "utf8"));
const resourceSchema = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/resource.schema.json"), "utf8"));
const vocab = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/framework-alignment-vocab.json"), "utf8"));

const validateCard = ajv.compile(cardSchema);
const validateRoute = ajv.compile(routeSchema);
const validateResource = ajv.compile(resourceSchema);

function getFiles(dir, ext) {
    if (!fs.existsSync(dir)) return [];
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(file, ext));
        } else if (file.endsWith(ext)) {
            results.push(file);
        }
    });
    return results;
}

const allJsonFiles = getFiles(contentDir, ".json");
const resourceFiles = getFiles(resourcesDir, ".json");
const existingCardIds = allJsonFiles
    .filter(file => !resourceFiles.includes(file))
    .map(file => path.basename(file, '.json'));
const existingResourceIds = resourceFiles.map(file => path.basename(file, '.json'));
let hasErrors = false;

allJsonFiles.forEach(file => {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    const isResource = resourceFiles.includes(file);
    const isCard = !isResource && data.id !== undefined;

    // Schema Validation
    const validate = isResource ? validateResource : (isCard ? validateCard : validateRoute);
    const valid = validate(data);
    if (!valid) {
        console.error(`\n[FAIL] Schema Error in ${file}:`);
        console.error(validate.errors);
        hasErrors = true;
    }

    // Vocabulary check for cards
    if (isCard && data.framework_alignment) {
        data.framework_alignment.forEach(fw => {
            const baseFw = fw.split(':')[0].trim();
            if (!vocab.vocabulary.includes(baseFw)) {
                console.error(`\n[FAIL] Vocabulary Error in ${file}: '${baseFw}' is not in the controlled vocabulary.`);
                hasErrors = true;
            }
        });
    }

    // ID Resolution check (related_cards / suggested_cards)
    const refs = isCard ? data.related_cards : (isResource ? null : data.suggested_cards);
    if (refs) {
        refs.forEach(ref => {
            if (!existingCardIds.includes(ref)) {
                console.error(`\n[FAIL] Reference Error in ${file}: Referenced card ID '${ref}' does not exist in /content.`);
                hasErrors = true;
            }
        });
    }

    // digital_practice_resources check (Session 10): every key must be a
    // real digital_practices entry on this card, and every resource id it
    // points to must resolve to a real file in /content/resources.
    if (isCard && data.digital_practice_resources) {
        const practices = data.digital_practices || [];
        Object.keys(data.digital_practice_resources).forEach(tag => {
            if (!practices.includes(tag)) {
                console.error(`\n[FAIL] digital_practice_resources Error in ${file}: key '${tag}' does not match any entry in this card's digital_practices.`);
                hasErrors = true;
            }
            const resourceId = data.digital_practice_resources[tag];
            if (!existingResourceIds.includes(resourceId)) {
                console.error(`\n[FAIL] digital_practice_resources Error in ${file}: resource id '${resourceId}' does not exist in /content/resources.`);
                hasErrors = true;
            }
        });
    }
});

if (hasErrors) {
    console.error("\nValidation failed. Build halted.");
    process.exit(1);
} else {
    console.log("\nValidation passed. Schema integrity and ID references are sound.");
    process.exit(0);
}
