// Activity logger middleware demonstrating Node.js fs.appendFile callback (Module 6)
const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '..', 'logs');
const logFile = path.join(logDir, 'activity.log');

// Ensures logs folder exists without throwing
function ensureLogDir() {
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  } catch (e) {
    // Ignore folder creation errors in restricted environments
  }
}

ensureLogDir();

// Logs request details asynchronously to activity.log
function activityLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)\n`;

    // Asynchronous file append using Node.js callback pattern (Module 6 syllabus)
    try {
      ensureLogDir();
      fs.appendFile(logFile, logLine, 'utf8', () => {
        // Logging error is safely ignored to never break requests
      });
    } catch (e) {
      // Ignore synchronous write errors
    }
  });
  next();
}

module.exports = activityLogger;
