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
    if (!process.env.DATABASE_URL) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "DATABASE_URL is missing",
        }),
      };
    }

    const {
      id,
      password,
      name,
      email,
      phone,
      bankName,
      accountNumber,
    } = JSON.parse(event.body);

    if (!id || !password || !name || !email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "필수값이 비어 있습니다." }),
      };
    }

    const exists = await pool.query(
      "SELECT 1 FROM members WHERE user_id = $1 LIMIT 1",
      [id]
    );

    if (exists.rows.length > 0) {
      return {
        statusCode: 409,
        body: JSON.stringify({ error: "이미 존재하는 아이디입니다." }),
      };
    }

    const now = Date.now();

    const result = await pool.query(
      `INSERT INTO members (
        user_id, password, name, email, phone, bank_name, account_number,
        balance, total_paid_coins, total_used_coins,
        role, status, is_active, is_password_changed, created_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        1000, 1000, 0,
        'user', 'PENDING', true, true, $8
      )
      RETURNING id, user_id, name, email, status`,
      [id, password, name, email, phone, bankName, accountNumber, now]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "회원가입 저장 완료",
        user: result.rows[0],
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