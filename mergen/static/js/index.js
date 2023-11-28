const videoElement = document.querySelector('#videoElement');
const connectVideoButton = document.querySelector('.connect');
const diconnectVideoButton = document.querySelector('.disconnect');
const streamStartButton = document.querySelector('.startStream');
const streamStopButton = document.querySelector('.stopStream');
//const streamStart2Button = document.querySelector('.startStreamAnalog');
//const startRecAnalog = document.querySelector('.startAnalog');
// let hlsConfig = {
//     liveSyncDuration: 3,
//     liveMaxLatencyDuration: 30
// }

let url = window.location.href.substring(0,window.location.href.length - 1)

function submitRequest(url, data, method) {
    return fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
};

/*startRecAnalog.addEventListener('click', () => {
	fetch('/startRecAnalog');
});*/

connectVideoButton.addEventListener('click', () => {
    //window.location.href = '/startRec';
	fetch('/startRec');
});

diconnectVideoButton.addEventListener('click', () => {
    //window.location.href = '/stopRec';
	fetch('/stopRec');
});

let hls;

streamStartButton.addEventListener('click', () => {
	//window.location.href = '/startStream';
    fetch('/startStream');
		//.then(res => {
	setTimeout(()=>{
	//let loadSource = document.querySelector('#loadSource').value;

    if (Hls.isSupported()) {
        hls = new Hls();

        hls.loadSource(url+':1500/hls/stream.m3u8');
        hls.attachMedia(videoElement);

        videoElement.play();
    }},7000);
	});

/*streamStart2Button.addEventListener('click', () => {
        //window.location.href = '/startStream';
    fetch('/startStreamAnalog');
	//	.then(res => {
        setTimeout(()=>{
	let loadSource = document.querySelector('#loadSource').value;

    if (Hls.isSupported()) {
        hls = new Hls();

        hls.loadSource(url + ':1500/hls/stream.m3u8');
	    
        hls.attachMedia(videoElement);

        videoElement.play();
    }},10000);
    });
        //});
*/
streamStopButton.addEventListener('click', () => {
    //window.location.href = '/stopStream';
	fetch('/stopStream')
    // if (Hls.isSupported()) {
        hls.destroy();
    // }
});
document.querySelector('main').addEventListener('click', (e) => {
    dropdownMenu.style.display = 'none';
});

/* Account dropdown Functions */
const accountButton = document.querySelector('#dropdown-account');
const dropdownMenu = document.querySelector('.dropdown-menu');
const setPasswordModal = document.querySelector('#setPassword');

accountButton.addEventListener('click', () => {
    if (dropdownMenu.style.display === 'none') {
        dropdownMenu.style.display = 'block';
    } else {
        dropdownMenu.style.display = 'none';
    }
});

function logout() {
    // localStorage.removeItem('token');
    window.location.reload();
}

/* Modal functions */
const overlayModal = document.querySelector('.modal_overlay');

overlayModal.addEventListener('click', (e) => {
    if (e.target === overlayModal) {
        closeModal(overlayModal);
    }
});

function openModal(modal) {
    modal.style.display = 'flex';
}
function closeModal(modal) {
    modal.style.display = 'none';
}

/* Navigation */
// const navs = document.querySelectorAll('.nav-item');
// const pages = document.querySelectorAll('.page');

// function goPage(page) {
//     let thisNav = document.querySelector(`.${page}`)
//     let thisPage = document.querySelector(`#${page}`)

//     if (page = thisNav) {
//         navs.forEach(item => {
//             item.classList.remove('active');
//         });
//         pages.forEach(item => {
//             item.style.display = 'none';
//         });

//         thisNav.classList.add('active');
//         thisPage.style.display = 'block';
//     }
// }

chgToggle(document.querySelector('.bitrate-indicator'), document.querySelectorAll('.bitrate-item'));
chgToggle(document.querySelector('.duration-indicator'), document.querySelectorAll('.duration-item'));
chgToggle(document.querySelector('.format-indicator'), document.querySelectorAll('.format-item'));


// function timer(ms) { 
//     return new Promise(res => setTimeout(res, ms)); 
// }

function GoToFiles()
{
	window.location.href = url + ':1234/data';
}

function chgToggle(indicator, values){
    function handleIndicator(target) {
        values.forEach(item => {
            item.classList.remove('active');
            item.removeAttribute('style');
        });

        indicator.style.width = "".concat(target.offsetWidth, "px");
        indicator.style.left = "".concat(target.offsetLeft, "px");
        target.classList.add('active');
    }

    values.forEach(function (item) {
        if (document.documentElement.clientWidth <= 576) {
            item?.addEventListener('touchstart', function (e) {
                handleIndicator(e.target)
            })
        } else {
            item?.addEventListener('click', function (e) {
                handleIndicator(e.target)
            })
        }
        item.classList.contains('active') && handleIndicator(item);
    })
}
