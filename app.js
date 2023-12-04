const express = require('express');
const path = require('path');
// const fs = require('fs');
const mongoose = require('mongoose');
const Articles = require('./models/articles')

const app = express();

app.set('view engine', 'ejs');

const PORT = 3000;
const db = 'mongodb+srv://Alisher:zaka243Aa7@cluster0.5gj2nzz.mongodb.net/node-mongodb?retryWrites=true&w=majority';

mongoose
    .connect(db)
    .then((res) => console.log('Connected to DB'))
    .catch((err) => console.error(err))

const createPath = (page) => path.resolve(__dirname, 'views', `${page}.ejs`);

app.use(express.static(__dirname + "/static"));

app.listen(PORT, (error) => {
    error ? console.log(error) : console.log(`Server is running on port ${PORT}`);
})

app.get('/', (req, res) => {
    const title = 'Home';

    res.render(createPath('index'), { title });
})

app.get('/getArticles', (req, res) => {
    Articles
        .find()
        .then((articles) => {
            res.status(200).send(articles);
        })
        .catch((error) => {
            console.log(error);
        })
})

app.get('/article/:articleId', (req, res) => {
    const title = 'Article';

    let article = req.params.articleId;

    res.render(createPath('article'), { title, article });
})

app.get('/article/:articleId/info', (req, res) => {
    Articles
        .findOne({ _id: req.params.articleId }).lean()
        .then((article) => {
            res.status(200).send(article);
        })
        .catch((error) => {
            console.log(error);
        })
})

app.post('/addArticle', (req, res) => {
    const { text } = req.body;
    const article = new Article({ text });
    article
        .save()
        .then((res) => res.send(res))
        .catch((err) => console.log(err))
})