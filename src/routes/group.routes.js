const express = require("express");
const router = express.Router();
// ※各コントローラーの関数は後ほど作成する想定です
const groupController = require("../controllers/group.controller");

// ★ここに追記（/:id より上に書くのがNode.jsのルールです）
router.get("/", groupController.getAllGroups);

// 1. 新しいグループを作成する
router.post("/", groupController.createGroup);

// 2. グループ名、メンバー、カテゴリ、支払い履歴をまとめて取得する
router.get("/:id", groupController.getGroupDetails);

// 3. そのグループにカテゴリを登録する
router.post("/:id/categories", groupController.createCategory);

// 4. そのグループに新しいメンバーを追加する
router.post("/:id/members", groupController.createMember);

// 5. 「誰が」「いくら」「誰の分を」払ったかの記録を保存する
router.post("/:id/payments", groupController.createPayment);

// 6. 【最重要】バックエンドで計算した「最終的な清算結果」を受け取る
router.get("/:id/settlements", groupController.getSettlements);

module.exports = router;
