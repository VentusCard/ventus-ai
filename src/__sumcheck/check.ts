import { BOOK_CUSTOMERS } from "@/lib/bookScale";
import { GEOGRAPHIC_REGIONS, AGE_RANGES, CARD_PRODUCTS, TOTAL_ACCOUNTS, getSpendingGaps } from "@/lib/mockBankwideData";
import { JOURNEY_PRODUCTS } from "@/lib/financialJourneyData";
import { BASE_USERS } from "@/lib/campaignStudioData";

const errs: string[] = [];
const eq = (a: number, b: number, label: string, tol = 2) => {
  if (Math.abs(a - b) > tol) errs.push(`${label}: ${a} != ${b}`);
};
eq(GEOGRAPHIC_REGIONS.reduce((n, r) => n + r.userCount, 0), BOOK_CUSTOMERS, "region users");
eq(GEOGRAPHIC_REGIONS.reduce((n, r) => n + r.accountCount, 0), TOTAL_ACCOUNTS, "region accounts");
GEOGRAPHIC_REGIONS.forEach((r) => {
  eq(r.children!.reduce((n, c) => n + c.userCount, 0), r.userCount, `${r.name} state users`);
  eq(r.children!.reduce((n, c) => n + c.accountCount, 0), r.accountCount, `${r.name} state accounts`);
});
eq(AGE_RANGES.reduce((n, a) => n + a.userCount, 0), BOOK_CUSTOMERS, "age users");
eq(AGE_RANGES.reduce((n, a) => n + a.accountCount, 0), TOTAL_ACCOUNTS, "age accounts");
CARD_PRODUCTS.forEach((p) => {
  eq(p.penetrationRate, Math.round((p.uniqueUsers / BOOK_CUSTOMERS) * 1000) / 10, `${p.name} penetration`, 0.05);
  if (p.uniqueUsers > BOOK_CUSTOMERS) errs.push(`${p.name} users exceed book`);
});
JOURNEY_PRODUCTS.forEach((p) => {
  eq(p.customerCount, Math.round((p.penetrationRate / 100) * BOOK_CUSTOMERS), `${p.name} count`);
});
getSpendingGaps({} as never).forEach((g) => {
  if (g.affectedUsers > BOOK_CUSTOMERS) errs.push(`gap ${g.title} exceeds book`);
});
eq(BASE_USERS, BOOK_CUSTOMERS, "campaign studio base");
console.log(errs.length ? "FAIL\n" + errs.join("\n") : "ALL OK");
