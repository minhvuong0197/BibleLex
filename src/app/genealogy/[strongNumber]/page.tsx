import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getLanguageLabel } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const TYPE_LABELS: Record<string, string> = {
  RELATED: 'Liên quan',
  SYNONYM: 'Đồng nghĩa',
  ANTONYM: 'Trái nghĩa',
  ROOT: 'Gốc từ',
  DERIVATIVE: 'Từ phái sinh',
  COMPOUND: 'Từ ghép',
  CITATION: 'Trích dẫn',
  ALLUSION: 'Ngụ ý',
}

type CR = { sourceStrong: string; targetStrong: string; type: string }
type TNode = { strong: string; type: string; children: TNode[] }

function bfs(
  start: string,
  adj: Map<string, CR[]>,
  getNeighbor: (l: CR) => string,
  types: string[],
  maxDepth: number,
) {
  const layers: { strong: string; type: string; from: string }[][] = []
  const visited = new Set([start])
  let current = [{ strong: start, type: '', from: '' }]
  for (let d = 0; d < maxDepth; d++) {
    const next: { strong: string; type: string; from: string }[] = []
    for (const node of current) {
      const links = adj.get(node.strong) || []
      for (const l of links) {
        if (!types.includes(l.type)) continue
        const nxt = getNeighbor(l)
        if (visited.has(nxt)) continue
        visited.add(nxt)
        next.push({ strong: nxt, type: l.type, from: node.strong })
      }
    }
    if (!next.length) break
    layers.push(next)
    current = next
  }
  return layers
}

function toTree(layers: { strong: string; type: string; from: string }[][]) {
  const roots = (layers[0] || []).map((n) => ({ strong: n.strong, type: n.type, children: [] as TNode[] }))
  const map = new Map<string, TNode>()
  for (const r of roots) map.set(r.strong, r)
  for (let i = 1; i < layers.length; i++) {
    for (const n of layers[i]) {
      const parent = map.get(n.from)
      if (parent) {
        const child: TNode = { strong: n.strong, type: n.type, children: [] }
        parent.children.push(child)
        map.set(n.strong, child)
      }
    }
  }
  return roots
}

function TreeList({ nodes, byNum }: { nodes: TNode[]; byNum: Map<string, any> }) {
  if (!nodes.length) return <p className="text-sm text-muted-foreground">Không có.</p>
  return (
    <ul className="space-y-1.5">
      {nodes.map((n) => {
        const e = byNum.get(n.strong)
        return (
          <li key={n.strong}>
            <div className="flex items-center gap-2">
              <span className="inline-block rounded border border-border px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                {TYPE_LABELS[n.type] || n.type}
              </span>
              <Link href={`/genealogy/${n.strong}`} className="font-mono text-sm hover:text-primary transition-colors">
                {n.strong} — {e?.transliteration || '—'}
              </Link>
            </div>
            {n.children.length > 0 && (
              <div className="ml-4 mt-1.5 border-l border-border pl-3">{TreeList({ nodes: n.children, byNum })}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ strongNumber: string }>
}): Promise<Metadata> {
  const { strongNumber } = await params
  return { title: `Phả hệ từ vựng ${strongNumber.toUpperCase()} · SCRIPTLEX` }
}

export default async function GenealogyPage({
  params,
}: {
  params: Promise<{ strongNumber: string }>
}) {
  const { strongNumber: raw } = await params
  const strongNumber = raw.toUpperCase()

  const crs = await prisma.crossReference.findMany({
    select: { sourceStrong: true, targetStrong: true, type: true },
  })
  const outgoing = new Map<string, CR[]>()
  const incoming = new Map<string, CR[]>()
  for (const c of crs) {
    if (!outgoing.has(c.sourceStrong)) outgoing.set(c.sourceStrong, [])
    outgoing.get(c.sourceStrong)!.push(c)
    if (!incoming.has(c.targetStrong)) incoming.set(c.targetStrong, [])
    incoming.get(c.targetStrong)!.push(c)
  }

  const upTree = toTree(bfs(strongNumber, outgoing, (l) => l.targetStrong, ['DERIVATIVE', 'ROOT'], 3))
  const downTree = toTree(bfs(strongNumber, incoming, (l) => l.sourceStrong, ['DERIVATIVE', 'ROOT'], 3))

  const sideTypes = ['COMPOUND', 'SYNONYM', 'RELATED', 'CITATION', 'ALLUSION']
  const outSide = (outgoing.get(strongNumber) || []).filter((c) => sideTypes.includes(c.type))
  const inSide = (incoming.get(strongNumber) || []).filter((c) => sideTypes.includes(c.type))

  const set = new Set<string>([strongNumber])
  const collect = (nodes: TNode[]) => {
    for (const n of nodes) {
      set.add(n.strong)
      collect(n.children)
    }
  }
  collect(upTree)
  collect(downTree)
  for (const c of [...outSide, ...inSide]) {
    set.add(c.targetStrong)
    set.add(c.sourceStrong)
  }

  const entries = await prisma.strongEntry.findMany({
    where: { strongNumber: { in: [...set] } },
    select: { strongNumber: true, transliteration: true, definition: true, language: true },
  })
  const byNum = new Map(entries.map((e) => [e.strongNumber, e]))
  const entry = byNum.get(strongNumber)
  if (!entry) notFound()

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <Link href={`/strongs/${strongNumber}`} className="text-sm text-muted-foreground hover:text-primary">
        ← Quay lại mục từ {strongNumber}
      </Link>

      <div className="mt-4 rounded-lg border bg-card p-5">
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xl font-bold">{entry.strongNumber}</span>
          <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
            {getLanguageLabel(entry.language)}
          </span>
          <span className="text-muted-foreground">{entry.transliteration}</span>
        </div>
        <p className="mt-2 text-sm text-foreground/90">{entry.definition}</p>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold">↑ Gốc từ / Nguồn gốc</h2>
          <p className="mb-2 text-xs text-muted-foreground">
            Từ này bắt nguồn từ (tính đến 3 bậc):
          </p>
          <TreeList nodes={upTree} byNum={byNum} />
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">↓ Từ phái sinh</h2>
          <p className="mb-2 text-xs text-muted-foreground">
            Các từ dẫn xuất từ từ này (tính đến 3 bậc):
          </p>
          <TreeList nodes={downTree} byNum={byNum} />
        </section>
      </div>

      {(outSide.length > 0 || inSide.length > 0) && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">↔ Từ ghép / Đồng nghĩa / Liên quan / Trích dẫn</h2>
          <div className="flex flex-wrap gap-2">
            {[...outSide, ...inSide].map((c, i) => {
              const other = c.sourceStrong === strongNumber ? c.targetStrong : c.sourceStrong
              const e = byNum.get(other)
              return (
                <Link
                  key={i}
                  href={`/genealogy/${other}`}
                  className="inline-flex items-center gap-2 rounded border border-border px-2 py-1 text-sm hover:border-primary hover:text-primary transition-colors"
                >
                  <span className="text-[10px] uppercase text-muted-foreground">{TYPE_LABELS[c.type] || c.type}</span>
                  <span className="font-mono">{other}</span>
                  <span className="text-muted-foreground">{e?.transliteration}</span>
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
