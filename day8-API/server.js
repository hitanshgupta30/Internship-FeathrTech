const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let notes = [
  {
    id: 1,
    title: "My First Note",
    content: "I am learning Node.js and Express"
  },
  {
    id: 2,
    title: "React",
    content: "I am learning React"
  }
];

let nextId = 3;

app.get('/', (req, res) => {
  res.json({ message: 'Backend is running successfully!' });
});

app.get('/notes', (req, res) => {
  res.json(notes);
});

app.get('/notes/:id', (req, res) => {
  const note = notes.find((n) => n.id === Number(req.params.id));

  if (!note) {
    return res.status(404).json({ message: 'Note not found' });
  }

  res.json(note);
});

app.post('/notes', (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  const newNote = {
    id: nextId++,
    title,
    content,
  };

  notes.push(newNote);
  res.status(201).json(newNote);
});

app.put('/notes/:id', (req, res) => {
  const note = notes.find((n) => n.id === Number(req.params.id));

  if (!note) {
    return res.status(404).json({ message: 'Note not found' });
  }

  const { title, content } = req.body;

  if (title !== undefined) note.title = title;
  if (content !== undefined) note.content = content;

  res.json(note);
});

app.delete('/notes/:id', (req, res) => {
  const index = notes.findIndex((n) => n.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ message: 'Note not found' });
  }

  notes.splice(index, 1);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
