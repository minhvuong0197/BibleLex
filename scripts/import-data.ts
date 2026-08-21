#!/usr/bin/env tsx
/**
 * Import BibleLex data into the database.
 *
 * Consumes the JSON files produced by `scripts/prepare-data.mjs`:
 *   data/strongs.json      Strong's Hebrew + Greek dictionary entries
 *   data/hebrew.json       Hebrew OT (WLC) verses + aligned words
 *   data/greek.json        Greek NT (SBLGNT) verses + aligned words
 *   data/morphology.json   Aggregated parsing forms
 *
 * Run with: npx tsx scripts/import-data.ts
 */

import { PrismaClient } from '@prisma/client'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()
const DATA_DIR = join(process.cwd(), 'data')

interface StrongEntryInput {
  strong: string
  lang: 'H' | 'G'
  word: string
  translit: string
  pronunciation?: string | null
  derivation?: string | null
  definition: string
  kjv_def?: string | null
}

interface VerseWordInput {
  wordOrder: number
  hebrewGreek: string
  strongNumber: string | null
  parsing: string | null
}

interface VerseInput {
  chapter: number
  verse: number
  text: string
  words: VerseWordInput[]
}

interface BookInput {
  name: string
  abbreviation: string
  testament: 'OLD' | 'NEW'
  bookOrder: number
  chapters: number
  verses: VerseInput[]
}

interface MorphInput {
  strong: string
  parsing: string
  count: number
  tense?: string
  voice?: string
  mood?: string
  case?: string
  number?: string
  person?: string
  gender?: string
}

function readJSON(name: string) {
  const p = join(DATA_DIR, name)
  if (!existsSync(p)) {
    console.error(`✗ Missing ${name} — run \`npm run prepare:data\` first.`)
    process.exit(1)
  }
  return JSON.parse(readFileSync(p, 'utf-8'))
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

async function importStrongs() {
  const data = readJSON('strongs.json') as StrongEntryInput[]
  console.log(`\n[1/5] Strong's entries (${data.length})`)
  for (const c of chunk(data, 500)) {
    await prisma.$transaction(
      c.map((e) =>
        prisma.strongEntry.upsert({
          where: { strongNumber: e.strong.toUpperCase() },
          update: {
            language: e.lang === 'H' ? 'HEBREW' : 'GREEK',
            transliteration: e.translit,
            pronunciation: e.pronunciation ?? null,
            etymology: e.derivation ?? null,
            definition: e.definition,
            kjvDef: e.kjv_def ?? null,
            derivation: e.derivation ?? null,
          },
          create: {
            strongNumber: e.strong.toUpperCase(),
            language: e.lang === 'H' ? 'HEBREW' : 'GREEK',
            transliteration: e.translit,
            pronunciation: e.pronunciation ?? null,
            etymology: e.derivation ?? null,
            definition: e.definition,
            kjvDef: e.kjv_def ?? null,
            derivation: e.derivation ?? null,
          },
        })
      )
    )
  }
  console.log('  ✓ done')
}

async function importBooks() {
  const hebrew = readJSON('hebrew.json') as BookInput[]
  const greek = readJSON('greek.json') as BookInput[]
  const books = [...hebrew, ...greek]
  console.log(`\n[2/5] Books & verses (${books.length} books)`)

  for (const b of books) {
    const book = await prisma.bibleBook.upsert({
      where: { name: b.name },
      update: { abbreviation: b.abbreviation, testament: b.testament, bookOrder: b.bookOrder, chapters: b.chapters },
      create: { name: b.name, abbreviation: b.abbreviation, testament: b.testament, bookOrder: b.bookOrder, chapters: b.chapters },
    })

    for (const c of chunk(b.verses, 200)) {
      await prisma.$transaction(
        c.map((v) =>
          prisma.verse.upsert({
            where: { bookId_chapter_verse: { bookId: book.id, chapter: v.chapter, verse: v.verse } },
            update: { text: v.text },
            create: { bookId: book.id, chapter: v.chapter, verse: v.verse, text: v.text },
          })
        )
      )
    }
  }
  console.log('  ✓ done')
}

async function importVerseWords() {
  const hebrew = readJSON('hebrew.json') as BookInput[]
  const greek = readJSON('greek.json') as BookInput[]
  const books = [...hebrew, ...greek]

  // All strong numbers actually referenced by the text must exist as rows so
  // the (optional) foreign key resolves. Create lightweight stubs for any
  // referenced number that is missing from the dictionary.
  const referenced = new Set<string>()
  for (const b of books)
    for (const v of b.verses)
      for (const w of v.words) if (w.strongNumber) referenced.add(w.strongNumber)

  const existing = new Set(
    (await prisma.strongEntry.findMany({ select: { strongNumber: true } })).map((s) => s.strongNumber)
  )
  const missing = [...referenced].filter((s) => !existing.has(s))
  if (missing.length) {
    console.log(`\n[3/5] Verse words — creating ${missing.length} stub Strong entries for referenced numbers`)
    for (const c of chunk(missing, 500)) {
      await prisma.$transaction(
        c.map((s) =>
          prisma.strongEntry.create({
            data: {
              strongNumber: s,
              language: s.startsWith('H') ? 'HEBREW' : 'GREEK',
              transliteration: '',
              definition: '(tham chiếu từ nguyên ngữ – không có trong từ điển Strong\'s cơ sở)',
            },
          })
        )
      )
    }
  }

  console.log('\n[3/5] Verse words')
  let total = 0
  for (const b of books) {
    const book = await prisma.bibleBook.findFirst({ where: { name: b.name } })
    if (!book) continue
    const strongMap = new Map(
      (await prisma.strongEntry.findMany({ select: { strongNumber: true, transliteration: true, kjvDef: true } }))
        .map((s) => [s.strongNumber, s])
    )

    const rows: any[] = []
    for (const v of b.verses) {
      for (const w of v.words) {
        const se = w.strongNumber ? strongMap.get(w.strongNumber) : undefined
        const kjvGloss = se?.kjvDef?.split(',')[0]?.trim() || null
        rows.push({
          book: b.name,
          chapter: v.chapter,
          verse: v.verse,
          wordOrder: w.wordOrder,
          hebrewGreek: w.hebrewGreek,
          transliteration: se?.transliteration || '',
          strongNumber: w.strongNumber,
          parsing: w.parsing,
          english: kjvGloss,
        })
      }
    }
    for (const c of chunk(rows, 500)) {
      await prisma.verseWord.createMany({ data: c })
    }
    total += rows.length
  }
  console.log(`  ✓ ${total.toLocaleString()} verse words`)
}

async function importMorphology() {
  const data = readJSON('morphology.json') as MorphInput[]
  console.log(`\n[4/5] Morphology (${data.length})`)
  const existing = new Set(
    (await prisma.strongEntry.findMany({ select: { strongNumber: true } })).map((s) => s.strongNumber)
  )
  const rows = data
    .filter((m) => existing.has(m.strong))
    .map((m) => ({
      strongNumber: m.strong,
      parsings: m.parsing,
      count: m.count,
      tense: (m.tense as any) || null,
      voice: (m.voice as any) || null,
      mood: (m.mood as any) || null,
      case_: (m.case as any) || null,
      number: (m.number as any) || null,
      person: (m.person as any) || null,
      gender: (m.gender as any) || null,
    }))
  for (const c of chunk(rows, 500)) {
    await prisma.morphology.createMany({ data: c })
  }
  console.log('  ✓ done')
}

async function importCrossReferences() {
  console.log('\n[5/5] Cross-references (from derivation / etymology)')
  const entries = await prisma.strongEntry.findMany({
    where: { OR: [{ derivation: { not: null } }, { etymology: { not: null } }] },
    select: { strongNumber: true, derivation: true, etymology: true },
  })
  const existing = new Set(
    (await prisma.strongEntry.findMany({ select: { strongNumber: true } })).map((s) => s.strongNumber)
  )
  const rows: any[] = []
  for (const e of entries) {
    const text = `${e.derivation || ''} ${e.etymology || ''}`
    const refs = text.match(/[GH]\d+/g) || []
    const seen = new Set<string>()
    for (const r of refs) {
      const target = r.toUpperCase()
      if (target === e.strongNumber || seen.has(target) || !existing.has(target)) continue
      seen.add(target)
      rows.push({ sourceStrong: e.strongNumber, targetStrong: target, type: 'DERIVATIVE' })
    }
  }
  for (const c of chunk(rows, 500)) {
    await prisma.crossReference.createMany({ data: c })
  }
  console.log(`  ✓ ${rows.length.toLocaleString()} cross-references`)
}

async function importTopicalData() {
  console.log('\n[6/6] Topical entries (from Strong\'s word groups)')
  const topics: { topic: string; description: string; refs: string[] }[] = [
    { topic: 'Tình yêu (Love)', description: 'Tình yêu thần thánh và nhân loại trong Kinh Thánh', refs: ['G26', 'G5368', 'H157', 'H160'] },
    { topic: 'Đức tin (Faith)', description: 'Sự tin tưởng và trung tín đối với Đức Chúa Trời', refs: ['G4102', 'G4100', 'H539', 'H530'] },
    { topic: 'Ơn cứu rỗi (Salvation)', description: 'Sự giải cứu, chuộc lại và cứu rỗi', refs: ['G4991', 'G4982', 'H3444', 'H3467'] },
    { topic: 'Đức Thánh Linh (Holy Spirit)', description: 'Ngôi thứ ba và sự thánh khiết', refs: ['G4151', 'G40', 'H7307', 'H6944'] },
    { topic: 'Sự tha thứ (Forgiveness)', description: 'Sự tha thứ tội và ban ơn', refs: ['G859', 'G5483', 'H5545', 'H5375'] },
    { topic: 'Hy vọng (Hope)', description: 'Sự trông cậy và kỳ vọng vững chắc', refs: ['G1680', 'G1679', 'H3176', 'H4009'] },
    { topic: 'Nước Đức Chúa Trời (Kingdom)', description: 'Vương quyền và nước của Đức Chúa Trời', refs: ['G932', 'G932', 'H4438', 'H4467'] },
    { topic: 'Sự sống đời đời (Eternal Life)', description: 'Sự sống thuộc linh đời đời', refs: ['G2222', 'G166', 'H2416'] },
  ]

  let totalRefs = 0
  for (const t of topics) {
    const entry = await prisma.topicalEntry.upsert({
      where: { topic: t.topic },
      update: { description: t.description },
      create: { topic: t.topic, description: t.description },
    })

    const words = await prisma.verseWord.findMany({
      where: { strongNumber: { in: t.refs } },
      select: { book: true, chapter: true, verse: true },
      take: 300,
    })
    const seen = new Set<string>()
    const refs = []
    for (const w of words) {
      const key = `${w.book}-${w.chapter}-${w.verse}`
      if (seen.has(key)) continue
      seen.add(key)
      refs.push({ topicId: entry.id, book: w.book, chapter: w.chapter, verseStart: w.verse })
      if (refs.length >= 25) break
    }
    if (refs.length) {
      await prisma.topicalReference.createMany({ data: refs })
      totalRefs += refs.length
    }
  }
  console.log(`  ✓ ${topics.length} topics, ${totalRefs} references`)
}

async function main() {
  console.log('BibleLex — importing data into the database')
  console.log('Clearing previous data (idempotent import)...')
  await prisma.crossReference.deleteMany()
  await prisma.morphology.deleteMany()
  await prisma.verseWord.deleteMany()
  await prisma.verse.deleteMany()
  await prisma.bibleBook.deleteMany()
  await prisma.topicalReference.deleteMany()
  await prisma.topicalEntry.deleteMany()
  await prisma.strongEntry.deleteMany()
  await importStrongs()
  await importBooks()
  await importVerseWords()
  await importMorphology()
  await importCrossReferences()
  await importTopicalData()

  const stats = await Promise.all([
    prisma.strongEntry.count(),
    prisma.verse.count(),
    prisma.bibleBook.count(),
    prisma.verseWord.count(),
    prisma.morphology.count(),
    prisma.crossReference.count(),
  ])
  console.log('\n✓ Import complete\n')
  console.log('  Strong entries :', stats[0].toLocaleString())
  console.log('  Books         :', stats[1] !== undefined ? stats[2].toLocaleString() : 0)
  console.log('  Verses        :', stats[1].toLocaleString())
  console.log('  Verse words   :', stats[3].toLocaleString())
  console.log('  Morphology    :', stats[4].toLocaleString())
  console.log('  Cross-refs    :', stats[5].toLocaleString())
}

main()
  .catch((e) => {
    console.error('\n✗ Import failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
