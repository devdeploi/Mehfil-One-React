import React, { useState } from 'react';
import { FaUserEdit, FaTrash, FaEnvelope } from 'react-icons/fa';
import '../../styles/superadmin/UserList.css';

const UserList = () => {
    // Placeholder data with more details
    const [users] = useState([
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'User', joined: '2023-01-15' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', joined: '2023-02-20' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Admin', joined: '2022-11-05' },
        { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'User', joined: '2023-03-10' },
    ]);

    const getRoleBadge = (role) => {
        return role === 'Admin' ? 'sa-role-badge role-admin' : 'sa-role-badge role-user';
    };

    return (
        <div className="container-fluid">
            <h1 className="sa-page-title">User Management</h1>
            <div className="sa-user-table-container">
                <table className="table sa-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User Name</th>
                            <th>Email Address</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>
                                    <div className="d-flex flex-column">
                                        <span className="fw-bold">{user.name}</span>
                                        <small className="text-muted">Joined: {user.joined}</small>
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td><span className={getRoleBadge(user.role)}>{user.role}</span></td>
                                <td>
                                    <button className="sa-action-btn sa-btn-email" title="Send Email">
                                        <FaEnvelope />
                                    </button>
                                    <button className="sa-action-btn" title="Edit User">
                                        <FaUserEdit />
                                    </button>
                                    <button className="sa-action-btn sa-btn-delete" title="Delete User">
                                        <FaTrash />
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

export default UserList;
