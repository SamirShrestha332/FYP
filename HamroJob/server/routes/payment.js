import express from 'express';
import { db } from '../config/db.js';
import { handleSubscription } from '../utils/subscription.js';

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
    console.error('Error getting recruiter plan:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add a payment webhook endpoint to handle eSewa callbacks
router.post('/payment-webhook', (req, res) => {
  console.log('Payment webhook received:', req.body);
  
  const { transaction_id, recruiter_id, amount, plan_type, payment_method, status, job_posts_allowed, validity_days, expiry_date } = req.body;
  
  // Ensure we have a transaction ID
  const finalTransactionId = transaction_id || `TXN-${Date.now()}`;
  console.log('Using transaction ID:', finalTransactionId);
  
  // Log all payment details for debugging
  console.log('Payment details:', {
    transaction_id: finalTransactionId,
    recruiter_id,
    amount,
    plan_type,
    payment_method,
    status,
    job_posts_allowed,
    validity_days,
    expiry_date
  });
  
  if (!recruiter_id) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  
  // Start a transaction to ensure data consistency
  db.beginTransaction((transactionErr) => {
    if (transactionErr) {
      console.error('Transaction start error:', transactionErr);
      return res.status(500).json({ success: false, message: 'Database error', error: transactionErr.message });
    }
    
    try {
      // First check if the recruiter exists
      db.query(
        'SELECT id, subscription_id FROM recruiter WHERE id = ?',
        [recruiter_id],
        (recruiterErr, recruiterResults) => {
          if (recruiterErr) {
            return db.rollback(() => {
              console.error('Recruiter check error:', recruiterErr);
              res.status(500).json({ success: false, message: 'Database error', error: recruiterErr.message });
            });
          }
          
          if (recruiterResults.length === 0) {
            return db.rollback(() => {
              console.error('Recruiter not found:', recruiter_id);
              res.status(404).json({ success: false, message: 'Recruiter not found' });
            });
          }
          
          const payment_date = new Date().toISOString().slice(0, 19).replace('T', ' ');
          
          // Check if payment record exists for this recruiter
          db.query(
            'SELECT id FROM payments WHERE recruiter_id = ? ORDER BY payment_date DESC LIMIT 1',
            [recruiter_id],
            (paymentCheckErr, paymentCheckResults) => {
              if (paymentCheckErr) {
                return db.rollback(() => {
                  console.error('Payment check error:', paymentCheckErr);
                  res.status(500).json({ success: false, message: 'Database error', error: paymentCheckErr.message });
                });
              }
              
              let paymentQuery, paymentParams;
              const existingPayment = paymentCheckResults.length > 0 ? paymentCheckResults[0] : null;
              
              if (existingPayment) {
                // Update existing payment record
                paymentQuery = `
                  UPDATE payments 
                  SET 
                    transaction_id = ?,
                    amount = ?,
                    plan_type = ?,
                    payment_method = ?,
                    status = ?,
                    payment_date = ?,
                    job_posts_allowed = ?,
                    job_posts_used = 0,
                    expiry_date = ?
                  WHERE id = ?
                `;
                
                paymentParams = [
                  finalTransactionId, 
                  amount, 
                  plan_type, 
                  payment_method, 
                  status, 
                  payment_date,
                  job_posts_allowed,
                  expiry_date,
                  existingPayment.id
                ];
                
                console.log('Updating payment record with transaction ID:', finalTransactionId);
              } else {
                // Insert new payment record
                paymentQuery = `
                  INSERT INTO payments (
                    recruiter_id, 
                    transaction_id, 
                    amount, 
                    plan_type, 
                    payment_method, 
                    status, 
                    payment_date,
                    job_posts_allowed,
                    job_posts_used,
                    expiry_date
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                
                paymentParams = [
                  recruiter_id, 
                  finalTransactionId, 
                  amount, 
                  plan_type, 
                  payment_method, 
                  status, 
                  payment_date,
                  job_posts_allowed,
                  0, // job_posts_used
                  expiry_date
                ];
                
                console.log('Inserting new payment record with transaction ID:', finalTransactionId);
              }
              
              console.log('Executing payment query:', paymentQuery);
              console.log('With parameters:', paymentParams);
              
              db.query(paymentQuery, paymentParams, (paymentErr, paymentResult) => {
                if (paymentErr) {
                  return db.rollback(() => {
                    console.error('Payment operation error:', paymentErr);
                    res.status(500).json({ success: false, message: 'Database error', error: paymentErr.message });
                  });
                }
                
                console.log('Payment query successful. Result:', paymentResult);
                
                // Get the payment ID - either from the insert or update operation
                const paymentId = existingPayment ? existingPayment.id : paymentResult.insertId;
                console.log('Payment ID to use as subscription reference:', paymentId);
                
                // Directly update the recruiter table with the payment ID as subscription_id
                db.query(
                  'UPDATE recruiter SET status = "active", subscription_id = ? WHERE id = ?',
                  [paymentId, recruiter_id],
                  (recruiterUpdateErr) => {
                    if (recruiterUpdateErr) {
                      return db.rollback(() => {
                        console.error('Recruiter update error:', recruiterUpdateErr);
                        res.status(500).json({ success: false, message: 'Database error', error: recruiterUpdateErr.message });
                      });
                    }
                    
                    // Commit the transaction
                    db.commit((commitErr) => {
                      if (commitErr) {
                        return db.rollback(() => {
                          console.error('Transaction commit error:', commitErr);
                          res.status(500).json({ success: false, message: 'Database error', error: commitErr.message });
                        });
                      }
                      
                      console.log('Successfully updated subscription for recruiter:', recruiter_id, 'using payment ID:', paymentId);
                      res.json({ 
                        success: true, 
                        message: 'Payment and subscription data processed successfully',
                        transaction_id: finalTransactionId
                      });
                    });
                  }
                );
              });
            }
          );
        }
      );
    } catch (innerErr) {
      db.rollback(() => {
        console.error('Inner transaction error:', innerErr);
        res.status(500).json({ success: false, message: 'Server error', error: innerErr.message });
      });
    }
  });
});



export default router;
