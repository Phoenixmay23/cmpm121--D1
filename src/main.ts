// Vite turns this import into a production-safe URL, so the gem bag
// is deployed as its own asset file.
// @deno-types="./asset-url.d.ts"
import gemBagUrl from "./assets/gem-bag-large.png?no-inline";
// @deno-types="./asset-url.d.ts"
import backgroundUrl from "./assets/background.jpg?no-inline";
// Upgrade pictures (file names are case-sensitive once deployed)
// @deno-types="./asset-url.d.ts"
import pickaxeUrl from "./assets/pickaxe-upgrade.png?no-inline";
// @deno-types="./asset-url.d.ts"
import gemCutterUrl from "./assets/gem-cutter-upgrade.png?no-inline";
// @deno-types="./asset-url.d.ts"
import gemMineUrl from "./assets/Gem-mine-upgrade.png?no-inline";
// @deno-types="./asset-url.d.ts"
import forgeUrl from "./assets/forge-upgrade.png?no-inline";
// @deno-types="./asset-url.d.ts"
import dragonUrl from "./assets/Dragon-upgrade.png?no-inline";
import {
  coinBurst,
  floatText,
  injectStyles,
  showTierUp,
  showUnlock,
  squish,
} from "./effects.ts";
import { loadGame, saveGame } from "./save.ts";

injectStyles();

// ---- Data: what makes each upgrade different ----
interface Requirement {
  id: string; // which upgrade must be owned
  count: number; // how many of it you need
}

interface Upgrade {
  id: string;
  label: string;
  icon: string; // picture shown on the upgrade's button
  baseCost: number; // price of the first one in Gems
  rate: number; // Gems per second each one makes before milestones
  requires: Requirement[]; // all must be met before it unlocks
  owned: number;
}

const upgrades: Upgrade[] = [
  {
    id: "upgrade-button1",
    label: "Prospector's Pickaxe",
    icon: pickaxeUrl,
    baseCost: 50,
    rate: 1,
    requires: [],
    owned: 0,
  },
  {
    id: "upgrade-button2",
    label: "Gem Cutter's Bench",
    icon: gemCutterUrl,
    baseCost: 200,
    rate: 10,
    requires: [{ id: "upgrade-button1", count: 3 }],
    owned: 0,
  },
  {
    id: "upgrade-button3",
    label: "Gem Mine",
    icon: gemMineUrl,
    baseCost: 1000,
    rate: 40,
    requires: [
      { id: "upgrade-button1", count: 1 },
      { id: "upgrade-button2", count: 1 },
    ],
    owned: 0,
  },
  {
    id: "upgrade-button4",
    label: "Dwarven Forge",
    icon: forgeUrl,
    baseCost: 3000,
    rate: 100,
    requires: [
      { id: "upgrade-button1", count: 3 },
      { id: "upgrade-button2", count: 2 },
      { id: "upgrade-button3", count: 2 },
    ],
    owned: 0,
  },
  {
    id: "upgrade-button5",
    label: "Dragon's Hoard",
    icon: dragonUrl,
    baseCost: 10000,
    rate: 400,
    requires: [
      { id: "upgrade-button1", count: 5 },
      { id: "upgrade-button2", count: 2 },
      { id: "upgrade-button3", count: 2 },
      { id: "upgrade-button4", count: 2 },
    ],
    owned: 0,
  },
];

// Milestones, like Cookie Clicker: owning this many of an upgrade
// doubles what each one makes. Five thresholds, shared by every upgrade.
const MILESTONES = [5, 10, 15, 20, 25];
const MILESTONE_MULTIPLIER = 2;
const PRICE_GROWTH = 1.15; // each purchase costs 15% more than the last

// ---- Game state ----
const BASE_RATE = 1; // Gems per second before any upgrades
let counter: number = 0;
const unlocked = new Set<string>(); // upgrades the player has seen unlock

// ---- Saving: restore progress from the last visit ----
const saved = loadGame();
if (saved) {
  counter = saved.gems;
  upgrades.forEach((u) => (u.owned = saved.owned[u.id] ?? 0));
  // Upgrades that were already open shouldn't replay their unlock pop
  upgrades.filter(isUnlocked).forEach((u) => unlocked.add(u.id));
}

function persist(): void {
  saveGame({
    gems: counter,
    owned: Object.fromEntries(upgrades.map((u) => [u.id, u.owned])),
  });
}

setInterval(persist, 5000); // autosave every 5 seconds
addEventListener("pagehide", persist); // save when the tab closes or reloads
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") persist();
});

// ---- Rules: shared by every upgrade ----
function costOf(upgrade: Upgrade): number {
  return Math.ceil(upgrade.baseCost * PRICE_GROWTH ** upgrade.owned);
}

function tierOf(upgrade: Upgrade): number {
  return MILESTONES.filter((m) => upgrade.owned >= m).length;
}

// Gems per second this upgrade adds right now
function outputOf(upgrade: Upgrade): number {
  return upgrade.rate * upgrade.owned * MILESTONE_MULTIPLIER ** tierOf(upgrade);
}

function ownedCount(id: string): number {
  return upgrades.find((u) => u.id === id)?.owned ?? 0;
}

function isUnlocked(upgrade: Upgrade): boolean {
  return upgrade.requires.every((r) => ownedCount(r.id) >= r.count);
}

function growthRate(): number {
  return BASE_RATE + upgrades.reduce((sum, u) => sum + outputOf(u), 0);
}

function buy(upgrade: Upgrade, row: HTMLElement): void {
  const cost = costOf(upgrade);
  if (!isUnlocked(upgrade) || counter < cost) return;
  const tierBefore = tierOf(upgrade);
  counter -= cost;
  upgrade.owned += 1;
  persist();
  if (tierOf(upgrade) > tierBefore) {
    showTierUp(row);
    floatText(row, `×${MILESTONE_MULTIPLIER} ${upgrade.label}!`);
  }
  updateDisplay();
}

function requirementText(upgrade: Upgrade): string {
  return upgrade.requires
    .map((r) => {
      const needed = upgrades.find((u) => u.id === r.id);
      return `${needed?.label ?? r.id} ×${r.count}`;
    })
    .join(", ");
}

// ---- Credits: fill in the names here ----
const GAME_TITLE = "Gem Hoard";
const CREDITS = ["rhage", "rkunita"];

// ---- Page setup ----
const app = document.querySelector<HTMLElement>("#app")!;

// Page background: fills the window and stays put while you scroll
document.body.classList.add("has-background");
document.body.style.backgroundImage = `url("${backgroundUrl}")`;

const heading = document.createElement("h1");
heading.className = "game-title";
heading.textContent = GAME_TITLE;
app.append(heading);

// Gem bag: the thing you click for money
const coinArea = document.createElement("div");
coinArea.className = "coin-area";

const clickButton = document.createElement("button");
clickButton.id = "click-button";
clickButton.className = "coin-button";
clickButton.setAttribute("aria-label", "Collect gems");

const bagImage = document.createElement("img");
bagImage.src = gemBagUrl;
bagImage.alt = "";
clickButton.append(bagImage);

coinArea.append(clickButton);
app.append(coinArea);

const counterDisplay = document.createElement("div");
counterDisplay.id = "counter";

const rateDisplay = document.createElement("div");
rateDisplay.id = "rate";
app.append(counterDisplay, rateDisplay);

// One loop builds every upgrade row: no per-upgrade code
const upgradeList = document.createElement("div");
upgradeList.className = "upgrade-list";
app.append(upgradeList);

const upgradeRows = upgrades.map((upgrade) => {
  const row = document.createElement("div");
  row.className = "upgrade-row";

  const button = document.createElement("button");
  button.id = upgrade.id;
  button.className = "upgrade-button";

  const icon = document.createElement("img");
  icon.className = "upgrade-icon";
  icon.src = upgrade.icon;
  icon.alt = "";
  const label = document.createElement("span");
  button.append(icon, label);
  button.addEventListener("click", () => buy(upgrade, row));

  const info = document.createElement("span");
  info.className = "upgrade-info";

  row.append(button, info);
  upgradeList.append(row);
  return { row, button, label, info };
});

// ---- Display: one place keeps the page in sync with the state ----
function updateDisplay(): void {
  counterDisplay.textContent = `${Math.floor(counter)} Gems`;
  rateDisplay.textContent = `${growthRate()} Gems per second`;

  upgrades.forEach((upgrade, i) => {
    const { row, button, label, info } = upgradeRows[i];
    const open = isUnlocked(upgrade);
    const cost = costOf(upgrade);
    const multiplier = MILESTONE_MULTIPLIER ** tierOf(upgrade);

    label.textContent = `${upgrade.label} (${cost} Gems)`;
    info.textContent = `${upgrade.owned} owned · +${outputOf(upgrade)}/s` +
      (multiplier > 1 ? ` · ×${multiplier}` : "");

    row.classList.toggle("locked", !open);
    button.disabled = !open || counter < cost;
    row.title = open ? "" : `Locked: needs ${requirementText(upgrade)}`;
    button.setAttribute(
      "aria-label",
      open ? label.textContent : "Locked upgrade",
    );

    // Play the reveal once, the moment an upgrade first unlocks
    if (open && !unlocked.has(upgrade.id)) {
      unlocked.add(upgrade.id);
      if (upgrade.requires.length > 0) showUnlock(row);
    }
  });
}
updateDisplay();

// Automatic growth based on real elapsed time
let lastTime = performance.now();

function tick(now: number): void {
  const elapsedSeconds = (now - lastTime) / 1000;
  lastTime = now;

  counter += growthRate() * elapsedSeconds;
  updateDisplay();
  updateClick();
  updateGrowthDisplay();

  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);

// Reset button
const resetButton = document.createElement("button");
resetButton.id = "reset-button";
resetButton.textContent = "Reset";
app.append(resetButton);

resetButton.addEventListener("click", () => {
  counter = 0;
  growthRate = 1;
  updateDisplay();
  updateGrowthDisplay();
// Credits at the bottom of the page
const credits = document.createElement("footer");
credits.className = "credits";
const creditsHeading = document.createElement("h2");
creditsHeading.textContent = "Credits";
const creditsList = document.createElement("ul");
CREDITS.forEach((name) => {
  const item = document.createElement("li");
  item.textContent = name;
  creditsList.append(item);
});
credits.append(creditsHeading, creditsList);
app.append(credits);

// Click the gem bag to add to the counter
clickButton.addEventListener("click", () => {
  counter += 1;
  squish(clickButton);
  coinBurst(coinArea);
  floatText(coinArea, "+1");
  updateDisplay();
});

const GrowthCounter = document.createElement("p");

function updateGrowthDisplay() {
  GrowthCounter.textContent = `Growth Rate: ${growthRate} Golds/sec`;
}

updateGrowthDisplay();
document.body.appendChild(GrowthCounter);
