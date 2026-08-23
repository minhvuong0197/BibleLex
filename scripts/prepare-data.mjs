/**
 * prepare-data.mjs
 *
 * Downloads real, public-domain Biblical texts and converts them into the
 * clean JSON files consumed by `scripts/import-data.ts`.
 *
 * Sources (all public domain / CC-BY-SA):
 *  - Strong's Hebrew & Greek dictionaries ...... openscriptures/strongs
 *  - Hebrew OT (WLC, Westminster Leningrad Codex) openscriptures/morphhb
 *  - Greek NT (SBLGNT + morphology) ............ morphgnt/sblgnt
 *
 * Output (into ./data):
 *  - strongs.json      [{ strong, lang, word, translit, pronunciation, derivation, definition, kjv_def }]
 *  - hebrew.json       [{ name, abbreviation, testament, bookOrder, chapters, verses:[{chapter,verse,text,words}] }]
 *  - greek.json        same shape, New Testament
 *  - morphology.json   [{ strong, parsing, count, tense?, voice?, mood?, case?, number?, person?, gender? }]
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DATA = join(ROOT, 'data')
const RAW = join(DATA, 'raw')
mkdirSync(RAW, { recursive: true })

const BASE = 'https://raw.githubusercontent.com'

async function fetchText(url, dest) {
  if (dest && existsSync(dest)) {
    return readFileSync(dest, 'utf-8')
  }
  process.stdout.write(`  ↓ ${url.split('/').pop()} ... `)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const text = await res.text()
  if (dest) writeFileSync(dest, text)
  process.stdout.write(`ok (${Math.round(text.length / 1024)} KB)\n`)
  return text
}

/* ------------------------------------------------------------------ */
/*  Strong's dictionaries                                             */
/* ------------------------------------------------------------------ */

function parseStrongsJs(text) {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  const json = JSON.parse(text.slice(start, end + 1))
  return json
}

function normalizeGreek(s = '') {
  // Decompose accents/breathings and drop combining marks, then lowercase.
  // Keep the Greek Unicode letters themselves (do NOT strip them).
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

async function buildStrongs() {
  console.log('\n[1/4] Strong\'s dictionaries')
  const greekRaw = await fetchText(
    `${BASE}/openscriptures/strongs/master/greek/strongs-greek-dictionary.js`,
    join(RAW, 'strongs-greek.js')
  )
  const hebrewRaw = await fetchText(
    `${BASE}/openscriptures/strongs/master/hebrew/strongs-hebrew-dictionary.js`,
    join(RAW, 'strongs-hebrew.js')
  )

  const greekDict = parseStrongsJs(greekRaw)
  const hebrewDict = parseStrongsJs(hebrewRaw)

  const strongs = []
  for (const [k, v] of Object.entries(hebrewDict)) {
    strongs.push({
      strong: k.toUpperCase(),
      lang: 'H',
      word: v.lemma || '',
      translit: v.xlit || '',
      pronunciation: v.pron || null,
      derivation: v.derivation || null,
      definition: v.strongs_def || '',
      kjv_def: v.kjv_def || null,
    })
  }
  for (const [k, v] of Object.entries(greekDict)) {
    strongs.push({
      strong: k.toUpperCase(),
      lang: 'G',
      word: v.lemma || '',
      translit: v.translit || '',
      pronunciation: null,
      derivation: v.derivation || null,
      definition: v.strongs_def || '',
      kjv_def: v.kjv_def || null,
    })
  }
  writeFileSync(join(DATA, 'strongs.json'), JSON.stringify(strongs))
  console.log(`  ✓ ${strongs.length} Strong's entries (${hebrewDict.__count || ''}H / G)`)

  // Build a Greek lemma -> strongNumber map for interlinear linking.
  const greekLemmaMap = new Map()
  for (const [k, v] of Object.entries(greekDict)) {
    if (!v.lemma) continue
    const key = normalizeGreek(v.lemma)
    if (key && !greekLemmaMap.has(key)) greekLemmaMap.set(key, k.toUpperCase())
  }
  return { strongs, greekLemmaMap }
}

/* ------------------------------------------------------------------ */
/*  Hebrew Old Testament (WLC)                                        */
/* ------------------------------------------------------------------ */

const WLC_BOOKS = [
  { osis: 'Gen', name: 'Genesis', abbr: 'Gen', order: 1 },
  { osis: 'Exod', name: 'Exodus', abbr: 'Exod', order: 2 },
  { osis: 'Lev', name: 'Leviticus', abbr: 'Lev', order: 3 },
  { osis: 'Num', name: 'Numbers', abbr: 'Num', order: 4 },
  { osis: 'Deut', name: 'Deuteronomy', abbr: 'Deut', order: 5 },
  { osis: 'Josh', name: 'Joshua', abbr: 'Josh', order: 6 },
  { osis: 'Judg', name: 'Judges', abbr: 'Judg', order: 7 },
  { osis: 'Ruth', name: 'Ruth', abbr: 'Ruth', order: 8 },
  { osis: '1Sam', name: '1 Samuel', abbr: '1Sam', order: 9 },
  { osis: '2Sam', name: '2 Samuel', abbr: '2Sam', order: 10 },
  { osis: '1Kgs', name: '1 Kings', abbr: '1Kgs', order: 11 },
  { osis: '2Kgs', name: '2 Kings', abbr: '2Kgs', order: 12 },
  { osis: '1Chr', name: '1 Chronicles', abbr: '1Chr', order: 13 },
  { osis: '2Chr', name: '2 Chronicles', abbr: '2Chr', order: 14 },
  { osis: 'Ezra', name: 'Ezra', abbr: 'Ezra', order: 15 },
  { osis: 'Neh', name: 'Nehemiah', abbr: 'Neh', order: 16 },
  { osis: 'Esth', name: 'Esther', abbr: 'Esth', order: 17 },
  { osis: 'Job', name: 'Job', abbr: 'Job', order: 18 },
  { osis: 'Ps', name: 'Psalms', abbr: 'Ps', order: 19 },
  { osis: 'Prov', name: 'Proverbs', abbr: 'Prov', order: 20 },
  { osis: 'Eccl', name: 'Ecclesiastes', abbr: 'Eccl', order: 21 },
  { osis: 'Song', name: 'Song of Solomon', abbr: 'Song', order: 22 },
  { osis: 'Isa', name: 'Isaiah', abbr: 'Isa', order: 23 },
  { osis: 'Jer', name: 'Jeremiah', abbr: 'Jer', order: 24 },
  { osis: 'Lam', name: 'Lamentations', abbr: 'Lam', order: 25 },
  { osis: 'Ezek', name: 'Ezekiel', abbr: 'Ezek', order: 26 },
  { osis: 'Dan', name: 'Daniel', abbr: 'Dan', order: 27 },
  { osis: 'Hos', name: 'Hosea', abbr: 'Hos', order: 28 },
  { osis: 'Joel', name: 'Joel', abbr: 'Joel', order: 29 },
  { osis: 'Amos', name: 'Amos', abbr: 'Amos', order: 30 },
  { osis: 'Obad', name: 'Obadiah', abbr: 'Obad', order: 31 },
  { osis: 'Jonah', name: 'Jonah', abbr: 'Jonah', order: 32 },
  { osis: 'Mic', name: 'Micah', abbr: 'Mic', order: 33 },
  { osis: 'Nah', name: 'Nahum', abbr: 'Nah', order: 34 },
  { osis: 'Hab', name: 'Habakkuk', abbr: 'Hab', order: 35 },
  { osis: 'Zeph', name: 'Zephaniah', abbr: 'Zeph', order: 36 },
  { osis: 'Hag', name: 'Haggai', abbr: 'Hag', order: 37 },
  { osis: 'Zech', name: 'Zechariah', abbr: 'Zech', order: 38 },
  { osis: 'Mal', name: 'Malachi', abbr: 'Mal', order: 39 },
]

function hebrewStrongFromLemma(lemma) {
  const m = lemma.match(/(\d{1,4})/)
  if (!m) return null
  const n = parseInt(m[1], 10)
  if (!n) return null
  return 'H' + n
}

async function buildHebrew() {
  console.log('\n[2/4] Hebrew Old Testament (WLC)')
  const books = []
  const verseRe = /<verse osisID="([^"]+)">([\s\S]*?)<\/verse>/g
  const wordRe = /<w\s+([^>]*)>([^<]*)<\/w>/g
  const attrRe = /(lemma|morph)="([^"]*)"/g

  let totalVerses = 0
  let totalWords = 0

  for (const b of WLC_BOOKS) {
    const xml = await fetchText(
      `${BASE}/openscriptures/morphhb/master/wlc/${b.osis}.xml`,
      join(RAW, `wlc-${b.osis}.xml`)
    )
    const verses = []
    let m
    while ((m = verseRe.exec(xml))) {
      const osisId = m[1] // e.g. Gen.1.1
      const parts = osisId.split('.')
      const chapter = parseInt(parts[1], 10)
      const verse = parseInt(parts[2], 10)
      const body = m[2]
      const words = []
      let wm
      let wordOrder = 0
      while ((wm = wordRe.exec(body))) {
        const attrs = wm[1]
        const text = wm[2]
        let lemma = null
        let morph = null
        let am
        const ar = new RegExp(attrRe)
        while ((am = ar.exec(attrs))) {
          if (am[1] === 'lemma') lemma = am[2]
          if (am[1] === 'morph') morph = am[2]
        }
        if (!text) continue
        const strong = lemma ? hebrewStrongFromLemma(lemma) : null
        wordOrder++
        words.push({
          wordOrder,
          hebrewGreek: text,
          strongNumber: strong,
          parsing: morph || null,
        })
      }
      if (words.length === 0) continue
      verses.push({
        chapter,
        verse,
        text: words.map((w) => w.hebrewGreek).join(' '),
        words,
      })
      totalVerses++
      totalWords += words.length
    }
    books.push({
      name: b.name,
      abbreviation: b.abbr,
      testament: 'OLD',
      bookOrder: b.order,
      chapters: verses.reduce((mx, v) => Math.max(mx, v.chapter), 0),
      verses,
    })
    process.stdout.write(`  ✓ ${b.name} (${verses.length} verses)\n`)
  }
  writeFileSync(join(DATA, 'hebrew.json'), JSON.stringify(books))
  console.log(`  ✓ Hebrew OT: ${totalVerses} verses, ${totalWords} words`)
  return books
}

/* ------------------------------------------------------------------ */
/*  Greek New Testament (SBLGNT)                                      */
/* ------------------------------------------------------------------ */

const GNT_BOOKS = [
  { file: '61-Mt', name: 'Matthew', abbr: 'Matt', order: 40 },
  { file: '62-Mk', name: 'Mark', abbr: 'Mark', order: 41 },
  { file: '63-Lk', name: 'Luke', abbr: 'Luke', order: 42 },
  { file: '64-Jn', name: 'John', abbr: 'John', order: 43 },
  { file: '65-Ac', name: 'Acts', abbr: 'Acts', order: 44 },
  { file: '66-Ro', name: 'Romans', abbr: 'Rom', order: 45 },
  { file: '67-1Co', name: '1 Corinthians', abbr: '1Cor', order: 46 },
  { file: '68-2Co', name: '2 Corinthians', abbr: '2Cor', order: 47 },
  { file: '69-Ga', name: 'Galatians', abbr: 'Gal', order: 48 },
  { file: '70-Eph', name: 'Ephesians', abbr: 'Eph', order: 49 },
  { file: '71-Php', name: 'Philippians', abbr: 'Phil', order: 50 },
  { file: '72-Col', name: 'Colossians', abbr: 'Col', order: 51 },
  { file: '73-1Th', name: '1 Thessalonians', abbr: '1Th', order: 52 },
  { file: '74-2Th', name: '2 Thessalonians', abbr: '2Th', order: 53 },
  { file: '75-1Ti', name: '1 Timothy', abbr: '1Tim', order: 54 },
  { file: '76-2Ti', name: '2 Timothy', abbr: '2Tim', order: 55 },
  { file: '77-Tit', name: 'Titus', abbr: 'Titus', order: 56 },
  { file: '78-Phm', name: 'Philemon', abbr: 'Phlm', order: 57 },
  { file: '79-Heb', name: 'Hebrews', abbr: 'Heb', order: 58 },
  { file: '80-Jas', name: 'James', abbr: 'Jas', order: 59 },
  { file: '81-1Pe', name: '1 Peter', abbr: '1Pet', order: 60 },
  { file: '82-2Pe', name: '2 Peter', abbr: '2Pet', order: 61 },
  { file: '83-1Jn', name: '1 John', abbr: '1John', order: 62 },
  { file: '84-2Jn', name: '2 John', abbr: '2John', order: 63 },
  { file: '85-3Jn', name: '3 John', abbr: '3John', order: 64 },
  { file: '86-Jud', name: 'Jude', abbr: 'Jude', order: 65 },
  { file: '87-Re', name: 'Revelation', abbr: 'Rev', order: 66 },
]

async function buildGreek(greekLemmaMap) {
  console.log('\n[3/4] Greek New Testament (SBLGNT)')
  const books = []
  let totalVerses = 0
  let totalWords = 0
  let linked = 0

  for (const b of GNT_BOOKS) {
    const txt = await fetchText(
      `${BASE}/morphgnt/sblgnt/master/${b.file}-morphgnt.txt`,
      join(RAW, `${b.file}.txt`)
    )
    const lines = txt.split('\n')
    const verseMap = new Map()
    for (const line of lines) {
      const t = line.trim()
      if (!t) continue
      const tk = t.split(/\s+/)
      if (tk.length < 7) continue
      const ref = tk[0]
      if (!/^\d{6}$/.test(ref)) continue
      const chapter = parseInt(ref.slice(2, 4), 10)
      const verse = parseInt(ref.slice(4, 6), 10)
      const word = tk[4] // punctuation-stripped Greek word
      const lemma = tk[6]
      const parsing = tk[2]
      if (!word || !/[α-ωΑ-Ω]/.test(word)) continue
      const strong =
        lemma ? greekLemmaMap.get(normalizeGreek(lemma)) || greekLemmaMap.get(normalizeGreek(word)) || null : null
      if (strong) linked++
      const key = `${chapter}.${verse}`
      if (!verseMap.has(key)) verseMap.set(key, { chapter, verse, words: [] })
      const vm = verseMap.get(key)
      vm.words.push({
        wordOrder: vm.words.length + 1,
        hebrewGreek: word,
        strongNumber: strong,
        parsing: parsing || null,
      })
    }
    const verses = [...verseMap.values()].sort(
      (a, b) => a.chapter - b.chapter || a.verse - b.verse
    )
    for (const v of verses) v.text = v.words.map((w) => w.hebrewGreek).join(' ')
    books.push({
      name: b.name,
      abbreviation: b.abbr,
      testament: 'NEW',
      bookOrder: b.order,
      chapters: verses.reduce((mx, v) => Math.max(mx, v.chapter), 0),
      verses,
    })
    totalVerses += verses.length
    for (const v of verses) totalWords += v.words.length
    process.stdout.write(`  ✓ ${b.name} (${verses.length} verses)\n`)
  }
  writeFileSync(join(DATA, 'greek.json'), JSON.stringify(books))
  console.log(
    `  ✓ Greek NT: ${totalVerses} verses, ${totalWords} words (${linked} linked to Strong's)`
  )
  return books
}

/* ------------------------------------------------------------------ */
/*  Morphology aggregation                                            */
/* ------------------------------------------------------------------ */

const TENSE = new Set(['P', 'I', 'F', 'A', 'X', 'Y', 'W'])
const VOICE = new Set(['A', 'M', 'P', 'D', 'X'])
const MOOD = new Set(['I', 'S', 'O', 'M', 'N', 'P'])
const CASE = new Set(['N', 'G', 'D', 'A', 'V'])
const NUMBER = new Set(['S', 'P', 'D'])
const GENDER = new Set(['M', 'F', 'N'])
const PERSON = new Set(['1', '2', '3'])

// Position-based parse of a Robinson / OSHB-style morphology code.
// v1..v8 are the 8 structural characters of the code.
function parseMorph(code) {
  if (!code) return {}
  const c = code.padEnd(8, '-').slice(0, 8)
  const out = {}
  if (PERSON.has(c[0])) out.person = c[0]
  if (TENSE.has(c[1])) out.tense = c[1]
  if (VOICE.has(c[2])) out.voice = c[2]
  if (MOOD.has(c[3])) out.mood = c[3]
  if (CASE.has(c[4])) out.case = c[4]
  if (NUMBER.has(c[5])) out.number = c[5]
  if (GENDER.has(c[6])) out.gender = c[6]
  return out
}

const TENSE_ENUM = { P: 'PRESENT', I: 'IMPERFECT', F: 'FUTURE', A: 'AORIST', X: 'PERFECT', Y: 'PLUPERFECT', W: 'FUTURE_PERFECT' }
const VOICE_ENUM = { A: 'ACTIVE', M: 'MIDDLE', P: 'PASSIVE', D: 'MIDDLE_PASSIVE', X: 'MIDDLE_PASSIVE' }
const MOOD_ENUM = { I: 'INDICATIVE', S: 'SUBJUNCTIVE', O: 'OPTATIVE', M: 'IMPERATIVE', N: 'INFINITIVE', P: 'PARTICIPLE' }
const CASE_ENUM = { N: 'NOMINATIVE', G: 'GENITIVE', D: 'DATIVE', A: 'ACCUSATIVE', V: 'VOCATIVE' }
const NUMBER_ENUM = { S: 'SINGULAR', P: 'PLURAL', D: 'DUAL' }
const GENDER_ENUM = { M: 'MASCULINE', F: 'FEMININE', N: 'NEUTER' }
const PERSON_ENUM = { '1': 'FIRST', '2': 'SECOND', '3': 'THIRD' }

function morphToEnums(code) {
  const p = parseMorph(code)
  const e = {}
  if (p.tense) e.tense = TENSE_ENUM[p.tense]
  if (p.voice) e.voice = VOICE_ENUM[p.voice]
  if (p.mood) e.mood = MOOD_ENUM[p.mood]
  if (p.case) e.case = CASE_ENUM[p.case]
  if (p.number) e.number = NUMBER_ENUM[p.number]
  if (p.gender) e.gender = GENDER_ENUM[p.gender]
  if (p.person) e.person = PERSON_ENUM[p.person]
  return e
}

function buildMorphology(books) {
  console.log('\n[4/4] Morphology aggregation')
  const groups = new Map()
  let count = 0
  for (const book of books) {
    for (const v of book.verses) {
      for (const w of v.words) {
        if (!w.strongNumber || !w.parsing) continue
        const key = `${w.strongNumber}|${w.parsing}`
        if (!groups.has(key)) groups.set(key, { strong: w.strongNumber, parsing: w.parsing, count: 0 })
        groups.get(key).count++
        count++
      }
    }
  }
  const morphology = []
  for (const g of groups.values()) {
    const enums = morphToEnums(g.parsing)
    morphology.push({ ...g, ...enums })
  }
  writeFileSync(join(DATA, 'morphology.json'), JSON.stringify(morphology))
  console.log(`  ✓ ${morphology.length} distinct parsing forms across ${count} word instances`)
  return morphology
}

/* ------------------------------------------------------------------ */

async function main() {
  console.log('BibleLex — preparing data from public-domain sources')
  const { greekLemmaMap } = await buildStrongs()
  const hebrew = await buildHebrew()
  const greek = await buildGreek(greekLemmaMap)
  buildMorphology([...hebrew, ...greek])
  console.log('\n✓ All data prepared in ./data')
  console.log('  Next: npm run import:data')
}

main().catch((e) => {
  console.error('\n✗ Preparation failed:', e.message)
  process.exit(1)
})
