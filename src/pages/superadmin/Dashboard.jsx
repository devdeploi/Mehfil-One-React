import React from 'react';
import { FaStore, FaUsers, FaBoxOpen, FaLayerGroup } from 'react-icons/fa';
import '../../styles/superadmin/Dashboard.css';

const Dashboard = () => {
    // Placeholder data
    const stats = [
        {
            title: "Total Vendors",
            value: 120,
            icon: <FaStore />,
            colorClass: "icon-red"
        },
        {
            title: "Active Vendors",
            value: 110,
            icon: <FaBoxOpen />,
            colorClass: "icon-gold"
        },
        {
            title: "Total Users",
            value: 5430,
            icon: <FaUsers />,
            colorClass: "icon-black"
        },
        {
            title: "Active Plans",
            value: 45,
            icon: <FaLayerGroup />,
            colorClass: "icon-red"
        }
    ];

    return (
        <div className="container-fluid">
            <h1 className="sa-dashboard-title">Dashboard Overview</h1>
            <div className="row g-4">
                {stats.map((stat, index) => (
                    <div className="col-md-3 col-sm-6" key={index}>
                        <div className={`sa-stat-card ${stat.colorClass}`}>
                            <div className="sa-stat-content">
                                <span className="sa-stat-title">{stat.title}</span>
                                <span className="sa-stat-value">{stat.value}</span>
                            </div>
                            <div className="sa-icon-wrapper">
                                {stat.icon}
                            </div>
                            {/* Watermark Icon for Background Detail */}
                            <div className="sa-watermark-icon">
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity & System Status Section */}
            <div className="row g-4 mt-4">
                {/* Recent Registrations Table */}
                <div className="col-lg-8">
                    <div className="sa-card-wrapper">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h2 className="sa-section-title">Recent Registrations</h2>
                            <button className="btn sa-btn-outline">View All</button>
                        </div>
                        <div className="table-responsive">
                            <table className="table sa-table">
                                <thead>
                                    <tr>
                                        <th>Vendor Name</th>
                                        <th>Plan</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { name: "Tech Solutions Ltd", plan: "Gold", status: "Active", date: "Dec 29, 2024" },
                                        { name: "Global Mart", plan: "Silver", status: "Pending", date: "Dec 28, 2024" },
                                        { name: "Super Foods", plan: "Platinum", status: "Active", date: "Dec 28, 2024" },
                                        { name: "Alpha Traders", plan: "Gold", status: "Review", date: "Dec 27, 2024" },
                                        { name: "Urban Styles", plan: "Silver", status: "Active", date: "Dec 26, 2024" },
                                    ].map((vendor, i) => (
                                        <tr key={i}>
                                            <td className="fw-bold text-dark">{vendor.name}</td>
                                            <td><span className={`badge sa-badge-${vendor.plan.toLowerCase()}`}>{vendor.plan}</span></td>
                                            <td>
                                                <span className={`sa-status-dot ${vendor.status.toLowerCase()}`}></span>
                                                {vendor.status}
                                            </td>
                                            <td className="text-muted">{vendor.date}</td>
                                            <td>
                                                <button className="btn btn-sm sa-btn-icon">
                                                    <i className="bi bi-three-dots-vertical"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* System Health & Quick Actions */}
                <div className="col-lg-4">
                    <div className="row g-4">
                        {/* Quick Revenue Target (Now on Top) */}
                        <div className="col-12">
                            <div className="sa-card-wrapper bg-gradient-dark text-white">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="text-white-50 text-uppercase mb-2">Monthly Target</h6>
                                        <h3 className="mb-0 fw-bold">₹45,200 <span className="fs-6 text-white-50">/ ₹50k</span></h3>
                                    </div>
                                    <div className="sa-circular-chart" style={{ "--progress": "90%" }}>
                                        <span>90%</span>
                                    </div>
                                </div>
                                <p className="mt-3 mb-0 small text-white-50">
                                    <span className="text-success fw-bold">↑ 12%</span> vs last month
                                </p>
                            </div>
                        </div>

                        {/* Pending Actions (Replaces System Health) */}
                        <div className="col-12">
                            <div className="sa-card-wrapper h-100">
                                <h2 className="sa-section-title mb-4">Pending Actions</h2>
                                <div className="list-group list-group-flush">
                                    <div className="list-group-item px-0 d-flex justify-content-between align-items-center bg-transparent border-bottom-0 mb-2">
                                        <div className="d-flex align-items-center">
                                            <div className="sa-action-icon bg-light-warning text-warning me-3">
                                                <i className="bi bi-clock-history"></i>
                                            </div>
                                            <div>
                                                <h6 className="mb-0 fw-bold">Vendor Approvals</h6>
                                                <small className="text-muted">High Priority</small>
                                            </div>
                                        </div>
                                        <span className="badge bg-warning rounded-pill text-dark">5</span>
                                    </div>
                                    <div className="list-group-item px-0 d-flex justify-content-between align-items-center bg-transparent border-bottom-0 mb-2">
                                        <div className="d-flex align-items-center">
                                            <div className="sa-action-icon bg-light-danger text-danger me-3">
                                                <i className="bi bi-exclamation-circle"></i>
                                            </div>
                                            <div>
                                                <h6 className="mb-0 fw-bold">Support Tickets</h6>
                                                <small className="text-muted">Needs Attention</small>
                                            </div>
                                        </div>
                                        <span className="badge bg-danger rounded-pill">12</span>
                                    </div>
                                    <div className="list-group-item px-0 d-flex justify-content-between align-items-center bg-transparent">
                                        <div className="d-flex align-items-center">
                                            <div className="sa-action-icon bg-light-info text-info me-3">
                                                <i className="bi bi-arrow-repeat"></i>
                                            </div>
                                            <div>
                                                <h6 className="mb-0 fw-bold">Plan renewals</h6>
                                                <small className="text-muted">Next 7 days</small>
                                            </div>
                                        </div>
                                        <span className="badge bg-info rounded-pill text-white">4</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
