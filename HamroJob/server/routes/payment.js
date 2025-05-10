import express from 'express';
import { db } from '../config/db.js';

const router = express.Router();
console.log("changes 1")
// Store payment data
router.post('/store', async (req, res) => {
  try {
    const { transaction_id, recruiter_id, amount, plan_type, payment_method, status, job_posts_allowed, validity_days, expiry_date } = req.body;
    
    console.log('Received payment data:', req.body);
    
    // Check if a payment record already exists for this recruiter
    db.query(
      'SELECT id FROM payments WHERE recruiter_id = ?',
      [recruiter_id],
      (checkErr, checkResults) => {
        if (checkErr) {
          console.error('Payment check error:', checkErr);
          return res.status(500).json({ success: false, message: 'Database error', error: checkErr.message });
        }
        
        const payment_date = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
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
              payment_method, 
              status, 
              payment_date,
              job_posts_allowed,
              expiry_date,
              recruiter_id
            ], 
            (updateErr, updateResult) => {
              if (updateErr) {
                console.error('Payment update error:', updateErr);
                return res.status(500).json({ success: false, message: 'Database error', error: updateErr.message });
              }
              
              // Update recruiter subscription status
              db.query(
                'UPDATE recruiter SET status = "active" WHERE id = ?',
                [recruiter_id],
                (recruiterErr) => {
                  if (recruiterErr) {
                    console.error('Recruiter update error:', recruiterErr);
                  }
                }
              );
              
              return res.json({ success: true, message: 'Payment data updated successfully' });
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
              payment_method, 
              status, 
              payment_date,
              job_posts_allowed,
              expiry_date
            ], 
            (insertErr, insertResult) => {
              if (insertErr) {
                console.error('Payment insert error:', insertErr);
                return res.status(500).json({ success: false, message: 'Database error', error: insertErr.message });
              }
              
              // Update recruiter subscription status
              db.query(
                'UPDATE recruiter SET status = "active" WHERE id = ?',
                [recruiter_id],
                (recruiterErr) => {
                  if (recruiterErr) {
                    console.error('Recruiter update error:', recruiterErr);
                  }
                }
              );
              
              return res.json({ success: true, message: 'Payment data saved successfully' });
            }
          );
        }
      }
    );
  } catch (error) {
    console.error('Payment store error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Store subscription data
router.post('/subscription', async (req, res) => {
  try {
    const { recruiter_id, plan_type, expiry_date, is_active } = req.body;
    
    console.log('Received subscription data:', req.body);
    
    // Check if a subscription record already exists for this recruiter
    db.query(
      'SELECT id FROM recruiter_subscriptions WHERE recruiter_id = ?',
      [recruiter_id],
      (checkErr, checkResults) => {
        if (checkErr) {
          console.error('Subscription check error:', checkErr);
          return res.status(500).json({ success: false, message: 'Database error', error: checkErr.message });
        }
        
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
        if (checkResults.length > 0) {
          // Update existing subscription record
          const updateQuery = `
            UPDATE recruiter_subscriptions 
            SET 
              plan_type = ?,
              expiry_date = ?,
              is_active = ?,
              updated_at = ?
            WHERE recruiter_id = ?
          `;
          
          db.query(
            updateQuery, 
            [plan_type, expiry_date, is_active, now, recruiter_id], 
            (updateErr, updateResult) => {
              if (updateErr) {
                console.error('Subscription update error:', updateErr);
                return res.status(500).json({ success: false, message: 'Database error', error: updateErr.message });
              }
              
              // Add this code to update the recruiter status
              db.query(
                'UPDATE recruiter SET status = ? WHERE id = ?',
                [is_active ? 'active' : 'inactive', recruiter_id],
                (linkErr) => {
                  if (linkErr) {
                    console.error('Recruiter link error:', linkErr);
                  }
                }
              );
              
              return res.json({ success: true, message: 'Subscription data updated successfully' });
            }
          );
        } else {
          // Insert new subscription record
          const insertQuery = `
            INSERT INTO recruiter_subscriptions 
            (
              recruiter_id, 
              plan_type, 
              expiry_date, 
              is_active, 
              created_at, 
              updated_at
            ) 
            VALUES (?, ?, ?, ?, ?, ?)
          `;
          
          // In the subscription endpoint, you need to add code to update the recruiter status
          
          // Find this section in your subscription endpoint (around line 114-130)
          db.query(
            insertQuery, 
            [recruiter_id, plan_type, expiry_date, is_active, now, now], 
            (insertErr, insertResult) => {
              if (insertErr) {
                console.error('Subscription insert error:', insertErr);
                return res.status(500).json({ success: false, message: 'Database error', error: insertErr.message });
              }
              
              // Add this code to update the recruiter status
              db.query(
                'UPDATE recruiter SET status = ? WHERE id = ?',
                [is_active ? 'active' : 'inactive', recruiter_id],
                (linkErr) => {
                  if (linkErr) {
                    console.error('Recruiter link error:', linkErr);
                  }
                }
              );
              
              return res.json({ success: true, message: 'Subscription data saved successfully' });
            }
          );
        }
      }
    );
  } catch (error) {
    console.error('Subscription store error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get recruiter plan
router.get('/plan/:recruiterId', async (req, res) => {
  const { recruiterId } = req.params;

  try {
    // First check the payments table for the most recent payment
    db.query(
      'SELECT * FROM payments WHERE recruiter_id = ? ORDER BY payment_date DESC LIMIT 1',
      [recruiterId],
      (err, results) => {
        if (err) {
          console.error('Error checking recruiter payment:', err);
          return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
          return res.status(200).json({ hasPlan: false });
        }

        const payment = results[0];

        // Check if plan has expired
        const today = new Date();
        const expiryDate = new Date(payment.expiry_date);

        if (expiryDate < today) {
          // Update recruiter subscription status
          db.query(
            'UPDATE recruiter SET status = "inactive" WHERE id = ?',
            [recruiterId],
            (updateErr) => {
              if (updateErr) {
                console.error('Error updating recruiter status:', updateErr);
              }
            }
          );
          return res.status(200).json({ hasPlan: false, expired: true });
        }

        return res.status(200).json({ 
          hasPlan: true, 
          plan: {
            id: payment.id,
            plan_type: payment.plan_type,
            expiry_date: payment.expiry_date,
            job_posts_allowed: payment.job_posts_allowed,
            job_posts_used: payment.job_posts_used
          } 
        });
      }
    );
  } catch (err) {
    console.error('Error checking recruiter plan:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Add a payment webhook endpoint to handle eSewa callbacks
router.post('/payment-webhook', async (req, res) => {
  try {
    console.log('Payment webhook received:', req.body);
    
    const { oid, amt, refId, status } = req.body;
    
    if (!oid) {
      return res.status(400).json({ success: false, message: 'Missing transaction ID' });
    }
    
    // Find the payment record by transaction ID
    db.query(
      'SELECT * FROM payments WHERE transaction_id = ?',
      [oid],
      (err, results) => {
        if (err) {
          console.error('Error finding payment:', err);
          return res.status(500).json({ success: false, message: 'Database error' });
        }
        
        if (results.length === 0) {
          return res.status(404).json({ success: false, message: 'Payment not found' });
        }
        
        const payment = results[0];
        
        // Update payment status
        db.query(
          'UPDATE payments SET payment_status = ?, reference_id = ? WHERE transaction_id = ?',
          [status || 'completed', refId || '', oid],
          (updateErr) => {
            if (updateErr) {
              console.error('Error updating payment status:', updateErr);
              return res.status(500).json({ success: false, message: 'Error updating payment' });
            }
            
            // Update recruiter status
            db.query(
              'UPDATE recruiter SET status = "active" WHERE id = ?',
              [payment.recruiter_id],
              (recruiterErr) => {
                if (recruiterErr) {
                  console.error('Error updating recruiter status:', recruiterErr);
                }
                
                // Also update or create subscription record
                const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
                
                // Check if subscription exists
                db.query(
                  'SELECT id FROM recruiter_subscriptions WHERE recruiter_id = ?',
                  [payment.recruiter_id],
                  (subCheckErr, subCheckResults) => {
                    if (subCheckErr) {
                      console.error('Subscription check error:', subCheckErr);
                      return res.status(500).json({ success: false, message: 'Database error' });
                    }
                    
                    if (subCheckResults.length > 0) {
                      // Update existing subscription
                      db.query(
                        `UPDATE recruiter_subscriptions 
                         SET plan_type = ?, expiry_date = ?, is_active = 1, updated_at = ? 
                         WHERE recruiter_id = ?`,
                        [payment.plan_type, payment.expiry_date, now, payment.recruiter_id],
                        (subUpdateErr) => {
                          if (subUpdateErr) {
                            console.error('Subscription update error:', subUpdateErr);
                          }
                          
                          return res.status(200).json({ 
                            success: true, 
                            message: 'Payment processed and subscription updated successfully' 
                          });
                        }
                      );
                    } else {
                      // Create new subscription
                      db.query(
                        `INSERT INTO recruiter_subscriptions 
                         (recruiter_id, plan_type, expiry_date, is_active, created_at, updated_at)
                         VALUES (?, ?, ?, 1, ?, ?)`,
                        [payment.recruiter_id, payment.plan_type, payment.expiry_date, now, now],
                        (subInsertErr) => {
                          if (subInsertErr) {
                            console.error('Subscription insert error:', subInsertErr);
                          }
                          
                          return res.status(200).json({ 
                            success: true, 
                            message: 'Payment processed and subscription created successfully' 
                          });
                        }
                      );
                    }
                  }
                );
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error('Payment webhook error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});
export default router;
