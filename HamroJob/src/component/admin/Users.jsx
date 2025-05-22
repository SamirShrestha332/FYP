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
        const token = localStorage.getItem('adminToken');
        
        if (!adminUser) {
            navigate('/admin/login');
            return;
        }

        // Fetch users data
        const fetchUsers = async () => {
            try {
                setLoading(true);
                
                // Use the users/all endpoint directly as it's working correctly
                const response = await axios.get('http://localhost:5000/users/all');
                
                if (response.data && response.data.success) {
                    console.log('Fetched users successfully:', response.data.users.length);
                    setUsers(response.data.users);
                } else {
                    console.error('Failed to fetch users:', response.data);
                    setUsers([]);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
                setUsers([]);
            } finally {
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

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                // Get token from localStorage
                const token = localStorage.getItem('adminToken');
                
                // Send delete request to API
                const response = await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (response.data && response.data.success) {
                    // Update local state to remove the deleted user
                    setUsers(users.filter(user => user.id !== userId));
                    alert('User deleted successfully!');
                } else {
                    alert('Failed to delete user: ' + (response.data.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Error deleting user: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const handleStatusChange = async (userId, newStatus) => {
        try {
            // Get token from localStorage
            const token = localStorage.getItem('adminToken');
            
            // Send update request to API
            const response = await axios.put(`http://localhost:5000/api/admin/users/${userId}/status`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            
            if (response.data && response.data.success) {
                // Update local state with the new status
                setUsers(users.map(user => 
                    user.id === userId ? { ...user, status: newStatus } : user
                ));
                console.log('User status updated successfully');
            } else {
                alert('Failed to update user status: ' + (response.data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error updating user status:', error);
            alert('Error updating user status: ' + (error.response?.data?.message || error.message));
        }
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