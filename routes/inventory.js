const express = require('express');
const router = express.Router();

const models = require('../app/models/db.js');

//**********************
// Initialize Inventory
//**********************
router.post('/initialize', (req, res) => {
    const {
        admin_id,
        type,
        dist_id,
        rep_id,
        total_price,
        masterSet, //an array with inventory objects for par list
        currentSet, //an array with inventory objects for current inventory level
    } = req.body;

    // let master = 0;

    const makeMaster = () => {
        return models.Logs.create({
            admin_id,
            type: 1,
            dist_id,
            rep_id,
        }, {
            returning: true,
            plain: true,
        }
        )
            .then((log) => {

                // master = log.id;

                masterSet.forEach((masterItem) => {
                    models.LogsProducts.create({
                        log_id: log.id,
                        dist_products_id: masterItem.id,
                        qty: masterItem.qty,
                    });
                });

                return log.id;
            })
            .then((master) => {
                models.Organizations.update({
                    master_inventory: master,
                }, {
                    where: {
                        id: admin_id,
                    }
                })
            })
            .then((result) => {
                res.send('Master Initialized');
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const makeCurrent = () => {
        let payments = currentSet.map((currentItem) => currentItem.price * currentItem.qty);
        let totalPayment = payments.reduce((a, b) => a + b, 0)
        return models.Logs.create({
            admin_id,
            type: 5,
            dist_id,
            rep_id,
            total_price: totalPayment,
        }, {
            returning: true,
            plain: true,
        }
        )
            .then((log) => {
                currentSet.forEach((currentItem) => {
                    models.LogsProducts.create({
                        log_id: log.id,
                        dist_products_id: currentItem.id,
                        qty: currentItem.qty,
                    });
                });
                return log.id;
            })
            .then((current) => {
                models.Organizations.update({
                    current_inventory: current,
                }, {
                    where: {
                        id: admin_id,
                    }
                })
            })
            .then((result) => {
                res.status(201).send('Weekly Initialized');
            })
            .catch((error) => {
                console.error(error);
            });
    };

    Promise.all([makeMaster(), makeCurrent()])
        .then((values) => {
            console.log(values);
        });
});


//**********************
// Get Master Inventory
//**********************
router.get('/getMaster/:orgId', (req, res) => {
    const {
        orgId,
    } = req.params;
    models.Logs.findAll({
        where: {
            admin_id: orgId,
            type: 1,
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
        .then((master) => {
            res.status(200).json(master);
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send(error);
        })
})




//*************************
// Update Master Inventory
//*************************
router.put('/api/updateMaster/:masterId', (req, res) => {
    const {
        masterId,
    } = req.params;
    const {
        masterSet,
    } = req.body;
    masterSet.forEach((masterItem) => {
        return models.LogsProducts.upsert({
            id: masterItem.id,
            logId: masterId,
            distributorsProductId: masterItem.distributorsProductId,
            qty: masterItem.qty,
        })
            .then((upserted) => {
                console.log(upserted);
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send(error);
            })
    });
    res.status(201).send('Updated Master');
});


//**********************
// Get Current Inventory
//**********************
router.get('/getCurrent/:orgId', (req, res) => {
    const {
        orgId,
    } = req.params;
    models.Logs.findAll({
        where: {
            admin_id: orgId,
            type: 5,
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
        .then((master) => {
            res.status(200).json(master);
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send(error);
        })
})

//**************************
// Update Current Inventory
//**************************
router.put('/updateCurrent/:currentId', (req, res) => {
    const {
        currentId,
    } = req.params;
    const {
        currentSet,
    } = req.body;
    currentSet.forEach((currentItem) => {
        return models.LogsProducts.upsert({
            id: currentItem.id,
            logId: currentId,
            distributorsProductId: masterItem.distributorsProductId,
            qty: currentItem.qty,
        })
            .then((upserted) => {
                console.log(upserted);
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send(error);
            })
    });
    res.status(201).send('Updated Current Inventory');
});

//**********************
// Get Any Inventory
//**********************
router.get('/api/getInvent/:invId', (req, res) => {
    const {
        invId,
    } = req.params;
    models.Logs.findOne({
        where: {
            id: invId,
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
        .then((inventory) => {
            res.status(200).json(inventory);
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send(error);
        })
})

//**********************
// Get All Inventories
//**********************
router.get('/getAllInvents/:orgId', (req, res) => {
    const {
        orgId,
    } = req.params;
    models.Logs.findAll({
        where: {
            admin_id: orgId,
            type: 1 || 5 || 2, //this will pull your master, current, and weekly logs
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
// Make a Weekly Log
//**********************
router.post('/makeWeekly', (req, res) => {
    const {
        admin_id,
        type,
        dist_id,
        rep_id,
        total_price,
        weeklySet, //an array with inventory objects for current inventory level
    } = req.body;

    return models.Logs.create({
        admin_id,
        type: 2,
        dist_id,
        rep_id,
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
            res.send('Weekly Logged');
        })
        .catch((error) => {
            console.error(error);
        });

});

module.exports = router;