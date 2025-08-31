// Vercel serverless function to handle PayPal P2P payment success returns
// Updated for item payment support
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
    console.log('PayPal success - Query params:', req.query);
    
    const { token, PayerID, transactionId } = req.query;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Missing PayPal order token' });
    }

    // Extract transaction ID from the query or use a default
    const finalTransactionId = transactionId || 'unknown';
    
    // Create deep link URL for our app
    const redirectUrl = `campuslife://paypal-return?transactionId=${finalTransactionId}&orderId=${token}&payerID=${PayerID}&status=success`;
    
    console.log('Redirecting to app:', redirectUrl);
    
    // Create HTML page that redirects to app
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Successful - Campus Life</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
            .success { 
              color: #10b981; 
              margin-bottom: 20px; 
              font-size: 48px;
            }
            .title {
              color: #111827;
              margin-bottom: 10px;
              font-size: 24px;
              font-weight: bold;
            }
            .description {
              color: #6b7280;
              margin-bottom: 30px;
              font-size: 16px;
              line-height: 1.5;
            }
            .button {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 18px 36px;
              text-decoration: none;
              border-radius: 12px;
              font-weight: bold;
              display: inline-block;
              margin: 10px 0;
              font-size: 16px;
              transition: transform 0.2s;
              border: none;
              cursor: pointer;
              width: 200px;
            }
            .button:hover {
              transform: translateY(-2px);
            }
            .countdown {
              color: #9ca3af;
              font-size: 14px;
              margin-top: 20px;
            }
            .status {
              background: #f0fdf4;
              border: 1px solid #10b981;
              border-radius: 8px;
              padding: 16px;
              margin: 20px 0;
              color: #059669;
            }
            .debug {
              background: #f3f4f6;
              border-radius: 8px;
              padding: 12px;
              margin: 20px 0;
              font-size: 12px;
              color: #6b7280;
              text-align: left;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">🎉</div>
            <h1 class="title">Payment Completed!</h1>
            <div class="status">
              <strong>PayPal Payment Successful</strong><br>
              Your payment has been processed successfully.
            </div>
            <p class="description">
              You will be automatically redirected to Campus Life to complete the verification process.
            </p>
            <button onclick="openApp()" class="button">Return to Campus Life</button>
            <p class="countdown">Auto-redirecting in <span id="countdown">3</span> seconds...</p>
            
            <div class="debug">
              <strong>Debug Info:</strong><br>
              Transaction ID: ${finalTransactionId}<br>
              Order ID: ${token}<br>
              Payer ID: ${PayerID || 'N/A'}
            </div>
          </div>
          <script>
            let countdown = 3;
            const countdownElement = document.getElementById('countdown');
            const redirectUrl = '${redirectUrl}';
            
            function openApp() {
              console.log('Attempting to open app with URL:', redirectUrl);
              
              // Multiple redirect attempts for better compatibility
              try {
                window.location.href = redirectUrl;
              } catch(e) {
                console.log('First redirect attempt failed:', e);
              }
              
              // Fallback attempts
              setTimeout(() => {
                try {
                  window.location.assign(redirectUrl);
                } catch(e) {
                  console.log('Second redirect attempt failed:', e);
                }
              }, 500);
              
              setTimeout(() => {
                try {
                  window.open(redirectUrl, '_self');
                } catch(e) {
                  console.log('Third redirect attempt failed:', e);
                }
              }, 1000);
            }
            
            // Countdown timer
            const timer = setInterval(() => {
              countdown--;
              countdownElement.textContent = countdown;
              
              if (countdown <= 0) {
                clearInterval(timer);
                openApp();
              }
            }, 1000);
            
            // Immediate redirect attempt for mobile browsers
            if (navigator.userAgent.match(/iPhone|iPad|Android/i)) {
              console.log('Mobile browser detected, attempting immediate redirect');
              setTimeout(openApp, 1500);
            }
          </script>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);

  } catch (error) {
    console.error('PayPal success handler error:', error);
    
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head><title>Payment Processing Error - Campus Life</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px; background: #fee2e2;">
          <h1 style="color: #dc2626;">❌ Redirect Error</h1>
          <p>Your payment was processed, but there was an issue redirecting back to the app.</p>
          <p style="font-size: 14px; color: #6b7280;">Please open Campus Life manually and check your payment status.</p>
          <button onclick="window.location.href='campuslife://paypal-return?error=redirect_failed'" 
                 style="background: #ef4444; color: white; padding: 15px 30px; border: none; border-radius: 10px; cursor: pointer;">
            Try Opening App
          </button>
        </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.status(500).send(errorHtml);
  }
};