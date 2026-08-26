import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseBriefLexicon } from './prepare-data.mjs'

const HEBREW_SAMPLE = [
  'eStrong#\tdStrong\tuStrong\tHebrew\tTransliteration\tMorph\tGloss\tMeaning',
  'H0001\tH0001G =\tH0001G\tאָב\tav\tH:N-M\tfather\t1) father of an individual<br>2) of God as father',
  'H0001\tH0001G =\tH0001G\tאָב\tav\tH:N-M\t(Huram)-abi\tsome extended form we should ignore',
  'H0002\tH0002G =\tH0002G\tאָב\tav\tH:N-M\tfather\tsecond entry meaning',
].join('\n')

const GREEK_SAMPLE = [
  'eStrong\tdStrong\tuStrong\tGreek\tTransliteration\tMorph\tGloss\tAbbott-Smith lexicon (AS)',
  'G0026\tG0026G =\tG0026G\tἀγάπη\tagapē\tG:N-F\tlove\t<b>ἀγάπη</b>, -ης, ἡ, <BR /> <b>love</b>: of mutual love',
  'G5625\tG5625G =\tG5625G\tζωή\tzōē\tG:N-F\tlife\textended we ignore',
].join('\n')

test('parseBriefLexicon: Hebrew maps canonical number, skips extended rows', () => {
  const map = parseBriefLexicon(HEBREW_SAMPLE, 'H')
  assert.match(map.get('H1'), /father of an individual/)
  assert.equal(map.get('H2'), 'second entry meaning')
  assert.equal(map.has('H0001G'), false, 'extended forms must be skipped')
})

test('parseBriefLexicon: Greek maps canonical number and strips HTML', () => {
  const map = parseBriefLexicon(GREEK_SAMPLE, 'G')
  assert.match(map.get('G26'), /love/)
  assert.doesNotMatch(map.get('G26'), /<b>/, 'HTML tags must be stripped')
  assert.doesNotMatch(map.get('G26'), /<BR/i, 'BR tags must be stripped')
  assert.equal(map.has('G5625G'), false, 'extended forms must be skipped')
})

test('parseBriefLexicon: ignores description lines that merely mention eStrong', () => {
  const doclike = 'eStrong#\tThis is the standard Extended Strongs which conforms...\n' + GREEK_SAMPLE
  const map = parseBriefLexicon(doclike, 'G')
  assert.match(map.get('G26'), /love/)
})
