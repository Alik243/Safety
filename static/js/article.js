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

// let testAnswers;

submitRequest(window.location.href + '/info')
    .then((res) => {
        document.querySelector('.thisArticle-name').innerText = res.name;

        document.querySelector('.thisArticleText-container').innerText = res.fullText;

        document.querySelector('.thisArticleTest-container').name = res.questionsAndAnswers.length;

        document.querySelector('.thisArticleTestPass').onclick = function() {
            goTest(res);
            // testAnswers = res.questionsAndAnswers;
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
                <div class="thisArticleQuestion-container">${i + 1}. ${article.questionsAndAnswers[i].question}</div>

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

    submitRequest(window.location.href + '/submitTest', 'post', answers)
        .then((res) => {
            let correctCount = 0;
            res.forEach(answer => {
                if (answer) correctCount++;
            })
            alert("Количество верных ответов - " + correctCount);
        })
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

let qn = 0;

function addQuestion() {
    qn++;

    let template = `
        <div id="addTest-item-${qn}">
            <div class="d-flex">
                <div style="width: 21px;">${qn + 1}.</div>
                <input type="text" class="addTest-question w-100" style="margin-bottom: 12px;" placeholder="Вопрос">
            </div>

            <div class="d-flex">
                <div class="addTest-answer-1" style="display: flex;">
                    <input type="radio" name="addTest-input-${qn}" class="me-2" value="A">
                    <input type="text" class="addTest-text w-100" placeholder="Ответ 1">
                </div>
                <div class="addTest-answer-2" style="display: flex; margin-inline: 16px;">
                    <input type="radio" name="addTest-input-${qn}" class="me-2" value="B">
                    <input type="text" class="addTest-text w-100" placeholder="Ответ 2">
                </div>
                <div class="addTest-answer-3" style="display: flex;">
                    <input type="radio" name="addTest-input-${qn}" class="me-2" value="C">
                    <input type="text" class="addTest-text w-100" placeholder="Ответ 3">
                </div>
            </div>
        </div>

        <hr>
    `

    document.querySelector('.addTest-container').insertAdjacentHTML('beforeend', template);
}

function addTest() {
    let data = {}
    let counter = 0;

    document.querySelectorAll('.addTest-container > div').forEach(item => {
        let ac = item.querySelector(`input[name="addTest-input-${counter}"]:checked`).value;

        data[counter] = {
            question: item.querySelector('.addTest-question').value,
            answer: {
                a1: item.querySelector('.addTest-answer-1 .addTest-text').value,
                a2: item.querySelector('.addTest-answer-2 .addTest-text').value,
                a3: item.querySelector('.addTest-answer-3 .addTest-text').value
            },
            correct: ac
        }

        counter++;
    })

    submitRequest(window.location.href + '/addTest', 'post', data)
        .then(() => {
            window.location.reload();
        })
}

function deleteArticle() {
    submitRequest(window.location.href + '/deleteArticle')
        .then(() => {
            window.location.href = '/';
        })
}

function openModal(element) {
    element.showModal();
}

function closeModal(element) {
    element.close();
}