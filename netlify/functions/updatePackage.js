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
    const {
      id,
      name,
      coinAmount,
      priceKrw,
      description,
      isActive,
      sortOrder,
      isPopular,
    } = JSON.parse(event.body);

    if (!id || !name || !coinAmount || !priceKrw) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "필수값이 비어 있습니다." }),
      };
    }

    const result = await pool.query(
      `
      UPDATE coin_packages
      SET
        name = $2,
        coin_amount = $3,
        price_krw = $4,
        description = $5,
        is_active = $6,
        sort_order = $7,
        is_popular = $8,
        updated_at = $9
      WHERE id = $1
      RETURNING *
      `,
      [
        id,
        name,
        Number(coinAmount),
        Number(priceKrw),
        description || "",
        isActive ?? true,
        Number(sortOrder || 0),
        isPopular ?? false,
        Date.now(),
      ]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "패키지 수정 완료",
        pkg: result.rows[0],
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "패키지 수정 실패",
        detail: error.message,
      }),
    };
  }
};