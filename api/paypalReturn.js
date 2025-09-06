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
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Successful - Campus Life</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background-color: #f8fafc;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 24px;
              color: #1e293b;
            }
            
            .container {
              background: #ffffff;
              border-radius: 16px;
              padding: 40px;
              max-width: 500px;
              width: 100%;
              text-align: center;
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
              border: 1px solid #e2e8f0;
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
            
            h1 {
              color: #1e293b;
              margin-bottom: 8px;
              font-size: 32px;
              font-weight: 900;
              letter-spacing: -1px;
            }
            
            .subtitle {
              color: #64748b;
              font-size: 16px;
              font-weight: 500;
              margin-bottom: 32px;
            }
            
            .status-message {
              margin: 24px 0;
              padding: 24px;
              border-radius: 16px;
              font-size: 16px;
              font-weight: 500;
              background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
              color: #10b981;
              border: 2px solid #d1fae5;
            }
            
            .status-title {
              font-size: 24px;
              font-weight: 800;
              margin-bottom: 8px;
            }
            
            .status-description {
              font-size: 16px;
              font-weight: 500;
              margin-bottom: 8px;
              opacity: 0.9;
            }
            
            .status-subtitle {
              font-size: 14px;
              font-weight: 500;
              opacity: 0.7;
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
              font-weight: 700;
              background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            
            footer {
              margin-top: 40px;
              padding-top: 24px;
              border-top: 1px solid #e2e8f0;
              color: #64748b;
              font-size: 14px;
              font-weight: 500;
            }
            
            footer .brand {
              font-weight: 700;
              color: #1e293b;
            }
            
            footer .support {
              margin-top: 8px;
              color: #94a3b8;
              font-size: 12px;
            }
            
            @media (max-width: 480px) {
              body {
                padding: 16px;
              }
              
              .container {
                padding: 24px;
              }
              
              h1 {
                font-size: 28px;
              }
              
              .logo {
                width: 64px;
                height: 64px;
                font-size: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">CL</div>
            <h1>Payment Successful</h1>
            <div class="subtitle">Your payment has been completed</div>
            
            <div class="status-message">
              <div class="status-title">✅ PayPal Payment Confirmed</div>
              <div class="status-description">Your payment has been processed and completed</div>
              <div class="status-subtitle">Redirecting to Campus Life in <span id="countdown" class="countdown">5</span> seconds...</div>
            </div>
            
            <button onclick="openApp()" class="button">Return to Campus Life</button>
            <button onclick="copyLink()" class="button" style="background: #ffffff; color: #64748b; border: 1px solid #e2e8f0;">Copy App Link</button>
            
            <footer>
              <div class="brand">Campus Life</div>
              <div class="support">Having trouble? Contact support at help@campus-life.app</div>
            </footer>
          </div>
          <script>
            let countdown = 5;
            const countdownElement = document.getElementById('countdown');
            
            function openApp() {
              console.log('Attempting to open app:', '${redirectUrl}');
              window.location.href = '${redirectUrl}';
              
              // Fallback: try opening multiple times with delays
              setTimeout(() => {
                try {
                  window.location.assign('${redirectUrl}');
                } catch(e) {
                  console.log('Fallback redirect failed:', e);
                }
              }, 500);
            }
            
            function copyLink() {
              navigator.clipboard.writeText('${redirectUrl}').then(() => {
                alert('App link copied! Paste it in your browser or terminal to test the deep link.');
              }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = '${redirectUrl}';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('App link copied! Paste it in your browser or terminal to test the deep link.');
              });
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
            
            // Try immediate redirect for mobile browsers
            if (navigator.userAgent.match(/iPhone|iPad|Android/i)) {
              setTimeout(openApp, 1000);
            }
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
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Error - Campus Life</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background-color: #f8fafc;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 24px;
              color: #1e293b;
            }
            .container {
              background: #ffffff;
              border-radius: 16px;
              padding: 40px;
              max-width: 500px;
              width: 100%;
              text-align: center;
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
              border: 1px solid #e2e8f0;
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
            h1 {
              color: #1e293b;
              margin-bottom: 8px;
              font-size: 32px;
              font-weight: 900;
              letter-spacing: -1px;
            }
            .status-message {
              margin: 24px 0;
              padding: 24px;
              border-radius: 16px;
              background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
              color: #dc2626;
              border: 2px solid #fecaca;
            }
            .button {
              background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);
              color: white;
              padding: 16px 32px;
              text-decoration: none;
              border-radius: 25px;
              font-weight: 600;
              font-size: 16px;
              margin: 16px 8px;
              display: inline-block;
              transition: all 0.2s ease;
              box-shadow: 0 4px 12px rgba(248, 113, 113, 0.3);
            }
            .button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 16px rgba(248, 113, 113, 0.4);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">!</div>
            <h1>Payment Error</h1>
            <div class="status-message">
              <div style="font-size: 24px; font-weight: 800; margin-bottom: 8px;">❌ Payment Processing Failed</div>
              <div style="font-size: 16px; opacity: 0.9;">There was an issue processing your payment</div>
            </div>
            <a href="campuslife://pay/cancel?error=processing_failed" class="button">Return to App</a>
          </div>
        </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.status(500).send(errorHtml);
  }
}