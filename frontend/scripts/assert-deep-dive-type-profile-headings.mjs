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
const locales = ['en','nl'];
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
   for(const feature of ['Type','Strategy','Authority']) assert.ok(text.includes(feature),`${l} ${feature}`);
   assert.doesNotMatch(text,/Core rows|Core-rijen|Type names this energy|Type benoemt/);
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
assert.deepEqual(deepDiveTypeSections('unknown','nl'),[]);
const dd=read('src/components/ChartDeepDive.tsx');
assert.doesNotMatch(dd,/deep-dive-type-pointer|TYPE_COPY/);
assert.ok(dd.indexOf('<Accordion title="Type"') < dd.indexOf('<Accordion title="Strategy"'));
assert.match(dd,/deepDiveTypeSections\(hdType, locale, personName\)/);
assert.match(dd,/title="Profile" subtitle=\{profilePresentation\(profile\)\.value\}/);
assert.match(dd,/\{profileLearnMore\(profile\)\}/,'existing combo resolver remains');
assert.match(dd,/scrollMarginTop: "var\(--chart-scroll-mt\)"/);
assert.match(dd,/if \(!details.open\) return/);
assert.match(dd,/top - stickyBottom/);
assert.match(dd,/<h3 className="font-semibold">\{heading\}<\/h3>/);
assert.match(dd,/<p className="mt-1 font-normal">\{body\}<\/p>/);
const page=read('src/app/profile/page.tsx');
assert.match(page,/<ChartDeepDive\s+personName=\{snapshotPersonName\}/);
assert.match(page,/value=\{<span className="min-w-0 break-words">\{profilePresentation\(profileStr\)\.value\}/);
assert.match(page,/<SnapshotProfileBody\s+profile=\{profileStr\}/);
// Frozen copy and geometry hashes stay on main. Brief 17353706… lifts en/nl catalog pins
// and ChartTypeBox to its final bytes (Read more link, then Type-open memory).
// Scope change 27 Nov 2026 10:06 PM Bangkok: de/es/fr catalogs stay at main 87bd4665.
const frozen = {
  "src/lib/hdCopy.ts": "b8c89bc238dcc631717cdf098d92756f63df6e22d73ac67465851aa58d972ec6",
  "src/lib/essays/hdCopy.es.ts": "895abfa6bb5270c546b8a96778e80eebb60c9215b8961a9a40eebfd3709451b6",
  "src/lib/essays/hdCopy.nl.ts": "8528a2f8e2ec67fd886cb5fb75a6784243dd492cbdaf7cb4693b3e827ef4f941",
  "src/lib/hdProfileCombos.ts": "77c6ea4524a7cd80bcb2dea0b082c7ada4699cb53270e046ededb09b4e2257b4",
  "src/lib/essays/hdProfileCombos.es.ts": "d82120dccc295a2e42ee35e5a06e3926fd5d4574fd4e002c396dc5103b4e752f",
  "src/lib/essays/hdProfileCombos.nl.ts": "49ca815a9109e0ca7117b8b1f7952f9525d01b9e6fcd2702d990fa8361b79da8",
  "src/components/ChartTypeBox.tsx": "f7996a40bd54c6c64efe5ddab4be725111c1ef7b496f91c500f0480f160baea4",
  "src/components/BodyGraph.tsx": "8f9380005b90a2b6e34190650a599c248d79e84e13c99e15ea9086d5b3dd2da8",
  "src/lib/essays/snapshotOtherPersonCopy.ts": "a146f37cdd159d430de72e8c9d925654d5c17a5db70aa17e74b35a1795b75864",
  "src/lib/essays/resolveHdCopy.ts": "32466a4cc54502412783bfb36398f263d4af93734f4080b0d4df60aa006967b1",
  "src/lib/i18n/messages/en.ts": "31441bfd37dfee0c4eb385ebb35d654297463dbe2fa4eeb87c6e2193f41a4d5e",
  "src/lib/i18n/messages/de.ts": "dada3ac0614ba4d01a580c7d7d579316ae4d99372f0fdfa44eec3fd111f67f9f",
  "src/lib/i18n/messages/es.ts": "8fc6e78052efad2b30201021ebf4265c5d59f6bea1855d47e0e91810c523732e",
  "src/lib/i18n/messages/fr.ts": "9c2b4166fe4d19bc78ab0562f7050fff75b01e9203944fac5543a730b418edff",
  "src/lib/i18n/messages/nl.ts": "4abcb0e2841443842246c48fafc3f8961b95f6e2ab67a18c5397f5faef095d3a"
};
for(const [path,hash] of Object.entries(frozen)) assert.equal(sha(read(path)),hash,`${path} frozen`);
const essayHashes = {
  "en": "942a37eb0ba3b4237cba25ec6100becf1824e631e287dd7d09413475156600f9",
  "de": "daf233ce063d70811b604fbf78c697b8f1e93fb78b1f0f901700a90de9174e91",
  "es": "7403e4daeed33204de5bd39bdbf0ab6d67061be6a410f9afee282ba8f14ba329",
  "fr": "a853f3b4a29dcbe483703c0014124d8e4ae0d219bb3fcca3b4fa5fa002362c30",
  "nl": "69d9e354718f0e884137128f54ee0b91602d044d0fe93d63e13f997a20b7d216"
};
for(const [l,hash] of Object.entries(essayHashes)) assert.equal(sha(read(`src/lib/essays/deepDiveType.${l}.json`)),hash,`${l} locked essays`);
console.log('PASS: 50 complete Type essays; 12 Profile headings × 5 locales × 2 voices; original briefs/combos/Type box frozen.');
