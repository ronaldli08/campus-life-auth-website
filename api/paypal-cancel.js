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
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
            .cancelled { 
              color: #f59e0b; 
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
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
              background: #fffbeb;
              border: 1px solid #f59e0b;
              border-radius: 8px;
              padding: 16px;
              margin: 20px 0;
              color: #d97706;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="cancelled">⚠️</div>
            <h1 class="title">Payment Cancelled</h1>
            <div class="status">
              <strong>PayPal Payment Cancelled</strong><br>
              You cancelled the payment process.
            </div>
            <p class="description">
              No payment was processed. You can try again or return to Campus Life.
            </p>
            <button onclick="openApp()" class="button">Return to Campus Life</button>
            <p class="countdown">Auto-redirecting in <span id="countdown">3</span> seconds...</p>
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
        <head><title>Error - Campus Life</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1>❌ Error</h1>
          <p>There was an issue processing the cancellation.</p>
          <button onclick="window.location.href='campuslife://paypal-return?error=cancel_failed'" 
                 style="background: #ef4444; color: white; padding: 15px 30px; border: none; border-radius: 10px;">
            Return to App
          </button>
        </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.status(500).send(errorHtml);
  }
};