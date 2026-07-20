import React from 'react';
import { FaCheckCircle, FaBan } from 'react-icons/fa';

const toastStyles = `
    @keyframes slideInTop {
        from {transform: translateY(-100%); opacity: 0; }
        to {transform: translateY(0); opacity: 1; }
    }
    .custom-toast {
        animation: slideInTop 0.3s ease-out;
        z-index: 99999;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
`;

const Toast = ({ toast }) => {
    if (!toast || !toast.show) return null;
    return (
        <>
            <style>{toastStyles}</style>
            <div className={`custom-toast position-fixed top-0 start-50 translate-middle-x mt-4 p-3 rounded-3 d-flex align-items-center gap-3 bg-white border-${toast.type === 'error' ? 'danger' : 'success'} border-start border-5`} style={{ minWidth: '300px' }}>
                <div className={`text-${toast.type === 'error' ? 'danger' : 'success'}`}>
                    {toast.type === 'error' ? <FaBan size={20} /> : <FaCheckCircle size={20} />}
                </div>
                <div>
                    <h6 className="mb-0 fw-bold">{toast.type === 'error' ? 'Error' : 'Success'}</h6>
                    <small className="text-secondary">{toast.message}</small>
                </div>
            </div>
        </>
    );
};

export default Toast;
