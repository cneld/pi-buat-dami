# Push Guide — Pi Agent Config

## Sebelum Push

```powershell
cd ~\.pi
```

### Cek status

```powershell
git status
```

### Cek apa aja yang berubah (diff)

```powershell
git diff --stat
```

### Cek kalo ada file sensitif kecantol

```powershell
git status | Select-String "auth|secret|key|token|session|run-history"
```

─ Kalo ada yang nggak seharusnya, tambahin ke `.gitignore` atau `git rm --cached`.
─ `.gitignore` udah nge-filter: `auth.json`, `session/`, `run-history.jsonl`, `mcp-cache.json`, `context-mode/`, `intercom/`, `teams/`, `tasks/`, `node_modules/`, permission logs, dan `~/.omp` files.

---

## Commit

```powershell
git add -A
git commit -m "pesan jelas"
```

**Contoh pesan commit:**
- `"Tambah theme catppuccin-mocha"`
- `"Update settings model baru"`
- `"Fix: extension orca-prefill error"`
- `"Bersihin duplikat file"`
- `"v2 — ganti default provider ke openrouter"`

---

## Tag Versi

Kalo ini versi baru (teman bisa checkout versi tertentu):

```powershell
git tag v0.82.0           # tag versi sekarang
git push origin v0.82.0   # push tag
```

Teman clone:

```cmd
git clone <url> ~\.pi
git checkout v0.82.0      # ambil versi tertentu
```

---

## Push

```powershell
git push origin main
```

Kalo pake tag:

```powershell
git push origin main --tags
```

---

## Yang Kepush

| Path | Isi |
|------|-----|
| `settings.json` | Skill yang diaktifin |
| `agent/settings.json` | Model, theme, packages, provider |
| `agent/keybindings.json` | Keybindings kustom |
| `agent/themes/` | Tema (gruvbox-dark-hard default) |
| `agent/extensions/` | Extension scripts (clarify, input-bar-mcp-status, orca-prefill, dll) |
| `agent/extensions/pi-permission-system/` | Permission system config |
| `agent/git/` | Git config per-domain |
| `agent/skills/` | Agent skills (caveman, ask-user-gate, system-audit) |
| `agent/trust.json` | Trusted directories |
| `agent/usage-bar.json` | Usage bar config |
| `agent/mcp-onboarding.json` | MCP onboarding state |
| `skills/` | Skill repos (academic-research-skills) |
| `pi-input-revamp.json` | Input bar layout & animasi config |
| `qcode/settings.json` | QCode settings |
| `README.md` | Info repo |
| `SETUP.md` | Cara setup buat temen |
| `PUSH.md` | Ini |

## Yang Gak Kepush (aman)

| Dilewati | Karena |
|----------|--------|
| `auth.json` | API keys, OAuth tokens |
| `models-store.json` | Model API config |
| `sessions/` | Riwayat chat pribadi |
| `run-history.jsonl` | Prompt & response |
| `mcp-cache.json` | Responses dari tools (bocorin data) |
| `context-mode/` | Indexed content |
| `intercom/`, `teams/` | IPC & orchestration |
| `tasks/` | Task artifacts |
| `node_modules/` | Bisa 500MB+ |
| `~/.omp/` | Oh My Pi (udah gak dipake) |
| Permission logs | Isinya command & path |

---

## Flow Cepet

```powershell
cd ~\.pi
git status
git add -A
git commit -m "update config"
git push origin main
```

Kalau versi baru:

```powershell
git tag v3
git push origin main --tags
```
