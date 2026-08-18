// One-off migration helper: pulls the unique <main>...</main> body (and any
// trailing <script> block after </footer>) out of each existing static page
// verbatim, so the templating rebuild can't accidentally alter real content
// (bios, publication lists, etc.) during the refactor.
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

function extract(srcRelPath, mainOut, scriptOut) {
  const src = fs.readFileSync(path.join(ROOT, srcRelPath), "utf8");

  const mainMatch = src.match(/(<main[\s\S]*?<\/main>)/);
  if (!mainMatch) throw new Error(`No <main> found in ${srcRelPath}`);
  fs.writeFileSync(path.join(ROOT, mainOut), mainMatch[1].trim() + "\n", "utf8");

  const afterFooter = src.split(/<\/footer>/)[1] || "";
  const scriptMatch = afterFooter.match(/(<script>[\s\S]*?<\/script>)/);
  if (scriptMatch) {
    fs.writeFileSync(path.join(ROOT, scriptOut), scriptMatch[1].trim() + "\n", "utf8");
  }
}

extract("index.html", "content/index.body.html", "content/index.script.html");
extract("about.html", "content/about.body.html", "content/about.script.html");
extract("contact.html", "content/contact.body.html", "content/contact.script.html");
extract("directory.html", "content/directory.body.html", "content/directory.script.html");

const boardDir = path.join(ROOT, "board");
for (const file of fs.readdirSync(boardDir)) {
  if (!file.endsWith(".html")) continue;
  const slug = file.replace(/\.html$/, "");
  extract(`board/${file}`, `content/board/${slug}.body.html`, `content/board/${slug}.script.html`);
}

console.log("Extraction complete.");
