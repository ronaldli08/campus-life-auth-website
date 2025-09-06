// Run this in Node.js to create test tokens in Firebase
// npm install firebase-admin first

const admin = require('firebase-admin');

// Initialize Firebase Admin (replace with your service account key)
const serviceAccount = require('./path-to-your-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'campus-life-b0fd3'
});

const db = admin.firestore();

async function createTestTokens() {
  try {
    // Create email verification test token
    const emailToken = 'test-email-verification-' + Date.now();
    await db.collection('verification_tokens').doc(emailToken).set({
      type: 'email_verification',
      user_id: 'test-user-123',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      used: false,
      created_at: new Date()
    });

    // Create password reset test token  
    const resetToken = 'test-password-reset-' + Date.now();
    await db.collection('verification_tokens').doc(resetToken).set({
      type: 'password_reset',
      user_id: 'test-user-123',
      expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      used: false,
      created_at: new Date()
    });

    console.log('✅ Test tokens created!');
    console.log(`📧 Email verification: https://your-domain.vercel.app/verify/email_verification/${emailToken}`);
    console.log(`🔒 Password reset: https://your-domain.vercel.app/verify/password_reset/${resetToken}`);
    
    // Create test user document
    await db.collection('users').doc('test-user-123').set({
      email: 'test@example.com',
      full_name: 'Test User',
      email_verified: false,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    console.log('👤 Test user created: test-user-123');

  } catch (error) {
    console.error('❌ Error creating test tokens:', error);
  }
}

createTestTokens();