// Checks poas.md: the format of every line, duplicates, and that each new address is a Poa.
//
//   node scripts/check-poas.mjs poas.md [base-poas.md]
//
// With a base file, only addresses that aren't in it are opened. Without one, all of them are.
// Exits with 1 if anything is wrong. Problems are printed as GitHub annotations and,
// when run in GitHub Actions, written to the job summary.

import { readFileSync, appendFileSync } from "node:fs";

const [file, baseFile] = process.argv.slice(2);
const TIMEOUT_MS = 15000;
const MAX_BYTES = 1_000_000;

const errors = [];
const warnings = [];
const passed = [];

// Same rules as the reader's poaUrl() and poaKey().
function poaUrl(address) {
  let a = address.trim();
  if (!/^https?:\/\//i.test(a)) a = "https://" + a;
  if (/\.md$/i.test(a)) return new URL(a).href;
  if (!a.endsWith("/")) a += "/";
  return new URL("poa.md", a).href;
}
function poaKey(url) {
  return url.trim().toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/poa\.md$/, "")
    .replace(/\/+$/, "");
}

// Returns [{ line, address, url, key }] for every list item, recording format errors.
function parse(text, record) {
  const out = [];
  text.replace(/\r\n?/g, "\n").split("\n").forEach((raw, i) => {
    const line = i + 1;
    const item = raw.trim().match(/^[-*+]\s+(.*)$/);
    if (!item) return;
    const link = item[1].match(/^\[[^\]]*\]\(([^)\s]+)\)/);
    const address = link ? link[1] : item[1].split(/\s/)[0];
    let url;
    try { url = poaUrl(address); } catch {
      if (record) errors.push({ line, msg: `"${address}" isn't an address. Write it like marta.github.io/poa` });
      return;
    }
    if (record && /^http:\/\//i.test(address)) {
      errors.push({ line, msg: `"${address}" uses http://. Poas must be served over https.` });
      return;
    }
    const u = new URL(url);
    if (record && (u.username || u.password || u.search || u.hash || u.port)) {
      errors.push({ line, msg: `"${address}" should be a plain address, without a port, login, ? or #.` });
      return;
    }
    out.push({ line, address, url, key: poaKey(url) });
  });
  return out;
}

async function fetchCapped(url) {
  const res = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { "User-Agent": "poa-directory-check" },
  });
  const reader = res.body.getReader();
  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > MAX_BYTES) { reader.cancel(); throw new Error("poa.md is larger than 1 MB"); }
    chunks.push(value);
  }
  return { res, text: Buffer.concat(chunks).toString("utf8") };
}

function header(text) {
  text = text.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  const h = {};
  if (!text.startsWith("---\n")) return h;
  const end = text.indexOf("\n---", 4);
  if (end === -1) return h;
  for (const line of text.slice(4, end).split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) h[line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim();
  }
  return h;
}

async function check(entry) {
  const { line, address, url } = entry;
  let res, text;
  try {
    ({ res, text } = await fetchCapped(url));
  } catch (e) {
    errors.push({ line, msg: `Couldn't open ${url} (${e.message}).` });
    return;
  }
  if (!res.ok) {
    errors.push({ line, msg: `${url} answered ${res.status}. Is the address right, and is the Poa published?` });
    return;
  }
  if (!res.url.startsWith("https://")) {
    errors.push({ line, msg: `${url} redirected to ${res.url}, which isn't https.` });
    return;
  }
  const h = header(text);
  if (!h.version) {
    errors.push({ line, msg: `${url} doesn't start with a Poa header (a "---" block with "version: 1").` });
    return;
  }
  if (/^no$/i.test(h.search || "")) {
    errors.push({ line, msg: `${url} says "search: no", which asks to stay out of search. Remove that line from poa.md, or don't list it here.` });
    return;
  }
  if (res.headers.get("access-control-allow-origin") !== "*") {
    warnings.push({ line, msg: `${url} doesn't send "Access-Control-Allow-Origin: *", so web readers can't show it. See the README for how to add it on your host.` });
  }
  passed.push(`${address} (${h.name || "no name"})`);
}

const entries = parse(readFileSync(file, "utf8"), true);
const baseKeys = baseFile ? new Set(parse(readFileSync(baseFile, "utf8"), false).map(e => e.key)) : null;

const seen = new Map();
for (const e of entries) {
  if (seen.has(e.key)) errors.push({ line: e.line, msg: `"${e.address}" is already listed on line ${seen.get(e.key)}.` });
  else seen.set(e.key, e.line);
}

const firsts = entries.filter(e => seen.get(e.key) === e.line);
const toCheck = baseKeys ? firsts.filter(e => !baseKeys.has(e.key)) : firsts;
// A few at a time, to be polite to small hosts.
for (let i = 0; i < toCheck.length; i += 4) await Promise.all(toCheck.slice(i, i + 4).map(check));

errors.sort((a, b) => a.line - b.line);
warnings.sort((a, b) => a.line - b.line);
const esc = s => s.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
for (const e of errors) console.log(`::error file=${file},line=${e.line}::${esc(e.msg)}`);
for (const w of warnings) console.log(`::warning file=${file},line=${w.line}::${esc(w.msg)}`);

const summary = [
  `### poas.md check`,
  ``,
  `Checked ${toCheck.length} ${baseKeys ? "new " : ""}${toCheck.length === 1 ? "address" : "addresses"} of ${entries.length} listed.`,
  ``,
  ...passed.map(p => `- ✅ ${p}`),
  ...warnings.map(w => `- ⚠️ line ${w.line}: ${w.msg}`),
  ...errors.map(e => `- ❌ line ${e.line}: ${e.msg}`),
].join("\n");
console.log(summary);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + "\n");

process.exit(errors.length ? 1 : 0);
