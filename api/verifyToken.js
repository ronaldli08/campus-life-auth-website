// Vercel serverless function to verify email tokens
// This replaces the need for a separate backend server

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';

// Initialize Firebase (use your config)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyC8j70Zk-rxngvd6eOHlrsQ0dIePKj4nks",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "campus-life-b0fd3.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "campus-life-b0fd3",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "campus-life-b0fd3.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "1028408297935",
  appId: process.env.FIREBASE_APP_ID || "1:1028408297935:web:45a5f47a3a2d14f7482aba",
};

// Initialize Firebase app only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { token, type } = req.body;

    if (!token || !type) {
      return res.status(400).json({ success: false, error: 'Missing token or type' });
    }

    // Get verification token from Firestore
    const tokenDoc = await getDoc(doc(db, 'verification_tokens', token));

    if (!tokenDoc.exists()) {
      return res.status(404).json({ success: false, error: 'Invalid token' });
    }

    const tokenData = tokenDoc.data();

    // Check if token is already used
    if (tokenData.used) {
      return res.status(400).json({ success: false, error: 'Token already used' });
    }

    // Check if token is expired
    if (tokenData.expires_at.toDate() < new Date()) {
      return res.status(400).json({ success: false, error: 'Token expired' });
    }

    // Check if token type matches
    if (tokenData.type !== type) {
      return res.status(400).json({ success: false, error: 'Invalid token type' });
    }

    // Mark token as used
    await updateDoc(doc(db, 'verification_tokens', token), { used: true });

    if (type === 'email_verification') {
      // Mark user as verified
      await updateDoc(doc(db, 'users', tokenData.user_id), {
        email_verified: true,
        updated_at: Timestamp.now()
      });

      // Also update profiles collection if it exists
      try {
        await updateDoc(doc(db, 'profiles', tokenData.user_id), {
          email_verified: true,
          updated_at: Timestamp.now()
        });
      } catch (profileError) {
        // Profile might not exist for parents, that's OK
        console.log('Profile update failed (might not exist):', profileError);
      }
    }

    return res.status(200).json({
      success: true,
      userId: tokenData.user_id,
      email: tokenData.email,
      type: tokenData.type
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error during verification'
    });
  }
}