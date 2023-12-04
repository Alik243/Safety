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

submitRequest('/getArticles')
    .then((res) => {
        res.forEach(element => {
            renderArticles(element)
        });
    })


function renderArticles(article) {
    let template = `
        <div class="article-card" name="${article._id}" onclick="chooseArticle(this)">
            <div class="d-flex">
                <div class="article-text-container">
                    <div class="article-name">${article.name}</div>
                    <div class="article-text">${article.text}</div>
                </div>
                <div class="article-img-container">
                    <img src="${article.imagePath}">
                </div>
            </div>
            
            <div class="article-info">
                <div style="margin-right: 12px">
                    <i class="bi bi-person-fill me-1"></i>
                    ${article.passedCount}
                </div>
                <div>
                    <i class="bi bi-clock-history me-1"></i>
                    ${article.passingTime}
                </div>
            </div>
        </div>
    `

    document.querySelector('.articles-container').insertAdjacentHTML('afterbegin', template)
}

function chooseArticle(article) {
    window.location.href = '/article/' + article.getAttribute('name');
}

// document.querySelector('#article-submit').addEventListener('click', () => {
//     let data = {
//         text: document.querySelector('#article-text').value
//     }

//     submitRequest('/addArticle', 'post', data)
//         .then((res) => {
//             console.log('added article!')
//         })
// })