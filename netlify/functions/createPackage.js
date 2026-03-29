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

    const now = Date.now();

    const result = await pool.query(
      `
      INSERT INTO coin_packages (
        id,
        name,
        coin_amount,
        price_krw,
        description,
        is_active,
        sort_order,
        is_popular,
        created_at,
        updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      )
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
        now,
        now,
      ]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "패키지 생성 완료",
        pkg: result.rows[0],
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "패키지 생성 실패",
        detail: error.message,
      }),
    };
  }
};