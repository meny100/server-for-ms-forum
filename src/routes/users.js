const express = require("express");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User, validate } = require("../models/user");
const auth = require("../middleware/auth");
const { Post } = require("../models/post");
const router = express.Router();

router.delete("/delete", auth, async (req, res) => {
  let user = await User.findOneAndDelete({ _id: req.user._id });

  res.send(user);
});

//get user details
router.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) res.status(404).end();
  res.send(user);
});

router.put("/edit", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  //check if the email is already taken by other user
  if (user && req.user._id != user._id) {
    res.status(400).send("This email is already in use.");
  }

  user = await User.findById(req.user._id);
  user.name = req.body.name;
  user.email = req.body.email;
  user.image = req.body.image;
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.password, salt);
  user = await user.save();
  res.send(user);
});

router.put("/addToFav", auth, async (req, res) => {
  let user = await User.findById(req.user._id);
  //check if post is already in favorites
  const isExist = user.favorites?.find((fav) => fav === req.body.cardId);
  if (isExist) res.status(400).send("The card is already in your favorites");

  let post = await Post.findById({ _id: req.body.cardId });
  post.numOfLikes++;
  post.save();

  user.favorites.push(req.body.cardId);
  user.save();
  res.send();
});

router.delete("/removeFromFav", auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  let index = user.favorites.findIndex((cardId) => cardId === req.query.cardId);
  if (index > -1) {
    user.favorites.splice(index, 1);
    user.save();

    let post = await Post.findById({ _id: req.query.cardId });
    post.numOfLikes--;
    post.save();
  }
  res.send();
});

router.get("/favorites", auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  let posts = await Post.find({ _id: { $in: user.favorites } });

  res.send(posts);
});

//create new user
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  user = new User(_.pick(req.body, ["name", "email", "password", "image"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();
  res.send(_.pick(user, ["_id", "name", "email"]));
});

module.exports = router;
