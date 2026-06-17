import ejs from "ejs";
import express from "express";
import axios from 'axios';
import bodyParser from "body-parser";

const port = process.env.PORT || 3000;
const app = express();
const myAPIKey = '82c0c6c66eac67ac9eeedefdb5c829f1'
const geocode_API_URL = 'http://api.openweathermap.org/geo/1.0/zip';
const weather_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
let config = {};
app.use(express.static("public"));
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }));

const errMessage = {
    404: 'The input you entered does not correspond to any zipcode or any real location. Please try agian!',
    500: 'There is some internal server error. Try again later!'
}

app.get("/", (req, res) => {
    res.render('index.ejs')
})

app.post('/', async (req, res) => {
    console.log(req.body);
    try {
        config = {
            params: {
                appid: myAPIKey,
                zip: `${req.body.zipcode},${req.body.countrycode}`
            }
        }
        const response = await axios.get(geocode_API_URL, config);
        const result1 = (response.data);
        let body = {
            params: {
                appid: myAPIKey,
                lon: response.data.lon,
                lat: response.data.lat,
                units: 'metric'
            }
        }
        const weather_data = await axios.get(weather_API_URL, body);
        const result2 = (weather_data.data);
        const aqi_data = await axios.get(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${response.data.lat}&lon=${response.data.lon}&appid=${myAPIKey}`)
        const result3 = aqi_data.data.list[0]
        console.log(response.data);
        let weather_op = {
            city: response.data.name,
            country: response.data.country,
            temp: `${result2.main.temp}°C`,
            feels_like: `${result2.main.feels_like}°C`,
            temp_min: `${result2.main.temp_min}°C`,
            temp_max: `${result2.main.temp_max}°C`,
            humidity: result2.main.humidity,
            pressure: result2.main.pressure,
            sunrise: new Date(result2.sys.sunrise * 1000).toLocaleTimeString(),
            sunset: new Date(result2.sys.sunset * 1000).toLocaleTimeString(),
            main: result2.weather[0].main,
            desc: result2.weather[0].description,
            aqi: result3.main.aqi,
            pm2_5: result3.components.pm2_5,
            pm10: result3.components.pm10,
           
        }
        console.log(result3.main.aqi)
        res.render('index.ejs', {content: weather_op, icon: result2.weather[0].icon })
    }
    catch (err) {
        console.log("ERROR:");
        console.log(err.response.data);
        res.render('index.ejs', {
            e: {
                code: err.response.data.cod,
                err_msg: err.response.data.message,
                msg: errMessage[err.response.data.cod]
        }})
    }

})



app.listen(port, () => {
    console.log('server started at port: ' + port);
})