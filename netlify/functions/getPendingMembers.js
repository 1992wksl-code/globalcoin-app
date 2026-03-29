const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

exports.handler = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "DATABASE_URL is missing" }),
      };
    }

    const result = await pool.query(`
      SELECT
        id,
        user_id,
        name,
        email,
        phone,
        bank_name,
        account_number,
        balance,
        total_paid_coins,
        total_used_coins,
        role,
        status,
        is_active,
        is_password_changed,
        rejection_reason,
        processed_at,
        processed_by,
        admin_note,
        created_at
      FROM members
      WHERE status = 'PENDING'
      ORDER BY id DESC
    `);

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "서버 오류",
        detail: error.message,
      }),
    };
  }
};