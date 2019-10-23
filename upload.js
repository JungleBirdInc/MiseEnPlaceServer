const IncomingForm = require('formidable').IncomingForm
const express = require("express");
const path = require('path');
const axios = require('axios');
require('dotenv').config();
const app = express();
const sha1 = require('sha1');
const FormData = require('form-data');
const fs = require('file-system');
const cloudinary = require('cloudinary').v2
const Fuse = require('fuse.js');
const models = require('./app/models/db.js');

const {
    CV_API_KEY,
    CV_ENDPOINT,
    CV_REQUEST,
    CLOUD_API_KEY,
    CLOUD_ENDPOINT,
    CLOUD_SECRET
} = process.env;

cloudinary.config({
    cloud_name: 'heirbloom',
    api_key: CLOUD_API_KEY,
    api_secret: CLOUD_SECRET
});

const orgId = 1;

const pathway = path.join(__dirname, '../miseenplaceserver/files/');

module.exports = function upload(req, res) { 
    var form = new IncomingForm()
    const cloudReader = (file) => {
        const text = [];

        const bestGuess = {
            matches: [],
            products: [],
            invoice: null,
        };

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
        return cloudinary.uploader.upload(file.path, function (error, result) { console.log(result, error) })
            .then((result) => {
                let resultUrl = {
                    url: result.secure_url
                };
                return axios.post(CV_REQUEST, resultUrl, {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
            })
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
                        console.log('text \n\n', text);
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
                            text.forEach((block) => {
                                if (block.toLowerCase().match(name.toLowerCase())) {
                                    bestGuess.matches.push({
                                        name,
                                        score: 0.00,
                                        line: block,
                                    });
                                }
                            })
                            let searched = fuse.search(name);
                            if (searched[0].score <= 0.7) {
                                bestGuess.matches.push({
                                    name: name,
                                    score: searched[0].score,
                                    line: searched[0].matches[0].value,
                                })
                            }
                        })
                        bestGuess.matches.sort(function (a, b) {
                            return a.score - b.score;
                        })
                        console.log(bestGuess);
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
                        // console.log(textBreak2);
                        let fuse = new Fuse(textBreak2, options);
                        textBreak.forEach((block) => {


                            if (block.toLowerCase().match(/(?<=invoice\s|invoice\sno.\s)\d+/i)) {
                                // console.log('\n\n\n')
                                // console.log(block.toLowerCase().match(/(?<=invoice\s|invoice\sno.\s|invoice\sno.)\d+/i))
                                let invoice = block.toLowerCase().match(/(?<=invoice\s|invoice\sno.\s|invoice\sno.)\d+/i)
                                bestGuess.invoice = invoice[0];
                                // console.log('\n\n\n')
                                // console.log(bestGuess);
                            }

                            if (block.toLowerCase().match(/(?<=50|100|200|375|500|750|1000|1750)m.\s/) ||
                                block.toLowerCase().match(/(?<=50|100|200|375|500|750|1000|1750)\sm.\s/)) {
                                // console.log('\n\n\n\n bongo \n\n\n\n');
                                let split = block.split(/(?<=50|100|200|375|500|750|1000|1750)m.\s/i);
                                let split2 = block.split(/(?<=50|100|200|375|500|750|1000|1750)\sm.\s/i);
                                // console.log(textBreak);
                                // console.log(split);
                                for (let i = 0; i < split.length; i++) {
                                    textBreak2.push(split[i]);
                                }
                                for (let i = 0; i < split2.length; i++) {
                                    textBreak2.push(split2[i]);
                                }
                                // console.log(textBreak2);
                            }
                            if (block.toLowerCase().match(/[0-9][0-9][0-9]\d+/)) {
                                let upcBlocker = block.split(/[0-9][0-9][0-9]\d+/);
                                // console.log(upcBlocker);
                                for (let i = 0; i < upcBlocker.length; i++) {
                                    textBreak2.push(upcBlocker[i]);
                                    // console.log(textBreak2);
                                }
                                console.log(textBreak2);
                            }
                        })
                        products.forEach((product) => {
                            let name = product.product.product_name;
                            let bubble = {
                                guesses: [],
                            }
                            textBreak2.forEach((block) => {
                                if (block.toLowerCase().match(name.toLowerCase())) {
                                    bubble.guesses.push({
                                        name,
                                        product,
                                        score: 0.00,
                                        line: block,
                                    });
                                }
                            })
                            // console.log(textBreak2);
                            let searched = fuse.search(name);
                            for (let i = 0; i < 4; i++) {
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
                        // console.log(bestGuess);
                        return bestGuess;
                    })
            .then((bestGuess) => {
                        for (let i = 0; i < bestGuess.products.length; i++) {
                            if (!bestGuess.products[i].guesses.length) {
                                bestGuess.products.splice(i, 1);
                            }
                        }
                        console.log('\n\n\n\n   WHOA  \n\n\n')
                        // res.json(bestGuess);
                        res.status(200).send(bestGuess);
                    })
                    .catch((error) => {
                        console.log(error);
                        res.status(500).send('boooooooo')
                    });
            
    

        }
    
    form.on('fileBegin', (field, file) => {
        file.path = __dirname + '/files/' + file.name;
    })
    form.on('file', function (name, file) {
        console.log('Uploaded ' + file.name);
        const temp = pathway + file.name;
        let public_id = file.name.slice(0, -4);
        console.log(public_id);
        let timestamp = Date.now();
        let preHash = `public_id=${public_id}&timestamp=${timestamp}${CLOUD_SECRET}`;
        console.log(preHash);
        let signature = sha1(preHash);
        console.log(signature);
        let filePath = `/files/${file.name}`

        cloudReader(file);
    })
        
        
    form.parse(req)
    
}