import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import Button from '../../components/ui/button/Button';
import InputField from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import Select from '../../components/form/Select';
import { showSuccessToast, showErrorToast } from '../../components/ui/toast';
import { useCustomer, type CustomerFormData } from '../../context/CustomerContext';

const initialFormData: CustomerFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  status: 'active',
  notes: ''
};

const countries = [
  { value: 'USA', label: 'United States' },
  { value: 'CAN', label: 'Canada' },
  { value: 'GBR', label: 'United Kingdom' },
  { value: 'AUS', label: 'Australia' },
  { value: 'DEU', label: 'Germany' },
  { value: 'FRA', label: 'France' },
  { value: 'JPN', label: 'Japan' },
  { value: 'IND', label: 'India' },
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export default function AddCustomer() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addCustomer, updateCustomer, getCustomerById, isLoading } = useCustomer();
  const [formData, setFormData] = useState<CustomerFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<CustomerFormData>>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFallbackCustomer, setIsFallbackCustomer] = useState(false);

  // Check if we're in edit mode and load customer data
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      // Check if this is a fallback customer (timestamp-based ID)
      const isFallback = /^\d{13}$/.test(id);
      setIsFallbackCustomer(isFallback);
      
      const customer = getCustomerById(id);
      if (customer) {
        setFormData({
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone || '',
          address: customer.address || '',
          city: customer.city || '',
          state: customer.state || '',
          postalCode: customer.postalCode || '',
          country: customer.country || '',
          status: customer.status,
          notes: customer.notes || ''
        });
      } else {
        showErrorToast('Error', 'Customer not found');
        navigate('/customer/list');
      }
    }
  }, [id, getCustomerById, navigate]);

  const handleInputChange = (field: keyof CustomerFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerFormData> = {};

    // Required fields validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // Phone is optional, no validation needed

    if (!formData.country) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showErrorToast('Validation Error', 'Please fix the errors before submitting');
      return;
    }

    try {
      if (isEditMode && id) {
        await updateCustomer(id, formData);
        showSuccessToast(
          'Customer Updated',
          `${formData.firstName} ${formData.lastName} has been updated successfully`
        );
      } else {
        await addCustomer(formData);
        showSuccessToast(
          'Customer Added',
          `${formData.firstName} ${formData.lastName} has been added successfully`
        );
      }
      
      // Navigate back to customer list
      navigate('/customer/list');
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      const action = isEditMode ? 'update' : 'add';
      showErrorToast('Error', `Failed to ${action} customer. Please try again.`);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  return (
    <>
      <PageMeta
        title={isEditMode ? "Edit Customer | TailAdmin" : "Add Customer | TailAdmin"}
        description={isEditMode ? "Edit customer information" : "Add a new customer to your database"}
      />
      <PageBreadcrumb pageTitle={isEditMode ? "Edit Customer" : "Add Customer"} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? 'Edit Customer' : 'Add New Customer'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isEditMode 
                ? 'Update the customer information below' 
                : 'Fill in the information below to add a new customer'
              }
            </p>
          </div>
        </div>

        {/* Fallback Customer Warning */}
        {isEditMode && isFallbackCustomer && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Offline Mode
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>
                    This customer was created while offline and changes will be saved locally only. 
                    To sync with the server, please check your internet connection and refresh the page.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <ComponentCard title="Personal Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                    <InputField
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      error={!!errors.firstName}
                      hint={errors.firstName}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                    <InputField
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      error={!!errors.lastName}
                      hint={errors.lastName}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
              </ComponentCard>

              {/* Contact Information */}
              <ComponentCard title="Contact Information">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                      <InputField
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        error={!!errors.email}
                        hint={errors.email}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                      <InputField
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        error={!!errors.phone}
                        hint={errors.phone}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                </div>
              </ComponentCard>

              {/* Address Information */}
              <ComponentCard title="Address Information">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <InputField
                      id="address"
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Enter street address"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <InputField
                        id="city"
                        name="city"
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State/Province</Label>
                      <InputField
                        id="state"
                        name="state"
                        type="text"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="Enter state"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <InputField
                        id="postalCode"
                        name="postalCode"
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        placeholder="Enter postal code"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="country">Country <span className="text-red-500">*</span></Label>
                    <Select
                      value={formData.country}
                      onChange={(value) => handleInputChange('country', value)}
                      options={countries}
                      placeholder="Select country"
                    />
                    {errors.country && (
                      <p className="mt-1.5 text-xs text-error-500">{errors.country}</p>
                    )}
                  </div>
                </div>
              </ComponentCard>

              {/* Additional Information */}
              <ComponentCard title="Additional Information">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
                    <Select
                      value={formData.status}
                      onChange={(value) => handleInputChange('status', value as 'active' | 'inactive')}
                      options={statusOptions}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={4}
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Add any additional notes about the customer..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                    />
                  </div>
                </div>
              </ComponentCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Action Buttons */}
              <ComponentCard title="Actions">
                <div className="space-y-4">
                  <Button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {isEditMode ? 'Updating Customer...' : 'Adding Customer...'}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {isEditMode ? 'Update Customer' : 'Add Customer'}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    className="w-full"
                    disabled={isLoading}
                  >
                    Reset Form
                  </Button>
                </div>
              </ComponentCard>

              {/* Guidelines */}
              <ComponentCard title="Customer Guidelines">
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Required Information</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>First and last name</li>
                      <li>Valid email address</li>
                      <li>Phone number</li>
                      <li>Country selection</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Best Practices</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Double-check email format</li>
                      <li>Include complete address for shipping</li>
                      <li>Add notes for special requirements</li>
                      <li>Set appropriate status</li>
                    </ul>
                  </div>
                </div>
              </ComponentCard>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}