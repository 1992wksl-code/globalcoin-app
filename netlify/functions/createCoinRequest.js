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
    const {
      requestId,
      userId,
      userName,
      packageId,
      packageName,
      coinAmount,
      priceKrw,
      bankInfoSnapshot,
      createdAt,
      expiresAt,
    } = JSON.parse(event.body);

    if (!requestId || !userId || !userName || !packageName || !coinAmount || !priceKrw) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "필수값이 비어 있습니다." }),
      };
    }

    const result = await pool.query(
      `
      INSERT INTO coin_requests (
        request_id,
        user_id,
        user_name,
        package_id,
        package_name,
        coin_amount,
        price_krw,
        status,
        bank_name,
        account_number,
        account_holder,
        created_at,
        expires_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        'WAITING_FOR_DEPOSIT',
        $8, $9, $10, $11, $12
      )
      RETURNING *
      `,
      [
        requestId,
        userId,
        userName,
        packageId || null,
        packageName,
        coinAmount,
        priceKrw,
        bankInfoSnapshot?.bankName || null,
        bankInfoSnapshot?.accountNumber || null,
        bankInfoSnapshot?.accountHolder || null,
        createdAt,
        expiresAt || null,
      ]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "구매 신청 저장 완료",
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