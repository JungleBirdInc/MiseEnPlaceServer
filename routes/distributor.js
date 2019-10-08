const express = require('express');
const router = express.Router();

const models = require('../app/models/db.js');

//**********************
// Create Distributor
//**********************
app.post('/createDist', (req, res) => {
    const {
        orgId,
        name,
        address,
        city,
        state,
        zip,
        phone,
        email,
    } = req.body;
    //distributor doesn't already exist
    const createDist = () => {
        models.Distributors.create({
            name,
            address,
            city,
            state,
            zip,
            phone,
            email,
        })
            .then((dist) => {
                models.DistOrgs.create({
                    dist_id: dist.id,
                    org_id: orgId,
                });
            })
            .then(() => {
                console.log('Successfully CREATED!');
            })
            .catch((error) => {
                console.error(error);
            });
    }
    //distributor already exists
    const addDist = (dist) => {
        console.log(dist);
        models.DistOrgs.create({
            dist_id: dist.organizationId,
            org_id: orgId,
        })
            .then(() => {
                console.log('Successfully ADDED!');
            })
            .catch((error) => {
                console.error(error);
            });
    }
    // this is what runs when the api is called upon
    models.Distributors.findOne({
        where: {
            name,
        }
    })
        .then((dist) => {
            if (dist) {
                addDist(dist); // adds a distributor relation if dist already exists
            } else {
                createDist(); // creates a dist and adds relation if dist doesn't exist
            }
        })
        .then(() => {
            res.status(201).send('Distributor Created');
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send(error);
        });
});

//**********************
// Update Distributor
//**********************
app.put('/updateDist/:id', (req, res) => {
    const {
        id,
    } = req.params;
    const {
        name,
        address,
        city,
        state,
        zip,
        phone,
        email,
    } = req.body;
    models.Distributors.update({
        name,
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
// Delete Distributor
//**********************
app.delete('/deleteDist/:id', (req, res) => {
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
});

//**********************
// Get A Distributor
//**********************
app.get('/getDist/:distId', (req, res) => {
    const {
        distId,
    } = req.params;
    models.Distributors.findOne({
        where: {
            id: distId,
        },
        include: [{
            model: models.Reps,
        }]
    })
        .then((dist) => {
            res.status(200).json(dist);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json(error);
        })
})

//**********************
// Get All Distributors
//**********************
app.get('/getAllDists/:orgId', (req, res) => {
    const {
        orgId,
    } = req.params;
    console.log(orgId);
    models.DistOrgs.findAll({
        where: {
            org_id: orgId,
        },
        include: [{
            model: models.Distributors,
            include: [{
                model: models.Reps,
            }]
        }]
    })
        .then((dists) => {
            res.status(200).json(dists);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json(error);
        })
})

module.exports = router;