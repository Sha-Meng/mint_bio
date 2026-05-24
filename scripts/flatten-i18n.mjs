import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const zhPath = path.join(rootDir, "src/i18n/zh-CN.json");
const enPath = path.join(rootDir, "src/i18n/en-US.json");
const outputDir = path.join(__dirname, ".i18n-cache");
const entriesPath = path.join(outputDir, "site-i18n-entries.json");
const missingPath = path.join(outputDir, "site-i18n-missing-en.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function hasCjk(value) {
  return /[\u3400-\u9fff]/.test(String(value || ""));
}

function flattenLeaves(value, prefix = "", result = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => flattenLeaves(item, prefix ? `${prefix}.${index}` : String(index), result));
    return result;
  }

  if (isPlainObject(value)) {
    Object.keys(value).forEach((key) => {
      flattenLeaves(value[key], prefix ? `${prefix}.${key}` : key, result);
    });
    return result;
  }

  result.push({ key_path: prefix, value });
  return result;
}

function getByPath(source, keyPath) {
  return keyPath.split(".").reduce((current, key) => current?.[key], source);
}

function makeLabel(keyPath, zhValue) {
  const value = String(zhValue ?? "").trim().replace(/\s+/g, " ");
  if (!value) return keyPath;
  return value.length > 40 ? `${value.slice(0, 40)}…` : value;
}

function isMissingEnglish(enValue) {
  return enValue === undefined || enValue === null || enValue === "" || hasCjk(enValue);
}

const zh = readJson(zhPath);
const en = readJson(enPath);
const zhLeaves = flattenLeaves(zh);

const missing = [];
const entries = zhLeaves.map((item) => {
  const enValue = getByPath(en, item.key_path);
  const missingEn = isMissingEnglish(enValue);
  if (missingEn) {
    missing.push({
      key_path: item.key_path,
      group: item.key_path.split(".")[0] || "common",
      value_zh: item.value,
      current_en: enValue ?? "",
      reason: enValue === undefined ? "missing_key" : hasCjk(enValue) ? "contains_chinese" : "empty",
    });
  }

  return {
    key_path: item.key_path,
    group: item.key_path.split(".")[0] || "common",
    label: makeLabel(item.key_path, item.value),
    value_zh: item.value ?? "",
    value_en: missingEn ? "" : enValue,
    enabled: true,
  };
});

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(entriesPath, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
fs.writeFileSync(missingPath, `${JSON.stringify(missing, null, 2)}\n`, "utf8");

console.log(`Generated ${entries.length} Directus i18n entries:`);
console.log(`- ${path.relative(rootDir, entriesPath)}`);
console.log(`English missing or unconfirmed: ${missing.length}`);
console.log(`- ${path.relative(rootDir, missingPath)}`);
