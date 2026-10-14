// Vite turns this import into a production-safe URL. Keep it as a file so
// even this tiny example demonstrates a separately deployed asset.
// @deno-types="./asset-url.d.ts"
import tileUrl from "./assets/tile.svg?no-inline";
import { ButtonFactory } from "./buttonfactory.ts";

const app = document.querySelector<HTMLElement>("#app")!;

const heading = document.createElement("h1");
heading.textContent = "D1 project";

const image = document.createElement("img");
image.src = tileUrl;
image.alt = "A teal tile with a cream circle";
image.width = 96;
image.height = 96;

const message = document.createElement("p");
message.textContent = "Your project starts here.";

app.append(heading, image, message);

// Button
const clickButton = document.createElement("button");
clickButton.id = "click-button";
clickButton.textContent = "Money!";
app.append(clickButton);

// Counter state + display
let counter: number = 0;

const counterDisplay = document.createElement("div");
counterDisplay.id = "counter";
app.append(counterDisplay);

//establish upgrade button1 with initial cost of 50 Golds
const upgradeButton1 = document.createElement("button");
upgradeButton1.id = "upgrade-button1";
upgradeButton1.textContent = "More Money! (50 Golds)";
upgradeButton1.setAttribute("disabled", "true");
let upgrade1Clicks: number = 50;
app.append(upgradeButton1);

//establish upgrade button 2 with initial cost of 200 Golds
const upgradeButton2 = document.createElement("button");
upgradeButton2.id = "upgrade-button2";
upgradeButton2.textContent = "Even More Money!";
upgradeButton2.setAttribute("disabled", "true");
let upgrade2Clicks: number = 200;
app.append(upgradeButton2);

const myButtonFactory = new ButtonFactory();
const myNewButton: HTMLButtonElement = myButtonFactory.createButton(
  "myNewButton",
  "myNewID",
);
app.append(myNewButton);

function updateDisplay() {
  counterDisplay.textContent = `${Math.floor(counter)} Golds`;
  upgradeButton1.textContent = `More Money! (${
    Math.floor(upgrade1Clicks)
  } Golds)`;
  upgradeButton2.textContent = `Even More Money! (${
    Math.floor(upgrade2Clicks)
  } Golds)`;
}
updateDisplay();

//click upgrade button to increase growth rate by 1
//also increases cost by 1 per use
upgradeButton1.addEventListener("click", () => {
  counter -= upgrade1Clicks;
  growthRate += 1;
  upgrade1Clicks += 1;
  updateDisplay();
});

//click upgrade button 2 to increase growth rate by 10
//also increases cost by 5 per use
upgradeButton2.addEventListener("click", () => {
  counter -= upgrade2Clicks;
  growthRate += 10;
  upgrade2Clicks += 5;
  updateDisplay();
});

//check for counter number to enable upgrade buttons
function updateClick() {
  if (counter >= upgrade1Clicks) {
    upgradeButton1.removeAttribute("disabled");
  } else {
    upgradeButton1.setAttribute("disabled", "true");
  }

  if (counter >= upgrade2Clicks) {
    upgradeButton2.removeAttribute("disabled");
  } else {
    upgradeButton2.setAttribute("disabled", "true");
  }
}
updateClick();

// Automatic growth based on real elapsed time
// Also updates clickability of upgrade buttons
let growthRate: number = 1; // Golds per second

let lastTime = performance.now();

function tick(now: number) {
  const elapsedSeconds = (now - lastTime) / 1000;
  lastTime = now;

  counter += growthRate * elapsedSeconds;
  updateDisplay();
  updateClick();

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
});

// Click adds to the counter
clickButton.addEventListener("click", () => {
  counter += 1;
  updateDisplay();
});
