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
    const { userId, newPassword } = JSON.parse(event.body);

    if (!userId || !newPassword) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "필수값이 비어 있습니다." }),
      };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await pool.query(
      `
      UPDATE members
      SET
        password = $2,
        is_password_changed = true
      WHERE user_id = $1
      RETURNING
        user_id,
        name,
        email,
        role,
        status,
        is_active,
        is_password_changed,
        balance,
        total_paid_coins,
        total_used_coins,
        bank_name,
        account_number,
        rejection_reason,
        processed_at,
        processed_by,
        admin_note
      `,
      [userId, hashedPassword]
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "사용자를 찾을 수 없습니다." }),
      };
    }

    const member = result.rows[0];

    const user = {
      id: member.user_id,
      name: member.name,
      email: member.email,
      role: member.role,
      status: member.status,
      isActive: member.is_active,
      isPasswordChanged: member.is_password_changed,
      balance: member.balance,
      totalPaidCoins: member.total_paid_coins,
      totalUsedCoins: member.total_used_coins,
      bankName: member.bank_name,
      accountNumber: member.account_number,
      rejectionReason: member.rejection_reason,
      processedAt: member.processed_at,
      processedBy: member.processed_by,
      adminNote: member.admin_note,
    };

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "비밀번호 변경 완료",
        user,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "비밀번호 변경 실패",
        detail: error.message,
      }),
    };
  }
};