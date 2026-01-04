const DISPLAY_DELAY_MS = 1667;

const stampStylesheet: CSSStyleSheet | null = (() => {
	if (typeof CSSStyleSheet === "undefined") return null;
	const sheet = new CSSStyleSheet();
	sheet.replaceSync(`
		@keyframes bounce-in {
			0% { transform: scale(0.2); opacity: 0; }
			100% { transform: scale(1); opacity: 1; }
		}

		:host {
			position: absolute;
			transform-origin: top left;
			user-select: none;
			width: 6rem;
		}

		:host img {
			width: 100%;
			user-select: none;
		}

		@media (min-width: 768px) {
			:host {
				width: 9rem;
			}
		}

		@media (min-width: 1024px) {
			:host {
				width: 12rem;
			}
		}
	`);

	return sheet;
})();

export class BandoriStamp extends HTMLElement {
	private readonly shadow: ShadowRoot;

	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: "open" });
		if (stampStylesheet) {
			this.shadow.adoptedStyleSheets = [stampStylesheet];
		}
	}

	connectedCallback() {
		this.render();
	}

	private render() {
		if (typeof document === "undefined") return;

		const imageAttr = this.getAttribute("image");
		if (!imageAttr) return;

		const audioSrc = this.getAttribute("audio");

		const randomX = Math.random() * 100 + "%";
		const randomY = Math.random() * 100 + "%";
		this.style.left = randomX;
		this.style.top = randomY;
		this.style.translate = `-${randomX} -${randomY}`;

		this.shadow.innerHTML = "";
		const img = document.createElement("img");
		img.src = imageAttr;
		img.addEventListener("animationend", () => (img.style.animation = ""), {
			once: true,
		});
		img.style.animation = "bounce-in 300ms forwards";
		this.shadow.appendChild(img);

		const scheduleRemove = () => {
			setTimeout(() => {
				img.addEventListener(
					"animationend",
					() => this.parentElement!.removeChild(this),
					{ once: true },
				);
				img.style.animation = "bounce-in 300ms reverse";
			}, DISPLAY_DELAY_MS);
		};

		if (audioSrc) {
			const audio = new Audio(audioSrc);
			audio.addEventListener("ended", scheduleRemove, { once: true });
			audio.play().catch(() => scheduleRemove());
		} else {
			scheduleRemove();
		}
	}
}

if (typeof window !== "undefined" && !customElements.get("bandori-stamp")) {
	customElements.define("bandori-stamp", BandoriStamp);
}
