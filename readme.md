# Pizza Hunt

![Express](https://img.shields.io/badge/Express-4-000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat&logo=mongodb&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Server-339933?style=flat&logo=nodedotjs&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)

A social pizza recipe application where users can post creative pizza recipes, add comments, and create threaded discussions. Built with an MVC architecture using Express.js, MongoDB, and Mongoose.

---

## About

Pizza Hunt is a social recipe-sharing app focused on creative pizza builds. Users can create pizzas with custom toppings, leave comments on recipes, and reply within comment threads. The back end uses MongoDB as a document-based NoSQL database with Mongoose as the Object-Document Mapper.

## Features

- **Create pizza recipes** — post custom pizzas with chosen toppings and sizes
- **Threaded comments** — add comments to recipes and create nested reply threads
- **MVC architecture** — clean separation of models, views, and controllers
- **NoSQL data layer** — MongoDB with Mongoose ODM for flexible document storage
- **RESTful API** — full CRUD operations for pizzas and comments
- **IndexedDB offline support** — cache data locally when the connection drops

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose ODM |
| **Frontend** | HTML5, CSS3, JavaScript |
| **Architecture** | MVC (Model-View-Controller) |
| **Offline** | IndexedDB for local caching |

## Getting Started

```bash
# Clone the repository
git clone https://github.com/coleyrockin/pizza-hunt.git

# Navigate to the project
cd pizza-hunt

# Install dependencies
npm install

# Start the server
npm start
```

The app runs on `http://localhost:3001` by default.

## Project Structure

```
pizza-hunt/
├── controllers/       # Route handler logic
├── models/            # Mongoose schemas (Pizza, Comment)
├── public/            # Static front-end assets
│   ├── js/            # Client-side JavaScript
│   └── css/           # Stylesheets
├── routes/            # Express route definitions
├── utils/             # Helper utilities
├── server.js          # Express server entry point
└── package.json       # Dependencies and scripts
```

---

*Built with Express.js, MongoDB, and Mongoose.*
