require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const app = express();

// Security headers
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

// Prevent NoSQL injection attacks
app.use(mongoSanitize());

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { message: 'Too many attempts. Try again in 15 minutes.' },
  standardHeaders: true, legacyHeaders: false,
});
app.use('/api/auth/login',    authLimiter);
app.use('/api/auth/register', authLimiter);

// Serverless-compatible MongoDB connection (cached across warm invocations)
let cachedConn = null;
async function connectDB() {
  if (cachedConn && mongoose.connection.readyState === 1) return;
  cachedConn = await mongoose.connect(
    process.env.MONGODB_URI || process.env.MONGODB_URL
  );
}

// Connect before every request (no-op if already connected)
app.use(async (req, res, next) => {
  try { await connectDB(); next(); }
  catch (err) { res.status(500).json({ message: 'DB connection failed' }); }
});

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '12mb' })); // allow base64 images

// Routes
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/jobs',          require('./routes/jobs'));
app.use('/api/applications',  require('./routes/applications'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/kyc',           require('./routes/kyc'));
app.use('/api/seed',          require('./routes/seed'));
app.use('/api/stats',         require('./routes/stats'));
app.use('/api/users',         require('./routes/users'));

app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date() }));

// Local dev — start server directly
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  connectDB()
    .then(() => app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`)))
    .catch(err => { console.error('DB failed:', err.message); process.exit(1); });
}

// Vercel serverless export
module.exports = app;
