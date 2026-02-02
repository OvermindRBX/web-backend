# 🚀 OVERMIND Feature Implementation Plan

## Overview
Implementing 20+ features from SUGGESTIONS.md with user-specified modifications.

---

## Phase 1: Core Infrastructure
**Files to create:**
- `components/ui/tooltip.tsx` - Glassmorphic premium tooltips with animations
- `components/ui/toast.tsx` - Fluent toast notification system
- `components/ui/error-boundary.tsx` - React error boundaries

**Specifications:**
- **Tooltip**: TailwindCSS glassmorphic effect (no inline blur), smooth fade/scale animations, supports placement (top/bottom/left/right)
- **Toast**: Fluent premium design, supports success/error/warning/info variants, auto-dismiss with progress, stacking support
- **Error Boundary**: Graceful error catching, fallback UI, error reporting

---

## Phase 2: Chat Categories/Folders (Suggestion #5)
**User Notes:** "Right-click context menu to add to category, icon picker from Lucide icons preset, name category, resort categories in sidebar, under Projects dropdown"

**Files to modify:**
- `lib/db/kv.ts` - Add Category interface and storage
- `app/(dashboard)/dashboard/page.tsx` - Category UI in sidebar
- `components/ui/context-menu.tsx` - Add category options
- `components/ui/icon-picker.tsx` - NEW: Lucide icon selection modal

**Data Model:**
```typescript
interface Category {
  id: string
  userId: string
  name: string
  icon: string // Lucide icon name
  order: number
  chatIds: string[]
  createdAt: number
}
```

**UI Location:** Below Projects dropdown, above "Your Chats" section

---

## Phase 3: Drag & Drop Chat Reordering (Suggestion #4)
**Files to modify:**
- `app/(dashboard)/dashboard/page.tsx` - Add drag-drop handlers
- `lib/db/kv.ts` - Add chat order field

**Implementation:** Native HTML5 drag-drop API (no external deps), visual feedback during drag, persist order to DB

---

## Phase 4: Message Reactions (Suggestion #11)
**User Notes:** "Make it like Discord, react to AI messages"

**Files to modify:**
- `lib/db/kv.ts` - Add reactions to ChatMessage
- `app/(dashboard)/dashboard/page.tsx` - Reaction UI on messages
- `components/ui/emoji-picker.tsx` - NEW: Compact emoji picker

**Data Model:**
```typescript
interface Reaction {
  emoji: string
  count: number
  userReacted: boolean
}
// Add to ChatMessage: reactions?: Reaction[]
```

**UI:** Hover to show "+" button, click to open emoji picker, reactions display below message

---

## Phase 5: Message Bookmarks & 3-Dot Menu (Suggestion #12)
**User Notes:** "3-dot menu showing small context menu like right-click, buttons: bookmark, branch, etc"

**Files to create:**
- `components/ui/message-menu.tsx` - 3-dot dropdown menu

**Files to modify:**
- `lib/db/kv.ts` - Add bookmarked field to messages
- `app/(dashboard)/dashboard/page.tsx` - Message action menu
- `app/api/bookmarks/route.ts` - NEW: Bookmarks API

**Menu Options:**
- 📌 Bookmark
- 🌿 Branch from here
- 📋 Copy message
- 🔄 Regenerate (if assistant)
- 🗑️ Delete message

---

## Phase 6: Message Replying/Threading (Suggestion #17)
**User Notes:** "Like Discord/Twitter, shows what you're replying to in chat bar"

**Files to modify:**
- `components/ui/chat-input.tsx` - Reply preview bar
- `app/(dashboard)/dashboard/page.tsx` - Reply state management
- `lib/db/kv.ts` - Add replyTo field to messages

**UI:**
- Click reply on message → shows preview bar above input
- Preview shows: replied message snippet + X to cancel
- Sent message shows "replying to: [preview]" styled like Discord

---

## Phase 7: Voice Input (Suggestion #18)
**User Notes:** "Free library, accurate, text inserted after user stops recording"

**Implementation:** Web Speech API (built-in, free, accurate)

**Files to modify:**
- `components/ui/chat-input.tsx` - Add mic button, recording state

**Flow:**
1. Click mic → start recording (button turns red, pulsing)
2. Speak → interim results shown in input (grayed)
3. Stop recording → final text inserted
4. User can edit before sending

---

## Phase 8: Diff View Component (Suggestion #27)
**User Notes:** "Like Windsurf - green background for new lines, red for deletions, full line highlight not text color"

**Files to create:**
- `components/ui/diff-view.tsx` - Diff visualization component

**Specifications:**
- Line-by-line diff (not character)
- Added lines: `bg-green-500/20` full line
- Deleted lines: `bg-red-500/20` full line
- Line numbers on both sides
- Collapsible unchanged sections
- Does NOT modify files - preview only

---

## Phase 9: Bulk Tool System (Suggestion #42)
**User Notes:** "AI calls `bulk` tool with sub-tools, all execute simultaneously, AI gets all results at once after batch completes"

**Files to modify:**
- `lib/ai/tools.ts` - Add bulk tool definition
- `lib/ai/executor.ts` - Bulk tool execution logic
- `internal_prompt.md` - Document bulk tool usage

**Tool Definition:**
```typescript
{
  name: "bulk",
  description: "Execute multiple tools in parallel",
  parameters: [
    { name: "tools", type: "object", required: true, description: "Array of {name, args} tool calls" }
  ]
}
```

**Execution:** `Promise.all()` for parallel execution, aggregate results, return combined result to AI

---

## Phase 10: Output Log Console (Suggestion #49)
**User Notes:** "Real-time, colored for errors/warnings/info, timestamps in light blue with brackets, like Roblox output"

**Files to create:**
- `components/ui/output-console.tsx` - Log console component

**Location:** Resizable panel at bottom or right side (user can toggle/resize)

**Colors:**
- Timestamp: `text-sky-400` in `[HH:MM:SS]`
- Error: `text-red-400`
- Warning: `text-amber-400`
- Info: `text-white/70`
- Success: `text-emerald-400`

---

## Phase 11: Smart Edit Utility (Suggestion #50)
**User Notes:** "Like Windsurf edit handling - more context so system knows edits applied correctly"

**Files to modify:**
- `lib/ai/executor.ts` - Enhanced edit validation
- `internal_prompt.md` - Add edit context instructions

**Implementation:**
- Include surrounding context lines in edit operations
- Validate old content exists before replacing
- Return detailed success/failure info
- Match Windsurf's edit tool pattern

---

## Phase 12: Roblox Context Awareness (Suggestion #74)
**User Notes:** "When Roblox connected, send game structure - place name, descendants tree of ReplicatedStorage, ServerScriptService, etc. NOT Workspace/ServerStorage (too large)"

**Files to modify:**
- `lib/ai/prompt.ts` - Add Roblox context builder
- `app/(dashboard)/dashboard/page.tsx` - Fetch game structure on connect
- `app/api/rivet/route.ts` - Add structure request signal

**Included Services:**
- ReplicatedStorage
- ReplicatedFirst
- ServerScriptService
- StarterGui
- StarterPack
- StarterPlayer

**Excluded (token limits):**
- Workspace
- ServerStorage

---

## Phase 13: AI Memory System (Suggestion #75)
**User Notes:** "Toggle on/off (default on), manage saved memories, toggles for: Reference saved memories, Reference chat history, AI learns from mistakes"

**Files to create:**
- `app/api/memories/route.ts` - Memory CRUD API
- `components/ui/memory-manager.tsx` - Memory management UI

**Files to modify:**
- `lib/db/kv.ts` - Memory storage model
- `lib/ai/prompt.ts` - Inject memories into context
- `components/ui/settings-modal.tsx` - Memory settings tab

**Data Model:**
```typescript
interface Memory {
  id: string
  userId: string
  content: string
  source: "ai_learned" | "user_added" | "mistake_correction"
  createdAt: number
}
```

**Settings:**
- Toggle: Use saved memories
- Toggle: Reference chat history
- Toggle: Learn from mistakes
- Manage memories button → opens manager modal

---

## Phase 14: Progressive Loading & Request Batching (Suggestions #137, #139)

**Progressive Loading:**
- Skeleton loaders for chats list
- Lazy load message history
- Virtualized message list for long chats

**Request Batching:**
- Combine multiple API calls where possible
- Debounce rapid updates
- Queue non-critical requests

---

## Phase 15: Remove XOR Encryption & Empty Catches (Suggestions #141, #145)

**Files to modify:**
- `lib/crypto.browser.ts` - Remove XOR, use proper AES-GCM only
- `lib/crypto.ts` - Same
- Multiple files - Add proper error handling to empty catch blocks

**Changes:**
- Replace `encryptdata`/`decryptdata` with secure implementation
- Add `console.error` or proper handling to all empty `catch {}` blocks

---

## Phase 16: Real-time Date Context
**User Notes:** "Give AI current date like Windsurf, no private info like location"

**Files to modify:**
- `lib/ai/prompt.ts` - Add date to system prompt
- `app/api/chat/route.ts` - Pass current date

**Format:** `Current Date: Saturday, February 8, 2025`

---

## Phase 17: Micro-animations (Suggestion #147)
**User Notes:** "No AI-generated feel, no purple gradient, premium fluent"

**Files to modify:**
- `app/globals.css` - Add animation utilities
- Various components - Add subtle animations

**Animations to add:**
- Button hover: subtle scale + shadow
- Card hover: lift effect
- List items: staggered fade-in
- Modal: slide + fade
- Dropdown: scale from origin
- Loading states: skeleton shimmer
- Focus rings: smooth transition

---

## Implementation Order

1. **Phase 1** - Core components (Toast, Tooltip, ErrorBoundary)
2. **Phase 15** - Security fixes (remove XOR, fix empty catches)
3. **Phase 16** - Date context (quick win)
4. **Phase 17** - Micro-animations (foundation)
5. **Phase 2** - Categories (requires context menu work)
6. **Phase 3** - Drag & drop
7. **Phase 4** - Reactions
8. **Phase 5** - Bookmarks & menu
9. **Phase 6** - Replying
10. **Phase 7** - Voice input
11. **Phase 8** - Diff view
12. **Phase 9** - Bulk tool
13. **Phase 10** - Output console
14. **Phase 11** - Smart edit
15. **Phase 12** - Roblox context
16. **Phase 13** - Memory system
17. **Phase 14** - Progressive loading

---

## Estimated Files to Create/Modify

**New Files (12):**
- `components/ui/tooltip.tsx`
- `components/ui/toast.tsx`
- `components/ui/error-boundary.tsx`
- `components/ui/icon-picker.tsx`
- `components/ui/emoji-picker.tsx`
- `components/ui/message-menu.tsx`
- `components/ui/diff-view.tsx`
- `components/ui/output-console.tsx`
- `components/ui/memory-manager.tsx`
- `app/api/bookmarks/route.ts`
- `app/api/memories/route.ts`
- `lib/ai/bulk-executor.ts`

**Modified Files (15+):**
- `lib/db/kv.ts`
- `lib/ai/tools.ts`
- `lib/ai/executor.ts`
- `lib/ai/prompt.ts`
- `lib/crypto.ts`
- `lib/crypto.browser.ts`
- `app/(dashboard)/dashboard/page.tsx`
- `app/api/chat/route.ts`
- `app/api/rivet/route.ts`
- `app/globals.css`
- `components/ui/chat-input.tsx`
- `components/ui/context-menu.tsx`
- `components/ui/settings-modal.tsx`
- `internal_prompt.md`

---

## Ready to Implement?
Reply with **"yes"** or **"go"** to start implementation, or provide any modifications to the plan.
