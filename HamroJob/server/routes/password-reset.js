import express from 'express';
import bcrypt from 'bcrypt';
import { db } from '../config/db.js';
import { emailTransporter } from '../config/email.js';
import { otpStore, generateOTP } from '../utils/otp.js';

const router = express.Router();

// Request password reset OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Email is required' 
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
    
    // Check if user exists
    const query = 'SELECT * FROM users WHERE email = ?';
    
    db.query(query, [email], async (err, results) => {
      if (err) {
        console.error('Database error during forgot password:', err);
        return res.status(500).json({ 
          success: false,
          message: 'Something went wrong, please try again.' 
        });
      }
      
      if (results.length === 0) {
        // Don't reveal that the email doesn't exist for security reasons
        return res.status(200).json({ 
          success: true,
          message: 'If your email is registered, you will receive a password reset code.' 
        });
      }
      
      const user = results[0];
      
      // Generate OTP
      const otp = generateOTP();
      
      // Store OTP with expiration (10 minutes)
      const otpData = {
        otp,
        email,
        type: 'password-reset',
        userId: user.id,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      };
      
      otpStore.set(`password-reset-${email}`, otpData);
      
      // Send OTP email
      const mailOptions = {
        from: '"HamroJob Team" <noreply@hamrojob.com>',
        to: email,
        subject: '🔐 HamroJob Password Reset Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #007bff;">Password Reset</h1>
            </div>
            
            <div style="margin-bottom: 20px;">
              <p>Hello ${user.username || user.first_name || 'there'},</p>
              <p>We received a request to reset your HamroJob account password. Please enter the verification code below to proceed:</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; text-align: center;">
              <h2 style="letter-spacing: 5px; font-size: 32px; margin: 10px 0; color: #007bff;">${otp}</h2>
              <p style="margin: 0; color: #6c757d; font-size: 14px;">This code will expire in 10 minutes</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <p>If you didn't request this code, you can safely ignore this email. Your account is secure.</p>
            </div>
            
            <div style="margin-top: 30px; text-align: center; color: #6c757d; font-size: 14px;">
              <p>© ${new Date().getFullYear()} HamroJob. All rights reserved.</p>
            </div>
          </div>
        `
      };
      
      try {
        console.log('Attempting to send password reset OTP email to:', email);
        await emailTransporter.sendMail(mailOptions);
        console.log('Password reset OTP email sent successfully to:', email);
        
        res.status(200).json({ 
          success: true,
          message: 'Password reset code sent to your email',
          email
        });
      } catch (emailError) {
        console.error('Failed to send password reset OTP email:', emailError);
        res.status(500).json({ 
          success: false,
          message: 'Failed to send verification email', 
          error: emailError.message 
        });
      }
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Verify OTP for password reset
router.post('/verify-reset-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and OTP are required' 
      });
    }
    
    // Get stored OTP data
    const otpData = otpStore.get(`password-reset-${email}`);
    
    // Check if OTP exists and is valid
    if (!otpData) {
      return res.status(400).json({ 
        success: false,
        message: 'Verification code expired or invalid. Please request a new code.' 
      });
    }
    
    // Check if OTP has expired
    if (new Date() > otpData.expiresAt) {
      otpStore.delete(`password-reset-${email}`);
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
    
    // OTP is valid
    res.status(200).json({ 
      success: true,
      message: 'OTP verified successfully. You can now reset your password.' 
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

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Email, OTP, and new password are required' 
      });
    }
    
    // Password validation
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters long' 
      });
    }
    
    // Get stored OTP data
    const otpData = otpStore.get(`password-reset-${email}`);
    
    // Check if OTP exists and is valid
    if (!otpData) {
      return res.status(400).json({ 
        success: false,
        message: 'Verification code expired or invalid. Please request a new code.' 
      });
    }
    
    // Check if OTP has expired
    if (new Date() > otpData.expiresAt) {
      otpStore.delete(`password-reset-${email}`);
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
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password in database
    const query = 'UPDATE users SET password = ? WHERE email = ?';
    
    db.query(query, [hashedPassword, email], (err, result) => {
      if (err) {
        console.error('Password update error:', err);
        return res.status(500).json({ 
          success: false,
          message: 'Failed to update password', 
          error: err.message 
        });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          success: false,
          message: 'User not found' 
        });
      }
      
      // Remove OTP data
      otpStore.delete(`password-reset-${email}`);
      
      // Send password changed confirmation email
      const mailOptions = {
        from: '"HamroJob Team" <noreply@hamrojob.com>',
        to: email,
        subject: '✅ HamroJob Password Changed Successfully',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #007bff;">Password Changed Successfully</h1>
            </div>
            
            <div style="margin-bottom: 20px;">
              <p>Hello,</p>
              <p>Your HamroJob account password has been successfully changed.</p>
              <p>If you did not make this change, please contact our support team immediately.</p>
            </div>
            
            <div style="margin-top: 30px; text-align: center; color: #6c757d; font-size: 14px;">
              <p>© ${new Date().getFullYear()} HamroJob. All rights reserved.</p>
            </div>
          </div>
        `
      };
      
      try {
        emailTransporter.sendMail(mailOptions);
      } catch (emailError) {
        console.error('Failed to send password change confirmation email:', emailError);
        // Continue with the process even if the confirmation email fails
      }
      
      res.status(200).json({ 
        success: true,
        message: 'Password reset successful! You can now login with your new password.' 
      });
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

export default router;
