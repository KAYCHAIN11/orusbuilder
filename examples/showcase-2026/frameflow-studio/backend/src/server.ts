require('dotenv').config();
if (!process.env.DATABASE_URL) {
  if (process.env.NODE_ENV === 'production') throw new Error('DATABASE_URL is required in production');
  process.env.DATABASE_URL = 'file:./dev.db';
}
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters');
if (process.env.NODE_ENV === 'production' && jwtSecret.includes('change-in-production')) throw new Error('JWT_SECRET must be replaced in production');

const app = require('./app').default;

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});