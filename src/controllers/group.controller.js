const groupService = require("../services/group.service");

// 1. 新しいグループを作成する
exports.createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "グループ名は必須です" });

    const group = await groupService.createGroup(name);
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. グループ名、メンバー、カテゴリ、支払い履歴をまとめて取得する
exports.getGroupDetails = async (req, res) => {
  try {
    const group = await groupService.getGroupDetails(req.params.id);
    if (!group)
      return res.status(404).json({ error: "グループが見つかりません" });
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. そのグループにカテゴリを登録する
exports.createCategory = async (req, res) => {
  try {
    const { name, weight } = req.body;
    const category = await groupService.createCategory(
      req.params.id,
      name,
      weight,
    );
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. そのグループに新しいメンバーを追加する
exports.createMember = async (req, res) => {
  try {
    const { name, categoryId } = req.body;
    const member = await groupService.createMember(
      req.params.id,
      name,
      categoryId,
    );
    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. 「誰が」「いくら」「誰の分を」払ったかの記録を保存する
exports.createPayment = async (req, res) => {
  try {
    const { payerId, amount, description, participantIds, date } = req.body;
    const payment = await groupService.createPayment(
      req.params.id,
      payerId,
      amount,
      description,
      participantIds,
      date,
    );
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 6. 最終的な清算結果を受け取る
exports.getSettlements = async (req, res) => {
  try {
    const settlements = await groupService.calculateSettlements(req.params.id);
    res.json(settlements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 全グループを一覧で取得する（新しく追加）
exports.getAllGroups = async (req, res) => {
  try {
    const groups = await groupService.getAllGroups();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
