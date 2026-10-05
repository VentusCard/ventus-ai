/**
 * Typed client for ventus-api.
 *
 * Every method parses its response through the schemas in ./contract, so the
 * console fails loudly at the network boundary when the API drifts rather than
 * rendering `undefined` somewhere downstream. That matters more than usual
 * here: the DDL in backend/sql/core-product-schema.sql was reconstructed from
 * application code and has not yet been diffed against live Aurora.
 */
import { z } from "zod";
import {
  ApiErrorSchema,
  BankAnalyticsSchema,
  BehavioralSignalDetailSchema,
  CustomerProfileSchema,
  CustomerSignalsSchema,
  HealthSchema,
  LifeEventDetailSchema,
  PurchaseSignalsSchema,
  RiskFactorDetailSchema,
  RiskFactorsSchema,
  TransactionsSchema,
  TripDetailSchema,
  TripsSchema,
  type BankAnalytics,
  type BehavioralSignal,
  type CustomerProfile,
  type CustomerSignals,
  type LifeEvent,
  type PurchaseSignals,
  type RiskFactor,
  type RiskFactors,
  type Transactions,
  type Trip,
  type Trips,
} from "./contract";

/** A non-2xx response from the API, carrying the status so callers can branch. */
export class VentusApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly path: string
  ) {
    super(message);
    this.name = "VentusApiError";
  }

  /** The API 404s for "no rows yet", which is usually an empty state, not a failure. */
  get isNotFound() {
    return this.status === 404;
  }

  get isUnauthorized() {
    return this.status === 401 || this.status === 403;
  }
}

/**
 * The response did not match the contract. Distinct from VentusApiError so
 * monitoring can separate "API is down" from "API changed shape on us".
 */
export class VentusContractError extends Error {
  constructor(
    readonly path: string,
    readonly issues: z.ZodIssue[]
  ) {
    super(
      `Response from ${path} did not match the contract: ${issues
        .map((i) => `${i.path.join(".")} ${i.message}`)
        .join("; ")}`
    );
    this.name = "VentusContractError";
  }
}

export interface VentusApiConfig {
  baseUrl: string;
  /**
   * Resolves the auth headers for each request.
   *
   * The API currently authenticates with a per-bank `x-api-key` looked up in
   * the api_keys table. That is correct for server-to-server callers and wrong
   * for a browser console, where the key would ship in the bundle and be
   * readable by any user of any tenant. The production console must send a
   * short-lived per-user token that the API exchanges for a tenant, which is
   * why this is a function and not a static key.
   */
  authHeaders: () => Promise<Record<string, string>> | Record<string, string>;
  /** Defaults to 30s. Aurora cold starts can be slow on the first request. */
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

export interface ListParams {
  limit?: number;
  offset?: number;
}

/**
 * The surface the console depends on. Screens should take this rather than
 * importing a concrete client, so tests can pass a stub without a network.
 */
export interface VentusApi {
  health(): Promise<z.infer<typeof HealthSchema>>;
  getCustomerProfile(customerId: string): Promise<CustomerProfile>;
  getCustomerSignals(customerId: string, params?: ListParams): Promise<CustomerSignals>;
  getLifeEvent(customerId: string, lifeEventId: string): Promise<LifeEvent>;
  getBehavioralSignal(customerId: string, signalId: string): Promise<BehavioralSignal>;
  getPurchaseSignals(customerId: string): Promise<PurchaseSignals>;
  getRiskFactors(customerId: string): Promise<RiskFactors>;
  getRiskFactor(customerId: string, riskFactorId: string): Promise<RiskFactor>;
  getTrips(customerId: string): Promise<Trips>;
  getTrip(customerId: string, tripId: string): Promise<Trip>;
  getTransactions(customerId: string, params?: ListParams): Promise<Transactions>;
  getBankAnalytics(): Promise<BankAnalytics>;
}

function buildQuery(params?: ListParams): string {
  if (!params) return "";
  const search = new URLSearchParams();
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function createVentusApi(config: VentusApiConfig): VentusApi {
  const doFetch = config.fetchImpl ?? fetch;
  const timeoutMs = config.timeoutMs ?? 30_000;
  const baseUrl = config.baseUrl.replace(/\/$/, "");

  async function request<T extends z.ZodTypeAny>(
    path: string,
    schema: T
  ): Promise<z.infer<T>> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    try {
      response = await doFetch(`${baseUrl}${path}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(await config.authHeaders()),
        },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      const parsed = ApiErrorSchema.safeParse(body);
      throw new VentusApiError(
        response.status,
        parsed.success ? parsed.data.error : response.statusText,
        path
      );
    }

    const result = schema.safeParse(body);
    if (!result.success) throw new VentusContractError(path, result.error.issues);
    return result.data;
  }

  const customer = (id: string) => `/v1/customers/${encodeURIComponent(id)}`;

  return {
    health: () => request("/health", HealthSchema),

    getCustomerProfile: (customerId) =>
      request(`${customer(customerId)}/profile`, CustomerProfileSchema),

    getCustomerSignals: (customerId, params) =>
      request(`${customer(customerId)}/life-events${buildQuery(params)}`, CustomerSignalsSchema),

    getLifeEvent: async (customerId, lifeEventId) => {
      const { life_event } = await request(
        `${customer(customerId)}/life-events/${encodeURIComponent(lifeEventId)}`,
        LifeEventDetailSchema
      );
      return life_event;
    },

    getBehavioralSignal: async (customerId, signalId) => {
      const { behavioral_signal } = await request(
        `${customer(customerId)}/behavioral-signals/${encodeURIComponent(signalId)}`,
        BehavioralSignalDetailSchema
      );
      return behavioral_signal;
    },

    getPurchaseSignals: (customerId) =>
      request(`${customer(customerId)}/purchase-signals`, PurchaseSignalsSchema),

    getRiskFactors: (customerId) =>
      request(`${customer(customerId)}/risk-factors`, RiskFactorsSchema),

    getRiskFactor: async (customerId, riskFactorId) => {
      const { risk_factor } = await request(
        `${customer(customerId)}/risk-factors/${encodeURIComponent(riskFactorId)}`,
        RiskFactorDetailSchema
      );
      return risk_factor;
    },

    getTrips: (customerId) => request(`${customer(customerId)}/trips`, TripsSchema),

    getTrip: async (customerId, tripId) => {
      const { trip } = await request(
        `${customer(customerId)}/trips/${encodeURIComponent(tripId)}`,
        TripDetailSchema
      );
      return trip;
    },

    getTransactions: (customerId, params) =>
      request(`${customer(customerId)}/transactions${buildQuery(params)}`, TransactionsSchema),

    getBankAnalytics: () => request("/v1/analytics/bank", BankAnalyticsSchema),
  };
}
