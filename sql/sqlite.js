/**
 * DB adapter
 *
 * Default: PostgreSQL (pg)
 * Optional legacy: SQLite (sqlite3) via DB_CLIENT=sqlite
 *
 * This file keeps the old require path (./sql/sqlite.js) so the existing codebase
 * continues to work while we migrate gradually.
 */

require('dotenv').config();

const DB_CLIENT = (process.env.DB_CLIENT || 'postgres').toLowerCase();

// --- Shared helpers ---------------------------------------------------------

/** Convert sqlite-style positional placeholders (?) to postgres ($1, $2, ...) */
function qmarkToDollar(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

function createDb() {
  if (DB_CLIENT === 'sqlite') {
    // ---- Legacy SQLite path ------------------------------------------------
    // NOTE: kept for backwards compatibility / quick local runs
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database(process.env.SQLITE_PATH || './mydatabase.db', (err) => {
      if (err) console.error(err.message);
      else console.log('✅ Connected to SQLite database.');
    });

    // Promise helpers (used in some parts of the code)
    db.query = (sql, params = []) => new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, changes: this.changes });
      });
    });
    db.getRow = (sql, params = []) => new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
    });
    db.getAllRows = (sql, params = []) => new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
    });

    process.on('SIGINT', () => {
      db.close(() => process.exit(0));
    });

    return db;
  }

  // ---- PostgreSQL path ------------------------------------------------------
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // In many managed DBs, SSL is required. Allow toggling.
    ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
    max: Number(process.env.PG_POOL_MAX || 20),
  });

  const db = {
    // sqlite compatible API
    serialize(fn) {
      // SQLite runs queries sequentially in serialize; in PG we just execute the fn.
      fn();
    },

    run(sql, params = [], cb) {
      const pgSql = qmarkToDollar(sql);
      pool
        .query(pgSql, params)
        .then((result) => {
          if (typeof cb === 'function') {
            // emulate sqlite 'this'
            const ctx = {
              lastID: result?.rows?.[0]?.id,
              changes: result.rowCount,
            };
            cb.call(ctx, null);
          }
        })
        .catch((err) => {
          if (typeof cb === 'function') cb(err);
          else console.error(err);
        });
    },

    get(sql, params = [], cb) {
      const pgSql = qmarkToDollar(sql);
      pool
        .query(pgSql, params)
        .then((result) => {
          const row = result.rows[0];
          cb(null, row);
        })
        .catch((err) => cb(err));
    },

    all(sql, params = [], cb) {
      const pgSql = qmarkToDollar(sql);
      pool
        .query(pgSql, params)
        .then((result) => cb(null, result.rows))
        .catch((err) => cb(err));
    },

    // Promise helpers
    query(sql, params = []) {
      const pgSql = qmarkToDollar(sql);
      return pool.query(pgSql, params).then((r) => ({ id: r?.rows?.[0]?.id, changes: r.rowCount, rows: r.rows }));
    },
    getRow(sql, params = []) {
      const pgSql = qmarkToDollar(sql);
      return pool.query(pgSql, params).then((r) => r.rows[0]);
    },
    getAllRows(sql, params = []) {
      const pgSql = qmarkToDollar(sql);
      return pool.query(pgSql, params).then((r) => r.rows);
    },
    async close() {
      await pool.end();
    },
    _pool: pool,
  };

  // graceful shutdown
  const shutdown = async () => {
    try {
      await pool.end();
    } catch {}
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  console.log('✅ Connected to PostgreSQL database.');
  return db;
}

module.exports = createDb();
