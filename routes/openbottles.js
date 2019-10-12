const express = require('express');
const router = express.Router();

const models = require('../app/models/db.js');

//**********************
// Add/Update Open Bottles
//**********************
router.put('/newWeights/:orgId', (req, res) => {
    const {
        bottleSet,
    } = req.body;
    const {
        orgId,
    } = req.params;
    bottleSet.forEach((bottle) => {
        return models.OpenBottles.upsert({
            id: bottle.id,
            org_id: orgId,
            product_id: bottle.product_id,
            weight: bottle.weight,
        })
            .then((upserted) => {
                console.log(upserted);
                res.end('STATUS: 201. Weight Updated!');
            })
            .catch((error) => {
                console.error(error);
                res.send('STATUS: 500.');
                res.send(error);
            })
    });
})


//**********************
// Get All Open Bottles
//**********************
router.get('/getAll/:orgId', (req, res) => {
    const {
        orgId
    } = req.params;
    return models.OpenBottles.findAll({
        where: {
            org_id: orgId,
        },
        include: [{
            model: models.DistributorsProducts,
            include: [{
                model: models.Products,
            }]
        }]
    })
        .then((openBottles) => {
            res.status(200).json(openBottles);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send(error);
        })
})

//**********************
// Get a Bottle
//**********************
router.get('/:upc', (req, res) => {
    const {
        upc,
    } = req.params;
    models.Products.findOne({
        where: {
            upc,
        }
    })
    .then((bottle) => {
    return models.OpenBottles.findOne({
        where: {
            product_name: bottle.product_name,
        },
        include: [{
            model: models.DistributorsProducts,
            include: [{
                model: models.Products,
            }]
        }],
    })
    })
    .then((openBottle) => {
        res.status(200).json(openBottle);
    })
    .catch((error) => {
        res.status(500).send(error);
    })
})

//**********************
// Update a Bottle
//**********************
router.put(('/weight/:bottleId', (req, res) => {
    const {
        bottleId,
    } = req.params;
    const {
        weight,
    } = req.body;
    models.OpenBottles.findOne({
        where: {
            id: bottleId,
        }
    })
    .then((bottle) => {
        return models.OpenBottles.update({
            id: bottle.id,
            weight: weight,
        })
    })
    .then((updatedBottle) => {
        res.status(200).json(updatedBottle);
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send(error);
    })
}))

//**********************
// Delete a Bottle
//**********************
router.delete('/delete/:bottleId', (req, res) => {
    const {
        bottleId,
    } = req.params;
    models.OpenBottles.destroy({
        where: {
            id: bottleId,
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