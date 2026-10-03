export type SidebarSection =
  | 'users'
  | 'products'
  | 'orders'
  | 'contacts'
  | 'payments';

export type SidebarCounts = Record<SidebarSection, number>;
export type SidebarVisitedAt = Partial<Record<SidebarSection, string>>;

const STORAGE_KEY = 'kaka_dikro_admin_sidebar_last_visited';
const LEGACY_COUNTS_KEY = 'kaka_dikro_admin_sidebar_last_seen';

/** Items newer than this are treated as "new" until the section is opened. */
export const NEW_ITEM_LOOKBACK_MS = 24 * 60 * 60 * 1000;

const SECTIONS: SidebarSection[] = [
  'users',
  'products',
  'orders',
  'contacts',
  'payments',
];

export const emptySidebarCounts = (): SidebarCounts => ({
  users: 0,
  products: 0,
  orders: 0,
  contacts: 0,
  payments: 0,
});

export const getLastVisitedAt = (): SidebarVisitedAt => {
  try {
    // Drop legacy total-count baselines so badges can show recent activity.
    localStorage.removeItem(LEGACY_COUNTS_KEY);

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== 'object' || parsed === null) return {};
    return parsed as SidebarVisitedAt;
  } catch {
    return {};
  }
};

export const setLastVisitedAt = (
  section: SidebarSection,
  visitedAt: string = new Date().toISOString(),
) => {
  try {
    const next = { ...getLastVisitedAt(), [section]: visitedAt };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage failures (private mode / quota).
  }
};

const getThresholdMs = (visitedAt?: string): number => {
  if (visitedAt) {
    const parsed = new Date(visitedAt).getTime();
    if (Number.isFinite(parsed)) return parsed;
  }
  return Date.now() - NEW_ITEM_LOOKBACK_MS;
};

export const countItemsSince = (
  items: Array<{ createdAt?: string | null }>,
  visitedAt?: string,
): number => {
  const threshold = getThresholdMs(visitedAt);
  let count = 0;

  for (const item of items) {
    if (!item?.createdAt) continue;
    const created = new Date(item.createdAt).getTime();
    if (Number.isFinite(created) && created > threshold) {
      count += 1;
    }
  }

  return count;
};

export const buildBadgeCountsFromLists = (
  lists: Record<SidebarSection, Array<{ createdAt?: string | null }>>,
  visitedAt: SidebarVisitedAt,
): SidebarCounts => {
  const badges = emptySidebarCounts();
  SECTIONS.forEach((section) => {
    badges[section] = countItemsSince(lists[section] || [], visitedAt[section]);
  });
  return badges;
};
