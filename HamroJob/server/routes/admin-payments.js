import express from 'express';
import { db } from '../config/db.js';

const router = express.Router();

// Get all payments with recruiter information
router.get('/payments', (req, res) => {
  try {
    const query = `
      SELECT 
        p.*,
        r.username as recruiter_name,
        r.email as recruiter_email
      FROM 
        payments p
      JOIN 
        recruiter r ON p.recruiter_id = r.id
      ORDER BY 
        p.payment_date DESC
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching payments:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Error fetching payments', 
          error: err.message 
        });
      }
      
      res.status(200).json({ 
        success: true, 
        payments: results 
      });
    });
  } catch (error) {
    console.error('Error in GET /payments:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Add a new payment (admin-initiated)
router.post('/payments/add', (req, res) => {
  try {
    const { 
      recruiter_email, 
      amount, 
      plan_type, 
      payment_method, 
      status, 
      job_posts_allowed, 
      validity_days, 
      expiry_date 
    } = req.body;
    
    // Validate required fields
    if (!recruiter_email || !amount || !plan_type || !job_posts_allowed || !validity_days || !expiry_date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    // First, get the recruiter ID from the email
    db.query(
      'SELECT id FROM recruiter WHERE email = ?',
      [recruiter_email],
      (recruiterErr, recruiterResults) => {
        if (recruiterErr) {
          console.error('Error finding recruiter:', recruiterErr);
          return res.status(500).json({ 
            success: false, 
            message: 'Database error', 
            error: recruiterErr.message 
          });
        }
        
        if (recruiterResults.length === 0) {
          return res.status(404).json({ 
            success: false, 
            message: 'Recruiter not found with the provided email' 
          });
        }
        
        const recruiter_id = recruiterResults[0].id;
        const transaction_id = 'ADMIN-' + Date.now();
        const payment_date = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
        // Check if a payment record already exists for this recruiter
        db.query(
          'SELECT id FROM payments WHERE recruiter_id = ?',
          [recruiter_id],
          (checkErr, checkResults) => {
            if (checkErr) {
              console.error('Payment check error:', checkErr);
              return res.status(500).json({ 
                success: false, 
                message: 'Database error', 
                error: checkErr.message 
              });
            }
            
            if (checkResults.length > 0) {
              // Update existing payment record
              const updateQuery = `
                UPDATE payments 
                SET 
                  transaction_id = ?,
                  amount = ?,
                  plan_type = ?,
                  payment_method = ?,
                  payment_status = ?,
                  payment_date = ?,
                  job_posts_allowed = ?,
                  job_posts_used = 0,
                  expiry_date = ?
                WHERE recruiter_id = ?
              `;
              
              db.query(
                updateQuery, 
                [
                  transaction_id, 
                  amount, 
                  plan_type, 
                  payment_method || 'admin', 
                  status || 'completed', 
                  payment_date,
                  job_posts_allowed,
                  expiry_date,
                  recruiter_id
                ], 
                (updateErr, updateResult) => {
                  if (updateErr) {
                    console.error('Payment update error:', updateErr);
                    return res.status(500).json({ 
                      success: false, 
                      message: 'Database error', 
                      error: updateErr.message 
                    });
                  }
                  
                  // Update recruiter subscription status
                  db.query(
                    'UPDATE recruiter SET status = "active" WHERE id = ?',
                    [recruiter_id],
                    (recruiterUpdateErr) => {
                      if (recruiterUpdateErr) {
                        console.error('Recruiter update error:', recruiterUpdateErr);
                      }
                    }
                  );
                  
                  return res.json({ 
                    success: true, 
                    message: 'Payment data updated successfully',
                    payment: {
                      id: checkResults[0].id,
                      transaction_id,
                      recruiter_id,
                      amount,
                      plan_type,
                      payment_method: payment_method || 'admin',
                      payment_status: status || 'completed',
                      payment_date,
                      job_posts_allowed,
                      expiry_date
                    }
                  });
                }
              );
            } else {
              // Insert new payment record
              const insertQuery = `
                INSERT INTO payments 
                (
                  recruiter_id, 
                  transaction_id, 
                  amount, 
                  plan_type, 
                  payment_method, 
                  payment_status, 
                  payment_date,
                  job_posts_allowed,
                  job_posts_used,
                  expiry_date
                ) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
              `;
              
              db.query(
                insertQuery, 
                [
                  recruiter_id, 
                  transaction_id, 
                  amount, 
                  plan_type, 
                  payment_method || 'admin', 
                  status || 'completed', 
                  payment_date,
                  job_posts_allowed,
                  expiry_date
                ], 
                (insertErr, insertResult) => {
                  if (insertErr) {
                    console.error('Payment insert error:', insertErr);
                    return res.status(500).json({ 
                      success: false, 
                      message: 'Database error', 
                      error: insertErr.message 
                    });
                  }
                  
                  // Update recruiter subscription status
                  db.query(
                    'UPDATE recruiter SET status = "active" WHERE id = ?',
                    [recruiter_id],
                    (recruiterUpdateErr) => {
                      if (recruiterUpdateErr) {
                        console.error('Recruiter update error:', recruiterUpdateErr);
                      }
                    }
                  );
                  
                  return res.json({ 
                    success: true, 
                    message: 'Payment data saved successfully',
                    payment: {
                      id: insertResult.insertId,
                      transaction_id,
                      recruiter_id,
                      amount,
                      plan_type,
                      payment_method: payment_method || 'admin',
                      payment_status: status || 'completed',
                      payment_date,
                      job_posts_allowed,
                      expiry_date
                    }
                  });
                }
              );
            }
          }
        );
      }
    );
  } catch (error) {
    console.error('Payment store error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Update payment status
router.put('/payments/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['pending', 'completed', 'failed', 'refunded'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status value' 
      });
    }
    
    db.query(
      'UPDATE payments SET payment_status = ? WHERE id = ?',
      [status, id],
      (err, result) => {
        if (err) {
          console.error('Error updating payment status:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Database error', 
            error: err.message 
          });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ 
            success: false, 
            message: 'Payment not found' 
          });
        }
        
        // If payment is marked as completed, update recruiter status to active
        if (status === 'completed') {
          db.query(
            'SELECT recruiter_id FROM payments WHERE id = ?',
            [id],
            (recruiterErr, recruiterResults) => {
              if (!recruiterErr && recruiterResults.length > 0) {
                const recruiter_id = recruiterResults[0].recruiter_id;
                
                db.query(
                  'UPDATE recruiter SET status = "active" WHERE id = ?',
                  [recruiter_id],
                  (updateErr) => {
                    if (updateErr) {
                      console.error('Error updating recruiter status:', updateErr);
                    }
                  }
                );
              }
            }
          );
        }
        
        res.status(200).json({ 
          success: true, 
          message: 'Payment status updated successfully' 
        });
      }
    );
  } catch (error) {
    console.error('Error in PUT /payments/:id/status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get payment statistics
router.get('/payments/stats', (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END) as total_revenue,
        SUM(CASE WHEN payment_status = 'completed' AND plan_type = 'basic' THEN amount ELSE 0 END) as basic_revenue,
        SUM(CASE WHEN payment_status = 'completed' AND plan_type = 'standard' THEN amount ELSE 0 END) as standard_revenue,
        SUM(CASE WHEN payment_status = 'completed' AND plan_type = 'premium' THEN amount ELSE 0 END) as premium_revenue,
        COUNT(*) as total_payments,
        COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as completed_payments,
        COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_payments
      FROM 
        payments
    `;
    
    db.query(statsQuery, (err, results) => {
      if (err) {
        console.error('Error fetching payment stats:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Error fetching payment statistics', 
          error: err.message 
        });
      }
      
      res.status(200).json({ 
        success: true, 
        stats: results[0] 
      });
    });
  } catch (error) {
    console.error('Error in GET /payments/stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

export default router;
