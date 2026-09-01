import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const landingRoot = path.join(root, "src", "landing");

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(fullPath));
    else if (/\.(tsx?|css)$/.test(entry.name)) files.push(fullPath);
  }
  return files;
}

const landingFiles = await collectFiles(landingRoot);
const sources = await Promise.all(landingFiles.map(async (file) => ({ file, text: await readFile(file, "utf8") })));
const combined = sources.map(({ text }) => text).join("\n");
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

const banned = /\b(revolutionary|transformative|seamless|hyper-personalized|real-time|guaranteed)\b|before customers ask|before customers go looking elsewhere|the future of banking/i;
assert(!banned.test(combined), "Landing source contains a banned claim or phrase");
assert((combined.match(/Request Access/g) ?? []).length === 3, "Landing source must contain exactly three case-sensitive Request Access labels");
assert(combined.includes('title: "Request access"'), "Modal title must be Request access");
assert(combined.includes('submit: "Submit request"'), "Modal submit label must be Submit request");

const expectedGlassRegions = [
  "header",
  "hero-decision-plane",
  "intelligence-plane",
  "governance-plane",
  "activation-network",
  "request-access-modal",
];
for (const region of expectedGlassRegions) assert(combined.includes(`"${region}"`), `Missing glass region: ${region}`);

const appSource = await readFile(path.join(root, "src", "App.tsx"), "utf8");
assert(appSource.includes('<Route path="/" element={<LandingPage />} />'), "Root route does not render LandingPage");
assert(appSource.includes('<Route path="/bankdemo"'), "The /bankdemo route is missing");
assert(appSource.includes("const Navbar = lazy"), "Legacy Navbar must remain lazy for landing isolation");
assert(appSource.includes("const Footer = lazy"), "Legacy Footer must remain lazy for landing isolation");

const indexHtml = await readFile(path.join(root, "index.html"), "utf8");
assert(!indexHtml.includes("fonts.googleapis.com/css2"), "index.html must not globally request font families");
assert(!indexHtml.includes("national partnerships"), "Legacy positioning remains in index.html");

const routeFonts = await readFile(path.join(landingRoot, "RouteFonts.tsx"), "utf8");
assert(routeFonts.includes("IBM+Plex+Mono") && routeFonts.includes("Inter+Tight"), "Landing font request must include IBM Plex Mono and Inter Tight");
assert(!/landingFonts[^;]+Manrope/.test(routeFonts), "Landing font request includes a legacy font family");

if (failures.length) {
  console.error(`Landing source QA failed (${failures.length})`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Landing source QA passed (${landingFiles.length} files checked)`);

