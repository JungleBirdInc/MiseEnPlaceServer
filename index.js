require('dotenv').config();

const express = require("express");
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const axios = require('axios');
const moment = require('moment');

const models = require('./app/models/db.js');

const app = express();

app.use(bodyParser.urlencoded({
    extended: true,
}));
app.use(bodyParser.json());
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}));
// date: models.sequelize.literal('CURRENT_TIMESTAMP'),

// Variable that syncs up our two repo paths
console.log(__dirname);
const pathway = path.join(__dirname, '../miseenplace/src/index.html');

// serve static files
app.use(express.static(pathway));

//*************************************************************************************** */

//**********************
// Create User
//**********************
app.post('/api/createUser', (req, res) => {
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


//*************************************************************************************** */


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

//*************************************************************************************** */

//**********************
// Create Distributor
//**********************
app.post('/api/createDist', (req, res) => {
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
app.put('/api/updateDist/:id', (req, res) => {
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
app.delete('/api/deleteDist/:id', (req, res) => {
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
app.get('/api/getDist/:distId', (req, res) => {
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
app.get('/api/getAllDists/:orgId', (req, res) => {
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

//*************************************************************************************** */

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



//*************************************************************************************** */

//**********************
// Create Rep
//**********************
app.post('/api/createRep', (req, res) => {
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
app.put('/api/updateRep/:id', (req, res) => {
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
// Delete Distributor
//**********************
app.delete('/api/deleteRep/:id', (req, res) => {
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
app.get('/api/getAllDistReps/:id', (req, res) => {
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

//*************************************************************************************** */

//**********************
// Initialize Inventory
//**********************
app.post('/api/initialize', (req, res) => {
    const {
        admin_id,
        type,
        dist_id,
        rep_id,
        total_price,
        masterSet, //an array with inventory objects for par list
        weeklySet, //an array with inventory objects for current inventory level
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
        },{
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
        let payments = weeklySet.map((currentItem) => currentItem.price * currentItem.qty);
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
                return weeklySet.forEach((currentItem) => {
                    models.LogsProducts.create({
                        log_id: log.id,
                        dist_products_id: currentItem.id,
                        qty: currentItem.qty,
                    });
                });
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
app.get('/api/getMaster/:orgId', (req, res) => {
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
// app.put('/api/updateMaster/:masterId', (req, res) => {
//     const {
//         masterId,
//     } = req.params;
//     model.

// })


//**********************
// Get Current Inventory
//**********************
app.get('/api/getCurrent/:orgId', (req, res) => {
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

//**********************
// Get Any Inventory
//**********************

//**********************
// Get All Inventories
//**********************

//*************************************************************************************** */

//**********************
// Place an Order
//**********************

//**********************
// Get Any Order
//**********************

//**********************
// Get All Orders
//**********************

//**********************
// Delete an Order
//**********************

//*************************************************************************************** */

//**********************
// Post an invoice
//**********************

//**********************
// Get Any Invoice
//**********************

//**********************
// Get All Invoices
//**********************

//**********************
// Delete An Invoice
//**********************

//*************************************************************************************** */

//**********************
// Add Open Bottle
//**********************

//**********************
// Update Open Bottle
//**********************

//**********************
// Get All Open Bottles
//**********************


//*************************************************************************************** */

//**********************
// Forecasting
//**********************

//*************************************************************************************** */










// force requests to client files
app.get('*', (req, res) => {
    res.sendFile(path.resolve(pathway));
});

const port = process.env.port || 3000;


app.listen(port, () =>
    console.log('Example app listening on port 3000!'),
);