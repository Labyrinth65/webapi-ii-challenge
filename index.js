const express = require("express");

const postsRouter = require("./posts/posts-router.js");

const server = express();

server.get("/", (req, res) => {
	res.send(`
    <h2>Lambda Posts API</h>
    <p>Welcome to the Lambda Posts API</p>
  `);
});

server.use("/api/posts", postsRouter);

server.listen(4000, () => {
	console.log("\n*** Server Running on http://localhost:4000 ***\n");
});
