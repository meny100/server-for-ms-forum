const Joi = require("@hapi/joi");
const mongoose = require("mongoose");
const moment = require("moment");

const myMoment = () => moment().format("DD.MM.YY  HH:mm");
const postSchema = new mongoose.Schema({
  creator_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  creator: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 255,
  },
  category: {
    type: Array,
    required: true,
    default: [],
  },
  content: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 16384,
  },
  comments: {
    type: Array, //array of object{ content, publisher }
    default: [],
  },
  numOfLikes:{
    type: Number,
    default: 0
  },
  image: {
    type: String,
    minlength: 6,
    maxlength: 1024,
  },
  createdAt: {
    type: String,
    default: myMoment,
  },
});

const Post = mongoose.model("Post", postSchema);

function validatePost(post) {
  const schema = Joi.object({
    content: Joi.string().min(2).max(16384).required(),
    comments: Joi.array().optional(),
    category: Joi.array().optional(),
    image: Joi.string().min(6).max(1024).optional(),
    numOfLikes: Joi.number().optional()
  });
  return schema.validate(post);
}

exports.Post = Post;
exports.validatePost = validatePost;
