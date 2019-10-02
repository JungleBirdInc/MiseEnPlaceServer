require('dotenv').config();

const express = require("express");
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const moment = require('moment');

const app = express();

app.use(bodyParser.urlencoded({
    extended: true,
}));
app.use(bodyParser.json());
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}));

// serve static files
app.use(express.static(`${__dirname}/../client/dist`));










// force requests to client files
app.get('*', (req, res) => {
    res.sendFile(path.resolve(`${__dirname}/../client/dist/index.html`));
});

const port = process.env.port || 3000;


app.listen(3000, () =>
    console.log('Example app listening on port 3000!'),
);