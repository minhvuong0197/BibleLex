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
 *  - LSJ Greek lexicon (brief) ................ STEPBible/STEPBible-Data
 *  - BDB (Hebrew) & Thayer's (Greek) brief ..... STEPBible/STEPBible-Data (CC BY)
 *
 * Output (into ./data):
 *  - strongs.json      [{ strong, lang, word, translit, pronunciation, derivation, definition, kjv_def }]
 *  - hebrew.json       [{ name, abbreviation, testament, bookOrder, chapters, verses:[{chapter,verse,text,words}] }]
 *  - greek.json        same shape, New Testament
 *  - morphology.json   [{ strong, parsing, count, tense?, voice?, mood?, case?, number?, person?, gender? }]
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

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
      // bdbDef is filled later from the STEPBible Brief (BDB) lexicon in
      // buildBriefLexicons(); do NOT copy strongs_def here (mislabeled).
      bdbDef: '',
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
      // thayersDef is filled later from the STEPBible Brief (Thayer's) lexicon
      // in buildBriefLexicons(); do NOT copy strongs_def here (mislabeled).
      thayersDef: '',
      kjv_def: v.kjv_def || null,
    })
  }
  writeFileSync(join(DATA, 'strongs.json'), JSON.stringify(strongs))
  console.log(`  ✓ ${strongs.length} Strong's entries (${hebrewDict.__count || ''}H / G)`)

  // Build a Greek lemma -> strongNumber map for interlinear linking.
  const greekLemmaMap = new Map()
  const greekLemmaMapCollapsed = new Map()
  const collapsedCollision = new Set()
  for (const [k, v] of Object.entries(greekDict)) {
    if (!v.lemma) continue
    const normKey = normalizeGreek(v.lemma)
    if (normKey && !greekLemmaMap.has(normKey)) greekLemmaMap.set(normKey, k.toUpperCase())
    // Fallback for lemmas whose dictionary form diverges from the SBLGNT
    // lemma only by the β/υ transliteration used for Hebrew proper names
    // (e.g. dictionary "Δαβίδ" vs SBLGNT "Δαυίδ" → G1138 = David).
    const cKey = normKey.replace(/[βυ]/g, 'B')
    if (cKey) {
      if (greekLemmaMapCollapsed.has(cKey) && greekLemmaMapCollapsed.get(cKey) !== k.toUpperCase()) {
        collapsedCollision.add(cKey)
      } else {
        greekLemmaMapCollapsed.set(cKey, k.toUpperCase())
      }
    }
  }
  return { strongs, greekLemmaMap, greekLemmaMapCollapsed, collapsedCollision }
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

function stripHtml(s) {
  return String(s)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/?[a-zA-Z][^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#?[\w]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const LSJ_URLS = [
  'https://raw.githubusercontent.com/STEPBible/STEPBible-Data/master/Lexicons/TFLSJ%20%200-5624%20-%20Translators%20Formatted%20full%20LSJ%20Bible%20lexicon%20-%20STEPBible.org%20CC%20BY.txt',
  'https://raw.githubusercontent.com/STEPBible/STEPBible-Data/master/Lexicons/TFLSJ%20extra%20-%20Translators%20Formatted%20full%20LSJ%20Bible%20lexicon%20-%20STEPBible.org%20CC%20BY.txt',
]

async function buildLsj() {
  console.log('\n[1b/4] LSJ (Liddell-Scott-Jones) lexicon — public domain (STEPBible)')
  const lsjMap = new Map()
  for (let i = 0; i < LSJ_URLS.length; i++) {
    const txt = await fetchText(LSJ_URLS[i], join(RAW, `tflsj-${i}.txt`))
    const lines = txt.split(/\r?\n/)
    let colIdx = -1
    for (const line of lines) {
      if (colIdx < 0) {
        if (line.includes('eStrong') && line.includes('LSJ Meaning')) {
          const hdr = line.split('\t')
          colIdx = hdr.findIndex((h) => /LSJ Meaning/i.test(h))
        }
        continue
      }
      if (!line.trim()) continue
      const parts = line.split('\t')
      const key = parts[0]
      if (!/^G\d/i.test(key)) continue
      const num = parseInt(key.replace(/[^0-9]/g, ''), 10)
      if (!num) continue
      const def = parts.slice(colIdx).join(' ')
      const clean = stripHtml(def)
      if (clean) lsjMap.set('G' + num, clean)
    }
  }
  const path = join(DATA, 'strongs.json')
  const strongs = JSON.parse(readFileSync(path, 'utf-8'))
  let n = 0
  for (const e of strongs) {
    if (e.lang === 'G' && lsjMap.has(e.strong)) {
      e.lsjDef = lsjMap.get(e.strong)
      n++
    }
  }
  writeFileSync(path, JSON.stringify(strongs))
  console.log(`  ✓ ${n} mục tiếng Hy Lạp được gắn định nghĩa LSJ`)
}

/**
 * Parse a STEPBible "Brief" lexicon file (TBESH / TBESG) into a map of
 * canonical Strong number -> cleaned definition text.
 *
 * The files are tab-separated; the header row starts with `eStrong` and
 * contains `Gloss` + `Transliteration`. The definition lives in the LAST
 * column (Hebrew: "Meaning"; Greek: the Abbott-Smith lexicon text).
 *
 * `lang` is 'H' or 'G'. Only canonical entries (e.g. `H1`, `G26`) are kept;
 * extended forms (e.g. `H0001G`) are skipped so each number maps to one
 * primary entry.
 */
export function parseBriefLexicon(text, lang) {
  const map = new Map()
  const lines = String(text).split(/\r?\n/)
  let started = false
  for (const line of lines) {
    if (!started) {
      if (/^eStrong#?\t/.test(line) && /Gloss/.test(line) && /Transliteration/.test(line)) {
        started = true
      }
      continue
    }
    if (!line.trim()) continue
    const parts = line.split('\t')
    const es = (parts[0] || '').trim()
    const m = es.match(/^([HG])(\d+)/)
    if (!m || m[1] !== lang) continue
    const key = m[1] + parseInt(m[2], 10)
    if (map.has(key)) continue
    const meaning = parts[parts.length - 1] || ''
    const clean = stripHtml(meaning).replace(/\s+/g, ' ').trim()
    if (clean) map.set(key, clean)
  }
  return map
}

const BRIEF_LEXICON_URLS = {
  H: 'https://raw.githubusercontent.com/STEPBible/STEPBible-Data/master/Lexicons/TBESH%20-%20Translators%20Brief%20lexicon%20of%20Extended%20Strongs%20for%20Hebrew%20-%20STEPBible.org%20CC%20BY.txt',
  G: 'https://raw.githubusercontent.com/STEPBible/STEPBible-Data/master/Lexicons/TBESG%20-%20Translators%20Brief%20lexicon%20of%20Extended%20Strongs%20for%20Greek%20-%20STEPBible.org%20CC%20BY.txt',
}

async function buildBriefLexicons() {
  console.log('\n[1c/4] Brief lexicons — BDB (Hebrew) & Thayer\'s (Greek) from STEPBible (CC BY)')
  const path = join(DATA, 'strongs.json')
  const strongs = JSON.parse(readFileSync(path, 'utf-8'))
  let hN = 0
  let gN = 0
  for (const lang of ['H', 'G']) {
    const txt = await fetchText(BRIEF_LEXICON_URLS[lang], join(RAW, `brief-${lang}.txt`))
    const map = parseBriefLexicon(txt, lang)
    for (const e of strongs) {
      if (e.lang !== lang) continue
      const def = map.get(e.strong)
      if (!def) continue
      if (lang === 'H') {
        e.bdbDef = def
        hN++
      } else {
        e.thayersDef = def
        gN++
      }
    }
  }
  writeFileSync(path, JSON.stringify(strongs))
  console.log(`  ✓ ${hN} Hebrew (BDB brief), ${gN} Greek (Thayer's brief) filled`)
}

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

async function buildGreek(greekLemmaMap, greekLemmaMapCollapsed, collapsedCollision) {
  console.log('\n[3/4] Greek New Testament (SBLGNT)')
  const books = []
  let totalVerses = 0
  let totalWords = 0
  let linked = 0

  // Resolve a Greek lemma/word to a Strong number, with a β/υ-transliteration
  // fallback for Hebrew proper names (e.g. David: SBLGNT "Δαυίδ" vs dict "Δαβίδ").
  const collapsed = (s) => {
    const c = normalizeGreek(s).replace(/[βυ]/g, 'B')
    return collapsedCollision.has(c) ? undefined : greekLemmaMapCollapsed.get(c)
  }
  const resolve = (lemma, word) => {
    const nLemma = lemma ? normalizeGreek(lemma) : null
    const nWord = normalizeGreek(word)
    return (
      (nLemma && greekLemmaMap.get(nLemma)) ||
      greekLemmaMap.get(nWord) ||
      (nLemma && collapsed(lemma)) ||
      collapsed(word) ||
      null
    )
  }

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
      const strong = lemma ? resolve(lemma, word) : resolve(word, word)
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

/* ------------------------------------------------------------------ */
/*  Vietnamese Bible (Kinh Thánh 1934 — public domain)                 */
/* ------------------------------------------------------------------ */

const VI_BOOK_ALIASES = {
  gen: 'Genesis', exod: 'Exodus', lev: 'Leviticus', num: 'Numbers', deut: 'Deuteronomy',
  josh: 'Joshua', judg: 'Judges', ruth: 'Ruth', '1sam': '1 Samuel', '2sam': '2 Samuel',
  '1kgs': '1 Kings', '2kgs': '2 Kings', '1chr': '1 Chronicles', '2chr': '2 Chronicles',
  ezra: 'Ezra', neh: 'Nehemiah', esth: 'Esther', job: 'Job', ps: 'Psalms', psa: 'Psalms',
  prov: 'Proverbs', eccl: 'Ecclesiastes', song: 'Song of Solomon', isa: 'Isaiah',
  jer: 'Jeremiah', lam: 'Lamentations', ezek: 'Ezekiel', dan: 'Daniel', hos: 'Hosea',
  joel: 'Joel', amos: 'Amos', obad: 'Obadiah', jonah: 'Jonah', mic: 'Micah',
  nah: 'Nahum', hab: 'Habakkuk', zeph: 'Zephaniah', hag: 'Haggai', zech: 'Zechariah',
  mal: 'Malachi',
  matt: 'Matthew', mar: 'Mark', mark: 'Mark', luk: 'Luke', joh: 'John', john: 'John',
  act: 'Acts', rom: 'Romans', '1cor': '1 Corinthians', '2cor': '2 Corinthians',
  gal: 'Galatians', eph: 'Ephesians', phil: 'Philippians', col: 'Colossians',
  '1th': '1 Thessalonians', '2th': '2 Thessalonians', '1tim': '1 Timothy',
  '2tim': '2 Timothy', tit: 'Titus', phlm: 'Philemon', heb: 'Hebrews', jas: 'James',
  '1pet': '1 Peter', '2pet': '2 Peter', '1joh': '1 John', '2joh': '2 John',
  '3joh': '3 John', jude: 'Jude', rev: 'Revelation',
}

const normName = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '')

async function buildVietnamese() {
  console.log('\n[5/5] Vietnamese Bible (Kinh Thánh 1934 — public domain)')
  const url = 'https://raw.githubusercontent.com/midvash/bible-data/main/versions/vi/vi1934/vi1934.json'
  let json
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    json = await res.json()
  } catch (e) {
    console.warn(`  ! Không tải được bản Việt (${e.message}). Bỏ qua bước này.`)
    writeFileSync(join(DATA, 'vietnamese.json'), JSON.stringify([]))
    return
  }

  const myBooks = [...WLC_BOOKS, ...GNT_BOOKS].map((b) => ({
    name: b.name,
    norm: normName(b.name),
  }))
  const resolveName = (raw) => {
    const n = normName(raw)
    if (VI_BOOK_ALIASES[n]) return VI_BOOK_ALIASES[n]
    const hit = myBooks.find((m) => m.norm === n)
    return hit ? hit.name : null
  }

  const books = json?.books || (Array.isArray(json) ? json : [])
  const out = []
  for (const b of books) {
    const raw = b.book || b.name
    const myName = resolveName(raw)
    if (!myName) continue
    const chapters = b.chapters || []
    for (const c of chapters) {
      const chapter = c.chapter
      const versesArr = c.verses || []
      for (const v of versesArr) {
        if (!v || !v.text) continue
        out.push({ book: myName, chapter, verse: v.number, text: String(v.text).trim() })
      }
    }
  }
  writeFileSync(join(DATA, 'vietnamese.json'), JSON.stringify(out))
  console.log(`  ✓ ${out.length} câu tiếng Việt (${myBooks.length} sách khớp)`)
}

/* ------------------------------------------------------------------ */
/*  KJV aligned interlinear (per-word English) + KJV verse text        */
/* ------------------------------------------------------------------ */

const INTERLINEAR_URL =
  'https://raw.githubusercontent.com/kennethreitz/kjvstudy.org/main/kjvstudy_org/data/interlinear.json.gz'
const KJV_TEXT_URL =
  'https://raw.githubusercontent.com/midvash/bible-data/main/versions/en/kjv/kjv.json'

async function fetchBinary(url, dest) {
  if (existsSync(dest)) return dest
  process.stdout.write(`  ↓ ${url.split('/').pop()} ... `)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  writeFileSync(dest, buf)
  process.stdout.write(`ok (${(buf.length / 1024).toFixed(0)} KB)\n`)
  return dest
}

async function buildKjvInterlinear() {
  console.log('\n[6/6] KJV aligned interlinear (per-word English) — public domain')
  const { gunzipSync } = await import('zlib')
  const path = join(RAW, 'interlinear.json.gz')
  await fetchBinary(INTERLINEAR_URL, path)
  const inter = JSON.parse(gunzipSync(readFileSync(path)).toString('utf-8'))
  const map = {}
  for (const [key, words] of Object.entries(inter)) {
    const [book, chapter, verse] = key.split(':')
    map[`${book}|${chapter}|${verse}`] = words
  }
  writeFileSync(join(DATA, 'kjv_interlinear.json'), JSON.stringify(map))
  console.log(`  ✓ ${Object.keys(map).length.toLocaleString()} verses mapped`)
}

async function buildKjvText() {
  console.log('\n[7/7] KJV 1769 verse text — public domain (midvash/bible-data)')
  const path = join(RAW, 'kjv.json')
  await fetchBinary(KJV_TEXT_URL, path)
  const json = JSON.parse(readFileSync(path, 'utf-8'))
  const out = {}
  for (const bk of json.books || []) {
    const m = {}
    for (const c of bk.chapters || []) {
      const vm = {}
      for (const v of c.verses || []) vm[v.number] = v.text
      m[c.chapter] = vm
    }
    out[bk.book] = m
  }
  writeFileSync(join(DATA, 'kjv_text.json'), JSON.stringify(out))
  console.log(`  ✓ ${Object.keys(out).length} sách KJV`)
}

async function main() {
  console.log('SCRIPTLEX — preparing data from public-domain sources')
  const { greekLemmaMap, greekLemmaMapCollapsed, collapsedCollision } = await buildStrongs()
  await buildLsj()
  await buildBriefLexicons()
  const hebrew = await buildHebrew()
  const greek = await buildGreek(greekLemmaMap, greekLemmaMapCollapsed, collapsedCollision)
  buildMorphology([...hebrew, ...greek])
  await buildVietnamese()
  await buildKjvInterlinear()
  await buildKjvText()
  console.log('\n✓ All data prepared in ./data')
  console.log('  Next: npm run import:data')
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  main().catch((e) => {
    console.error('\n✗ Preparation failed:', e.message)
    process.exit(1)
  })
}
