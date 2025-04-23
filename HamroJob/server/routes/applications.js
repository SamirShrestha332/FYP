import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { db } from '../config/db.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dfplmkziu',
  api_key: '962393579386312',    // Make sure this is your actual API key, not a placeholder
  api_secret: 'sCvTFErOCkBUZuO8Kk7ITS8sMhQ'  // Make sure this is your actual API secret
});

// Setup multer storage
const storage = multer.memoryStorage();

// Create multer instance with configuration
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 25 * 1024 * 1024, // 25MB for individual files
    fieldSize: 25 * 1024 * 1024  // 25MB field size limit
  }
});

// POST endpoint to handle job applications
router.post('/apply', (req, res) => {
  // Apply multer middleware inside the route handler
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ])(req, res, async function(err) {
    // Handle multer errors
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    try {
      console.log('Application submission started');
      console.log('Request body:', req.body);
      console.log('Request files:', req.files);
      
      const { jobId, userId, coverLetter } = req.body;
      
      // Validate required fields
      if (!jobId || !userId || !coverLetter) {
        console.log('Missing required fields:', { jobId, userId, coverLetter });
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required fields' 
        });
      }
      
      // Check if resume was uploaded
      if (!req.files || !req.files.resume) {
        console.log('No resume file uploaded');
        return res.status(400).json({
          success: false,
          message: 'Resume file is required'
        });
      }
      
      // Check if user has already applied for this job
      const checkQuery = 'SELECT * FROM applications WHERE job_id = ? AND user_id = ?';
      db.query(checkQuery, [jobId, userId], async (checkErr, checkResults) => {
        if (checkErr) {
          console.error('Error checking existing application:', checkErr);
          return res.status(500).json({
            success: false,
            message: 'Failed to check existing application',
            error: checkErr.message
          });
        }
        
        if (checkResults.length > 0) {
          console.log('User already applied for this job');
          return res.status(400).json({
            success: false,
            message: 'You have already applied for this job'
          });
        }
        
        try {
          let resumeUrl = null;
          let videoUrl = null;
          let resumeTempFilePath = null;
          let videoTempFilePath = null;
          
          // Process resume file
          const resumeFile = req.files.resume[0];
          resumeTempFilePath = path.join(__dirname, `../../uploads/temp/${Date.now()}_${resumeFile.originalname}`);
          console.log('Resume temp path:', resumeTempFilePath);
          
          // Ensure directory exists for temp files
          const tempDir = path.dirname(resumeTempFilePath);
          if (!fs.existsSync(tempDir)) {
            console.log('Creating temp directory:', tempDir);
            fs.mkdirSync(tempDir, { recursive: true });
          }
          
          // Write resume buffer to temporary file
          fs.writeFileSync(resumeTempFilePath, resumeFile.buffer);
          
          console.log('Uploading resume to Cloudinary:', resumeTempFilePath);
          
          // Upload resume to Cloudinary
          const resumeResult = await cloudinary.uploader.upload(resumeTempFilePath, {
            folder: 'CV_resume',
            resource_type: 'auto',
            public_id: `resume_${userId}_${Date.now()}`,
            access_mode: 'public'
          });
          
          console.log('Resume upload result:', resumeResult);
          
          // Clean up resume temp file
          if (fs.existsSync(resumeTempFilePath)) {
            fs.unlinkSync(resumeTempFilePath);
            console.log('Deleted resume temp file');
          }
          
          // Get the resume URL
          resumeUrl = resumeResult.secure_url;
          
          // Process video file if it exists
          if (req.files.video && req.files.video.length > 0) {
            const videoFile = req.files.video[0];
            videoTempFilePath = path.join(__dirname, `../../uploads/temp/${Date.now()}_${videoFile.originalname}`);
            console.log('Video temp path:', videoTempFilePath);
            
            // Write video buffer to temporary file
            fs.writeFileSync(videoTempFilePath, videoFile.buffer);
            
            console.log('Uploading video to Cloudinary:', videoTempFilePath);
            
            try {
              // Upload video to Cloudinary
              const videoResult = await cloudinary.uploader.upload(videoTempFilePath, {
                folder: 'video_resumes',
                resource_type: 'video',
                public_id: `video_${userId}_${Date.now()}`,
                chunk_size: 6000000, // Increase chunk size for larger videos
                eager: [
                  { format: 'mp4', transformation: [
                    { width: 640, crop: 'scale' }
                  ]}
                ]
              });
              
              console.log('Video upload result:', videoResult);
              
              // Get the video URL
              videoUrl = videoResult.secure_url;
            } catch (videoUploadError) {
              console.error('Error uploading video to Cloudinary:', videoUploadError);
              // Continue with the application even if video upload fails
            } finally {
              // Clean up video temp file
              if (fs.existsSync(videoTempFilePath)) {
                fs.unlinkSync(videoTempFilePath);
                console.log('Deleted video temp file');
              }
            }
          }
          
          // Insert the application into the database with video_url if available
          const insertQuery = `
            INSERT INTO applications 
            (job_id, user_id, resume, cover_letter, status, created_at, video_url) 
            VALUES (?, ?, ?, ?, 'pending', NOW(), ?)
          `;
          
          db.query(insertQuery, [jobId, userId, resumeUrl, coverLetter, videoUrl], (insertErr, insertResults) => {
            if (insertErr) {
              console.error('Error submitting application to database:', insertErr);
              return res.status(500).json({
                success: false,
                message: 'Failed to submit application',
                error: insertErr.message
              });
            }
            
            console.log('Application submitted successfully');
            res.status(201).json({
              success: true,
              message: 'Application submitted successfully',
              applicationId: insertResults.insertId,
              resumeUrl: resumeUrl,
              videoUrl: videoUrl
            });
          });
        } catch (uploadError) {
          console.error('Error uploading to Cloudinary:', uploadError);
          // Clean up temp files if they exist
          try {
            if (resumeTempFilePath && fs.existsSync(resumeTempFilePath)) {
              fs.unlinkSync(resumeTempFilePath);
              console.log('Cleaned up resume temp file after error');
            }
            if (videoTempFilePath && fs.existsSync(videoTempFilePath)) {
              fs.unlinkSync(videoTempFilePath);
              console.log('Cleaned up video temp file after error');
            }
          } catch (cleanupError) {
            console.error('Error cleaning up temp files:', cleanupError);
          }
          
          return res.status(500).json({
            success: false,
            message: 'Failed to upload files',
            error: uploadError.message
          });
        }
      });
      
    } catch (error) {
      console.error('Error in application submission:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit application',
        error: error.message
      });
    }
  });
});

// GET endpoint to fetch applications for a job
router.get('/job/:jobId', (req, res) => {
  const { jobId } = req.params;
  
  const query = `
    SELECT a.*, u.username, u.email, u.phone, j.title as job_title, j.company
    FROM applications a
    JOIN users u ON a.user_id = u.id
    JOIN jobs j ON a.job_id = j.id
    WHERE a.job_id = ?
    ORDER BY a.created_at DESC
  `;
  
  db.query(query, [jobId], (err, results) => {
    if (err) {
      console.error('Error fetching applications:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch applications',
        error: err.message
      });
    }
    
    res.status(200).json({
      success: true,
      applications: results
    });
  });
});

// GET endpoint to fetch applications for a user
router.get('/user/:userId', authenticateToken, (req, res) => {
  const { userId } = req.params;
  
  const query = `
    SELECT a.*, j.title as job_title, j.company as company_name, j.location as job_location, 
           j.job_type, j.created_at as job_posted_date
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    WHERE a.user_id = ?
    ORDER BY a.created_at DESC
  `;
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching applications:', err);
      return res.status(500).json({ 
        message: 'Failed to fetch applications',
        error: err.message 
      });
    }
    
    // Process applications to include job details
    const processedApplications = results.map(app => {
      return {
        ...app,
        job: {
          id: app.job_id,
          title: app.job_title,
          company: app.company_name,
          location: app.job_location,
          jobType: app.job_type
        }
      };
    });
    
    res.json({ applications: processedApplications });
  });
});

// Get a specific application by ID
router.get('/:applicationId', authenticateToken, (req, res) => {
  const { applicationId } = req.params;
  
  const query = `
    SELECT a.*, j.title, j.company, j.location, j.description, j.requirements, 
           j.job_type
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    WHERE a.id = ?
  `;
  
  db.query(query, [applicationId], (err, results) => {
    if (err) {
      console.error('Error fetching application details:', err);
      return res.status(500).json({ 
        message: 'Failed to fetch application details',
        error: err.message 
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    const application = results[0];
    
    // Format the application data
    const formattedApplication = {
      id: application.id,
      status: application.status,
      appliedDate: application.created_at,
      updatedDate: application.updated_at,
      resumeUrl: application.resume,
      resumeFilename: application.resume ? application.resume.split('/').pop() : null,
      videoUrl: application.video_url,
      coverLetter: application.cover_letter,
      job: {
        id: application.job_id,
        title: application.title,
        company: application.company,
        location: application.location,
        description: application.description,
        requirements: application.requirements,
        jobType: application.job_type,
        salaryRange: application.salary_range
      }
    };
    
    res.json({ application: formattedApplication });
  });
});

// GET endpoint to fetch applications for a recruiter's jobs
router.get('/recruiter/:recruiterId', (req, res) => {
  const { recruiterId } = req.params;
  
  const query = `
    SELECT a.*, u.username, u.email, u.phone, j.title as job_title, j.company, j.location
    FROM applications a
    JOIN users u ON a.user_id = u.id
    JOIN jobs j ON a.job_id = j.id
    WHERE j.recruiter_id = ?
    ORDER BY a.created_at DESC
  `;
  
  db.query(query, [recruiterId], (err, results) => {
    if (err) {
      console.error('Error fetching recruiter applications:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch applications',
        error: err.message
      });
    }
    
    res.status(200).json({
      success: true,
      applications: results
    });
  });
});

// PUT endpoint to update application status
router.put('/:applicationId/status', (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body;
  
  if (!status || !['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status value'
    });
  }
  
  const query = 'UPDATE applications SET status = ?, updated_at = NOW() WHERE id = ?';
  
  db.query(query, [status, applicationId], (err, results) => {
    if (err) {
      console.error('Error updating application status:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to update application status',
        error: err.message
      });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Application status updated successfully'
    });
  });
});

export default router;
