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
    const { id, password, isAdminPortal } = JSON.parse(event.body);

    if (!id || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "아이디와 비밀번호를 입력하세요." }),
      };
    }

    const result = await pool.query(
      `
      SELECT
        id,
        user_id,
        password,
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
        admin_note
      FROM members
      WHERE user_id = $1
      LIMIT 1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "아이디를 찾을 수 없습니다." }),
      };
    }

    const member = result.rows[0];

    if (member.password !== password) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "비밀번호가 일치하지 않습니다." }),
      };
    }

    if (member.status === "PENDING") {
      return {
        statusCode: 403,
        body: JSON.stringify({
          error: "회원가입 승인 대기 중입니다. 관리자 승인 후 이용 가능합니다.",
        }),
      };
    }

    if (member.status === "REJECTED") {
      return {
        statusCode: 403,
        body: JSON.stringify({
          error: `회원가입 신청이 반려되었습니다.${member.rejection_reason ? ` 사유: ${member.rejection_reason}` : ""}`,
        }),
      };
    }

    if (member.status === "SUSPENDED") {
      return {
        statusCode: 403,
        body: JSON.stringify({
          error: "활동이 정지된 계정입니다. 고객센터에 문의하세요.",
        }),
      };
    }

    if (isAdminPortal && member.role === "user") {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "관리자 권한이 없습니다." }),
      };
    }

    const user = {
      id: member.user_id,
      password: member.password,
      name: member.name,
      email: member.email,
      phone: member.phone,
      bankName: member.bank_name,
      accountNumber: member.account_number,
      balance: member.balance,
      totalPaidCoins: member.total_paid_coins,
      totalUsedCoins: member.total_used_coins,
      role: member.role,
      status: member.status,
      isActive: member.is_active,
      isPasswordChanged: member.is_password_changed,
      rejectionReason: member.rejection_reason,
      processedAt: member.processed_at,
      processedBy: member.processed_by,
      adminNote: member.admin_note,
    };

    return {
      statusCode: 200,
      body: JSON.stringify({ user }),
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