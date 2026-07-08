const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config(); // .envファイルから環境変数を読み込む

const routes = require("./routes"); // src/routes/index.js を自動的に読み込む

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// ミドルウェアの設定
// ==========================================
app.use(cors()); // フロントエンドからのクロスドメイン通信を許可
app.use(express.json()); // フロントエンドから送られてくるJSONデータを解析できるようにする

app.use(express.static(path.join(__dirname, "../public")));

// ==========================================
// ルーティングの設定
// ==========================================
// すべてのAPIの先頭に「/api」をつけるのが一般的です（例: /api/groups/:id/settlements）
app.use("/api", routes);
module.exports = app;

// ==========================================
// サーバーの起動
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`💡 Test the API with http://localhost:${PORT}/api/ping`);
});
