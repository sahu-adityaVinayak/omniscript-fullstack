const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const themeLabel = document.getElementById("themeLabel");
const runBtn = document.getElementById("runTool");
const clearBtn = document.getElementById("clearTool");
const inputText = document.getElementById("inputText");
const resultText = document.getElementById("resultText");
const toolName = document.body.dataset.tool || "live-preview";

function setTheme(mode) {
	const isDark = mode === "dark";
	document.body.classList.toggle("dark", isDark);
	if (themeIcon) {
		themeIcon.textContent = isDark ? "☀️" : "🌙";
	}
	if (themeLabel) {
		themeLabel.textContent = isDark ? "Light" : "Dark";
	}
	localStorage.setItem("omniscript-theme", mode);
}

const savedTheme = localStorage.getItem("omniscript-theme");
if (savedTheme) {
	setTheme(savedTheme);
} else {
	const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	setTheme(prefersDark ? "dark" : "light");
}

if (themeToggle) {
	themeToggle.addEventListener("click", () => {
		const next = document.body.classList.contains("dark") ? "light" : "dark";
		setTheme(next);
	});
}

function splitWords(text) {
	return text.trim().split(/\s+/).filter(Boolean);
}

function runDetector(text) {
	const words = splitWords(text.toLowerCase());
	if (!words.length) {
		return "Paste text to analyze AI probability.";
	}
	const aiMarkers = ["optimize", "leverage", "therefore", "furthermore", "utilize", "consistent", "objective"];
	let markerHits = 0;
	for (const marker of aiMarkers) {
		if (text.toLowerCase().includes(marker)) {
			markerHits += 1;
		}
	}
	const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
	const score = Math.min(95, Math.round(markerHits * 11 + avgWordLength * 4));
	const human = 100 - score;
	return `AI Detection Report\n\nAI likelihood: ${score}%\nHuman likelihood: ${human}%\n\nSignals found:\n- Formal pattern markers: ${markerHits}\n- Average word length: ${avgWordLength.toFixed(2)}\n\nNote: This is a demo estimator for UI preview.`;
}

function runParaphraser(text) {
	if (!text.trim()) {
		return "Add text to paraphrase.";
	}
	const replacements = {
		"very": "highly",
		"good": "strong",
		"bad": "poor",
		"important": "critical",
		"help": "support",
		"use": "apply",
		"show": "demonstrate",
		"make": "create"
	};
	let output = text;
	for (const [key, value] of Object.entries(replacements)) {
		const re = new RegExp(`\\b${key}\\b`, "gi");
		output = output.replace(re, value);
	}
	return `Paraphrased Output\n\n${output}`;
}

function runHumanizer(text) {
	if (!text.trim()) {
		return "Add text to humanize.";
	}
	let output = text
		.replace(/objective/gi, "goal")
		.replace(/utilize/gi, "use")
		.replace(/therefore/gi, "so")
		.replace(/furthermore/gi, "also")
		.replace(/in order to/gi, "to")
		.replace(/sustain/gi, "keep");
	output = `Humanized Output\n\n${output}`;
	return output;
}

function runLivePreview(text) {
	if (!text.trim()) {
		return "Type text to see live preview output.";
	}
	const words = splitWords(text);
	return `Live Preview\n\nWord count: ${words.length}\nCharacter count: ${text.length}\n\nPreview:\n${text}`;
}

function runTool() {
	if (!inputText || !resultText) {
		return;
	}

	const text = inputText.value;
	if (toolName === "detector") {
		resultText.textContent = runDetector(text);
		return;
	}
	if (toolName === "paraphraser") {
		resultText.textContent = runParaphraser(text);
		return;
	}
	if (toolName === "humanizer") {
		resultText.textContent = runHumanizer(text);
		return;
	}
	resultText.textContent = runLivePreview(text);
}

if (runBtn) {
	runBtn.addEventListener("click", runTool);
}

if (clearBtn) {
	clearBtn.addEventListener("click", () => {
		if (!inputText || !resultText) {
			return;
		}
		inputText.value = "";
		resultText.textContent = "Result will appear here.";
	});
}
