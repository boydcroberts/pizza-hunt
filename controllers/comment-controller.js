const { Comment, Pizza } = require('../models');
const mongoose = require('mongoose');

const MAX_WRITTEN_BY_LENGTH = 80;
const MAX_COMMENT_LENGTH = 1000;
const MAX_REPLY_LENGTH = 500;
const ALLOWED_COMMENT_FIELDS = ['writtenBy', 'commentBody'];
const ALLOWED_REPLY_FIELDS = ['writtenBy', 'replyBody'];

const sanitizeText = (value, maxLength = 255) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .replace(/[^\S\r\n]+/g, ' ')
    .replace(/[<>{}]/g, '')
    .trim()
    .slice(0, maxLength);
};

const isValidMongoId = value => mongoose.Types.ObjectId.isValid(value);

const sanitizeCommentPayload = body => ({
  writtenBy: sanitizeText(body?.writtenBy, MAX_WRITTEN_BY_LENGTH),
  commentBody: sanitizeText(body?.commentBody, MAX_COMMENT_LENGTH)
});

const sanitizeReplyPayload = body => ({
  writtenBy: sanitizeText(body?.writtenBy, MAX_WRITTEN_BY_LENGTH),
  replyBody: sanitizeText(body?.replyBody, MAX_REPLY_LENGTH)
});

const hasOnlyAllowedKeys = (body, allowedKeys) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return false;
  }

  return Object.keys(body).every(key => allowedKeys.includes(key));
};

const isValidCommentPayload = ({ writtenBy, commentBody }) => {
  return !!writtenBy && !!commentBody;
};

const isValidReplyPayload = ({ writtenBy, replyBody }) => {
  return !!writtenBy && !!replyBody;
};

const commentController = {
  // add comment to pizza
  addComment({ params, body }, res) {
    if (!isValidMongoId(params.pizzaId)) {
      return res.status(400).json({ message: 'Invalid pizza id.' });
    }

    const payload = sanitizeCommentPayload(body);

    if (!hasOnlyAllowedKeys(body, ALLOWED_COMMENT_FIELDS)) {
      return res.status(400).json({ message: 'Unexpected field in payload.' });
    }

    if (!isValidCommentPayload(payload)) {
      return res.status(400).json({ message: 'Comment requires writtenBy and commentBody.' });
    }

    let newCommentId;

    Comment.create(payload)
      .then(comment => {
        newCommentId = comment._id;
        return Pizza.findOneAndUpdate(
          { _id: params.pizzaId },
          { $push: { comments: comment._id } },
          { new: true }
        );
      })
      .then(dbPizzaData => {
        if (!dbPizzaData) {
          if (newCommentId) {
            return Comment.deleteOne({ _id: newCommentId }).then(() => {
              res.status(404).json({ message: 'No pizza found with this id!' });
            });
          }

          res.status(404).json({ message: 'No pizza found with this id!' });
          return;
        }
        res.json(dbPizzaData);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ message: 'Unable to add comment.' });
      });
  },

  // add reply to comment
  addReply({ params, body }, res) {
    if (!isValidMongoId(params.pizzaId) || !isValidMongoId(params.commentId)) {
      return res.status(400).json({ message: 'Invalid pizza or comment id.' });
    }

    const payload = sanitizeReplyPayload(body);
    if (!hasOnlyAllowedKeys(body, ALLOWED_REPLY_FIELDS)) {
      return res.status(400).json({ message: 'Unexpected field in payload.' });
    }

    if (!isValidReplyPayload(payload)) {
      return res.status(400).json({ message: 'Reply requires writtenBy and replyBody.' });
    }

    Comment.findOneAndUpdate(
      { _id: params.commentId },
      { $push: { replies: payload } },
      { new: true, runValidators: true }
    )
      .then(dbPizzaData => {
        if (!dbPizzaData) {
          res.status(404).json({ message: 'No comment found with this id!' });
          return;
        }
        res.json(dbPizzaData);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ message: 'Unable to add reply.' });
      });
  },

  // remove comment
  removeComment({ params }, res) {
    if (!isValidMongoId(params.pizzaId) || !isValidMongoId(params.commentId)) {
      return res.status(400).json({ message: 'Invalid pizza or comment id.' });
    }

    Comment.findOneAndDelete({ _id: params.commentId })
      .then(deletedComment => {
        if (!deletedComment) {
          return res.status(404).json({ message: 'No comment with this id!' });
        }
        return Pizza.findOneAndUpdate(
          { _id: params.pizzaId },
          { $pull: { comments: params.commentId } },
          { new: true }
        );
      })
      .then(dbPizzaData => {
        if (!dbPizzaData) {
          res.status(404).json({ message: 'No pizza found with this id!' });
          return;
        }
        res.json(dbPizzaData);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ message: 'Unable to delete comment.' });
      });
  },
  // remove reply
  removeReply({ params }, res) {
    if (!isValidMongoId(params.commentId) || !isValidMongoId(params.replyId)) {
      return res.status(400).json({ message: 'Invalid comment or reply id.' });
    }

    Comment.findOneAndUpdate(
      { _id: params.commentId, 'replies.replyId': params.replyId },
      { $pull: { replies: { replyId: params.replyId } } },
      { new: true }
    )
      .then(dbPizzaData => {
        if (!dbPizzaData) {
          return res.status(404).json({ message: 'No comment or reply found with these ids!' });
        }
        return res.json(dbPizzaData);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ message: 'Unable to delete reply.' });
      });
  }
};

module.exports = commentController;
