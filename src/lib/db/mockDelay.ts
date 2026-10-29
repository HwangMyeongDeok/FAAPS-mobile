/**
 * Shared mock-network helpers.
 *
 * Every mock branch in `src/lib/api/*` awaits `mockDelay()` so the UI always
 * exercises its loading / skeleton states during development.
 */

/** Default artificial latency for mock requests (ms). */
export const MOCK_NETWORK_DELAY_MS = 800;

/** Wait for the given amount of time — simulates network latency. */
export const mockDelay = (ms: number = MOCK_NETWORK_DELAY_MS) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Simulate a paginated collection with a random-ish delay.
 * `page` is 1-based.
 */
export async function mockPaginate<T>(
  items: T[],
  page: number,
  pageSize: number,
): Promise<{ data: T[]; total: number; page: number; page_size: number }> {
  await mockDelay();
  const total = items.length;
  const start = (page - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    total,
    page,
    page_size: pageSize,
  };
}
