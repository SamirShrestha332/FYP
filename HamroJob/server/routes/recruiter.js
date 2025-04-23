import express from 'express';
import bcrypt from 'bcrypt';
import { db } from '../config/db.js';
import { sendWelcomeEmail } from '../config/email.js';
// Import the authentication middleware
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Recruiter Login
router.post('/login', async (req, res) => {
    console.log('Recruiter login request received:', { email: req.body.email, password: '[HIDDEN]' });
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ 
            success: false,
            message: 'Email and password are required' 
        });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ 
            success: false,
            message: 'Please enter a valid email address' 
        });
    }

    try {
        // Query to find recruiter user
        const query = 'SELECT * FROM recruiter WHERE email = ? AND role = "recruiter"';
        
        db.query(query, [email], async (err, results) => {
            if (err) {
                console.error('Recruiter login error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Something went wrong, please try again.' 
                });
            }

            if (results.length === 0) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Invalid email or password' 
                });
            }

            const user = results[0];
            
            // Check if account is active
            if (user.status !== 'active') {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Your account is inactive. Please contact support.' 
                });
            }
            
            try {
                const passwordMatch = await bcrypt.compare(password, user.password);
                if (!passwordMatch) {
                    console.log('Password does not match for recruiter:', email);
                    return res.status(401).json({ 
                        success: false, 
                        message: 'Invalid email or password' 
                    });
                }

                // Create a simple token for authentication
                const token = Math.random().toString(36).substring(2, 15) + 
                              Math.random().toString(36).substring(2, 15);

                console.log('Recruiter logged in successfully:', email);
                
                // Parse username into first and last name
                let firstName = user.first_name;
                let lastName = user.last_name;
                
                if (!firstName && !lastName && user.username) {
                    const nameParts = user.username.split(' ');
                    firstName = nameParts[0] || '';
                    lastName = nameParts.slice(1).join(' ') || '';
                }
                
                // Return user data
                res.status(200).json({
                    success: true,
                    message: 'Login successful!',
                    user: {
                        id: user.id,
                        firstName: firstName,
                        lastName: lastName,
                        email: user.email,
                        companyName: user.company_name || '',
                        role: user.role,
                        status: user.status
                    },
                    token
                });
            } catch (error) {
                console.error('Password comparison error:', error);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Authentication error', 
                    error: error.message 
                });
            }
        });
    } catch (error) {
        console.error('Server error during recruiter login:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Recruiter Signup
router.post('/signup', async (req, res) => {
    console.log('Recruiter signup request received:', req.body);
    const { username, email, password, companyName } = req.body;

    // Basic validation
    if (!username || !email || !password || !companyName) {
        return res.status(400).json({ 
            success: false,
            message: 'All fields are required' 
        });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ 
            success: false,
            message: 'Please enter a valid email address' 
        });
    }

    try {
        // Check if user already exists
        const checkEmailQuery = 'SELECT * FROM recruiter WHERE email = ?';
        db.query(checkEmailQuery, [email], async (err, results) => {
            if (err) {
                console.error('Email check error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Something went wrong, please try again.', 
                    error: err.message 
                });
            }

            if (results.length > 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Email already exists. Please use a different email.' 
                });
            }
            
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Insert user into database - using the fields that exist in your database
            const query = 'INSERT INTO recruiter (username, email, password, role, company_name, status) VALUES (?, ?, ?, ?, ?, ?)';
            const values = [username, email, hashedPassword, 'recruiter', companyName, 'active'];
            
            db.query(query, values, async (err, result) => {
                if (err) {
                    console.error('User creation error:', err);
                    return res.status(500).json({ 
                        success: false,
                        message: 'Error creating recruiter account', 
                        error: err.message 
                    });
                }
                
                // Send welcome email if you have that functionality
                try {
                    await sendWelcomeEmail(email, username);
                } catch (emailError) {
                    console.error('Failed to send welcome email:', emailError);
                    // Continue with signup process even if welcome email fails
                }
                
                res.status(201).json({ 
                    success: true,
                    message: 'Recruiter account created successfully! You can now log in.',
                    user: {
                        id: result.insertId,
                        username,
                        email,
                        companyName,
                        role: 'recruiter'
                    }
                });
            });
        });
    } catch (error) {
        console.error("Recruiter signup error:", error);
        res.status(500).json({ 
            success: false,
            message: 'Server error', 
            error: error.message 
        });
    }
});

// Add this endpoint to your recruiter.js file

// Payment webhook endpoint
router.post('/payment-webhook', authenticateToken, async (req, res) => {
  try {
    const {
      transaction_id,
      recruiter_id,
      amount,
      plan_type,
      payment_method,
      status,
      job_posts_allowed,
      validity_days,
      expiry_date
    } = req.body;
    
    console.log('Payment webhook received:', req.body);
    
    // Ensure we have a valid recruiter_id
    if (!recruiter_id) {
      return res.status(400).json({
        success: false,
        message: 'Recruiter ID is required'
      });
    }
    
    // Verify the recruiter exists
    const checkRecruiterQuery = 'SELECT id FROM recruiter WHERE id = ?';
    
    // Use a promise to ensure sequential execution and avoid race conditions
    const processPayment = () => {
      return new Promise((resolve, reject) => {
        db.query(checkRecruiterQuery, [recruiter_id], (err, recruiterResults) => {
          if (err) {
            console.error('Error checking recruiter:', err);
            return reject({
              status: 500,
              message: 'Error checking recruiter',
              error: err.message
            });
          }
          
          if (recruiterResults.length === 0) {
            return reject({
              status: 400,
              message: 'Invalid recruiter ID'
            });
          }
          
          // Generate a unique transaction ID if not provided
          const paymentTransactionId = transaction_id || `manual-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
          
          // Calculate expiry date if not provided
          let expiryDateValue = expiry_date;
          if (!expiryDateValue) {
            const days = validity_days || 30; // Default to 30 days
            const date = new Date();
            date.setDate(date.getDate() + parseInt(days));
            expiryDateValue = date.toISOString().split('T')[0];
          }
          
          // First check if a payment record already exists for this recruiter
          const checkPaymentQuery = 'SELECT id FROM payments WHERE recruiter_id = ?';
          db.query(checkPaymentQuery, [recruiter_id], (err, paymentResults) => {
            if (err) {
              console.error('Error checking payment records:', err);
              return reject({
                status: 500,
                message: 'Error checking payment records',
                error: err.message
              });
            }
            
            let query, params;
            
            // If payment record exists, update it instead of inserting a new one
            if (paymentResults.length > 0) {
              query = `
                UPDATE payments SET
                  transaction_id = ?,
                  amount = ?,
                  plan_type = ?,
                  payment_method = ?,
                  payment_status = ?,
                  payment_date = NOW(),
                  job_posts_allowed = ?,
                  job_posts_used = 0,
                  expiry_date = ?,
                  updated_at = NOW()
                WHERE recruiter_id = ?
              `;
              
              params = [
                paymentTransactionId,
                amount || 0,
                plan_type || 'basic',
                payment_method || 'esewa',
                status || 'completed',
                job_posts_allowed || 1,
                expiryDateValue,
                recruiter_id
              ];
            } else {
              // If no payment record exists, insert a new one
              query = `
                INSERT INTO payments (
                  transaction_id,
                  recruiter_id,
                  amount,
                  plan_type,
                  payment_method,
                  payment_status,
                  payment_date,
                  job_posts_allowed,
                  job_posts_used,
                  expiry_date,
                  updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, NOW())
              `;
              
              params = [
                paymentTransactionId,
                recruiter_id,
                amount || 0,
                plan_type || 'basic',
                payment_method || 'esewa',
                status || 'completed',
                job_posts_allowed || 1,
                0, // job_posts_used starts at 0
                expiryDateValue
              ];
            }
            
            db.query(query, params, (err, result) => {
              if (err) {
                console.error('Error processing payment record:', err);
                console.error('Query:', query);
                console.error('Params:', params);
                return reject({
                  status: 500,
                  message: 'Failed to process payment',
                  error: err.message
                });
              }
              
              console.log('Payment record processed successfully:', result);
              
              // Update recruiter subscription status
              const updateRecruiterQuery = `
                UPDATE recruiter 
                SET subscription_status = 'active' 
                WHERE id = ?
              `;
              
              db.query(updateRecruiterQuery, [recruiter_id], (err, updateResult) => {
                if (err) {
                  console.error('Error updating recruiter status:', err);
                  return reject({
                    status: 500,
                    message: 'Failed to update recruiter status',
                    error: err.message
                  });
                }
                
                const subscription = {
                  plan_type: plan_type || 'basic',
                  job_posts_allowed: job_posts_allowed || 1,
                  job_posts_used: 0,
                  expiry_date: expiryDateValue
                };
                
                console.log('Payment data processed:', {
                  success: true,
                  message: 'Payment processed successfully',
                  subscription
                });
                
                resolve({
                  success: true,
                  message: 'Payment processed successfully',
                  subscription
                });
              });
            });
          });
        });
      });
    };
    
    // Execute the payment processing
    const result = await processPayment();
    res.status(200).json(result);
    
  } catch (error) {
    console.error('Error processing payment webhook:', error);
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Failed to process payment',
      error: error.error || error.message
    });
  }
});

export default router;