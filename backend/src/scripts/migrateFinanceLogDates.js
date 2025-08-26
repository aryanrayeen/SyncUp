// Migration script to convert FinanceLog.date from Date to string (YYYY-MM-DD)
import mongoose from 'mongoose';
import FinanceLog from '../model/FinanceLog.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/syncup';

async function migrateDates() {
  await mongoose.connect(MONGO_URI);
  const logs = await FinanceLog.find({});
  let updated = 0;
  for (const log of logs) {
    if (log.date instanceof Date) {
      const d = log.date;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      log.date = `${year}-${month}-${day}`;
      await log.save();
      updated++;
    }
  }
  console.log(`Migrated ${updated} FinanceLog documents.`);
  await mongoose.disconnect();
}

migrateDates().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
