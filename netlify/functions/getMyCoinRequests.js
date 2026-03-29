const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

exports.handler = async (event) => {
  try {
    const userId = event.queryStringParameters?.userId;

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "userId가 없습니다." }),
      };
    }

    const result = await pool.query(
      `
      SELECT *
      FROM coin_requests
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [userId]
    );

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "구매내역 조회 실패",
        detail: error.message,
      }),
    };
  }
};