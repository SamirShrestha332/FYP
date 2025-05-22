import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './PaymentStyles.css';
import RecruiterHeader from '../RecruiterHeader';
import { FaDownload, FaArrowLeft } from 'react-icons/fa';

const PaymentInvoice = () => {
  const navigate = useNavigate();
  const { transactionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payment, setPayment] = useState(null);
  const [user, setUser] = useState(null);
  const invoiceRef = useRef(null);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        setLoading(true);
        
        // Get user data from localStorage
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!userData || !token) {
          setError('User session expired. Please log in again.');
          setTimeout(() => navigate('/recruiter/login'), 3000);
          return;
        }
        
        setUser(JSON.parse(userData));
        
        // Fetch payment details from API
        const response = await axios.get(
          `http://localhost:5000/api/recruiter/payments/${transactionId || 'latest'}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (response.data && response.data.payment) {
          setPayment(response.data.payment);
        } else {
          setError('Payment details not found.');
        }
      } catch (error) {
        console.error('Error fetching payment details:', error);
        setError('Failed to fetch payment details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPaymentDetails();
  }, [navigate, transactionId]);
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return `NPR ${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  // Handle print invoice
  const handlePrintInvoice = () => {
    // Use window.open to create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Add necessary styles to the new window
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - HamroJob</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #333;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .invoice-logo-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 2rem;
              border-bottom: 2px solid #2c3e50;
              padding-bottom: 1rem;
            }
            .company-name {
              font-size: 2.5rem;
              font-weight: 700;
              color: #2c3e50;
              margin: 0;
              letter-spacing: -1px;
            }
            .company-tagline {
              color: #7f8c8d;
              font-style: italic;
              margin-top: 0.3rem;
            }
            .invoice-title {
              font-size: 2.5rem;
              font-weight: 700;
              color: #2c3e50;
              letter-spacing: 2px;
            }
            .invoice-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2rem;
              padding: 1rem 0;
            }
            .info-section {
              line-height: 1.6;
            }
            .info-label {
              color: #555;
              margin-bottom: 0.3rem;
            }
            .invoice-details {
              text-align: right;
            }
            .detail-row {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 0.5rem;
            }
            .detail-label {
              font-weight: 600;
              margin-right: 1rem;
              color: #555;
            }
            .detail-value {
              color: #2c3e50;
              font-weight: 500;
            }
            .invoice-to {
              margin-bottom: 2rem;
              padding: 1rem;
              background-color: #f8f9fa;
              border-radius: 5px;
            }
            .section-title {
              font-weight: 600;
              color: #2c3e50;
              margin-bottom: 0.8rem;
              font-size: 1.1rem;
            }
            .client-name {
              font-weight: 600;
              font-size: 1.2rem;
              color: #2c3e50;
              margin-bottom: 0.3rem;
            }
            .client-email {
              color: #555;
            }
            .invoice-items table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 2rem;
              box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
            }
            .invoice-items th {
              background-color: #2c3e50;
              color: white;
              padding: 1rem;
              text-align: left;
              font-weight: 500;
            }
            .invoice-items td {
              padding: 1rem;
              border-bottom: 1px solid #eee;
              vertical-align: top;
            }
            .text-center {
              text-align: center;
            }
            .text-right {
              text-align: right;
            }
            .invoice-items tfoot td {
              padding: 1rem;
              border-top: 2px solid #ddd;
              border-bottom: none;
              background-color: #f8f9fa;
            }
            .invoice-items .total-row td {
              font-size: 1.2rem;
              padding-top: 1.2rem;
              font-weight: 600;
              color: #2c3e50;
            }
            .item-name {
              font-weight: 600;
              color: #2c3e50;
              margin-bottom: 0.5rem;
              font-size: 1.1rem;
            }
            .item-description {
              font-size: 0.9rem;
              color: #555;
              margin: 0.5rem 0;
              line-height: 1.4;
            }
            .item-validity {
              font-size: 0.85rem;
              color: #666;
              margin-top: 0.5rem;
              font-style: italic;
            }
            .invoice-footer {
              display: flex;
              justify-content: space-between;
              border-top: 1px solid #eee;
              padding-top: 1.5rem;
              margin-top: 1rem;
            }
            .payment-info {
              flex: 1;
            }
            .payment-detail {
              margin-bottom: 0.8rem;
              display: flex;
              align-items: center;
            }
            .payment-label {
              font-weight: 600;
              margin-right: 0.5rem;
              color: #555;
            }
            .payment-value {
              color: #2c3e50;
            }
            .invoice-notes {
              flex: 1;
              text-align: right;
            }
            .thank-you {
              font-weight: 600;
              color: #2c3e50;
              margin-bottom: 0.5rem;
              font-size: 1.1rem;
            }
            .support-note {
              color: #555;
              font-size: 0.9rem;
              line-height: 1.4;
            }
            .status-badge {
              display: inline-block;
              padding: 0.3rem 0.7rem;
              border-radius: 20px;
              font-size: 0.8rem;
              color: white;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .status-badge.completed {
              background-color: #4CAF50;
            }
            .status-badge.pending {
              background-color: #FFC107;
              color: #333;
            }
            .status-badge.failed {
              background-color: #F44336;
            }
            .status-badge.refunded {
              background-color: #9E9E9E;
            }
            .invoice-stamp {
              position: absolute;
              bottom: 100px;
              right: 80px;
              transform: rotate(-15deg);
              opacity: 0.5;
              z-index: 1;
            }
            .stamp-border {
              border: 5px solid;
              border-radius: 10px;
              padding: 10px 20px;
              font-size: 2rem;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 2px;
            }
            .stamp-border.completed, .stamp-text.completed {
              border-color: #4CAF50;
              color: #4CAF50;
            }
            .stamp-border.pending, .stamp-text.pending {
              border-color: #FFC107;
              color: #FFC107;
            }
            .stamp-border.failed, .stamp-text.failed {
              border-color: #F44336;
              color: #F44336;
            }
            .stamp-border.refunded, .stamp-text.refunded {
              border-color: #9E9E9E;
              color: #9E9E9E;
            }
            @media print {
              body {
                padding: 0;
                margin: 0;
              }
              @page {
                size: A4;
                margin: 1cm;
              }
            }
          </style>
        </head>
        <body>
          ${invoiceRef.current.innerHTML}
          <script>
            // Auto print when loaded
            window.onload = function() {
              window.print();
              // Close window after print
              window.onfocus = function() { 
                setTimeout(function() { window.close(); }, 500);
              }
            }
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="payment-success-container">
        <RecruiterHeader />
        <div className="payment-success-content">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-success-container">
        <RecruiterHeader />
        <div className="payment-success-content">
          <div className="error-message">{error}</div>
          <button onClick={() => navigate('/recruiter/dashboard')} className="back-button">
            <FaArrowLeft /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-invoice-container">
      <RecruiterHeader />
      <div className="payment-invoice-content">
        <div className="invoice-actions-top">
          <button onClick={() => navigate('/recruiter/dashboard')} className="back-button">
            <FaArrowLeft /> Back to Dashboard
          </button>
          <button onClick={handlePrintInvoice} className="print-button">
            <FaDownload /> Download Invoice
          </button>
        </div>
        
        <div className="invoice-wrapper" ref={invoiceRef}>
          <div className="invoice-logo-header">
            <div className="logo-container">
              <h1 className="company-name">HamroJob</h1>
              <div className="company-tagline">Your Career Partner</div>
            </div>
            <div className="invoice-title">INVOICE</div>
          </div>
          
          <div className="invoice-header">
            <div className="company-info">
              <div className="info-section">
                <div className="info-label">Kathmandu, Nepal</div>
                <div className="info-label">Email: info@hamrojob.com</div>
                <div className="info-label">Phone: +977-1-1234567</div>
                <div className="info-label">Web: www.hamrojob.com</div>
              </div>
            </div>
            <div className="invoice-details">
              <div className="detail-row">
                <div className="detail-label">Invoice No:</div>
                <div className="detail-value">INV-{payment?.id || '000'}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Transaction ID:</div>
                <div className="detail-value">{payment?.transaction_id || 'N/A'}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Date:</div>
                <div className="detail-value">{payment ? formatDate(payment.payment_date) : 'N/A'}</div>
              </div>
            </div>
          </div>
          
          <div className="invoice-to">
            <div className="section-title">INVOICE TO:</div>
            <div className="client-name">{user?.username || 'N/A'}</div>
            <div className="client-email">{user?.email || 'N/A'}</div>
          </div>
          
          <div className="invoice-items">
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="item-name">
                      {payment?.plan_type.charAt(0).toUpperCase() + payment?.plan_type.slice(1)} Plan Subscription
                    </div>
                    <div className="item-description">
                      {payment?.plan_type === 'basic' && 'Post 1 job with 7-day visibility'}
                      {payment?.plan_type === 'standard' && 'Post up to 3 jobs with 15-day visibility + featured badge'}
                      {payment?.plan_type === 'premium' && 'Unlimited job posts, 30-day visibility + top placement'}
                    </div>
                    <div className="item-validity">
                      Validity: {payment ? formatDate(payment.payment_date) : 'N/A'} to {payment ? formatDate(payment.expiry_date) : 'N/A'}
                    </div>
                  </td>
                  <td className="text-center">1</td>
                  <td className="text-right">{payment ? formatCurrency(payment.amount) : 'N/A'}</td>
                  <td className="text-right">{payment ? formatCurrency(payment.amount) : 'N/A'}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="text-right"><strong>Subtotal</strong></td>
                  <td className="text-right">{payment ? formatCurrency(payment.amount) : 'N/A'}</td>
                </tr>
                <tr>
                  <td colSpan="3" className="text-right"><strong>Tax (0%)</strong></td>
                  <td className="text-right">{formatCurrency(0)}</td>
                </tr>
                <tr className="total-row">
                  <td colSpan="3" className="text-right"><strong>Total</strong></td>
                  <td className="text-right"><strong>{payment ? formatCurrency(payment.amount) : 'N/A'}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div className="invoice-footer">
            <div className="payment-info">
              <div className="section-title">Payment Information</div>
              <div className="payment-detail">
                <span className="payment-label">Payment Method:</span> 
                <span className="payment-value">{payment?.payment_method.toUpperCase() || 'N/A'}</span>
              </div>
              <div className="payment-detail">
                <span className="payment-label">Payment Status:</span> 
                <span className={`status-badge ${payment?.status || 'pending'}`}>
                  {payment?.status.charAt(0).toUpperCase() + payment?.status.slice(1) || 'N/A'}
                </span>
              </div>
            </div>
            
            <div className="invoice-notes">
              <div className="thank-you">Thank you for your business!</div>
              <div className="support-note">For any questions regarding this invoice, please contact our support team at support@hamrojob.com</div>
            </div>
          </div>
          
          <div className="invoice-stamp">
            <div className={`stamp-border ${payment?.status || 'pending'}`}>
              <div className={`stamp-text ${payment?.status || 'pending'}`}>
                {payment?.status.toUpperCase() || 'PENDING'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentInvoice;
