// Vercel serverless function to handle PayPal P2P payment cancellations
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
    console.log('PayPal cancel - Query params:', req.query);
    
    const { token, transactionId } = req.query;
    
    // Extract transaction ID from the query or use a default
    const finalTransactionId = transactionId || 'unknown';
    
    // Create deep link URL for our app
    const redirectUrl = `campuslife://paypal-return?transactionId=${finalTransactionId}&orderId=${token}&status=cancelled`;
    
    console.log('Redirecting to app (cancelled):', redirectUrl);
    
    // Create HTML page that redirects to app
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Cancelled - Campus Life</title>
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
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
              border: 1px solid #e2e8f0;
              max-width: 400px;
              width: 100%;
            }
            .logo {
              width: 64px;
              height: 64px;
              background: #f59e0b;
              border-radius: 12px;
              margin: 0 auto 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 700;
              font-size: 24px;
            }
            .title {
              color: #1e293b;
              margin-bottom: 12px;
              font-size: 28px;
              font-weight: 900;
              letter-spacing: -0.025em;
            }
            .description {
              color: #64748b;
              margin-bottom: 24px;
              font-size: 16px;
              font-weight: 500;
              line-height: 1.5;
            }
            .button {
              background: #3b82f6;
              color: white;
              padding: 16px 24px;
              text-decoration: none;
              border-radius: 12px;
              font-weight: 600;
              font-size: 16px;
              display: inline-block;
              margin: 16px 0;
              transition: background-color 0.2s, transform 0.1s;
              border: none;
              cursor: pointer;
              width: 200px;
            }
            .button:hover {
              background: #2563eb;
              transform: translateY(-1px);
            }
            .countdown {
              color: #3b82f6;
              font-size: 14px;
              font-weight: 600;
              margin-top: 16px;
            }
            .status {
              background: #fffbeb;
              border: 2px solid #fbbf24;
              border-radius: 12px;
              padding: 20px;
              margin: 24px 0;
              color: #f59e0b;
              font-weight: 500;
            }
            .status-title {
              font-size: 16px;
              font-weight: 700;
              margin-bottom: 4px;
            }
            @media (max-width: 480px) {
              body { padding: 16px; }
              .container { padding: 24px; }
              .title { font-size: 24px; }
              .logo { width: 56px; height: 56px; font-size: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">CL</div>
            <h1 class="title">Payment Cancelled</h1>
            <div class="status">
              <div class="status-title">PayPal Payment Cancelled</div>
              <div>You cancelled the payment process</div>
            </div>
            <p class="description">
              No payment was processed. You can try again or return to Campus Life.
            </p>
            <button onclick="openApp()" class="button">Return to Campus Life</button>
            <p class="countdown">Auto-redirecting in <span id="countdown">3</span> seconds</p>
          </div>
          <script>
            let countdown = 3;
            const countdownElement = document.getElementById('countdown');
            const redirectUrl = '${redirectUrl}';
            
            function openApp() {
              console.log('Attempting to open app with URL:', redirectUrl);
              
              try {
                window.location.href = redirectUrl;
              } catch(e) {
                console.log('Redirect failed:', e);
              }
              
              setTimeout(() => {
                try {
                  window.location.assign(redirectUrl);
                } catch(e) {
                  console.log('Fallback redirect failed:', e);
                }
              }, 500);
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
            
            // Immediate redirect for mobile
            if (navigator.userAgent.match(/iPhone|iPad|Android/i)) {
              setTimeout(openApp, 1500);
            }
          </script>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);

  } catch (error) {
    console.error('PayPal cancel handler error:', error);
    
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error - Campus Life</title>
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
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
              border: 1px solid #e2e8f0;
              max-width: 400px;
              width: 100%;
            }
            .logo {
              width: 64px;
              height: 64px;
              background: #dc2626;
              border-radius: 12px;
              margin: 0 auto 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 700;
              font-size: 24px;
            }
            .title {
              color: #1e293b;
              margin-bottom: 12px;
              font-size: 24px;
              font-weight: 900;
            }
            .error-message {
              background: #fef2f2;
              border: 2px solid #fecaca;
              border-radius: 12px;
              padding: 20px;
              margin: 24px 0;
              color: #dc2626;
              font-weight: 500;
            }
            .button {
              background: #dc2626;
              color: white;
              padding: 16px 24px;
              border-radius: 12px;
              font-weight: 600;
              font-size: 16px;
              border: none;
              cursor: pointer;
              transition: background-color 0.2s;
            }
            .button:hover {
              background: #b91c1c;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">!</div>
            <h1 class="title">Error</h1>
            <div class="error-message">
              There was an issue processing the cancellation.
            </div>
            <button onclick="window.location.href='campuslife://paypal-return?error=cancel_failed'" class="button">
              Return to App
            </button>
          </div>
        </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.status(500).send(errorHtml);
  }
};