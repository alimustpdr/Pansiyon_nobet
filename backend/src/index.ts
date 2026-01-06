import express from 'express';
import cors from 'cors';
import path from 'path';
import { initializeDatabase, seedDefaultData } from './database/init.js';
import teachersRouter from './routes/teachers.js';
import academicYearsRouter from './routes/academicYears.js';
import settingsRouter from './routes/settings.js';
import dutiesRouter from './routes/duties.js';
import holidaysRouter from './routes/holidays.js';
import excusesRouter from './routes/excuses.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Veritabanı başlatma
initializeDatabase();
seedDefaultData();

// API Routes
app.use('/api/teachers', teachersRouter);
app.use('/api/academic-years', academicYearsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/duties', dutiesRouter);
app.use('/api/holidays', holidaysRouter);
app.use('/api/excuses', excusesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Static files (production)
const frontendPath = path.join(process.cwd(), '../frontend/dist');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║       PANSİYON NÖBET YÖNETİM SİSTEMİ                       ║
║       Server başlatıldı: http://localhost:${PORT}            ║
╚════════════════════════════════════════════════════════════╝
  `);
});
