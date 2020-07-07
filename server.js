'use strict';

const express = require('express');

//CORS = Cross Origin Resource Sharing
const cors = require('cors');

const superagent = require('superagent');

//DOTENV (read our invironment variable)
require('dotenv').config();

const PORT = process.env.PORT || 4040;

const server = express();


server.use(cors());
// http://localhost:4000/Location?city=amman
server.get('/location', (req, res) => {
    const city = req.query.city;
    const key = process.env.PRIVATE_TOKEN;
    const url = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`

    superagent.get(url)
        .then(data =>{
            // console.log(data.body);
            const location = new Location (city,data.body);
            res.status(200).json(location);
        });
});

let locArr =[];
function Location (city,locData){
    this.search_query = city;
    this.formatted_query = locData[0].display_name;
    this.latitude = locData[0].lat;
    this.longitude = locData[0].lon;
    locArr.push(this);
    // console.log(locArr[0].latitude);
}
http://localhost:4000/Weather?city=tafilah
server.get('/weather',(req,res) =>{
    const key = process.env.API_KEY;
    const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${locArr[0].latitude}&lon=${locArr[0].longitude}&key=${key}`;
    
    superagent.get(url)
        .then(data =>{
            // console.log(data.body);
            let weatherArr = data.body.data.map((value,idx) => {
                const weather = new Weather (value);
                return weather;
            });
            res.status(200).json(weatherArr);
        });
});

function Weather(value){
    this.forecast = value.weather.description;
    this.time =new Date(value.datetime).toDateString();
}

server.get('/trails',(req,res) =>{

const key = process.env.KEY_HIKING;
// console.log(key);
const url = `https://www.hikingproject.com/data/get-trails?lat=${locArr[0].latitude}&lon=${locArr[0].longitude}&key=${key}`;

// console.log(url);
superagent.get(url)
    .then(data =>{
        console.log(data.body.trails);
        let hikingArr = data.body.trails.map((value,idx) => {
            const hike = new Hiking(value);
            return hike;
        });        
        console.log(hikingArr);
        // console.log(hike);
        res.status(200).json(hikingArr);
    });
});
function Hiking(value){
this.longitude = value.longitude;
this.latitude = value.latitude;
this.name = value.name;
this.location = value.location;
this.length = value.length;
this.stars = value.stars;
this.star_votes = value.starVotes;
this.summary = value.summary;
this.trail_url = value.url;
this.conditions = value.conditionStatus;
this.condition_date = value.conditionDate.split(' ',1).toString();
this.condition_time = value.conditionDate.split(' ',2).slice(1).toString();
}

server.get('/', (req, res) => {
    res.status(200).send('you did great job');
});

server.get('*', (req, res) => {
    res.status(404).send('Not Found');
});

server.use((error, req, res) => {
    res.status(500).send(error);
});

server.listen(PORT, () => {
    console.log(`listning on PORT ${PORT}`);
});