const Sequelize = require('sequelize');

const {
    DATABASE,
    USER_NAME,
    USER_PASSWORD,
    HOST,
    DB_PORT,
} = process.env;

const sequelize = new Sequelize(DATABASE, USER_NAME, USER_PASSWORD, {
    host: HOST,
    port: DB_PORT,
    dialect: 'postgres',
});

// test the db connection
sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch((err) => {
        console.error('Unable to connect to the database:', err);
    });

/*
 * Categories Table
 * category_name: The major category of a product (Beer, Wine, Liquor, N-A)
 */
const BtlSize = sequelize.define('btl_size', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    size: {
        type: Sequelize.STRING,
        allowNull: true,
    },
}, {
    freezeTableName: true,
    timeStamps: false,
});

/*
 * Categories Table
 * category_name: The major category of a product (Beer, Wine, Liquor, N-A)
 */
const Categories = sequelize.define('categories', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    category_name: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    createdAt: {
        field: 'created_at',
        type: Sequelize.DATE,
        allowNull: true,
    },
    updatedAt: {
        field: 'updated_at',
        type: Sequelize.DATE,
        allowNull: true,
    },
}, {
    freezeTableName: true,
    timeStamps: false,
});


/* 
 * Distributor-Organizations Join Table
 * dist_id: id of a distributor
 * org_id: id of an org
 * 
*/
const DistOrgs = sequelize.define('dist_org', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    distributorOrganizationId: {
        field: 'dist_id',
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    // dist_id: {
    //     type: Sequelize.INTEGER,
    //     allowNull: true,
    // },
    organizationId: {
        field: 'org_id',
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    createdAt: {
        field: 'created_at',
        type: Sequelize.DATE,
        allowNull: true,
    },
    updatedAt: {
        field: 'updated_at',
        type: Sequelize.DATE,
        allowNull: true,
    },
}, {
    freezeTableName: true,
    timeStamps: false,
});


/*
 * Distributors Table
 * name: Business name of the distributor
 * address: street address of the distributor
 * state: 2 letter state abbreviation
 * zip: 5 digit American postal code
 */
const Distributors = sequelize.define('distributors', {
    organizationId: {
        field: 'id',
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    distributorOrganizationId: {
        field: 'id',
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    address: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    city: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    state: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    zip: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    phone: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    email: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    createdAt: {
        field: 'created_at',
        type: Sequelize.DATE,
        allowNull: true,
    },
    updatedAt: {
        field: 'updated_at',
        type: Sequelize.DATE,
        allowNull: true,
    },
}, {
    freezeTableName: true,
    timeStamps: false,
});

/*
 * DistributorsProducts Table
 * this table is the intersection of distributors and products
 * this is where the price of products live
 * 
 * dist_id: id of the distributor
 * products_id: id of the product
 * price: the per unit price as set by the distributor
 */
const DistributorsProducts = sequelize.define('distributors_products', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    dist_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    productId: {
        field: 'product_id',
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    price: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    createdAt: {
        field: 'created_at',
        type: Sequelize.DATE,
        allowNull: true,
    },
    updatedAt: {
        field: 'updated_at',
        type: Sequelize.DATE,
        allowNull: true,
    },
},{
    freezeTableName: true,
    timeStamps: false,
});

/*
 * LogTypes Table
 * type: which type of Log we're making:
 * (1) = "Master" - the master par list upon which other logs are compared
 * (2) = "Invoice" - records a distributor invoice
 * (3) = "Order" - a single order placed with a distributor
 * (4) = "Weekly" - a weekly recording of inventory levels
 */
const LogTypes = sequelize.define('log_types', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    type: {
        type: Sequelize.STRING,
        allowNull: false,
    }
}, {
    freezeTableName: true,
    timeStamps: false,
});

/*
 * Logs Table
 * the master container for any log, both incoming and outgoing
 * 
 * admin_id: the id of the administrator who recorded the log
 * type: see LogTypes table
 * dist_id: the id of the distributor, required for invoices and orders
 * rep_id: the id of the rep who received the order, required for orders
 * date: always required!
 * total_price: the entire price of the log. math should be done server side before query
 */
const Logs = sequelize.define('logs', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    admin_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    type: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    dist_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    rep_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    total_price: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    createdAt: {
        field: 'created_at',
        type: Sequelize.DATE,
        allowNull: true,
    },
    updatedAt: {
        field: 'updated_at',
        type: Sequelize.DATE,
        allowNull: true,
    },
}, {
    freezeTableName: true,
    timeStamps: true,
});

/*
 * LogsProducts Table
 * the intersection of logs and products, these are the list items of any log
 * 
 * log_id: the id of the log the item belongs to
 * dist_products_id: the id of the product as it is listed by the distributor
 * qty: the quantity of the item being recorded in the log
 * 
 */
const LogsProducts = sequelize.define('logs_products', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    logId: {
        field: 'log_id',
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    distributorsProductId: {
        field: 'dist_products_id',
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    qty: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    createdAt: {
        field: 'created_at',
        type: Sequelize.DATE,
        allowNull: true,
    },
    updatedAt: {
        field: 'updated_at',
        type: Sequelize.DATE,
        allowNull: true,
    },
}, {
    freezeTableName: true,
    timeStamps: true,
});

/*
 * OpenBottles Table
 * daily weight values of weighed bottles are kept here
 * 
 * org_id: the id of the organization that owns the bottle
 * product_id: refers to the DistributorsProducts table
 * weight: the weight of the bottle recorded as an integer. ALL WEIGHTS MUST BE CONSISTENT.
 */

const OpenBottles = sequelize.define('open_bottles', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    org_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    distributorsProductId: {
        field: "product_id",
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    weight: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    createdAt: {
        field: 'created_at',
        type: Sequelize.DATE,
        allowNull: true,
    },
    updatedAt: {
        field: 'updated_at',
        type: Sequelize.DATE,
        allowNull: true,
    },
}, {
    freezeTableName: true,
    timeStamps: true,
});

/*
 * Organizations Table
 * org_name: the organizations name. Required.
 * master_inventory: the id of the master inventory for an organization
 * address: the street address
 * state: 2 character abbreviation only
 * zip: 5 digit american postal code
 */
const Organizations = sequelize.define('organizations', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    org_name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    master_inventory: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    address: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    city: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    state: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    zip: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    phone: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    email: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    createdAt: {
        field: 'created_at',
        type: Sequelize.DATE,
        allowNull: true,
    },
    updatedAt: {
        field: 'updated_at',
        type: Sequelize.DATE,
        allowNull: true,
    },
}, {
    freezeTableName: true,
    timeStamps: false,
});

/*
 * Products Table
 * the static product information that remains constant between distributors
 * excludes price, as that changes with each distributor
 * 
 * upc: the upc code of the product. Should match the result of a bar code scan
 * product_name: the full product name. 
 * for now, we won't separate the brand (Jim Beam) from the product (Honey Applecrisp *or whatever*)
 * if this is built out further, brand and product name should be separated.
 * category_id: id of the main category of product (See Categories table)
 * sub_category_id: id of the subcategory (see Subcategories table)
 * size: size of the product container (see BtlSize table)
 * tare: the weight of the empty bottle. Should be consistent with weight category from OpenBottles table
 */
const Products = sequelize.define('products', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    upc: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    product_name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    categoryId: {
        field: 'category_id',
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    sub_category_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    subcategoryId: {
        field: 'sub_category_id',
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    size: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    notes: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    tare: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    createdAt: {
        field: 'created_at',
        type: Sequelize.DATE,
        allowNull: true,
    },
    updatedAt: {
        field: 'updated_at',
        type: Sequelize.DATE,
        allowNull: true,
    },
}, {
    freezeTableName: true,
    timeStamps: false,
});

/*
 * Reps Table
 * dist_id: the id of the distributor associated with this rep
 */
const Reps = sequelize.define('reps', {
    distributorOrganizationId: {
        field: 'id',
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    first_name: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    last_name: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    email: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    phone: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    dist_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    createdAt: {
        field: 'created_at',
        type: Sequelize.DATE,
        allowNull: true,
    },
    updatedAt: {
        field: 'updated_at',
        type: Sequelize.DATE,
        allowNull: true,
    },
}, {
    freezeTableName: true,
    timeStamps: false,
});

/*
 * Roles Table
 * role: administrative access level for users:
 * (1) Administrator - has full access to site
 * (2) Employee - has limited access
 * 
 */
const Roles = sequelize.define('roles', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    role: {
        type: Sequelize.STRING,
        allowNull: false,
    }
}, {
    freezeTableName: true,
    timeStamps: false,
});

/*
 * Subcategories Table
 * category_id: the id of the main category of the product
 * subcategory_id: the subcategory (White Wines, Whiskey, Soft Drinks, Bar Supplies, etc)
 */
const Subcategories = sequelize.define('subcategories', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    categoryId: {
        field: 'category_id',
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    subcategory_name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    createdAt: {
        field: 'created_at',
        type: Sequelize.DATE,
        allowNull: true,
    },
    updatedAt: {
        field: 'updated_at',
        type: Sequelize.DATE,
        allowNull: true,
    },
}, {
    freezeTableName: true,
    timeStamps: false,
});

/*
 * Users Table
 * role_id: the id attached to their role (see Roles table)
 * org_id: the id attached to their organization
 * password: may not be needed, depending on auth used
 */
const Users = sequelize.define('users', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    first_name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    last_name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    org_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    createdAt: {
        field: 'created_at',
        type: Sequelize.DATE,
        allowNull: true,
    },
    updatedAt: {
        field: 'updated_at',
        type: Sequelize.DATE,
        allowNull: true,
    },
}, {
    freezeTableName: true,
    timeStamps: false,
});

// Relationships
Products.hasMany(DistributorsProducts);
DistributorsProducts.belongsTo(Products);

DistributorsProducts.hasMany(LogsProducts);
LogsProducts.belongsTo(DistributorsProducts);

Logs.hasMany(LogsProducts);
LogsProducts.belongsTo(Logs);

Distributors.hasMany(Reps);
Reps.belongsTo(Distributors);

DistOrgs.belongsTo(Distributors);
DistOrgs.belongsTo(Organizations);
Distributors.hasMany(DistOrgs);
Organizations.hasMany(DistOrgs);

DistributorsProducts.hasMany(OpenBottles);
OpenBottles.belongsTo(DistributorsProducts);

Categories.hasMany(Products);
Products.belongsTo(Categories);

Subcategories.hasMany(Products);
Products.belongsTo(Subcategories);

Categories.hasMany(Subcategories);
Subcategories.belongsTo(Categories);







    
// export all of the models
module.exports.sequelize = sequelize;
module.exports.Sequelize = Sequelize;
module.exports.BtlSize = BtlSize;
module.exports.Categories = Categories;
module.exports.DistOrgs = DistOrgs;
module.exports.Distributors = Distributors;
module.exports.DistributorsProducts = DistributorsProducts;
module.exports.LogTypes = LogTypes;
module.exports.Logs = Logs;
module.exports.LogsProducts = LogsProducts;
module.exports.OpenBottles = OpenBottles;
module.exports.Organizations = Organizations;
module.exports.Products = Products;
module.exports.Reps = Reps;
module.exports.Roles = Roles;
module.exports.Subcategories = Subcategories;
module.exports.Users = Users;
