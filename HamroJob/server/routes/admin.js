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

// Test endpoint to verify routing
router.get('/test', (req, res) => {
  res.status(200).json({ message: 'Admin API is working!' });
});

// Get all users for admin dashboard with pagination, search and filtering
router.get('/users', (req, res) => {
  console.log('Admin users endpoint called');
  
  // Simplified query to get all users
  const query = 'SELECT id, username as name, email, role, status, created_at as date FROM users ORDER BY created_at DESC';
  
  console.log('Executing query:', query);
  
  // Execute the query
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ success: false, message: 'Error fetching users' });
    }
    
    console.log('Query successful, found', results.length, 'users');
    console.log('First user:', results[0]); // Log the first user for debugging
    
    // Return the results
    res.status(200).json({
      success: true,
      users: results
    });
  });
});

// Get all jobs for admin dashboard
router.get('/jobs', (req, res) => {
  console.log('Admin jobs endpoint called');
  
  // Modified query to get all jobs with application counts
  const query = `
    SELECT j.id, j.title, j.company, j.location, j.status, j.created_at as date, 
    COUNT(a.id) as applications 
    FROM jobs j 
    LEFT JOIN applications a ON j.id = a.job_id 
    GROUP BY j.id 
    ORDER BY j.created_at DESC
  `;
  
  console.log('Executing jobs query:', query);
  
  // Execute the query
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching jobs:', err);
      return res.status(500).json({ success: false, message: 'Error fetching jobs' });
    }
    
    console.log('Query successful, found', results.length, 'jobs');
    if (results.length > 0) {
      console.log('First job with application count:', results[0]); // Log the first job for debugging
    }
    
    // Return the results
    res.status(200).json({
      success: true,
      jobs: results
    });
  });
});

// Get all applications for admin dashboard
router.get('/applications', (req, res) => {
  console.log('Admin applications endpoint called');
  
  // Simple query to get all applications
  const query = 'SELECT a.id, a.status, a.created_at as date, j.title as job_title, j.company, u.username as applicant_name FROM applications a JOIN jobs j ON a.job_id = j.id JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC';
  
  console.log('Executing applications query:', query);
  
  // Execute the query
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching applications:', err);
      return res.status(500).json({ success: false, message: 'Error fetching applications' });
    }
    
    console.log('Query successful, found', results.length, 'applications');
    if (results.length > 0) {
      console.log('First application:', results[0]); // Log the first application for debugging
    }
    
    // Return the results
    res.status(200).json({
      success: true,
      applications: results
    });
  });
});

// Get all payments for admin dashboard
router.get('/payments', (req, res) => {
  console.log('Admin payments endpoint called');
  
  // Query to get all payments with recruiter information
  const query = `
    SELECT 
      p.*,
      r.username as recruiter_name,
      r.email as recruiter_email
    FROM 
      payments p
    JOIN 
      recruiter r ON p.recruiter_id = r.id
    ORDER BY 
      p.payment_date DESC
  `;
  
  console.log('Executing payments query:', query);
  
  // Execute the query
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching payments:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching payments', 
        error: err.message 
      });
    }
    
    console.log('Query successful, found', results.length, 'payments');
    if (results.length > 0) {
      console.log('First payment:', results[0]); // Log the first payment for debugging
    }
    
    // Return the results
    res.status(200).json({ 
      success: true, 
      payments: results 
    });
  });
});

// Add a new payment (admin-initiated)
router.post('/payments/add', (req, res) => {
  console.log('Admin add payment endpoint called');
  console.log('Request body:', req.body);
  
  try {
    const { 
      recruiter_email, 
      amount, 
      plan_type, 
      payment_method, 
      status, 
      job_posts_allowed, 
      validity_days, 
      expiry_date 
    } = req.body;
    
    // Validate required fields
    if (!recruiter_email || !amount || !plan_type || !job_posts_allowed || !validity_days || !expiry_date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    // First, get the recruiter ID from the email
    db.query(
      'SELECT id FROM recruiter WHERE email = ?',
      [recruiter_email],
      (recruiterErr, recruiterResults) => {
        if (recruiterErr) {
          console.error('Error finding recruiter:', recruiterErr);
          return res.status(500).json({ 
            success: false, 
            message: 'Database error', 
            error: recruiterErr.message 
          });
        }
        
        if (recruiterResults.length === 0) {
          return res.status(404).json({ 
            success: false, 
            message: 'Recruiter not found with the provided email' 
          });
        }
        
        const recruiter_id = recruiterResults[0].id;
        const transaction_id = 'ADMIN-' + Date.now();
        const payment_date = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
        // Check if a payment record already exists for this recruiter
        db.query(
          'SELECT id FROM payments WHERE recruiter_id = ?',
          [recruiter_id],
          (checkErr, checkResults) => {
            if (checkErr) {
              console.error('Payment check error:', checkErr);
              return res.status(500).json({ 
                success: false, 
                message: 'Database error', 
                error: checkErr.message 
              });
            }
            
            if (checkResults.length > 0) {
              // Update existing payment record
              const updateQuery = `
                UPDATE payments 
                SET 
                  transaction_id = ?,
                  amount = ?,
                  plan_type = ?,
                  payment_method = ?,
                  payment_status = ?,
                  payment_date = ?,
                  job_posts_allowed = ?,
                  job_posts_used = 0,
                  expiry_date = ?
                WHERE recruiter_id = ?
              `;
              
              db.query(
                updateQuery, 
                [
                  transaction_id, 
                  amount, 
                  plan_type, 
                  payment_method || 'admin', 
                  status || 'completed', 
                  payment_date,
                  job_posts_allowed,
                  expiry_date,
                  recruiter_id
                ], 
                (updateErr, updateResult) => {
                  if (updateErr) {
                    console.error('Payment update error:', updateErr);
                    return res.status(500).json({ 
                      success: false, 
                      message: 'Database error', 
                      error: updateErr.message 
                    });
                  }
                  
                  // Update recruiter subscription status
                  db.query(
                    'UPDATE recruiter SET status = "active" WHERE id = ?',
                    [recruiter_id],
                    (recruiterUpdateErr) => {
                      if (recruiterUpdateErr) {
                        console.error('Recruiter update error:', recruiterUpdateErr);
                      }
                    }
                  );
                  
                  return res.json({ 
                    success: true, 
                    message: 'Payment data updated successfully',
                    payment: {
                      id: checkResults[0].id,
                      transaction_id,
                      recruiter_id,
                      amount,
                      plan_type,
                      payment_method: payment_method || 'admin',
                      payment_status: status || 'completed',
                      payment_date,
                      job_posts_allowed,
                      expiry_date
                    }
                  });
                }
              );
            } else {
              // Insert new payment record
              const insertQuery = `
                INSERT INTO payments 
                (
                  recruiter_id, 
                  transaction_id, 
                  amount, 
                  plan_type, 
                  payment_method, 
                  payment_status, 
                  payment_date,
                  job_posts_allowed,
                  job_posts_used,
                  expiry_date
                ) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
              `;
              
              db.query(
                insertQuery, 
                [
                  recruiter_id, 
                  transaction_id, 
                  amount, 
                  plan_type, 
                  payment_method || 'admin', 
                  status || 'completed', 
                  payment_date,
                  job_posts_allowed,
                  expiry_date
                ], 
                (insertErr, insertResult) => {
                  if (insertErr) {
                    console.error('Payment insert error:', insertErr);
                    return res.status(500).json({ 
                      success: false, 
                      message: 'Database error', 
                      error: insertErr.message 
                    });
                  }
                  
                  // Update recruiter subscription status
                  db.query(
                    'UPDATE recruiter SET status = "active" WHERE id = ?',
                    [recruiter_id],
                    (recruiterUpdateErr) => {
                      if (recruiterUpdateErr) {
                        console.error('Recruiter update error:', recruiterUpdateErr);
                      }
                    }
                  );
                  
                  return res.json({ 
                    success: true, 
                    message: 'Payment data saved successfully',
                    payment: {
                      id: insertResult.insertId,
                      transaction_id,
                      recruiter_id,
                      amount,
                      plan_type,
                      payment_method: payment_method || 'admin',
                      payment_status: status || 'completed',
                      payment_date,
                      job_posts_allowed,
                      expiry_date
                    }
                  });
                }
              );
            }
          }
        );
      }
    );
  } catch (error) {
    console.error('Payment store error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Update payment status
router.put('/payments/:id/status', (req, res) => {
  console.log('Admin update payment status endpoint called');
  console.log('Payment ID:', req.params.id);
  console.log('New status:', req.body.status);
  
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['pending', 'completed', 'failed', 'refunded'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status value' 
      });
    }
    
    db.query(
      'UPDATE payments SET payment_status = ? WHERE id = ?',
      [status, id],
      (err, result) => {
        if (err) {
          console.error('Error updating payment status:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Database error', 
            error: err.message 
          });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ 
            success: false, 
            message: 'Payment not found' 
          });
        }
        
        // If payment is marked as completed, update recruiter status to active
        if (status === 'completed') {
          db.query(
            'SELECT recruiter_id FROM payments WHERE id = ?',
            [id],
            (recruiterErr, recruiterResults) => {
              if (!recruiterErr && recruiterResults.length > 0) {
                const recruiter_id = recruiterResults[0].recruiter_id;
                
                db.query(
                  'UPDATE recruiter SET status = "active" WHERE id = ?',
                  [recruiter_id],
                  (updateErr) => {
                    if (updateErr) {
                      console.error('Error updating recruiter status:', updateErr);
                    }
                  }
                );
              }
            }
          );
        }
        
        res.status(200).json({ 
          success: true, 
          message: 'Payment status updated successfully' 
        });
      }
    );
  } catch (error) {
    console.error('Error in PUT /payments/:id/status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get payment statistics
router.get('/payments/stats', (req, res) => {
  console.log('Admin payment stats endpoint called');
  
  try {
    const statsQuery = `
      SELECT 
        SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END) as total_revenue,
        SUM(CASE WHEN payment_status = 'completed' AND plan_type = 'basic' THEN amount ELSE 0 END) as basic_revenue,
        SUM(CASE WHEN payment_status = 'completed' AND plan_type = 'standard' THEN amount ELSE 0 END) as standard_revenue,
        SUM(CASE WHEN payment_status = 'completed' AND plan_type = 'premium' THEN amount ELSE 0 END) as premium_revenue,
        COUNT(*) as total_payments,
        COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as completed_payments,
        COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_payments
      FROM 
        payments
    `;
    
    db.query(statsQuery, (err, results) => {
      if (err) {
        console.error('Error fetching payment stats:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Error fetching payment statistics', 
          error: err.message 
        });
      }
      
      res.status(200).json({ 
        success: true, 
        stats: results[0] 
      });
    });
  } catch (error) {
    console.error('Error in GET /payments/stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

export default router;