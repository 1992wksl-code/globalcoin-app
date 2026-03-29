const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { userId, rejectionReason, processedBy } = JSON.parse(event.body);

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "userId가 없습니다." }),
      };
    }

    const result = await pool.query(
      `
      UPDATE members
      SET status = 'REJECTED',
          rejection_reason = $2,
          processed_at = $3,
          processed_by = $4
      WHERE user_id = $1
      RETURNING *
      `,
      [userId, rejectionReason || "", Date.now(), processedBy || null]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "회원 반려 완료",
        member: result.rows[0],
      }),
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