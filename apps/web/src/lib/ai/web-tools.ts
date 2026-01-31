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
  try {
    const body = new URLSearchParams({
      q: query,
      categories: "",
      language: "en-US",
      time_range: "",
      safesearch: "0",
      theme: "simple",
    })

    const response = await fetch("https://www.gruble.de/search", {
      method: "POST",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "max-age=0",
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": "https://www.gruble.de",
        "Referer": "https://www.gruble.de/",
        "Sec-Ch-Ua": '"Not(A:Brand";v="8", "Chromium";v="144", "Microsoft Edge";v="144"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
      },
      body: body.toString(),
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`)
    }

    const html = await response.text()
    const results = parsesearxnghtml(html)

    return {
      query,
      resultCount: results.length,
      results: results.slice(0, 6),
    }
  } catch (error) {
    console.error("[web_search] Error:", error)
    throw new Error(`Web search failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

function parsesearxnghtml(html: string): SearchResult[] {
  const results: SearchResult[] = []
  
  const articleregex = /<article class="result[^"]*">([\s\S]*?)<\/article>/gi
  const articles = [...html.matchAll(articleregex)]

  for (const article of articles) {
    const articlehtml = article[1]
    
    const urlmatch = articlehtml.match(/<a href="([^"]+)"[^>]*class="url_header"/)
      || articlehtml.match(/<a[^>]*class="url_header"[^>]*href="([^"]+)"/)
    
    const titlematch = articlehtml.match(/<h3>\s*<a[^>]*>([^<]*(?:<span[^>]*>[^<]*<\/span>[^<]*)*)<\/a>\s*<\/h3>/)
    
    const snippetmatch = articlehtml.match(/<p class="content">([\s\S]*?)<\/p>/)

    if (urlmatch && titlematch) {
      const url = urlmatch[1]
      const rawtitle = titlematch[1].replace(/<[^>]+>/g, "").trim()
      const title = decodehtmlentities(rawtitle)
      
      let snippet = ""
      if (snippetmatch) {
        snippet = decodehtmlentities(snippetmatch[1].replace(/<[^>]+>/g, "").trim())
      }

      if (url && title && !url.includes("gruble.de")) {
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
