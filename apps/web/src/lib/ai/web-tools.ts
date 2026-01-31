interface SearchResult {
  title: string
  snippet: string
  url: string
}

interface OutlineResult {
  url: string
  title: string
  content: string
  wordCount: number
}

export async function performwebsearch(query: string): Promise<{ query: string; resultCount: number; results: SearchResult[] }> {
  const searchurl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`

  const response = await fetch(searchurl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    },
  })

  if (!response.ok) {
    throw new Error(`Search failed: ${response.status}`)
  }

  const html = await response.text()
  const results = parsesearchresults(html)

  return {
    query,
    resultCount: results.length,
    results: results.slice(0, 6),
  }
}

function parsesearchresults(html: string): SearchResult[] {
  const results: SearchResult[] = []

  const resultregex = /<a[^>]+class="result__a"[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/gi
  const snippetregex = /<a[^>]+class="result__snippet"[^>]*>([^<]*(?:<[^>]+>[^<]*)*)<\/a>/gi

  const titlematches = [...html.matchAll(resultregex)]
  const snippetmatches = [...html.matchAll(snippetregex)]

  for (let i = 0; i < Math.min(titlematches.length, 6); i++) {
    const titlematch = titlematches[i]
    const snippetmatch = snippetmatches[i]

    if (titlematch) {
      let url = titlematch[1]
      const title = decodehtmlentities(titlematch[2].trim())

      if (url.includes("uddg=")) {
        const urlmatch = url.match(/uddg=([^&]+)/)
        if (urlmatch) {
          url = decodeURIComponent(urlmatch[1])
        }
      }

      let snippet = ""
      if (snippetmatch) {
        snippet = decodehtmlentities(
          snippetmatch[1].replace(/<[^>]+>/g, "").trim()
        )
      }

      if (title && url && !url.includes("duckduckgo.com")) {
        results.push({ title, snippet, url })
      }
    }
  }

  return results
}

export async function performweboutline(url: string): Promise<OutlineResult> {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    throw new Error("Invalid URL format")
  }

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    },
    signal: AbortSignal.timeout(10000),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.status}`)
  }

  const html = await response.text()
  const { title, content } = extractcontent(html)

  const words = content.split(/\s+/).filter(w => w.length > 0)

  return {
    url,
    title,
    content: content.slice(0, 15000),
    wordCount: words.length,
  }
}

function extractcontent(html: string): { title: string; content: string } {
  const titlematch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
  const title = titlematch ? decodehtmlentities(titlematch[1].trim()) : ""

  let content = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  content = decodehtmlentities(content)

  return { title, content }
}

function decodehtmlentities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&hellip;/g, "...")
    .replace(/&copy;/g, "©")
    .replace(/&reg;/g, "®")
    .replace(/&trade;/g, "™")
}
