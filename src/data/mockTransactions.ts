// Mock data for transactions when backend is not available
import { Transaction, TransactionStats } from '../services/api';

export const mockTransactions: Transaction[] = [
  {
    id: "1",
    _id: "1",
    transactionId: "TXN-001",
    orderId: "ORD-001",
    customer: {
      id: "1",
      _id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1-555-0123",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
    },
    amount: 299.99,
    paymentMethod: "Credit Card",
    status: "Completed",
    transactionDate: "2024-01-15T10:30:00Z",
    description: "Payment for Order ORD-001",
    currency: "USD",
    fees: 8.99,
    netAmount: 291.00,
    reference: "REF-123456",
    paymentProcessor: "Stripe",
    merchantId: "MERCHANT-001",
    authorizationCode: "AUTH-789",
    settlementDate: "2024-01-16T00:00:00Z",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    billingAddress: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA"
    },
    metadata: {
      source: "web",
      campaign: "summer-sale",
      deviceType: "desktop"
    },
    invoice: {
      invoiceNumber: "INV-001",
      invoiceDate: "2024-01-15T10:30:00Z",
      dueDate: "2024-01-22T10:30:00Z",
      status: "Paid",
      subtotal: 299.99,
      taxAmount: 24.00,
      discountAmount: 0.00,
      totalAmount: 323.99,
      notes: "Thank you for your business!",
      downloadUrl: "/invoices/INV-001.pdf"
    },
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "2",
    _id: "2",
    transactionId: "TXN-002",
    orderId: "ORD-002",
    customer: {
      id: "2",
      _id: "2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+1-555-0124",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face"
    },
    amount: 149.50,
    paymentMethod: "PayPal",
    status: "Processing",
    transactionDate: "2024-01-14T14:20:00Z",
    description: "Payment for Order ORD-002",
    currency: "USD",
    fees: 4.49,
    netAmount: 145.01,
    reference: "REF-123457",
    paymentProcessor: "PayPal",
    merchantId: "MERCHANT-001",
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    billingAddress: {
      street: "456 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210",
      country: "USA"
    },
    metadata: {
      source: "mobile",
      campaign: "mobile-app",
      deviceType: "mobile"
    },
    invoice: {
      invoiceNumber: "INV-002",
      invoiceDate: "2024-01-14T14:20:00Z",
      dueDate: "2024-01-21T14:20:00Z",
      status: "Sent",
      subtotal: 149.50,
      taxAmount: 12.00,
      discountAmount: 5.00,
      totalAmount: 156.50,
      notes: "Special discount applied",
      downloadUrl: "/invoices/INV-002.pdf"
    },
    createdAt: "2024-01-14T14:20:00Z",
    updatedAt: "2024-01-14T14:20:00Z"
  },
  {
    id: "3",
    _id: "3",
    transactionId: "TXN-003",
    orderId: "ORD-003",
    customer: {
      id: "3",
      _id: "3",
      name: "Bob Johnson",
      email: "bob.johnson@example.com",
      phone: "+1-555-0125",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face"
    },
    amount: 89.99,
    paymentMethod: "Bank Transfer",
    status: "Failed",
    transactionDate: "2024-01-13T09:15:00Z",
    description: "Payment for Order ORD-003",
    currency: "USD",
    fees: 2.70,
    netAmount: 87.29,
    reference: "REF-123458",
    paymentProcessor: "ACH",
    merchantId: "MERCHANT-001",
    failureReason: "Insufficient funds",
    ipAddress: "192.168.1.102",
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
    billingAddress: {
      street: "789 Pine St",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      country: "USA"
    },
    metadata: {
      source: "web",
      campaign: "winter-sale",
      deviceType: "desktop"
    },
    invoice: {
      invoiceNumber: "INV-003",
      invoiceDate: "2024-01-13T09:15:00Z",
      dueDate: "2024-01-20T09:15:00Z",
      status: "Overdue",
      subtotal: 89.99,
      taxAmount: 7.20,
      discountAmount: 0.00,
      totalAmount: 97.19,
      notes: "Payment failed - please retry",
      downloadUrl: "/invoices/INV-003.pdf"
    },
    createdAt: "2024-01-13T09:15:00Z",
    updatedAt: "2024-01-13T09:15:00Z"
  },
  {
    id: "4",
    _id: "4",
    transactionId: "TXN-004",
    orderId: "ORD-004",
    customer: {
      id: "4",
      _id: "4",
      name: "Alice Brown",
      email: "alice.brown@example.com",
      phone: "+1-555-0126",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face"
    },
    amount: 199.99,
    paymentMethod: "Digital Wallet",
    status: "Refunded",
    transactionDate: "2024-01-12T16:45:00Z",
    description: "Payment for Order ORD-004",
    currency: "USD",
    fees: 5.99,
    netAmount: 194.00,
    reference: "REF-123459",
    paymentProcessor: "Apple Pay",
    merchantId: "MERCHANT-001",
    refundReason: "Customer requested refund",
    ipAddress: "192.168.1.103",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15",
    billingAddress: {
      street: "321 Elm St",
      city: "Miami",
      state: "FL",
      zipCode: "33101",
      country: "USA"
    },
    metadata: {
      source: "mobile",
      campaign: "app-promo",
      deviceType: "mobile"
    },
    invoice: {
      invoiceNumber: "INV-004",
      invoiceDate: "2024-01-12T16:45:00Z",
      dueDate: "2024-01-19T16:45:00Z",
      status: "Cancelled",
      subtotal: 199.99,
      taxAmount: 16.00,
      discountAmount: 10.00,
      totalAmount: 205.99,
      notes: "Refund processed",
      downloadUrl: "/invoices/INV-004.pdf"
    },
    createdAt: "2024-01-12T16:45:00Z",
    updatedAt: "2024-01-12T16:45:00Z"
  },
  {
    id: "5",
    _id: "5",
    transactionId: "TXN-005",
    orderId: "ORD-005",
    customer: {
      id: "5",
      _id: "5",
      name: "Charlie Wilson",
      email: "charlie.wilson@example.com",
      phone: "+1-555-0127",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face"
    },
    amount: 75.00,
    paymentMethod: "Cash",
    status: "Pending",
    transactionDate: "2024-01-11T11:30:00Z",
    description: "Payment for Order ORD-005",
    currency: "USD",
    fees: 0.00,
    netAmount: 75.00,
    reference: "REF-123460",
    paymentProcessor: "Cash Payment",
    merchantId: "MERCHANT-001",
    ipAddress: "192.168.1.104",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    billingAddress: {
      street: "654 Maple Dr",
      city: "Seattle",
      state: "WA",
      zipCode: "98101",
      country: "USA"
    },
    metadata: {
      source: "web",
      campaign: "direct-sale",
      deviceType: "desktop"
    },
    invoice: {
      invoiceNumber: "INV-005",
      invoiceDate: "2024-01-11T11:30:00Z",
      dueDate: "2024-01-18T11:30:00Z",
      status: "Draft",
      subtotal: 75.00,
      taxAmount: 6.00,
      discountAmount: 0.00,
      totalAmount: 81.00,
      notes: "Cash payment pending verification",
      downloadUrl: "/invoices/INV-005.pdf"
    },
    createdAt: "2024-01-11T11:30:00Z",
    updatedAt: "2024-01-11T11:30:00Z"
  }
];

export const mockTransactionStats: TransactionStats = {
  totalTransactions: 5,
  totalAmount: 814.47,
  totalFees: 22.17,
  netAmount: 792.30,
  avgTransaction: 162.89,
  paidInvoices: 1,
  completedTransactions: 1,
  pendingTransactions: 1,
  failedTransactions: 1,
  refundedTransactions: 1,
  processingTransactions: 1
};
