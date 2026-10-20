# Pi Agent Config v1.3.0

Konfigurasi, themes, extensions, dan skills Pi Coding Agent-ku.

> **Tag version:** `v1.3.0` — cek tag lain via `git tag -l`.

## Cara clone + setup

```bash
# 1. Backup ~/.pi lu kalo udah ada
mv ~/.pi ~/.pi.bak

# 2. Clone repo jadi ~/.pi
git clone https://github.com/cneld/pi-buat-dami.git ~/.pi

# 3. (Otomatis) Pi bakal install packages dari `agent/settings.json` pas pertama jalan

# 4. Setup API key
# Buat file ~/.pi/agent/auth.json isinya:
# {
#   "firecrawl": { "type": "api_key", "key": "fc-xxx" },
#   "openrouter": { "type": "api_key", "key": "sk-or-v1-xxx" }
# }
# Sesuaiin sama provider yang lu pake
```

> ⚠️ **File sensitif udah di-.gitignore:** `auth.json`, `mcp.json`, `sessions/`, `missions/`, `pi-subagents/`, `context-mode/`, `intercom/`, `teams/`, `tasks/`, `run-history.jsonl`, `mcp-cache.json`, `models-store.json`.

## Isi repo

| Path | Isi |
|------|-----|
| `README.md` | Ini |
| `SETUP.md` | Cara setup detail (PowerShell, CMD) |
| `PUSH.md` | Panduan push config ke repo |
| `settings.json` | Skill yang diaktifin |
| `pi-input-revamp.json` | Layout input bar & animasi |
| `agent/settings.json` | Model, theme, 25 packages, provider, thinking level |
| `agent/keybindings.json` | Keybindings kustom |
| `agent/themes/` | Tema (gruvbox-dark-hard default) |
| `agent/extensions/` | Extension scripts (clarify, input-bar-mcp-status, dll) |
| `agent/extensions/pi-permission-system/` | Permission system config |
| `agent/skills/` | Agent skills (ask-user-gate, caveman, system-audit, computer-use, diagnosing-bugs, orca-cli) |
| `agent/git/` | Git config per-domain |
| `skills/` | Skill repos (academic-research-skills, init) |
| `qcode/settings.json` | QCode settings |

## Packages terinstall (25)

Via `agent/settings.json` — auto-installed:

`pi-subagents`, `context-mode`, `@haispeed/pi-obsidian`, `@rokiy/pi-ui`, `@dietrichgebert/ponytail`, `@mjasnikovs/pi-task`, `@narumitw/pi-goal`, `@narumitw/pi-lsp`, `@narumitw/pi-github-pr`, `@narumitw/pi-chrome-devtools`, `@narumitw/pi-wait-what`, `@gaodes/pi-graphify`, `pi-intercom`, `@tintinweb/pi-tasks`, `@juicesharp/rpiv-ask-user-question`, `@juicesharp/rpiv-todo`, `@johnnywu/pi-filechanges`, `@ogulcancelik/pi-herdr`, `@andrewjacop/pi-herdr`, `pi-prompt-workflows`, `@satas/pi-usage-bar`, `@tmustier/pi-agent-teams`, `@nerisma/pi-input-revamp`, `pi-clinepass-provider`, `@gotgenes/pi-permission-system`

> Ganti dari v0.82.0: `pi-web-access`, `pi-firecrawl` & `pi-mcp-adapter` dicabut; `pi-clinepass-provider` & `@andrewjacop/pi-herdr` ditambahin.

## Provider & model

| Provider | Model |
|----------|-------|
| openrouter | claude-sonnet-latest, claude-opus-latest, deepseek-v4-flash, deepseek-v4-pro |
| openai-codex | gpt-5.5, gpt-5.6-terra, gpt-5.6-sol |
| opencode (default) | laguna-s-2.1-free, deepseek-v4-flash-free |

Default thinking: `high`, default tools: `+codemode`