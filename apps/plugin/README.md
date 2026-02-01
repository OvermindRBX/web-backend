<div align='center'>
  <h1>🧠 Overmind</h1>
  <b>AI-powered development assistant for Roblox Studio</b>
</div>

# Overmind Roblox Plugin

Overmind plugin connects your Roblox Studio to the Overmind AI web dashboard, enabling AI-assisted development directly in Studio.

## Features

- **AI-Powered Development** - Chat with AI on web, actions execute in Studio
- **Script Management** - Create, update, delete scripts via AI
- **Object Manipulation** - Create, modify, move, clone objects
- **Search Tools** - Find instances, grep through scripts
- **Code Execution** - Run Luau code on demand

## Setup

1. Install the plugin in Roblox Studio
2. Get your API key from [overmindai.vercel.app](https://overmindai.vercel.app)
3. Enter your API key and click Connect
4. Start chatting with AI on the web dashboard

## Development

```bash
# Install tools
aftman install

# Install dependencies
wally install

# Build plugin
rojo build -o Overmind.rbxm
```

## Tech Stack

- **Fusion** - Reactive UI framework
- **Wally** - Package manager
- **Selene** - Linter
- **StyLua** - Formatter
- **Rojo** - Build tool
