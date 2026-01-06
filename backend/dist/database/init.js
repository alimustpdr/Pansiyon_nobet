"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.initializeDatabase = initializeDatabase;
exports.seedDefaultData = seedDefaultData;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const dbPath = path_1.default.join(process.cwd(), 'data/pansiyon.db');
// Veritabanı bağlantısı
exports.db = new better_sqlite3_1.default(dbPath);
// WAL modu - daha iyi performans
exports.db.pragma('journal_mode = WAL');
// Tabloları oluştur
function initializeDatabase() {
    // Eğitim-Öğretim Yılı tablosu
    exports.db.exec(`
    CREATE TABLE IF NOT EXISTS academic_years (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      is_active INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
    // Öğretmen tablosu
    exports.db.exec(`
    CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tc_no TEXT UNIQUE,
      full_name TEXT NOT NULL,
      gender TEXT NOT NULL CHECK(gender IN ('ERKEK', 'KADIN')),
      branch TEXT,
      phone TEXT,
      email TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
    // Pansiyon ayarları tablosu
    exports.db.exec(`
    CREATE TABLE IF NOT EXISTS dormitory_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      academic_year_id INTEGER NOT NULL,
      dormitory_type TEXT NOT NULL CHECK(dormitory_type IN ('ERKEK', 'KIZ')),
      day_type TEXT NOT NULL CHECK(day_type IN ('HAFTA_ICI', 'CUMA', 'CUMARTESI', 'PAZAR')),
      duty_count INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
      UNIQUE(academic_year_id, dormitory_type, day_type)
    )
  `);
    // Tatil tablosu
    exports.db.exec(`
    CREATE TABLE IF NOT EXISTS holidays (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      academic_year_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      description TEXT,
      has_duty INTEGER DEFAULT 0,
      FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
      UNIQUE(academic_year_id, date)
    )
  `);
    // Öğretmen mazeret tablosu
    exports.db.exec(`
    CREATE TABLE IF NOT EXISTS teacher_excuses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id INTEGER NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      excuse_type TEXT NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacher_id) REFERENCES teachers(id)
    )
  `);
    // Nöbet kaydı tablosu
    exports.db.exec(`
    CREATE TABLE IF NOT EXISTS duty_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      academic_year_id INTEGER NOT NULL,
      teacher_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      day_type TEXT NOT NULL CHECK(day_type IN ('HAFTA_ICI', 'CUMA', 'CUMARTESI', 'PAZAR')),
      dormitory_type TEXT NOT NULL CHECK(dormitory_type IN ('ERKEK', 'KIZ')),
      slot_index INTEGER NOT NULL DEFAULT 0,
      is_auto_assigned INTEGER DEFAULT 1,
      is_manually_edited INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
      FOREIGN KEY (teacher_id) REFERENCES teachers(id),
      UNIQUE(academic_year_id, date, dormitory_type, slot_index)
    )
  `);
    // Okul ayarları tablosu
    exports.db.exec(`
    CREATE TABLE IF NOT EXISTS school_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      school_name TEXT NOT NULL DEFAULT 'Pansiyon',
      academic_year_id INTEGER,
      FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
    )
  `);
    // Varsayılan okul ayarları ekle
    const existingSettings = exports.db.prepare('SELECT COUNT(*) as count FROM school_settings').get();
    if (existingSettings.count === 0) {
        exports.db.prepare('INSERT INTO school_settings (school_name) VALUES (?)').run('Anadolu Lisesi Pansiyonu');
    }
    console.log('Veritabanı başarıyla başlatıldı.');
}
// Varsayılan veriler ekle (test için)
function seedDefaultData() {
    // Aktif eğitim-öğretim yılı var mı kontrol et
    const existingYear = exports.db.prepare('SELECT COUNT(*) as count FROM academic_years').get();
    if (existingYear.count === 0) {
        // 2025-2026 eğitim-öğretim yılı ekle
        const result = exports.db.prepare(`
      INSERT INTO academic_years (name, start_date, end_date, is_active)
      VALUES (?, ?, ?, ?)
    `).run('2025-2026', '2025-09-01', '2026-06-30', 1);
        const yearId = result.lastInsertRowid;
        // Varsayılan pansiyon ayarları ekle
        const settingsStmt = exports.db.prepare(`
      INSERT INTO dormitory_settings (academic_year_id, dormitory_type, day_type, duty_count)
      VALUES (?, ?, ?, ?)
    `);
        // Erkek pansiyonu ayarları
        settingsStmt.run(yearId, 'ERKEK', 'HAFTA_ICI', 3);
        settingsStmt.run(yearId, 'ERKEK', 'CUMA', 4);
        settingsStmt.run(yearId, 'ERKEK', 'CUMARTESI', 1);
        settingsStmt.run(yearId, 'ERKEK', 'PAZAR', 2);
        // Kız pansiyonu ayarları
        settingsStmt.run(yearId, 'KIZ', 'HAFTA_ICI', 2);
        settingsStmt.run(yearId, 'KIZ', 'CUMA', 3);
        settingsStmt.run(yearId, 'KIZ', 'CUMARTESI', 2);
        settingsStmt.run(yearId, 'KIZ', 'PAZAR', 1);
        console.log('Varsayılan eğitim-öğretim yılı ve ayarlar eklendi.');
    }
    // Örnek öğretmenler ekle
    const existingTeachers = exports.db.prepare('SELECT COUNT(*) as count FROM teachers').get();
    if (existingTeachers.count === 0) {
        const teacherStmt = exports.db.prepare(`
      INSERT INTO teachers (tc_no, full_name, gender, branch, phone, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
        // Erkek öğretmenler
        teacherStmt.run('11111111111', 'Ahmet YILMAZ', 'ERKEK', 'Matematik', '5551111111', 1);
        teacherStmt.run('22222222222', 'Mehmet KAYA', 'ERKEK', 'Fizik', '5552222222', 1);
        teacherStmt.run('33333333333', 'Ali DEMIR', 'ERKEK', 'Türk Dili', '5553333333', 1);
        teacherStmt.run('44444444444', 'Mustafa ÇELİK', 'ERKEK', 'Tarih', '5554444444', 1);
        teacherStmt.run('55555555555', 'Hasan ÖZTÜRK', 'ERKEK', 'Coğrafya', '5555555555', 1);
        teacherStmt.run('66666666666', 'İbrahim ARSLAN', 'ERKEK', 'Biyoloji', '5556666666', 1);
        // Kadın öğretmenler
        teacherStmt.run('77777777777', 'Ayşe YILDIZ', 'KADIN', 'İngilizce', '5557777777', 1);
        teacherStmt.run('88888888888', 'Fatma ŞAHIN', 'KADIN', 'Kimya', '5558888888', 1);
        teacherStmt.run('99999999999', 'Zeynep AYDOĞAN', 'KADIN', 'Edebiyat', '5559999999', 1);
        teacherStmt.run('10101010101', 'Elif KORKMAZ', 'KADIN', 'Matematik', '5550000000', 1);
        teacherStmt.run('12121212121', 'Merve GÜNEŞ', 'KADIN', 'Rehberlik', '5551212121', 1);
        console.log('Örnek öğretmenler eklendi.');
    }
}
//# sourceMappingURL=init.js.map