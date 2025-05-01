import express from 'express';
import bcrypt from 'bcrypt';
import { db } from '../config/db.js';

const router = express.Router();

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Admin login attempt:', { email });
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }
    
    // Check if admin exists
    const query = 'SELECT * FROM admin_users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
      if (err) {
        console.error('Admin login error:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Something went wrong, please try again.', 
          error: err.message 
        });
      }
      
      if (results.length === 0) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }
      
      const admin = results[0];
      console.log('Admin found:', admin.email);
      
      // Compare password
      let passwordMatch = false;
      
      // First try bcrypt compare for hashed passwords
      try {
        passwordMatch = await bcrypt.compare(password, admin.password);
      } catch (e) {
        // If bcrypt fails, it might be a plain text password (from your existing data)
        passwordMatch = (password === admin.password);
      }
      
      if (!passwordMatch) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }
      
      // Create a simple token for authentication
      const token = Math.random().toString(36).substring(2, 15) + 
                    Math.random().toString(36).substring(2, 15);
      
      console.log('Admin login successful');
      
      // Return admin data
      res.status(200).json({
        success: true,
        message: 'Login successful!',
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email
        },
        token
      });
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get dashboard stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    // Get total users count
    const userCountQuery = 'SELECT COUNT(*) as count FROM users';
    
    // Get total jobs count
    const jobCountQuery = 'SELECT COUNT(*) as count FROM jobs';
    
    // Get active jobs count
    const activeJobCountQuery = "SELECT COUNT(*) as count FROM jobs WHERE status = 'active'";
    
    // Get applications count
    const applicationCountQuery = 'SELECT COUNT(*) as count FROM applications';
    
    // Execute queries
    db.query(userCountQuery, (err, userResults) => {
      if (err) {
        console.error('Error fetching user count:', err);
        return res.status(500).json({ success: false, message: 'Error fetching stats' });
      }
      
      db.query(jobCountQuery, (err, jobResults) => {
        if (err) {
          console.error('Error fetching job count:', err);
          return res.status(500).json({ success: false, message: 'Error fetching stats' });
        }
        
        db.query(activeJobCountQuery, (err, activeJobResults) => {
          if (err) {
            console.error('Error fetching active job count:', err);
            return res.status(500).json({ success: false, message: 'Error fetching stats' });
          }
          
          db.query(applicationCountQuery, (err, applicationResults) => {
            if (err) {
              console.error('Error fetching application count:', err);
              return res.status(500).json({ success: false, message: 'Error fetching stats' });
            }
            
            // Return all stats
            res.status(200).json({
              success: true,
              stats: {
                totalUsers: userResults[0].count || 0,
                totalJobs: jobResults[0].count || 0,
                activeJobs: activeJobResults[0].count || 0,
                applications: applicationResults[0].count || 0
              }
            });
          });
        });
      });
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get recent jobs
router.get('/dashboard/recent-jobs', async (req, res) => {
  try {
    const query = 'SELECT id, title, company, created_at as date FROM jobs ORDER BY created_at DESC LIMIT 5';
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching recent jobs:', err);
        return res.status(500).json({ success: false, message: 'Error fetching recent jobs' });
      }
      
      res.status(200).json({
        success: true,
        recentJobs: results
      });
    });
  } catch (error) {
    console.error('Error fetching recent jobs:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get recent users
router.get('/dashboard/recent-users', async (req, res) => {
  try {
    // First try to get from users table
    const usersQuery = 'SELECT id, username as name, email, role, created_at as date FROM users ORDER BY created_at DESC LIMIT 5';
    
    db.query(usersQuery, (err, results) => {
      if (err) {
        console.error('Error fetching recent users:', err);
        return res.status(500).json({ success: false, message: 'Error fetching recent users' });
      }
      
      res.status(200).json({
        success: true,
        recentUsers: results
      });
    });
  } catch (error) {
    console.error('Error fetching recent users:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

export default router;