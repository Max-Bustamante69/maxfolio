// Structural check for the JSON-LD emitted into index.html by scripts/build-jsonld.mjs — not a
// full schema.org validator, but catches the failure modes that actually matter here: invalid
// JSON, a missing required property, or an empty ItemList (the "filter with no canary reports
// zero silently" house mistake). Exits non-zero on any failure.
// Usage: node scripts/check-jsonld.mjs
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1])
const fails = []
const ok = (cond, msg) => { if (!cond) fails.push(msg) }

ok(scripts.length === 2, `expected 2 JSON-LD <script> blocks in index.html, found ${scripts.length}`)

let profile, list
try {
  ;[profile, list] = scripts.map((s) => JSON.parse(s))
} catch (e) {
  console.error('FAIL: JSON-LD block is not valid JSON —', e.message)
  process.exit(1)
}

ok(profile['@type'] === 'ProfilePage', 'block 1 @type should be ProfilePage')
ok(profile.mainEntity?.['@type'] === 'Person', 'ProfilePage.mainEntity should be a Person')
ok(!!profile.mainEntity?.hasOccupation, 'Person should carry hasOccupation')
ok(Array.isArray(profile.mainEntity?.sameAs) && profile.mainEntity.sameAs.length > 0, 'Person.sameAs should be non-empty')
ok(Array.isArray(profile.inLanguage) && profile.inLanguage.includes('en') && profile.inLanguage.includes('es') && profile.inLanguage.includes('ja'), 'ProfilePage.inLanguage should list en/es/ja')

ok(list['@type'] === 'ItemList', 'block 2 @type should be ItemList')
ok(typeof list.numberOfItems === 'number' && list.numberOfItems > 0, 'ItemList.numberOfItems must be > 0 (a filter that silently returns 0 is a bug, not a valid result)')
ok(Array.isArray(list.itemListElement) && list.itemListElement.length === list.numberOfItems, 'itemListElement length must match numberOfItems')
for (const [i, li] of (list.itemListElement ?? []).entries()) {
  ok(li['@type'] === 'ListItem', `itemListElement[${i}] should be a ListItem`)
  ok(li.position === i + 1, `itemListElement[${i}].position should be ${i + 1}`)
  ok(li.item?.['@type'] === 'CreativeWork', `itemListElement[${i}].item should be a CreativeWork`)
  ok(typeof li.item?.name === 'string' && li.item.name.length > 0, `itemListElement[${i}].item.name missing`)
  ok(typeof li.item?.url === 'string' && /^https?:\/\//.test(li.item.url), `itemListElement[${i}].item.url is not an absolute URL`)
}

if (fails.length) {
  console.error(`FAIL: ${fails.length} JSON-LD structural check(s) failed:\n  - ${fails.join('\n  - ')}`)
  process.exit(1)
}
console.log(`OK: JSON-LD structurally valid — ProfilePage/Person with hasOccupation + sameAs, ItemList with ${list.numberOfItems} CreativeWork storefronts.`)
