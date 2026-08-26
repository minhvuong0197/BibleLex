"use client"

import { useRouter } from "next/navigation"

interface VersionOption {
  code: string
  name: string
  abbreviation: string
}

export function VersionSelector({
  versions,
  current,
  book,
  chapter,
}: {
  versions: VersionOption[]
  current: string
  book: string
  chapter: number
}) {
  const router = useRouter()

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const code = e.target.value
    document.cookie = `scriptlex_version=${code}; path=/; max-age=${60 * 60 * 24 * 365}`
    router.push(`/interlinear/${book}/${chapter}?version=${code}`)
  }

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="text-muted-foreground font-medium">Bản dịch:</span>
      <select
        value={current}
        onChange={onChange}
        className="h-9 rounded-lg border bg-background px-2 text-sm outline-none focus-within:ring-2 focus-within:ring-ring"
        aria-label="Chọn bản dịch Kinh Thánh"
      >
        {versions.map((v) => (
          <option key={v.code} value={v.code}>
            {v.name} ({v.abbreviation})
          </option>
        ))}
      </select>
    </label>
  )
}
