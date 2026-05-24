import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const zhPath = path.join(rootDir, "src/i18n/zh-CN.json");
const enPath = path.join(rootDir, "src/i18n/en-US.json");
const srcDir = path.join(rootDir, "src");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function flattenLeaves(value, prefix = "", result = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => flattenLeaves(item, prefix ? `${prefix}.${index}` : String(index), result));
    return result;
  }
  if (isPlainObject(value)) {
    Object.keys(value).forEach((key) => flattenLeaves(value[key], prefix ? `${prefix}.${key}` : key, result));
    return result;
  }
  result.push({ key_path: prefix, value });
  return result;
}

function getByPath(source, keyPath) {
  return keyPath.split(".").reduce((current, key) => current?.[key], source);
}

function hasCjk(value) {
  return /[\u3400-\u9fff]/.test(String(value || ""));
}

function listFiles(dir, result = []) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      listFiles(fullPath, result);
      return;
    }
    if (/\.(vue|js)$/.test(entry.name)) result.push(fullPath);
  });
  return result;
}

const zh = readJson(zhPath);
const en = readJson(enPath);
const zhLeaves = flattenLeaves(zh);
const missingKeys = [];
const untranslated = [];

zhLeaves.forEach((item) => {
  const enValue = getByPath(en, item.key_path);
  if (enValue === undefined) missingKeys.push(item.key_path);
  if (enValue === undefined || enValue === "" || hasCjk(enValue)) {
    untranslated.push({ key_path: item.key_path, value_zh: item.value, current_en: enValue ?? "" });
  }
});

const hardcoded = [];
listFiles(srcDir).forEach((filePath) => {
  if (filePath.includes(`${path.sep}i18n${path.sep}`)) return;
  const relativePath = path.relative(rootDir, filePath).replace(/\\/g, "/");
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  lines.forEach((line, index) => {
    if (hasCjk(line) && !line.includes("//") && !line.includes("console.")) {
      hardcoded.push({ file: relativePath, line: index + 1, text: line.trim() });
    }
  });
});

console.log("i18n simple audit summary");
console.log(`- zh leaf keys: ${zhLeaves.length}`);
console.log(`- missing keys in en-US.json: ${missingKeys.length}`);
console.log(`- missing/unconfirmed English values: ${untranslated.length}`);
console.log(`- possible hardcoded Chinese lines: ${hardcoded.length}`);

if (missingKeys.length) {
  console.log("\nMissing keys in en-US.json:");
  missingKeys.slice(0, 50).forEach((key) => console.log(`- ${key}`));
  if (missingKeys.length > 50) console.log(`... ${missingKeys.length - 50} more`);
}

if (untranslated.length) {
  console.log("\nMissing or unconfirmed English values:");
  untranslated.slice(0, 50).forEach((item) => console.log(`- ${item.key_path}`));
  if (untranslated.length > 50) console.log(`... ${untranslated.length - 50} more`);
}

if (hardcoded.length) {
  console.log("\nPossible hardcoded Chinese lines:");
  hardcoded.slice(0, 80).forEach((item) => console.log(`- ${item.file}:${item.line} ${item.text}`));
  if (hardcoded.length > 80) console.log(`... ${hardcoded.length - 80} more`);
}
