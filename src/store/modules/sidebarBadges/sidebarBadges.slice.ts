import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  emptySidebarCounts,
  setLastVisitedAt,
  type SidebarCounts,
  type SidebarSection,
} from '../../../utils/sidebarLastSeen';

interface SidebarBadgesState {
  badges: SidebarCounts;
  hydrated: boolean;
}

const initialState: SidebarBadgesState = {
  badges: emptySidebarCounts(),
  hydrated: false,
};

const sidebarBadgesSlice = createSlice({
  name: 'sidebarBadges',
  initialState,
  reducers: {
    setSidebarBadges: (state, action: PayloadAction<SidebarCounts>) => {
      state.badges = action.payload;
      state.hydrated = true;
    },
    markSidebarSectionSeen: (state, action: PayloadAction<SidebarSection>) => {
      const section = action.payload;
      state.badges[section] = 0;
      setLastVisitedAt(section);
    },
    bumpSidebarBadge: (
      state,
      action: PayloadAction<{ section: SidebarSection; by?: number }>,
    ) => {
      const { section, by = 1 } = action.payload;
      state.badges[section] = Math.max(0, (state.badges[section] || 0) + by);
      state.hydrated = true;
    },
    resetSidebarBadges: () => initialState,
  },
});

export const {
  setSidebarBadges,
  markSidebarSectionSeen,
  bumpSidebarBadge,
  resetSidebarBadges,
} = sidebarBadgesSlice.actions;

export default sidebarBadgesSlice.reducer;
