import React from 'react';
import { Contact } from '../../../../types/contacts';
import { Modal } from '../../../../pages/UiElements/Modal';

interface ContactViewModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

const ContactViewModal: React.FC<ContactViewModalProps> = ({
  contact,
  isOpen,
  onClose,
}) => {
  if (!contact) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-2xl mx-auto bg-white rounded-[2rem] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        <div className="bg-[#3E2723] px-6 py-3 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-white font-bold tracking-tight text-xl md:text-2xl">
              Contact Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 hover:bg-white/10 rounded-lg transition-all text-white/80 text-sm md:text-base font-semibold"
          >
            X
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 custom-scrollbar min-h-0">
          <div className="border-[#EFE4D5] rounded-[1.5rem] p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <InfoItem label="Full Name" value={contact.name} />
              <InfoItem label="Email Address" value={contact.email} />
              <InfoItem label="Phone Number" value={contact.phone} />
              <div>
                <div className="mb-2">
                  <p className="text-sm md:text-base font-bold text-[#A69080] tracking-widest">
                    Submitted
                  </p>
                </div>
                <p className="text-sm md:text-base font-bold text-[#3E2723] tracking-tight leading-none">
                  {formatDate(contact.createdAt)}
                </p>
              </div>

              <div className="md:col-span-2">
                <div className="mb-3">
                  <p className="text-sm md:text-base font-bold text-[#A69080] tracking-widest">
                    Message
                  </p>
                </div>
                <div className="bg-[#FDFBF9] p-5 rounded-[1.5rem] border border-[#EFE4D5]">
                  <p className="text-sm font-medium text-[#3E2723] leading-relaxed whitespace-pre-wrap">
                    {contact.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-2">
    <p className="text-sm md:text-base font-bold text-[#A69080] tracking-widest">
      {label}
    </p>
    <p className="text-sm md:text-base font-bold text-[#3E2723] tracking-tight leading-none">
      {value}
    </p>
  </div>
);
 
export default ContactViewModal; 
