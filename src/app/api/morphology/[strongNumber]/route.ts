import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { formatStrongNumber, parseStrongNumber } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ strongNumber: string }> }
) {
  try {
    const { strongNumber } = await params
    const parsed = parseStrongNumber(strongNumber)
    
    if (!parsed) {
      return NextResponse.json(
        { error: 'Invalid Strong\'s number format' },
        { status: 400 }
      )
    }

    const formattedNumber = formatStrongNumber(strongNumber)

    const morphologies = await prisma.morphology.findMany({
      where: { strongNumber: formattedNumber },
      orderBy: { count: 'desc' }
    })

    const breakdown = morphologies.map(m => ({
      parsing: m.parsings,
      count: m.count,
      tense: m.tense,
      voice: m.voice,
      mood: m.mood,
      case: m.case_,
      number: m.number,
      person: m.person,
      gender: m.gender
    }))

    return NextResponse.json({ strongNumber: formattedNumber, morphology: breakdown })
  } catch (error) {
    console.error('Error fetching morphology:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}