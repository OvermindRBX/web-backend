import { executeTool } from "./executor"
import { type ToolCall } from "./tools"

interface BulkToolCall {
  name: string
  args: Record<string, string>
}

interface BulkToolResult {
  name: string
  args: Record<string, string>
  status: "success" | "error"
  result?: string
  error?: string
  duration: number
}

interface BulkExecutionResult {
  total: number
  successful: number
  failed: number
  results: BulkToolResult[]
  totalDuration: number
}

export async function executeBulkTools(
  tools: BulkToolCall[],
  context: {
    userId?: string
    projectId?: string
  }
): Promise<BulkExecutionResult> {
  const starttime = Date.now()
  
  const promises = tools.map(async (tool): Promise<BulkToolResult> => {
    const toolstart = Date.now()
    try {
      const toolcall: ToolCall = { name: tool.name, args: tool.args }
      const result = await executeTool(toolcall, context)
      return {
        name: tool.name,
        args: tool.args,
        status: "success",
        result: typeof result === "string" ? result : JSON.stringify(result),
        duration: Date.now() - toolstart,
      }
    } catch (err) {
      return {
        name: tool.name,
        args: tool.args,
        status: "error",
        error: err instanceof Error ? err.message : "Unknown error",
        duration: Date.now() - toolstart,
      }
    }
  })

  const results = await Promise.all(promises)
  
  const successful = results.filter(r => r.status === "success").length
  const failed = results.filter(r => r.status === "error").length

  return {
    total: tools.length,
    successful,
    failed,
    results,
    totalDuration: Date.now() - starttime,
  }
}

export function formatBulkResults(result: BulkExecutionResult): string {
  const lines: string[] = [
    `## Bulk Execution Complete`,
    `- **Total tools:** ${result.total}`,
    `- **Successful:** ${result.successful}`,
    `- **Failed:** ${result.failed}`,
    `- **Total time:** ${result.totalDuration}ms`,
    "",
    "### Results:",
  ]

  for (const r of result.results) {
    const status = r.status === "success" ? "✅" : "❌"
    lines.push(`\n**${status} ${r.name}** (${r.duration}ms)`)
    
    if (r.status === "success" && r.result) {
      const preview = r.result.length > 200 ? r.result.slice(0, 200) + "..." : r.result
      lines.push(`\`\`\`\n${preview}\n\`\`\``)
    } else if (r.error) {
      lines.push(`Error: ${r.error}`)
    }
  }

  return lines.join("\n")
}

export function parseBulkToolCall(content: string): BulkToolCall[] | null {
  const bulkmatch = content.match(/<tool\s+name="bulk"[^>]*>([\s\S]*?)<\/tool>/i)
  if (!bulkmatch) return null

  const toolscontent = bulkmatch[1]
  
  try {
    const toolsmatch = toolscontent.match(/<tools>([\s\S]*?)<\/tools>/i)
    if (!toolsmatch) return null

    const toolsarray: BulkToolCall[] = []
    const toolmatches = toolsmatch[1].matchAll(/<tool\s+name="([^"]+)"[^>]*>([\s\S]*?)<\/tool>/gi)

    for (const match of toolmatches) {
      const name = match[1]
      const argscontent = match[2]
      const args: Record<string, string> = {}

      const argmatches = argscontent.matchAll(/<([^>]+)>([\s\S]*?)<\/\1>/g)
      for (const argmatch of argmatches) {
        args[argmatch[1]] = argmatch[2].trim()
      }

      toolsarray.push({ name, args })
    }

    return toolsarray.length > 0 ? toolsarray : null
  } catch {
    return null
  }
}
