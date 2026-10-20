require('dotenv').config();
if (!process.env.DATABASE_URL) {
  if (process.env.NODE_ENV === 'production') throw new Error('DATABASE_URL is required in production');
  process.env.DATABASE_URL = 'file:./dev.db';
}


const app = require('./app').default;

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});