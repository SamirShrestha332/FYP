import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import pkg from 'body-parser';
const { json } = pkg;


const app = express();
app.use(bodyParser.json());
app.use(cors());

// MySQL Database Connection
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "hamro_job",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Check MySQL connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database");
    connection.release();
  }
});

// **User Signup Route**
import bcrypt from 'bcrypt';

app.post('/signup', async (req, res) => {
    const { username, email, password, role } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);  // Hash the password
        const query = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
        
        db.query(query, [username, email, hashedPassword, role], (err, results) => {
            if (err) {
                return res.status(500).send({ message: 'Database error', error: err });
            }
            res.send({ message: 'Signup successful', user: { id: results.insertId, username, email, role } });
        });
    } catch (error) {
        res.status(500).send({ message: 'Error hashing password', error: error.message });
    }
});

// **User Login Route**
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT * FROM users WHERE email = ?";
  
  db.execute(query, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = results[0];

    // Compare hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({ message: "Login successful", user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  });
});

// Start the Server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
