require('rootpath')();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('_middleware/error-handler');
const path = require('path');
const db = require('./config/db');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors({ origin: '*' }));

// api routes
app.use("/api", require('./routes'));

// global error handler
app.use(errorHandler);
const uploads = path.join(__dirname, 'uploads');
app.use(express.static(uploads));

// start server
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 5050) : 5050;

app.listen(port, () => console.log('Server listening on port ' + port));