const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

exports.handler = async () => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM coin_requests
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
        error: "전체 구매내역 조회 실패",
        detail: error.message,
      }),
    };
  }
};