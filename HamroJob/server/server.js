import express from 'express';
import cors from 'cors';
import { db, initializeDatabase } from './config/db.js';
import authRoutes from './routes/auth.js';
import recruiterRoutes from './routes/recruiter.js';
import adminRoutes from './routes/admin.js';
import adminPaymentsRoutes from './routes/admin-payments.js';
import userRoutes from './routes/user.js';
import jobRoutes from './routes/job.js';
import applicationsRoutes from './routes/applications.js'; // Changed to ES module import
import paymentRoutes from './routes/payment.js';
import passwordResetRoutes from './routes/password-reset.js';
import recruiterPasswordResetRoutes from './routes/recruiter-password-reset.js';

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
app.use('/api/admin', adminRoutes); // Changed from '/admin' to '/api/admin' to match frontend
app.use('/api/admin', adminPaymentsRoutes); // Admin payment routes
app.use('/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/job', jobRoutes); // Add this line to handle the job posting route
app.use('/api/applications', applicationsRoutes); // Moved this up before starting the server
app.use('/api/payment', paymentRoutes);
app.use('/api', passwordResetRoutes); // Password reset routes for regular users
app.use('/api/recruiter', recruiterPasswordResetRoutes); // Password reset routes for recruiters

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

// Start the server
app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    await initializeDatabase();
});

