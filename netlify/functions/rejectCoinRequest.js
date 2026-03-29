const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { requestId, adminNote, processedBy } = JSON.parse(event.body);

    if (!requestId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "requestId가 없습니다." }),
      };
    }

    const result = await pool.query(
      `
      UPDATE coin_requests
      SET
        status = 'REJECTED_MANUAL',
        admin_note = $2,
        processed_by = $3
      WHERE request_id = $1
      RETURNING *
      `,
      [requestId, adminNote || "", processedBy || null]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "구매 요청 취소 완료",
        request: result.rows[0],
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