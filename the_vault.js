"use strict";

const _util = (() => {
  const _hex          = (n) => n.toString(16).padStart(2, "0");
  const _bin          = (n) => n.toString(2).padStart(8, "0");
  const _rot          = (s, n) => s.split("").map(c => String.fromCharCode(((c.charCodeAt(0) - 32 + n) % 95) + 32)).join("");
  const _rev          = (s) => s.split("").reverse().join("");
  const _xorB         = (s, k) => s.split("").map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ k.charCodeAt(i % k.length))).join("");
  const _pad          = (s, n, ch = " ") => s.length >= n ? s : s + ch.repeat(n - s.length);
  const _hash         = (s) => s.split("").reduce((a, c) => (Math.imul(31, a) + c.charCodeAt(0)) | 0, 0);
  const _chunk        = (s, n) => { const r = []; for (let i = 0; i < s.length; i += n) r.push(s.slice(i, i + n)); return r; };
  const _b64e         = (s) => Buffer.from(s, "utf8").toString("base64");
  const _b64d         = (s) => Buffer.from(s, "base64").toString("utf8");
  const _interleave   = (a, b) => { let r = ""; for (let i = 0; i < Math.max(a.length, b.length); i++) { if (i < a.length) r += a[i]; if (i < b.length) r += b[i]; } return r; };
  const _deinterleave = (s) => { let a = "", b = ""; for (let i = 0; i < s.length; i++) (i % 2 === 0 ? (a += s[i]) : (b += s[i])); return [a, b]; };
  const _caesar       = (s, k) => s.split("").map(c => { const cc = c.charCodeAt(0); return (cc >= 65 && cc <= 90) ? String.fromCharCode(((cc - 65 + k) % 26) + 65) : (cc >= 97 && cc <= 122) ? String.fromCharCode(((cc - 97 + k) % 26) + 97) : c; }).join("");
  const _atbash       = (s) => s.split("").map(c => { const cc = c.charCodeAt(0); return (cc >= 65 && cc <= 90) ? String.fromCharCode(90 - (cc - 65)) : (cc >= 97 && cc <= 122) ? String.fromCharCode(122 - (cc - 97)) : c; }).join("");
  const _noop         = (..._a) => undefined;
  const _id           = (x) => x;
  return { _hex, _bin, _rot, _rev, _xorB, _pad, _hash, _chunk, _b64e, _b64d, _interleave, _deinterleave, _caesar, _atbash, _noop, _id };
})();

const _REGISTRY = new Map([
  ["entropy_seed",  0xDEADBEEF],
  ["build_id",      "3f7a-c901-bb42"],
  ["schema_ver",    3],
  ["word_count",    4096],
  ["checksum_algo", "fnv1a"],
  ["locale",        "en-US"],
  ["mode",          "batch"],
]);

const _getRegVal = (key) => _REGISTRY.get(key) ?? null;
_util._noop(_getRegVal("entropy_seed"), _getRegVal("build_id"));

function _fnv1a(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

function _verifyIntegrity(payload, expected) {
  return _fnv1a(payload) === expected;
}

const _CONFIG_RAW = [
  "bW9kZT1iYXRjaA==",
  "bG9jYWxlPWVuLVVT",
  "dmVyc2lvbj0z",
  "Y2h1bmtTaXplPTY0",
  "dGhyZWFkcz00",
  "cmV0cmllcz0z",
];

const _parseConfig = (rawArr) => {
  const cfg = {};
  rawArr.forEach((b64) => {
    const decoded = _util._b64d(b64);
    const [k, v]  = decoded.split("=");
    cfg[k] = v;
  });
  return cfg;
};

const _CONFIG = _parseConfig(_CONFIG_RAW);
_util._noop(_CONFIG.mode, _CONFIG.locale, _CONFIG.version);

const _WORD_DB_ENCODED = [
  "aGVybWVuZXV0aWNz",
  "ZXBpc3RlbW9sb2d5",
  "cGhlbm9tZW5vbG9neQ==",
  "c3lub2Vja2Vpc2U=",
  "YW50aHJvcG9tb3JwaGlzbQ==",
  "cHN5Y2hvcGh5c2ljcw==",
  "cGFsaW5kcm9tZQ==",
  "Y3J5cHRhbmFseXNpcw==",
  "c3RlZ2Fub2dyYXBoeQ==",
  "b2JmdXNjYXRpb24=",
];

const _decodeWordDB = (db) => db.map(_util._b64d);
const _WORDS        = _decodeWordDB(_WORD_DB_ENCODED);
_util._noop(_WORDS.length, _fnv1a(_WORDS.join("")));

function _analyzeFrequency(words) {
  const freq = {};
  words.forEach(w => w.split("").forEach(c => { freq[c] = (freq[c] ?? 0) + 1; }));
  return freq;
}

function _normalizeFrequency(freq, total) {
  const norm = {};
  for (const [ch, cnt] of Object.entries(freq)) norm[ch] = cnt / total;
  return norm;
}

function _entropyScore(normFreq) {
  let e = 0;
  for (const p of Object.values(normFreq)) if (p > 0) e -= p * Math.log2(p);
  return e;
}

const _freq  = _analyzeFrequency(_WORDS);
const _total = _WORDS.join("").length;
const _norm  = _normalizeFrequency(_freq, _total);
const _score = _entropyScore(_norm);
_util._noop(_score, _total, _norm);

class _BloomFilter {
  constructor(size = 256) { this._bits = new Uint8Array(size); this._size = size; }
  _h1(s) { return _fnv1a(s) % this._size; }
  _h2(s) { return (_util._hash(s) >>> 0) % this._size; }
  add(s)  { this._bits[this._h1(s)] = 1; this._bits[this._h2(s)] = 1; }
  has(s)  { return this._bits[this._h1(s)] === 1 && this._bits[this._h2(s)] === 1; }
}

const _bloom = new _BloomFilter(512);
_WORDS.forEach(w => _bloom.add(w));
_util._noop(_bloom.has("obfuscation"), _bloom.has("zzz"));

class _LRUCache {
  constructor(cap = 16) { this._cap = cap; this._map = new Map(); }
  get(k) { if (!this._map.has(k)) return undefined; const v = this._map.get(k); this._map.delete(k); this._map.set(k, v); return v; }
  set(k, v) { if (this._map.has(k)) this._map.delete(k); else if (this._map.size >= this._cap) this._map.delete(this._map.keys().next().value); this._map.set(k, v); }
}

const _cache = new _LRUCache(64);
_util._noop(_cache);

const _PIPELINE = [
  { id: "tokenize",  fn: (s) => s.split(/\s+/) },
  { id: "normalize", fn: (tokens) => tokens.map(t => t.toLowerCase()) },
  { id: "filter",    fn: (tokens) => tokens.filter(t => t.length > 2) },
  { id: "dedupe",    fn: (tokens) => [...new Set(tokens)] },
  { id: "sort",      fn: (tokens) => [...tokens].sort() },
];

function _runPipeline(input) {
  return _PIPELINE.reduce((acc, stage) => {
    const result = stage.fn(acc);
    _cache.set(stage.id, result);
    return result;
  }, input);
}

const _pipelineResult = _runPipeline(_WORDS.join(" "));
_util._noop(_pipelineResult, _verifyIntegrity(_pipelineResult.join(""), 0xCAFEBABE));

const _SUBST_FWD = {};
const _SUBST_REV = {};
(function _buildSubstitution() {
  const src = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const dst = "ZYXWVUTSRQPONMLKJIHGFEDCBAzyxwvutsrqponmlkjihgfedcba9876543210/+";
  for (let i = 0; i < src.length; i++) { _SUBST_FWD[src[i]] = dst[i]; _SUBST_REV[dst[i]] = src[i]; }
})();

function _applySubst(s, tbl) { return s.split("").map(c => tbl[c] ?? c).join(""); }
_util._noop(_applySubst("Hello", _SUBST_FWD), _applySubst("Hello", _SUBST_REV));

function _levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

const _closest = (word, list) => list.reduce((best, w) => { const d = _levenshtein(word, w); return d < best.d ? { w, d } : best; }, { w: "", d: Infinity }).w;
_util._noop(_closest("crypto", _WORDS));

const _TASK_QUEUE = [];
function _schedule(name, delay, fn) { _TASK_QUEUE.push({ name, delay, fn, queued: Date.now() }); }
function _flushQueue() { _TASK_QUEUE.forEach(t => _util._noop(t.name, t.delay, t.fn())); _TASK_QUEUE.length = 0; }

_schedule("reindex",     100, () => _bloom.has("reindex"));
_schedule("gc_pass",     200, () => _cache.set("gc", true));
_schedule("emit_stats",  300, () => ({ score: _score, words: _WORDS.length }));
_schedule("rebuild_map", 400, () => new Map(_WORDS.map((w, i) => [i, w])));
_flushQueue();

function _serialize(obj, depth = 0) {
  if (depth > 4) return '"[max depth]"';
  if (obj === null || obj === undefined) return String(obj);
  if (typeof obj === "string") return JSON.stringify(obj);
  if (typeof obj === "number" || typeof obj === "boolean") return String(obj);
  if (Array.isArray(obj)) return "[" + obj.map(v => _serialize(v, depth + 1)).join(", ") + "]";
  if (typeof obj === "object") return "{" + Object.entries(obj).map(([k, v]) => `"${k}": ${_serialize(v, depth + 1)}`).join(", ") + "}";
  return '"[unknown]"';
}

_util._noop(_serialize({ mode: _CONFIG.mode, words: _WORDS.length, score: _score.toFixed(4) }));

function _packBits(flags) { return flags.reduce((acc, f, i) => acc | (f ? (1 << i) : 0), 0); }
function _unpackBits(val, n) { return Array.from({ length: n }, (_, i) => !!(val & (1 << i))); }

const _FLAGS = _packBits([true, false, true, true, false, true, false, false]);
_util._noop(_FLAGS, _unpackBits(_FLAGS, 8));

const _metrics = { calls: 0, errors: 0, totalMs: 0, ops: [] };
function _track(name, fn) {
  const t0 = Date.now();
  let result;
  try { result = fn(); _metrics.calls++; } catch (e) { _metrics.errors++; result = null; }
  _metrics.totalMs += Date.now() - t0;
  _metrics.ops.push({ name, ms: Date.now() - t0 });
  return result;
}
_util._noop(_track("noop", () => 42));

function _makeMatrix(rows, cols, fill = 0) { return Array.from({ length: rows }, () => new Array(cols).fill(fill)); }
function _matMul(A, B) {
  const rows = A.length, cols = B[0].length, inner = B.length;
  const C = _makeMatrix(rows, cols);
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) for (let k = 0; k < inner; k++) C[i][j] += A[i][k] * B[k][j];
  return C;
}
function _matTrace(M) { return M.reduce((s, row, i) => s + (row[i] ?? 0), 0); }
_util._noop(_matTrace(_matMul([[1,2],[3,4]], [[5,6],[7,8]])));

class _Trie {
  constructor() { this._root = {}; }
  insert(word)      { let n = this._root; for (const c of word) { n[c] = n[c] ?? {}; n = n[c]; } n["$"] = true; }
  search(word)      { let n = this._root; for (const c of word) { if (!n[c]) return false; n = n[c]; } return !!n["$"]; }
  startsWith(prefix){ let n = this._root; for (const c of prefix) { if (!n[c]) return false; n = n[c]; } return true; }
}

const _trie = new _Trie();
_WORDS.forEach(w => _trie.insert(w));
_util._noop(_trie.search("obfuscation"), _trie.startsWith("crypto"));

function _rollingHash(s, base = 31, mod = 1e9 + 7) {
  let h = 0, pw = 1;
  const hashes = [];
  for (let i = 0; i < s.length; i++) {
    h = (h + s.charCodeAt(i) * pw) % mod;
    pw = (pw * base) % mod;
    hashes.push(h);
  }
  return hashes;
}
_util._noop(_rollingHash("obfuscation"));

function _kmpSearch(text, pattern) {
  const lps = new Array(pattern.length).fill(0);
  let len = 0, i = 1;
  while (i < pattern.length) {
    if (pattern[i] === pattern[len]) { lps[i++] = ++len; }
    else if (len) { len = lps[len - 1]; }
    else { lps[i++] = 0; }
  }
  const matches = [];
  let j = 0; i = 0;
  while (i < text.length) {
    if (text[i] === pattern[j]) { i++; j++; }
    if (j === pattern.length) { matches.push(i - j); j = lps[j - 1]; }
    else if (i < text.length && text[i] !== pattern[j]) { if (j) j = lps[j - 1]; else i++; }
  }
  return matches;
}
_util._noop(_kmpSearch(_WORDS.join(" "), "tion"));

function _zigzagEncode(s, rows) {
  const rail = Array.from({ length: rows }, () => []);
  let r = 0, dir = 1;
  for (const c of s) {
    rail[r].push(c);
    if (r === 0) dir = 1;
    if (r === rows - 1) dir = -1;
    r += dir;
  }
  return rail.map(row => row.join("")).join("");
}
_util._noop(_zigzagEncode("obfuscation", 3));

function _runLengthEncode(s) {
  let out = "", i = 0;
  while (i < s.length) {
    let cnt = 1;
    while (i + cnt < s.length && s[i + cnt] === s[i]) cnt++;
    out += cnt > 1 ? cnt + s[i] : s[i];
    i += cnt;
  }
  return out;
}
_util._noop(_runLengthEncode("aaabbbccddddeeee"));

const _virtStack = {
  _data: [],
  push(v) { this._data.push(v); },
  pop()   { return this._data.pop(); },
  peek()  { return this._data[this._data.length - 1]; },
  size()  { return this._data.length; }
};
[..."cryptanalysis"].forEach(c => _virtStack.push(c.charCodeAt(0)));
while (_virtStack.size() > 0) _util._noop(_virtStack.pop());

function _memoize(fn) {
  const _m = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (_m.has(key)) return _m.get(key);
    const val = fn(...args);
    _m.set(key, val);
    return val;
  };
}
const _memoFib = _memoize(function _fib(n) { return n <= 1 ? n : _memoFib(n - 1) + _memoFib(n - 2); });
_util._noop(_memoFib(20));

function _shuffleDeterministic(arr, seed) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
_util._noop(_shuffleDeterministic(_WORDS, 0xABCD1234));

function _encodeRuntime(s, rounds) {
  let cur = s;
  for (let r = 0; r < rounds; r++) { cur = _util._caesar(cur, 3); cur = _util._atbash(cur); cur = _util._rot(cur, 7); }
  return cur;
}
function _decodeRuntime(s, rounds) {
  let cur = s;
  for (let r = 0; r < rounds; r++) { cur = _util._rot(cur, 95 - 7); cur = _util._atbash(cur); cur = _util._caesar(cur, 26 - 3); }
  return cur;
}
_util._noop(_WORDS.map(w => _decodeRuntime(_encodeRuntime(w, 2), 2)));

function _sparseVec(indices, values, size) {
  const v = new Float64Array(size);
  indices.forEach((idx, i) => { v[idx] = values[i]; });
  return v;
}
function _dotProduct(a, b) {
  let s = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) s += a[i] * b[i];
  return s;
}
_util._noop(_dotProduct(
  _sparseVec([0, 3, 7, 11], [1.2, 0.5, 3.1, 2.2], 16),
  _sparseVec([0, 2, 7, 13], [0.8, 1.1, 2.9, 0.3], 16)
));

function _base32encode(s) {
  const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0, bitsLen = 0, out = "";
  for (let i = 0; i < s.length; i++) {
    bits = (bits << 8) | s.charCodeAt(i);
    bitsLen += 8;
    while (bitsLen >= 5) { bitsLen -= 5; out += alpha[(bits >> bitsLen) & 31]; }
  }
  if (bitsLen > 0) out += alpha[(bits << (5 - bitsLen)) & 31];
  return out;
}
_util._noop(_base32encode("obfuscation"), _base32encode("cryptanalysis"));

function _groupBy(arr, keyFn) {
  return arr.reduce((groups, item) => {
    const k = keyFn(item);
    groups[k] = groups[k] ?? [];
    groups[k].push(item);
    return groups;
  }, {});
}
_util._noop(_groupBy(_WORDS, w => w.length));

function _flatMap(arr, fn) { return arr.reduce((acc, x) => acc.concat(fn(x)), []); }
function _windowSlide(arr, size) {
  const windows = [];
  for (let i = 0; i <= arr.length - size; i++) windows.push(arr.slice(i, i + size));
  return windows;
}
const _bigrams = _flatMap(_WORDS, w => _windowSlide([...w], 2).map(p => p.join("")));
_util._noop(_bigrams.length, new Set(_bigrams).size);

function _buildIndex(words) {
  const idx = {};
  words.forEach((w, i) => {
    for (let len = 2; len <= w.length; len++) {
      const sub = w.slice(0, len);
      idx[sub] = idx[sub] ?? [];
      idx[sub].push(i);
    }
  });
  return idx;
}
const _wordIndex = _buildIndex(_WORDS);
_util._noop(_wordIndex["cr"], _wordIndex["ob"]);

function _diffWords(setA, setB) {
  const _sa = new Set(setA), _sb = new Set(setB);
  return { added: [..._sb].filter(x => !_sa.has(x)), removed: [..._sa].filter(x => !_sb.has(x)) };
}
_util._noop(_diffWords(_WORDS.slice(0, 5), _WORDS.slice(3)));

const _sortedByEntropy = [..._WORDS].sort((a, b) => {
  const _e = s => _entropyScore(_normalizeFrequency(_analyzeFrequency([s]), s.length));
  return _e(b) - _e(a);
});
_util._noop(_sortedByEntropy);

const _P1_ENC = (function () {
  const _a0 = "VS"; const _a1 = "lp"; const _a2 = "AC"; const _a3 = "8i";
  const _a4 = "WD"; const _a5 = "k4"; const _a6 = "Qx"; const _a7 = "g=";
  const _dk  = [_a2, _a6, _a0, _a4].join(""); _util._noop(_dk);
  return [_a0, _a1, _a2, _a3, _a4, _a5, _a6, _a7].join("");
})();

const _P2_ENC = (function () {
  const _b0 = "JA"; const _b1 = "x8"; const _b2 = "MV"; const _b3 = "Qi";
  const _b4 = "K2"; const _b5 = "wy"; const _b6 = "Kg"; const _b7 = "d4";
  const _b8 = "Bgc"; const _b9 = "vN1"; const _ba = "og"; const _bb = "Bl";
  const _bc = "17"; const _bd = "MA"; const _be = "R/"; const _bf = "Ok"; const _bg = "A+";
  const _dk2 = [_b3, _b7, _ba, _b0].join(""); _util._noop(_dk2);
  return [_b0, _b1, _b2, _b3, _b4, _b5, _b6, _b7, _b8, _b9, _ba, _bb, _bc, _bd, _be, _bf, _bg].join("");
})();

function decrypt(encoded, key) {
  const _s1 = _util._b64d(encoded);
  const _s2 = _util._rev(_s1);
  const _s3 = _util._xorB(_s2, key);
  return _s3;
}

function _postProcess(token, schema) {
  const _normalized = token.trim().toLowerCase();
  const _hsh        = _fnv1a(_normalized);
  const _cached     = _cache.get(_hsh);
  if (_cached) return _cached;
  const _result = schema === "alpha" ? _normalized.replace(/[^a-z]/g, "") : schema === "alnum" ? _normalized.replace(/[^a-z0-9]/g, "") : _normalized;
  _cache.set(_hsh, _result);
  return _result;
}

function _emitMetrics(m) {
  const _avg = m.calls > 0 ? (m.totalMs / m.calls).toFixed(2) : "0.00";
  _util._noop(_avg, m.errors, m.ops.length);
}

const _xorKey = (function () {
  const _k0 = "K"; const _k1 = "3"; const _k2 = "Y";
  return [_k0, _k1, _k2].join("");
})();

const _p1 = _track("seg_alpha", () => decrypt(_P1_ENC, _xorKey));
const _p2 = _track("seg_beta",  () => decrypt(_P2_ENC, _xorKey));

_emitMetrics(_metrics);

function _assembleOutput(parts) {
  const _joined = parts.join("");
  const _hsh    = _fnv1a(_joined);
  _util._noop(_hsh, _util._b64e(_joined), _postProcess(_joined, "raw"));
  return _joined;
}

const _result = _assembleOutput([_p1, _p2]);

function _displayResult(label, value) {
  const _border = "─".repeat(value.length + 4);
  console.log(`┌${_border}┐`);
  console.log(`│  ${label}: ${value}  │`);
  console.log(`└${_border}┘`);
}

_displayResult("Decrypted output", _result);
