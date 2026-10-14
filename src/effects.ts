// Visual effects: the gem bag's squish, coin burst and floating "+1",
// the blurred look of locked upgrades, the pop when one unlocks,
// and the gold flash when an upgrade reaches a milestone.
// Styles live here so main.ts only has to call these functions.

const STYLES = `
.coin-area {
  position: relative;
  width: 201px;
  margin: 8px auto;
}
.coin-button {
  display: block;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
}
.coin-button:focus-visible {
  outline: 3px solid #f1c232;
  outline-offset: 4px;
  border-radius: 8px;
}
.coin-button img {
  display: block;
  width: 201px; /* 3 screen pixels per art pixel */
  height: 267px;
  image-rendering: pixelated;
  transform-origin: 50% 100%;
}
.coin-button.squish img {
  animation: coin-squish 0.22s ease-out;
}
@keyframes coin-squish {
  0% { transform: scale(1, 1); }
  35% { transform: scale(1.12, 0.82); }
  70% { transform: scale(0.96, 1.06); }
  100% { transform: scale(1, 1); }
}

.coin-bit {
  position: absolute;
  left: 50%;
  top: 14%;
  width: 8px;
  height: 8px;
  background: #ffd84a;
  box-shadow: inset -2px -2px 0 #c47a12, 0 0 0 2px #4a2e00;
  pointer-events: none;
  animation: coin-pop 0.5s steps(6) forwards;
}
.coin-bit.gem {
  background: #6fd0ff;
  box-shadow: inset -2px -2px 0 #1f5fb0, 0 0 0 2px #0c2a5c;
}
.coin-bit.sparkle {
  width: 4px;
  height: 4px;
  background: #fff6c4;
  box-shadow: none;
}
@keyframes coin-pop {
  0% { opacity: 1; transform: translate(0, 0); }
  55% { opacity: 1; transform: translate(var(--dx), var(--dy)); }
  100% {
    opacity: 0;
    transform: translate(calc(var(--dx) * 1.4), calc(var(--dy) + 24px));
  }
}

.float-text {
  position: absolute;
  font-family: "Press Start 2P", monospace;
  font-size: 0.8rem;
  color: #ffd84a;
  text-shadow: 2px 2px 0 #4a2e00;
  pointer-events: none;
  transform: translateX(-50%);
  animation: float-up 0.8s ease-out forwards;
}
@keyframes float-up {
  0% { opacity: 1; transform: translate(-50%, 0); }
  100% { opacity: 0; transform: translate(-50%, -40px); }
}

/* Page background image (set in main.ts) */
body.has-background {
  margin: 0;
  min-height: 100vh;
  background-color: #1b1424; /* shown while the image loads */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}
/* Keep text readable on top of any background picture */
body.has-background #counter,
body.has-background #rate,
body.has-background .upgrade-info,
body.has-background .credits {
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9), 0 0 2px rgba(0, 0, 0, 0.9);
}
body.has-background #counter {
  font-size: 1.3rem;
  font-weight: bold;
}

/* Game title above the clicker */
.game-title {
  text-align: center;
  font-family: "Press Start 2P", monospace;
  font-size: 1.6rem;
  color: #d4a017;
  text-shadow: 3px 3px 0 #4a2e00;
  margin: 16px 0 4px;
}

/* Make the game fill the window so the credits can sit at the very bottom */
#app {
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* Credits at the very bottom */
.credits {
  margin: auto auto 0; /* "auto" on top pushes it to the bottom */
  padding: 32px 0 16px;
  text-align: center;
  font-size: 0.85rem;
  color: #666;
}
.credits h2 {
  font-size: 1rem;
  margin: 0 0 6px;
}
.credits ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

#counter, #rate {
  text-align: center;
}
.upgrade-list {
  width: 100%;
  display: flex;
  flex-direction: row; /* 1 - 2 - 3 - 4 - 5, left to right */
  flex-wrap: wrap; /* wraps to a new line on narrow screens */
  justify-content: center;
  align-items: flex-start;
  gap: 10px;
  margin: 12px auto;
}
.upgrade-row {
  position: relative;
  display: flex;
  flex-direction: column; /* button on top, stats underneath */
  align-items: center;
  gap: 4px;
  width: 150px;
  padding: 4px;
  border-radius: 6px;
  text-align: center;
}
.upgrade-button {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 4px;
}
/* Every upgrade picture gets the same 48x48 box, scaled to fit */
.upgrade-icon {
  width: 48px;
  height: 48px;
  object-fit: contain;
}
.upgrade-info {
  font-size: 0.75rem;
  color: #666;
}
.upgrade-row.locked {
  filter: blur(3px);
  opacity: 0.6;
  cursor: not-allowed;
  user-select: none;
}
.upgrade-row.unlock-pop {
  animation: unlock-pop 0.6s ease-out;
}
@keyframes unlock-pop {
  0% { filter: blur(3px); opacity: 0.6; transform: scale(1); }
  40% {
    filter: blur(0);
    opacity: 1;
    transform: scale(1.06);
    box-shadow: 0 0 0 4px #ffd84a;
  }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 216, 74, 0); }
}
.upgrade-row.tier-up {
  animation: tier-up 0.9s ease-out;
}
@keyframes tier-up {
  0% { background: rgba(255, 216, 74, 0); }
  20% { background: rgba(255, 216, 74, 0.85); transform: scale(1.04); }
  100% { background: rgba(255, 216, 74, 0); transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .coin-button.squish img, .float-text, .upgrade-row.unlock-pop,
  .upgrade-row.tier-up {
    animation: none;
  }
  .coin-bit { display: none; }
}
`;

export function injectStyles(): void {
  const font = document.createElement("link");
  font.rel = "stylesheet";
  font.href =
    "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap";
  document.head.append(font);

  const style = document.createElement("style");
  style.textContent = STYLES;
  document.head.append(style);
}

// Restart a CSS animation class, even if it is already on the element.
function restartAnimation(element: HTMLElement, className: string): void {
  element.classList.remove(className);
  void element.offsetWidth; // forces the browser to notice the removal
  element.classList.add(className);
}

// Highlight an upgrade the moment it unlocks.
export function showUnlock(row: HTMLElement): void {
  restartAnimation(row, "unlock-pop");
}

// Flash an upgrade gold when it reaches a milestone.
export function showTierUp(row: HTMLElement): void {
  restartAnimation(row, "tier-up");
}

export function squish(button: HTMLElement): void {
  restartAnimation(button, "squish");
}

export function floatText(container: HTMLElement, text: string): void {
  const label = document.createElement("span");
  label.className = "float-text";
  label.textContent = text;
  label.style.left = `${30 + Math.random() * 40}%`;
  label.style.top = `${10 + Math.random() * 20}%`;
  label.addEventListener("animationend", () => label.remove());
  container.append(label);
  // Fallback cleanup in case animations are turned off
  setTimeout(() => label.remove(), 1000);
}

// A few pixel coins, gems and sparkles pop out of the bag on each click.
export function coinBurst(container: HTMLElement, bits = 5): void {
  for (let i = 0; i < bits; i++) {
    const bit = document.createElement("span");
    const kinds = ["coin-bit", "coin-bit gem", "coin-bit sparkle"];
    bit.className = kinds[i % kinds.length];
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.8; // mostly upward
    const distance = 22 + Math.random() * 22;
    bit.style.setProperty(
      "--dx",
      `${Math.round(Math.cos(angle) * distance)}px`,
    );
    bit.style.setProperty(
      "--dy",
      `${Math.round(Math.sin(angle) * distance)}px`,
    );
    bit.addEventListener("animationend", () => bit.remove());
    container.append(bit);
    setTimeout(() => bit.remove(), 800);
  }
}
