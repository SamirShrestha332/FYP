import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Payments.css';
import Sidebar from './Sidebar';

function Payments() {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPlan, setFilterPlan] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [paymentsPerPage] = useState(10);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [revenueByPlan, setRevenueByPlan] = useState({
        basic: 0,
        standard: 0,
        premium: 0
    });
    const [showAddModal, setShowAddModal] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const invoiceRef = useRef();
    const [newPayment, setNewPayment] = useState({
        recruiterEmail: '',
        amount: 1000,
        planType: 'basic',
        jobPostsAllowed: 1,
        validityDays: 7,
        status: 'completed'
    });

    useEffect(() => {
        // Check if admin is logged in
        const adminUser = localStorage.getItem('adminUser');
        if (!adminUser) {
            navigate('/admin/login');
            return;
        }

        // Fetch payments data
        const fetchPayments = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('adminToken');
                
                // Fetch real payment data from our API
                console.log('Fetching payments with token:', token ? 'Token exists' : 'No token');
                
                try {
                    // First try to get payment statistics
                    try {
                        const statsResponse = await axios.get('http://localhost:5000/api/admin/payments/stats');
                        if (statsResponse.data && statsResponse.data.success && statsResponse.data.stats) {
                            const stats = statsResponse.data.stats;
                            setTotalRevenue(stats.total_revenue || 0);
                            
                            // Set revenue by plan
                            setRevenueByPlan({
                                basic: stats.basic_revenue || 0,
                                standard: stats.standard_revenue || 0,
                                premium: stats.premium_revenue || 0
                            });
                        }
                    } catch (statsError) {
                        console.error('Error fetching payment stats:', statsError);
                        // Continue with fetching payments even if stats fail
                    }
                    
                    // Now fetch the payments list
                    const response = await axios.get('http://localhost:5000/api/admin/payments', {
                        headers: token ? { Authorization: `Bearer ${token}` } : {}
                    });
                    
                    if (response.data && response.data.success) {
                        console.log('Fetched payments successfully:', response.data.payments.length);
                        
                        // Format the payments data to match component requirements
                        const formattedPayments = response.data.payments.map(payment => ({
                            id: payment.id,
                            transactionId: payment.transaction_id,
                            recruiterName: payment.recruiter_name,
                            recruiterEmail: payment.recruiter_email,
                            amount: payment.amount,
                            planType: payment.plan_type,
                            paymentMethod: payment.payment_method,
                            status: payment.payment_status,
                            date: new Date(payment.payment_date).toISOString().split('T')[0],
                            expiryDate: new Date(payment.expiry_date).toISOString().split('T')[0],
                            jobPostsAllowed: payment.job_posts_allowed,
                            jobPostsUsed: payment.job_posts_used
                        }));
                        
                        setPayments(formattedPayments);
                        
                        // If stats endpoint failed, calculate totals from payments data
                        if (totalRevenue === 0) {
                            // Calculate total revenue
                            const total = formattedPayments.reduce((sum, payment) => 
                                payment.status === 'completed' ? sum + payment.amount : sum, 0);
                            setTotalRevenue(total);
                            
                            // Calculate revenue by plan
                            const planRevenue = {
                                basic: 0,
                                standard: 0,
                                premium: 0
                            };
                            
                            formattedPayments.forEach(payment => {
                                if (payment.status === 'completed' && planRevenue.hasOwnProperty(payment.planType)) {
                                    planRevenue[payment.planType] += payment.amount;
                                }
                            });
                            
                            setRevenueByPlan(planRevenue);
                        }
                    } else {
                        console.error('Failed to fetch payments:', response.data);
                        loadMockData();
                    }
                } catch (error) {
                    console.error('Error fetching payments:', error);
                    loadMockData();
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, [navigate]);

    // Load mock data if API fails
    const loadMockData = () => {
        console.log('Loading mock payment data');
        const mockPayments = [
            {
                id: 1,
                transactionId: 'TRX-' + Date.now(),
                recruiterName: 'Samir Shrestha',
                recruiterEmail: 'samirxtha098@gmail.com',
                amount: 1000,
                planType: 'basic',
                paymentMethod: 'esewa',
                status: 'completed',
                date: '2025-05-15',
                expiryDate: '2025-05-22',
                jobPostsAllowed: 1,
                jobPostsUsed: 0
            },
            {
                id: 2,
                transactionId: 'TRX-' + (Date.now() - 100000),
                recruiterName: 'Sujal Basnet',
                recruiterEmail: 'sujal.basnet6002@gmail.com',
                amount: 2000,
                planType: 'standard',
                paymentMethod: 'esewa',
                status: 'completed',
                date: '2025-05-10',
                expiryDate: '2025-05-25',
                jobPostsAllowed: 3,
                jobPostsUsed: 1
            },
            {
                id: 3,
                transactionId: 'TRX-' + (Date.now() - 200000),
                recruiterName: 'Test Recruiter',
                recruiterEmail: 'test@example.com',
                amount: 3000,
                planType: 'premium',
                paymentMethod: 'esewa',
                status: 'pending',
                date: '2025-05-20',
                expiryDate: '2025-06-19',
                jobPostsAllowed: -1,
                jobPostsUsed: 0
            }
        ];
        
        setPayments(mockPayments);
        
        // Calculate total revenue
        const total = mockPayments.reduce((sum, payment) => 
            payment.status === 'completed' ? sum + payment.amount : sum, 0);
        setTotalRevenue(total);
        
        // Calculate revenue by plan
        const planRevenue = {
            basic: 0,
            standard: 0,
            premium: 0
        };
        
        mockPayments.forEach(payment => {
            if (payment.status === 'completed' && planRevenue.hasOwnProperty(payment.planType)) {
                planRevenue[payment.planType] += payment.amount;
            }
        });
        
        setRevenueByPlan(planRevenue);
    };

    // Filter payments based on search term and filters
    const filteredPayments = payments.filter(payment => {
        const matchesSearch = 
            (payment.transactionId && payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (payment.recruiterName && payment.recruiterName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (payment.recruiterEmail && payment.recruiterEmail.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesPlan = filterPlan === 'all' || payment.planType === filterPlan;
        const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
        
        return matchesSearch && matchesPlan && matchesStatus;
    });

    // Pagination
    const indexOfLastPayment = currentPage * paymentsPerPage;
    const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
    const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment);
    const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Handle status change
    const handleStatusChange = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('adminToken');
            
            // Call the API to update payment status
            try {
                const response = await axios.put(`http://localhost:5000/api/admin/payments/${id}/status`, 
                    { status: newStatus },
                    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
                );
                
                if (response.data && response.data.success) {
                    console.log(`Successfully updated payment ${id} status to ${newStatus}`);
                    
                    // Show success message
                    alert('Payment status updated successfully');
                } else {
                    console.error('Failed to update payment status:', response.data);
                    alert('Failed to update payment status. Please try again.');
                }
            } catch (error) {
                console.error('Error updating payment status:', error);
                alert('Error updating payment status. Please try again.');
            }
            
            // Update local state to reflect the change
            setPayments(payments.map(payment => 
                payment.id === id ? { ...payment, status: newStatus } : payment
            ));
            
            // Recalculate revenue totals
            const updatedPayments = payments.map(payment => 
                payment.id === id ? { ...payment, status: newStatus } : payment
            );
            
            const total = updatedPayments.reduce((sum, payment) => 
                payment.status === 'completed' ? sum + payment.amount : sum, 0);
            setTotalRevenue(total);
            
            const planRevenue = {
                basic: 0,
                standard: 0,
                premium: 0
            };
            
            updatedPayments.forEach(payment => {
                if (payment.status === 'completed' && planRevenue.hasOwnProperty(payment.planType)) {
                    planRevenue[payment.planType] += payment.amount;
                }
            });
            
            setRevenueByPlan(planRevenue);
            
        } catch (error) {
            console.error('Error updating payment status:', error);
        }
    };

    // Handle input change for new payment
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Handle numeric values
        if (name === 'amount' || name === 'jobPostsAllowed' || name === 'validityDays') {
            setNewPayment({
                ...newPayment,
                [name]: parseInt(value) || 0
            });
        } else {
            setNewPayment({
                ...newPayment,
                [name]: value
            });
        }
        
        // Update jobPostsAllowed and validityDays based on plan type
        if (name === 'planType') {
            let jobPostsAllowed = 1;
            let validityDays = 7;
            let amount = 1000;
            
            switch (value) {
                case 'basic':
                    jobPostsAllowed = 1;
                    validityDays = 7;
                    amount = 1000;
                    break;
                case 'standard':
                    jobPostsAllowed = 3;
                    validityDays = 15;
                    amount = 2000;
                    break;
                case 'premium':
                    jobPostsAllowed = -1; // Unlimited
                    validityDays = 30;
                    amount = 3000;
                    break;
                default:
                    break;
            }
            
            setNewPayment({
                ...newPayment,
                planType: value,
                jobPostsAllowed,
                validityDays,
                amount
            });
        }
    };

    // Handle add payment
    const handleAddPayment = async (e) => {
        e.preventDefault();
        
        try {
            const token = localStorage.getItem('adminToken');
            
            // Calculate expiry date
            const today = new Date();
            const expiryDate = new Date(today);
            expiryDate.setDate(today.getDate() + newPayment.validityDays);
            
            const paymentData = {
                recruiter_email: newPayment.recruiterEmail,
                amount: newPayment.amount,
                plan_type: newPayment.planType,
                payment_method: 'admin',
                status: newPayment.status,
                job_posts_allowed: newPayment.jobPostsAllowed,
                validity_days: newPayment.validityDays,
                expiry_date: expiryDate.toISOString().split('T')[0]
            };
            
            // Try to add payment via API
            try {
                const response = await axios.post('http://localhost:5000/api/admin/payments/add', 
                    paymentData,
                    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
                );
                
                if (response.data && response.data.success) {
                    console.log('Payment added successfully:', response.data);
                    
                    // Add the new payment to the state
                    const newPaymentEntry = {
                        id: response.data.payment.id || payments.length + 1,
                        transactionId: response.data.payment.transaction_id || 'ADMIN-' + Date.now(),
                        recruiterName: response.data.payment.recruiter_name || 'Unknown',
                        recruiterEmail: newPayment.recruiterEmail,
                        amount: newPayment.amount,
                        planType: newPayment.planType,
                        paymentMethod: 'admin',
                        status: newPayment.status,
                        date: today.toISOString().split('T')[0],
                        expiryDate: expiryDate.toISOString().split('T')[0],
                        jobPostsAllowed: newPayment.jobPostsAllowed,
                        jobPostsUsed: 0
                    };
                    
                    setPayments([newPaymentEntry, ...payments]);
                    
                    // Update revenue totals if payment is completed
                    if (newPayment.status === 'completed') {
                        setTotalRevenue(totalRevenue + newPayment.amount);
                        
                        const updatedRevenueByPlan = { ...revenueByPlan };
                        if (updatedRevenueByPlan.hasOwnProperty(newPayment.planType)) {
                            updatedRevenueByPlan[newPayment.planType] += newPayment.amount;
                        }
                        
                        setRevenueByPlan(updatedRevenueByPlan);
                    }
                    
                    // Show success message
                    alert('Payment added successfully!');
                } else {
                    console.error('Failed to add payment:', response.data);
                    // Show error message
                    alert('Failed to add payment: ' + (response.data.message || 'Unknown error'));
                    // Add locally if API fails
                    addPaymentLocally();
                }
            } catch (error) {
                console.error('Error adding payment:', error);
                // Show error message
                alert('Error adding payment: ' + (error.message || 'Unknown error'));
                // Add locally if API fails
                addPaymentLocally();
            }
            
            // Close modal and reset form
            setShowAddModal(false);
            setNewPayment({
                recruiterEmail: '',
                amount: 1000,
                planType: 'basic',
                jobPostsAllowed: 1,
                validityDays: 7,
                status: 'completed'
            });
        } catch (error) {
            console.error('Error in handleAddPayment:', error);
        }
    };
    
    // Add payment locally if API fails
    const addPaymentLocally = () => {
        const today = new Date();
        const expiryDate = new Date(today);
        expiryDate.setDate(today.getDate() + newPayment.validityDays);
        
        const newPaymentEntry = {
            id: payments.length + 1,
            transactionId: 'ADMIN-' + Date.now(),
            recruiterName: 'Unknown',
            recruiterEmail: newPayment.recruiterEmail,
            amount: newPayment.amount,
            planType: newPayment.planType,
            paymentMethod: 'admin',
            status: newPayment.status,
            date: today.toISOString().split('T')[0],
            expiryDate: expiryDate.toISOString().split('T')[0],
            jobPostsAllowed: newPayment.jobPostsAllowed,
            jobPostsUsed: 0
        };
        
        setPayments([newPaymentEntry, ...payments]);
        
        // Update revenue totals if payment is completed
        if (newPayment.status === 'completed') {
            setTotalRevenue(totalRevenue + newPayment.amount);
            
            const updatedRevenueByPlan = { ...revenueByPlan };
            if (updatedRevenueByPlan.hasOwnProperty(newPayment.planType)) {
                updatedRevenueByPlan[newPayment.planType] += newPayment.amount;
            }
            
            setRevenueByPlan(updatedRevenueByPlan);
        }
    };

    // Format amount to currency
    const formatCurrency = (amount) => {
        return `NPR ${amount.toLocaleString()}`;
    };
    
    // Handle invoice generation
    const handleInvoiceClick = (payment) => {
        setSelectedPayment(payment);
        setShowInvoiceModal(true);
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
    
    // Format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="admin-payments">
            <Sidebar />
            
            <div className="payments-content">
                <div className="payments-header">
                    <h1>Payment Management</h1>
                    <button className="add-payment-btn" onClick={() => setShowAddModal(true)}>Add New Payment</button>
                </div>

                <div className="revenue-summary">
                    <div className="revenue-card total">
                        <h3>Total Revenue</h3>
                        <p className="amount">{formatCurrency(totalRevenue)}</p>
                    </div>
                    <div className="revenue-card basic">
                        <h3>Basic Plan</h3>
                        <p className="amount">{formatCurrency(revenueByPlan.basic)}</p>
                    </div>
                    <div className="revenue-card standard">
                        <h3>Standard Plan</h3>
                        <p className="amount">{formatCurrency(revenueByPlan.standard)}</p>
                    </div>
                    <div className="revenue-card premium">
                        <h3>Premium Plan</h3>
                        <p className="amount">{formatCurrency(revenueByPlan.premium)}</p>
                    </div>
                </div>

                <div className="filters">
                    <div className="search-box">
                        <input 
                            type="text" 
                            placeholder="Search payments..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="plan-filter">
                        <select 
                            value={filterPlan}
                            onChange={(e) => setFilterPlan(e.target.value)}
                        >
                            <option value="all">All Plans</option>
                            <option value="basic">Basic</option>
                            <option value="standard">Standard</option>
                            <option value="premium">Premium</option>
                        </select>
                    </div>
                    <div className="status-filter">
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                        </select>
                    </div>
                </div>

                <div className="payments-table-container">
                    <table className="payments-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Transaction</th>
                                <th>Recruiter</th>
                                <th>Plan</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Expiry</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentPayments.map(payment => (
                                <tr key={payment.id}>
                                    <td>{payment.id}</td>
                                    <td>{payment.transactionId}</td>
                                    <td>
                                        <div className="recruiter-info">
                                            <div className="recruiter-name">{payment.recruiterName}</div>
                                            <div className="recruiter-email">{payment.recruiterEmail}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`plan-badge ${payment.planType}`}>
                                            {payment.planType.charAt(0).toUpperCase() + payment.planType.slice(1)}
                                        </span>
                                    </td>
                                    <td>{formatCurrency(payment.amount)}</td>
                                    <td>{payment.date}</td>
                                    <td>{payment.expiryDate}</td>
                                    <td>
                                        <select 
                                            className={`status-select ${payment.status}`}
                                            value={payment.status}
                                            onChange={(e) => handleStatusChange(payment.id, e.target.value)}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="completed">Completed</option>
                                            <option value="failed">Failed</option>
                                            <option value="refunded">Refunded</option>
                                        </select>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="view-btn">View</button>
                                            <button 
                                                className="invoice-btn"
                                                onClick={() => handleInvoiceClick(payment)}
                                            >
                                                Invoice
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="pagination">
                        <button 
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="prev-btn"
                        >
                            Previous
                        </button>
                        
                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index}
                                onClick={() => paginate(index + 1)}
                                className={currentPage === index + 1 ? 'active' : ''}
                            >
                                {index + 1}
                            </button>
                        ))}
                        
                        <button 
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="next-btn"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Invoice Modal */}
            {showInvoiceModal && selectedPayment && (
                <div className="modal-overlay">
                    <div className="modal-content invoice-modal">
                        <div className="modal-header">
                            <h2>Payment Invoice</h2>
                            <div className="invoice-actions">
                                <button className="print-btn" onClick={handlePrintInvoice}>
                                    Print Invoice
                                </button>
                                <button className="close-btn" onClick={() => setShowInvoiceModal(false)}>×</button>
                            </div>
                        </div>
                        <div className="invoice-content" ref={invoiceRef}>
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
                                        <div className="detail-value">INV-{selectedPayment.id}</div>
                                    </div>
                                    <div className="detail-row">
                                        <div className="detail-label">Transaction ID:</div>
                                        <div className="detail-value">{selectedPayment.transactionId}</div>
                                    </div>
                                    <div className="detail-row">
                                        <div className="detail-label">Date:</div>
                                        <div className="detail-value">{formatDate(selectedPayment.date)}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="invoice-to">
                                <div className="section-title">INVOICE TO:</div>
                                <div className="client-name">{selectedPayment.recruiterName}</div>
                                <div className="client-email">{selectedPayment.recruiterEmail}</div>
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
                                                <div className="item-name">{selectedPayment.planType.charAt(0).toUpperCase() + selectedPayment.planType.slice(1)} Plan Subscription</div>
                                                <div className="item-description">
                                                    {selectedPayment.planType === 'basic' && 'Post 1 job with 7-day visibility'}
                                                    {selectedPayment.planType === 'standard' && 'Post up to 3 jobs with 15-day visibility + featured badge'}
                                                    {selectedPayment.planType === 'premium' && 'Unlimited job posts, 30-day visibility + top placement'}
                                                </div>
                                                <div className="item-validity">Validity: {formatDate(selectedPayment.date)} to {formatDate(selectedPayment.expiryDate)}</div>
                                            </td>
                                            <td className="text-center">1</td>
                                            <td className="text-right">{formatCurrency(selectedPayment.amount)}</td>
                                            <td className="text-right">{formatCurrency(selectedPayment.amount)}</td>
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan="3" className="text-right"><strong>Subtotal</strong></td>
                                            <td className="text-right">{formatCurrency(selectedPayment.amount)}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan="3" className="text-right"><strong>Tax (0%)</strong></td>
                                            <td className="text-right">{formatCurrency(0)}</td>
                                        </tr>
                                        <tr className="total-row">
                                            <td colSpan="3" className="text-right"><strong>Total</strong></td>
                                            <td className="text-right"><strong>{formatCurrency(selectedPayment.amount)}</strong></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            
                            <div className="invoice-footer">
                                <div className="payment-info">
                                    <div className="section-title">Payment Information</div>
                                    <div className="payment-detail">
                                        <span className="payment-label">Payment Method:</span> 
                                        <span className="payment-value">{selectedPayment.paymentMethod.toUpperCase()}</span>
                                    </div>
                                    <div className="payment-detail">
                                        <span className="payment-label">Payment Status:</span> 
                                        <span className={`status-badge ${selectedPayment.status}`}>{selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}</span>
                                    </div>
                                </div>
                                
                                <div className="invoice-notes">
                                    <div className="thank-you">Thank you for your business!</div>
                                    <div className="support-note">For any questions regarding this invoice, please contact our support team at support@hamrojob.com</div>
                                </div>
                            </div>
                            
                            <div className="invoice-stamp">
                                <div className="stamp-border">
                                    <div className="stamp-text">{selectedPayment.status.toUpperCase()}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Add Payment Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Add New Payment</h2>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleAddPayment}>
                            <div className="form-group">
                                <label>Recruiter Email</label>
                                <input 
                                    type="email" 
                                    name="recruiterEmail" 
                                    value={newPayment.recruiterEmail} 
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Plan Type</label>
                                <select 
                                    name="planType" 
                                    value={newPayment.planType} 
                                    onChange={handleInputChange}
                                >
                                    <option value="basic">Basic (NPR 1,000)</option>
                                    <option value="standard">Standard (NPR 2,000)</option>
                                    <option value="premium">Premium (NPR 3,000)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Amount (NPR)</label>
                                <input 
                                    type="number" 
                                    name="amount" 
                                    value={newPayment.amount} 
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Job Posts Allowed</label>
                                <input 
                                    type="number" 
                                    name="jobPostsAllowed" 
                                    value={newPayment.jobPostsAllowed} 
                                    onChange={handleInputChange}
                                    required
                                />
                                <small>Use -1 for unlimited</small>
                            </div>
                            <div className="form-group">
                                <label>Validity Days</label>
                                <input 
                                    type="number" 
                                    name="validityDays" 
                                    value={newPayment.validityDays} 
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select 
                                    name="status" 
                                    value={newPayment.status} 
                                    onChange={handleInputChange}
                                >
                                    <option value="completed">Completed</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="submit" className="submit-btn">Add Payment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Payments;
