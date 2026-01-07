import React, { useState } from 'react';
import { FaEye, FaFileInvoice, FaCheckCircle, FaClock } from 'react-icons/fa';
import '../../styles/superadmin/PaymentTracking.css';

const PaymentTracking = () => {
    const [payments] = useState([
        { id: 101, user: 'John Doe', amount: '$50.00', date: '2023-10-25', status: 'Completed', method: 'Credit Card' },
        { id: 102, user: 'Vendor A', amount: '$150.00', date: '2023-10-26', status: 'Pending', method: 'PayPal' },
        { id: 103, user: 'Jane Smith', amount: '$25.00', date: '2023-10-27', status: 'Completed', method: 'Debit Card' },
        { id: 104, user: 'Mike Ross', amount: '$200.00', date: '2023-10-28', status: 'Failed', method: 'Bank Transfer' },
    ]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Completed': return 'sa-status-badge status-completed';
            case 'Pending': return 'sa-status-badge status-pending';
            case 'Failed': return 'sa-status-badge status-failed';
            default: return 'sa-status-badge';
        }
    };

    return (
        <div className="container-fluid">
            <h1 className="sa-page-title">Transaction History</h1>
            <div className="sa-payment-container">
                <table className="table sa-table">
                    <thead>
                        <tr>
                            <th>Trans ID</th>
                            <th>Paid By</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Method</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map(payment => (
                            <tr key={payment.id}>
                                <td className="fw-bold text-muted">#{payment.id}</td>
                                <td className="fw-bold">{payment.user}</td>
                                <td className="fw-black fs-6">{payment.amount}</td>
                                <td>{payment.date}</td>
                                <td><small className="text-uppercase text-muted fw-bold">{payment.method}</small></td>
                                <td>
                                    <span className={getStatusBadge(payment.status)}>
                                        {payment.status === 'Completed' && <FaCheckCircle className="me-2" />}
                                        {payment.status === 'Pending' && <FaClock className="me-2" />}
                                        {payment.status}
                                    </span>
                                </td>
                                <td>
                                    <button className="sa-action-btn" title="View Details">
                                        <FaEye />
                                    </button>
                                    <button className="sa-action-btn" title="Download Invoice">
                                        <FaFileInvoice />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentTracking;
