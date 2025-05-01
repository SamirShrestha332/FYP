import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';
import Sidebar from './Sidebar';

function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalJobs: 0,
        activeJobs: 0,
        applications: 0
    });
    const [recentJobs, setRecentJobs] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check if admin is logged in
        const adminUser = localStorage.getItem('adminUser');
        const token = localStorage.getItem('adminToken');
        
        if (!adminUser) {
            navigate('/admin/login');
            return;
        }

        // Fetch dashboard data
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch stats from API
                const statsResponse = await axios.get('http://localhost:5000/api/admin/dashboard/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(err => {
                    console.error('Error fetching stats:', err);
                    return null;
                });
                
                // Fetch recent jobs
                const jobsResponse = await axios.get('http://localhost:5000/api/admin/dashboard/recent-jobs', {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(err => {
                    console.error('Error fetching recent jobs:', err);
                    return null;
                });
                
                // Fetch recent users
                const usersResponse = await axios.get('http://localhost:5000/api/admin/dashboard/recent-users', {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(err => {
                    console.error('Error fetching recent users:', err);
                    return null;
                });
                
                // Update state with fetched data or fallback to mock data if API fails
                if (statsResponse && statsResponse.data && statsResponse.data.success) {
                    setStats(statsResponse.data.stats);
                } else {
                    // Fallback to mock data
                    setStats({
                        totalUsers: 120,
                        totalJobs: 45,
                        activeJobs: 32,
                        applications: 78
                    });
                }
                
                if (jobsResponse && jobsResponse.data && jobsResponse.data.success) {
                    setRecentJobs(jobsResponse.data.recentJobs);
                } else {
                    // Fallback to mock data
                    setRecentJobs([
                        { id: 1, title: 'Frontend Developer', company: 'Tech Solutions', date: '2023-06-15' },
                        { id: 2, title: 'UX Designer', company: 'Creative Labs', date: '2023-06-14' },
                        { id: 3, title: 'Project Manager', company: 'Global Systems', date: '2023-06-13' },
                        { id: 4, title: 'Data Analyst', company: 'Data Insights', date: '2023-06-12' }
                    ]);
                }
                
                if (usersResponse && usersResponse.data && usersResponse.data.success) {
                    setRecentUsers(usersResponse.data.recentUsers);
                } else {
                    // Fallback to mock data
                    setRecentUsers([
                        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'seeker', date: '2023-06-15' },
                        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'recruiter', date: '2023-06-14' },
                        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'seeker', date: '2023-06-13' },
                        { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'seeker', date: '2023-06-12' }
                    ]);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setError('Failed to load dashboard data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    if (loading) {
        return (
            <div className="admin-dashboard">
                <Sidebar />
                <div className="dashboard-content">
                    <div className="loading">Loading dashboard data...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <Sidebar />
            <div className="dashboard-content">
                <div className="dashboard-header">
                    <h1>Admin Dashboard</h1>
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                        <button onClick={() => window.location.reload()} className="retry-btn">Retry</button>
                    </div>
                )}

                <div className="stats-container">
                    <div className="stat-card">
                        <h3>Total Users</h3>
                        <div className="stat-value">{stats.totalUsers}</div>
                    </div>
                    <div className="stat-card">
                        <h3>Total Jobs</h3>
                        <div className="stat-value">{stats.totalJobs}</div>
                    </div>
                    <div className="stat-card">
                        <h3>Active Jobs</h3>
                        <div className="stat-value">{stats.activeJobs}</div>
                    </div>
                    <div className="stat-card">
                        <h3>Applications</h3>
                        <div className="stat-value">{stats.applications}</div>
                    </div>
                </div>

                <div className="dashboard-sections">
                    <div className="section">
                        <h2>Recent Jobs</h2>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Title</th>
                                    <th>Company</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentJobs.map(job => (
                                    <tr key={job.id}>
                                        <td>{job.id}</td>
                                        <td>{job.title}</td>
                                        <td>{job.company}</td>
                                        <td>{new Date(job.date || job.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button className="view-all-btn" onClick={() => navigate('/admin/jobs')}>View All Jobs</button>
                    </div>

                    <div className="section">
                        <h2>Recent Users</h2>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentUsers.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.name || user.username}</td>
                                        <td>{user.email}</td>
                                        <td>{user.role}</td>
                                        <td>{new Date(user.date || user.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button className="view-all-btn" onClick={() => navigate('/admin/users')}>View All Users</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;