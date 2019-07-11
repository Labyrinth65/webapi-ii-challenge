const express = require("express");

const postsDB = require("../data/db.js"); // <<< update the path

const router = express.Router();

router.use(express.json());
// for urls beginning with /api/posts

// GET
router.get("/", async (req, res) => {
	try {
		const posts = await postsDB.find(req.query);
		res.status(200).json(posts);
	} catch (error) {
		// log error to database
		console.log(error);
		res.status(500).json({
			error: "The posts information could not be retrieved."
		});
	}
});

router.get("/:id", async (req, res) => {
	try {
		const post = await postsDB.findById(req.params.id).first();
		if (post) {
			res.status(200).json(post);
		} else {
			res
				.status(404)
				.json({ message: "The post with the specified ID does not exist." });
		}
	} catch (error) {
		// log error to database
		console.log(error);
		res.status(500).json({
			error: "The post information could not be retrieved."
		});
	}
});

router.get("/:id/comments", async (req, res) => {
	try {
		const post = await postsDB.findById(req.params.id);
		const comments = await postsDB.findPostComments(req.params.id);
		if (post && comments.length) {
			res.status(200).json(comments);
		} else if (post.length > 0) {
			res.status(200).json({ message: "The post has no comments." });
		} else {
			res
				.status(404)
				.json({ message: "The post with the specified ID does not exist." });
		}
	} catch (error) {
		// log error to database
		console.log(error);
		res.status(500).json({
			error: "The comments information could not be retrieved."
		});
	}
});

// POST
function isValidPost(post) {
	const { title, contents } = post;
	return title && contents;
}

router.post("/", async (req, res) => {
	if (!isValidPost(req.body)) {
		res.status(400).json({
			errorMessage: "Please provide title and contents for the post."
		});
	} else {
		try {
			const post = await postsDB.insert(req.body);
			// const newPost = await postsDB.findById(post.id);
			// res.status(201).json(newPost);
			res.status(201).json(post);
		} catch (error) {
			// log error to database
			console.log(error);
			res.status(500).json({
				error: "There was an error while saving the post to the database"
			});
		}
	}
});

function isValidComment(comment) {
	const { text } = comment;
	return !!text;
}

router.post("/:id/comments", async (req, res) => {
	if (!isValidComment(req.body)) {
		res.status(400).json({
			errorMessage: "Please provide text for the comment."
		});
	} else {
		try {
			const post = await postsDB.findById(req.params.id);
			const comment = await postsDB.insertComment({
				...req.body,
				post_id: req.params.id
			});
			const newComment = await postsDB.findCommentById(comment.id).first();
			if (post) {
				res.status(201).json(newComment);
			} else {
				res
					.status(404)
					.json({ message: "The post with the specified ID does not exist." });
			}
		} catch (error) {
			// log error to database
			console.log(error);
			res.status(500).json({
				error: "There was an error while saving the comment to the database"
			});
		}
	}
});

// DELETE
router.delete("/:id", async (req, res) => {
	try {
		const post = await postsDB.findById(req.params.id).first();
		const count = await postsDB.remove(req.params.id);
		if (count > 0) {
			res.status(200).json(post);
		} else {
			res
				.status(404)
				.json({ message: "The post with the specified ID does not exist." });
		}
	} catch (error) {
		// log error to database
		console.log(error);
		res.status(500).json({
			error: "The post could not be removed"
		});
	}
});

// PUT /api/posts /:id
router.put("/:id", async (req, res) => {
	if (!isValidPost(req.body)) {
		res.status(400).json({
			errorMessage: "Please provide title and contents for the post."
		});
	} else {
		try {
			const post = await postsDB.update(req.params.id, req.body);
			const updatedPost = await postsDB.findById(req.params.id).first();
			if (post) {
				res.status(200).json(updatedPost);
			} else {
				res
					.status(404)
					.json({ message: "The post with the specified ID does not exist." });
			}
		} catch (error) {
			// log error to database
			console.log(error);
			res.status(500).json({
				error: "The post information could not be modified."
			});
		}
	}
});

module.exports = router;
