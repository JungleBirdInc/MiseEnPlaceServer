require('dotenv').config();

const express = require("express");
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const axios = require('axios');
const moment = require('moment');

const models = require('./app/models/db.js');
const user = require('./routes/user.js');
const distributor = require('./routes/distributor.js');
const inventory = require('./routes/inventory.js');
const invoice = require('./routes/invoice.js');
const openBottles = require('./routes/openbottles.js');
const order = require('./routes/order.js');
const organization = require('./routes/organization.js');
const product = require('./routes/product.js');
const reps = require('./routes/reps.js');
const forecasting = require('./routes/forecasting.js');

const app = express();
const router = express.Router();

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
const pathway = path.join(__dirname, '../miseenplace/src/index.html');

// serve static files
app.use(express.static(pathway));



// serve up some tasty routes
//*************************************************************************************** */
app.use('/user', user);
//*************************************************************************************** */
/* ROUTE: "Create User"
 *  ~ endpoint: '/user/create'
 *  ~ method: POST
 *  ~ creates a user
 * ROUTE: "Update User"
 *  ~ endpoint: '/user/update/:id'
 *  ~ method: PUT
 *  ~ updates a user
 * ROUTE: "Delete User"
 *  ~ endpoint: '/user/delete/:id'
 *  ~ method: DELETE
 *  ~ deletes a user
 * ROUTE: "Get All Users"
 * ~ endpoint: '/user/getAll/:id'
 * ~ method: GET
 * ~ gets all user for an organization
//*************************************************************************************** */
app.use('/distributor', distributor);
//*************************************************************************************** */
/* ROUTE: "Create Distributor"
 *  ~ endpoint: '/distributor/create'
 *  ~ method: POST
 *  ~ creates a distributor
 * ROUTE: "Update Distributor"
 *  ~ endpoint: '/distributor/update/:id'
 *  ~ method: PUT
 *  ~ updates a distributor
 * ROUTE: "Delete Distributor"
 *  ~ endpoint: '/distributor/delete/:id'
 *  ~ method: DELETE
 *  ~ deletes a distributor
 * ROUTE: "Get a Distributor"
 *  ~ endpoint: '/distributor/getOne/:distId'
 *  ~ method: GET
 *  ~ gets an individual distributor by its id
 * ROUTE: "Get all Distributors"
 *  ~ endpoint: '/distributor/getAll/:orgId'
 *  ~ method: GET
 *  ~ gets all distributors for an organization by the organization's id
 * 
//*************************************************************************************** */
app.use('/inventory', inventory);
//*************************************************************************************** */
/* ROUTE: "Initialize Inventory"
 *  ~ endpoint: '/inventory/initialize'
 *  ~ method: POST
 *  ~ initializes inventory for an organization. creates a master inventory with pars
 *      then sets that inventory as the master inventory for the org
 *  ~ creates a current inventory from an organization, and then updates the organization
 *      to reflect that assignment
 * ROUTE: "Get Master Inventory"
 *  REFACTOR REFACTOR REFACTOR (combine with other get inventories)
 *  ~ endpoint: '/inventory/getMaster/:orgId'
 *  ~ method: GET
 *  ~ retrieves the master par list for an organization
 * ROUTE: "Update Master Inventory"
 *  ~ endpoint: '/inventory/updateMaster/:masterId'
 *  ~ method: PUT
 *  ~ updates the par levels for the master inventory. If a new product and par are
 *      detected, creates a new entry on the master
 *  ~ masterId is the id of the master inventory.
 * ROUTE: "Get Current Inventory"
 *  REFACTOR REFACTOR REFACTOR (combine with other get inventories)
 *  ~ endpoint: '/inventory/getCurrent/:orgId'
 *  ~ method: GET
 *  ~ gets the current inventory levels for an organization
 * ROUTE: "Update Current Inventory"
 *  ~ endpoint: '/inventory/updateCurrent/:currentId'
 *  ~ method: PUT
 *  ~ updates the current inventory. Will create new entries if existing entry is detected.
 *      WILL NOT update par levels, so make sure you update master if the items will be reordered
 * ROUTE: "Get ANY Inventory"
 *  REFACTOR REFACTOR REFACTOR (combine with other get inventories)
 *  ~ endpoint: '/inventory/getOne/:invId'
 *  ~ method: GET
 *  ~ gets an inventory by id number
 * ROUTE: "Get ALL Inventories"
 *  ~ endpoint: '/inventory/getAll/:orgId'
 *  ~ method: GET
 *  ~ gets all relevant inventories for an account, including master and current.
 *       DO NOT display master and current as logs. Remove them from the array before populating lists
 * ROUTE: "Make a Weekly Log"
 *  ~ endpoint: '/inventory/makeWeekly'
 *  ~ method: POST
 *  ~ takes the current inventory levels, and makes a record of them. 
//*************************************************************************************** */
app.use('/invoice', invoice);
//*************************************************************************************** */
/* ROUTE: "Record an Invoice"
 *  ~ endpoint: '/invoice/record'
 *  ~ method: POST
 *  ~ records an incoming invoice
 * ROUTE: "Get Any Invoice"
 *  ~ endpoint: '/inventory/getInvent/:invId'
 *  ~ method: GET
 *  ~ get any invoice. Same route as get any inventory. 
 * ROUTE: "Get All Invoices"
 *  ~ endpoint: '/invoice/getAll/:orgId'
 *  ~ method: GET
 *  ~ gets all invoice records for a distributor
 * ROUTE: "Delete an Invoice"
 *  ~ endpoint: '/invoice/delete/:receiptId'
 *  ~ method: DELETE
 *  ~ deletes the record of an invoice
//*************************************************************************************** */
app.use('/openBottles', openBottles);
//*************************************************************************************** */
/* ROUTE: "Add/Update Open Bottles"
 *  ~ endpoint: '/openBottles/newWeights/:orgId'
 *  ~ method: PUT
 *  ~ records the new weights of open bottles. New entries will be created if a bottle isnt found
 * ROUTE: "Get All Open Bottles"
 *  ~ endpoint: '/openBottles/getAll/:orgId'
 *  ~ method: GET
 *  ~ get all open bottles for an organization. 
 * ROUTE: "Delete a Bottle"
 *  ~ endpoint: '/openBottles/delete/:bottleId'
 *  ~ method: GET
 *  ~ gets all invoice records for a distributor
//*************************************************************************************** */
app.use('/order', order);
//*************************************************************************************** */
/* ROUTE: "Place an Order"
    REFACTOR REFACTOR REFACTOR ( CURRENTLY DOES NOT PLACE THE ORDER )
 *  ~ endpoint: 'order/send'
 *  ~ method: POST
 *  ~ records a new order
 * ROUTE: "Get Any Order"
 *  ~ endpoint: '/inventory/getOne/:invId'
 *  ~ method: GET
 *  ~ same route as get any inventory
 * ROUTE: "Get All Orders"
 *  ~ endpoint: '/order/getAll/:orgId'
 *  ~ gets all order records for an organization
//*************************************************************************************** */
app.use('/organization', organization);
//*************************************************************************************** */
/* ROUTE: "Create Organization"
    REFACTOR REFACTOR REFACTOR (Should update user with orgId after creation)
 *  ~ endpoint: '/organization/create'
 *  ~ method: POST
 *  ~ creates an organization
 * ROUTE: "Update Organization"
 *  ~ endpoint: '/organization/update/:id'
 *  ~ method: PUT
 *  ~ updates the organization, selected by its id number
 * ROUTE: "Delete an Organization"
 *  ~ endpoint: '/organization/delete/:id'
 *  ~ method: DELETE
 *  ~ deletes an organization
//*************************************************************************************** */
app.use('/product', product);
//*************************************************************************************** */
/* ROUTE: "Create a Product"
    REFACTOR REFACTOR REFACTOR ( This needs to be an upsert )
 *  ~ endpoint: '/product/create'
 *  ~ method: POST
 *  ~ creates a new Product. searches by UPC code and selects that product if it already exists
 * ROUTE: "Get A Distributor Product"
 *  ~ endpoint: '/product/getOne/:id'
 *  ~ method: GET
 *  ~ gets a product from a distributor list by the product's id
 * ROUTE: "Get ALL Distributor Products"
 *  ~ endpoint: '/product/getAll/:id'
 *  ~ method: GET
 *  ~ gets all products for a distributor by the distributor id
//*************************************************************************************** */
app.use('/reps', reps);
//*************************************************************************************** */
/* ROUTE: "Create a Rep"
 *  ~ endpoint: '/reps/create'
 *  ~ method: POST
 *  ~ creates a rep
 * ROUTE: "Update Rep"
 *  ~ endpoint: '/reps/update/:id'
 *  ~ method: PUT
 *  ~ updates a reps information
 * ROUTE: "Delete an Organization"
 *  ~ endpoint: '/reps/delete/:id'
 *  ~ method: DELETE
 *  ~ deletes a rep
 * ROUTE: "Get All Reps"
 *  ~ endpoint: '/reps/getAll/:id'
 *  ~ method: GET
 *  ~ gets all reps from a distributor by it's id
//*************************************************************************************** */
app.use('/forecasting', forecasting);
//*************************************************************************************** */
/*
 *
 *
 *
 *
 *
 *
 *
*/






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
        categoryId,
        subcategoryId,
        btlSizeId,
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
            categoryId,
            subcategoryId,
            btlSizeId,
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
            include: [{
                model: models.Subcategories,
                include: [{
                    model: models.Categories,
                }]
            }]
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
            include: [{
                model: models.Subcategories,
                include: [{
                    model: models.Categories,
                }]
            }]
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
// Delete Rep
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
app.put('/api/updateMaster/:masterId', (req, res) => {
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
app.put('/api/updateCurrent/:currentId', (req, res) => {
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
app.get('/api/getInvent/:invId', (req, res) => {
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
app.get('/api/getAllInvents/:orgId', (req, res) => {
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
app.post('api/makeWeekly', (req, res) => {
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


//*************************************************************************************** */

//**********************
// Place an Order
//**********************
app.post('api/placeOrder', (req, res) => {
    const {
        admin_id,
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
            res.send('Weekly Logged');
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
app.get('/api/getAllOrders/:orgId', (req, res) => {
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

//*************************************************************************************** */

//**********************
// Post an invoice
//**********************
app.post('api/recordInvoice', (req, res) => {
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
app.get('/api/getAllInvoices/:orgId', (req, res) => {
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
app.delete('/api/deleteInvoice/:receiptId', (req, res) => {
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

//*************************************************************************************** */

//**********************
// Add/Update Open Bottles
//**********************
app.put('/api/newWeights/:orgId', (req, res) => {
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
app.get('/api/getAllBottles/:orgId', (req, res) => {
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
    app.delete('/api/deleteInvoice/:receiptId', (req, res) => {
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