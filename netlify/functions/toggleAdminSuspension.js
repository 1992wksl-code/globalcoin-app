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
    const { userId } = JSON.parse(event.body);

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "userId가 없습니다." }),
      };
    }

    if (userId === "superadmin") {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "superadmin 계정은 정지할 수 없습니다." }),
      };
    }

    const current = await pool.query(
      `
      SELECT user_id, status
      FROM members
      WHERE user_id = $1
      LIMIT 1
      `,
      [userId]
    );

    if (current.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "관리자 계정을 찾을 수 없습니다." }),
      };
    }

    const currentStatus = current.rows[0].status;
    const nextStatus = currentStatus === "SUSPENDED" ? "APPROVED" : "SUSPENDED";

    const result = await pool.query(
      `
      UPDATE members
      SET status = $2
      WHERE user_id = $1
      RETURNING user_id, name, email, role, status, is_active, is_password_changed, created_at
      `,
      [userId, nextStatus]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "관리자 계정 상태 변경 완료",
        admin: result.rows[0],
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "관리자 계정 상태 변경 실패",
        detail: error.message,
      }),
    };
  }
};