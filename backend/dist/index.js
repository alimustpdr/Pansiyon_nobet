"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const init_js_1 = require("./database/init.js");
const teachers_js_1 = __importDefault(require("./routes/teachers.js"));
const academicYears_js_1 = __importDefault(require("./routes/academicYears.js"));
const settings_js_1 = __importDefault(require("./routes/settings.js"));
const duties_js_1 = __importDefault(require("./routes/duties.js"));
const holidays_js_1 = __importDefault(require("./routes/holidays.js"));
const excuses_js_1 = __importDefault(require("./routes/excuses.js"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Veritabanı başlatma
(0, init_js_1.initializeDatabase)();
(0, init_js_1.seedDefaultData)();
// API Routes
app.use('/api/teachers', teachers_js_1.default);
app.use('/api/academic-years', academicYears_js_1.default);
app.use('/api/settings', settings_js_1.default);
app.use('/api/duties', duties_js_1.default);
app.use('/api/holidays', holidays_js_1.default);
app.use('/api/excuses', excuses_js_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Static files (production)
const frontendPath = path_1.default.join(process.cwd(), '../frontend/dist');
app.use(express_1.default.static(frontendPath));
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path_1.default.join(frontendPath, 'index.html'));
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
//# sourceMappingURL=index.js.map