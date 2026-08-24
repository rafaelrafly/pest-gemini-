const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://pest_user:pest_password@localhost:5432/pest_operations'
});

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        nama VARCHAR(150) NOT NULL,
        jabatan VARCHAR(100),
        ktp VARCHAR(50),
        alamat TEXT,
        profile_picture TEXT,
        status_account VARCHAR(20) DEFAULT 'Active',
        leave_entitlement INT DEFAULT 12,
        remaining_leave INT DEFAULT 12,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS permissions (
        id UUID PRIMARY KEY,
        module VARCHAR(50) NOT NULL,
        action VARCHAR(50) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS user_permissions (
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
        is_allowed BOOLEAN DEFAULT TRUE,
        PRIMARY KEY (user_id, permission_id)
      );

      CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY,
        nama VARCHAR(150) NOT NULL,
        company_name VARCHAR(150) NOT NULL,
        contact_person VARCHAR(100),
        phone VARCHAR(50),
        email VARCHAR(150),
        alamat TEXT,
        maps_location TEXT,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        category VARCHAR(50),
        contract_start DATE,
        contract_end DATE,
        status VARCHAR(20) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY,
        customer_id UUID REFERENCES customers(id),
        assigned_by UUID REFERENCES users(id),
        date DATE NOT NULL,
        time TIME NOT NULL,
        sasaran_pekerjaan TEXT,
        deskripsi TEXT,
        status VARCHAR(30) DEFAULT 'PENDING',
        deadline TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS service_reports (
        id UUID PRIMARY KEY,
        task_id UUID REFERENCES tasks(id),
        customer_id UUID REFERENCES customers(id),
        user_id UUID REFERENCES users(id),
        report_number VARCHAR(50) UNIQUE NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        scope_of_areas TEXT,
        pest_findings JSONB,
        inspection_notes TEXT,
        treatments JSONB,
        recommendations TEXT,
        technician_signature TEXT,
        client_signature TEXT,
        status VARCHAR(30) DEFAULT 'Submitted',
        photos JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        action VARCHAR(100),
        module VARCHAR(50),
        record_id UUID,
        ip VARCHAR(50),
        device TEXT,
        old_value TEXT,
        new_value TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Database tables initialized successfully.");
  } catch (err) {
    console.error("Database initialization error:", err);
  }
};

module.exports = { pool, initDB };
