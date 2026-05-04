require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

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
app.use(express.json());

// Routes
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/jobs',         require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/seed',         require('./routes/seed'));

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
