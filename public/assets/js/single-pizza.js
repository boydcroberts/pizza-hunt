const $backBtn = document.querySelector('#back-btn');
const $pizzaName = document.querySelector('#pizza-name');
const $createdBy = document.querySelector('#created-by');
const $createdAt = document.querySelector('#created-at');
const $size = document.querySelector('#size');
const $toppingsList = document.querySelector('#toppings-list');
const $commentSection = document.querySelector('#comment-section');
const $newCommentForm = document.querySelector('#new-comment-form');

let pizzaId;

const createElement = (tag, options = {}) => {
  const element = document.createElement(tag);
  if (options.className) {
    element.className = options.className;
  }
  if (options.text !== undefined) {
    element.textContent = options.text;
  }
  if (options.type) {
    element.type = options.type;
  }
  if (options.name) {
    element.name = options.name;
  }
  if (options.required) {
    element.required = options.required;
  }
  return element;
};

const parsePizzaId = () => {
  const params = new URLSearchParams(document.location.search);
  return params.get('id');
};

const getPizza = () => {
  const id = parsePizzaId();

  if (!id) {
    alert('Cannot find a pizza with this id!');
    window.history.back();
    return;
  }

  fetch(`/api/pizzas/${encodeURIComponent(id)}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Something went wrong!');
      }

      return response.json();
    })
    .then(printPizza)
    .catch(err => {
      console.log(err);
      alert('Cannot find a pizza with this id! Taking you back.');
      window.history.back();
    });
};

const printPizza = pizzaData => {
  if (!pizzaData || !pizzaData._id) {
    throw new Error('Malformed pizza data');
  }

  pizzaId = pizzaData._id;

  const { pizzaName, createdBy, createdAt, size, toppings = [], comments = [] } = pizzaData;

  $pizzaName.textContent = pizzaName || 'Unnamed';
  $createdBy.textContent = createdBy || 'Unknown';
  $createdAt.textContent = createdAt || 'Unknown';
  $size.textContent = size || 'Unknown';

  $toppingsList.textContent = '';
  toppings.forEach(topping => {
    const toppingPill = createElement('span', {
      className: 'col-auto m-2 text-center btn',
      text: topping || 'Unknown'
    });
    $toppingsList.appendChild(toppingPill);
  });

  $commentSection.textContent = '';
  if (comments.length) {
    comments.forEach(printComment);
  } else {
    const fallback = createElement('h4', {
      className: 'bg-dark p-3 rounded',
      text: 'No comments yet!'
    });
    $commentSection.appendChild(fallback);
  }
};

const printReply = reply => {
  const item = createElement('div', { className: 'card p-2 rounded bg-secondary' });
  const replyAuthor = createElement('p', {
    text: `${reply.writtenBy || 'Unknown'} replied on ${reply.createdAt || 'Unknown'}:`
  });
  const replyBody = createElement('p', { text: reply.replyBody || '' });

  item.appendChild(replyAuthor);
  item.appendChild(replyBody);
  return item;
};

const printComment = comment => {
  const commentDiv = createElement('div', {
    className: 'my-2 card p-2 w-100 text-dark rounded'
  });

  const header = createElement('h5', {
    className: 'text-dark',
    text: `${comment.writtenBy || 'Unknown'} commented on ${comment.createdAt || 'Unknown'}:`
  });
  const body = createElement('p', { text: comment.commentBody || '' });
  const repliesWrapper = createElement('div', { className: 'bg-dark ml-3 p-2 rounded' });
  const replyHeader = createElement('h5', {
    text: comment.replies && comment.replies.length ? `${comment.replies.length} ${comment.replies.length === 1 ? 'Reply' : 'Replies'}` : 'No replies yet!'
  });
  const form = createElement('form', {
    className: 'reply-form mt-3'
  });
  const nameGroup = createElement('div', { className: 'mb-3' });
  const nameLabel = createElement('label', { text: 'Leave Your Name' });
  nameLabel.htmlFor = 'reply-name';
  const nameInput = createElement('input', {
    className: 'form-input',
    type: 'text',
    name: 'reply-name',
    required: true
  });
  const replyGroup = createElement('div', { className: 'mb-3' });
  const replyLabel = createElement('label', { text: 'Leave a Reply' });
  replyLabel.htmlFor = 'reply';
  const replyText = createElement('textarea', {
    className: 'form-textarea form-input',
    name: 'reply',
    required: true
  });
  const submit = createElement('button', {
    className: 'mt-2 btn display-block w-100',
    text: 'Add Reply',
    type: 'submit'
  });

  form.setAttribute('data-commentid', comment._id || '');

  replyText.setAttribute('rows', '3');

  nameGroup.appendChild(nameLabel);
  nameGroup.appendChild(nameInput);
  replyGroup.appendChild(replyLabel);
  replyGroup.appendChild(replyText);
  form.appendChild(nameGroup);
  form.appendChild(replyGroup);
  form.appendChild(submit);

  repliesWrapper.appendChild(replyHeader);
  if (comment.replies && comment.replies.length) {
    comment.replies.forEach(reply => {
      repliesWrapper.appendChild(printReply(reply));
    });
  }

  commentDiv.appendChild(header);
  commentDiv.appendChild(body);
  commentDiv.appendChild(repliesWrapper);
  commentDiv.appendChild(form);
  $commentSection.prepend(commentDiv);
};

const handleNewCommentSubmit = event => {
  event.preventDefault();

  const commentBody = $newCommentForm.querySelector('#comment').value.trim();
  const writtenBy = $newCommentForm.querySelector('#written-by').value.trim();

  if (!commentBody || !writtenBy) {
    return;
  }

  const formData = { commentBody, writtenBy };

  fetch(`/api/comments/${pizzaId}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Something went wrong!');
      }
      return response.json();
    })
    .then(() => {
      $newCommentForm.reset();
      getPizza();
    })
    .catch(err => {
      console.log(err);
    });
};

const handleNewReplySubmit = event => {
  event.preventDefault();

  if (!event.target.matches('.reply-form')) {
    return false;
  }

  const commentId = event.target.getAttribute('data-commentid');
  const writtenBy = event.target.querySelector('[name=reply-name]').value.trim();
  const replyBody = event.target.querySelector('[name=reply]').value.trim();

  if (!replyBody || !writtenBy) {
    return;
  }

  const formData = { writtenBy, replyBody };

  fetch(`/api/comments/${pizzaId}/${commentId}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Something went wrong!');
      }
      return response.json();
    })
    .then(() => {
      getPizza();
    })
    .catch(err => {
      console.log(err);
    });
};

$backBtn.addEventListener('click', function() {
  window.history.back();
});

$newCommentForm.addEventListener('submit', handleNewCommentSubmit);
$commentSection.addEventListener('submit', handleNewReplySubmit);

getPizza();
