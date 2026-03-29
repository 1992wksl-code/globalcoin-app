const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

exports.handler = async () => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        user_id,
        name,
        email,
        role,
        status,
        is_active,
        is_password_changed,
        created_at
      FROM members
      WHERE role != 'user'
      ORDER BY created_at DESC
    `);

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "관리자 목록 조회 실패",
        detail: error.message,
      }),
    };
  }
};