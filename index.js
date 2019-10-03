require('dotenv').config();

const express = require("express");
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const axios = require('axios');
const moment = require('moment');

const models = require('./app/models/db.js');

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
// date: models.sequelize.literal('CURRENT_TIMESTAMP'),

// Variable that syncs up our two repo paths
console.log(__dirname);
const pathway = path.join(__dirname, '../miseenplace/src/index.html');

// serve static files
app.use(express.static(pathway));



//**********************
// Create User
//**********************
app.post('/api/createUser', (req, res) => {
    const {
        role_id,
        first_name,
        last_name,
        email,
        org_id,
        password,
    } = req.body;
    models.Users.create({
        role_id,
        first_name,
        last_name,
        email,
        org_id,
        password,
    })
        .then(() => {
            res.send(201);
        })
        .catch((error) => {
            console.error(error);
        });
});

//**********************
// Create Organization
//**********************
app.post('/api/createOrg', (req, res) => {
    const {
        org_name,
        master_inventory,
        address,
        city,
        state,
        zip,
        phone,
        email,
    } = req.body;
    models.Organizations.create({
        org_name,
        master_inventory,
        address,
        city,
        state,
        zip,
        phone,
        email,
    })
        .then(() => {
            res.send(201);
        })
        .catch((error) => {
            console.error(error);
        });
});

//**********************
// Create Distributor
//**********************
app.post('/api/createDist', (req, res) => {
    const {
        name,
        address,
        city,
        state,
        zip,
        phone,
        email,
    } = req.body;
    models.Distributors.create({
        name,
        address,
        city,
        state,
        zip,
        phone,
        email,
    })
        .then(() => {
            res.send(201);
        })
        .catch((error) => {
            console.error(error);
        });
});

//**********************
// Create Product
//**********************
app.post('/api/createProduct', (req, res) => {
    const {
        upc,
        product_name,
        category_id,
        sub_category_id,
        size,
        notes,
        tare,
        dist_id,
        price,
    } = req.body;
    models.Products.findOrCreate({
        where: {
            upc,
        },
        defaults: {
            upc,
            product_name,
            category_id,
            sub_category_id,
            size,
            notes,
            tare,
        },
        returning: true,
        plain: true,
    })
        .then((product) => {
            models.DistributorsProducts.findOrCreate({
                where: {
                    products_id: product[0].id,
                },
                defaults: {
                    dist_id,
                    price,
                    products_id: product[0].id,
                    
                }
            })
        })
        .then((data) => {
            res.send(201);
        })
        .catch((error) => {
            console.error(error);
        });
});

//**********************
// Create Rep
//**********************
app.post('/api/createRep', (req, res) => {
    const {
        first_name,
        last_name,
        email,
        phone,
        dist_id,
    } = req.body;
    models.Reps.create({
        first_name,
        last_name,
        email,
        phone,
        dist_id,
    })
        .then(() => {
            res.send(201);
        })
        .catch((error) => {
            console.error(error);
        });
});







// force requests to client files
app.get('*', (req, res) => {
    res.sendFile(path.resolve(pathway));
});

const port = process.env.port || 3000;


app.listen(port, () =>
    console.log('Example app listening on port 3000!'),
);