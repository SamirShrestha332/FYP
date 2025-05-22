import express from 'express';
import bcrypt from 'bcrypt';
import { db } from '../config/db.js';
import { emailTransporter, sendWelcomeEmail } from '../config/email.js';
import { otpStore, generateOTP } from '../utils/otp.js';

const router = express.Router();

// Authentication middleware
export const authenticateToken = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }
    
    // Verify token
    // For now, we're using a simple token validation
    // In a production environment, you should use JWT or another secure method
    if (token) {
      // Set user info to req.user
      req.user = { token };
      next();
    } else {
      return res.status(401).json({ message: 'Token is not valid' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Signup with OTP
router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    
    // Check if user already exists
    const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkEmailQuery, [email], async (err, results) => {
      if (err) {
        console.error('Email check error:', err);
        return res.status(500).json({ message: 'Something went wrong, please try again.', error: err.message });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: 'Email already exists. Please use a different email.' });
      }
      
      // Generate OTP
      const otp = generateOTP();
      
      // Store OTP with expiration (10 minutes)
      const otpData = {
        otp,
        email,
        firstName,
        lastName,
        password,
        role: role || 'seeker',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      };
      
      otpStore.set(email, otpData);
      
      // Create username from firstName and lastName
      const username = `${firstName}${lastName}`;
      
      // Send OTP email
      const mailOptions = {
        from: '"HamroJob Team" <noreply@hamrojob.com>',
        to: email,
        subject: '🔐 Your HamroJob Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #007bff;">Verify Your Email</h1>
            </div>
            
            <div style="margin-bottom: 20px;">
              <p>Hello ${username},</p>
              <p>Thank you for signing up with HamroJob! To complete your registration, please enter the verification code below:</p>
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
        console.log('Attempting to send OTP email to:', email);
        console.log('OTP code:', otp);
        console.log('Mail options:', JSON.stringify(mailOptions, null, 2));
        
        await emailTransporter.sendMail(mailOptions);
        console.log('OTP email sent successfully to:', email);
        
        res.status(200).json({ 
          message: 'Verification code sent to your email',
          email
        });
      } catch (emailError) {
        console.error('Failed to send OTP email:', emailError);
        res.status(500).json({ message: 'Failed to send verification email', error: emailError.message });
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify OTP
// Update the verify-otp endpoint to fix the database insertion issue
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    console.log('Received OTP verification request:', { email, otp });
    
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
    
    // OTP is valid, create the user
    const { firstName, lastName, password, role } = otpData;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create username from firstName and lastName
    const username = `${firstName}${lastName}`;
    
    // Check if the users table has the required columns
    // First, check if the table structure matches what we're trying to insert
    db.query('DESCRIBE users', (describeErr, columns) => {
      if (describeErr) {
        console.error('Error checking table structure:', describeErr);
        return res.status(500).json({
          success: false,
          message: 'Error checking database structure',
          error: describeErr.message
        });
      }
      
      console.log('Table columns:', columns.map(col => col.Field));
      
      // Determine which columns exist
      const hasFirstNameColumn = columns.some(col => col.Field === 'first_name');
      const hasLastNameColumn = columns.some(col => col.Field === 'last_name');
      
      let query, values;
      
      if (hasFirstNameColumn && hasLastNameColumn) {
        // Use the full column set
        query = 'INSERT INTO users (username, email, password, role, status, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?, ?)';
        values = [username, email, hashedPassword, role, 'active', firstName, lastName];
      } else {
        // Use a simplified column set
        query = 'INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)';
        values = [username, email, hashedPassword, role, 'active'];
      }
      
      console.log('Executing query:', query);
      console.log('With values:', values);
      
      // Insert user into database
      db.query(query, values, async (err, result) => {
        if (err) {
          console.error('User creation error:', err);
          return res.status(500).json({ 
            success: false,
            message: 'Error creating user account', 
            error: err.message 
          });
        }
        
        // Send welcome email
        try {
          await sendWelcomeEmail(email, firstName);
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          // Continue with signup process even if welcome email fails
        }
        
        // Remove OTP data
        otpStore.delete(email);
        
        res.status(200).json({ 
          success: true,
          message: 'Email verified successfully! You can now log in.' 
        });
      });
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Resend OTP
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
    
    // Create username from firstName and lastName
    const username = `${otpData.firstName}${otpData.lastName}`;
    
    // Send OTP email
    const mailOptions = {
      from: '"HamroJob Team" <noreply@hamrojob.com>',
      to: email,
      subject: '🔐 Your New HamroJob Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #007bff;">Your New Verification Code</h1>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p>Hello ${username},</p>
            <p>Here is your new verification code to complete your registration:</p>
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
      console.log('Attempting to send OTP email to:', email);
      console.log('OTP code:', otp);
      console.log('Mail options:', JSON.stringify(mailOptions, null, 2));
      
      await emailTransporter.sendMail(mailOptions);
      console.log('OTP email sent successfully to:', email);
      
      res.status(200).json({ 
        success: true,
        message: 'New verification code sent to your email'
      });
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      res.status(500).json({ 
        success: false,
        message: 'Failed to send verification email', 
        error: emailError.message 
      });
    }
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Login
router.post('/login', (req, res) => {
    console.log('Login request received:', { email: req.body.email, password: '[HIDDEN]' });
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error('Login error:', err);
            return res.status(500).json({ message: 'Something went wrong, please try again.', error: err.message });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = results[0];
        
        try {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                console.log('Password does not match for user:', email);
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Create a simple token for authentication
            const token = Math.random().toString(36).substring(2, 15) + 
                          Math.random().toString(36).substring(2, 15);

            console.log('User logged in successfully:', email);
            // Return user data that matches your database structure
            res.status(200).json({
                message: 'Login successful!',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    status: user.status
                },
                token
            });
        } catch (error) {
            console.error('Password comparison error:', error);
            return res.status(500).json({ message: 'Authentication error', error: error.message });
        }
    });
});

export default router;