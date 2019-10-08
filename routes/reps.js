const express = require('express');
const router = express.Router();

const models = require('../app/models/db.js');

//**********************
// Create Rep
//**********************
router.post('/api/createRep', (req, res) => {
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
            res.status(201).send('Rep Created');
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send(error);
        });
});

//**********************
// Update Rep
//**********************
router.put('/api/updateRep/:id', (req, res) => {
    const {
        id,
    } = req.params;
    const {
        first_name,
        last_name,
        email,
        phone,
    } = req.body;
    models.Reps.update({
        org_name,
        first_name,
        last_name,
        email,
        phone,
    }, {
        where: {
            id,
        },
        returning: true,
        plain: true,
    })
        .then((org) => {
            res.status(201).send(org);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send(error);
        })
})

//**********************
// Delete Rep
//**********************
router.delete('/api/deleteRep/:id', (req, res) => {
    const {
        id,
    } = req.params;
    models.Reps.destroy({
        where: {
            id,
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

//******************************
// Get ALL Distributor Reps
//******************************
router.get('/api/getAllDistReps/:id', (req, res) => {
    const {
        id,
    } = req.params;
    models.Reps.findAll({
        where: {
            dist_id: id,
        },
    })
        .then((result) => {
            res.status(200).json(result);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send(error);
        });
});

module.exports = router;