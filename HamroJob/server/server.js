import express from 'express';
import { createPool } from 'mysql2';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';

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
app.post('/signup', async (req, res) => {
    console.log('Signup request received:', req.body);
    const { firstName, lastName, email, password, role } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check if email already exists
        const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
        db.query(checkEmailQuery, [email], async (err, results) => {
            if (err) {
                console.error('Email check error:', err);
                return res.status(500).json({ message: 'Something went wrong, please try again.', error: err.message });
            }

            if (results.length > 0) {
                return res.status(400).json({ message: 'Email already exists. Please use a different email.' });
            }

            // If email doesn't exist, proceed with signup
            try {
                const hashedPassword = await bcrypt.hash(password, 10);
                
                // Create username from firstName and lastName
                const username = `${firstName} ${lastName}`;
                
                // Insert user with active status
                const query = 'INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)';
                const values = [username, email, hashedPassword, role || 'seeker', 'active'];
                
                console.log('Executing query:', query);
                console.log('With values:', values.map((val, i) => i === 2 ? '[HASHED PASSWORD]' : val));
                
                db.query(query, values, (err, result) => {
                    if (err) {
                        console.error('Signup error details:', err);
                        return res.status(500).json({ message: 'Something went wrong, please try again.', error: err.message });
                    }
                    
                    console.log('User created successfully:', result);
                    res.status(201).json({ message: 'Account created successfully!' });
                });
            } catch (hashError) {
                console.error("Password hashing error:", hashError);
                return res.status(500).json({ message: 'Error hashing password', error: hashError.message });
            }
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

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

// Start the server
app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);

    await initializeDatabase();
});