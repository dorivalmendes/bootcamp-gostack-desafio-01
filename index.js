const express = require("express");

const server = express();

server.use(express.json());

const projects = [];
let numberOfRequests = 0;

// Função para recuperar o índice do projeto
function getProjectIndex(id) {
  return projects.findIndex(item => item.id == id);
}

// Middleware para registrar e exibir no console o número de requisições
function countAndLogNumberOfRequests(req, res, next) {
  numberOfRequests++;

  console.log(`Number of resquests at this moment: ${numberOfRequests}`);

  return next();
}

server.use(countAndLogNumberOfRequests);

// Middleware para verificar se o projeto existe
function checkProjectExists(req, res, next) {
  const { id } = req.params;
  const index = getProjectIndex(id);

  if (index === -1) {
    return res.status(400).json({
      error: "Project doesn't exists"
    });
  }

  req.params.id = index;

  return next();
}

server.get("/projects", (req, res) => {
  return res.json(projects);
});

server.post("/projects", (req, res) => {
  const { id, title } = req.body;
  let errors = [];

  if (!id) {
    errors.push("Project id is required");
  }
  if (!title) {
    errors.push("Project title is required");
  }
  if (errors.length > 0) {
    return res.status(400).json({
      errors
    });
  }

  const index = getProjectIndex(id);

  if (index >= 0) {
    return res.status(400).json({
      error: "Project id already exists"
    });
  }

  const project = {
    id,
    title,
    tasks: []
  };

  projects.push(project);

  return res.json(projects);
});

server.post("/projects/:id/tasks", checkProjectExists, (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({
      error: "Task title is required"
    });
  }

  projects[id].tasks.push(title);

  return res.json(projects[id]);
});

server.put("/projects/:id", checkProjectExists, (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({
      error: "Project title is required"
    });
  }

  projects[id].title = title;

  return res.json(projects[id]);
});

server.delete("/projects/:id", checkProjectExists, (req, res) => {
  const { id } = req.params;

  projects.splice(id, 1);

  return res.send();
});

server.listen(3000);
