/**
 * Pixel Art Splash V2 — wok berapi + input bar, semua di tengah
 * Kayak Opencode tapi pake wajan
 *
 * JALANIN: /splash-v2
 * V1 (original) tetap aman di pixel-splash.ts
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

// ============================================================
// PIXEL ART — WOK BERAPI
// ============================================================

const WOK = [
	"   \\u256d\\u2588\\u2588\\u256e\\u256d\\u2588\\u2588\\u256e   ",
	"  \\u2588\\u2588\\u2594\\u2594\\u2594\\u2594\\u2594\\u2594\\u2594\\u2588\\u2588  ",
	" \\u2588\\u2588      \\u2588\\u2588 ",
	" \\u2588\\u2588  \\u2588\\u2588\\u2588  \\u2588\\u2588 ",
	"\\u2588\\u2588\\u2588\\u2588\\u2588\\u2588\\u2588\\u2588\\u2588\\u2588\\u2588\\u2588\\u2588\\u2588\\u2588\\u2588",
	"\\u2588\\u2588\\u2588\\u2588\\u2588\\u2588\\u2588\\u2588\\u2588\\u2588\\u2588\\u2588\\u2588\\u2588\\u2588\\u2588",
	"\\u2551  \\u2588\\u2588\\u2588\\u2588\\u2588  \\u2551",
	"\\u2551  \\u2588\\u2588\\u2588\\u2588\\u2588  \\u2551",
	" \\u2551  \\u2588\\u2588\\u2588  \\u2551 ",
	" \\u2551  \\u2588\\u2588\\u2588  \\u2551 ",
	"  \\u2551   \\u2588   \\u2551  ",
	"  \\u2551  \\u2588\\u2588\\u2588  \\u2551  ",
	"   \\u255a\\u2500\\u2588\\u2588\\u2588\\u2500\\u255d   ",
	"    \\u255a\\u2500\\u2500\\u2500\\u255d    ",
];

const FLAME_LINE = "     \\u2588\\u2588\\u2588     ";

// ============================================================
// ANSI HELPERS
// ============================================================

const ansi = {
	dim:     (s: string) => `\x1b[2m${s}\x1b[22m`,
	green:   (s: string) => `\x1b[32m${s}\x1b[0m`,
	red:     (s: string) => `\x1b[31m${s}\x1b[0m`,
	yellow:  (s: string) => `\x1b[33m${s}\x1b[0m`,
	orange:  (s: string) => `\x1b[38;5;208m${s}\x1b[0m`,
	magenta: (s: string) => `\x1b[35m${s}\x1b[0m`,
	white:   (s: string) => `\x1b[97m${s}\x1b[0m`,
	bold:    (s: string) => `\x1b[1m${s}\x1b[22m`,
};

function colorizeWok(line: string): string {
	let out = "";
	for (const ch of line) {
		if (ch === "\u2588") out += ansi.red(ch);
		else if (ch === "\u2594") out += ansi.orange(ch);
		else if (ch === "\u2551" || ch === "\u255a" || ch === "\u255d" || ch === "\u2500" || ch === "\u256d" || ch === "\u256e") out += ansi.dim(ch);
		else out += ch;
	}
	return out;
}

function shortenPath(fullPath: string): string {
	const home = process.env.HOME || process.env.USERPROFILE || "";
	const p = fullPath.replace(/\\/g, "/");
	if (p.startsWith(home)) return "~" + p.slice(home.length);
	const parts = p.split("/");
	if (parts.length > 3) return parts.slice(0, 2).join("/") + "/.../" + parts.slice(-1)[0];
	return p;
}

function buildTerminalArt(cwd: string, gitBranch: string): string[] {
	const shortPath = shortenPath(cwd);
	const maxPathLen = 28;
	const displayPath = shortPath.length > maxPathLen ? "..." + shortPath.slice(-(maxPathLen - 3)) : shortPath;
	const branchStr = gitBranch ? ` \u2660 ${gitBranch}` : "";
	const dirContent = `${displayPath}${branchStr}`;
	const dirLine = ` \u2502  ${dirContent.padEnd(33)}\u2502 `;
	return [
		" \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510 ",
		dirLine,
		" \u2502  $ _                            \u2502 ",
		" \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518 ",
	];
}

async function getGitBranch(cwd: string): Promise<string> {
	try {
		const { execSync } = require("child_process");
		const branch = execSync("git rev-parse --abbrev-ref HEAD", { cwd, encoding: "utf8", timeout: 2000, stdio: ["ignore", "pipe", "pipe"] }).trim();
		return branch || "";
	} catch { return ""; }
}

// ============================================================
// SPLASH + CHAT BAR COMPONENT
// ============================================================

class SplashChatComponent {
	private onDone: (input: string | null) => void;
	private tui: { requestRender: () => void };
	private terminalArt: string[];
	private prevWidth = 0;
	private prevLines: string[] = [];
	private inputBuffer = "";
	private cursorPos = 0;

	constructor(
		tui: { requestRender: () => void },
		onDone: (input: string | null) => void,
		cwd: string,
		gitBranch: string,
	) {
		this.tui = tui;
		this.onDone = onDone;
		this.terminalArt = buildTerminalArt(cwd, gitBranch);
	}

	handleInput(data: string): void {
		if (data === "\r" || data === "\n") { this.onDone(this.inputBuffer.trim() || null); return; }
		if (data === "\x1b" || data === "\x03") { this.onDone(null); return; }
		if (data === "\x7f" || data === "\b") {
			if (this.cursorPos > 0) {
				this.inputBuffer = this.inputBuffer.slice(0, this.cursorPos - 1) + this.inputBuffer.slice(this.cursorPos);
				this.cursorPos--;
				this.bust();
			}
			return;
		}
		if (data === "\x04") {
			if (this.cursorPos < this.inputBuffer.length) {
				this.inputBuffer = this.inputBuffer.slice(0, this.cursorPos) + this.inputBuffer.slice(this.cursorPos + 1);
				this.bust();
			}
			return;
		}
		if (data === "\x1b[D" && this.cursorPos > 0) { this.cursorPos--; this.bust(); return; }
		if (data === "\x1b[C" && this.cursorPos < this.inputBuffer.length) { this.cursorPos++; this.bust(); return; }
		if (data === "\x1b[H" || data === "\x01") { this.cursorPos = 0; this.bust(); return; }
		if (data === "\x1b[F" || data === "\x05") { this.cursorPos = this.inputBuffer.length; this.bust(); return; }
		if (data === "\x15") { this.inputBuffer = ""; this.cursorPos = 0; this.bust(); return; }
		if (data.length === 1 && data.charCodeAt(0) >= 32 && data.charCodeAt(0) <= 126) {
			this.inputBuffer = this.inputBuffer.slice(0, this.cursorPos) + data + this.inputBuffer.slice(this.cursorPos);
			this.cursorPos++;
			this.bust();
		}
	}

	private bust() { this.prevWidth = 0; this.tui.requestRender(); }

	invalidate(): void { this.prevWidth = 0; }

	render(width: number): string[] {
		if (width === this.prevWidth && this.prevLines.length) return this.prevLines;

		const boxW = Math.min(50, width - 2);
		const inner = boxW - 2;

		const pad = (s: string) => s + " ".repeat(Math.max(0, width - s.length));
		const empty = pad(` \u2502${" ".repeat(inner)}\u2502`);
		const mid = (text: string) => {
			const tl = text.length;
			const side = Math.max(0, Math.floor((inner - tl) / 2));
			const extra = (tl % 2 !== inner % 2) ? " " : "";
			return pad(` \u2502${" ".repeat(side)}${text}${" ".repeat(side)}${extra}\u2502`);
		};

		const lines: string[] = [];

		lines.push(pad(` \u256d${"\u2500".repeat(inner)}\u256e`));
		lines.push(empty);

		for (const line of this.terminalArt) {
			lines.push(mid(ansi.green(line.replace("$ _", ansi.yellow("$ _")))));
		}
		lines.push(empty);

		lines.push(mid(colorizeWok(FLAME_LINE)));
		lines.push(empty);

		for (const line of WOK) {
			lines.push(mid(colorizeWok(line)));
		}
		lines.push(empty);

		lines.push(mid(ansi.magenta(ansi.bold("\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557"))));
		lines.push(mid(`${ansi.magenta(ansi.bold("\u2551"))}  ${ansi.white(ansi.bold("\u2726 PI CODING AGENT \u2726"))}  ${ansi.magenta(ansi.bold("\u2551"))}`));
		lines.push(mid(ansi.magenta(ansi.bold("\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d"))));
		lines.push(empty);
		lines.push(pad(` \u251c${"\u2500".repeat(inner)}\u2524`));
		lines.push(empty);

		const prompt = ansi.green(">");
		let inputLine: string;
		if (this.inputBuffer) {
			const before = this.inputBuffer.slice(0, this.cursorPos);
			const at = this.inputBuffer[this.cursorPos] || " ";
			const after = this.inputBuffer.slice(this.cursorPos + 1);
			inputLine = `${prompt} ${before}\x1b[7m${at}\x1b[27m${after}`;
		} else {
			inputLine = `${prompt} ${ansi.dim("Type a message and press Enter...")}`;
		}
		lines.push(mid(inputLine));
		lines.push(mid(`${ansi.dim("Enter=")}${ansi.white(ansi.bold("send"))}${ansi.dim(" | Esc=")}${ansi.white(ansi.bold("cancel"))}`));
		lines.push(empty);
		lines.push(pad(` \u2570${"\u2500".repeat(inner)}\u256f`));

		this.prevLines = lines;
		this.prevWidth = width;
		return lines;
	}
}

// ============================================================
// EXTENSION ENTRY
// ============================================================

export default function (pi: ExtensionAPI) {
	pi.registerCommand("splash-v2", {
		description: "Show splash screen with inline chat bar (like Opencode)",
		handler: async (_args, ctx) => {
			if (ctx.mode !== "tui") {
				ctx.ui.notify("Splash requires interactive mode", "error");
				return;
			}
			try {
				const branch = await getGitBranch(ctx.cwd);
				const input = await ctx.ui.custom<string | null>(
					(tui, _theme, _kb, done) => new SplashChatComponent(tui, done, ctx.cwd, branch),
				);
				if (input) {
					pi.sendUserMessage(input, { triggerTurn: true, deliverAs: "followUp" });
				}
			} catch (err) {
				ctx.ui.notify("Splash-v2 failed to render", "error");
			}
		},
	});
}