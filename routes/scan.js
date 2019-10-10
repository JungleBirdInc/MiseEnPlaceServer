const express = require('express');
const router = express.Router();
const Fuse = require('fuse.js');
const axios = require('axios');
require('dotenv').config();

const models = require('../app/models/db.js');
const sample = require('../sample.js');

const {
    CV_API_KEY,
    CV_ENDPOINT,
    CV_REQUEST,
} = process.env;

router.post('/photo', (req, res) => {
    const {
        orgId,
        url,
    } = req.body;

    const requestUrl = {
        url,
    }   
    const bestGuess = {
        matches: [],
        products: [],
    };

    const text = [];
    
    const options = {
        shouldSort: true,
        tokenize: true,
        includeScore: true,
        includeMatches: true,
        threshold: 0.6,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
    };
    // let fuse = new Fuse(text, options);
    
    axios.post(CV_REQUEST, requestUrl)
    .then((vision) => {
        let regions = vision.data.regions;
        let unsortedText = [];
        regions.forEach((region) => {
            unsortedText.push(region.lines);
        })
        // console.log('hose \n\n', hose);

        unsortedText.forEach((array) => {
            let bubble = [];
            array.forEach((line) => {
                let words = line.words;
                words.forEach((word) => {
                    bubble.push(word.text);
                })
            })
            text.push(bubble.join(' '));
        })
        // console.log('text \n\n', text);
        return text;
    })
    .then((text) => {
        //get distributors from database for this org
        return models.DistOrgs.findAll({
            where: {
                org_id: orgId,
            },
            include: [{
                model: models.Distributors,
            }]
        })
    })
    .then((distributors) => {
        let fuse = new Fuse(text, options);
        distributors.forEach((distributor) => {
            let name = distributor.distributor.name;
            let searched = fuse.search(name);
            if (searched[0].score <= 0.5){
                bestGuess.matches.push({
                    name: name,
                    score: searched[0].score,
                    line: searched[0].matches[0].value,
                })
            }
        })
        // console.log(bestGuess);
    })
    .then((text) => {
        // console.log('start search');
        // console.log(bestGuess);
        return models.Distributors.findOne({
            where: {
                name: bestGuess.matches[0].name,
            },
            include: [{
                model: models.DistributorsProducts,
                include: [{
                    model: models.Products,
                    include: [{
                        model: models.Subcategories,
                        include: [{
                            model: models.Categories,
                        }]
                    }]
                }]
            }]
        })
    })
    .then((allProds) => {
        let products = allProds.distributors_products;
        
        let textBreak = [...text];
        let textBreak2 = [...text];
        let fuse = new Fuse(textBreak2, options);
        textBreak.forEach((block) => {
            if (block.toLowerCase().match(/(?<=50|100|200|375|500|750|1000|1750)m.\s/)) {
                // console.log('\n\n\n\n bongo \n\n\n\n');
                let split = block.split(/(?<=50|100|200|375|500|750|1000|1750)m.\s/i);
                // console.log(split);
                for(let i = 0; i < split.length; i++){
                    textBreak2.push(split[i]);
                }
            }
        })
        products.forEach((product) => {
            let bubble = {
                guesses: [],
            }
            // console.log(textBreak2);
            let name = product.product.product_name;
            let searched = fuse.search(name);
            for (let i = 0; i < 4; i++){
                if (searched[i].score <= 0.7) {
                    bubble.guesses.push({
                        name,
                        product,
                        score: searched[i].score,
                        line: searched[i]
                    });
                }
            }
            bestGuess.products.push(bubble);
        })
        console.log(bestGuess);
        return bestGuess;
    })
    .then((bestGuess) => {

        res.status(200).json(bestGuess);
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send('boooooooo')
    });
    


})





module.exports = router;