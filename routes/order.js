const express = require('express');
const router = express.Router();

const models = require('../app/models/db.js');

//**********************
// Place an Order
//**********************
router.post('/placeOrder', (req, res) => {
    const {
        admin_id, //this is the organization's id
        type,
        dist_id,
        rep_id,
        total_price,
        weeklySet, //an array with inventory objects for current order
    } = req.body;

    return models.Logs.create({
        admin_id,
        type: 3,
        dist_id,
        rep_id,
        total_price,
    }, {
        returning: true,
        plain: true,
    }
    )
        .then((log) => {
            weeklySet.forEach((weeklyItem) => {
                models.LogsProducts.create({
                    log_id: log.id,
                    dist_products_id: weeklyItem.id,
                    qty: weeklyItem.qty,
                });
            });
            return log.id;
        })
        .then((result) => {
            res.send('Order Logged');
        })
        .catch((error) => {
            console.error(error);
        });

});

//**********************
// Get Any Order
//**********************

// Just use the route for Get Any Inventory

//**********************
// Get All Orders
//**********************
router.get('/getAllOrders/:orgId', (req, res) => {
    const {
        orgId,
    } = req.params;
    models.Logs.findAll({
        where: {
            admin_id: orgId,
            type: 3, //this will pull only your orders
        },
        include: [{
            model: models.LogsProducts,
            include: [{
                model: models.DistributorsProducts,
                include: [{
                    model: models.Products,
                }]
            }]
        }]
    })
        .then((inventories) => {
            res.status(200).json(inventories);
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send(error);
        })
})


//**********************
// Delete an Order
//**********************

// I took this out. Why would the client need to delete the log of an order?
// I can reinstall it if we want to support that kind of madness

module.exports = router;