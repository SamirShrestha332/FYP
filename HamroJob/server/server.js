import express from 'express';
import { createPool } from 'mysql2';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// MySQL database connection (using createPool)
const db = createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hamro_job', 
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Signup
// app.post('/signup', async (req, res) => {
//     console.log('Signup request received:', req.body);
//     const { firstName, lastName, email, password, role } = req.body;

//     // Basic validation
//     if (!firstName || !lastName || !email || !password) {
//         return res.status(400).json({ message: 'All fields are required' });
//     }

//     try {
//         // Check if email already exists
//         const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
//         db.query(checkEmailQuery, [email], async (err, results) => {
//             if (err) {
//                 console.error('Email check error:', err);
//                 return res.status(500).json({ message: 'Something went wrong, please try again.', error: err.message });
//             }

//             if (results.length > 0) {
//                 return res.status(400).json({ message: 'Email already exists. Please use a different email.' });
//             }

//             // If email doesn't exist, proceed with signup
//             try {
//                 const hashedPassword = await bcrypt.hash(password, 10);
                
//                 // Create username from firstName and lastName
//                 const username = `${firstName} ${lastName}`;
                
//                 // Insert user with active status
//                 const query = 'INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)';
//                 const values = [username, email, hashedPassword, role || 'seeker', 'active'];
                
//                 console.log('Executing query:', query);
//                 console.log('With values:', values.map((val, i) => i === 2 ? '[HASHED PASSWORD]' : val));
                
//                 db.query(query, values, async (err, result) => {
//                     if (err) {
//                         console.error('Signup error details:', err);
//                         return res.status(500).json({ message: 'Something went wrong, please try again.', error: err.message });
//                     }
                    
//                     console.log('User created successfully:', result);
                    
//                     // Send welcome email
//                     try {
//                         await sendWelcomeEmail(email, username);
//                         console.log('Welcome email sent to:', email);
//                     } catch (emailError) {
//                         console.error('Failed to send welcome email:', emailError);
//                         // Continue with signup process even if email fails
//                     }
                    
//                     res.status(201).json({ message: 'Account created successfully!' });
//                 });
//             } catch (hashError) {
//                 console.error("Password hashing error:", hashError);
//                 return res.status(500).json({ message: 'Error hashing password', error: hashError.message });
//             }
//         });
//     } catch (error) {
//         console.error("Server error:", error);
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// });

// Login
app.post('/login', (req, res) => {
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

// Admin Login
app.post('/admin/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Query to find admin user
        const query = 'SELECT * FROM admin_users WHERE email = ?';
        
        db.query(query, [email], async (err, results) => {
            if (err) {
                console.error('Admin login error:', err);
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

            const admin = results[0];
            
            // Compare password (plain text for admin in this example)
            const passwordMatch = password === admin.password;
            
            if (!passwordMatch) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Invalid email or password' 
                });
            }

            // Remove password from response
            delete admin.password;
            
            // Create a simple token
            const token = Math.random().toString(36).substring(2, 15) + 
                          Math.random().toString(36).substring(2, 15);
            
            res.json({
                success: true,
                message: 'Login successful',
                admin,
                token
            });
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// User data route without /api prefix
app.get('/users/me', (req, res) => { 
    // Extract token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    // In a real application, we would extract the user ID from the token
    // For now, we'll use a simpler approach - get user data from localStorage on client
    // and just return success
    
    res.status(200).json({ 
        success: true, 
        message: 'Authentication successful'
    });
});

// Update profile route without /api prefix
app.put('/users/profile/update', (req, res) => {
    // Extract token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    // Extract user data from request body
    const { username, email, phone, location, bio, skills } = req.body;
    
    // Validate required fields
    if (!username || !email) {
        return res.status(400).json({ success: false, message: 'Username and email are required' });
    }
    
    console.log(`Updating profile for user with email ${email} with data:`, req.body);
    
    // Check if user exists first
    const checkQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkQuery, [email], (err, results) => {
        if (err) {
            console.error('Error checking user existence:', err);
            return res.status(500).json({ success: false, message: 'Error updating user profile' });
        }
        
        if (results.length === 0) {
            // If user doesn't exist yet, create a new user
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // User exists, perform update
        const query = `
            UPDATE users 
            SET username = ?, phone = ?, location = ?, bio = ?, skills = ?
            WHERE email = ?
        `;
        
        db.query(query, [username, phone || null, location || null, bio || null, skills || null, email], (err, results) => {
            if (err) {
                console.error('Error updating user profile:', err);
                return res.status(500).json({ success: false, message: 'Error updating user profile' });
            }
            
            // Return the updated user data to be stored in localStorage
            res.status(200).json({ 
                success: true, 
                message: 'Profile updated successfully', 
                user: {
                    id: results.insertId || results.id,
                    username,
                    email,
                    phone: phone || null,
                    location: location || null,
                    bio: bio || null,
                    skills: skills || null
                }
            });
        });
    });
});

// Change password route without /api prefix
app.post('/users/change-password', async (req, res) => {
    // Extract token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    // Extract password data from request body
    const { currentPassword, newPassword, email } = req.body;
    
    // Validate required fields
    if (!currentPassword || !newPassword || !email) {
        return res.status(400).json({ success: false, message: 'Current password, new password, and email are required' });
    }
    
    console.log(`Changing password for user with email ${email}`);
    
    // Get the user from the database to check the current password
    const userQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(userQuery, [email], async (err, results) => {
        if (err) {
            console.error('Error fetching user data for password change:', err);
            return res.status(500).json({ success: false, message: 'Error changing password' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const user = results[0];
        
        // Check if the current password matches
        try {
            const passwordMatch = await bcrypt.compare(currentPassword, user.password);
            if (!passwordMatch) {
                return res.status(400).json({ success: false, message: 'Current password is incorrect' });
            }
            
            // Hash the new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            // Update the password in the database
            const updateQuery = 'UPDATE users SET password = ? WHERE email = ?';
            db.query(updateQuery, [hashedPassword, email], (err, results) => {
                if (err) {
                    console.error('Error updating password:', err);
                    return res.status(500).json({ success: false, message: 'Error changing password' });
                }
                
                res.status(200).json({ success: true, message: 'Password changed successfully' });
            });
        } catch (error) {
            console.error('Password comparison error:', error);
            return res.status(500).json({ success: false, message: 'Error changing password' });
        }
    });
});

// User verification endpoint
app.get('/users/verify', (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    // In a real app, verify the token here
    // For now, just return success
    res.status(200).json({ success: true, message: 'Token is valid' });
});

// User profile endpoint to fetch profile data by email
app.get('/users/profile', (req, res) => {
    // Extract token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    // Get email from query parameters
    const email = req.query.email;
    
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email parameter is required' });
    }
    
    console.log(`Fetching profile data for user with email: ${email}`);
    
    // Query database for user data
    const query = 'SELECT id, username, email, role, phone, location, bio, skills, status FROM users WHERE email = ?';
    console.log('Executing query:', query);
    console.log('With parameters:', [email]);
    
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Error fetching user profile data:', err);
            return res.status(500).json({ success: false, message: 'Error fetching profile data' });
        }
        
        console.log('Query results:', results);
        
        if (results.length === 0) {
            console.log('No user found with email:', email);
            // Return default data if user not found to avoid breaking the UI
            return res.status(200).json({ 
                success: true, 
                user: {
                    id: 0,
                    username: '',
                    email: email,
                    role: 'user',
                    phone: '',
                    location: '',
                    bio: '',
                    skills: '',
                    status: 'active'
                },
                message: 'User not found in database, returning default data'
            });
        }
        
        const user = results[0];
        console.log('Returning user data:', user);
        
        res.status(200).json({ success: true, user });
    });
});

// Keep these but they're now deprecated in favor of the routes without /api prefix
app.get('/api/users/me', (req, res) => {
    // Redirect to non-api version
    res.redirect(307, '/users/me' + (req.query.email ? `?email=${req.query.email}` : ''));
});

app.put('/api/users/profile/update', (req, res) => {
    // Redirect to non-api version
    res.redirect(307, '/users/profile/update' + (req.query.email ? `?email=${req.query.email}` : ''));
});

app.post('/api/users/change-password', (req, res) => {
    // Redirect to non-api version
    res.redirect(307, '/users/change-password' + (req.query.email ? `?email=${req.query.email}` : ''));
});

// Initialize database tables
const initializeDatabase = async () => {
    console.log('Initializing database...');
    
    try {
        // Create users table if it doesn't exist
        db.query(`
          CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role ENUM('admin', 'seeker', 'recruiter') DEFAULT 'seeker',
            phone VARCHAR(20),
            location VARCHAR(100),
            bio TEXT,
            skills TEXT,
            status ENUM('active', 'inactive') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);
        
        // Create jobs table if it doesn't exist
        db.query(`
          CREATE TABLE IF NOT EXISTS jobs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(100) NOT NULL,
            company VARCHAR(100) NOT NULL,
            location VARCHAR(100) NOT NULL,
            description TEXT NOT NULL,
            requirements TEXT,
            user_id INT,
            status ENUM('active', 'inactive') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);
        
        // Create admin_users table if it doesn't exist
        db.query(`
          CREATE TABLE IF NOT EXISTS admin_users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // Check if admin user exists, if not create default admin
        db.query(`SELECT * FROM admin_users WHERE email = 'admin1@hamrojob.com'`, (err, results) => {
            if (err) {
                console.error('Error checking for admin user:', err);
                return;
            }
            
            // If no admin user exists, create one
            if (results.length === 0) {
                const defaultAdmin = {
                    username: 'Admin',
                    email: 'admin1@hamrojob.com',
                    password: 'admin123' // Simple password for testing
                };
                
                db.query('INSERT INTO admin_users SET ?', defaultAdmin, (err) => {
                    if (err) {
                        console.error('Error creating default admin user:', err);
                    } else {
                        console.log('Default admin user created');
                    }
                });
            }
        });
        
        console.log('Database tables created or already exist');
    } catch (err) {
        console.error('Error initializing database:', err);
    }
};

// GET all jobs
app.get('/api/jobs', (req, res) => {
    const query = 'SELECT * FROM jobs WHERE status = "active" ORDER BY created_at DESC';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching jobs:', err);
            return res.status(500).json({ message: 'Error fetching jobs', error: err.message });
        }
        
        res.status(200).json({ jobs: results });
    });
});

// GET job by ID
app.get('/api/jobs/:id', (req, res) => {
    const jobId = req.params.id;
    const query = 'SELECT * FROM jobs WHERE id = ?';
    
    db.query(query, [jobId], (err, results) => {
        if (err) {
            console.error('Error fetching job:', err);
            return res.status(500).json({ message: 'Error fetching job', error: err.message });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'Job not found' });
        }
        
        res.status(200).json({ job: results[0] });
    });
});

// POST new job
app.post('/api/jobs', (req, res) => {
    const { title, company, location, description, requirements, user_id } = req.body;
    
    // Basic validation
    if (!title || !company || !location || !description) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    
    const query = 'INSERT INTO jobs (title, company, location, description, requirements, user_id) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [title, company, location, description, requirements, user_id];
    
    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error creating job:', err);
            return res.status(500).json({ message: 'Error creating job', error: err.message });
        }
        
        res.status(201).json({ 
            message: 'Job created successfully', 
            jobId: result.insertId 
        });
    });
});

// Admin endpoint to get all users
app.get('/admin/users', (req, res) => {
    // Get all users from the database
    const query = 'SELECT id, username, email, role, status, DATE_FORMAT(created_at, "%Y-%m-%d") as join_date FROM users ORDER BY id DESC';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to fetch users', 
                error: err.message 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            users: results 
        });
    });
});

// Admin endpoint to change user status
app.put('/admin/users/:id/status', (req, res) => {
    const userId = req.params.id;
    const { status } = req.body;
    
    if (!status || !['active', 'inactive'].includes(status)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid status provided' 
        });
    }
    
    const query = 'UPDATE users SET status = ? WHERE id = ?';
    
    db.query(query, [status, userId], (err, result) => {
        if (err) {
            console.error('Error updating user status:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to update user status', 
                error: err.message 
            });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: `User status updated to ${status}` 
        });
    });
});

// Start the server
app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);

    await initializeDatabase();
});

// Configure nodemailer for Gmail
const emailTransporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: 'magarsamir243@gmail.com', // Change this to your Gmail address
    pass: 'tqvoysjqkburfejy' // Add your app password here (not your regular Gmail password)
  }
});

// Function to send welcome email
const sendWelcomeEmail = async (userEmail, username) => {
  try {
    const mailOptions = {
      from: '"HamroJob Team" <noreply@hamrojob.com>',
      to: userEmail,
      subject: '🎉 Welcome to HamroJob! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #007bff;">Welcome to HamroJob! 🚀</h1>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p>Hello ${username || 'there'},</p>
            <p>Thank you for joining HamroJob! 🙌 We're excited to have you as part of our community.</p>
            <p>With HamroJob, you can:</p>
            <ul>
              <li>✅ Find your dream job in Nepal</li>
              <li>✅ Connect with top employers</li>
              <li>✅ Build your professional profile</li>
              <li>✅ Track your job applications</li>
            </ul>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <p style="margin: 0; font-weight: bold;">Ready to get started?</p>
            <p style="margin-top: 10px;">Complete your profile to increase your chances of getting noticed by employers!</p>
            <div style="text-align: center; margin-top: 15px;">
              <a href="http://localhost:5174/profile" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Complete Your Profile</a>
            </div>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p>If you have any questions, feel free to contact our support team at support@hamrojob.com</p>
            <p>© ${new Date().getFullYear()} HamroJob. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

// Create a Map to store OTP data temporarily
const otpStore = new Map();

// Generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Use the existing emailTransporter instead of creating a new one
// const transporter = nodemailer.createTransport({...});

// Modify the signup endpoint for OTP
app.post('/signup', async (req, res) => {
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
      const username = `${firstName} ${lastName}`;
      
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

// Endpoint to verify OTP
app.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
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
    const username = `${firstName} ${lastName}`;
    
    // Insert user into database
    const query = 'INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)';
    const values = [username, email, hashedPassword, role, 'active'];
    
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
        await sendWelcomeEmail(email, username);
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
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Endpoint to resend OTP
app.post('/resend-otp', async (req, res) => {
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
    const username = `${otpData.firstName} ${otpData.lastName}`;
    
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