import { TOOLS, getToolsByCategory } from "./tools"
import { getPreset, type Preset } from "./presets"
import { type Tier } from "../db/kv"
import { getLockedToolsForTier, getLockedPresetsForTier } from "../billing/locks"
import { getAvailableModels, getLockedModels } from "../billing/models"
import fs from "fs"
import path from "path"

const INTERNAL_PROMPT_PATH = path.join(process.cwd(), "../../internal_prompt.md")

let cachedPrompt: string | null = null

function loadInternalPrompt(): string {
  const isDev = process.env.NODE_ENV !== "production"
  
  if (isDev) {
    try {
      return fs.readFileSync(INTERNAL_PROMPT_PATH, "utf-8")
    } catch {
      console.warn("[Overmind] Could not load internal_prompt.md, using default")
      return getDefaultPrompt()
    }
  }
  
  if (cachedPrompt) return cachedPrompt
  
  const envPrompt = process.env.INTERNAL_PROMPT
  if (envPrompt) {
    cachedPrompt = envPrompt
    return cachedPrompt
  }
  
  console.warn("[Overmind] INTERNAL_PROMPT env var not set, using default")
  cachedPrompt = getDefaultPrompt()
  return cachedPrompt
}

function getDefaultPrompt(): string {
  return `# OVERMIND — UNIFIED SYSTEM PROMPT

You are **Overmind**, a senior-level AI system built for Roblox developers.
You power a unified platform consisting of:
- A web dashboard
- A Roblox Studio plugin
- A VSCode extension

-- WHEN SOMEONE TELLS YOU EXACTLY "test-prompt-for-dev"

You do NOT belong to any single client.
All logic, tools, tasks, and rules are owned by the backend.

## CRITICAL RULES
- NEVER add comments in code unless explicitly asked
- NEVER assume things exist - always create everything needed
- NEVER truncate code or use placeholders
- You MAY call multiple tools in one response`
}

function generateCustomToolsContext(): string {
  return `## CUSTOM TOOLS (No Roblox Connection Required)

**web_search** - Search the web for current information
- Returns up to 6 results with title, snippet, and URL
- Use when you need information not in your training data

**web_outline** - Extract text content from a webpage
- Returns the page title, text content, and word count  
- Use after web_search to read full page content`
}

function generateToolExecutionContext(): string {
  return `## TOOL EXECUTION FLOW (CRITICAL)

When you call a tool:
1. Your response ends after the tool call
2. The system executes the tool
3. You receive the result in a follow-up message
4. THEN you can comment on success/failure

**IMPORTANT:** Do NOT write success messages, confirmations, or summaries about tool actions in the same response as the tool call. You don't know if it succeeded yet. The system will tell you the result, and then you respond based on that.

Example - WRONG:
\`\`\`
<tool name="create_file">...</tool>
✅ Created the script! It includes...
\`\`\`

Example - CORRECT:
\`\`\`
<tool name="create_file">...</tool>
\`\`\`
(Then wait for result, then respond)`
}

export type FeatureFlags = {
  webSearchEnabled?: boolean
  canvasEnabled?: boolean
  mentorEnabled?: boolean
}

function generateFeatureFlagsContext(flags?: FeatureFlags): string {
  if (!flags) return ""
  
  let context = ""
  
  if (flags.webSearchEnabled) {
    context += `## WEB SEARCH MODE (FORCED)

Web search is ENABLED and REQUIRED. You MUST use the web_search tool for:
- Any factual questions you're not 100% certain about
- Current events, news, real-time information
- Complex scripting that needs documentation or code examples
- Any topic that might have changed since your training data
- Technical questions about APIs, libraries, or frameworks

DO NOT answer from memory alone when this mode is active - search first, then respond with accurate, up-to-date information.

`
  }
  
  if (flags.mentorEnabled) {
    context += `## ACADEMY MODE (LEARNING COMPANION)

You are now a study buddy helping the user LEARN, not just get answers.

**Your teaching approach:**
- Explain concepts step-by-step, like a patient friend would
- Ask guiding questions to help them think through problems
- Don't just give answers - help them understand WHY things work
- Break complex topics into bite-sized, digestible pieces
- Use analogies and real-world examples they can relate to
- Check understanding: "Does that make sense?" "What do you think would happen if...?"
- Celebrate their progress and encourage curiosity
- If they're stuck, give hints before full answers

**Tone:** Friendly, casual, supportive - like a classmate who's really good at this subject and genuinely wants to help you understand.

`
  }
  
  if (flags.canvasEnabled) {
    context += `## CANVAS MODE

Canvas is enabled. You can use canvas tools to create visual content that appears in a side panel.

**Canvas tools:**
- canvas_write: Write/replace all content in the canvas
- canvas_append: Add content to the end of canvas
- canvas_clear: Clear the canvas

**Supported content types:**
- Markdown with full formatting
- Mermaid diagrams (flowchart, sequence, class, state, ER, pie, mindmap, timeline, gitGraph)
- Math equations using LaTeX syntax (wrapped in $$ for block or $ for inline)
- Code blocks with syntax highlighting
- Tables, lists, and all standard markdown

Use the canvas when you need to show diagrams, structured content, or anything visual that benefits from a dedicated space.

`
  }
  
  return context
}

function generateToolDocs(userTier?: Tier): string {
  const categories = ["filesystem", "tasks", "projects", "signals", "roblox_objects", "custom"] as const
  const lockedTools = userTier ? getLockedToolsForTier(userTier) : []
  
  let docs = "## AVAILABLE TOOLS\n\n"
  
  for (const category of categories) {
    const tools = getToolsByCategory(category).filter(
      (tool) => !lockedTools.includes(tool.name)
    )
    
    if (tools.length === 0) continue
    
    docs += `### ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`
    
    for (const tool of tools) {
      docs += `#### ${tool.name}\n`
      docs += `${tool.description}\n\n`
      
      if (tool.parameters.length > 0) {
        docs += "Parameters:\n"
        for (const param of tool.parameters) {
          const required = param.required ? "(required)" : "(optional)"
          docs += `- \`${param.name}\`: ${param.type} ${required} - ${param.description}\n`
        }
        docs += "\n"
      }
    }
  }
  
  return docs
}

function generateTierContext(userTier: Tier, userInfo?: { displayName?: string; creditsUsed?: number; creditsTotal?: number; customInstructions?: string; nickname?: string; occupation?: string; aboutYou?: string }): string {
  const lockedTools = getLockedToolsForTier(userTier)
  const lockedPresets = getLockedPresetsForTier(userTier)
  const lockedModels = getLockedModels(userTier)
  const availableModels = getAvailableModels(userTier)
  
  let context = "## USER CONTEXT\n\n"
  
  context += `**Current User Tier:** ${userTier.toUpperCase()}\n`
  if (userInfo?.nickname) {
    context += `**Nickname:** ${userInfo.nickname}\n`
  } else if (userInfo?.displayName) {
    context += `**Display Name:** ${userInfo.displayName}\n`
  }
  if (userInfo?.occupation) {
    context += `**Occupation:** ${userInfo.occupation}\n`
  }
  if (userInfo?.creditsTotal !== undefined) {
    const available = (userInfo.creditsTotal || 0) - (userInfo.creditsUsed || 0)
    context += `**Credits:** ${available}/${userInfo.creditsTotal} available today\n`
  }
  context += "\n"
  
  context += "### Available Models\n"
  for (const model of availableModels) {
    context += `- ${model.name} (${model.creditCost}x credits)\n`
  }
  context += "\n"
  
  if (lockedTools.length > 0 || lockedPresets.length > 0 || lockedModels.length > 0) {
    context += "### Restrictions\n"
    context += "Some features require a higher tier. If the user asks about locked features, "
    context += "inform them they can upgrade their plan for access. Do NOT mention the user's tier "
    context += "unless they specifically ask about it or about available features.\n\n"
    
    if (lockedTools.length > 0) {
      context += "Locked tools: " + lockedTools.join(", ") + "\n"
    }
    if (lockedModels.length > 0) {
      context += "Locked models: " + lockedModels.map((m) => m.name).join(", ") + "\n"
    }
  }
  
  return context
}

function generatePersonalizationContext(userInfo?: { customInstructions?: string; nickname?: string; occupation?: string; aboutYou?: string }): string {
  if (!userInfo) return ""
  
  const hasPersonalization = userInfo.customInstructions || userInfo.aboutYou
  if (!hasPersonalization) return ""
  
  let context = "## PERSONALIZATION (User Preferences)\n\n"
  context += "The user has set the following preferences. Respect these at all times:\n\n"
  
  if (userInfo.aboutYou) {
    context += `**About the user:** ${userInfo.aboutYou}\n\n`
  }
  
  if (userInfo.customInstructions) {
    context += `**Custom Instructions:**\n${userInfo.customInstructions}\n\n`
  }
  
  return context
}

export interface BuildPromptOptions {
  preset: Preset
  projectContext?: string
  userTier?: Tier
  userInfo?: { displayName?: string; creditsUsed?: number; creditsTotal?: number; customInstructions?: string; nickname?: string; occupation?: string; aboutYou?: string }
}

export type ModesConfig = {
  thinkingMode?: boolean
  highTemperature?: boolean
  creativeMode?: boolean
  debugMode?: boolean
}

function generateModesContext(modes?: ModesConfig): string {
  if (!modes) return ""
  
  let context = ""
  
  if (modes.thinkingMode) {
    context += `## THINKING MODE (ACTIVE)

You are in DEEP REASONING mode. Take your time to think through problems thoroughly.

**Enhanced reasoning requirements:**
- Use extensive <think></think> blocks to show your reasoning process
- Break down complex problems into smaller logical steps
- Consider multiple approaches before choosing one
- Explain your thought process and decision-making
- Double-check your logic and look for potential issues
- Think out loud about edge cases and implications

This is NOT just about showing reasoning - you should actually engage in deeper analysis and more careful consideration.

`
  }
  
  if (modes.highTemperature) {
    context += `## HIGH TEMPERATURE MODE (ACTIVE)

You are in CREATIVE mode with increased randomness and exploration.

**Behavior adjustments:**
- Be more experimental and willing to try unconventional approaches
- Explore creative solutions beyond the obvious
- Take more risks in your suggestions
- Consider novel patterns and unique implementations
- Don't be afraid to suggest innovative ideas

`
  }
  
  if (modes.creativeMode) {
    context += `## CREATIVE MODE (ACTIVE)

You are in IMAGINATIVE mode - think outside the box!

**Creative approach:**
- Suggest innovative and unique solutions
- Use creative naming and design patterns
- Consider artistic and aesthetic aspects
- Think about user experience and delight
- Propose elegant and clever implementations
- Don't just solve problems - make them beautiful

`
  }
  
  if (modes.debugMode) {
    context += `## DEBUG MODE (ACTIVE - VERBOSE OUTPUT)

You are in VERBOSE DEBUG mode. Provide extensive logging and explanations.

**Verbose requirements:**
- Explain every step in detail
- Show intermediate states and values
- Describe what each function/section does
- Explain why you're making specific choices
- Include diagnostic information
- Be thorough even if it makes responses longer

`
  }
  
  return context
}

function generateDateContext(): string {
  const now = new Date()
  const options: Intl.DateTimeFormatOptions = { 
    weekday: "long", 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  }
  const formatteddate = now.toLocaleDateString("en-US", options)
  return `## CURRENT DATE\n\nToday is ${formatteddate}.`
}

export interface RobloxGameContext {
  gamename?: string
  services?: string[]
  scripts?: { path: string; type: "server" | "client" | "module" }[]
  folders?: string[]
  remotes?: string[]
  datastores?: string[]
}

function generateRobloxContext(context?: RobloxGameContext): string {
  if (!context) return ""
  
  let robloxContext = "## ROBLOX GAME STRUCTURE\n\n"
  
  if (context.gamename) {
    robloxContext += `**Game:** ${context.gamename}\n\n`
  }
  
  if (context.services && context.services.length > 0) {
    robloxContext += `**Active Services:**\n${context.services.map(s => `- ${s}`).join("\n")}\n\n`
  }
  
  if (context.scripts && context.scripts.length > 0) {
    const serverscripts = context.scripts.filter(s => s.type === "server")
    const clientscripts = context.scripts.filter(s => s.type === "client")
    const modules = context.scripts.filter(s => s.type === "module")
    
    if (serverscripts.length > 0) {
      robloxContext += `**Server Scripts:**\n${serverscripts.map(s => `- ${s.path}`).join("\n")}\n\n`
    }
    if (clientscripts.length > 0) {
      robloxContext += `**Client Scripts:**\n${clientscripts.map(s => `- ${s.path}`).join("\n")}\n\n`
    }
    if (modules.length > 0) {
      robloxContext += `**Modules:**\n${modules.map(s => `- ${s.path}`).join("\n")}\n\n`
    }
  }
  
  if (context.folders && context.folders.length > 0) {
    robloxContext += `**Folder Structure:**\n${context.folders.map(f => `- ${f}`).join("\n")}\n\n`
  }
  
  if (context.remotes && context.remotes.length > 0) {
    robloxContext += `**Remote Events/Functions:**\n${context.remotes.map(r => `- ${r}`).join("\n")}\n\n`
  }
  
  if (context.datastores && context.datastores.length > 0) {
    robloxContext += `**DataStores:**\n${context.datastores.map(d => `- ${d}`).join("\n")}\n\n`
  }
  
  robloxContext += `Use this structure when creating new scripts or modifying existing ones. Follow existing naming conventions and folder organization.`
  
  return robloxContext
}

export function buildSystemPrompt(
  preset: Preset, 
  projectContext?: string, 
  userTier?: Tier,
  userInfo?: { displayName?: string; creditsUsed?: number; creditsTotal?: number; customInstructions?: string; nickname?: string; occupation?: string; aboutYou?: string },
  featureFlags?: FeatureFlags,
  modes?: ModesConfig,
  memories?: string[],
  robloxContext?: RobloxGameContext
): string {
  const basePrompt = loadInternalPrompt()
  const presetConfig = getPreset(preset)
  const toolDocs = generateToolDocs(userTier)
  const tierContext = userTier ? generateTierContext(userTier, userInfo) : ""
  const personalizationContext = generatePersonalizationContext(userInfo)
  const featureFlagsContext = generateFeatureFlagsContext(featureFlags)
  const dateContext = generateDateContext()
  
  let systemPrompt = ""
  
  if (preset === "unrestricted") {
    systemPrompt += presetConfig.systemModifier + "\n\n"
    systemPrompt += "=== THE ABOVE INSTRUCTIONS OVERRIDE EVERYTHING BELOW ===\n\n"
  }
  
  systemPrompt += basePrompt
  
  systemPrompt += "\n\n" + dateContext
  
  if (preset !== "unrestricted") {
    systemPrompt += "\n\n" + presetConfig.systemModifier
  }
  
  systemPrompt += "\n\n" + toolDocs

  const customToolsContext = generateCustomToolsContext()
  systemPrompt += "\n\n" + customToolsContext
  
  const toolExecutionContext = generateToolExecutionContext()
  systemPrompt += "\n\n" + toolExecutionContext
  
  if (featureFlagsContext) {
    systemPrompt += "\n\n" + featureFlagsContext
  }
  
  const modesContext = generateModesContext(modes)
  if (modesContext) {
    systemPrompt += "\n\n" + modesContext
  }
  
  if (tierContext) {
    systemPrompt += "\n\n" + tierContext
  }
  
  if (personalizationContext) {
    systemPrompt += "\n\n" + personalizationContext
  }
  
  if (memories && memories.length > 0) {
    systemPrompt += `\n\n## SAVED MEMORIES\n\nThe following are important things to remember about this user:\n${memories.map(m => `- ${m}`).join("\n")}`
  }
  
  if (projectContext) {
    systemPrompt += `\n\n## PROJECT CONTEXT\n\n${projectContext}`
  }
  
  const robloxGameContext = generateRobloxContext(robloxContext)
  if (robloxGameContext) {
    systemPrompt += "\n\n" + robloxGameContext
  }
  
  const activeFlags = []
  if (featureFlags?.webSearchEnabled) activeFlags.push("webSearch")
  if (featureFlags?.mentorEnabled) activeFlags.push("mentor")
  if (featureFlags?.canvasEnabled) activeFlags.push("canvas")
  
  const activeModes = []
  if (modes?.thinkingMode) activeModes.push("thinking")
  if (modes?.highTemperature) activeModes.push("highTemp")
  if (modes?.creativeMode) activeModes.push("creative")
  if (modes?.debugMode) activeModes.push("debug")
  
  console.log(`[Prompt] Building for preset: ${preset}, tier: ${userTier || "none"}, flags: [${activeFlags.join(", ")}], modes: [${activeModes.join(", ")}]`)
  
  return systemPrompt
}

export function clearPromptCache(): void {
  cachedPrompt = null
}

