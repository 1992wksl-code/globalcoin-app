const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

exports.handler = async () => {
  try {
    const result = await pool.query(
      `
      SELECT bank_name, account_number, account_holder, updated_at
      FROM site_settings
      WHERE setting_key = 'deposit_account'
      LIMIT 1
      `
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "수납 계좌 정보가 없습니다." }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows[0]),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "계좌 정보 조회 실패",
        detail: error.message,
      }),
    };
  }
};