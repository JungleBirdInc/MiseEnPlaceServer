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
    const options = {
        url,
    }   
    const bestGuess = {};
    
    axios.post(CV_REQUEST, options)
    .then((vision) => {
        let regions = vision.data.regions;
        let unsortedText = [];
        let text = [];
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
        console.log('text \n\n', text);
        return text;
    })
    .then((text) => {
        //get distributors from database for this org
        //search text for each distributor
        //add best result to bestGuess object!
        //keep going!
    })
    .then((text) => {
        //get all the products from the best guess distributor
        //search text for each product
        //if the product returns by an acceptable margin, push it
        //how do we figure out quantity?? is there a way? google it. 
    })
    .then((whatever) => {
        console.log(whatever);
        res.status(200).send('whooooooo')
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send('boooooooo')
    });
    

    let regions = sample.regions;
    let bibby = regions[0].lines;
    let hose = [];
    let text = [];
    sample.regions.forEach((region) => {
        hose.push(region.lines);
    })
    hose.forEach((array) => {
        let bubble = [];
        array.forEach((line) => {
            let words = line.words;
            words.forEach((word) => {
                bubble.push(word.text);
            })
        })
        text.push(bubble.join(' '));
    })
    // console.log(text);

    // let options = {
    //     shouldSort: true,
    //     tokenize: true,
    //     includeScore: true,
    //     includeMatches: true,
    //     threshold: 0.6,
    //     location: 0,
    //     distance: 100,
    //     maxPatternLength: 32,
    //     minMatchCharLength: 1,
    // };

    let fuse = new Fuse(text, options);
    // console.log(fuse.search('Republic'));

// console.log(spiel);


})





module.exports = router;