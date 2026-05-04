const $pizzaList = document.querySelector('#pizza-list');

const createElement = (tag, options = {}) => {
  const element = document.createElement(tag);
  if (options.className) {
    element.className = options.className;
  }
  if (options.text !== undefined) {
    element.textContent = options.text;
  }
  if (options.href) {
    element.href = options.href;
  }
  if (options.rel) {
    element.rel = options.rel;
  }
  if (options.type) {
    element.type = options.type;
  }
  return element;
};

const safeString = value => (typeof value === 'string' ? value : `${value || ''}`);

const printPizza = ({ _id, pizzaName, toppings = [], size, commentCount, createdBy, createdAt }) => {
  const col = createElement('div', { className: 'col-12 col-lg-6 flex-row' });
  const card = createElement('div', { className: 'card w-100 flex-column' });
  const header = createElement('h3', { className: 'card-header', text: safeString(pizzaName) });
  const body = createElement('div', { className: 'card-body flex-column col-auto' });
  const byLine = createElement('h4', { className: 'text-dark', text: `By ${safeString(createdBy)}` });
  const dateLine = createElement('p', { text: `On ${safeString(createdAt)}` });
  const commentLine = createElement('p', { text: `${Number.isFinite(commentCount) ? commentCount : 0} Comments` });
  const sizeLine = createElement('h5', { className: 'text-dark', text: `Suggested Size: ${safeString(size)}` });
  const toppingHeader = createElement('h5', { className: 'text-dark', text: 'Toppings' });
  const toppingList = createElement('ul');
  const action = createElement('a', {
    className: 'btn display-block w-100 mt-auto',
    text: 'See the discussion.',
    href: `/pizza?id=${encodeURIComponent(_id)}`
  });

  action.rel = 'noopener noreferrer';

  toppings.forEach(topping => {
    toppingList.appendChild(createElement('li', { text: safeString(topping) }));
  });

  body.appendChild(byLine);
  body.appendChild(dateLine);
  body.appendChild(commentLine);
  body.appendChild(sizeLine);
  body.appendChild(toppingHeader);
  body.appendChild(toppingList);
  body.appendChild(action);
  card.appendChild(header);
  card.appendChild(body);
  col.appendChild(card);
  $pizzaList.appendChild(col);
};

const getPizzaList = () => {
  fetch('/api/pizzas')
    .then(response => response.json())
    .then(pizzaListArr => {
      if (!Array.isArray(pizzaListArr)) {
        throw new Error('Invalid API response');
      }

      if (!pizzaListArr.length) {
        $pizzaList.textContent = 'No pizzas yet. Create one to get started.';
        return;
      }

      $pizzaList.textContent = '';
      pizzaListArr.forEach(printPizza);
    })
    .catch(err => {
      console.log(err);
      $pizzaList.textContent = 'Unable to load pizzas right now.';
    });
};

getPizzaList();
