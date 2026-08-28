import { PRODUCT_FLOWS } from "@/lib/productAutomatedFlows";

export interface ChannelStat {
  id: "digital" | "email" | "sms";
  label: string;
  shortLabel: string;
  flows: number;
  reach: string;
  status: "Live" | "Capped" | "Held";
}

const totalProducts = PRODUCT_FLOWS.length;
const activeProducts = PRODUCT_FLOWS.filter((f) => f.defaultActive).length;
const totalSignals = PRODUCT_FLOWS.reduce((n, f) => n + f.signals.length, 0);

// Human review gates (mocked governance state)
const MARKETING_PENDING = 9;
const OWNER_PENDING = 4;

export const FLOW_GOVERNANCE = {
  products: {
    total: totalProducts,
    active: activeProducts,
    draft: totalProducts - activeProducts,
  },
  signals: {
    total: totalSignals,
    avgPerProduct: Math.round((totalSignals / Math.max(totalProducts, 1)) * 10) / 10,
    custom: 12,
  },
  marketing: {
    total: totalSignals,
    approved: totalSignals - MARKETING_PENDING,
    pending: MARKETING_PENDING,
    lastReviewed: "reviewed 2h ago",
  },
  owner: {
    total: totalSignals,
    approved: totalSignals - MARKETING_PENDING - OWNER_PENDING,
    pending: OWNER_PENDING,
    oldestOwner: "Consumer Lending",
  },
  live: totalProducts - MARKETING_PENDING - OWNER_PENDING,
  readySignals: totalSignals - MARKETING_PENDING - OWNER_PENDING,
  progressPct: Math.round(
    ((totalSignals - MARKETING_PENDING - OWNER_PENDING) /
      Math.max(totalSignals, 1)) *
      100,
  ),
};

// Channel coverage is derived from the signals that cleared both approval gates.
// Channels overlap, so these do NOT sum to the live total.
const READY = FLOW_GOVERNANCE.readySignals;

export const CHANNEL_STATS: ChannelStat[] = [
  {
    id: "digital",
    label: "Digital banking",
    shortLabel: "Digital",
    flows: READY,
    reach: "312K sessions / 24h",
    status: "Live",
  },
  {
    id: "email",
    label: "Email",
    shortLabel: "Email",
    flows: Math.round(READY * 0.78),
    reach: "1.24M sent / 24h",
    status: "Live",
  },
  {
    id: "sms",
    label: "SMS",
    shortLabel: "SMS",
    flows: Math.round(READY * 0.22),
    reach: "86K delivered / 24h",
    status: "Capped",
  },
];
