import express from 'express';
import { db } from '../config/db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = express.Router();

// Middleware to verify admin token
const verifyAdminToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        req.admin = verified;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token' });
    }
};

// Get dashboard stats
router.get('/dashboard/stats', verifyAdminToken, async (req, res) => {
    try {
        // Get total users count
        const [userRows] = await db.query('SELECT COUNT(*) as count FROM users');
        const totalUsers = userRows[0].count;
        
        // Get total jobs count
        const [jobRows] = await db.query('SELECT COUNT(*) as count FROM jobs');
        const totalJobs = jobRows[0].count;
        
        // Get active jobs count
        const [activeJobRows] = await db.query('SELECT COUNT(*) as count FROM jobs WHERE status = "active"');
        const activeJobs = activeJobRows[0].count;
        
        // Get applications count
        const [applicationRows] = await db.query('SELECT COUNT(*) as count FROM applications');
        const applications = applicationRows[0].count;
        
        res.json({
            totalUsers,
            totalJobs,
            activeJobs,
            applications
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get recent jobs
router.get('/jobs/recent', verifyAdminToken, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM jobs ORDER BY created_at DESC LIMIT 5'
        );
        
        res.json(rows);
    } catch (error) {
        console.error('Error fetching recent jobs:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get recent users
router.get('/users/recent', verifyAdminToken, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM users ORDER BY created_at DESC LIMIT 5'
        );
        
        res.json(rows);
    } catch (error) {
        console.error('Error fetching recent users:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add more admin routes as needed

export default router;