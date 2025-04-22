import mysql from 'mysql';

// Create MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hamro_job'
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
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
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            company_name VARCHAR(255),
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

export { db, initializeDatabase };