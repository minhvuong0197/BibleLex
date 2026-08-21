import type { StrongEntry, Morphology, VerseWord, CrossReference, BibleBook, Verse, TopicalEntry, TopicalReference } from '@prisma/client'

export type Language = 'HEBREW' | 'GREEK'
export type Testament = 'OLD' | 'NEW'

export interface StrongEntryWithRelations extends StrongEntry {
  morphology?: Morphology[]
  crossRefs?: (CrossReference & { targetEntry: StrongEntry })[]
  crossRefTargets?: (CrossReference & { sourceEntry: StrongEntry })[]
}

export interface InterlinearWord {
  book: string
  chapter: number
  verse: number
  wordOrder: number
  hebrewGreek: string
  transliteration: string
  strongNumber: string
  parsing?: string | null
  english?: string | null
  strongEntry?: StrongEntry
  morphology?: Morphology
}

export interface InterlinearVerse {
  book: string
  chapter: number
  verse: number
  text: string
  words: InterlinearWord[]
}

export interface BibleBookWithVerses extends BibleBook {
  verses?: Verse[]
}

export interface SearchResult {
  type: 'strong' | 'verse' | 'topic'
  id: string
  title: string
  snippet: string
  data: StrongEntry | Verse | TopicalEntry
}

export interface MorphologyBreakdown {
  tense?: string
  voice?: string
  mood?: string
  case?: string
  number?: string
  person?: string
  gender?: string
  parsing: string
  count: number
}

export interface WordStudyData {
  entry: StrongEntryWithRelations
  morphologyBreakdown: MorphologyBreakdown[]
  verseCount: number
  books: string[]
  firstOccurrence: { book: string; chapter: number; verse: number } | null
  lastOccurrence: { book: string; chapter: number; verse: number } | null
  relatedWords: (CrossReference & { targetEntry: StrongEntry })[]
  semanticDomain?: string
}

export interface CrossReferenceData {
  source: StrongEntry
  references: (CrossReference & { targetEntry: StrongEntry })[]
  reverseReferences: (CrossReference & { sourceEntry: StrongEntry })[]
}

export interface TopicalStudyData {
  topic: TopicalEntry
  references: (TopicalReference & { verseText?: string })[]
  relatedTopics: TopicalEntry[]
}

export const MORPHOLOGY_LABELS: Record<string, string> = {
  tense: 'Thì',
  voice: 'Thể',
  mood: 'Cách',
  case: 'Cách thức',
  number: 'Số',
  person: 'Ngôi',
  gender: 'Giống',
}

export const TENSE_LABELS: Record<string, string> = {
  PRESENT: 'Hiện tại',
  IMPERFECT: 'Quá khứ không hoàn tất',
  FUTURE: 'Tương lai',
  AORIST: 'Quá khứ đơn (Aorist)',
  PERFECT: 'Hoàn thành',
  PLUPERFECT: 'Quá khứ hoàn thành',
  FUTURE_PERFECT: 'Tương lai hoàn thành',
}

export const VOICE_LABELS: Record<string, string> = {
  ACTIVE: 'Chủ động',
  MIDDLE: 'Trung động',
  PASSIVE: 'Bị động',
  MIDDLE_PASSIVE: 'Trung bị động',
}

export const MOOD_LABELS: Record<string, string> = {
  INDICATIVE: 'Công thức',
  SUBJUNCTIVE: 'Cầu nguyện',
  OPTATIVE: 'Ước nguyện',
  IMPERATIVE: 'Mạng lệnh',
  INFINITIVE: 'Nguyên mẫu',
  PARTICIPLE: 'Phân từ',
}

export const CASE_LABELS: Record<string, string> = {
  NOMINATIVE: 'Chủ cách',
  GENITIVE: 'Thuộc cách',
  DATIVE: 'Chế cách',
  ACCUSATIVE: 'Đối cách',
  VOCATIVE: 'Hô cách',
  LOCATIVE: 'Thời cách',
  INSTRUMENTAL: 'Công cụ cách',
}

export const NUMBER_LABELS: Record<string, string> = {
  SINGULAR: 'Số ít',
  PLURAL: 'Số nhiều',
  DUAL: 'Số đôi',
}

export const PERSON_LABELS: Record<string, string> = {
  FIRST: 'Ngôi thứ nhất',
  SECOND: 'Ngôi thứ hai',
  THIRD: 'Ngôi thứ ba',
}

export const GENDER_LABELS: Record<string, string> = {
  MASCULINE: 'Giống đực',
  FEMININE: 'Giống cái',
  NEUTER: 'Giống trung',
}