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
router.get('/getAllBottles/:orgId', (req, res) => {
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
// Delete a Bottle
//**********************
router.delete('/deleteBottle/:bottleId', (req, res) => {
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