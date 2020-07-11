'use strict';

//DOTENV (read our invironment variable)
require('dotenv').config();

const express = require('express');

//CORS = Cross Origin Resource Sharing
const cors = require('cors');

const superagent = require('superagent');

const yelp = require('yelp-fusion');
const client = yelp.client(process.env.YELP_API_KEY);

const pg = require('pg');
const { move } = require('superagent');
const { response } = require('express');


const server = express();
server.use(cors());

const PORT = process.env.PORT || 4040;
const clint = new pg.Client(process.env.DATABASE_URL);

function Location(city, locData) {
    this.search_query = city;
    this.formatted_query = locData[0].display_name;
    this.latitude = locData[0].lat;
    this.longitude = locData[0].lon;
}
// http://localhost:4000/location?city=amman
server.get('/location', (req, res) => {
    let city = req.query.city;
    const key = process.env.PRIVATE_TOKEN;
    const url = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`
    const safeValues = [city];
    const select = `SELECT * FROM locations WHERE search_query = $1`
    clint.query(select, safeValues)
        .then(result => {
            // console.log(result);
            if (result.rowCount) {
                // let neWlocation = new Location(city,result.rows[0]);
                res.status(200).json(result.rows[0]);
                // console.log(result.rows[0].location_latitude, result.rows[0].location_longitude);
            } else {
                superagent.get(url)
                    .then(data => {
                        // console.log(data.body);
                        const location = new Location(city, data.body);
                        let safeValues = [city, location.formatted_query, location.latitude, location.longitude];
                        const insert_values = `INSERT INTO locations (search_query,formatted_query,latitude,longitude) VALUES($1,$2,$3,$4)`
                        clint.query(insert_values, safeValues)
                            .then(result => {
                                console.log(result);
                                res.status(200).json(location);
                            })
                    });
            }
        });
});

// http://localhost:4000/Weather?city=tafilah
server.get('/weather', (req, res) => {
    const key = process.env.API_KEY;
    const lon = req.query.longitude;
    const lat = req.query.latitude;
    const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${key}`;

    superagent.get(url)
        .then(data => {
            // console.log(data.body);
            let weatherArr = data.body.data.map((value, idx) => {
                const weather = new Weather(value);
                return weather;
            })
            res.status(200).json(weatherArr);
        });
});

function Weather(value) {
    this.forecast = value.weather.description;
    this.time = new Date(value.datetime).toDateString();
}

server.get('/trails', (req, res) => {
    const lon = req.query.longitude;
    const lat = req.query.latitude;
    const key = process.env.KEY_HIKING;
    // console.log(key);
    const url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&key=${key}`;

    // console.log(url);
    superagent.get(url)
        .then(data => {
            console.log(data.body.trails);
            let hikingArr = data.body.trails.map((value, idx) => {
                const hike = new Hiking(value);
                return hike;
            })
            // console.log(hikingArr);
            // console.log(hike);
            res.status(200).json(hikingArr);
        });
});
function Hiking(value) {
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
    this.condition_date = value.conditionDate.split(' ', 1).toString();
    this.condition_time = value.conditionDate.split(' ', 2).slice(1).toString();
}

server.get(`/movies`, (req, res) => {
    const city = req.query.search_query;
    let key = process.env.MOVIE_API_KEY;
    let url = `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${city}&language=en-US`;

    superagent.get(url)
        .then(data => {
            let newMovie = data.body.results.map((value, idx) => {
                const movie = new Movies(value);
                return movie;
            })
            console.log(newMovie);
            res.status(200).json(newMovie);
        });

});


function Movies(value) {
    this.title = value.title;
    this.overview = value.overview;
    this.average_votes = value.vote_average;
    this.total_votes = value.vote_count;
    this.image_url = `https://image.tmdb.org/t/p/w500${value.poster_path}`;
    this.popularity = value.popularity;
    this.released_on = value.release_date;
}

function Resturants(value) {
    this.name = value.name;
    this.image_url = value.image_url;
    this.price = value.price;
    this.rating = value.rating;
    this.url = value.url;
}

server.get(`/yelp`, (req, res) => {
    let city = req.query.search_query;
    const searchRequest = {
        term: 'Food',
        location: city
    };
    client.search(searchRequest)
        .then(data => {
            let resArr = data.jsonBody.businesses.map((vlue, idx) => {
                let newRes = new Resturants(vlue);
                return newRes;
            })
            console.log(resArr);
            res.status(200).json(data.jsonBody.businesses);
        })
        .catch(e => {
            console.log(e);
        });
});


server.get('/', (req, res) => {

    res.status(200).send('you did great job');
});

server.get('*', (req, res) => {
    res.status(404).send('Not Found');
});

server.use((error, req, res) => {
    res.status(500).send(error);
});
clint.connect()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`listning on PORT ${PORT}`);
        })
    });