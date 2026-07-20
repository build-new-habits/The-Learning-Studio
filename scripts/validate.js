// 20/07/26 v1
const Ajv = require("ajv");
const fs = require("fs");
const path = require("path");

const ajv = new Ajv();
const contentDir = path.join(__dirname, "../content");

// Load Schemas
const cardSchema = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/card.schema.json"), "utf8"));
const routeSchema = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/route.schema.json"), "utf8"));
const vocab = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/framework-alignment-vocab.json"), "utf8"));

const validateCard = ajv.compile(cardSchema);
const validateRoute = ajv.compile(routeSchema);

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
const existingCardIds = allJsonFiles.map(file => path.basename(file, '.json'));
let hasErrors = false;

allJsonFiles.forEach(file => {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    const isCard = data.id !== undefined;
    
    // Schema Validation
    const valid = isCard ? validateCard(data) : validateRoute(data);
    if (!valid) {
        console.error(`\n[FAIL] Schema Error in ${file}:`);
        console.error(isCard ? validateCard.errors : validateRoute.errors);
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

    // ID Resolution check
    const refs = isCard ? data.related_cards : data.suggested_cards;
    if (refs) {
        refs.forEach(ref => {
            if (!existingCardIds.includes(ref)) {
                console.error(`\n[FAIL] Reference Error in ${file}: Referenced card ID '${ref}' does not exist in /content.`);
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
