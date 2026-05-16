require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/users',    require('./routes/users'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/api/requests', require('./routes/requests'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\nPurchase Approval API running on http://localhost:${PORT}\n`);
  console.log('Demo accounts:');
  console.log('  Admin:       admin@company.com   / admin123');
  console.log('  CEO:         ceo@company.com     / password123');
  console.log('  Dept Head:   depthead@company.com / password123');
  console.log('  Manager:     manager@company.com  / password123');
  console.log('  Employee:    alice@company.com    / password123\n');
});
