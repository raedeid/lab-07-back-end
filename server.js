
// Express
const express = require('express');

const superagent = require('superagent');

// initialize a server
const server = express();


// Cross Origin Resource Sharing
const cors = require('cors');
server.use(cors()); // give access

// get all environment variable you need
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const DARKSKY_API_KEY = process.env.DARKSKY_API_KEY;
const EVENTFUL_API_KEY = process.env.EVENTFUL_API_KEY;


// Make the app listening
server.listen(PORT, () => console.log('Listening at port 3000'));



server.get('/', (request, response) => {
  response.status(200).send('App is working CLAAAAASS');
});

/* {
    "search_query": "lynwood",
    "formatted_query": "lynood,... ,WA, USA",
    "latitude": "47.606210",
    "longitude": "-122.332071"
  }
*/


server.get('/location', locationHandler);

function Location(city, locationData) {
  this.formatted_query = locationData[0].display_name;
  this.latitude = locationData[0].lat;
  this.longitude = locationData[0].lon;
  this.search_query = city;
}

function locationHandler(request, response) {
  // Read the city from the user (request) and respond
  let city = request.query['city'];
  getLocationData(city)
    .then((data) => {
      response.status(200).send(data);
    });
}
function getLocationData(city) {
  const url = `https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${city}&format=json&limit=1`;

  // Superagent
  return superagent.get(url)
    .then((data) => {
      let location = new Location(city, data.body);
      return location;
    });
}



server.get('/weather', weatherHandler);

function Weather(day) {
  this.time = new Date(day.time * 1000).toDateString();
  this.forecast = day.summary;
}

function weatherHandler(request, response) {
  let lat = request.query['latitude'];
  //   console.log(lat);
  let lng = request.query['longitude'];
  getWeatherData(lat, lng)
    .then((data) => {
      response.status(200).send(data);
    });
}

function getWeatherData(lat, lng) {
  const url = `https://api.darksky.net/forecast/${DARKSKY_API_KEY}/${lat},${lng}`;
  return superagent.get(url)
    .then((weatherData) => {
      console.log(weatherData.body.daily.data);
      let weather = weatherData.body.daily.data.map((day) => new Weather(day));
      return weather;
    });
}
// [
//     {
//       "link": "http://seattle.eventful.com/events/seattle-code-101-explore-software-development-/E0-001-126675997-3?utm_source=apis&utm_medium=apim&utm_campaign=apic",
//       "name": "Seattle Code 101: Explore Software Development",
//       "event_date": "Sat Dec 7 2019",
//       "summary": "Thinking about a new career in software development? Start here! In this one-day workshop, you&#39;ll get a taste of a day in the life of a software developer. Code 101 helps you learn what it’s like to be a software developer through a day-long immersive course for beginners that focuses on front-end web development technologies. "
//     },
//     {
//       "link": "http://seattle.eventful.com/events/geekzonehosting-raspberry-pi-jam-session-code-c-/E0-001-121109275-3?utm_source=apis&utm_medium=apim&utm_campaign=apic",
//       "name": "GeekZoneHosting Raspberry Pi Jam Session & Code Carnival 2019",
//       "event_date": "Sat Dec 7 2019",
//       "summary": "Join fellow coders, builders, and Raspberry Pi makers in an 8 hour all day event Jam Session builder and code-a-thone to celebrate computer science education week 2019."
//     },
//     ...
//   ]
server.get('/events', eventHandler);

function Event(data) {
  this.link = data.link;
  this.name = data.name;
  this.event_date = data.event_date;
  this.summary = data.summary;
}
function eventHandler(request, response) {
//   let link = request.query['link'];
  let lat = request.query['latitude'];
  //   console.log(lat);
  let lng = request.query['longitude'];
  let city = request.query['city'];
  //   console.log(link);
  getEventData(city ,lat ,lng)
    .then((data) => {
      response.status(200).send(data);
    });
}
function getEventData(city ,lat ,lng) {
  const url = `http://api.eventful.com/json/events/search?app_key=${EVENTFUL_API_KEY}&q=${city}/${lat},${lng}&limit=20`;
  console.log(url);
  return superagent.get(url)
    .then((data) => {
      let toConvertData = JSON.parse(data.text);
      let event = toConvertData.body.events.event[0].description = new Event(data);
        console.log(dataConvert.body.events.event[0].description);
      return event;
    });
}



server.use('*', (request, response) => {
  response.status(404).send('Sorry, not found');
});

server.use((error, request, response) => {
  response.status(500).send(error);
});



