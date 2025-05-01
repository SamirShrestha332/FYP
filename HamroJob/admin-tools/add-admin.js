import mysql from 'mysql';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

// Create a connection to the database
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hamro_job'
});

// Connect to the database
connection.connect(error => {
  if (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  }
  console.log('Connected to the database successfully.');
  
  // Create default admin user
  createDefaultAdmin();
});

async function createDefaultAdmin() {
  try {
    // Check if admin table exists
    connection.query(`SHOW TABLES LIKE 'admin_users'`, (err, results) => {
      if (err) {
        console.error('Error checking admin_users table:', err);
        connection.end();
        return;
      }
      
      // If table doesn't exist, create it
      if (results.length === 0) {
        console.log('Creating admin_users table...');
        const createTableQuery = `
          CREATE TABLE admin_users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `;
        
        connection.query(createTableQuery, (err) => {
          if (err) {
            console.error('Error creating admin_users table:', err);
            connection.end();
            return;
          }
          
          console.log('admin_users table created successfully.');
          insertDefaultAdmin();
        });
      } else {
        // Table exists, check the structure
        connection.query('DESCRIBE admin_users', (err, columns) => {
          if (err) {
            console.error('Error checking admin_users structure:', err);
            connection.end();
            return;
          }
          
          // Check if the columns match what we expect
          const columnNames = columns.map(col => col.Field);
          console.log('Existing columns:', columnNames);
          
          insertDefaultAdmin();
        });
      }
    });
  } catch (error) {
    console.error('Error creating default admin user:', error);
    connection.end();
  }
}

async function insertDefaultAdmin() {
  // Default admin credentials
  const adminEmail = 'admin1@hamrojob.com';
  const adminPassword = 'admin123';
  const adminName = 'Admin';
  
  // Check if admin already exists
  connection.query('SELECT * FROM admin_users WHERE email = ?', [adminEmail], async (err, results) => {
    if (err) {
      console.error('Error checking existing admin:', err);
      connection.end();
      return;
    }
    
    if (results.length > 0) {
      console.log('Admin user already exists.');
      connection.end();
      return;
    }
    
    try {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      // Insert the admin user with the correct column names
      const query = 'INSERT INTO admin_users SET `name` = ?, `email` = ?, `password` = ?';
      connection.query(query, [adminName, adminEmail, hashedPassword], (err, result) => {
        if (err) {
          console.error('Error creating default admin user:', err);
        } else {
          console.log('Default admin user created successfully!');
          console.log('Email:', adminEmail);
          console.log('Password:', adminPassword);
        }
        
        connection.end();
      });
    } catch (error) {
      console.error('Error hashing password:', error);
      connection.end();
    }
  });
}
