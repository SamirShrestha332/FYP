import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Users.css';
import Sidebar from './Sidebar';

function Users() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);

    useEffect(() => {
        // Check if admin is logged in
        const adminUser = localStorage.getItem('adminUser');
        if (!adminUser) {
            navigate('/admin/login');
            return;
        }

        // Fetch users data
        const fetchUsers = async () => {
            try {
                // In a real app, you would fetch this data from your API
                // For now, we'll use mock data
                
                // Mock data for demonstration
                const mockUsers = [
                    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'seeker', date: '2023-06-15', status: 'active' },
                    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'recruiter', date: '2023-06-14', status: 'active' },
                    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'seeker', date: '2023-06-13', status: 'inactive' },
                    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'seeker', date: '2023-06-12', status: 'active' },
                    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'recruiter', date: '2023-06-11', status: 'active' },
                    { id: 6, name: 'Diana Miller', email: 'diana@example.com', role: 'seeker', date: '2023-06-10', status: 'inactive' },
                    { id: 7, name: 'Edward Davis', email: 'edward@example.com', role: 'seeker', date: '2023-06-09', status: 'active' },
                    { id: 8, name: 'Fiona Clark', email: 'fiona@example.com', role: 'recruiter', date: '2023-06-08', status: 'active' },
                    { id: 9, name: 'George White', email: 'george@example.com', role: 'seeker', date: '2023-06-07', status: 'active' },
                    { id: 10, name: 'Hannah Green', email: 'hannah@example.com', role: 'seeker', date: '2023-06-06', status: 'inactive' },
                    { id: 11, name: 'Ian Black', email: 'ian@example.com', role: 'recruiter', date: '2023-06-05', status: 'active' },
                    { id: 12, name: 'Julia Red', email: 'julia@example.com', role: 'seeker', date: '2023-06-04', status: 'active' }
                ];

                setUsers(mockUsers);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching users:', error);
                setLoading(false);
            }
        };

        fetchUsers();
    }, [navigate]);

    // Filter users based on search term and role
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        
        return matchesSearch && matchesRole;
    });

    // Pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleDeleteUser = (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            // In a real app, you would send a delete request to your API
            setUsers(users.filter(user => user.id !== userId));
        }
    };

    const handleStatusChange = (userId, newStatus) => {
        // In a real app, you would send an update request to your API
        setUsers(users.map(user => 
            user.id === userId ? { ...user, status: newStatus } : user
        ));
    };

    if (loading) {
        return <div className="loading">Loading users...</div>;
    }

    return (
        <div className="admin-users">
            <Sidebar />
            
            <div className="users-content">
                <div className="users-header">
                    <h1>User Management</h1>
                    <button className="add-user-btn">Add New User</button>
                </div>

                <div className="filters">
                    <div className="search-box">
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="role-filter">
                        <select 
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                        >
                            <option value="all">All Roles</option>
                            <option value="seeker">Job Seekers</option>
                            <option value="recruiter">Recruiters</option>
                        </select>
                    </div>
                </div>

                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Join Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.map(user => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`role-badge ${user.role}`}>
                                            {user.role === 'seeker' ? 'Job Seeker' : 'Recruiter'}
                                        </span>
                                    </td>
                                    <td>{user.date}</td>
                                    <td>
                                        <select 
                                            className={`status-select ${user.status}`}
                                            value={user.status}
                                            onChange={(e) => handleStatusChange(user.id, e.target.value)}
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="view-btn">View</button>
                                            <button className="edit-btn">Edit</button>
                                            <button 
                                                className="delete-btn"
                                                onClick={() => handleDeleteUser(user.id)}
                                            >
                                                Delete
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
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Users;