import { useEffect, useState } from 'react';
import { Eye, Trash2 } from 'lucide-react';
import { contactService } from '../../../services/contacts-api';
import { Contact } from '../../../types/contacts';
import ContactViewModal from './details/ContactsDetails';
import Alert from '../../../pages/UiElements/Alerts';
import Pagination from '../../../pages/UiElements/Pagination';
import SearchInput from '../../../pages/UiElements/SearchBar';
import TableLoaderRow from '../../../pages/UiElements/TableLoaderRow';

const Contacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }>({
    show: false,
    type: 'success',
    message: '',
  });

  const showNotification = (
    type: 'success' | 'error' | 'info' | 'warning',
    message: string,
  ) => {
    setNotification({ show: true, type, message });
    setTimeout(
      () => setNotification((prev) => ({ ...prev, show: false })),
      4000,
    );
  };

  const loadContacts = async (page = 1) => {
    try {
      setLoading(true);
      const res = await contactService.adminGetAll(page, 10);

      const contactsArray = Array.isArray(res.contacts) ? res.contacts : [];
      setContacts(contactsArray);
      setTotalPages(res.pagination.totalPages || 1);
      setTotalItems(res.pagination.total || 0);
      setCurrentPage(res.pagination.page || 1);
    } catch (err) {
      console.error('Load error:', err);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts(currentPage);
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const openViewModal = (contact: Contact) => {
    setSelectedContact(contact);
    setIsViewOpen(true);
  };

  const confirmDelete = (id: string, name: string) => {
    setContactToDelete({ id, name });
  };

  const processDelete = async () => {
    if (!contactToDelete) return;
    try {
      setIsDeleting(true);
      await contactService.delete(contactToDelete.id);
      loadContacts(currentPage);
      setContactToDelete(null);
      showNotification('success', 'Contact deleted successfully!');
    } catch (error) {
      showNotification('error', 'Failed to delete contact. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm);
    return matchesSearch;
  });
  const hasActiveFilters = searchTerm.trim().length > 0;
  const effectiveTotalItems = hasActiveFilters ? filteredContacts.length : totalItems;
  const effectiveTotalPages = hasActiveFilters
    ? Math.ceil(effectiveTotalItems / 10)
    : totalPages;

  return (
    <div className="relative min-h-screen font-sans">
      {notification.show && (
        <div className="fixed top-6 right-6 z-[10000] w-full max-w-md animate-in slide-in-from-right duration-300">
          <Alert
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification({ ...notification, show: false })}
          />
        </div>
      )}

      <div className="mx-auto w-full max-w-8xl overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-3 shadow-sm sm:p-4 md:p-8">
        <div className="mb-8 flex flex-col items-stretch justify-between gap-6 px-1 sm:px-0 xl:flex-row xl:items-center">
          <div className="w-full min-w-0 sm:w-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-[#3E2723] tracking-tight">
              Contacts Management
            </h1>
          </div>

          <div className="w-full min-w-0 sm:w-auto sm:max-w-md">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by name, email or phone..."
            />
          </div>
        </div>

        <div className="table-scroll-wrapper overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3 min-w-[640px] md:min-w-full">
            <thead>
              <tr className="text-[#3E2723] text-[10px] font-bold uppercase tracking-[0.2em]">
                <th className="px-6 py-2 w-16 text-center">ID</th>
                <th className="px-6 py-2">Name</th>
                <th className="px-6 py-2 hidden lg:table-cell">Email</th>
                <th className="px-6 py-2">Phone</th>
                <th className="px-6 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableLoaderRow colSpan={5} />
              ) : filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-gray-400 text-sm">
                        No contacts found
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact, i) => (
                  <tr key={contact._id || i} className="group transition-all">
                    <td className="px-6 py-4 bg-gray-50/50 rounded-l-2xl text-[#3E2723] font-bold text-xs text-center">
                      {String((currentPage - 1) * 10 + i + 1).padStart(2, '0')}
                    </td>
                    <td className="px-6 py-4 bg-gray-50/50">
                      <div className="flex items-center gap-2">
                        <span className=" text-gray-900 font-bold text-sm">
                          {contact.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 bg-gray-50/50 text-sm text-gray-900 font-bold hidden lg:table-cell">
                      <div>
                        {contact.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 bg-gray-50/50">
                      <div>
                        <span className="text-sm text-gray-900 font-bold">
                          {contact.phone}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 bg-gray-50/50 rounded-r-2xl text-center">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => openViewModal(contact)}
                          className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() =>
                            contact._id && confirmDelete(contact._id, contact.name)
                          }
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Delete Contact"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={effectiveTotalPages}
          totalItems={effectiveTotalItems}
          itemsPerPage={10}
          onPageChange={(page) => setCurrentPage(page)}
          loading={loading}
        />
      </div>

      {contactToDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#2D1B19]/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl border border-white animate-in fade-in zoom-in duration-200">
            <div className="bg-rose-50/50 p-8 flex flex-col items-center text-center relative">
              <button
                onClick={() => setContactToDelete(null)}
                className="absolute top-4 right-4 p-2 text-rose-300 hover:text-rose-500 transition-colors"
              >
                ✕
              </button>
              <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center text-rose-500 mb-5 border border-rose-100">
                <span className="text-4xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-[#3E2723] tracking-tight">
                Delete Contact?
              </h3>
              <p className="text-[11px] text-gray-500  tracking-wider mt-3 leading-relaxed px-4 opacity-70">
                You are about to delete <br />
                <span className="text-rose-600 font-bold">
                  "{contactToDelete.name}"
                </span>
              </p>
            </div>
            <div className="p-6 bg-white flex gap-3">
              <button
                onClick={() => setContactToDelete(null)}
                className="flex-1 py-4 rounded-2xl text-[10px] font-bold text-gray-400 border border-transparent hover:border-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={processDelete}
                disabled={isDeleting}
                className="flex-1 py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-bold shadow-xl flex justify-center items-center gap-2 transition-all active:scale-95"
              >
                {isDeleting ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                ) : (
                  'Delete Now'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <ContactViewModal
        contact={selectedContact}
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        onRefresh={loadContacts}
      />
    </div>
  );
};

export default Contacts;
