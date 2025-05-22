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
                
                // Fetch users from API
                const usersResponse = await axios.get('http://localhost:5000/users/all').catch(err => {
                    console.error('Error fetching users:', err);
                    return null;
                });
                
                // Fetch jobs from API
                const jobsResponse = await axios.get('http://localhost:5000/api/jobs').catch(err => {
                    console.error('Error fetching jobs:', err);
                    return null;
                });
                
                // Fetch applications from API
                const applicationsResponse = await axios.get('http://localhost:5000/api/admin/applications', {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(err => {
                    console.error('Error fetching applications:', err);
                    return null;
                });
                
                // Process the fetched data
                // Process users data
                if (usersResponse && usersResponse.data && usersResponse.data.success) {
                    const users = usersResponse.data.users || [];
                    console.log('Fetched users:', users.length);
                    
                    // Update stats with user count
                    setStats(prevStats => ({
                        ...prevStats,
                        totalUsers: users.length
                    }));
                    
                    // Get most recent users (limit to 4)
                    const sortedUsers = [...users].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);
                    setRecentUsers(sortedUsers);
                } else {
                    // Fallback for users
                    console.error('Failed to fetch users');
                    setRecentUsers([]);
                }
                
                // Process jobs data
                if (jobsResponse && jobsResponse.data && jobsResponse.data.jobs) {
                    const jobs = jobsResponse.data.jobs || [];
                    console.log('Fetched jobs:', jobs.length);
                    
                    // Calculate job stats
                    const activeJobs = jobs.filter(job => job.status === 'active').length;
                    
                    // Calculate total applications from job data
                    const totalApplications = jobs.reduce((sum, job) => sum + (parseInt(job.applications) || 0), 0);
                    console.log('Total applications calculated from jobs:', totalApplications);
                    
                    // Update stats
                    setStats(prevStats => ({
                        ...prevStats,
                        totalJobs: jobs.length,
                        activeJobs: activeJobs,
                        applications: totalApplications
                    }));
                    
                    // Get most recent jobs (limit to 4)
                    const sortedJobs = [...jobs].sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at)).slice(0, 4);
                    setRecentJobs(sortedJobs);
                } else {
                    // Fallback for jobs
                    console.error('Failed to fetch jobs');
                    setRecentJobs([]);
                }
                
                // Process applications data
                if (applicationsResponse && applicationsResponse.data && applicationsResponse.data.success) {
                    const applications = applicationsResponse.data.applications || [];
                    console.log('Fetched applications:', applications.length);
                    
                    // Update stats with application count
                    setStats(prevStats => ({
                        ...prevStats,
                        applications: applications.length
                    }));
                } else {
                    // Fallback for applications
                    console.error('Failed to fetch applications');
                    setStats(prevStats => ({
                        ...prevStats,
                        applications: 0
                    }));
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

    // Get current date for welcome message
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    return (
        <div className="admin-dashboard">
            <Sidebar />
            <div className="dashboard-content">
                <div className="dashboard-header">
                    <div className="welcome-section">
                        <h1>Admin Dashboard</h1>
                        <p className="date-display">{formattedDate}</p>
                    </div>
                    <div className="header-actions">
                        <button className="action-button refresh-btn" onClick={() => window.location.reload()}>
                            <ion-icon name="refresh-outline"></ion-icon> Refresh
                        </button>
                        <button className="action-button logout-btn" onClick={handleLogout}>
                            <ion-icon name="log-out-outline"></ion-icon> Logout
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="error-message">
                        <ion-icon name="alert-circle-outline"></ion-icon>
                        {error}
                        <button onClick={() => window.location.reload()} className="retry-btn">Retry</button>
                    </div>
                )}

                <div className="stats-container">
                    <div className="stat-card users">
                        <div className="stat-icon">
                            <ion-icon name="people-outline"></ion-icon>
                        </div>
                        <div className="stat-info">
                            <h3>Total Users</h3>
                            <div className="stat-value">{stats.totalUsers}</div>
                        </div>
                    </div>
                    <div className="stat-card jobs">
                        <div className="stat-icon">
                            <ion-icon name="briefcase-outline"></ion-icon>
                        </div>
                        <div className="stat-info">
                            <h3>Total Jobs</h3>
                            <div className="stat-value">{stats.totalJobs}</div>
                        </div>
                    </div>
                    <div className="stat-card active-jobs">
                        <div className="stat-icon">
                            <ion-icon name="checkmark-circle-outline"></ion-icon>
                        </div>
                        <div className="stat-info">
                            <h3>Active Jobs</h3>
                            <div className="stat-value">{stats.activeJobs}</div>
                        </div>
                    </div>
                    <div className="stat-card applications">
                        <div className="stat-icon">
                            <ion-icon name="document-text-outline"></ion-icon>
                        </div>
                        <div className="stat-info">
                            <h3>Applications</h3>
                            <div className="stat-value">{stats.applications}</div>
                        </div>
                    </div>
                </div>



                <div className="dashboard-sections">
                    <div className="section recent-jobs">
                        <div className="section-header">
                            <h2><ion-icon name="briefcase-outline"></ion-icon> Recent Jobs</h2>
                            <button className="view-all-btn" onClick={() => navigate('/admin/jobs')}>View All <ion-icon name="arrow-forward-outline"></ion-icon></button>
                        </div>
                        <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Title</th>
                                        <th>Company</th>
                                        <th>Date</th>
                                        {/* Actions column removed */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentJobs.map(job => (
                                        <tr key={job.id}>
                                            <td>{job.id}</td>
                                            <td>{job.title}</td>
                                            <td>{job.company}</td>
                                            <td>{new Date(job.date || job.created_at).toLocaleDateString()}</td>
                                            {/* Actions cell removed */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="section recent-users">
                        <div className="section-header">
                            <h2><ion-icon name="people-outline"></ion-icon> Recent Users</h2>
                            <button className="view-all-btn" onClick={() => navigate('/admin/users')}>View All <ion-icon name="arrow-forward-outline"></ion-icon></button>
                        </div>
                        <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Date</th>
                                        {/* Actions column removed */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentUsers.map(user => (
                                        <tr key={user.id}>
                                            <td>{user.id}</td>
                                            <td>{user.name || user.username}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className={`role-badge ${user.role}`}>{user.role}</span>
                                            </td>
                                            <td>{new Date(user.date || user.created_at).toLocaleDateString()}</td>
                                            {/* Actions cell removed */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
