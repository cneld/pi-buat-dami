# Setup Pi Agent dari Repo Ini v1.3.0

## Buat temen (clone repo ini)

### 1. Backup punya lu sendiri (kalo udah pake pi agent)

```powershell
# PowerShell
Rename-Item "$env:USERPROFILE\.pi" "$env:USERPROFILE\.pi.bak"
```

```cmd
# CMD
rename "%USERPROFILE%\.pi" "%USERPROFILE%\.pi.bak"
```

### 2. Clone repo jadi `~/.pi`

```cmd
git clone https://github.com/cneld/pi-buat-dami.git "%USERPROFILE%\.pi"
```

### 3. (Otomatis) Pi install packages dari `agent/settings.json`

Pas pertama pi jalan, dia bakal auto-install semua packages yang ada di array `packages`.
Ga perlu `npm install` manual lagi.

### 4. Setup API key

Buat file `%USERPROFILE%\.pi\agent\auth.json` isinya:

```json
{
  "firecrawl": {
    "type": "api_key",
    "key": "fc-xxx"
  },
  "openrouter": {
    "type": "api_key",
    "key": "sk-or-v1-xxx"
  }
}
```

Sesuaiin sama provider yang lu pake. Default model sekarang `opencode/laguna-s-2.1-free` (gratis, tanpa API key). Kalo mau model lain, tambahin key provider-nya (misal `openrouter`).

### 5. (Opsional) MCP servers

Repo ini **ga** nyimpen `agent/mcp.json` (isinya API key, di-gitignore). Kalo mau pake MCP server (Supabase, Obsidian, GitHub, dll), buat sendiri file `%USERPROFILE%\.pi\agent\mcp.json` — formatnya:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "ghp_xxx" }
    }
  }
}
```

Pakai token lu sendiri — jangan pernah share file ini.

### 6. (Opsional) Second Brain vault path

Set env variable `PI_VAULT_PATH` atau edit di `agent/extensions/clarify.ts`.

> ⚠️ Catatan: repo ini punya extension `clarify.ts` yang ngarah ke Second Brain vault punya pembuatnya — hapus atau edit bagian itu kalo ga mau pake.

### Checkout versi tertentu

```cmd
cd /d "%USERPROFILE%\.pi"
git tag -l
git checkout v1.3.0
```
