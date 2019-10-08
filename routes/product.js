const express = require('express');
const router = express.Router();

const models = require('../app/models/db.js');

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
            res.status(201).send('Product Created');
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send(error);
        });
});

//***************************
// Get a DistributorProduct
//***************************
app.get('/api/getDistProd/:id', (req, res) => {
    const {
        id,
    } = req.params;
    models.DistributorsProducts.findOne({
        where: {
            id,
        },
        include: [{
            model: models.Products,
            include: [{
                model: models.Subcategories,
                include: [{
                    model: models.Categories,
                }]
            }]
        }]
    })
        .then((result) => {
            console.log(result);
            res.status(200).json(result);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send(error);
        });
});

//******************************
// Get ALL DistributorProducts
//******************************
app.get('/api/getAllDistProd/:id', (req, res) => {
    const {
        id,
    } = req.params;
    models.DistributorsProducts.findAll({
        where: {
            dist_id: id,
        },
        include: [{
            model: models.Products,
            include: [{
                model: models.Subcategories,
                include: [{
                    model: models.Categories,
                }]
            }]
        }]
    })
        .then((result) => {
            console.log(result);
            res.status(200).json(result);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send(error);
        });
});


module.exports = router;