const express = require('express');
const path = require('path');

const app = express();

app.set('view engine', 'ejs');

const PORT = 3000;

const createPath = (page) => path.resolve(__dirname, 'views', `${page}.ejs`);

app.use(express.static(__dirname + "/static"));

app.listen(PORT, (error) => {
    error ? console.log(error) : console.log(`Server is running on port ${PORT}`);
})

let styles = path.join(__dirname, 'static/css');


app.get('/', (req, res) => {
    const title = 'Home';

    res.render(createPath('index'), { title });
})