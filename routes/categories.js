const express = require('express');
const router = express.Router();

const models = require('../app/models/db.js');

//***************************
// Get All Product Categories
//***************************
router.get('/categories', (req, res) => {
    models.Categories.findAll({
        include: [{
            model: models.Subcategories,
        }]
    })
    .then((categories) => {
        res.status(200).json(categories);
    })
    .catch((error) => {
        console.log(error);
        res.status(500).json(error);
    })
});
        
//***************************
// Get All Product Subcategories
//***************************
router.get('/subcategories', (req, res) => {
    models.Subcategories.findAll()
        .then((subcategories) => {
            res.status(200).json(subcategories);
        })
        .catch((error) => {
            console.log(error);
            res.status(500).json(error);
        })
});

module.exports = router;