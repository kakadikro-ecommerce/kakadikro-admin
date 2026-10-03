import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import adminService from '../services/admin-api';
import { contactService } from '../services/contacts-api';
import { fetchAdminOrders } from '../services/Orders-api';
import { fetchAdminPayments } from '../services/payments-api';
import getAllProducts from '../services/products-api';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  markSidebarSectionSeen,
  setSidebarBadges,
} from '../store/modules/sidebarBadges/sidebarBadges.slice';
import {
  buildBadgeCountsFromLists,
  getLastVisitedAt,
  type SidebarSection,
} from '../utils/sidebarLastSeen';

const POLL_INTERVAL_MS = 20_000;
const RECENT_LIMIT = 50;

const ROUTE_SECTION_MAP: Record<string, SidebarSection> = {
  '/users': 'users',
  '/products': 'products',
  '/orders': 'orders',
  '/contacts': 'contacts',
  '/payments': 'payments',
};

const fetchRecentLists = async () => {
  const [usersRes, productsRes, ordersRes, contactsRes, paymentsRes] =
    await Promise.all([
      adminService.getAllUsers(1, RECENT_LIMIT, undefined, 'user'),
      getAllProducts(1, RECENT_LIMIT),
      fetchAdminOrders({ page: 1, limit: RECENT_LIMIT }),
      contactService.adminGetAll(1, RECENT_LIMIT),
      fetchAdminPayments({ page: 1, limit: RECENT_LIMIT }),
    ]);

  return {
    users: usersRes.users || [],
    products: productsRes.products || [],
    orders: ordersRes.orders || [],
    contacts: contactsRes.contacts || [],
    payments: paymentsRes.payments || [],
  };
};

/**
 * Polls recent records and updates per-section sidebar "new" badges.
 * Each label counts only its own new items (Users badge ≠ Orders badge).
 */
export const useSidebarBadgePoll = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const inFlight = useRef(false);
  const pathnameRef = useRef(location.pathname);
  pathnameRef.current = location.pathname;

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    const refresh = async () => {
      if (inFlight.current || cancelled) return;
      inFlight.current = true;
      try {
        const lists = await fetchRecentLists();
        if (cancelled) return;

        const activeSection = ROUTE_SECTION_MAP[pathnameRef.current];
        if (activeSection) {
          // Visiting a section clears that label only.
          dispatch(markSidebarSectionSeen(activeSection));
        }

        const visitedAt = getLastVisitedAt();
        const badges = buildBadgeCountsFromLists(lists, visitedAt);

        // Keep the active section cleared even if brand-new rows just arrived.
        if (activeSection) {
          badges[activeSection] = 0;
        }

        dispatch(setSidebarBadges(badges));
      } catch (error) {
        console.error('Sidebar badge poll failed:', error);
      } finally {
        inFlight.current = false;
      }
    };

    void refresh();
    const intervalId = window.setInterval(() => {
      void refresh();
    }, POLL_INTERVAL_MS);

    const onFocus = () => {
      void refresh();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, [dispatch, isAuthenticated]);

  // Clear the matching label as soon as the admin opens that page.
  useEffect(() => {
    if (!isAuthenticated) return;
    const activeSection = ROUTE_SECTION_MAP[location.pathname];
    if (activeSection) {
      dispatch(markSidebarSectionSeen(activeSection));
    }
  }, [dispatch, isAuthenticated, location.pathname]);
};
