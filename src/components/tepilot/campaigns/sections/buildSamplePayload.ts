import type { CatalogProduct } from "@/types/campaign-studio";
import type { MessageCard } from "./buildMessageCards";

export interface SampleRow {
  customer_id: string;
  email: string;
  subject: string;
  message: string;
  cta: string;
  cta_url: string;
  send_at: string;
}

const FIRST_NAMES = [
  "Jordan", "Avery", "Morgan", "Riley", "Casey", "Taylor", "Quinn", "Sydney",
  "Drew", "Reese", "Parker", "Hayden", "Skylar", "Emerson", "Rowan", "Sawyer",
  "Logan", "Cameron", "Devon", "Harper",
];
const LAST_NAMES = [
  "Reyes", "Chen", "Patel", "Kim", "Nguyen", "Brooks", "Foster", "Bennett",
  "Hayes", "Sullivan", "Carter", "Reed", "Morgan", "Walsh", "Cole", "Hughes",
  "Mitchell", "Anderson", "Gomez", "Bauer",
];

// Tiny seeded PRNG (mulberry32)
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function buildSamplePayload(product: CatalogProduct, cards: MessageCard[]): SampleRow[] {
  const now = Date.now();
  return cards.slice(0, 5).map((card, idx) => {
    const r = rng(hashString(`${product.name}:${idx}`));
    const first = FIRST_NAMES[Math.floor(r() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(r() * LAST_NAMES.length)];
    const id = `C-${Math.floor(r() * 1e8).toString().padStart(8, "0")}`;
    const offsetHours = idx === 0 ? 1 : idx * 6;
    const sendDate = new Date(now + offsetHours * 3600 * 1000);
    sendDate.setMinutes(0, 0, 0);
    return {
      customer_id: id,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
      subject: card.subject,
      message: card.body,
      cta: card.cta,
      cta_url: card.ctaHref ?? "",
      send_at: sendDate.toISOString(),
    };
  });
}
