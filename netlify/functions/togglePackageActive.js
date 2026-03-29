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
    const { id, isActive } = JSON.parse(event.body);

    if (!id || typeof isActive !== "boolean") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "필수값이 올바르지 않습니다." }),
      };
    }

    const result = await pool.query(
      `
      UPDATE coin_packages
      SET
        is_active = $2,
        updated_at = $3
      WHERE id = $1
      RETURNING *
      `,
      [id, isActive, Date.now()]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "패키지 노출 상태 변경 완료",
        pkg: result.rows[0],
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "패키지 노출 상태 변경 실패",
        detail: error.message,
      }),
    };
  }
};