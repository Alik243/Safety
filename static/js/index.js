const isAdmin = document.getElementById('isAdmin');

function submitRequest(url, method, data) {
    return fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(res => {
        if (!res.ok) throw res;

        if (res.redirected) {
            window.location.replace(res.url);
        }

        const contentType = res.headers.get('Content-Type');
    
        if (contentType && contentType.includes('application/json')) {
            return res.json();
        } else {
            return res.text();
        }
    }).catch(err => Promise.reject(err))
}

function logout() {
    submitRequest('/logout')
}

function getArticles(type) {
    document.querySelectorAll('.article-card').forEach(card => card.remove())

    document.querySelectorAll('.catalog-type').forEach(item => {
        item.classList.remove('active');
    })
    type.classList.add('active');

    submitRequest('/getArticles', 'post', { catalogType: type.getAttribute('name') })
        .then((res) => {
            res.forEach(element => {
                renderCards(element)
            });
        })
}
getArticles(document.getElementsByName('new')[0]);

function renderCards(article) {
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

    document.querySelector('.allArticle-card').insertAdjacentHTML('beforebegin', template)
}

function showMoreArticles() {
    openModal(document.getElementById('allArticleModal'));

    submitRequest('/getAllArticles')
        .then((res) => {
            res.forEach(element => {
                renderArticle(element)
            });
        })
}

function renderArticle(article) {
    let template = `
        <div class="" name="${article._id}" onclick="chooseArticle(this)">
            <div>${article.name}</div>
        </div>
    `

    document.querySelector('.allArticle-container').insertAdjacentHTML('afterbegin', template)
}

function chooseArticle(article) {
    window.location.href = '/article/' + article.getAttribute('name');
}

function getUsers() {
    document.querySelector('.users-container').innerText = '';

    submitRequest('/getUsers')
      .then((res) => {
            res.forEach(element => {
                renderUsers(element);
            });
        })
} 
if (isAdmin) getUsers();

function renderUsers(user) {
    let template = `
        <div class="user-item" name="${user._id}" onclick="">
            <input type="checkbox" class="" style="width: 16px">

            <div style="display: flex; flex: 1; margin-inline: 32px">
                <div style="width: 50%">${user.name}</div>

                <div style="width: 50%; color: #777">${user.job}</div>
            </div>

            <i class="bi bi-three-dots" onclick="renderPassedArticles(this)"></i>
        </div>
    `

    document.querySelector('.users-container').insertAdjacentHTML('afterbegin', template)
}

function openModal(element) {
    element.showModal();
}

function closeModal(element) {
    element.close();
}

function addUser() {
    let data = {
        email: document.getElementById('add-login').value,
        password: document.getElementById('add-password').value,
        name: document.getElementById('add-name').value,
        job: document.getElementById('add-job').value
    }

    submitRequest('/addUser', 'post', data)
        .then(() => {
            closeModal(document.getElementById('addUserModal'));
            getUsers();
        })
}

function deleteUser() {
    document.querySelectorAll('.user-item').forEach(user => {
        if (user.querySelector('input').checked) {
            let data = {
                userId: user.getAttribute('name')
            }
            submitRequest('/deleteUser', 'post', data)
                .then(() => {
                    user.remove();
                })
        }
    })
}

function addArticle() {
    let data = {
        name: document.getElementById('addArticle-name').value,
        text: document.getElementById('addArticle-text').value,
        fullText: document.getElementById('addArticle-fullText').value
    }

    submitRequest('/addArticle', 'post', data)
        .then(() => {
            closeModal(document.getElementById('addArticleModal'));
            window.location.reload();
        })
}

function renderPassedArticles(element) {
    document.querySelector('.passedArticle-container').innerText = '';

    openModal(document.getElementById('passedArticleModal'));

    submitRequest('/getPassedArticles', 'post', { userId: element.parentNode.getAttribute('name') })
        .then((res) => {
            res.forEach(article => {
                let status = 'bi-x-circle-fill';
                let answers = article.test.split('/');
                if (Number(answers[0]) >= Number(answers[1]) * 0.5) {
                    status = 'bi-check-circle-fill';
                }

                let template = `
                    <div class="passedArticle-item">
                        <i class="bi ${status}"></i>

                        <div class="passedArticle-name">${article.name}</div>
                        
                        <div class="passedArticle-test">${article.test}</div>
                    </div>
                `

                document.querySelector('.passedArticle-container').insertAdjacentHTML('beforeend', template)
            });
        })
}