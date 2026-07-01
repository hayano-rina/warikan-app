const express = require("express");
const router = express.Router();
const groupRoutes = require("./group.routes");

// ヘルスチェック用（サーバーが動いているか確認するため）
router.get("/ping", (req, res) => {
  res.status(200).json({ message: "pong" });
});

// グループ関連のAPIを /groups の配下に紐付ける
// 例: router.post('/') が /groups に、router.get('/:id') が /groups/:id になります
router.use("/groups", groupRoutes);

module.exports = router;
