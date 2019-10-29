const express = require('express');
const router = express.Router();
require('dotenv').config();
const accountSid = 'ACa01fae00c3816b5d2cb8d9473c91f8ad';
const authToken = '95c666ff9da66596d7fc922af7a5405c';
const client = require('twilio')(accountSid, authToken);


router.post('/text', (req, res) => {
    const cell = req.body.phone;
    const message = req.body.message;
client.messages
    .create({
       body: message,
       from: '+16185894953', //my number from twilio
       to: '+15042327796' // `+1${cell}`
     })
    .then(message => console.log(message.sid))
    .catch((err) => console.log(err, 'error'));

})

module.exports = router;