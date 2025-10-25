import { useState, useEffect } from 'react';
import { Modal } from '../ui/modal';
import { CloseIcon, PlusIcon, TrashBinIcon } from '../../icons';
import Button from '../ui/button/Button';
import { QuoteRequest, QuoteItem } from '../../services/api';

interface EditQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: QuoteRequest | null;
  onSave: (updatedQuote: Partial<QuoteRequest>) => void;
}

const EditQuoteModal = ({ isOpen, onClose, quote, onSave }: EditQuoteModalProps) => {
  const [formData, setFormData] = useState<Partial<QuoteRequest>>({});
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (quote) {
      setFormData({
        status: quote.status,
        priority: quote.priority,
        finalQuoteValue: quote.finalQuoteValue,
        notes: quote.notes,
        expiryDate: quote.expiryDate,
        terms: quote.terms,
        deliveryTerms: quote.deliveryTerms,
        paymentTerms: quote.paymentTerms,
      });
      setItems([...quote.items]);
    }
  }, [quote]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Calculate totals
      const subtotal = items.reduce((total, item) => {
        return total + (item.suggestedPrice || item.requestedPrice || 0) * item.quantity;
      }, 0);

      const updatedQuote = {
        ...formData,
        items,
        totalItems: items.length,
        estimatedValue: subtotal,
        lastUpdated: new Date().toISOString(),
      };

      onSave(updatedQuote);
      onClose();
    } catch (error) {
      console.error('Error saving quote:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleItemUpdate = (index: number, field: keyof QuoteItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const handleAddItem = () => {
    const newItem: QuoteItem = {
      id: `temp-${Date.now()}`,
      productId: '',
      productName: '',
      sku: '',
      description: '',
      image: '',
      quantity: 1,
      requestedPrice: 0,
      suggestedPrice: 0,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  if (!quote) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-1">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit Quote - {quote.quoteNumber}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status || ''}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as QuoteRequest['status'] })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Pending">Pending</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Quoted">Quoted</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority || ''}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as QuoteRequest['priority'] })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Final Quote Value ($)
                </label>
                <input
                  type="number"
                  value={formData.finalQuoteValue || ''}
                  onChange={(e) => setFormData({ ...formData, finalQuoteValue: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.expiryDate ? formData.expiryDate.split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Quote Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quote Items</h3>
                <Button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center space-x-2 text-sm"
                  variant="outline"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Item</span>
                </Button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={item.id || index} className="grid grid-cols-12 gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="col-span-12 md:col-span-3">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Product Name
                      </label>
                      <input
                        type="text"
                        value={item.productName}
                        onChange={(e) => handleItemUpdate(index, 'productName', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Product name"
                      />
                    </div>

                    <div className="col-span-6 md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={item.sku}
                        onChange={(e) => handleItemUpdate(index, 'sku', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="SKU"
                      />
                    </div>

                    <div className="col-span-6 md:col-span-1">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Qty
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemUpdate(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        min="1"
                      />
                    </div>

                    <div className="col-span-6 md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Requested Price
                      </label>
                      <input
                        type="number"
                        value={item.requestedPrice || ''}
                        onChange={(e) => handleItemUpdate(index, 'requestedPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="col-span-5 md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Suggested Price
                      </label>
                      <input
                        type="number"
                        value={item.suggestedPrice || ''}
                        onChange={(e) => handleItemUpdate(index, 'suggestedPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="col-span-1 flex items-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        <TrashBinIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms and Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Terms & Conditions
                </label>
                <textarea
                  value={formData.terms || ''}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter terms and conditions..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Internal Notes
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter internal notes..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Delivery Terms
                </label>
                <textarea
                  value={formData.deliveryTerms || ''}
                  onChange={(e) => setFormData({ ...formData, deliveryTerms: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter delivery terms..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Terms
                </label>
                <textarea
                  value={formData.paymentTerms || ''}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter payment terms..."
                />
              </div>
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
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditQuoteModal;