const { Pizza } = require('../models');
const mongoose = require('mongoose');

const MAX_PIZZA_NAME_LENGTH = 120;
const MAX_CREATED_BY_LENGTH = 80;
const MAX_TOPPING_LENGTH = 40;
const ALLOWED_SIZES = ['Personal', 'Small', 'Medium', 'Large', 'Extra Large'];
const MAX_TOPPINGS = 50;
const MAX_PIZZAS_PER_REQUEST = 100;

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

const sanitizeToppings = toppings => {
  if (!Array.isArray(toppings)) {
    return [];
  }

  return toppings
    .map(topping => sanitizeText(topping, MAX_TOPPING_LENGTH))
    .filter(Boolean)
    .slice(0, MAX_TOPPINGS);
};

const isValidMongoId = value => mongoose.Types.ObjectId.isValid(value);

const sanitizePizzaPayload = body => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {};
  }

  const pizzaName = sanitizeText(body?.pizzaName, MAX_PIZZA_NAME_LENGTH);
  const createdBy = sanitizeText(body?.createdBy, MAX_CREATED_BY_LENGTH);
  const size = ALLOWED_SIZES.includes(body?.size) ? body.size : 'Large';
  const toppings = sanitizeToppings(body?.toppings);

  return {
    pizzaName,
    createdBy,
    size,
    toppings
  };
};

const hasOnlyAllowedPizzaKeys = body =>
  !!body && typeof body === 'object' && !Array.isArray(body)
    ? Object.keys(body).every(key => ['pizzaName', 'createdBy', 'size', 'toppings'].includes(key))
    : false;

const isCreatePayloadValid = ({ pizzaName, createdBy, toppings }) =>
  pizzaName && createdBy && Array.isArray(toppings) && toppings.length > 0;

const pizzaController = {
  // get all pizzas
  getAllPizza(req, res) {
    Pizza.find({})
      .populate({
        path: 'comments',
        select: '-__v'
      })
      .select('-__v')
      .sort({ _id: -1 })
      .limit(MAX_PIZZAS_PER_REQUEST)
      .then(dbPizzaData => res.json(dbPizzaData))
      .catch(err => {
        console.log(err);
        res.status(500).json({ message: 'Failed to load pizzas.' });
      });
  },

  // get one pizza by id
  getPizzaById({ params }, res) {
    if (!isValidMongoId(params.id)) {
      return res.status(400).json({ message: 'Invalid pizza id.' });
    }

    Pizza.findOne({ _id: params.id })
      .populate({
        path: 'comments',
        select: '-__v'
      })
      .select('-__v')
      .then(dbPizzaData => {
        if (!dbPizzaData) {
          return res.status(404).json({ message: 'No pizza found with this id!' });
        }
        return res.json(dbPizzaData);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ message: 'Failed to load pizza.' });
      });
  },

  // createPizza
  createPizza({ body }, res) {
    if (!hasOnlyAllowedPizzaKeys(body)) {
      return res.status(400).json({ message: 'Unexpected field in payload.' });
    }

    const payload = sanitizePizzaPayload(body);

    if (!isCreatePayloadValid(payload)) {
      return res.status(400).json({ message: 'Invalid pizza payload.' });
    }

    Pizza.create(payload)
      .then(dbPizzaData => res.json(dbPizzaData))
      .catch(err => {
        console.log(err);
        res.status(400).json({ message: 'Unable to create pizza.', error: err.message });
      });
  },

  // update pizza by id
  updatePizza({ params, body }, res) {
    if (!isValidMongoId(params.id)) {
      return res.status(400).json({ message: 'Invalid pizza id.' });
    }

    if (!hasOnlyAllowedPizzaKeys(body)) {
      return res.status(400).json({ message: 'Unexpected field in payload.' });
    }

    const payload = sanitizePizzaPayload(body);

    if (!isCreatePayloadValid(payload)) {
      return res.status(400).json({ message: 'Invalid pizza payload.' });
    }

    Pizza.findOneAndUpdate(
      { _id: params.id },
      payload,
      { new: true, runValidators: true }
    )
      .then(dbPizzaData => {
        if (!dbPizzaData) {
          res.status(404).json({ message: 'No pizza found with this id!' });
          return;
        }
        return res.json(dbPizzaData);
      })
      .catch(err => res.status(400).json(err));
  },

  // delete pizza
  deletePizza({ params }, res) {
    if (!isValidMongoId(params.id)) {
      return res.status(400).json({ message: 'Invalid pizza id.' });
    }

    Pizza.findOneAndDelete({ _id: params.id })
      .then(dbPizzaData => {
        if (!dbPizzaData) {
          return res.status(404).json({ message: 'No pizza found with this id!' });
        }
        return res.json(dbPizzaData);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ message: 'Unable to delete pizza.' });
      });
  }
};

module.exports = pizzaController;
