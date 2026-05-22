import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaStore, FaUsers, FaBoxOpen, FaLayerGroup } from 'react-icons/fa';
import { API_URL } from '../../utils/function';
import '../../styles/superadmin/Dashboard.css';

const Dashboard = () => {
    const [statsData, setStatsData] = useState({
        totalVendors: 0,
        activeVendors: 0,
        totalUsers: 0,
        recentVendors: [],
        activePlans: 0,
        currentMonthRevenue: 0,
        lastMonthRevenue: 0,
        revenueGrowth: 0,
        pendingVendors: 0,
        planRenewals: 0,
        pendingBookings: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get(`${API_URL}/superadmin/stats`);
                if (response.status === 200) {
                    setStatsData(response.data);
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            }
        };

        fetchStats();
    }, []);

    const stats = [
        {
            title: "Total Vendors",
            value: statsData.totalVendors,
            icon: <FaStore />,
            colorClass: "icon-red"
        },
        {
            title: "Active Vendors",
            value: statsData.activeVendors,
            icon: <FaBoxOpen />,
            colorClass: "icon-gold"
        },
        {
            title: "Total Users",
            value: statsData.totalUsers,
            icon: <FaUsers />,
            colorClass: "icon-black"
        },
        {
            title: "Active Plans",
            value: statsData.activePlans || 0,
            icon: <FaLayerGroup />,
            colorClass: "icon-red"
        }
    ];

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

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
                            <div className="sa-watermark-icon">
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row g-4 mt-4">
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
                                    {statsData.recentVendors.map((vendor, i) => (
                                        <tr key={i}>
                                            <td className="fw-bold text-dark">{vendor.fullName}</td>
                                            <td><span className={`badge sa-badge-${vendor.plan.toLowerCase()}`}>{vendor.plan}</span></td>
                                            <td>
                                                <span className={`sa-status-dot ${vendor.status.toLowerCase()}`}></span>
                                                {vendor.status}
                                            </td>
                                            <td className="text-muted">{formatDate(vendor.createdAt)}</td>
                                            <td>
                                                <button className="btn btn-sm sa-btn-icon">
                                                    <i className="bi bi-three-dots-vertical"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {statsData.recentVendors.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="text-center py-4 text-muted">No recent registrations found</td>
                                        </tr>
                                    )}
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
                                        <h3 className="mb-0 fw-bold">₹{(statsData.currentMonthRevenue || 0).toLocaleString()} <span className="fs-6 text-white-50">/ ₹50k</span></h3>
                                    </div>
                                    <div className="sa-circular-chart" style={{ "--progress": `${Math.min(((statsData.currentMonthRevenue || 0) / 50000) * 100, 100).toFixed(0)}%` }}>
                                        <span>{Math.min(((statsData.currentMonthRevenue || 0) / 50000) * 100, 100).toFixed(0)}%</span>
                                    </div>
                                </div>
                                <p className="mt-3 mb-0 small text-white-50">
                                    <span className={statsData.revenueGrowth >= 0 ? "text-success fw-bold" : "text-danger fw-bold"}>
                                        {statsData.revenueGrowth >= 0 ? '↑' : '↓'} {Math.abs(statsData.revenueGrowth)}%
                                    </span> vs last month
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
                                        <span className="badge bg-warning rounded-pill text-dark">{statsData.pendingVendors || 0}</span>
                                    </div>
                                    <div className="list-group-item px-0 d-flex justify-content-between align-items-center bg-transparent border-bottom-0 mb-2">
                                        <div className="d-flex align-items-center">
                                            <div className="sa-action-icon bg-light-danger text-danger me-3">
                                                <i className="bi bi-exclamation-circle"></i>
                                            </div>
                                            <div>
                                                <h6 className="mb-0 fw-bold">Pending Bookings</h6>
                                                <small className="text-muted">Needs Attention</small>
                                            </div>
                                        </div>
                                        <span className="badge bg-danger rounded-pill">{statsData.pendingBookings || 0}</span>
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
                                        <span className="badge bg-info rounded-pill text-white">{statsData.planRenewals || 0}</span>
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
