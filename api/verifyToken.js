// Vercel serverless function to verify email tokens
// Using REST API approach to avoid Firebase SDK issues

const PROJECT_ID = "campus-life-b0fd3";

module.exports = async function handler(req, res) {
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

    console.log('Received verification request:', { token, type });
    
    // Call Firebase Cloud Function to verify token
    const firebaseEndpoint = type === 'email_verification' 
      ? 'https://us-central1-campus-life-b0fd3.cloudfunctions.net/verifyEmailHttp'
      : 'https://us-central1-campus-life-b0fd3.cloudfunctions.net/resetPasswordHttp';
    
    const firebaseResponse = await fetch(firebaseEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token })
    });

    const result = await firebaseResponse.json();
    
    if (result.success) {
      console.log('Verification successful:', result);
      return res.status(200).json({
        success: true,
        userId: result.userId,
        type: type,
        message: result.message || 'Verification successful'
      });
    } else {
      console.error('Firebase verification failed:', result.error);
      return res.status(400).json({
        success: false,
        error: result.error || 'Verification failed'
      });
    }

  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error during verification'
    });
  }
}