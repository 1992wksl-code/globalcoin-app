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

  const client = await pool.connect();

  try {
    const { requestId, processedBy } = JSON.parse(event.body);

    if (!requestId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "requestId가 없습니다." }),
      };
    }

    await client.query("BEGIN");

    const requestResult = await client.query(
      `
      SELECT *
      FROM coin_requests
      WHERE request_id = $1
      LIMIT 1
      `,
      [requestId]
    );

    if (requestResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "구매 요청을 찾을 수 없습니다." }),
      };
    }

    const request = requestResult.rows[0];

    if (request.status !== "WAITING_FOR_DEPOSIT") {
      await client.query("ROLLBACK");
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "이미 처리된 요청입니다." }),
      };
    }

    await client.query(
      `
      UPDATE members
      SET
        balance = balance + $2,
        total_paid_coins = total_paid_coins + $2
      WHERE user_id = $1
      `,
      [request.user_id, request.coin_amount]
    );

    const updatedRequest = await client.query(
      `
      UPDATE coin_requests
      SET
        status = 'COIN_DELIVERED',
        processed_by = $2
      WHERE request_id = $1
      RETURNING *
      `,
      [requestId, processedBy || null]
    );

    await client.query("COMMIT");

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "입금 승인 및 코인 지급 완료",
        request: updatedRequest.rows[0],
      }),
    };
  } catch (error) {
    await client.query("ROLLBACK");
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "서버 오류",
        detail: error.message,
      }),
    };
  } finally {
    client.release();
  }
};