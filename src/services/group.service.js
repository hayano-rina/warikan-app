const prisma = require("../config/prisma");

// 1. グループ作成
exports.createGroup = async (name) => {
  return await prisma.group.create({ data: { name } });
};

// 2. グループ詳細取得
exports.getGroupDetails = async (groupId) => {
  return await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      categories: true,
      members: { include: { category: true } },
      payments: {
        include: { payer: true, participants: { include: { member: true } } },
      },
    },
  });
};

// 全グループを一覧で取得する（新しく追加）
exports.getAllGroups = async () => {
  return await prisma.group.findMany({
    orderBy: { createdAt: "desc" }, // 新しい順に並べる
  });
};

// 3. カテゴリ作成
exports.createCategory = async (groupId, name, weight) => {
  return await prisma.category.create({
    data: { groupId, name, weight: parseFloat(weight) },
  });
};

// 4. メンバー作成
exports.createMember = async (groupId, name, categoryId) => {
  return await prisma.member.create({
    data: { groupId, name, categoryId },
  });
};

// 5. 支払い記録の保存
exports.createPayment = async (
  groupId,
  payerId,
  amount,
  description,
  participantIds,
) => {
  return await prisma.$transaction(async (tx) => {
    // 支払いデータを作成
    const payment = await tx.payment.create({
      data: { groupId, payerId, amount: parseInt(amount), description },
    });

    // 参加者（中間テーブル）を一括登録
    const participantData = participantIds.map((memberId) => ({
      paymentId: payment.id,
      memberId,
    }));
    await tx.paymentParticipant.createMany({ data: participantData });

    return payment;
  });
};

// 6. 清算ロジック計算（前回お伝えしたコード）
exports.calculateSettlements = async (groupId) => {
  const members = await prisma.member.findMany({
    where: { groupId },
    include: { category: true },
  });

  const payments = await prisma.payment.findMany({
    where: { groupId },
    include: {
      participants: { include: { member: { include: { category: true } } } },
    },
  });

  const balances = {};
  members.forEach((m) => {
    balances[m.id] = 0;
  });

  payments.forEach((payment) => {
    balances[payment.payerId] += payment.amount;
    const totalWeight = payment.participants.reduce(
      (sum, p) => sum + p.member.category.weight,
      0,
    );

    if (totalWeight > 0) {
      payment.participants.forEach((p) => {
        const memberWeight = p.member.category.weight;
        const owedAmount = Math.round(
          (memberWeight / totalWeight) * payment.amount,
        );
        balances[p.memberId] -= owedAmount;
      });
    }
  });

  const creditors = [];
  const debtors = [];

  members.forEach((m) => {
    const balance = balances[m.id];
    if (balance > 0) {
      creditors.push({ id: m.id, name: m.name, amount: balance });
    } else if (balance < 0) {
      debtors.push({ id: m.id, name: m.name, amount: Math.abs(balance) });
    }
  });

  const settlements = [];
  let cIndex = 0;
  let dIndex = 0;

  while (cIndex < creditors.length && dIndex < debtors.length) {
    const creditor = creditors[cIndex];
    const debtor = debtors[dIndex];
    const amountToPay = Math.min(creditor.amount, debtor.amount);

    settlements.push({
      from: { id: debtor.id, name: debtor.name },
      to: { id: creditor.id, name: creditor.name },
      amount: amountToPay,
    });

    creditor.amount -= amountToPay;
    debtor.amount -= amountToPay;

    if (creditor.amount === 0) cIndex++;
    if (debtor.amount === 0) dIndex++;
  }

  return settlements;
};
