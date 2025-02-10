import express from 'express';
import { createPool } from 'mysql2';
import cors from 'cors';
import bodyParser from 'body-parser'; // Correct import for body-parser
import bcrypt from 'bcrypt';         // Correct import for bcrypt

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json()); // No destructuring needed; use directly

// MySQL database connection (using createPool)
const db = createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hamro_job', // <-- Change to your database name!
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Signup
app.post('/api/signup', async (req, res) => {
    const { firstName, lastName, email, password, role, companyName, companyRole } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Use bcrypt.hash

        const query = 'INSERT INTO users (username, email, password, role, company_name, company_role) VALUES (?, ?, ?, ?, ?, ?)';
        const values = [firstName + ' ' + lastName, email, hashedPassword, role, companyName, companyRole];

        db.query(query, values, (err, result) => {
            if (err) {
                console.error('Signup error:', err);
                return res.status(500).json({ message: 'Something went wrong, please try again.', error: err.message });
            }
            res.status(201).json({ message: 'Account created successfully!' });
        });
    } catch (error) {
        console.error("Password hashing error:", error);
        res.status(500).json({ message: 'Error hashing password', error: error.message });
    }
});

// Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

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

        const passwordMatch = await bcrypt.compare(password, user.password); // Use bcrypt.compare
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.status(200).json({
            message: 'Login successful!',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                type: user.type,
                company_name: user.company_name,
                company_role: user.company_role
            }
        });
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});