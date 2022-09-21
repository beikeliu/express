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
app.post("/post", (req, res) => {
  const stmt = db.prepare("insert into post (content) values (?)");
  stmt.run(req.body.content);
  res.send(j(0, "", ""));
});
app.get("/post", (_, res) => {
  const stmt = db.prepare("select * from post");
  const data = stmt.all();
  res.send(j(0, data, ""));
});
app.post("/login", (req, res) => {
  const stmt = db.prepare(
    "select * from user where username = ? and password = ?"
  );
  const data = stmt.get([req.body.username, req.body.password]);
  if (!data) {
    res.send(j(2, "", "账号或密码有误"));
  } else {
    const { id, username } = data;
    const token = jwt.sign({ data: { id, username } }, KEY, {
      expiresIn: 60 * 60 * 24 * 7,
    });
    res.send(j(0, { token }, ""));
  }
});
app.listen(3000, () => {
  console.log("open http://localhost:3000/");
});
