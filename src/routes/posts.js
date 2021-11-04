const express = require("express");
const _ = require("lodash");
const { Post, validatePost } = require("../models/post");
const auth = require("../middleware/auth");
const { User } = require("../models/user");
const router = express.Router();
const moment = require("moment");

router.get("/my-posts", auth, async (req, res) => {
  const posts = await Post.find({ creator_id: req.user._id });

  if (!posts) res.status(404).send("There no post of this user.");

  res.send(posts);
});

router.get("/by_id/:id", auth, async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id });
  if (!post) res.status(404).send("The post with the given ID was not found.");
  res.send(post);
});

router.post("/publish-comment", auth, async (req, res) => {
  const post = await Post.findById(req.body.postId);
  const user = await User.findById(req.user._id);
  post.comments.push({
    content: req.body.comment,
    publisher: user.name,
    time: moment().format("DD.MM.YY  HH:mm"),
  });
  post.save();
  res.send(post);
});

router.delete("/:id", auth, async (req, res) => {
  const isDeleted = await Post.deleteOne({
    _id: req.params.id,
    creator_id: req.user._id,
  });

  if (!isDeleted.deletedCount)
    res.status(404).send("The post with the given ID was not found.");
  res.end();
});

router.put("/:id", auth, async (req, res) => {
  const { error } = validatePost(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let post = await Post.findOne({
    _id: req.params.id,
    creator_id: req.user._id,
  });
  if (!post)
    return res.status(404).send("The post with the given ID was not found.");

  post.content = req.body.content;
  post.category = req.body.category;
  if(req.body.image) post.image = req.body.image;
  post.save();

  res.send(post);
});

router.post("/", auth, async (req, res) => {
  const { error } = validatePost(req.body);
  if (error) res.status(400).send(error.details[0].message);

  let user = await User.findById(req.user._id);

  let post = new Post({
    category: req.body.category,
    content: req.body.content,
    creator_id: user._id,
    creator: user.name,
    numOfLikes: 0
  });
  if (req.body.image) post.image = req.body.image;

  post = await post.save();
  res.send(post);
});

router.get("/:category", auth, async (req, res) => {
  const category = req.params.category;
  let posts = await Post.find();
  if (category !== "all-categories") {
    posts = posts?.filter((post) => {
      return post.category?.find((x) => {
        return x === category;
      });
    });
  }
  res.send(posts);
});

module.exports = router;
