/** Locked brief 94b01b1a…: structured full Type essays and canonical Profile headings. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
globalThis.React = React;
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFileSync(join(root,p),'utf8');
const sha = text => createHash('sha256').update(text).digest('hex');
const { deepDiveTypeSections } = await import('../src/lib/essays/deepDiveTypeCopy.ts');
const { profilePresentation } = await import('../src/lib/profilePresentation.ts');
const { SnapshotProfileBody } = await import('../src/components/SnapshotProfileBody.tsx');
const { resolveHdCopy } = await import('../src/lib/essays/resolveHdCopy.ts');
const { snapshotProfileOtherLine } = await import('../src/lib/essays/snapshotOtherPersonCopy.ts');
const locales = ['en','de','es','fr','nl'];
const types = ['Generator','Manifesting Generator','Manifestor','Projector','Reflector'];
const headings = [
 '1/3 — Investigator / Martyr', '1/4 — Investigator / Opportunist',
 '2/4 — Hermit / Opportunist', '2/5 — Hermit / Heretic',
 '3/5 — Martyr / Heretic', '3/6 — Martyr / Role Model',
 '4/6 — Opportunist / Role Model', '4/1 — Opportunist / Investigator',
 '5/1 — Heretic / Investigator', '5/2 — Heretic / Hermit',
 '6/2 — Role Model / Hermit', '6/3 — Role Model / Martyr',
];
const subheads = {
 en:['Lived meaning','Energy and role','Practical approach','Pitfalls'],
 de:['Gelebte Bedeutung','Energie und Rolle','Praktischer Ansatz','Stolperfallen'],
 es:['Significado vivido','Energía y papel','Enfoque práctico','Trampas'],
 fr:['Sens vécu','Énergie et rôle','Approche pratique','Pièges'],
 nl:['Geleefde betekenis','Energie en rol','Praktische aanpak','Valkuilen'],
};
const formal = {en:/$^/, de:/\b(Sie|Ihr|Ihnen)\b/, es:/\b(usted|ustedes)\b/i, fr:/\b(vous|votre|vos)\b/i, nl:/\b(u|uw)\b/i};
const second = {en:/\b(you|your)\b/i, de:/\b(du|dein\w*|dich|dir)\b/i, es:/\b(tú|tu|tus|eres|tienes|recoges|necesitas)\b/i, fr:/\b(tu|toi|ton|ta|tes)\b/i, nl:/\b(je|jij|jouw|jou)\b/i};
for (const l of locales) {
 for (const type of types) {
  for (const name of [undefined,'Juno $&']) {
   const sections = deepDiveTypeSections(type,l,name);
   assert.equal(sections.length,4);
   assert.deepEqual(sections.map(s=>s.heading),subheads[l]);
   const text=sections.map(s=>s.heading+' '+s.body).join(' ');
   const words=text.replaceAll('Juno $&','{name}').split(/\s+/).length;
   assert.ok(words>=200 && words<=320,`${l}/${type}/${name}: ${words} words`);
   assert.doesNotMatch(text,formal[l]);
   for(const feature of ['Type','Strategy','Authority','Core']) assert.ok(text.includes(feature),`${l} ${feature}`);
   assert.doesNotMatch(text,/\[\[|\]\]|\{name\}/);
   if(name) {assert.ok(text.includes(name));assert.doesNotMatch(text,second[l]);}
   else assert.doesNotMatch(text,/Juno/);
   if(l==='fr') assert.doesNotMatch(text,/'/, 'French typographic apostrophes only');
   if(l!=='en') assert.notDeepEqual(sections,deepDiveTypeSections(type,'en',name),'no silent English essay fallback');
  }
 }
 for(const want of headings) {
  const profile=want.split(' — ')[0];
  assert.equal(profilePresentation(profile).value,want);
  for (const name of [undefined,'Juno']) {
   const copy = name ? snapshotProfileOtherLine(profile,l,name) : resolveHdCopy(l).profilePlainLine(profile);
   const {sections}=profilePresentation(profile,copy);
   const expected=copy.split('\n\n').slice(1).map(x=>x.slice(x.indexOf(': ')+2));
   assert.deepEqual(sections.map(s=>s.brief),expected,'briefs byte-for-byte unchanged');
   assert.deepEqual(sections.map(s=>s.name),want.split(' — ')[1].split(' / '));
   const html=renderToStaticMarkup(React.createElement(SnapshotProfileBody,{profile,copy}));
   assert.equal((html.match(/<h3 class="font-semibold">/g)||[]).length,2);
   assert.equal((html.match(/<p class="mt-1 font-normal">/g)||[]).length,2);
   assert.ok(!html.includes(profile+' — '),'no duplicate names line');
   assert.ok(!html.includes('Outward (line'),'legacy labels removed');
  }
 }
}
for(const invalid of ['', '9/1','1/9','x','5/']) {
 assert.equal(profilePresentation(invalid).value,invalid);
 assert.deepEqual(profilePresentation(invalid).sections,[]);
 assert.ok(!profilePresentation(invalid).value.includes('?'));
}
assert.deepEqual(deepDiveTypeSections('unknown','fr'),[]);
const dd=read('src/components/ChartDeepDive.tsx');
assert.doesNotMatch(dd,/deep-dive-type-pointer|TYPE_COPY/);
assert.ok(dd.indexOf('<Accordion title="Type"') < dd.indexOf('<Accordion title="Strategy"'));
assert.match(dd,/deepDiveTypeSections\(hdType, locale, personName\)/);
assert.match(dd,/title="Profile" subtitle=\{profilePresentation\(profile\)\.value\}/);
assert.match(dd,/\{profileLearnMore\(profile\)\}/,'existing combo resolver remains');
assert.match(dd,/scrollMarginTop: "var\(--chart-scroll-mt\)"/);
assert.match(dd,/if \(!details.open\) return/);
assert.match(dd,/top < stickyBottom/);
assert.match(dd,/<h3 className="font-semibold">\{heading\}<\/h3>/);
assert.match(dd,/<p className="mt-1 font-normal">\{body\}<\/p>/);
const page=read('src/app/profile/page.tsx');
assert.match(page,/<ChartDeepDive\s+personName=\{snapshotPersonName\}/);
assert.match(page,/value=\{<span className="min-w-0 break-words">\{profilePresentation\(profileStr\)\.value\}/);
assert.match(page,/<SnapshotProfileBody\s+profile=\{profileStr\}/);
// Frozen copy and geometry hashes are pinned to the exact approved base. No closer edits.
// Catalog hashes moved for Shelf day-view strings, then for protocols.moveLoggedOnToday.
// Essay JSON hashes below stay put.
const frozen = {
  "src/lib/hdCopy.ts": "63c5acd82b0a65dc2d58a275a212f7a23025fffad56c30e93530c7851f016136",
  "src/lib/essays/hdCopy.es.ts": "895abfa6bb5270c546b8a96778e80eebb60c9215b8961a9a40eebfd3709451b6",
  "src/lib/essays/hdCopy.nl.ts": "bd44bfc69afc237a978bc73586ec0af5aa474f7e6dfdd94f87c8970d3b8bd252",
  "src/lib/hdProfileCombos.ts": "368e3032562c13cdefa1d2d41b0aafd82abe34e77e4c8650a59592e451eddf77",
  "src/lib/essays/hdProfileCombos.es.ts": "d82120dccc295a2e42ee35e5a06e3926fd5d4574fd4e002c396dc5103b4e752f",
  "src/lib/essays/hdProfileCombos.nl.ts": "1a4a15f87e73a685dfe029071d188b39e4a768e32965f740c21b1e154158db9e",
  "src/components/ChartTypeBox.tsx": "a677803ac66fffaea4b09002b8002ba1914462a924876270fe1f501fd931530d",
  "src/components/BodyGraph.tsx": "8f9380005b90a2b6e34190650a599c248d79e84e13c99e15ea9086d5b3dd2da8",
  "src/lib/essays/snapshotOtherPersonCopy.ts": "4f2b1758bb12e3ff9988f6167793c3d4dcd087b859a65f6ee30b981eb0a300be",
  "src/lib/essays/resolveHdCopy.ts": "05cdd9b052e277ec8bdeac10cfcc1ddd09daa079f95355580f4f6719be40f58b",
  "src/lib/i18n/messages/en.ts": "7eb98453baa59845769d0d2bfbd1e39ec50ad80eac22608b62f47e469cff2f7f",
  "src/lib/i18n/messages/de.ts": "5e97fabed069f7d409f19e93647487c68385b3427d23a489262688ad4d503b1b",
  "src/lib/i18n/messages/es.ts": "aaad111efc68cea7aa67bffe57141ebb23aeb78010018a7912e45752147300a6",
  "src/lib/i18n/messages/fr.ts": "697f1dc28a6d88712a89c08ac9bbbbd88f3c6d16b80f3f1ba4b9d15784177652",
  "src/lib/i18n/messages/nl.ts": "6bbe4e8a4be44bd47a0b28f85834e6d1d320fb36bed995ff3dc0614284f6c3df"
};
for(const [path,hash] of Object.entries(frozen)) assert.equal(sha(read(path)),hash,`${path} frozen`);
const essayHashes = {
  "en": "d94c49b21fd5581c4539e0eb7e06b63554c93eaeb93797d035d0de7a99e28b25",
  "de": "daf233ce063d70811b604fbf78c697b8f1e93fb78b1f0f901700a90de9174e91",
  "es": "7403e4daeed33204de5bd39bdbf0ab6d67061be6a410f9afee282ba8f14ba329",
  "fr": "a853f3b4a29dcbe483703c0014124d8e4ae0d219bb3fcca3b4fa5fa002362c30",
  "nl": "e092103f91b103b3bec00cf9c8beb6b6d5317c2d595effbe49ee529d94a232af"
};
for(const [l,hash] of Object.entries(essayHashes)) assert.equal(sha(read(`src/lib/essays/deepDiveType.${l}.json`)),hash,`${l} locked essays`);
console.log('PASS: 50 complete Type essays; 12 Profile headings × 5 locales × 2 voices; original briefs/combos/Type box frozen.');
