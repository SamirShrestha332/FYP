import express from 'express';
import { db } from '../config/db.js';

const router = express.Router();

// Store payment data
router.post('/store', async (req, res) => {
  try {
    const { transaction_id, recruiter_id, amount, plan_type, payment_method, status } = req.body;
    
    console.log('Received payment data:', req.body);
    
    // Insert payment record
    const query = `
      INSERT INTO payments 
      (
        recruiter_id, 
        transaction_id, 
        amount, 
        plan_type, 
        payment_method, 
        status, 
        created_at, 
        updated_at
      ) 
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    db.query(
      query, 
      [recruiter_id, transaction_id, amount, plan_type, payment_method, status], 
      (err, result) => {
        if (err) {
          console.error('Payment insert error:', err);
          return res.status(500).json({ success: false, message: 'Database error', error: err.message });
        }
        
        return res.json({ success: true, message: 'Payment data saved successfully' });
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
    const { recruiter_id, plan, expiry_date, is_active } = req.body;
    
    console.log('Received subscription data:', req.body);
    
    // Insert subscription record
    const query = `
      INSERT INTO recruiter_subscriptions 
      (
        recruiter_id, 
        plan, 
        expiry_date, 
        is_active, 
        created_at, 
        updated_at
      ) 
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;
    
    db.query(
      query, 
      [recruiter_id, plan, expiry_date, is_active], 
      (err, result) => {
        if (err) {
          console.error('Subscription insert error:', err);
          return res.status(500).json({ success: false, message: 'Database error', error: err.message });
        }
        
        return res.json({ success: true, message: 'Subscription data saved successfully' });
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
    db.query(
      'SELECT * FROM recruiter_subscriptions WHERE recruiter_id = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1',
      [recruiterId],
      (err, results) => {
        if (err) {
          console.error('Error checking recruiter plan:', err);
          return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
          return res.status(200).json({ hasPlan: false });
        }

        const plan = results[0];

        // Check if plan has expired
        const today = new Date();
        const expiryDate = new Date(plan.expiry_date);

        if (expiryDate < today) {
          // Update plan to inactive
          db.query(
            'UPDATE recruiter_subscriptions SET is_active = 0 WHERE id = ?',
            [plan.id],
            (updateErr) => {
              if (updateErr) {
                console.error('Error updating expired plan:', updateErr);
              }
            }
          );
          return res.status(200).json({ hasPlan: false, expired: true });
        }

        return res.status(200).json({ hasPlan: true, plan });
      }
    );
  } catch (err) {
    console.error('Error checking recruiter plan:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
