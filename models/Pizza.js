const { Schema, model } = require('mongoose');
const dateFormat = require('../utils/dateFormat');

const PizzaSchema = new Schema(
  {
    pizzaName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    createdBy: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    createdAt: {
      type: Date,
      default: Date.now,
      get: createdAtVal => dateFormat(createdAtVal)
    },
    size: {
      type: String,
      required: true,
      enum: ['Personal', 'Small', 'Medium', 'Large', 'Extra Large'],
      default: 'Large'
    },
    toppings: {
      type: [{ type: String, trim: true, maxlength: 40 }],
      required: true,
      validate: {
        validator: toppings => Array.isArray(toppings) && toppings.length > 0 && toppings.length <= 50,
        message: 'A pizza must have at least one topping and no more than 50 toppings.'
      }
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment'
      }
    ]
  },
  {
    toJSON: {
      virtuals: true,
      getters: true
    },
    // prevents virtuals from creating duplicate of _id as `id`
    id: false
  }
);

// get total count of comments and replies on retrieval
PizzaSchema.virtual('commentCount').get(function () {
  return this.comments.reduce(
    (total, comment) => total + ((comment && comment.replies) ? comment.replies.length : 0) + 1,
    0
  );
});

const Pizza = model('Pizza', PizzaSchema);

module.exports = Pizza;
