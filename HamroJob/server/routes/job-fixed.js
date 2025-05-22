import express from 'express';
import { db } from '../config/db.js';
import { checkSubscription, incrementJobPostCount } from '../utils/subscription.js';

const router = express.Router();

// GET all jobs
router.get('/', (req, res) => {
    const recruiterId = req.query.recruiterId;
    
    let query;
    let queryParams = [];
    
    if (recruiterId) {
        // This is a recruiter, show all their jobs regardless of status or visibility
        query = 'SELECT * FROM jobs WHERE recruiter_id = ? ORDER BY created_at DESC';
        queryParams = [recruiterId];
    } else {
        // This is a regular user, only show active jobs with visibility = 'yes'
        query = 'SELECT * FROM jobs WHERE status = "active" AND visibility = "yes" ORDER BY created_at DESC';
    }
    
    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Error fetching jobs:', err);
            return res.status(500).json({ message: 'Error fetching jobs', error: err.message });
        }
        
        res.status(200).json({ jobs: results });
    });
});

// GET job by ID
router.get('/:id', (req, res) => {
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
router.post('/', (req, res) => {
    const { title, company, location, description, requirements, recruiter_id, job_type } = req.body;
    
    // Basic validation
    if (!title || !company || !location || !description || !requirements || !recruiter_id) {
        return res.status(400).json({ 
            success: false,
            message: 'All fields are required' 
        });
    }
    
    // Use job_type or default to 'job' if not provided
    const type = job_type || 'job';
    
    // Update query to include job_type field
    const query = 'INSERT INTO jobs (title, company, location, description, requirements, status, recruiter_id, job_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [title, company, location, description, requirements, 'active', recruiter_id, type];
    
    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error creating job:', err);
            return res.status(500).json({ 
                success: false,
                message: 'Error creating job', 
                error: err.message 
            });
        }
        
        res.status(201).json({ 
            success: true,
            message: 'Job created successfully', 
            job: {
                id: result.insertId,
                title,
                company,
                location,
                description,
                requirements,
                status: 'active',
                recruiter_id,
                job_type: type
            }
        });
    });
});

// Add a specific route for recruiter job posting with subscription check
router.post('/recruiter', (req, res) => {
    const { title, company, location, description, requirements, recruiter_id, job_type } = req.body;
    
    console.log('Received job post request with data:', {
        title, company, location, 
        description: description.substring(0, 30) + '...',
        requirements: requirements.substring(0, 30) + '...',
        recruiter_id, job_type
    });
    
    // Basic validation
    if (!title || !company || !location || !description || !requirements || !recruiter_id) {
        return res.status(400).json({ 
            success: false,
            message: 'All fields are required' 
        });
    }
    
    // Check subscription before creating job
    checkSubscription(recruiter_id, (result) => {
        if (result.error) {
            return res.status(403).json({ 
                success: false, 
                message: result.message 
            });
        }
        
        // Continue with job creation
        insertJob(req, res, title, company, location, description, requirements, recruiter_id, job_type);
    });
});

// Function to insert a job after subscription check
function insertJob(req, res, title, company, location, description, requirements, recruiter_id, job_type) {
    // Use job_type or default to 'job' if not provided
    const type = job_type || 'job';
    
    // Update query to include job_type field
    const query = 'INSERT INTO jobs (title, company, location, description, requirements, status, recruiter_id, job_type, visibility) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const insertValues = [title, company, location, description, requirements, 'active', recruiter_id, type, 'yes'];
    
    db.query(query, insertValues, (err, result) => {
        if (err) {
            // Check for foreign key constraint error
            if (err.code === 'ER_NO_REFERENCED_ROW_2') {
                console.error('Invalid recruiter ID:', err);
                return res.status(400).json({ 
                    success: false,
                    message: 'Invalid recruiter ID. Please make sure you are logged in as a recruiter.', 
                    error: err.message 
                });
            }
            console.error('Error creating job:', err);
            return res.status(500).json({ 
                success: false,
                message: 'Error creating job', 
                error: err.message 
            });
        }
        
        // Increment job_posts_used in payments table
        incrementJobPostCount(recruiter_id, (updateResult) => {
            if (updateResult.error) {
                console.error('Error updating job posts used count:', updateResult.details);
            }
            
            res.status(201).json({ 
                success: true,
                message: 'Job created successfully', 
                job: {
                    id: result.insertId,
                    title,
                    company,
                    location,
                    description,
                    requirements,
                    status: 'active',
                    recruiter_id,
                    job_type: type
                }
            });
        });
    });
}

// UPDATE job status (new route)
router.put('/:id/status', (req, res) => {
    const jobId = req.params.id;
    const { status, recruiter_id } = req.body;
    
    if (!status || !['active', 'closed'].includes(status)) {
        return res.status(400).json({ 
            success: false,
            message: 'Invalid status value' 
        });
    }
    
    // Set visibility based on status
    const visibility = status === 'active' ? 'yes' : 'no';
    
    // First verify this job belongs to the recruiter
    const verifyQuery = 'SELECT recruiter_id FROM jobs WHERE id = ?';
    
    db.query(verifyQuery, [jobId], (verifyErr, verifyResults) => {
        if (verifyErr) {
            console.error('Database error during verification:', verifyErr);
            return res.status(500).json({ 
                success: false,
                message: 'Database error', 
                error: verifyErr.message 
            });
        }
        
        if (verifyResults.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Job not found' 
            });
        }
        
        if (verifyResults[0].recruiter_id !== parseInt(recruiter_id)) {
            return res.status(403).json({ 
                success: false,
                message: 'Unauthorized access to this job' 
            });
        }
        
        // If verification passed, update the job status and visibility
        const updateQuery = 'UPDATE jobs SET status = ?, visibility = ?, updated_at = NOW() WHERE id = ?';
        
        db.query(updateQuery, [status, visibility, jobId], (updateErr, updateResults) => {
            if (updateErr) {
                console.error('Database error during update:', updateErr);
                return res.status(500).json({ 
                    success: false,
                    message: 'Database error', 
                    error: updateErr.message 
                });
            }
            
            return res.json({ 
                success: true, 
                message: `Job status updated to ${status} and visibility set to ${visibility}` 
            });
        });
    });
});

// UPDATE job details (new route)
router.put('/:id', (req, res) => {
    const jobId = req.params.id;
    const { title, company, location, description, requirements, job_type, recruiter_id } = req.body;
    
    // Basic validation
    if (!title || !company || !location || !description || !requirements || !recruiter_id) {
        return res.status(400).json({ 
            success: false,
            message: 'All fields are required' 
        });
    }
    
    // First verify this job belongs to the recruiter
    const verifyQuery = 'SELECT recruiter_id FROM jobs WHERE id = ?';
    
    db.query(verifyQuery, [jobId], (verifyErr, verifyResults) => {
        if (verifyErr) {
            console.error('Database error during verification:', verifyErr);
            return res.status(500).json({ 
                success: false,
                message: 'Database error', 
                error: verifyErr.message 
            });
        }
        
        if (verifyResults.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Job not found' 
            });
        }
        
        if (verifyResults[0].recruiter_id !== parseInt(recruiter_id)) {
            return res.status(403).json({ 
                success: false,
                message: 'Unauthorized access to this job' 
            });
        }
        
        // If verification passed, update the job
        const updateQuery = `
            UPDATE jobs 
            SET 
                title = ?, 
                company = ?, 
                location = ?, 
                description = ?, 
                requirements = ?, 
                job_type = ?,
                updated_at = NOW() 
            WHERE id = ?
        `;
        
        const updateValues = [
            title, 
            company, 
            location, 
            description, 
            requirements, 
            job_type || 'job', 
            jobId
        ];
        
        db.query(updateQuery, updateValues, (updateErr, updateResults) => {
            if (updateErr) {
                console.error('Database error during update:', updateErr);
                return res.status(500).json({ 
                    success: false,
                    message: 'Database error', 
                    error: updateErr.message 
                });
            }
            
            return res.json({ 
                success: true, 
                message: 'Job updated successfully',
                job: {
                    id: jobId,
                    title,
                    company,
                    location,
                    description,
                    requirements,
                    job_type: job_type || 'job'
                }
            });
        });
    });
});

// Helper function to fix job visibility based on status
const fixJobVisibility = () => {
    console.log('Fixing job visibility for consistency...');
    const query = 'UPDATE jobs SET visibility = "no" WHERE status = "closed" AND (visibility = "yes" OR visibility IS NULL)';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fixing job visibility:', err);
            return;
        }
        
        if (results.affectedRows > 0) {
            console.log(`Fixed visibility for ${results.affectedRows} jobs`);
        } else {
            console.log('No jobs needed visibility fixes');
        }
    });
};

// Call this function when the server starts
fixJobVisibility();

// POST job with subscription check
router.post('/create', async (req, res) => {
    const { title, company, location, description, requirements, recruiter_id, job_type } = req.body;
    
    // Basic validation
    if (!title || !company || !location || !description || !requirements || !recruiter_id) {
        return res.status(400).json({ 
            success: false,
            message: 'All fields are required' 
        });
    }
    
    // Check subscription before creating job
    checkSubscription(recruiter_id, (result) => {
        if (result.error) {
            return res.status(403).json({ 
                success: false, 
                message: result.message 
            });
        }
        
        // Continue with job creation
        insertJob(req, res, title, company, location, description, requirements, recruiter_id, job_type);
    });
});

export default router;
