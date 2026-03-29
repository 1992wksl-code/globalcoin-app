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
    const { bankName, accountNumber, accountHolder } = JSON.parse(event.body);

    if (!bankName || !accountNumber || !accountHolder) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "필수값이 비어 있습니다." }),
      };
    }

    const result = await pool.query(
      `
      UPDATE site_settings
      SET
        bank_name = $1,
        account_number = $2,
        account_holder = $3,
        updated_at = $4
      WHERE setting_key = 'deposit_account'
      RETURNING bank_name, account_number, account_holder, updated_at
      `,
      [bankName, accountNumber, accountHolder, Date.now()]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "수납 계좌 정보 수정 완료",
        bankInfo: result.rows[0],
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "계좌 정보 수정 실패",
        detail: error.message,
      }),
    };
  }
};