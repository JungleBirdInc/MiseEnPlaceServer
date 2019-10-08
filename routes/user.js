const express = require('express');
const router = express.Router();

const models = require('../app/models/db.js');

//**********************
// Create User
//**********************
router.post('/createUser', (req, res) => {
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
            res.status(201).send('User Created');
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send(error);
        });
});

//**********************
// Update User
//**********************
app.put('/api/updateUser/:id', (req, res) => {
    const {
        id,
    } = req.params;
    const {
        role_id,
        first_name,
        last_name,
        email,
        org_id,
        password,
    } = req.body;
    models.Users.update({
        role_id,
        first_name,
        last_name,
        email,
        org_id,
        password,
    }, {
        where: {
            id,
        },
        returning: true,
        plain: true,
    })
        .then((user) => {
            res.status(201).send(user);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send(error);
        })
})

//**********************
// Delete User
//**********************
app.delete('/api/deleteUser/:id', (req, res) => {
    const {
        id,
    } = req.params;
    models.Users.destroy({
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

//***********************************
// Get ALL Users of an Organization
//***********************************
app.get('/api/getAllUsers/:id', (req, res) => {
    const {
        id,
    } = req.params;
    models.Users.findAll({
        where: {
            org_id: id,
        }
    })
        .then((users) => {
            res.status(200).json(users);
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send(error);
        })
})


module.exports = router;