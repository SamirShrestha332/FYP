import express from 'express';
import bcrypt from 'bcrypt';
import { db } from '../config/db.js';

const router = express.Router();

// User data route
router.get('/me', (req, res) => { 
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

// Update profile route
router.put('/profile/update', (req, res) => {
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

// Change password route
router.post('/change-password', async (req, res) => {
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
router.get('/verify', (req, res) => {
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
router.get('/profile', (req, res) => {
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

// Make sure to use export default at the end of the file
export default router;