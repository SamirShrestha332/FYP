import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
    const location = useLocation();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isOpen, setIsOpen] = useState(!isMobile);
    
    // Check if the current path matches the given path
    const isActive = (path) => {
        return location.pathname === path;
    };

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setIsOpen(true);
            } else {
                setIsOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Toggle sidebar for mobile
    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    // Close sidebar when clicking outside on mobile
    const handleOverlayClick = () => {
        if (isMobile) {
            setIsOpen(false);
        }
    };

    return (
        <>
            {isMobile && (
                <button 
                    className="sidebar-toggle-btn" 
                    onClick={toggleSidebar}
                >
                    {isOpen ? '×' : '☰'}
                </button>
            )}
            
            {isMobile && isOpen && (
                <div className="sidebar-overlay" onClick={handleOverlayClick}></div>
            )}
            
            <div className={`admin-sidebar ${isOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <img src="/logo.png" alt="HamroJob Logo" className="sidebar-logo" />
                    <h3>Admin Panel</h3>
                </div>
                
                <nav className="sidebar-nav">
                    <ul>
                        <li className={isActive('/admin/dashboard') ? 'active' : ''}>
                            <Link to="/admin/dashboard">
                                <i className="fas fa-tachometer-alt"></i>
                                <span>Dashboard</span>
                            </Link>
                        </li>
                        <li className={isActive('/admin/users') ? 'active' : ''}>
                            <Link to="/admin/users">
                                <i className="fas fa-users"></i>
                                <span>Users</span>
                            </Link>
                        </li>
                        <li className={isActive('/admin/jobs') ? 'active' : ''}>
                            <Link to="/admin/jobs">
                                <i className="fas fa-briefcase"></i>
                                <span>Jobs</span>
                            </Link>
                        </li>
                        <li className={isActive('/admin/applications') ? 'active' : ''}>
                            <Link to="/admin/applications">
                                <i className="fas fa-file-alt"></i>
                                <span>Applications</span>
                            </Link>
                        </li>
                        {/* New Payment Section */}
                        <li className={isActive('/admin/payments') ? 'active' : ''}>
                            <Link to="/admin/payments">
                                <i className="fas fa-credit-card"></i>
                                <span>Payments</span>
                            </Link>
                        </li>
                        <li className={isActive('/admin/settings') ? 'active' : ''}>
                            <Link to="/admin/settings">
                                <i className="fas fa-cog"></i>
                                <span>Settings</span>
                            </Link>
                        </li>
                    </ul>
                </nav>
                
                <div className="sidebar-footer">
                    <p>© 2023 HamroJob</p>
                </div>
            </div>
        </>
    );
}

export default Sidebar;