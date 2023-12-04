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

submitRequest(window.location.href + '/info')
    .then((res) => {
        document.querySelector('.thisArticle-name').innerText = res.name;

        document.querySelector('.thisArticleText-container').innerText = res.fullText;

        document.querySelector('.thisArticleFooter-container').name = res.questionsAndAnswers.length;

        document.querySelector('.thisArticleFooter-container').onclick = function() {
            goTest(res);
        };
    })

function goTest(article) {
    document.querySelector('.thisArticleText-container').hidden = true;
    document.querySelector('.thisArticleTest-container').hidden = false;
    document.querySelector('.thisArticleTestPass').hidden = true;
    document.querySelector('.thisArticleTestFinish').hidden = false;

    let questionsCount = parseInt(document.querySelector('.thisArticleFooter-container').name);

    for (let i = 0; i <= questionsCount - 1; i++) {
        let template = `
            <div class="thisArticleTest-item">
                <div class="thisArticleQuestion-container">${i + 1} ${article.questionsAndAnswers[i].question}</div>

                <div class="thisArticleAnswer-container">
                    <label>
                        <input type="radio" name="q1" value="A"> А) ${article.questionsAndAnswers[i].answer.a1 || null}
                    </label>
                    <label>
                        <input type="radio" name="q1" value="B"> B) ${article.questionsAndAnswers[i].answer.a2 || null}
                    </label>
                    <label>
                        <input type="radio" name="q1" value="C"> C) ${article.questionsAndAnswers[i].answer.a3 || null}
                    </label>
                    <label>
                        <input type="radio" name="q1" value="D"> D) ${article.questionsAndAnswers[i].answer.a4 || null }
                    </label>
                </div>
            </div>
        `
        document.querySelector('.thisArticleTest-container').insertAdjacentHTML('beforeend', template);
    }
}