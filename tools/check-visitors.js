#!/usr/bin/env node
/* Checks every visitor in js/encounters.js. Run from the project folder:  node tools/check-visitors.js
 * Exits with code 1 if anything is wrong. */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const window = {};
['js/i18n.js', 'js/encounters.js'].forEach((f) => new Function('window', fs.readFileSync(path.join(root, f), 'utf8'))(window));

const ROLES = ['scammer', 'attacker', 'launderer', 'insider', 'legal'];
const CHANNELS = Object.keys(window.CHANNELS);
const JOBS = ['guard', 'reception', 'teller', 'hr', 'ceo', 'rm', 'it', 'ops'];
const TARGET = { scammer: 12, attacker: 12, launderer: 12, insider: 12, legal: 14 };
// Launderers rarely meet guards or IT; one believable case each is enough there
const MIN_PER_JOB = (job, role) => (role === 'launderer' && (job === 'guard' || job === 'it') ? 1 : 2);

const errors = [];
const err = (id, msg) => errors.push(id + ': ' + msg);
const pair = (v) => Array.isArray(v) && v.length === 2 && typeof v[0] === 'string' && typeof v[1] === 'string' && v[0] && v[1];
const flagsIn = (s) => (s.match(/\[\[[^\]]+\]\]/g) || []).length;
const spoken = (e) => [e.open].concat(Object.values(e.acts).map((a) => (Array.isArray(a) ? a : a.say)));

const ids = new Set();
window.ENCOUNTERS.forEach((e) => {
  const id = e.id || '(no id)';
  if (ids.has(id)) err(id, 'duplicate id'); ids.add(id);
  if (!ROLES.includes(e.role)) err(id, 'bad role ' + e.role);
  if (![1, 2, 3].includes(e.level)) err(id, 'level must be 1, 2 or 3');
  if (!CHANNELS.includes(e.channel)) err(id, 'bad channel ' + e.channel);
  if (!window.PLACES[e.place]) err(id, 'bad place ' + e.place);
  if (!Array.isArray(e.jobs) || !e.jobs.length || e.jobs.some((j) => !JOBS.includes(j))) err(id, 'bad jobs ' + e.jobs);
  if (!e.who || !pair(e.who.name) || !e.who.age || !e.who.base) err(id, 'who needs base, name and age');
  ['claim', 'open', 'key', 'sum', 'exit'].forEach((k) => { if (!pair(e[k])) err(id, 'missing or not bilingual: ' + k); });
  if (e.channel === 'person' && !pair(e.arrive)) err(id, 'in-person visitors need arrive');
  if (e.channel !== 'person' && !pair(e.line)) err(id, 'remote visitors need line');
  if (!e.card || !pair(e.card.title) || !Array.isArray(e.card.rows)) err(id, 'card needs title and rows');
  const acts = Object.keys(e.acts || {});
  if (acts.length < 6) err(id, 'needs 6 replies, has ' + acts.length);
  acts.forEach((k) => {
    if (!window.ACTIONS[k]) err(id, 'unknown action ' + k);
    const a = e.acts[k];
    if (!pair(Array.isArray(a) ? a : a.say)) err(id, 'reply ' + k + ' is not bilingual');
  });
  if (!Array.isArray(e.flags) || e.flags.length !== 3 || !e.flags.every(pair)) err(id, 'needs exactly 3 bilingual flags');
  // [[red flags]] must match between English and Arabic, string by string
  spoken(e).forEach((s, i) => { if (pair(s) && flagsIn(s[0]) !== flagsIn(s[1])) err(id, 'EN/AR [[flag]] count differs in line ' + i); });
  const en = spoken(e).reduce((n, s) => n + flagsIn(s[0]), 0), ar = spoken(e).reduce((n, s) => n + flagsIn(s[1]), 0);
  if (e.role === 'legal' && (en || ar)) err(id, 'legal visitors must have no [[flags]]');
  if (e.role !== 'legal' && (en < 3 || ar < 3)) err(id, 'needs at least 3 [[flags]] (EN ' + en + ', AR ' + ar + ')');
});

// Counts
const byRole = {}, byJob = {}, byLevel = {}, byChannel = {};
window.ENCOUNTERS.forEach((e) => {
  byRole[e.role] = (byRole[e.role] || 0) + 1;
  byChannel[e.channel] = (byChannel[e.channel] || 0) + 1;
  (byLevel[e.level] = byLevel[e.level] || {})[e.role] = (byLevel[e.level][e.role] || 0) + 1;
  e.jobs.forEach((j) => { (byJob[j] = byJob[j] || {})[e.role] = (byJob[j][e.role] || 0) + 1; });
});
ROLES.forEach((r) => { if ((byRole[r] || 0) < TARGET[r]) err('TOTAL', r + ' has ' + (byRole[r] || 0) + ', target ' + TARGET[r]); });
JOBS.forEach((j) => ROLES.forEach((r) => {
  const n = (byJob[j] || {})[r] || 0;
  if (n < MIN_PER_JOB(j, r)) err('JOB ' + j, r + ' has ' + n + ', needs ' + MIN_PER_JOB(j, r));
}));
[1, 2, 3].forEach((l) => ROLES.forEach((r) => { if (!(byLevel[l] || {})[r]) err('LEVEL ' + l, 'no ' + r); }));
CHANNELS.forEach((c) => { if (!byChannel[c]) err('CHANNELS', c + ' is never used'); });

const pad = (s, n) => String(s).padEnd(n);
console.log('Visitors: ' + window.ENCOUNTERS.length);
console.log(ROLES.map((r) => r + ' ' + (byRole[r] || 0) + '/' + TARGET[r]).join(' · '));
console.log('\n' + pad('job', 11) + ROLES.map((r) => pad(r, 10)).join(''));
JOBS.forEach((j) => console.log(pad(j, 11) + ROLES.map((r) => pad((byJob[j] || {})[r] || 0, 10)).join('')));
console.log('\n' + pad('level', 11) + ROLES.map((r) => pad(r, 10)).join(''));
[1, 2, 3].forEach((l) => console.log(pad(l, 11) + ROLES.map((r) => pad((byLevel[l] || {})[r] || 0, 10)).join('')));
console.log('\nChannels: ' + CHANNELS.map((c) => c + ' ' + (byChannel[c] || 0)).join(' · '));
if (errors.length) { console.log('\n' + errors.length + ' problem(s):\n  ' + errors.join('\n  ')); process.exit(1); }
console.log('\nAll checks passed.');
