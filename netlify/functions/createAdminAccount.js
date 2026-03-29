const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

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
    const { id, name, email, password, role } = JSON.parse(event.body);

    if (!id || !name || !email || !password || !role) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "필수값이 비어 있습니다." }),
      };
    }

    const exists = await pool.query(
      `SELECT 1 FROM members WHERE user_id = $1 LIMIT 1`,
      [id]
    );

    if (exists.rows.length > 0) {
      return {
        statusCode: 409,
        body: JSON.stringify({ error: "이미 사용 중인 아이디입니다." }),
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const now = Date.now();

    const result = await pool.query(
      `
      INSERT INTO members (
        user_id,
        password,
        name,
        email,
        balance,
        total_paid_coins,
        total_used_coins,
        role,
        status,
        is_active,
        is_password_changed,
        created_at
      )
      VALUES (
        $1, $2, $3, $4,
        0, 0, 0,
        $5, 'APPROVED', true, false, $6
      )
      RETURNING id, user_id, name, email, role, status, is_active, is_password_changed, created_at
      `,
      [id, hashedPassword, name, email, role, now]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "신규 관리자 생성 완료",
        admin: result.rows[0],
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "신규 관리자 생성 실패",
        detail: error.message,
      }),
    };
  }
};