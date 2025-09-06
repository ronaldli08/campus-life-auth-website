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
    
    const { token, PayerID, transactionId, paymentId } = req.query;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Missing PayPal order token' });
    }

    // Extract transaction ID from the query, paymentId, or use a default
    const finalTransactionId = transactionId || paymentId || 'unknown';
    
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
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background-color: #f8fafc;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0;
              padding: 24px;
              color: #1e293b;
            }
            .container {
              background: #ffffff;
              padding: 40px;
              border-radius: 16px;
              text-align: center;
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
              border: 1px solid #e2e8f0;
              max-width: 500px;
              width: 100%;
            }
            .logo {
              width: 80px;
              height: 80px;
              background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
              border-radius: 16px;
              margin: 0 auto 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 900;
              font-size: 28px;
              box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
            }
            .title {
              color: #1e293b;
              margin-bottom: 8px;
              font-size: 32px;
              font-weight: 900;
              letter-spacing: -1px;
            }
            .description {
              color: #64748b;
              margin-bottom: 24px;
              font-size: 16px;
              font-weight: 500;
              line-height: 1.5;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
              color: white;
              padding: 16px 32px;
              text-decoration: none;
              border-radius: 25px;
              font-weight: 600;
              font-size: 16px;
              margin: 16px 8px;
              transition: all 0.2s ease;
              border: none;
              cursor: pointer;
              box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3);
            }
            .button:hover {
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
              transform: translateY(-2px);
              box-shadow: 0 6px 16px rgba(96, 165, 250, 0.4);
            }
            .button:active {
              transform: translateY(0);
              box-shadow: 0 2px 8px rgba(96, 165, 250, 0.3);
            }
            .countdown {
              color: #60a5fa;
              font-size: 14px;
              font-weight: 700;
              margin-top: 16px;
              background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            .status {
              background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
              border: 2px solid #d1fae5;
              border-radius: 16px;
              padding: 24px;
              margin: 24px 0;
              color: #10b981;
              font-weight: 500;
            }
            .status-title {
              font-size: 24px;
              font-weight: 800;
              margin-bottom: 8px;
            }
            .debug {
              background: #f1f5f9;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 16px;
              margin: 20px 0;
              font-size: 12px;
              color: #64748b;
              text-align: left;
              font-weight: 500;
            }
            @media (max-width: 480px) {
              body { padding: 16px; }
              .container { padding: 24px; }
              .title { font-size: 28px; }
              .logo { width: 56px; height: 56px; font-size: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">CL</div>
            <h1 class="title">Payment Completed</h1>
            <div class="status">
              <div class="status-title">PayPal Payment Successful</div>
              <div>Your payment has been processed successfully</div>
            </div>
            <p class="description">
              You will be automatically redirected to Campus Life to complete the verification process.
            </p>
            <button onclick="openApp()" class="button">Return to Campus Life</button>
            <p class="countdown">Auto-redirecting in <span id="countdown">3</span> seconds</p>
            
            <div class="debug">
              <strong>Debug Information:</strong><br>
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
        <head>
          <title>Payment Processing Error - Campus Life</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background-color: #f8fafc;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0;
              padding: 24px;
              color: #1e293b;
            }
            .container {
              background: #ffffff;
              padding: 40px;
              border-radius: 16px;
              text-align: center;
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
              border: 1px solid #e2e8f0;
              max-width: 500px;
              width: 100%;
            }
            .logo {
              width: 80px;
              height: 80px;
              background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);
              border-radius: 16px;
              margin: 0 auto 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 900;
              font-size: 28px;
              box-shadow: 0 4px 12px rgba(248, 113, 113, 0.3);
            }
            .title {
              color: #1e293b;
              margin-bottom: 8px;
              font-size: 32px;
              font-weight: 900;
              letter-spacing: -1px;
            }
            .error-message {
              background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
              border: 2px solid #fecaca;
              border-radius: 16px;
              padding: 24px;
              margin: 24px 0;
              color: #dc2626;
              font-weight: 500;
              font-size: 16px;
            }
            .description {
              color: #64748b;
              margin-bottom: 24px;
              font-size: 16px;
              font-weight: 500;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);
              color: white;
              padding: 16px 32px;
              border-radius: 25px;
              font-weight: 600;
              font-size: 16px;
              border: none;
              cursor: pointer;
              transition: all 0.2s ease;
              text-decoration: none;
              box-shadow: 0 4px 12px rgba(248, 113, 113, 0.3);
            }
            .button:hover {
              background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
              transform: translateY(-2px);
              box-shadow: 0 6px 16px rgba(248, 113, 113, 0.4);
            }
            .button:active {
              transform: translateY(0);
              box-shadow: 0 2px 8px rgba(248, 113, 113, 0.3);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">!</div>
            <h1 class="title">Redirect Error</h1>
            <div class="error-message">
              Your payment was processed, but there was an issue redirecting back to the app.
            </div>
            <p class="description">Please open Campus Life manually and check your payment status.</p>
            <button onclick="window.location.href='campuslife://paypal-return?error=redirect_failed'" class="button">
              Try Opening App
            </button>
          </div>
        </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.status(500).send(errorHtml);
  }
};