import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { contactService } from '../../../services/contacts-api';
import type { Contact } from '../../../types/contacts';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface NotificationState {
  show: boolean;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface ContactsState {
  contacts: Contact[];
  selectedContact: Contact | null;
  loading: boolean;
  searchTerm: string;
  pagination: PaginationInfo;
  notification: NotificationState;
  deleteModal: {
    isOpen: boolean;
    contactId: string | null;
    contactName: string | null;
  };
  viewModal: {
    isOpen: boolean;
  };
}

const initialState: ContactsState = {
  contacts: [],
  selectedContact: null,
  loading: false,
  searchTerm: '',
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
  notification: {
    show: false,
    type: 'success',
    message: '',
  },
  deleteModal: {
    isOpen: false,
    contactId: null,
    contactName: null,
  },
  viewModal: {
    isOpen: false,
  },
};

export const fetchContacts = createAsyncThunk(
  'contacts/fetchContacts',
  async ({ page, limit }: { page: number; limit: number }) => {
    const response = await contactService.adminGetAll(page, limit);
    return {
      contacts: Array.isArray(response.contacts) ? response.contacts : [],
      pagination: response.pagination,
    };
  },
);

const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.pagination.currentPage = 1;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },
    clearNotification: (state) => {
      state.notification.show = false;
      state.notification.message = '';
    },
    showNotification: (
      state,
      action: PayloadAction<{
        type: 'success' | 'error' | 'info' | 'warning';
        message: string;
      }>,
    ) => {
      state.notification = {
        show: true,
        type: action.payload.type,
        message: action.payload.message,
      };
    },
    openViewModal: (state, action: PayloadAction<Contact>) => {
      state.selectedContact = action.payload;
      state.viewModal.isOpen = true;
    },
    closeViewModal: (state) => {
      state.viewModal.isOpen = false;
      state.selectedContact = null;
    },
    openDeleteModal: (
      state,
      action: PayloadAction<{ id: string; name: string }>,
    ) => {
      state.deleteModal.isOpen = true;
      state.deleteModal.contactId = action.payload.id;
      state.deleteModal.contactName = action.payload.name;
    },
    closeDeleteModal: (state) => {
      state.deleteModal.isOpen = false;
      state.deleteModal.contactId = null;
      state.deleteModal.contactName = null;
    },
    clearSelectedContact: (state) => {
      state.selectedContact = null;
    },
    resetContactsState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContacts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.loading = false;
        state.contacts = action.payload.contacts;
        state.pagination.totalPages = action.payload.pagination.totalPages || 1;
        state.pagination.totalItems = action.payload.pagination.total || 0;
        state.pagination.currentPage = action.payload.pagination.page || 1;
        state.pagination.itemsPerPage = action.payload.pagination.limit || 10;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.loading = false;
        state.notification = {
          show: true,
          type: 'error',
          message: action.error.message || 'Failed to fetch contacts',
        };
      });
  },
});

export const {
  setSearchTerm,
  setCurrentPage,
  clearNotification,
  showNotification,
  openViewModal,
  closeViewModal,
  openDeleteModal,
  closeDeleteModal,
  clearSelectedContact,
  resetContactsState,
} = contactsSlice.actions;

export const selectContacts = (state: { contacts: ContactsState }) =>
  state.contacts.contacts;

export const selectFilteredContacts = (state: { contacts: ContactsState }) => {
  const { contacts, searchTerm } = state.contacts;

  if (!searchTerm.trim()) {
    return contacts;
  }

  const searchLower = searchTerm.toLowerCase();
  return contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchLower) ||
      contact.email.toLowerCase().includes(searchLower) ||
      contact.phone.includes(searchTerm),
  );
};

export const selectLoading = (state: { contacts: ContactsState }) =>
  state.contacts.loading;
export const selectPagination = (state: { contacts: ContactsState }) =>
  state.contacts.pagination;
export const selectNotification = (state: { contacts: ContactsState }) =>
  state.contacts.notification;
export const selectDeleteModal = (state: { contacts: ContactsState }) =>
  state.contacts.deleteModal;
export const selectViewModal = (state: { contacts: ContactsState }) =>
  state.contacts.viewModal;
export const selectSelectedContact = (state: { contacts: ContactsState }) =>
  state.contacts.selectedContact;
export const selectSearchTerm = (state: { contacts: ContactsState }) =>
  state.contacts.searchTerm;

export default contactsSlice.reducer;
