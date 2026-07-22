# Pi Agent Config

Konfigurasi, themes, dan extensions Pi Coding Agent-ku.

## Cara clone + setup (buat temen)

```bash
# 1. Backup ~/.pi lu dulu kalo udah ada
mv ~/.pi ~/.pi.bak

# 2. Clone repo jadi ~/.pi
git clone <repo-url> ~/.pi

# 3. Install semua packages
cd ~/.pi/agent/npm
npm install

# 4. Setup API key lu sendiri
# Buat file ~/.pi/agent/auth.json isinya:
# {
#   "firecrawl": { "type": "api_key", "key": "fc-xxx" },
#   "openrouter": { "type": "api_key", "key": "sk-or-v1-xxx" }
# }
# Daftar API key sesuai provider yang lu pake
```

> ⚠️ **Jangan commit file sensitif!** `auth.json`, `sessions/`, `git/`, `context-mode/`, `trust.json`, `run-history.jsonl` udah di-.gitignore.

## Isi repo

| Path | Isi |
|------|-----|
| `.pi/settings.json` | Skill yang diaktifin |
| `.pi/agent/settings.json` | Model, theme, packages, provider |
| `.pi/agent/keybindings.json` | Keybindings kustom |
| `.pi/agent/themes/` | Tema kustom |
| `.pi/agent/extensions/` | Extension scripts |
| `.pi/agent/intercom/` | Intercom config |
| `.pi/agent/npm/package.json` | Dependencies |