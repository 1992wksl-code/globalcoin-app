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
    const { userId, newRole } = JSON.parse(event.body);

    if (!userId || !newRole) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "필수값이 비어 있습니다." }),
      };
    }

    if (!["admin", "super_admin"].includes(newRole)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "허용되지 않은 권한입니다." }),
      };
    }

    if (userId === "superadmin") {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "superadmin 권한은 변경할 수 없습니다." }),
      };
    }

    const result = await pool.query(
      `
      UPDATE members
      SET role = $2
      WHERE user_id = $1
      RETURNING user_id, name, email, role, status, is_active, is_password_changed, created_at
      `,
      [userId, newRole]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "관리자 권한 변경 완료",
        admin: result.rows[0],
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "관리자 권한 변경 실패",
        detail: error.message,
      }),
    };
  }
};