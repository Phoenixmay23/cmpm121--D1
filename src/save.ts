// Saving and loading progress, so gems and upgrades survive a page refresh.
// Progress is kept in this browser's localStorage. Every read and write is
// wrapped in try/catch, so the game still runs if storage is blocked
// (for example in a private window).

const SAVE_KEY = "gem-hoard-save";

export interface SaveData {
  gems: number;
  owned: Record<string, number>; // upgrade id -> how many the player owns
}

export function loadGame(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Older saves called the currency "gold"; read either name
    const gems = data?.gems ?? data?.gold;
    // Ignore anything that doesn't look like a save from this game
    if (typeof gems !== "number" || typeof data?.owned !== "object") {
      return null;
    }
    const owned: Record<string, number> = {};
    for (const [id, count] of Object.entries(data.owned ?? {})) {
      if (typeof count === "number" && count >= 0) {
        owned[id] = Math.floor(count);
      }
    }
    return { gems: Math.max(0, gems), owned };
  } catch {
    return null;
  }
}

export function saveGame(data: SaveData): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // Storage unavailable: keep playing without saving
  }
}
