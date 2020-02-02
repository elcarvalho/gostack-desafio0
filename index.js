const express = require('express');

const server = express();

server.use(express.json());

let counter = 0;

server.use((req, res, next) => {
  counter++;

  console.log(`Request nº: ${counter}`);

  return next();
});

const projects = [];

function checkID(req, res, next) {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'The id param must be informed.' });
  }

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'The id param must be a string.' });
  }

  req.id = id;

  return next();
}

function checkProjectExists(req, res, next) {
  const { id } = req.body;
  const projectExists = projects.some(project => project.id === id);

  if (projectExists) {
    return res.status(400).json({ error: 'The id informed already exists!' });
  }

  return next();
}

function checkProjectNotExists(req, res, next) {
  const { id } = req.params;
  const projectExists = projects.some(project => project.id === id);

  if (!projectExists) {
    return res.status(400).json({ error: "The project doesn't exist!" });
  }

  req.id = id;

  return next();
}

function checkTitle(req, res, next) {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'The title param must be informed.' });
  }

  if (typeof title !== 'string') {
    return res.status(400).json({ error: 'The title param must be a string.' });
  }

  req.title = title;

  return next();
}

server.get('/projects', (req, res) => {
  return res.json(projects);
});

server.post(
  '/projects',
  checkID,
  checkProjectExists,
  checkTitle,
  (req, res) => {
    const { id, title } = req;

    projects.push({ id, title, tasks: [] });

    return res.json(projects);
  }
);

server.put('/projects/:id', checkTitle, checkProjectNotExists, (req, res) => {
  const { id, title } = req;

  const index = projects.findIndex(project => project.id === id);
  projects[index]['title'] = title;

  return res.json(projects[index]);
});

server.delete('/projects/:id', checkProjectNotExists, (req, res) => {
  const { id } = req;
  const index = projects.findIndex(project => project.id === id);

  projects.splice(index, 1);

  return res.send();
});

server.post('/projects/:id/tasks', checkProjectNotExists, (req, res) => {
  const { id } = req;
  const index = projects.findIndex(project => project.id === id);
  const { title } = req.body;

  projects[index]['tasks'].push(title);

  return res.json(projects[index]);
});

server.listen(3000);
