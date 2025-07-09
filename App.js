const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const apiRoutes = require('./routes/Api');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('Gmail-like MVC Server is running');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
