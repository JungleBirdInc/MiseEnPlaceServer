const express = require('express');
const router = express.Router();

const models = require('../app/models/db.js');

//**********************
// Post an invoice
//**********************
router.post('/recordInvoice', (req, res) => {
    const {
        admin_id,
        type,
        dist_id,
        rep_id,
        total_price,
        receiptSet, //an array with inventory objects for current inventory level
    } = req.body;

    return models.Logs.create({
        admin_id,
        type: 4,
        dist_id,
        rep_id,
        total_price,
    }, {
        returning: true,
        plain: true,
    }
    )
        .then((log) => {
            receiptSet.forEach((receiptItem) => {
                models.LogsProducts.create({
                    log_id: log.id,
                    dist_products_id: receiptItem.id,
                    qty: receiptItem.qty,
                });
            });
            return log.id;
        })
        .then((result) => {
            res.send('Invoice Logged');
        })
        .catch((error) => {
            console.error(error);
        });
});

//**********************
// Get Any Invoice
//**********************

//see get any order / get any inventory

//**********************
// Get All Invoices
//**********************
router.get('/getAllInvoices/:orgId', (req, res) => {
    const {
        orgId,
    } = req.params;
    models.Logs.findAll({
        where: {
            admin_id: orgId,
            type: 4, //this will pull only your invoices
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
        .then((invoices) => {
            res.status(200).json(invoices);
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send(error);
        })
})

//**********************
// Delete An Invoice
//**********************
router.delete('/deleteInvoice/:receiptId', (req, res) => {
    const {
        receiptId,
    } = req.params;
    models.Reps.destroy({
        where: {
            id: receiptId,
        },
    })
        .then(() => {
            res.send({
                deleted: true
            });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send(error);
        });
});


module.exports = router;