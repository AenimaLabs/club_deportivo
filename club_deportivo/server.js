

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;
const DATA_FILE = 'ports.json';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Helper functions
const readData = () => {
  if (!fs.existsSync(DATA_FILE)) {
    return { deportes: [] };
  }
  const rawData = fs.readFileSync(DATA_FILE);
  try {
    const data = JSON.parse(rawData);
    return data;
  } catch (e) {
    return { deportes: [] };
  }
};

const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// Ensure the default sport is added if the file is empty
const initializeDefaultSport = () => {
  const data = readData();
  if (!data ||!data.deportes || data.deportes.length === 0) {
    data.deportes = [{ nombre: 'Fútbol', precio: '100' }];
    writeData(data);
  }
};

// Routes
app.get('/deportes', (req, res) => {
  const data = readData();
  res.json(data);
});

app.post('/agregar', (req, res) => {
  const { nombre, precio } = req.body;
  const data = readData();
  data.deportes.push({ nombre, precio });
  writeData(data);
  res.send('Deporte agregado');
});

app.post('/editar', (req, res) => {
  const { nombre, precio } = req.body;
  const data = readData();
  const deporte = data.deportes.find(d => d.nombre === nombre);
  if (deporte) {
    deporte.precio = precio;
    writeData(data);
    res.send('Deporte editado');
  } else {
    res.send('Deporte no encontrado');
  }
});

app.post('/eliminar', (req, res) => {
  const { nombre } = req.body;
  let data = readData();
  data.deportes = data.deportes.filter(d => d.nombre!== nombre);
  writeData(data);
  res.send('Deporte eliminado');
});

// Initialize the default sport if needed
initializeDefaultSport();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});