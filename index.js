const express = require("express");
const app = express();
const db = require("better-sqlite3")("../mydb.db");
const jwt = require("jsonwebtoken");
const KEY = "vzcTubpJFDrhVgT3RQnW";
const verifyToken = async (token) => {
  let res;
  await jwt.verify(token, KEY, (err, decoded) => {
    !err && (res = decoded.data);
  });
  return res;
};
const j = (code, data, msg) => ({ code, data, msg });
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(async (req, res, next) => {
  if (req.url === "/login") return next();
  const data = await verifyToken(req.headers.authorization);
  if (!data) return res.send(j(1, "", "token失效"));
  next();
});
// 新建帖子
app.post("/post", (req, res) => {
  const stmt = db.prepare("insert into post (title,content) values (?,?)");
  try {
    const { title, content } = req.body;
    const data = stmt.run(title, content);
    data.changes ? res.send(j(0, "", "")) : res.send(j(1, "", "新建失败"));
  } catch (err) {
    res.send(j(1, err, "发生错误"));
  }
});
// 查询帖子列表
app.get("/post", (_, res) => {
  const stmt = db.prepare("select * from post");
  const data = stmt.all();
  res.send(j(0, data, ""));
});
// 登录
app.post("/login", (req, res) => {
  const stmt = db.prepare(
    "select * from user where username = ? and password = ?"
  );
  const { username, password } = req.body;
  const data = stmt.get([username, password]);
  if (!data) {
    res.send(j(1, "", "账号或密码有误"));
  } else {
    const { id, username } = data;
    const token = jwt.sign({ data: { id, username } }, KEY, {
      expiresIn: 60 * 60 * 24 * 7,
    });
    res.send(j(0, { token, id, username }, ""));
  }
});
// 删除帖子
app.delete("/post/:id", (req, res) => {
  const stmt = db.prepare("delete from post where id = ?");
  const data = stmt.run(req.params.id);
  data.changes ? res.send(j(0, "", "")) : res.send(j(1, "", "删除失败"));
});
// 修改帖子
app.patch("/post/:id", (req, res) => {
  const stmt = db.prepare("update post set content = ? where id = ?");
  try {
    const data = stmt.run(req.body.content, req.params.id);
    data.changes ? res.send(j(0, "", "")) : res.send(j(1, "", "修改失败"));
  } catch (err) {
    res.send(j(1, err, "发生错误"));
  }
});
app.listen(3000, () => {
  console.log("open http://localhost:3000/");
});
