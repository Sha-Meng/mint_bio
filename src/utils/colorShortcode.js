const BRAND_COLOR_ALIASES = Object.freeze({
  orange: "#e75a29",
  blue: "#2d5bf6",
  green: "#74d887",
  "blue-green": "#6bbea9",
  bluegreen: "#6bbea9",
});

const LEGACY_COLOR_ALIASES = Object.freeze({
  "#ff7200": "#e75a29",
  "#144be1": "#2d5bf6",
  "#007d30": "#74d887",
});

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function hasUnsafeCssToken(value) {
  return /[;{}<>"'\\]/.test(value) || /\b(?:url|var|expression)\s*\(/i.test(value);
}

function normalizeHex(value) {
  const match = String(value || "").trim().match(/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (!match) return null;

  const hex = match[1].toLowerCase();
  const normalized = hex.length === 3 || hex.length === 4
    ? hex.split("").map((char) => `${char}${char}`).join("")
    : hex;
  const color = `#${normalized}`;
  return LEGACY_COLOR_ALIASES[color] || color;
}

function normalizeNumber(value, min, max, { allowPercent = false, allowDecimal = false } = {}) {
  const text = String(value || "").trim();
  const isPercent = text.endsWith("%");
  if (isPercent && !allowPercent) return null;

  const numberText = isPercent ? text.slice(0, -1) : text;
  if (!/^-?\d+(?:\.\d+)?$/.test(numberText)) return null;
  if (!allowDecimal && numberText.includes(".")) return null;

  const number = Number(numberText);
  if (!Number.isFinite(number) || number < min || number > max) return null;
  return `${numberText}${isPercent ? "%" : ""}`;
}

function normalizeAlpha(value) {
  const text = String(value || "").trim();
  if (text.endsWith("%")) return normalizeNumber(text, 0, 100, { allowPercent: true, allowDecimal: true });
  return normalizeNumber(text, 0, 1, { allowDecimal: true });
}

function splitFunctionArgs(value) {
  return String(value || "")
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part !== "");
}

function normalizeRgb(value) {
  const match = String(value || "").trim().match(/^rgba?\((.*)\)$/i);
  if (!match) return null;

  const args = splitFunctionArgs(match[1]);
  if (args.length !== 3 && args.length !== 4) return null;

  const channels = args.slice(0, 3).map((part) => normalizeNumber(part, 0, part.endsWith("%") ? 100 : 255, {
    allowPercent: true,
    allowDecimal: part.endsWith("%"),
  }));
  if (channels.some((part) => part === null)) return null;

  if (args.length === 4) {
    const alpha = normalizeAlpha(args[3]);
    if (alpha === null) return null;
    return `rgba(${channels.join(", ")}, ${alpha})`;
  }

  return `rgb(${channels.join(", ")})`;
}

function normalizeHsl(value) {
  const match = String(value || "").trim().match(/^hsla?\((.*)\)$/i);
  if (!match) return null;

  const args = splitFunctionArgs(match[1]);
  if (args.length !== 3 && args.length !== 4) return null;

  const hue = normalizeNumber(args[0], 0, 360, { allowDecimal: true });
  const saturation = args[1].trim().endsWith("%")
    ? normalizeNumber(args[1], 0, 100, { allowPercent: true, allowDecimal: true })
    : null;
  const lightness = args[2].trim().endsWith("%")
    ? normalizeNumber(args[2], 0, 100, { allowPercent: true, allowDecimal: true })
    : null;
  if (hue === null || saturation === null || lightness === null) return null;

  if (args.length === 4) {
    const alpha = normalizeAlpha(args[3]);
    if (alpha === null) return null;
    return `hsla(${hue}, ${saturation}, ${lightness}, ${alpha})`;
  }

  return `hsl(${hue}, ${saturation}, ${lightness})`;
}

export function normalizeColorValue(value) {
  const raw = String(value || "").trim();
  if (!raw || hasUnsafeCssToken(raw)) return null;

  const alias = BRAND_COLOR_ALIASES[raw.toLowerCase()];
  if (alias) return alias;

  return normalizeHex(raw) || normalizeRgb(raw) || normalizeHsl(raw);
}

function renderSegment(value, preserveHtml) {
  return preserveHtml ? String(value || "") : escapeHtml(value);
}

export function renderColorShortcodes(input, options = {}) {
  const value = String(input || "");
  if (!value || !value.includes("[color=")) {
    return { html: value, changed: false };
  }

  const preserveHtml = Boolean(options.preserveHtml);
  const shortcodePattern = /\[color=([^\]\r\n]+)\]([\s\S]*?)\[\/color\]/gi;
  let cursor = 0;
  let changed = false;
  let html = "";
  let match;

  while ((match = shortcodePattern.exec(value))) {
    const [fullMatch, rawColor, content] = match;
    const color = normalizeColorValue(rawColor);
    const hasNestedShortcode = /\[\/?color(?:=|\])/i.test(content);

    html += renderSegment(value.slice(cursor, match.index), preserveHtml);

    if (!color || hasNestedShortcode) {
      html += renderSegment(fullMatch, preserveHtml);
    } else {
      changed = true;
      html += `<span class="mint-color-shortcode" style="color: ${color}">${renderSegment(content, preserveHtml)}</span>`;
    }

    cursor = match.index + fullMatch.length;
  }

  if (!changed) {
    return { html: value, changed: false };
  }

  html += renderSegment(value.slice(cursor), preserveHtml);
  return { html, changed: true };
}

export function hasColorShortcode(value) {
  return /\[color=[^\]\r\n]+\][\s\S]*?\[\/color\]/i.test(String(value || ""));
}
