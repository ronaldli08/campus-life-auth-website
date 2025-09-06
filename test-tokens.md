# Test Verification Screens

## Quick Test URLs - Ready to Use!

### Email Verification
- **Invalid token (error state):** `https://campus-life-auth-website.vercel.app/verify/email_verification/invalid-token`
- **Test loading state:** Add `?slow=true` to any URL to simulate slow loading

### Password Reset  
- **Invalid token (error state):** `https://campus-life-auth-website.vercel.app/verify/password_reset/invalid-token`

### PayPal Success
- **Success state:** `https://campus-life-auth-website.vercel.app/api/paypal-success?token=test-order-123&PayerID=test-payer&transactionId=test-txn-456`

### PayPal Cancel
- **Cancel state:** `https://campus-life-auth-website.vercel.app/api/paypal-cancel?token=test-order-123`

## Firebase Console Method (for valid tokens)

1. Go to Firebase Console → Firestore
2. Create a document in `verification_tokens` collection:
   ```json
   {
     "type": "email_verification",
     "user_id": "test-user-123",
     "expires_at": "2024-12-31T23:59:59Z",
     "used": false
   }
   ```
3. Use the document ID as your token in the URL

## Browser DevTools Testing

Add this to browser console to simulate different states:
```javascript
// Simulate loading state
document.getElementById('loading-state').classList.remove('hidden');

// Simulate success state  
document.getElementById('success-state').classList.remove('hidden');
document.getElementById('loading-state').classList.add('hidden');

// Simulate error state
document.getElementById('error-state').classList.remove('hidden');  
document.getElementById('loading-state').classList.add('hidden');
```