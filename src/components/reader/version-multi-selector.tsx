"use client"

import { useRouter } from "next/navigation"

interface VersionOption {
  code: string
  name: string
  abbreviation: string
  language: string
}

export function VersionMultiSelector({
  versions,
  selected,
  book,
  chapter,
}: {
  versions: VersionOption[]
  selected: string[]
  book: string
  chapter: number
}) {
  const router = useRouter()

  function toggle(code: string) {
    const set = new Set(selected)
    if (set.has(code)) set.delete(code)
    else set.add(code)
    // giữ thứ tự như danh sách gốc
    const next = versions.filter((v) => set.has(v.code)).map((v) => v.code)
    const cookieVal = next.join(',')
    document.cookie = `scriptlex_read_versions=${cookieVal}; path=/; max-age=${60 * 60 * 24 * 365}`
    const q = cookieVal ? `?versions=${cookieVal}` : ''
    router.push(`/read/${book}/${chapter}${q}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Chọn bản dịch">
      <span className="text-sm text-muted-foreground font-medium mr-1">Bản dịch:</span>
      {versions.map((v) => {
        const active = selected.includes(v.code)
        return (
          <button
            key={v.code}
            type="button"
            onClick={() => toggle(v.code)}
            aria-pressed={active}
            className={
              'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ' +
              (active
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-transparent text-muted-foreground border-border hover:bg-accent')
            }
            title={`${v.name}${v.language === 'en' ? ' (Anh)' : ' (Việt)'}`}
          >
            <span className={v.language === 'en' ? 'opacity-70' : ''}>{v.abbreviation}</span>
            {v.language === 'en' && <span className="text-[10px] opacity-70">EN</span>}
          </button>
        )
      })}
    </div>
  )
}
