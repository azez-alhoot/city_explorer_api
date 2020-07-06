'use strict';
let weatherArr =[];
const express = require('express');

//CORS = Cross Origin Resource Sharing
const cors = require('cors');

//DOTENV (read our invironment variable)
require('dotenv').config();

const PORT = process.env.PORT || 4040;

const server = express();

server.use(cors());

// http://localhost:4000/Location?data=amman
server.get('/Location', (req, res) => {
    const city = req.query.data;
    console.log(city);
    // res.send('Hello');
    const locData = require('./data/location.json');
    console.log(locData);
    const location = new Location (city,locData);
    res.send(location);
});

// {
//     "search_query": "seattle",
//     "formatted_query": "Seattle, WA, USA",
//     "latitude": "47.606210",
//     "longitude": "-122.332071"
//   }
function Location (city,locData){
    this.search_query = city;
    this.formatted_query = locData[0].display_name;
    this.latitude = locData[0].lat;
    this.longitude = locData[0].lon;

}

server.get('/Weather',(req,res) =>{
    const wetherData = require('./data/ weather.json');
    console.log(wetherData.data[0]);
    wetherData.data.forEach((value,idx) => {
        const weather = new Weather (value);
    });
    res.send(weatherArr);
});

// [
//     {
//       "forecast": "Partly cloudy until afternoon.",
//       "time": "Mon Jan 01 2001"
//     },
//     {
//       "forecast": "Mostly cloudy in the morning.",
//       "time": "Tue Jan 02 2001"
//     },
//     ...
//   ]

function Weather(value){
    this.forecast = value.weather.description;
    this.time =new Date(value.datetime).toDateString();
    weatherArr.push(this);
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