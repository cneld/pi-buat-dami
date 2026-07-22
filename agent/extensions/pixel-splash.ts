/**
 * Pixel Art Splash Screen Extension
 * Menampilkan pixel art landing page animasi saat pi startup
 * Directory bar dynamic — ikut cwd & git branch real-time
 * 
 * Cara pake: restart pi, liat splash screen!
 * Kalo mau liat lagi, ketik /splash
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

// ============================================================
// PIXEL ART SPRITES
// ============================================================

type Frame = string[];

// Pixel art robot / coding mascot — 2 frame animasi mata
const ROBOT_FRAMES: Frame[] = [
	[
		" ╔═══════════╗ ",
		"╔═╝███████████╚═╗",
		"║ ██╔═════╗██ ██║",
		"║ ██║ ● ● ║██ ██║",
		"║ ██║  ■  ║██ ██║",
		"║ ██╚═══╤══╝██ ██║",
		"║ ██    │   ██ ██║",
		"╚═╗███████████╔═╝",
		"  ║ ═══╤═╤═══ ║  ",
		"  ║ ██ │ │ ██ ║  ",
		"╔═╝ ██║ ║██ ╚═╗",
		"║ █████████████ ║",
		"║ ██╔═══════╗██ ║",
		"║ ██║ █   █ ║██ ║",
		"║ ██║  ███  ║██ ║",
		"║ ██╚═══════╝██ ║",
		"╚═╝███████████╚═╝",
		"  ╚═══════════╝  ",
	],
	[
		" ╔═══════════╗ ",
		"╔═╝███████████╚═╗",
		"║ ██╔═════╗██ ██║",
		"║ ██║ ◉ ◉ ║██ ██║",
		"║ ██║  ○  ║██ ██║",
		"║ ██╚═══╤══╝██ ██║",
		"║ ██    │   ██ ██║",
		"╚═╗███████████╔═╝",
		"  ║ ═══╤═╤═══ ║  ",
		"  ║ ██ │ │ ██ ║  ",
		"╔═╝ ██║ ║██ ╚═╗",
		"║ █████████████ ║",
		"║ ██╔═══════╗██ ║",
		"║ ██║ █   █ ║██ ║",
		"║ ██║  ███  ║██ ║",
		"║ ██╚═══════╝██ ║",
		"╚═╝███████████╚═╝",
		"  ╚═══════════╝  ",
	],
];

// Loading text sequence
const TYPING_TEXT = [
	"Loading modules...",
	"Initializing AI...",
	"Calibrating neurons...",
	"Warming up circuits...",
	"Ready to code!",
];

// Star patterns — 3 frame
const STARS: string[] = [
	"  \u22C6     \u22C6     \u22C6     \u22C6  ",
	"    \u22C6   \u2726   \u22C6   \u2726    ",
	"  \u2726     \u22C6     \u2726     \u22C6  ",
];

// ============================================================
// HELPERS: Width-safe visible width
// ============================================================

function safeVisibleWidth(text: string): number {
	try {
		const { visibleWidth } = require("@earendil-works/pi-tui") as typeof import("@earendil-works/pi-tui");
		return visibleWidth(text);
	} catch {
		return text.length;
	}
}

// ============================================================
// HELPERS: Directory bar builder
// ============================================================

function getHomeDir(): string {
	return process.env.HOME || process.env.USERPROFILE || "";
}

function shortenPath(fullPath: string): string {
	const home = getHomeDir();
	const p = fullPath.replace(/\\/g, "/");
	if (p.startsWith(home)) {
		return "~" + p.slice(home.length);
	}
	const parts = p.split("/");
	if (parts.length > 3) {
		return parts.slice(0, 2).join("/") + "/.../" + parts.slice(-1)[0];
	}
	return p;
}

function buildTerminalArt(cwd: string, gitBranch: string): string[] {
	const shortPath = shortenPath(cwd);
	const maxPathLen = 28;
	const displayPath = shortPath.length > maxPathLen
		? "..." + shortPath.slice(-(maxPathLen - 3))
		: shortPath;
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
		const { execSync } = require("child_process") as typeof import("child_process");
		const branch = execSync("git rev-parse --abbrev-ref HEAD", {
			cwd,
			encoding: "utf8",
			timeout: 2000,
			stdio: ["ignore", "pipe", "pipe"],
		}).trim();
		return branch || "";
	} catch {
		return "";
	}
}

// ============================================================
// ANSI COLOR HELPERS (inline — no dep needed)
// ============================================================

const ansi = {
	dim:      (s: string) => `\x1b[2m${s}\x1b[22m`,
	green:    (s: string) => `\x1b[32m${s}\x1b[0m`,
	cyan:     (s: string) => `\x1b[36m${s}\x1b[0m`,
	yellow:   (s: string) => `\x1b[33m${s}\x1b[0m`,
	magenta:  (s: string) => `\x1b[35m${s}\x1b[0m`,
	white:    (s: string) => `\x1b[97m${s}\x1b[0m`,
	bold:     (s: string) => `\x1b[1m${s}\x1b[22m`,
};

// ============================================================
// ANIMATED SPLASH COMPONENT
// ============================================================

class SplashComponent {
	private frame = 0;
	private loadingStep = 0;
	private blinkVisible = true;
	private interval: ReturnType<typeof setInterval> | null = null;
	private onDone: () => void;
	private tui: { requestRender: () => void };
	private cachedLines: string[] = [];
	private cachedWidth = 0;
	private version = 0;
	private cachedVersion = -1;
	private isActive = true;
	private terminalArt: string[];

	constructor(
		tui: { requestRender: () => void },
		onDone: () => void,
		cwd: string,
		gitBranch: string,
	) {
		this.tui = tui;
		this.onDone = onDone;
		this.terminalArt = buildTerminalArt(cwd, gitBranch);

		this.interval = setInterval(() => {
			if (!this.isActive) return;
			this.frame++;
			if (this.frame % 3 === 0) {
				this.loadingStep = Math.min(this.loadingStep + 1, TYPING_TEXT.length - 1);
			}
			if (this.frame % 4 === 0) {
				this.blinkVisible = !this.blinkVisible;
			}
			this.version++;
			this.tui.requestRender();

			// Auto-close setelah ~15 detik
			if (this.frame > 42) {
				this.dispose();
				this.onDone();
			}
		}, 350);
	}

	handleInput(_data: string): void {
		if (!this.isActive) return;
		this.isActive = false;
		this.dispose();
		this.onDone();
	}

	invalidate(): void {
		this.cachedWidth = 0;
	}

	render(width: number): string[] {
		// Safety: minimal width 20
		const safeWidth = Math.max(20, width);
		const effectiveWidth = Math.min(74, safeWidth - 4);
		const contentWidth = Math.max(4, effectiveWidth - 4);

		// Cache
		if (safeWidth === this.cachedWidth && this.cachedVersion === this.version) {
			return this.cachedLines;
		}

		const lines: string[] = [];
		const vw = safeVisibleWidth;

		const center = (text: string): string => {
			const textLen = vw(text);
			const sideLen = Math.max(0, Math.floor((contentWidth - textLen) / 2));
			const side = " ".repeat(sideLen);
			const extra = (textLen % 2 !== contentWidth % 2) ? " " : "";
			return ansi.dim(" \u2502") + side + text + side + extra + ansi.dim("\u2502");
		};

		const padLine = (line: string): string => {
			const vLen = vw(line);
			return line + " ".repeat(Math.max(0, safeWidth - vLen));
		};

		const topBorder = ansi.dim(` \u256d${"\u2500".repeat(effectiveWidth)}\u256e`);
		const sepBorder = ansi.dim(` \u251c${"\u2500".repeat(effectiveWidth)}\u2524`);
		const botBorder = ansi.dim(` \u2570${"\u2500".repeat(effectiveWidth)}\u256f`);
		const empty = ansi.dim(" \u2502") + " ".repeat(contentWidth) + ansi.dim("\u2502");

		// ── 1. Top border ──
		lines.push(padLine(topBorder));
		lines.push(padLine(empty));

		// ── 2. Directory bar ──
		for (const line of this.terminalArt) {
			const colored = ansi.green(line.replace("$ _", ansi.yellow("$ _")));
			lines.push(padLine(center(colored)));
		}

		lines.push(padLine(empty));

		// ── 3. Robot pixel art ──
		const robotIdx = Math.floor(this.frame / 5) % ROBOT_FRAMES.length;
		const robotFrame = ROBOT_FRAMES[robotIdx];
		for (const line of robotFrame) {
			const colored = line
				.replace(/[█]/g, (m) => ansi.cyan(m))
				.replace(/[●◉■○]/g, (m) => ansi.yellow(m))
				.replace(/[═╔╗╚╝╤═]/g, (m) => ansi.dim(m))
				.replace(/[│║]/g, (m) => ansi.dim(m));
			lines.push(padLine(center(colored)));
		}

		lines.push(padLine(empty));

		// ── 4. Title ──
		const t1 = `${ansi.magenta(ansi.bold("\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557"))}`;
		const t2 = `${ansi.magenta(ansi.bold("\u2551"))}  ${ansi.white(ansi.bold("\u2726 PI CODING AGENT \u2726"))}  ${ansi.magenta(ansi.bold("\u2551"))}`;
		const t3 = `${ansi.magenta(ansi.bold("\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d"))}`;
		lines.push(padLine(center(t1)));
		lines.push(padLine(center(t2)));
		lines.push(padLine(center(t3)));

		lines.push(padLine(empty));
		lines.push(padLine(sepBorder));
		lines.push(padLine(empty));

		// ── 5. Loading bar ──
		const barMax = Math.max(1, contentWidth - 8);
		const progress = Math.min(this.loadingStep / (TYPING_TEXT.length - 1), 1);
		const filled = Math.max(0, Math.floor(barMax * progress));
		const emptyBar = Math.max(0, barMax - filled);

		const loadingLabel = TYPING_TEXT[this.loadingStep];
		const bar = `${ansi.green("\u2588".repeat(filled))}${ansi.dim("\u2591".repeat(emptyBar))}`;
		const pct = `${Math.floor(progress * 100)}%`.padStart(3);

		lines.push(padLine(center(`${ansi.dim("\u27d0")} ${loadingLabel} ${ansi.dim("\u27d0")}`)));
		lines.push(padLine(center(`${ansi.dim("[")}${bar}${ansi.dim("]")}  ${ansi.yellow(pct)}`)));

		lines.push(padLine(empty));

		// ── 6. Stars ──
		const starIdx = Math.floor(this.frame / 3) % STARS.length;
		const starColored = STARS[starIdx]
			.replace(/\u22C6/g, (m) => ansi.dim(m))
			.replace(/\u2726/g, (m) => ansi.yellow(m));
		lines.push(padLine(center(starColored)));

		lines.push(padLine(empty));

		// ── 7. Hint ──
		const hint = this.blinkVisible
			? `${ansi.dim("Press")} ${ansi.white(ansi.bold("any key"))} ${ansi.dim("to continue...")}`
			: `${ansi.dim("Press any key to continue...")}`;
		lines.push(padLine(center(hint)));

		lines.push(padLine(empty));
		lines.push(padLine(botBorder));

		this.cachedLines = lines;
		this.cachedWidth = safeWidth;
		this.cachedVersion = this.version;

		return lines;
	}

	dispose(): void {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = null;
		}
	}
}

// ============================================================
// SPLASH TRACKER
// ============================================================

let splashShown = false;

// ============================================================
// EXTENSION ENTRY
// ============================================================

export default function (pi: ExtensionAPI) {
	// Startup splash animation disabled per user request (replaced by luxury-retro-header.ts)
	// You can still manually run /splash to show splash screen.

	pi.registerCommand("splash", {
		description: "Show pixel art splash screen",
		handler: async (_args, ctx) => {
			if (ctx.mode !== "tui") {
				ctx.ui.notify("Splash requires interactive mode", "error");
				return;
			}
			try {
				const branch = await getGitBranch(ctx.cwd);
				await ctx.ui.custom((tui, _theme, _kb, done) => {
					return new SplashComponent(tui, () => done(undefined), ctx.cwd, branch);
				});
			} catch (err) {
				ctx.ui.notify("Splash failed to render", "error");
			}
		},
	});
}
