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

type Adj = { out: Map<string, CR[]>; inc: Map<string, CR[]> }
let _adjCache: (Adj & { ts: number }) | null = null

async function getAdjacency(): Promise<Adj> {
  const now = Date.now()
  if (_adjCache && now - _adjCache.ts < 10 * 60 * 1000) {
    const { ts, ...rest } = _adjCache
    return rest
  }
  const crs = await prisma.crossReference.findMany({
    select: { sourceStrong: true, targetStrong: true, type: true },
  })
  const out = new Map<string, CR[]>()
  const inc = new Map<string, CR[]>()
  for (const c of crs) {
    if (!out.has(c.sourceStrong)) out.set(c.sourceStrong, [])
    out.get(c.sourceStrong)!.push(c)
    if (!inc.has(c.targetStrong)) inc.set(c.targetStrong, [])
    inc.get(c.targetStrong)!.push(c)
  }
  _adjCache = { out, inc, ts: now }
  return { out, inc }
}

function bfsMaps(
  start: string,
  out: Map<string, CR[]>,
  inc: Map<string, CR[]>,
  dir: 'up' | 'down',
  types: string[],
  maxDepth: number,
): { strong: string; type: string; from: string }[][] {
  const layers: { strong: string; type: string; from: string }[][] = []
  const visited = new Set([start])
  let frontier = [start]
  for (let d = 0; d < maxDepth; d++) {
    const next: { strong: string; type: string; from: string }[] = []
    const layerSeen = new Set<string>()
    for (const node of frontier) {
      const links = (dir === 'up' ? out.get(node) : inc.get(node)) || []
      for (const l of links) {
        if (!types.includes(l.type)) continue
        let neighbor: string
        if (dir === 'up') {
          if (l.sourceStrong !== node) continue
          neighbor = l.targetStrong
        } else {
          if (l.targetStrong !== node) continue
          neighbor = l.sourceStrong
        }
        if (visited.has(neighbor) || layerSeen.has(neighbor)) continue
        layerSeen.add(neighbor)
        visited.add(neighbor)
        next.push({ strong: neighbor, type: l.type, from: node })
      }
    }
    if (!next.length) break
    layers.push(next)
    frontier = next.map((n) => n.strong)
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

  const sideTypes = ['COMPOUND', 'SYNONYM', 'RELATED', 'CITATION', 'ALLUSION']
  const { out, inc } = await getAdjacency()
  const upLayers = bfsMaps(strongNumber, out, inc, 'up', ['DERIVATIVE', 'ROOT'], 3)
  const downLayers = bfsMaps(strongNumber, out, inc, 'down', ['DERIVATIVE', 'ROOT'], 3)
  const sideLinks = [...(out.get(strongNumber) || []), ...(inc.get(strongNumber) || [])]
  const upTree = toTree(upLayers)
  const downTree = toTree(downLayers)
  const outSide = sideLinks.filter((c) => c.sourceStrong === strongNumber && sideTypes.includes(c.type))
  const inSide = sideLinks.filter((c) => c.targetStrong === strongNumber && sideTypes.includes(c.type))

  const set = new Set<string>([strongNumber])
  for (const l of [...upLayers, ...downLayers].flat()) set.add(l.strong)
  for (const c of sideLinks) {
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
