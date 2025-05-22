import { db } from '../config/db.js';

/**
 * Check if a recruiter has an active subscription and available job posts
 * @param {number} recruiterId - The recruiter ID to check
 * @param {function} callback - Callback function with result
 */
export function checkSubscription(recruiterId, callback) {
  // First check if the recruiter exists and has a subscription_id
  db.query(
    `SELECT r.*, p.* 
     FROM recruiter r
     LEFT JOIN payments p ON r.subscription_id = p.id
     WHERE r.id = ?`,
    [recruiterId],
    (err, results) => {
      if (err) {
        return callback({ error: true, message: 'Database error', details: err.message });
      }
      
      if (results.length === 0) {
        return callback({ error: true, message: 'Recruiter not found.' });
      }
      
      const recruiter = results[0];
      
      // If no subscription found (subscription_id is null or no matching payment)
      if (!recruiter.subscription_id || !recruiter.plan_type) {
        // Check payments table directly as fallback
        db.query(
          'SELECT * FROM payments WHERE recruiter_id = ? ORDER BY payment_date DESC LIMIT 1',
          [recruiterId],
          (paymentErr, paymentResults) => {
            if (paymentErr) {
              return callback({ error: true, message: 'Database error', details: paymentErr.message });
            }
            
            if (paymentResults.length === 0) {
              return callback({ error: true, message: 'No active subscription found. Please purchase a subscription plan to post jobs.' });
            }
            
            const payment = paymentResults[0];
            
            // Check if plan has expired
            const today = new Date();
            const expiryDate = new Date(payment.expiry_date);
            
            if (expiryDate < today) {
              // Update recruiter status to inactive
              db.query(
                'UPDATE recruiter SET status = "inactive" WHERE id = ?',
                [recruiterId],
                () => {}
              );
              return callback({ error: true, message: 'Your subscription has expired. Please renew your plan to post jobs.' });
            }
            
            // Check if user has used all job posts
            if (payment.job_posts_allowed !== -1 && payment.job_posts_used >= payment.job_posts_allowed) {
              return callback({ error: true, message: 'You have used all your available job posts. Please upgrade your plan for more posts.' });
            }
            
            // Update the recruiter's subscription_id to point to this payment
            db.query(
              'UPDATE recruiter SET subscription_id = ? WHERE id = ?',
              [payment.id, recruiterId],
              () => {}
            );
            
            return callback({ error: false, payment });
          }
        );
      } else {
        // Subscription found via the payment record
        const payment = {
          id: recruiter.id,
          plan_type: recruiter.plan_type,
          expiry_date: recruiter.expiry_date,
          job_posts_allowed: recruiter.job_posts_allowed,
          job_posts_used: recruiter.job_posts_used
        };
        
        // Check if plan has expired
        const today = new Date();
        const expiryDate = new Date(payment.expiry_date);
        
        if (expiryDate < today) {
          // Update recruiter status to inactive
          db.query(
            'UPDATE recruiter SET status = "inactive" WHERE id = ?',
            [recruiterId],
            () => {}
          );
          return callback({ error: true, message: 'Your subscription has expired. Please renew your plan to post jobs.' });
        }
        
        // Check if user has used all job posts
        if (payment.job_posts_allowed !== -1 && payment.job_posts_used >= payment.job_posts_allowed) {
          return callback({ error: true, message: 'You have used all your available job posts. Please upgrade your plan for more posts.' });
        }
        
        return callback({ error: false, payment });
      }

    }
  );
}

/**
 * Increment job post count for a recruiter
 * @param {number} recruiterId - The recruiter ID
 * @param {function} callback - Callback function with result
 */
export function incrementJobPostCount(recruiterId, callback) {
  db.query(
    'UPDATE payments SET job_posts_used = job_posts_used + 1 WHERE recruiter_id = ?',
    [recruiterId],
    (err, result) => {
      if (err) {
        return callback({ error: true, message: 'Failed to update job post count', details: err.message });
      }
      return callback({ error: false, message: 'Job post count updated successfully' });
    }
  );
}

/**
 * Handle subscription updates during payment
 * @param {object} db - Database connection
 * @param {number} recruiterId - The recruiter ID
 * @param {string} planType - The subscription plan type
 * @param {string} expiryDate - The subscription expiry date
 * @param {object} res - Express response object
 */
export function handleSubscription(db, recruiterId, planType, expiryDate, res) {
  console.log('Handling subscription for recruiter:', recruiterId, 'with plan:', planType);
  
  // First check if the recruiter exists
  db.query(
    'SELECT id FROM recruiter WHERE id = ?',
    [recruiterId],
    (recruiterErr, recruiterResults) => {
      if (recruiterErr) {
        return db.rollback(() => {
          console.error('Recruiter check error:', recruiterErr);
          res.status(500).json({ success: false, message: 'Database error', error: recruiterErr.message });
        });
      }
      
      if (recruiterResults.length === 0) {
        return db.rollback(() => {
          console.error('Recruiter not found:', recruiterId);
          res.status(404).json({ success: false, message: 'Recruiter not found' });
        });
      }
      
      // Get the payment ID for this recruiter
      db.query(
        'SELECT id FROM payments WHERE recruiter_id = ?',
        [recruiterId],
        (paymentErr, paymentResults) => {
          if (paymentErr) {
            return db.rollback(() => {
              console.error('Payment check error:', paymentErr);
              res.status(500).json({ success: false, message: 'Database error', error: paymentErr.message });
            });
          }
          
          if (paymentResults.length === 0) {
            return db.rollback(() => {
              console.error('Payment record not found for recruiter:', recruiterId);
              res.status(404).json({ success: false, message: 'Payment record not found' });
            });
          }
          
          const paymentId = paymentResults[0].id;
          
          // Update the recruiter table to use the payment ID as the subscription reference
          db.query(
            'UPDATE recruiter SET status = "active", subscription_id = ? WHERE id = ?',
            [paymentId, recruiterId],
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
                
                console.log('Successfully updated subscription for recruiter:', recruiterId, 'using payment ID:', paymentId);
                res.json({ 
                  success: true, 
                  message: 'Payment and subscription data processed successfully' 
                });
              });
            }
          );
        }
      );
    }
  );
}

/**
 * Update the recruiter's subscription_id
 * @param {object} db - Database connection
 * @param {number} recruiterId - The recruiter ID
 * @param {number} subscriptionId - The subscription ID
 * @param {object} res - Express response object
 */
function updateRecruiterSubscription(db, recruiterId, subscriptionId, res) {
  db.query(
    'UPDATE recruiter SET status = "active" WHERE id = ?',
    [recruiterId],
    (updateErr) => {
      if (updateErr) {
        return db.rollback(() => {
          console.error('Recruiter update error:', updateErr);
          res.status(500).json({ success: false, message: 'Database error', error: updateErr.message });
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
        
        res.json({ 
          success: true, 
          message: 'Payment and subscription data processed successfully' 
        });
      });
    }
  );
}
