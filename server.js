const Port = 8000
const express = require('express');
const axios = require('axios')
const cors = require('cors')
const Moralis = require("moralis-v1/node");
const console = require('console');
require('dotenv').config()
// const fs = require("fs");


const appId = process.env.APP_ID
const serverUrl = process.env.SERVER_URL;
const masterKey = process.env.MASTER_KEY;

const app = express()

app.use(cors())


const likePostMain = async (mpId, email) => {
    await Moralis.start({ serverUrl, appId, masterKey })
    const GEMS = Moralis.Object.extend('Gems')
    const gem = new GEMS()
    gem.set('email', email)
    gem.set('gems', 0.03)
    gem.set('type', 'post_like')
    gem.set('mpId', mpId)
    gem.save(null, { useMasterKey: true })
}


app.post('/like', (req, res) => {
    const data = req.query
    likePostMain(data.mpId, data.email)
    console.log('recieved')
})

app.get('/', (req, res) => {
    res.send('hellow r')
})

app.listen(8000, () => {
    console.log('hello world')
})