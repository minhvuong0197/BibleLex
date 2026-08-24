export interface GitHubProfile {
  login: string
  name: string | null
  avatarUrl: string
  bio: string | null
  company: string | null
  location: string | null
  blog: string | null
  followers: number
  following: number
  publicRepos: number
  htmlUrl: string
  createdAt: string
}

export interface GitHubRepo {
  id: number
  name: string
  description: string | null
  language: string | null
  stargazersCount: number
  forksCount: number
  htmlUrl: string
  updatedAt: string
}

const USERNAME = process.env.NEXT_PUBLIC_GITHUB_USERNAME || "minhvuong0197"

async function ghFetch(path: string): Promise<any> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "LOGOS LEX",
  }
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`
  }
  const res = await fetch(`https://api.github.com${path}`, {
    headers,
    next: { revalidate: 3600 },
  })
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}`)
  }
  return res.json()
}

export async function getGitHubData(): Promise<{
  profile: GitHubProfile | null
  repos: GitHubRepo[]
}> {
  try {
    const [profile, repos] = await Promise.all([
      ghFetch(`/users/${USERNAME}`),
      ghFetch(`/users/${USERNAME}/repos?sort=updated&per_page=12&type=owner`),
    ])
    return {
      profile: {
        login: profile.login,
        name: profile.name,
        avatarUrl: profile.avatar_url,
        bio: profile.bio,
        company: profile.company,
        location: profile.location,
        blog: profile.blog,
        followers: profile.followers,
        following: profile.following,
        publicRepos: profile.public_repos,
        htmlUrl: profile.html_url,
        createdAt: profile.created_at,
      },
      repos: (repos as any[]).map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        language: r.language,
        stargazersCount: r.stargazers_count,
        forksCount: r.forks_count,
        htmlUrl: r.html_url,
        updatedAt: r.updated_at,
      })),
    }
  } catch (e) {
    console.error("GitHub fetch failed:", e)
    return { profile: null, repos: [] }
  }
}
