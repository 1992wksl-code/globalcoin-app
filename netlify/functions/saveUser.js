const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

exports.handler = async (event) => {
  try {
    const { name } = JSON.parse(event.body);

    const result = await pool.query(
      "INSERT INTO users(name) VALUES($1) RETURNING *",
      [name]
    );

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows[0]),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: error.toString(),
    };
  }
};