require('dotenv').config();

const express = require("express");
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const axios = require('axios');
const moment = require('moment');
const Fuse = require('fuse.js');
const cors = require('cors');
const multer = require('multer');

const models = require('./app/models/db.js');
const upload = require('./upload');
const user = require('./routes/user.js');
const distributor = require('./routes/distributor.js');
const inventory = require('./routes/inventory.js');
const invoice = require('./routes/invoice.js');
const openBottles = require('./routes/openbottles.js');
const order = require('./routes/order.js');
const organization = require('./routes/organization.js');
const product = require('./routes/product.js');
const reps = require('./routes/reps.js');
const categories = require('./routes/categories.js');
const forecasting = require('./routes/forecasting.js');
const scan = require('./routes/scan.js');
const text = require('./routes/sms.js');


const sample = require('./sample.js');

const app = express();
// const upload = multer({ dest: __dirname + '/uploads/images' });
const router = express.Router();
var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200,
}

app.use(bodyParser.urlencoded({
    extended: true,
    limit: '10mb',
}));
app.use(bodyParser.json({ limit: '10mb'}));
app.use(cors(corsOptions));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    
}));

// date: models.sequelize.literal('CURRENT_TIMESTAMP'),

// Variable that syncs up our two repo paths

const pathway = path.join(__dirname, '../MiseEnPlace/dist/MiseEnPlace');


// serve static files
app.use(express.static(pathway));

app.post('/upload', upload);



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
 *  ~ endpoint: '/invoice/getOne/:invId'
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
 *  ~ endpoint: '/order/getOne/:invId'
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
 * //*************************************************************************************** */
app.use('/categories', categories);
//*************************************************************************************** */
/* ROUTE: "Get All Categories"
 *  ~ endpoint: '/categories/categories'
 *  ~ method: GET
 *  ~ gets all categories
 * ROUTE: "Get All Subcategories"
 *  ~ endpoint: '/categories/subcategories'
 *  ~ method: GET
 *  ~ gets all subcategories
 * ROUTE: "Get All Bottle Sizes"
 *  ~ endpoint: '/categories/bottlesizes'
 *  ~ method: GET
 *  ~ gets all valid bottle sizes
*/
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

app.use('/scan', scan);

app.use('/sms', text);











// force requests to client files
app.get('*', (req, res) => {
    res.sendFile(path.resolve(pathway));
});

const port = process.env.port || 3000;


app.listen(port, () =>
    console.log('Example app listening on port 3000!'),
);