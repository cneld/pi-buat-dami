/**
 * Luxury Retro Pixel Art Header Extension for Pi Coding Agent
 * Logo: Pixel Art 𝞹 (AGY / Obsidian CLI Style)
 * Replaces startup splash animation with an ornate permanent header banner at the top of Pi Agent TUI.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { existsSync } from "node:fs";

// ============================================================
// ANSI TRUECOLOR & FALLBACK COLOR HELPERS
// ============================================================
const c = {
  goldBright: (s: string) => `\x1b[1;38;2;255;223;0m${s}\x1b[0m`,
  gold:       (s: string) => `\x1b[38;2;230;185;35m${s}\x1b[0m`,
  goldDark:   (s: string) => `\x1b[38;2;210;155;25m${s}\x1b[0m`,
  amber:      (s: string) => `\x1b[38;2;255;191;0m${s}\x1b[0m`,
  amberBold:  (s: string) => `\x1b[1;38;2;255;191;0m${s}\x1b[0m`,
  bronze:     (s: string) => `\x1b[38;2;195;130;40m${s}\x1b[0m`,
  crimson:    (s: string) => `\x1b[38;2;199;21;133m${s}\x1b[0m`,
  emerald:    (s: string) => `\x1b[38;2;46;204;113m${s}\x1b[0m`,
  ivoryBold:  (s: string) => `\x1b[1;97m${s}\x1b[0m`,
  slate:      (s: string) => `\x1b[38;2;130;125;110m${s}\x1b[0m`,
  dim:        (s: string) => `\x1b[2m${s}\x1b[22m`,
};

const VAULT = process.env.PI_SECOND_BRAIN_VAULT || "C:/Users/ranel/Desktop/pi&Secondbrain";

function checkObsidianConnection(): boolean {
  try {
    return existsSync(VAULT);
  } catch {
    return false;
  }
}

function visibleLen(str: string): number {
  return str.replace(/\x1b\[[0-9;]*m/g, "").length;
}

function shortenPath(fullPath: string): string {
  const home = process.env.HOME || process.env.USERPROFILE || "";
  const p = fullPath.replace(/\\/g, "/");
  if (p.startsWith(home)) return "~" + p.slice(home.length);
  const parts = p.split("/");
  if (parts.length > 3) return parts.slice(0, 2).join("/") + "/.../" + parts.slice(-1)[0];
  return p;
}

async function getGitBranch(cwd: string): Promise<string> {
  try {
    const { execSync } = require("child_process");
    const branch = execSync("git rev-parse --abbrev-ref HEAD", {
      cwd,
      encoding: "utf8",
      timeout: 1500,
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
    return branch || "";
  } catch {
    return "";
  }
}

// 5-Line Pixel Art Pi Symbol Logo
const PIXEL_PI_WIDE = [
  c.goldBright(" ▄████████████████▄ "),
  c.gold(      "▐██▀▀▀▀████▀▀▀▀████▌"),
  c.goldDark(  "  ███▌  ███▌   ███▌ "),
  c.bronze(    "  ███▌  ███▌   ███▌ "),
  c.bronze(    " ▄███▄  ███▄  ▄███▄ "),
];

// 3-Line Compact Pixel Art Pi Symbol Logo
const PIXEL_PI_COMPACT = [
  c.goldBright(" ▄██████████▄ "),
  c.gold(      "▐██▀▀████▀▀██▌"),
  c.bronze(    " ▀██  ██  ██ ▀"),
];

// ============================================================
// LUXURY RETRO PIXEL ART HEADER COMPONENT
// ============================================================
class LuxuryRetroHeaderComponent {
  private cwd: string;
  private gitBranch: string;
  private isBusy: boolean = false;
  private tui?: { requestRender: () => void };

  constructor(cwd: string, gitBranch: string) {
    this.cwd = cwd;
    this.gitBranch = gitBranch;
  }

  setTui(tui: { requestRender: () => void }) {
    this.tui = tui;
  }

  setBusy(busy: boolean) {
    if (this.isBusy !== busy) {
      this.isBusy = busy;
      this.tui?.requestRender();
    }
  }

  render(width: number): string[] {
    const safeW = Math.max(36, width);
    const boxW = Math.min(safeW, 96);
    const innerW = boxW - 2;

    const shortCwd = shortenPath(this.cwd);
    const branchStr = this.gitBranch ? `  ${this.gitBranch}` : "  local";
    const dirContent = `❖ ${shortCwd}`;

    const logoTitle = `${c.goldBright("✦ 𝞹 ✦")}  ${c.ivoryBold("P I   C O D I N G   A G E N T")}`;
    const obsidianStatus = checkObsidianConnection()
      ? c.emerald("🧠 OBSIDIAN SECOND BRAIN: CONNECTED")
      : c.crimson("🧠 OBSIDIAN SECOND BRAIN: DISCONNECTED");
    const statusText = this.isBusy ? c.amber("⚡ BUSY") : c.emerald("● READY");

    if (boxW >= 78) {
      // 5-Line Side-by-Side Pixel Art Header (AGY / Obsidian CLI style)
      const topBorder = c.gold(`╔${"═".repeat(innerW)}╗`);
      const botBorder = c.gold(`╚${"═".repeat(innerW)}╝`);

      const rightLines = [
        logoTitle,
        obsidianStatus,
        c.bronze(dirContent),
        `${c.emerald(branchStr)}   ${statusText}`,
        c.slate("✦ Intelligent Coding Agent  │  𝞹 TUI"),
      ];

      const lines: string[] = [topBorder];
      const logoW = 20; // visible width of PIXEL_PI_WIDE

      for (let i = 0; i < 5; i++) {
        const leftPixel = PIXEL_PI_WIDE[i];
        const rightText = rightLines[i];
        const rightLen = visibleLen(rightText);
        const gap = Math.max(1, innerW - logoW - 3 - rightLen - 2);

        const row = `  ${leftPixel} ${c.gold("│")} ${rightText}${" ".repeat(gap)} `;
        lines.push(c.gold("║") + row + c.gold("║"));
      }

      lines.push(botBorder);
      return lines;
    } else if (boxW >= 56) {
      // 5-Line Centered Stacked Pixel Art Header
      const crown = ` ${c.goldBright("⚜ 𝞹 ⚜")} `;
      const crownLen = 7;
      const sideLen = Math.max(2, Math.floor((innerW - crownLen) / 2));
      const extra = (innerW - crownLen) % 2 !== 0 ? "═" : "";
      const topBorder = c.gold(`╔${"═".repeat(sideLen)}`) + crown + c.gold(`${"═".repeat(sideLen)}${extra}╗`);
      const botBorder = c.gold(`╚${"═".repeat(innerW)}╝`);

      const lines: string[] = [topBorder];

      // Centered Pixel Pi
      for (const pxLine of PIXEL_PI_WIDE) {
        const pxLen = visibleLen(pxLine);
        const sidePad = Math.max(0, Math.floor((innerW - pxLen) / 2));
        const extraPad = (innerW - pxLen) % 2 !== 0 ? " " : "";
        lines.push(c.gold("║") + " ".repeat(sidePad) + pxLine + " ".repeat(sidePad) + extraPad + c.gold("║"));
      }

      // Title & Metadata
      const l1 = `✦ ${c.ivoryBold("PI CODING AGENT")} ✦`;
      const l1Pad = Math.max(0, Math.floor((innerW - visibleLen(l1)) / 2));
      const l1Extra = (innerW - visibleLen(l1)) % 2 !== 0 ? " " : "";
      lines.push(c.gold("║") + " ".repeat(l1Pad) + l1 + " ".repeat(l1Pad) + l1Extra + c.gold("║"));

      const obsCompact = checkObsidianConnection() ? c.emerald("🧠 OBSIDIAN: CONNECTED") : c.crimson("🧠 OBSIDIAN: DISCONNECTED");
      const l2 = `${c.bronze(dirContent)}  │  ${c.emerald(branchStr)}  │  ${obsCompact}`;
      const l2Pad = Math.max(0, Math.floor((innerW - visibleLen(l2)) / 2));
      const l2Extra = (innerW - visibleLen(l2)) % 2 !== 0 ? " " : "";
      lines.push(c.gold("║") + " ".repeat(l2Pad) + l2 + " ".repeat(l2Pad) + l2Extra + c.gold("║"));

      lines.push(botBorder);
      return lines;
    } else {
      // Compact Pixel Art Header for narrow screens
      const topBorder = c.gold(`╔${"═".repeat(innerW)}╗`);
      const botBorder = c.gold(`╚${"═".repeat(innerW)}╝`);
      const lines: string[] = [topBorder];

      const rightL1 = c.ivoryBold("PI CODING AGENT");
      const rightL2 = c.bronze(shortCwd.slice(-18));
      const obsIcon = checkObsidianConnection() ? c.emerald("🧠 CONNECTED") : c.crimson("🧠 DISCONNECTED");
      const rightL3 = `${statusText} │ ${obsIcon}`;

      const rightCompact = [rightL1, rightL2, rightL3];
      const pxW = 14;

      for (let i = 0; i < 3; i++) {
        const leftPixel = PIXEL_PI_COMPACT[i];
        const rightText = rightCompact[i];
        const gap = Math.max(0, innerW - pxW - 3 - visibleLen(rightText) - 1);
        const row = ` ${leftPixel} ${c.gold("│")} ${rightText}${" ".repeat(gap)}`;
        lines.push(c.gold("║") + row + c.gold("║"));
      }

      lines.push(botBorder);
      return lines;
    }
  }

  invalidate() {}
}

// ============================================================
// EXTENSION ENTRY
// ============================================================
export default function (pi: ExtensionAPI) {
  let headerComponent: LuxuryRetroHeaderComponent | null = null;

  pi.on("session_start", async (_event, ctx) => {
    if (ctx.mode !== "tui") return;

    let branch = "";
    try {
      branch = await getGitBranch(ctx.cwd);
    } catch {}

    headerComponent = new LuxuryRetroHeaderComponent(ctx.cwd, branch);

    ctx.ui.setHeader((tui, _theme) => {
      if (headerComponent) {
        headerComponent.setTui(tui);
      }
      return headerComponent;
    });
  });

  pi.on("agent_start", async () => {
    headerComponent?.setBusy(true);
  });

  pi.on("agent_end", async () => {
    headerComponent?.setBusy(false);
  });

  pi.registerCommand("header", {
    description: "Show Pi Luxury Retro Pixel Art Header status",
    handler: async (_args, ctx) => {
      ctx.ui.notify("𝞹 Pi Agent Retro Pixel Art Header is Active", "info");
    },
  });
}
