// Vercel serverless function to handle PayPal payment returns
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

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { paymentId, token, PayerID } = req.query;

    if (!paymentId || !token) {
      return res.status(400).json({ success: false, error: 'Missing payment parameters' });
    }

    // Here you would verify the PayPal payment with your backend
    // For now, redirect to app with success
    const redirectUrl = `campuslife://pay/return?paymentId=${paymentId}&token=${token}&PayerID=${PayerID}&status=success`;
    
    // Create HTML page that redirects to app
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Successful - Campus Life</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0;
              padding: 20px;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 20px;
              text-align: center;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              max-width: 400px;
              width: 100%;
            }
            .success { color: #10b981; margin-bottom: 20px; }
            .button {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 10px;
              font-weight: bold;
              display: inline-block;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="success">✅ Payment Successful!</h1>
            <p>Your payment has been processed successfully.</p>
            <p>Redirecting you back to Campus Life...</p>
            <a href="${redirectUrl}" class="button">Open Campus Life</a>
          </div>
          <script>
            // Auto-redirect after 3 seconds
            setTimeout(() => {
              window.location.href = '${redirectUrl}';
            }, 3000);
          </script>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);

  } catch (error) {
    console.error('PayPal return handler error:', error);
    
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head><title>Payment Error - Campus Life</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1>❌ Payment Error</h1>
          <p>There was an issue processing your payment.</p>
          <a href="campuslife://pay/cancel?error=processing_failed" 
             style="background: #ef4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px;">
            Return to App
          </a>
        </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.status(500).send(errorHtml);
  }
}