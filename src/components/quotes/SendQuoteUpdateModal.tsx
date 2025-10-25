import { useState, useEffect } from 'react';
import { Modal } from '../ui/modal';
import { CloseIcon, MailIcon } from '../../icons';
import Button from '../ui/button/Button';
import { QuoteRequest } from '../../services/api';

interface SendQuoteUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: QuoteRequest | null;
  onSend: (updateData: {
    recipient: string;
    subject: string;
    message: string;
  }) => void;
}

const SendQuoteUpdateModal = ({ isOpen, onClose, quote, onSend }: SendQuoteUpdateModalProps) => {
  const [formData, setFormData] = useState({
    recipient: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (quote && quote.customer) {
      setFormData({
        recipient: quote.customer.email || '',
        subject: `Quote Update - ${quote.quoteNumber}`,
        message: `Dear ${quote.customer.name},\n\nWe wanted to update you on your quote request.\n\nQuote Number: ${quote.quoteNumber}\nStatus: ${quote.status}\n\nBest regards,\nSales Team`
      });
    }
  }, [quote]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSend({
        recipient: formData.recipient,
        subject: formData.subject,
        message: formData.message
      });
      onClose();
    } catch (error) {
      console.error('Error sending update:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!quote) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-1">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Send Quote Update - {quote.quoteNumber}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recipient Email
              </label>
              <input
                type="email"
                value={formData.recipient}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email address"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email subject"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your message"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <MailIcon className="w-4 h-4" />
                  <span>Send Update</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default SendQuoteUpdateModal;