import express from 'express';
import bcrypt from 'bcrypt';
import { db } from '../config/db.js';
import { emailTransporter, sendWelcomeEmail } from '../config/email.js';
// Import OTP utilities
import { otpStore, generateOTP } from '../utils/otp.js';
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

// Recruiter Signup with OTP
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
            
            // Generate OTP
            const otp = generateOTP();
            
            // Store OTP with expiration (10 minutes)
            const otpData = {
                otp,
                email,
                username,
                password,
                companyName,
                role: 'recruiter',
                expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
            };
            
            otpStore.set(email, otpData);
            
            // Send OTP email
            const mailOptions = {
                from: '"HamroJob Team" <noreply@hamrojob.com>',
                to: email,
                subject: '🔐 Your HamroJob Recruiter Verification Code',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <h1 style="color: #007bff;">Verify Your Recruiter Account</h1>
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <p>Hello ${username},</p>
                            <p>Thank you for registering as a recruiter with HamroJob! To complete your registration, please enter the verification code below:</p>
                        </div>
                        
                        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; text-align: center;">
                            <h2 style="letter-spacing: 5px; font-size: 32px; margin: 10px 0; color: #007bff;">${otp}</h2>
                            <p style="margin: 0; color: #6c757d; font-size: 14px;">This code will expire in 10 minutes</p>
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <p>If you didn't request this code, you can safely ignore this email.</p>
                        </div>
                        
                        <div style="margin-top: 30px; text-align: center; color: #6c757d; font-size: 14px;">
                            <p>© ${new Date().getFullYear()} HamroJob. All rights reserved.</p>
                        </div>
                    </div>
                `
            };
            
            try {
                console.log('Attempting to send OTP email to recruiter:', email);
                console.log('OTP code:', otp);
                
                await emailTransporter.sendMail(mailOptions);
                console.log('OTP email sent successfully to recruiter:', email);
                
                res.status(200).json({ 
                    success: true,
                    message: 'Verification code sent to your email',
                    email
                });
            } catch (emailError) {
                console.error('Failed to send OTP email:', emailError);
                res.status(500).json({ 
                    success: false, 
                    message: 'Failed to send verification email', 
                    error: emailError.message 
                });
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
});

// Verify OTP for Recruiter
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        console.log('Received recruiter OTP verification request:', { email, otp });
        
        // Get stored OTP data
        const otpData = otpStore.get(email);
        
        // Check if OTP exists and is valid
        if (!otpData) {
            return res.status(400).json({ 
                success: false,
                message: 'Verification code expired or invalid. Please request a new code.' 
            });
        }
        
        // Check if OTP has expired
        if (new Date() > otpData.expiresAt) {
            otpStore.delete(email);
            return res.status(400).json({ 
                success: false,
                message: 'Verification code has expired. Please request a new code.' 
            });
        }
        
        // Check if OTP matches
        if (otpData.otp !== otp) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid verification code. Please try again.' 
            });
        }
        
        // OTP is valid, create the recruiter account
        const { username, password, companyName, role } = otpData;
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert recruiter into database
        const query = 'INSERT INTO recruiter (username, email, password, role, company_name, status) VALUES (?, ?, ?, ?, ?, ?)';
        const values = [username, email, hashedPassword, role, companyName, 'active'];
        
        db.query(query, values, async (err, result) => {
            if (err) {
                console.error('Recruiter creation error:', err);
                return res.status(500).json({ 
                    success: false,
                    message: 'Error creating recruiter account', 
                    error: err.message 
                });
            }
            
            // Send welcome email
            try {
                await sendWelcomeEmail(email, username);
            } catch (emailError) {
                console.error('Failed to send welcome email to recruiter:', emailError);
                // Continue with account creation even if welcome email fails
            }
            
            // Remove OTP data
            otpStore.delete(email);
            
            res.status(201).json({ 
                success: true,
                message: 'Email verified successfully! You can now log in as a recruiter.',
                user: {
                    id: result.insertId,
                    username,
                    email,
                    companyName,
                    role: 'recruiter'
                }
            });
        });
    } catch (error) {
        console.error('OTP verification error for recruiter:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error', 
            error: error.message 
        });
    }
});

// Resend OTP for Recruiter
router.post('/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;
        
        // Get stored OTP data
        const otpData = otpStore.get(email);
        
        if (!otpData) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid email or session expired. Please sign up again.' 
            });
        }
        
        // Generate new OTP
        const otp = generateOTP();
        
        // Update OTP data
        otpData.otp = otp;
        otpData.expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        
        otpStore.set(email, otpData);
        
        // Send new OTP email
        const mailOptions = {
            from: '"HamroJob Team" <noreply@hamrojob.com>',
            to: email,
            subject: '🔐 Your New HamroJob Recruiter Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #007bff;">Your New Verification Code</h1>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <p>Hello ${otpData.username},</p>
                        <p>Here is your new verification code to complete your recruiter registration:</p>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; text-align: center;">
                        <h2 style="letter-spacing: 5px; font-size: 32px; margin: 10px 0; color: #007bff;">${otp}</h2>
                        <p style="margin: 0; color: #6c757d; font-size: 14px;">This code will expire in 10 minutes</p>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <p>If you didn't request this code, you can safely ignore this email.</p>
                    </div>
                    
                    <div style="margin-top: 30px; text-align: center; color: #6c757d; font-size: 14px;">
                        <p>© ${new Date().getFullYear()} HamroJob. All rights reserved.</p>
                    </div>
                </div>
            `
        };
        
        try {
            console.log('Attempting to send new OTP email to recruiter:', email);
            console.log('New OTP code:', otp);
            
            await emailTransporter.sendMail(mailOptions);
            console.log('New OTP email sent successfully to recruiter:', email);
            
            res.status(200).json({ 
                success: true,
                message: 'New verification code sent to your email'
            });
        } catch (emailError) {
            console.error('Failed to send OTP email to recruiter:', emailError);
            res.status(500).json({ 
                success: false,
                message: 'Failed to send verification email', 
                error: emailError.message 
            });
        }
    } catch (error) {
        console.error('Resend OTP error for recruiter:', error);
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
                0,
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
                SET status = 'active' 
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