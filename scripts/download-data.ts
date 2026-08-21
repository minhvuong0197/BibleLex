#!/usr/bin/env tsx
/**
 * Script to download and prepare BibleLex data from public domain sources
 * 
 * Sources:
 * - Strong's Concordance: https://github.com/openscriptures/strongs
 * - Thayer's Greek Lexicon: Public domain
 * - BDB Hebrew Lexicon: Public domain  
 * - LSJ: Public domain
 * - Morphology: OpenText.org, ETCBC
 * - Cross-references: Treasury of Scripture Knowledge (TSK)
 * - Topical: Nave's Topical Bible, Torrey's Topical Textbook
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

const DATA_DIR = join(process.cwd(), 'data')

const SOURCES = {
  strongs: {
    url: 'https://raw.githubusercontent.com/openscriptures/strongs/master/strongs.json',
    description: 'Strong\'s Concordance with Hebrew/Greek definitions'
  },
  kjv: {
    url: 'https://raw.githubusercontent.com/openscriptures/kjv/master/kjv.json',
    description: 'King James Version text'
  },
  morphology: {
    url: 'https://raw.githubusercontent.com/openscriptures/morphology/master/morphology.json',
    description: 'Morphological parsing data'
  }
}

async function downloadFile(url: string, filename: string): Promise<void> {
  console.log(`Downloading ${filename}...`)
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    const data = await response.text()
    writeFileSync(join(DATA_DIR, filename), data)
    console.log(`✓ Saved ${filename}`)
  } catch (error) {
    console.error(`✗ Failed to download ${filename}:`, error)
  }
}

async function main() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true })
  }

  console.log('Downloading BibleLex data sources...\n')

  await Promise.all([
    downloadFile(SOURCES.strongs.url, 'strongs.json'),
    downloadFile(SOURCES.kjv.url, 'kjv.json'),
    downloadFile(SOURCES.morphology.url, 'morphology.json')
  ])

  console.log('\nDownload complete!')
  console.log('Next step: Run `npm run import:data` to import into database')
}

main().catch(console.error)