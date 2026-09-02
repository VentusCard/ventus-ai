// backend/shared/coworker/portfolio-provider.mjs
//
// The PortfolioProvider is the single v0 -> v1 seam for the AI Coworker.
//
// v0 (now): createFixturePortfolioProvider() serves the deterministic synthetic
//           portfolio under ./fixtures/*.json.
// v1 (later): a live implementation backed by the production enrichment pipeline
//           (Aurora + classify/lifestyle/risk cores) implements the SAME interface,
//           so the handler, prompts, tasks, and console never change.
//
// Keep this interface small and shape-stable. Everything the agent brain needs
// about the book of business flows through here.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');

/**
 * @typedef {Object} PortfolioProvider
 * @property {() => {id:string,name:string,domain:string}} getInstitution
 * @property {() => object[]} getAdvisors
 * @property {(advisorId:string) => (object|null)} getAdvisor
 * @property {(opts?:{advisorId?:string}) => object[]} getHouseholds
 * @property {(householdId:string) => (object|null)} getHousehold
 * @property {(householdId:string) => object[]} getTransactions
 * @property {(householdId:string) => object} getSignals
 * @property {() => object[]} getCatalog
 * @property {() => object} getCatalogDocument
 * @property {() => ({start:string,end:string,months:number}|null)} getTransactionWindow
 * @property {string} source  identifier for logging/audit ("fixtures" | "live")
 */

function readJson(name) {
  return JSON.parse(readFileSync(join(fixturesDir, name), 'utf8'));
}

/**
 * Fixture-backed PortfolioProvider (v0).
 *
 * @param {object} [opts]
 * @param {object} [opts.data] Pre-loaded fixture bundle (households/transactions/signals/catalog).
 *   When omitted, the four JSON files under ./fixtures are read from disk. Injecting
 *   `data` lets tests run without touching the filesystem.
 * @returns {PortfolioProvider}
 */
export function createFixturePortfolioProvider(opts = {}) {
  const households = opts.data?.households ?? readJson('households.json');
  const transactions = opts.data?.transactions ?? readJson('transactions.json');
  const signals = opts.data?.signals ?? readJson('signals.json');
  const catalog = opts.data?.catalog ?? readJson('product-catalog.json');

  const advisorsById = new Map((households.advisors || []).map((a) => [a.id, a]));
  const householdsById = new Map((households.households || []).map((h) => [h.id, h]));

  return {
    source: 'fixtures',

    getInstitution() {
      return households.institution;
    },

    getAdvisors() {
      return households.advisors || [];
    },

    getAdvisor(advisorId) {
      return advisorsById.get(advisorId) || null;
    },

    getHouseholds({ advisorId } = {}) {
      const all = households.households || [];
      return advisorId ? all.filter((h) => h.advisor_id === advisorId) : all;
    },

    getHousehold(householdId) {
      return householdsById.get(householdId) || null;
    },

    getTransactions(householdId) {
      return transactions.transactions?.[householdId] || [];
    },

    getSignals(householdId) {
      return (
        signals.signals?.[householdId] || {
          life_events: [],
          behavioral: [],
          risk: [],
          financial: {},
        }
      );
    },

    getCatalog() {
      return catalog.products || [];
    },

    // The whole catalog document, not just the product list. The benefit
    // calculator needs the spend-category map and the incumbent rate cards to
    // state a figure net of what a household already earns.
    getCatalogDocument() {
      return catalog;
    },

    getTransactionWindow() {
      return transactions.window || null;
    },
  };
}
