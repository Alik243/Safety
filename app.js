const express = require('express');
const app = express();

const session = require('express-session');
const store = new session.MemoryStore();

const path = require('path');

const mongoose = require('mongoose');
const Articles = require('./models/articles')
const Users = require('./models/users');

app.set('view engine', 'ejs');

const PORT = 3000;
const db = 'mongodb+srv://Alisher:zaka243Aa7@cluster0.5gj2nzz.mongodb.net/node-mongodb?retryWrites=true&w=majority';

mongoose
    .connect(db)
    .then((res) => console.log('Connected to DB'))
    .catch((err) => console.error(err))

const createPath = (page) => path.resolve(__dirname, 'views', `${page}.ejs`);

app.listen(PORT, (error) => {
    error ? console.log(error) : console.log(`Server is running on port ${PORT}`);
})

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(__dirname + "/static"));

app.use(session({
    secret: 'myApp',
    resave: true,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        maxAge: 60 * 60 * 1000
    },
    store: store
}))

app.use((req, res, next) => {
    if (req.path == '/login' || req.path == '/auth') {
        return next();
    }

    if (req.session && req.session.authenticated) {
        req.session.touch();
        next();
    } else {
        res.redirect('/login');
    }
})

app.get('/login', (req, res) => {
    const title = 'Login';

    res.render(createPath('login'), { title });
})

app.post('/auth', (req, res) => {
    const user = req.body;
    // let username = user.username;

    Users
        .findOne({ email: user.username })
        .then((data) => {
            if (!data) {
                res.status(404).send();
            } else {
                if (data.password == user.password) {
                    req.session.authenticated = true;
                    req.session.username = data.name;
                    req.session.job = data.job;
                    req.session.role = data.role;
                    res.redirect('/');
                } else {
                    res.status(401).send();
                }
            }
        })
        .catch((error) => {
            console.log(error);
        })
})

app.get('/', (req, res) => {
    const title = 'Home';
    const username = req.session.username;
    const job = req.session.job;
    const role = req.session.role;

    res.render(createPath('index'), { title, username, job, role });
})

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
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

    const article = req.params.articleId;
    const role = req.session.role;

    res.render(createPath('article'), { title, article, role });
})

app.get('/article/:articleId/info', (req, res) => {
    Articles
        .findOne({ _id: req.params.articleId }).lean()
        .then((article) => {
            for (let key in article.questionsAndAnswers) {
                article.questionsAndAnswers[key].correct = ''; 
            }
            
            res.status(200).send(article);
        })
        .catch((error) => {
            console.log(error);
        })
})

app.post('/article/:articleId/addTest', (req, res) => {
    Articles
        .findOne({ _id: req.params.articleId })
        .then((article) => {
            article.questionsAndAnswers = '';

            for (let key in req.body) {
                article.questionsAndAnswers[key] = req.body[key];
            }
            
            article
                .save()
                .then(() => res.sendStatus(200))
                .catch((err) => console.log(err))
        })
        .catch((err) => {
            console.log(err);
        })
})

app.post('/article/:articleId/submitTest', (req, res) => {
    Articles
        .findOne({ _id: req.params.articleId })
        .then((article) => {
            let answers = [];

            for (const [key, value] of Object.entries(req.body)) {
                if (article.questionsAndAnswers[key].correct === value) {
                    answers.push(true);
                } else {
                    answers.push(false);
                }
            }

            res.status(200).send(answers);
        })
        .catch((err) => {
            console.log(err);
        })
})

app.post('/addArticle', (req, res) => {
    const { name, text, fullText } = req.body;
    const article = new Articles({ name, text, fullText });
    article
        .save()
        .then(() => res.sendStatus(200))
        .catch((err) => console.log(err))
})

app.get('/getUsers', (req, res) => {
    if (req.session.role != 'admin') return;

    Users
        .find()
        .then((users) => {
            res.status(200).send(users);
        })
        .catch((error) => {
            console.log(error);
        })
})

app.post('/addUser', (req, res) => {
    const { email, password, name, job } = req.body;
    const user = new Users({ email, password, name, job });
    user
        .save()
        .then(() => res.sendStatus(200))
        .catch((err) => console.log(err))
})

app.post('/deleteUser', (req, res) => {
    const { userId } = req.body;
    
    Users
        .deleteOne({ _id: userId })
        .then(() => res.sendStatus(200))
        .catch((err) => console.log(err))
})