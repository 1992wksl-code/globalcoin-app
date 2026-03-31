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
    const { userId, note } = JSON.parse(event.body);

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "userId가 없습니다." }),
      };
    }

    const result = await pool.query(
      `
      UPDATE members
      SET admin_note = $2
      WHERE user_id = $1
      RETURNING
        id,
        user_id,
        name,
        email,
        phone,
        bank_name,
        account_number,
        balance,
        total_paid_coins,
        total_used_coins,
        role,
        status,
        is_active,
        is_password_changed,
        rejection_reason,
        processed_at,
        processed_by,
        admin_note,
        created_at
      `,
      [userId, note || ""]
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "회원을 찾을 수 없습니다." }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "관리자 메모 저장 완료",
        member: result.rows[0],
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "관리자 메모 저장 실패",
        detail: error.message,
      }),
    };
  }
};