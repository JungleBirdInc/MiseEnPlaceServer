const express = require('express');
const router = express.Router();

const models = require('../app/models/db.js');

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
            res.status(201).send('Organization Created');
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send(error);
        });
});

//**********************
// Update Organization
//**********************
app.put('/api/updateOrg/:id', (req, res) => {
    const {
        id,
    } = req.params;
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
    models.Organizations.update({
        org_name,
        master_inventory,
        address,
        city,
        state,
        zip,
        phone,
        email,
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
// Delete Org
//**********************
app.delete('/api/deleteOrg/:id', (req, res) => {
    const {
        id,
    } = req.params;
    models.Organizations.destroy({
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
})


module.exports = router;