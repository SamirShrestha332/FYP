import express from 'express';
import cors from 'cors';
import { db, initializeDatabase } from './config/db.js';
import authRoutes from './routes/auth.js';
import recruiterRoutes from './routes/recruiter.js';
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/user.js';
import jobRoutes from './routes/job.js';
import applicationsRoutes from './routes/applications.js'; // Changed to ES module import

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', authRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/admin', adminRoutes);
app.use('/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/job', jobRoutes); // Add this line to handle the job posting route
app.use('/api/applications', applicationsRoutes); // Moved this up before starting the server

// Add explicit redirection for job update endpoint
app.put('/api/jobs/:id', (req, res) => {
  const newUrl = `/api/job/${req.params.id}`;
  console.log(`Redirecting PUT request from /api/jobs/${req.params.id} to ${newUrl}`);
  req.url = newUrl;
  app._router.handle(req, res);
});

// Deprecated routes that redirect to new routes
app.get('/api/users/me', (req, res) => {
    res.redirect(307, '/users/me' + (req.query.email ? `?email=${req.query.email}` : ''));
});

app.put('/api/users/profile/update', (req, res) => {
    res.redirect(307, '/users/profile/update' + (req.query.email ? `?email=${req.query.email}` : ''));
});

app.post('/api/users/change-password', (req, res) => {
    res.redirect(307, '/users/change-password' + (req.query.email ? `?email=${req.query.email}` : ''));
});

// Add this with your other route imports
import paymentRoutes from './routes/payment.js';

// Add this with your other app.use statements
app.use('/api/payment', paymentRoutes);

// Start the server
app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    await initializeDatabase();
});
// Add this to your existing imports


// Add this to your existing app setup
app.use('/api/admin', adminRoutes);