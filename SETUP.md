# Setup Pi Agent dari Repo Ini v0.82.0

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

Sesuaiin sama provider yang lu pake.

### 5. (Opsional) Second Brain vault path

Set env variable `PI_VAULT_PATH` atau edit di `agent/extensions/clarify.ts`.

### Checkout versi tertentu

```cmd
cd /d "%USERPROFILE%\.pi"
git tag -l
git checkout v0.82.0
```
