// ES Module format for compatibility with your project
import mysql from 'mysql2/promise';
import * as readline from 'readline';

// Create database connection
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hamro_job',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Create readline interface for terminal input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to ask a question and get user input
const askQuestion = (question) => {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
};

// Function to create an admin user
const createAdminUser = async () => {
    try {
        console.log('\n===== HamroJob Admin User Creation Tool =====\n');
        
        // Get admin details - ask for name first
        const name = await askQuestion('Enter admin name: ');
        const email = await askQuestion('Enter admin email: ');
        const password = await askQuestion('Enter admin password (min 6 characters): ');
        
        // Validate input
        if (!name || !email || !password) {
            console.error('Error: All fields are required');
            await closeConnection();
            return;
        }
        
        if (password.length < 6) {
            console.error('Error: Password must be at least 6 characters');
            await closeConnection();
            return;
        }
        
        // Check if email already exists
        const [existingUsers] = await db.query('SELECT * FROM admin_users WHERE email = ?', [email]);
        
        if (existingUsers.length > 0) {
            console.error(`Error: Admin with email ${email} already exists`);
            await closeConnection();
            return;
        }
        
        // First, let's check what columns exist in the admin_users table
        const [columns] = await db.query('SHOW COLUMNS FROM admin_users');
        const columnNames = columns.map(column => column.Field);
        
        let query, params;
        
        // Check which columns to use based on database structure
        if (columnNames.includes('name')) {
            query = 'INSERT INTO admin_users (name, email, password) VALUES (?, ?, ?)';
            params = [name, email, password];
        } else if (columnNames.includes('username')) {
            query = 'INSERT INTO admin_users (username, email, password) VALUES (?, ?, ?)';
            params = [name, email, password]; // Use name as username
        } else {
            query = 'INSERT INTO admin_users (email, password) VALUES (?, ?)';
            params = [email, password];
            console.log('Note: Admin name will not be stored (no name/username column in database)');
        }
        
        // Insert new admin user
        const [result] = await db.query(query, params);
        
        console.log(`\nSuccess! Admin user created with ID: ${result.insertId}`);
        console.log(`Name: ${name}`);
        console.log(`Email: ${email}`);
        console.log('\nYou can now log in to the admin panel with these credentials.\n');
        
        await closeConnection();
    } catch (error) {
        console.error('Error:', error.message);
        await closeConnection();
    }
};

// Function to close database connection and readline interface
const closeConnection = async () => {
    rl.close();
    await db.end();
};

// Run the script
createAdminUser();
