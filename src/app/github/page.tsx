import { Metadata } from "next"
import {
  GitBranch,
  Star,
  GitFork,
  ExternalLink,
  MapPin,
  Building,
  Link as LinkIcon,
  CalendarDays,
} from "lucide-react"
import { getGitHubData } from "@/lib/github"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "GitHub",
  description:
    "Hồ sơ GitHub của tác giả Logos Lex — danh sách các dự án mã nguồn mở.",
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return iso
  }
}

function normalizeBlog(blog: string) {
  return blog.startsWith("http") ? blog : `https://${blog}`
}

export default async function GitHubPage() {
  const { profile, repos } = await getGitHubData()

  if (!profile) {
    return (
      <div className="container py-16 text-center">
        <GitBranch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Không thể tải hồ sơ GitHub</h1>
        <p className="text-muted-foreground">
          Có thể do giới hạn truy cập API. Vui lòng thử lại sau.
        </p>
        <Button asChild className="mt-6">
          <a
            href="https://github.com/minhvuong0197"
            target="_blank"
            rel="noopener noreferrer"
          >
            Mở GitHub <ExternalLink className="h-4 w-4 ml-1" />
          </a>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-8 md:py-12">
      <nav className="mb-6 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-muted-foreground">
          <li>
            <a href="/" className="hover:text-foreground transition-colors">
              Trang chủ
            </a>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground font-medium" aria-current="page">
            GitHub
          </li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3">
          <GitBranch className="h-8 w-8 text-primary" />
          GitHub
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Hồ sơ và các dự án mã nguồn mở của tác giả Logos Lex.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-12">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <img
                src={profile.avatarUrl}
                alt={profile.login}
                className="h-28 w-28 rounded-full border-4 border-primary/10"
              />
              <h2 className="mt-4 text-xl font-bold">
                {profile.name || profile.login}
              </h2>
              <p className="text-muted-foreground">@{profile.login}</p>
              {profile.bio && <p className="mt-3 text-sm">{profile.bio}</p>}
              <Button asChild className="mt-5 w-full">
                <a href={profile.htmlUrl} target="_blank" rel="noopener noreferrer">
                  <GitBranch className="h-4 w-4 mr-1" /> Xem trên GitHub
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-3">
              {profile.company && (
                <div className="flex items-center gap-3 text-sm">
                  <Building className="h-4 w-4 text-primary" />
                  {profile.company}
                </div>
              )}
              {profile.location && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  {profile.location}
                </div>
              )}
              {profile.blog && (
                <div className="flex items-center gap-3 text-sm">
                  <LinkIcon className="h-4 w-4 text-primary" />
                  <a
                    href={normalizeBlog(profile.blog)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate hover:underline"
                  >
                    {profile.blog}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <CalendarDays className="h-4 w-4 text-primary" />
                Tham gia {formatDate(profile.createdAt)}
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3 text-center">
                <div className="rounded-lg bg-primary/5 p-3">
                  <div className="font-mono text-lg font-bold text-primary">
                    {profile.followers}
                  </div>
                  <div className="text-xs text-muted-foreground">Followers</div>
                </div>
                <div className="rounded-lg bg-primary/5 p-3">
                  <div className="font-mono text-lg font-bold text-primary">
                    {profile.following}
                  </div>
                  <div className="text-xs text-muted-foreground">Following</div>
                </div>
                <div className="rounded-lg bg-primary/5 p-3">
                  <div className="font-mono text-lg font-bold text-primary">
                    {profile.publicRepos}
                  </div>
                  <div className="text-xs text-muted-foreground">Repos</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6">Dự án ({repos.length})</h2>
          {repos.length === 0 ? (
            <p className="text-muted-foreground">Chưa có dự án nào được hiển thị.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {repos.map((repo) => (
                <Card
                  key={repo.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold line-clamp-1">
                        <a
                          href={repo.htmlUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary hover:underline"
                        >
                          {repo.name}
                        </a>
                      </h3>
                      <a
                        href={repo.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground shrink-0"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                      {repo.description || "Không có mô tả."}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {repo.language && (
                        <span className="flex items-center gap-1">
                          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                          {repo.language}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5" /> {repo.stargazersCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="h-3.5 w-3.5" /> {repo.forksCount}
                      </span>
                      <span>Cập nhật {formatDate(repo.updatedAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
