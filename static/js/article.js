function submitRequest(url, method, data) {
    let requestOptions = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }

    return fetch(url, requestOptions)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return res.json();
        })
        .catch(error => {
            console.error('Error:', error);
        })
}

let testAnswers;

submitRequest(window.location.href + '/info')
    .then((res) => {
        document.querySelector('.thisArticle-name').innerText = res.name;

        document.querySelector('.thisArticleText-container').innerText = res.fullText;

        document.querySelector('.thisArticleTest-container').name = res.questionsAndAnswers.length;

        document.querySelector('.thisArticleTestPass').onclick = function() {
            goTest(res);
            testAnswers = res.questionsAndAnswers;
        };
    })

function goTest(article) {
    document.querySelector('.thisArticleText-container').hidden = true;
    document.querySelector('.thisArticleTest-container').hidden = false;
    document.querySelector('.thisArticleTestPass').hidden = true;
    document.querySelector('.thisArticleTestFinish').hidden = false;

    let questionsCount = parseInt(document.querySelector('.thisArticleTest-container').name);
    document.querySelector('.thisArticleTest-container').innerHTML = '';

    for (let i = 0; i <= questionsCount - 1; i++) {
        let template = `
            <div class="thisArticleTest-item">
                <div class="thisArticleQuestion-container">${i + 1} ${article.questionsAndAnswers[i].question}</div>

                <div class="thisArticleAnswer-container">
                    <label>
                        <input type="radio" name="q${i + 1}" value="A"> А) ${article.questionsAndAnswers[i].answer.a1 || null}
                    </label>
                    <label>
                        <input type="radio" name="q${i + 1}" value="B"> B) ${article.questionsAndAnswers[i].answer.a2 || null}
                    </label>
                    <label>
                        <input type="radio" name="q${i + 1}" value="C"> C) ${article.questionsAndAnswers[i].answer.a3 || null}
                    </label>
                    <label>
                        <input type="radio" name="q${i + 1}" value="D"> D) ${article.questionsAndAnswers[i].answer.a4 || null }
                    </label>
                </div>
            </div>
        `
        document.querySelector('.thisArticleTest-container').insertAdjacentHTML('beforeend', template);
    }
}

function submitAnswer() {
    const answers = [];

    document.querySelectorAll('.thisArticleAnswer-container').forEach(item => {
        let questionInputs = item.querySelectorAll('input');
        for (let i = 0; i < questionInputs.length; i++) {
            if (questionInputs[i].checked) {
                answers.push(questionInputs[i].value);
            }
        }
    })

    checkAnswer(answers);
}

function checkAnswer(answers) {
    let correctAnswers = 0;

    for (let i = 0; i < testAnswers.length; i++) {
        if (answers[i] == testAnswers[i].correct) {
            correctAnswers++;
        }
    }

    alert("Количество верных ответов - " + correctAnswers);
}

function backToText() {
    document.querySelector('.thisArticleText-container').hidden = false;
    document.querySelector('.thisArticleTest-container').hidden = true;
    document.querySelector('.thisArticleTestPass').hidden = false;
    document.querySelector('.thisArticleTestFinish').hidden = true;
}

function backToMainMenu() {
    window.location.href = '/';
}