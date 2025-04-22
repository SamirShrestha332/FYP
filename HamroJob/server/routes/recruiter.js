import express from 'express';
import bcrypt from 'bcrypt';
import { db } from '../config/db.js';
import { sendWelcomeEmail } from '../config/email.js';

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

// Payment webhook endpoint - captures eSewa payment data
router.post('/payment-webhook', async (req, res) => {
    try {
        console.log('Payment webhook received:', req.body);
        const { 
            transaction_uuid, 
            total_amount,
            product_code,
            status,
            signed_field_names,
            signature,
            user_id
        } = req.body;

        // Validate the required payment data
        if (!transaction_uuid || !total_amount) {
            return res.status(400).json({
                success: false,
                message: 'Missing required payment information'
            });
        }

        // Get user info from token or request
        const recruiterId = req.body.user_id || null;
        
        // Determine plan type based on amount
        let planType = 'basic';
        if (parseFloat(total_amount) >= 3000) {
            planType = 'premium';
        } else if (parseFloat(total_amount) >= 2000) {
            planType = 'standard';
        }
        
        // Calculate expiry date based on plan
        const today = new Date();
        let validityDays = 7; // Default for basic plan
        
        if (planType === 'standard') {
            validityDays = 15;
        } else if (planType === 'premium') {
            validityDays = 30;
        }
        
        const expiryDate = new Date(today);
        expiryDate.setDate(today.getDate() + validityDays);
        
        // Format expiry date for MySQL
        const formattedExpiryDate = expiryDate.toISOString().split('T')[0];
        
        // Insert payment record into database
        const insertQuery = `
            INSERT INTO payments (
                recruiter_id, 
                transaction_id, 
                amount, 
                plan_type, 
                payment_method, 
                payment_status, 
                payment_date
            ) VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
        
        const values = [
            recruiterId, 
            transaction_uuid, 
            total_amount, 
            planType, 
            'esewa',
            status || 'completed'
        ];
        
        db.query(insertQuery, values, (err, result) => {
            if (err) {
                console.error('Error saving payment:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to save payment information'
                });
            }
            
            console.log('Payment saved successfully:', transaction_uuid);
            
            // Update recruiter subscription status
            if (recruiterId) {
                // First check if recruiter_subscriptions record exists
                const checkSubscriptionQuery = `
                    SELECT * FROM recruiter_subscriptions WHERE recruiter_id = ?
                `;
                
                db.query(checkSubscriptionQuery, [recruiterId], (checkErr, checkResult) => {
                    if (checkErr) {
                        console.error('Error checking subscription:', checkErr);
                    } else {
                        let updateQuery;
                        let updateValues;
                        
                        if (checkResult.length > 0) {
                            // Update existing subscription
                            updateQuery = `
                                UPDATE recruiter_subscriptions 
                                SET 
                                    plan_type = ?,
                                    expiry_date = ?,
                                    status = 'active',
                                    updated_at = NOW()
                                WHERE recruiter_id = ?
                            `;
                            updateValues = [planType, formattedExpiryDate, recruiterId];
                        } else {
                            // Create new subscription
                            updateQuery = `
                                INSERT INTO recruiter_subscriptions (
                                    recruiter_id,
                                    plan_type,
                                    expiry_date,
                                    status,
                                    created_at,
                                    updated_at
                                ) VALUES (?, ?, ?, 'active', NOW(), NOW())
                            `;
                            updateValues = [recruiterId, planType, formattedExpiryDate];
                        }
                        
                        db.query(updateQuery, updateValues, (updateErr) => {
                            if (updateErr) {
                                console.error('Error updating recruiter subscription:', updateErr);
                            } else {
                                console.log('Recruiter subscription updated successfully for ID:', recruiterId);
                            }
                        });
                    }
                });
                
                // Also update recruiter's subscription_status in recruiter table
                const updateRecruiterQuery = `
                    UPDATE recruiter 
                    SET subscription_status = 'active'
                    WHERE id = ?
                `;
                
                db.query(updateRecruiterQuery, [recruiterId], (recruiterErr) => {
                    if (recruiterErr) {
                        console.error('Error updating recruiter status:', recruiterErr);
                    }
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'Payment recorded successfully',
                subscription: {
                    plan: planType,
                    expiryDate: formattedExpiryDate
                }
            });
        });
    } catch (error) {
        console.error('Payment webhook error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error processing payment',
            error: error.message
        });
    }
});

export default router;