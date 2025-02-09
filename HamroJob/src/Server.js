import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';  // Import bcrypt

const app = express();
app.use(bodyParser.json()); // Essential for parsing JSON request bodies
app.use(cors());

// MySQL Database Connection (using createPool for better connection management)
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "hamro_job",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Check MySQL connection (optional, but good for debugging)
db.getConnection((err, connection) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to MySQL database");
        connection.release(); // Release the connection back to the pool
    }
});

// User Signup Route
app.post('/signup', async (req, res) => {
    const { username, email, password, role, company_name, company_role } = req.body; // Include company fields

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

        const query = 'INSERT INTO users (username, email, password, role, company_name, company_role) VALUES (?, ?, ?, ?, ?, ?)';

        db.query(query, [username, email, hashedPassword, role, company_name, company_role], (err, results) => { // Include company fields in query
            if (err) {
                console.error("Signup database error:", err); // Log the error for debugging
                return res.status(500).send({ message: 'Database error', error: err.message }); // Send a more specific error message
            }
            res.send({ message: 'Signup successful', user: { id: results.insertId, username, email, role, company_name, company_role } }); // Include company fields in response
        });
    } catch (error) {
        console.error("Signup hashing error:", error); // Log the error
        res.status(500).send({ message: 'Error hashing password', error: error.message });
    }
});

// User Login Route (unchanged, but included for completeness)
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const query = "SELECT * FROM users WHERE email = ?";

    db.execute(query, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message }); // Send error message
        }
        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const user = results[0];

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        res.json({ message: "Login successful", user: { id: user.id, username: user.username, email: user.email, role: user.role, company_name: user.company_name, company_role: user.company_role } }); // Include company info in the login response
    });
});


// Start the Server
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});