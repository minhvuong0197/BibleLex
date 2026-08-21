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

    const [forwardRefs, reverseRefs, sourceEntry] = await Promise.all([
      prisma.crossReference.findMany({
        where: { sourceStrong: formattedNumber },
        include: { targetEntry: true },
        orderBy: { type: 'asc' }
      }),
      prisma.crossReference.findMany({
        where: { targetStrong: formattedNumber },
        include: { sourceEntry: true },
        orderBy: { type: 'asc' }
      }),
      prisma.strongEntry.findUnique({
        where: { strongNumber: formattedNumber }
      })
    ])

    if (!sourceEntry) {
      return NextResponse.json(
        { error: 'Strong\'s entry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      source: sourceEntry,
      references: forwardRefs,
      reverseReferences: reverseRefs
    })
  } catch (error) {
    console.error('Error fetching cross references:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}