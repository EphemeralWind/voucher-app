require("dotenv").config();

const path = require('path');
//const bodyParser = require('body-parser');
const express = require('express');

const app = express();
const port = 3001;

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({extended:false}));

// parse application/json
app.use(express.json());

const publicPath = path.join(__dirname, 'build');
app.use(express.static(publicPath));
app.use('/static', express.static(path.join(publicPath, 'static')));

app.use('/api/promo', require('./api/promos'));
app.use('/api/vouchers', require('./api/vouchers'));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('*', function(request, response) {
  response.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
