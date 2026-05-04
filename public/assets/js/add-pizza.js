const $addToppingBtn = document.querySelector('#add-topping');
const $pizzaForm = document.querySelector('#pizza-form');
const $customToppingsList = document.querySelector('#custom-toppings-list');
const $newToppingInput = document.querySelector('#new-topping');

const MAX_TOPPING_LENGTH = 40;
const MAX_FORM_TEXT_LENGTH = 120;

const toSafeString = value => (typeof value === 'string' ? value.trim() : '');

const slugify = value =>
  toSafeString(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const handleAddTopping = event => {
  event.preventDefault();

  const toppingValue = toSafeString($newToppingInput.value).slice(0, MAX_TOPPING_LENGTH);

  if (!toppingValue) {
    return false;
  }

  const normalizedValue = toppingValue.toLowerCase();
  const alreadyExists = [...$pizzaForm.querySelectorAll('[name=topping]')].some(input =>
    input.value.toLowerCase() === normalizedValue
  );

  if (alreadyExists) {
    return false;
  }

  const id = slugify(toppingValue) || `topping-${Date.now()}`;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.name = 'topping';
  checkbox.value = toppingValue;
  checkbox.id = id;

  const label = document.createElement('label');
  label.textContent = toppingValue;
  label.htmlFor = id;

  const divWrapper = document.createElement('div');
  divWrapper.appendChild(checkbox);
  divWrapper.appendChild(label);
  $customToppingsList.appendChild(divWrapper);

  $newToppingInput.value = '';
};

const getSelectedToppings = () => {
  return [...$pizzaForm.querySelectorAll('[name=topping]:checked')].map(input => toSafeString(input.value));
};

const handlePizzaSubmit = event => {
  event.preventDefault();

  const pizzaName = toSafeString($pizzaForm.querySelector('#pizza-name').value).slice(0, MAX_FORM_TEXT_LENGTH);
  const createdBy = toSafeString($pizzaForm.querySelector('#created-by').value).slice(0, MAX_FORM_TEXT_LENGTH);
  const size = $pizzaForm.querySelector('#pizza-size').value;
  const toppings = getSelectedToppings().filter(Boolean);

  if (!pizzaName || !createdBy || !toppings.length) {
    return;
  }

  const formData = { pizzaName, createdBy, size, toppings };

  fetch('/api/pizzas', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to create pizza.');
      }
      return response.json();
    })
    .then(() => {
      alert('Pizza created successfully!');
      $pizzaForm.reset();
      window.location.href = '/';
    })
    .catch(err => {
      console.log(err);
    });
};

$pizzaForm.addEventListener('submit', handlePizzaSubmit);
$addToppingBtn.addEventListener('click', handleAddTopping);
