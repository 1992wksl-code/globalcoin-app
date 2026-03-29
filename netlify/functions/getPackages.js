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
        name,
        coin_amount,
        price_krw,
        description,
        is_active,
        sort_order,
        is_popular,
        created_at,
        updated_at
      FROM coin_packages
      ORDER BY sort_order ASC, created_at ASC
    `);

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "패키지 조회 실패",
        detail: error.message,
      }),
    };
  }
};