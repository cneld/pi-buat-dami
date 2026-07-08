# Setup Pi Agent dari Repo Ini

## Buat temen (yang clone repo ini)

### 1. Backup dulu punya lu sendiri (kalo udah pake pi agent)

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
git clone <repo-url> "%USERPROFILE%\.pi"
```

### 3. Install packages

```cmd
cd /d "%USERPROFILE%\.pi\agent\npm"
npm install
```

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

Daftar key yang perlu disesuaikan sama provider yang lu pake.

### 5. (Opsional) Vault path buat Second Brain

Set env variable `PI_VAULT_PATH` atau edit langsung di `~/.pi/agent/extensions/clarify.ts`.
