const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const themeLabel = document.getElementById("themeLabel");

function setTheme(mode) {
	const isDark = mode === "dark";
	document.body.classList.toggle("dark", isDark);
	themeIcon.textContent = isDark ? "☀️" : "🌙";
	themeLabel.textContent = isDark ? "Light" : "Dark";
	localStorage.setItem("omniscript-theme", mode);
}

const savedTheme = localStorage.getItem("omniscript-theme");
if (savedTheme) {
	setTheme(savedTheme);
} else {
	const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	setTheme(prefersDark ? "dark" : "light");
}

themeToggle.addEventListener("click", () => {
	const next = document.body.classList.contains("dark") ? "light" : "dark";
	setTheme(next);
});

const revealElements = document.querySelectorAll(".reveal, .feature-card");
const observer = new IntersectionObserver((entries) => {
	entries.forEach((entry) => {
		if (entry.isIntersecting) {
			entry.target.classList.add("visible");
			observer.unobserve(entry.target);
		}
	});
}, { threshold: 0.14 });

revealElements.forEach((element, index) => {
	if (element.classList.contains("feature-card")) {
		element.style.transitionDelay = `${index * 0.08}s`;
	}
	observer.observe(element);
});
