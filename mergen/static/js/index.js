const videoTag = document.querySelector('#videoTag');
let hls;
let hlsConfig = {
    liveSyncDuration: 1,
    liveMaxLatencyDuration: 4
}
let watchedFiles = false; 
let record = false;
let stream = false;
let checkStream;

let batteryValue = 0;

videoTag.width = window.innerWidth;
videoTag.height = window.innerWidth / 2;

/* Stream start */
function startStream(modal) {
    fetch('/startStream');

    if (modal) closeModal(modal);

    initStream();
}

function initStream() {
    watchedFiles = false;
    if (currentPlayController) currentPlayController.abort();
    currentPlayFile = null;
    document.querySelector('.selectedFilename').innerText = 'Название записи';
    // videoTag.removeAttribute('src');
    // videoTag.load();

    stream = true;
    let loadSource = document.querySelector('#loadSource').value;
    let location = window.location.href;
    let streamUrl = location.substring(0, location.length - 1) + loadSource;
    let attempts = 0;

    checkStream = setInterval(() => {
        fetch(streamUrl)
            .then(res => {
                if (res.status === 200) {
                    clearInterval(checkStream);

                    if (Hls.isSupported()) {
                        hls = new Hls(hlsConfig);

                        hls.loadSource(streamUrl);
                        hls.attachMedia(videoTag);

                        videoTag.play();
                    } else if (videoTag.canPlayType('application/vnd.apple.mpegurl')) {
                        videoTag.setAttribute('src', streamUrl);
                        videoTag.play();
                    }
                } else {
                    if (attempts >= 10) {
                        clearInterval(checkStream);
                        console.log('Stream has not started');
                    } else {
                        attempts++;
                    }
                }
            })
            .catch(err => {
                if (attempts >= 10) {
                    clearInterval(checkStream);
                } else {
                    attempts++;
                    console.log(err);
                }
            })
    }, 2000);
}

// let rcPairedStatus = false;

submitRequest('/getDeviceSettings').then(res => {
    document.querySelector('#info-serialNumber').innerText = res.serialNumber;

    // if (res.rcStatus == 'paired') rcPairedStatus = true;
})

submitRequest('/getRecordSettings').then(res => {
    if (res.streamRecord == 'on') {
        record = true;
        setRecordMode(true);
        document.querySelector('#onlyRecord-button').hidden = true;
        document.querySelector('#multistream-button').hidden = true;
        document.querySelector('#stopRecord-button').hidden = false;
        startMultistream();
    } else {
        if (res.record == 'on') {
            record = true;
            setRecordMode(true);
            document.querySelector('#onlyRecord-button').hidden = true;
            document.querySelector('#multistream-button').hidden = true;
            document.querySelector('#stopRecord-button').hidden = false;
        } else {
            startStream();
        }
    }

    switch (res.preset) {
        case 'balance':
            document.querySelector('#info-writeMode').innerText = 'Баланс';
            break;
        case 'eco':
            document.querySelector('#info-writeMode').innerText = 'Эконом';
            break;
        case 'high':
            document.querySelector('#info-writeMode').innerText = 'Максимальное качество';
            break;
    }

    document.querySelector('#info-videoRes').innerText = res.video.quality;
    document.querySelector('#info-sampleR').innerText = res.audio.sampleRate + ' kHz';

    document.querySelector('#info-bitrate').innerText = res.video.bitrate + ' kbps';

    /* modal settings */
    document.querySelector('#settings-writeMode').value = res.preset;

    document.querySelectorAll('.settings-duration-item').forEach(item => {
        if (item.innerText == res.duration)
            item.classList.add('active');
    })

    document.querySelectorAll('.settings-fps-item').forEach(item => {
        if (item.innerText == res.video.fps)
            item.classList.add('active');
    })
    document.querySelector('#settings-videoQuality').value = res.video.quality;
    document.querySelector('#settings-videoCompression').value = res.video.compression;
    document.querySelector('#settings-videoFormat').value = res.video.format;
    document.querySelector('#settings-videoAnalog').value = res.video.voltage;

    document.querySelectorAll('.settings-sampleR-item').forEach(item => {
        if (item.innerText == res.audio.sampleRate.substring(0, 2))
            item.classList.add('active');
    })
    document.querySelector('#settings-audioCompression').value = res.audio.compression;
    document.querySelector('#settings-audioChannels').value = res.audio.channels;
})

let firstLoaded = true;

function getMainInfo() {
    submitRequest('/getBattery').then(res => {
        batteryValue = res.split(' ')[1].replace('%', '');
    
        let circleProgressBar = document.querySelector('.progress-bar');
        circleProgressBar.style.setProperty('--circle-progress', batteryValue);
    
        if (firstLoaded) {
            firstLoaded = false;
            circleProgressBar.style.animation = 'progress 1.5s linear 1 forwards';
            animateCounter(batteryValue);
        } else {
            document.querySelector('.progress-val').innerText = Math.round(batteryValue) + '%';;
        }
    
        let timeBattery = document.querySelector('#info-timeBattery')
        let timeBatteryText = timeBattery.innerText.split(':')[0];
        timeBattery.innerText = timeBatteryText += ': ~X ч';
    })
    
    submitRequest('/getMemory').then(res => {
        regex = /[a-zA-Zа-яА-Я]/g;
        let memoryProps = res.replace(regex, '').split('\n');
        let percent = (memoryProps[1] / memoryProps[0] * 100).toFixed(1);
    
        document.querySelector('#info-freeMemory').innerText = (memoryProps[1]/1000).toFixed(1) + ' Gb';
        document.querySelector('#info-allMemory').innerText = (memoryProps[0]/1000).toFixed(1) + ' Gb';        
        document.querySelector('#info-percentMemory').innerText = percent + '%';
        document.querySelector('.memory-container meter').value = percent;
    
        let deviceRuntime = ': ~' + (Math.round(((memoryProps[0] - memoryProps[1]) / 2250) * 2) / 2) + ' ч';
        let timeMemory = document.querySelector('#info-timeMemory')
        let timeMemoryText = timeMemory.innerText.split(':')[0];
        timeMemory.innerText = timeMemoryText += deviceRuntime;
    })
    
    submitRequest('/getTemperature').then(res => {
        let temperature = res.split('=')[1].replace('\n', '');
        document.querySelector('#info-temperature').innerText = temperature + '°C';
        document.querySelector('.temperature-container meter').value = temperature;
    })
} getMainInfo();

setInterval(() => {
    getMainInfo();
}, 20000)

submitRequest('/getTime').then(res => {
    document.querySelectorAll('#deviceTime').forEach(item => {
        item.innerText = res;
    })
})

/* All about themes */
// function setThemeLight() {
//     document.documentElement.style.setProperty('--bg-color', '#fff');
//     document.documentElement.style.setProperty('--font-color', '#252525');
//     document.documentElement.style.setProperty('--main-color', '#0D6EFD');
//     document.documentElement.style.setProperty('--secondary-color', '#6C757D');
//     document.documentElement.style.setProperty('--shadow1-color', '#EAEAEA');
//     document.documentElement.style.setProperty('--shadow2-color', '#DADADA');
// }
// function setThemeDark() {
//     document.documentElement.style.setProperty('--bg-color', '#222');
//     document.documentElement.style.setProperty('--font-color', '#fff');
//     document.documentElement.style.setProperty('--main-color', '#0D6ED9');
//     document.documentElement.style.setProperty('--secondary-color', '#888');
//     document.documentElement.style.setProperty('--shadow1-color', '#3F3F3F');
//     document.documentElement.style.setProperty('--shadow2-color', '#373737');
// }

// document.addEventListener("DOMContentLoaded", () => {
//     document.documentElement.theme = localStorage.getItem("selectedTheme") || "light";
//     if (document.documentElement.theme == 'dark') {
//         setThemeDark();
//         document.querySelector('.themeToggle').checked = true;
//     }
// })

// function setTheme() {
//     if (document.documentElement.theme == 'light') {
//         document.documentElement.theme = 'dark';
//         localStorage.setItem("selectedTheme", 'dark');
//         setThemeDark();
//         document.querySelector('.themeToggle').checked = true;
//     } else {
//         document.documentElement.theme = 'light';
//         localStorage.setItem("selectedTheme", 'light');
//         setThemeLight();
//         document.querySelector('.themeToggle').checked = false;
//     }
// }

/* Navigation function */
function navigation(thisPage) {
    if (thisPage.getAttribute('name') == 'files') {
        getFiles();
    } else if (thisPage.getAttribute('name') == 'main') {
        if (watchedFiles && !stream && !record) {
            openModal(document.querySelector('#startStreamModal'));
        }
        animateCounter(batteryValue);

        selectModeFunc(false);
    } else if (thisPage.getAttribute('name') == 'settings') {
        selectModeFunc(false);
    }

    document.querySelectorAll('.navigation-item').forEach(item => {
        let i = item.getAttribute('name');

        if (item == thisPage) {
            document.querySelector(`#${i}-page`).classList.add('active');
            item.classList.add('active');
        } else {
            document.querySelector(`#${i}-page`).classList.remove('active');
            item.classList.remove('active');
        }

        if (thisPage.getAttribute('name') == 'files') {
            document.querySelector('.audioWaves-container').hidden = true;
        } else {
            document.querySelector('.audioWaves-container').hidden = false;
        }
    })
}

/* Files select mode */
let selectedCount;
let selectedAll = false;
let selectedFilesSize;
let selectModeButton = document.querySelector('#goSelect-button');

selectModeButton.addEventListener('click', () => {
    selectedCount = 0;
    document.querySelector('.selectedFiles-count').innerText = selectedCount;

    selectedFilesSize = 0;
    document.querySelector('.files-size').innerText = selectedFilesSize.toFixed(1) + ' Mb';

    if (selectModeButton.classList.contains('settings-button')) {
        selectModeFunc(true);
    } else {
        selectModeFunc(false);
    }
})

function selectModeFunc(mode) {
    if (mode) {
        selectModeButton.innerText = 'Сбросить';
        selectModeButton.classList.remove('settings-button');
        selectModeButton.classList.add('reset-button');

        document.querySelector('.selectedFiles-container').hidden = false;
        document.querySelector('.selectedFilename').hidden = true;

        document.querySelector('.files-container').style.paddingBottom = '60px';
        document.querySelector('.action-container').hidden = false;
    
        document.querySelectorAll('.file-about').forEach(item => {
            item.onclick = function () {
                selectFile(this);
            }
        })
    
        document.querySelectorAll('.file-about i').forEach(item => {
            item.classList.remove('bi-play-circle');
            item.classList.add('bi-circle');
            item.style.color = 'var(--grey-color)';
        })
    
        document.querySelectorAll('.file-action').forEach(item => {
            item.onclick = function() {
                deleteModal(this);
            }
        })

        document.querySelectorAll('.file-action i').forEach(item => {
            item.classList.remove('bi-download');
            item.classList.add('bi-trash');
            item.style.color = 'var(--red-color)';
        })
    } else {
        selectModeButton.innerText = 'Выбрать';
        selectModeButton.classList.remove('reset-button');
        selectModeButton.classList.add('settings-button');

        document.querySelector('.selectedFilename').hidden = false;
        document.querySelector('.selectedFiles-container').hidden = true;

        document.querySelector('.files-container').style.paddingBottom = '';
        document.querySelector('.action-container').hidden = true;

        document.querySelectorAll('.file-about').forEach(item => {
            item.onclick = function () {
                getFile(this);
            }
        })
    
        document.querySelectorAll('.file-about i').forEach(item => {
            item.classList.remove('bi-circle');
            item.classList.remove('bi-check-circle-fill');
            item.classList.add('bi-play-circle');
            item.style.color = '';
        })
    
        document.querySelectorAll('.file-action').forEach(item => {
            item.onclick = function() {
                downloadFile(this);
            }
        })
    
        document.querySelectorAll('.file-action i').forEach(item => {
            item.classList.remove('bi-trash');
            item.classList.add('bi-download');
            item.style.color = '';
        })

        document.querySelectorAll('.file-item').forEach(item => {
            item.classList.remove('selected');
        })

        selectedAll = false;
        document.querySelector('.selectAll-input').classList.remove('active');
    }
}

function selectFile(file) {
    let icon = file.querySelector('.file-play i')

    if (file.parentNode.classList.contains('selected')) {
        icon.classList.remove('bi-check-circle-fill');
        icon.classList.add('bi-circle');
        icon.style.color = 'var(--grey-color)';

        file.parentNode.classList.remove('selected');

        selectedCount--;
        document.querySelector('.selectedFiles-count').innerText = selectedCount;

        selectedFilesSize -= parseFloat(file.querySelector('.file-size').innerText);
        if (selectedFilesSize > 1000) {
            document.querySelector('.files-size').innerText = (selectedFilesSize / 1000).toFixed(1) + ' Gb';
        } else {
            document.querySelector('.files-size').innerText = selectedFilesSize.toFixed(1) + ' Mb';
        }

        selectedAll = false;
        document.querySelector('.selectAll-input').classList.remove('active');
    } else {
        icon.classList.remove('bi-circle');
        icon.classList.add('bi-check-circle-fill');
        icon.style.color = 'var(--blue-color)';
    
        file.parentNode.classList.add('selected');

        selectedCount++;
        document.querySelector('.selectedFiles-count').innerText = selectedCount;

        selectedFilesSize += parseFloat(file.querySelector('.file-size').innerText);
        if (selectedFilesSize > 1000) {
            document.querySelector('.files-size').innerText = (selectedFilesSize / 1000).toFixed(1) + ' Gb';
        } else {
            document.querySelector('.files-size').innerText = selectedFilesSize.toFixed(1) + ' Mb';
        }
    }
}

function selectAllFiles() {
    if (selectedAll) {
        selectedAll = false;
        document.querySelector('.selectAll-input').classList.remove('active');

        document.querySelectorAll('.file-play i').forEach(item => {
            item.classList.remove('bi-check-circle-fill');
            item.classList.add('bi-circle');
            item.style.color = 'var(--grey-color)';
        })

        let files = document.querySelectorAll('.file-item');
        files.forEach(item => {
            item.classList.remove('selected');
        })

        selectedCount = 0;
        document.querySelector('.selectedFiles-count').innerText = selectedCount;

        selectedFilesSize = 0;
        document.querySelector('.files-size').innerText = selectedFilesSize.toFixed(1) + ' Mb';
    } else {
        selectedAll = true;
        document.querySelector('.selectAll-input').classList.add('active');

        document.querySelectorAll('.file-play i').forEach(item => {
            item.classList.remove('bi-circle');
            item.classList.add('bi-check-circle-fill');
            item.style.color = 'var(--blue-color)';
        })

        let files = document.querySelectorAll('.file-item');
        files.forEach(item => {
            item.classList.add('selected');
        })

        selectedCount = files.length;
        document.querySelector('.selectedFiles-count').innerText = selectedCount;

        selectedFilesSize = 0;
        document.querySelectorAll('.file-size').forEach(item => {
            selectedFilesSize += parseFloat(item.innerText);
        })
        if (selectedFilesSize > 1000)  {
            document.querySelector('.files-size').innerText = (selectedFilesSize / 1000).toFixed(1) + ' Gb';
        } else {
            document.querySelector('.files-size').innerText = selectedFilesSize.toFixed(1) + ' Mb';
        }
    }
}

function getFiles() {
    document.querySelector('.files-container-spinner').hidden = false;

    submitRequest('/getFiles')
        .then(res => {
            document.querySelector('.files-container-spinner').hidden = true;
            document.querySelector('.files-container').innerHTML = '';

            res.forEach(item => {
                let fileTemplate;

                if (item.fileName != currentPlayFile) {
                    fileTemplate =
                        `<div class="file-item f-between" name="${item.fileName}">
                            <div class="file-about f-center" onclick="getFile(this)">
                                <div class="file-play">
                                    <i class="bi bi-play-circle" style="font-size: 20px;"></i>
                                </div>

                                <div class="file-info">
                                    <div class="fileName">
                                        ${item.fileName}
                                    </div>

                                    <div class="file-properties">
                                        <div>
                                            ${item.fileDuration}
                                        </div>

                                        <div class="circle"></div>

                                        <div class="file-size">
                                            ${item.fileSize} Mb
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="file-action f-center" onclick="downloadFile(this)">
                                <i class="bi bi-download" style="font-size: 20px;"></i>
                            </div>
                        </div>`;
                } else {
                    fileTemplate =
                        `<div class="file-item f-between active" name="${item.fileName}">
                            <div class="file-about f-center" onclick="getFile(this)">
                                <div class="file-play">
                                    <i class="bi bi-pause-circle" style="font-size: 20px;"></i>
                                </div>

                                <div class="file-info">
                                    <div class="fileName">
                                        ${item.fileName}
                                    </div>

                                    <div class="file-properties">
                                        <div>
                                            ${item.fileDuration}
                                        </div>

                                        <div class="circle"></div>

                                        <div class="file-size">
                                            ${item.fileSize} Mb
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="file-action f-center" onclick="downloadFile(this)">
                                <i class="bi bi-download" style="font-size: 20px;"></i>
                            </div>
                        </div>`;
                }
                
                document.querySelector('.files-container').insertAdjacentHTML('beforeend', fileTemplate);
                document.querySelector('.filesOption-container').hidden = false;
            })
        })
}

let currentPlayController = null;
let currentPlayFile = null;

function getFile(file) {
    if (stream && record) {
        openModal(document.querySelector('#stopMultistreamModal'));
        return
    }

    const fileName = file.parentNode.getAttribute('name');
    if (currentPlayFile != fileName) {
        currentPlayFile = fileName;
    } else return;

    clearInterval(checkStream);

    if (currentPlayController) currentPlayController.abort();

    let controller = new AbortController();
    currentPlayController = controller;
    let signal = controller.signal;

    if (stream) fetch('/stopStream');

    fetch('/getFile/' + fileName, { signal })
        .then(() => {
            if (hls != null) {
                hls.destroy();
                hls = null;
            }

            watchedFiles = true;
            stream = false;
            videoTag.src = fileName;
            document.querySelector('.selectedFilename').innerText = fileName;

            document.querySelectorAll('.file-item.active').forEach(item => {
                item.querySelector('.bi').classList.remove('bi-pause-circle');
                item.querySelector('.bi').classList.add('bi-play-circle');
                item.classList.remove('active');
            })

            file.querySelector('.bi').classList.remove('bi-play-circle');
            file.querySelector('.bi').classList.add('bi-pause-circle');
            file.parentNode.classList.add('active')
        })
}

// function listenAudio() {
//     var volumeMeter = document.getElementById('volumeMeterr');

//     var audioContext = new (window.AudioContext || window.webkitAudioContext)();
//     var analyser = audioContext.createAnalyser();
//     var source = audioContext.createMediaElementSource(videoTag);

//     source.connect(analyser);
//     analyser.connect(audioContext.destination);

//     analyser.fftSize = 256;
//     var bufferLength = analyser.frequencyBinCount;
//     var dataArray = new Uint8Array(bufferLength);

//     function updateVolumeMeter() {
//         analyser.getByteFrequencyData(dataArray);

//         var average = dataArray.reduce(function (acc, value) {
//             return acc + value;
//         }, 0) / bufferLength;

//         var volumePercent = (average / 255) * 100;
//         volumeMeter.textContent = 'Volume: ' + volumePercent.toFixed(2) + '%';

//         requestAnimationFrame(updateVolumeMeter);
//     }

//     videoTag.addEventListener('play', function () {
//         audioContext.resume().then(function () {
//             updateVolumeMeter();
//         });
//     });

//     videoTag.addEventListener('pause', function () {
//         volumeMeter.textContent = 'Volume: 0%';
//     });
// }

function downloadFile(file) {
    const fileName = file.parentNode.getAttribute('name');
    window.location.href = '/downloadFile/' + fileName;
}

function deleteModal(file) {    
    const fileName = file.parentNode.getAttribute('name');
    document.querySelector('#deleteFilename').innerText = `Удалить запись ${fileName}?`;
    
    document.querySelector('#deleteFile').onclick = function() {
        submitRequest('/deleteFile/' + fileName)
            .then(() => {
                file.parentNode.remove();

                selectedCount = 0;
                document.querySelectorAll('.file-item').forEach(item => {
                    if (item.classList.contains('selected'))
                        selectedCount++;
                })
                document.querySelector('.selectedFiles-count').innerText = selectedCount;

                selectedFilesSize = 0;
                document.querySelectorAll('.file-item').forEach(item => {
                    if (item.classList.contains('selected'))
                        selectedFilesSize += parseFloat(item.querySelector('.file-size').innerText);
                })
                if (selectedFilesSize > 1000)  {
                    document.querySelector('.files-size').innerText = (selectedFilesSize / 1000).toFixed(1) + ' Gb';
                } else {
                    document.querySelector('.files-size').innerText = selectedFilesSize.toFixed(1) + ' Mb';
                }

                closeModal(document.querySelector('#deleteFileModal'));
            })
    }

    openModal(document.querySelector('#deleteFileModal'));
}

// document.querySelector('.delete-button').addEventListener('click', () => {
//     let data = [];

//     document.querySelectorAll('.file-item.selected').forEach(item => {
//         data.push(item.getAttribute('name'));
//     })

//     submitRequest('/deleteFiles', 'post', data)
//         .then(() => {
//             console.log('Deleted successfully: ' + data);
//         })
// })

// document.querySelector('.download-button').addEventListener('click', () => {
//     document.querySelectorAll('.file-item.selected').forEach(item => {
//         let fileName = item.getAttribute('name');
//         window.location.href = '/downloadFile/' + fileName;
//     })
// })

/* Apply new settings */
function collectSettings() {
    let data = {
        writeMode: document.querySelector('#writeMode').value,
        duration: document.querySelector('.settings-duration .active').innerText
    }

    document.querySelectorAll('.settings-sampleR .active').forEach(item => {
        data.sampleRate = item.innerText;
    })

    submitRequest('/applyRecordSettings', 'post', data)
}

/* Show more settings */
function moreSettings() {
    let button = document.querySelector('.settings-all');
    let icon = document.querySelector('.settings-more i');

    if (button.classList.contains('active')) {
        button.classList.remove('active');
        icon.classList.remove('bi-chevron-double-up');
        icon.classList.add('bi-chevron-double-down');
    } else {
        button.classList.add('active');
        icon.classList.remove('bi-chevron-double-down');
        icon.classList.add('bi-chevron-double-up');
    }

    restoreIndicator();
}

function showSettings(type) {
    document.querySelectorAll('.settings-type > div').forEach(item => {
        let i = item.getAttribute('name');

        if (item == type) {
            document.querySelector(`.${i}`).classList.add('active');
            item.classList.add('active');
        } else {
            document.querySelector(`.${i}`).classList.remove('active');
            item.classList.remove('active');
        }

        restoreIndicator();
    })
}

function restoreIndicator() {
    chgToggle(document.querySelector('.settings-duration-indicator'), document.querySelectorAll('.settings-duration-item'));
    chgToggle(document.querySelector('.settings-fps-indicator'), document.querySelectorAll('.settings-fps-item'));
    chgToggle(document.querySelector('.settings-sampleR-indicator'), document.querySelectorAll('.settings-sampleR-item'));
}

/* Optional elements */
document.querySelector('#innerWidth').innerText = window.innerWidth;
document.querySelector('#innerHeight').innerText = window.innerHeight;

document.querySelector('#optional-button').addEventListener('click', () => {
    fetch('/stopStream');
})

/* Multistream start */
function startMultistream() {
    addSpinner(document.querySelector('#multistream-button'));

    submitRequest('/multistream')
        .then(() => {
            record = true;
            deleteSpinner(document.querySelector('#multistream-button'));
            setRecordMode(true);

            document.querySelector('#multistream-button').hidden = true;
            document.querySelector('#onlyRecord-button').hidden = true;
            document.querySelector('#stopRecord-button').hidden = false;

            initStream();
        })
}

/* Record start */
function startRecord() {
    addSpinner(document.querySelector('#onlyRecord-button'));

    submitRequest('/startRec')
        .then(() => {
            if (hls != null) {
                hls.destroy();
                hls = null;
            }
            videoTag.removeAttribute('src');
            videoTag.load();
            stream = false;

            record = true;
            deleteSpinner(document.querySelector('#onlyRecord-button'));
            setRecordMode(true);

            document.querySelector('#multistream-button').hidden = true;
            document.querySelector('#onlyRecord-button').hidden = true;
            document.querySelector('#stopRecord-button').hidden = false;
        })
}

function stopRecord() {
    addSpinner(document.querySelector('#stopRecord-button'));

    submitRequest('/stopRec')
        .then(() => {
            record = false;
            deleteSpinner(document.querySelector('#stopRecord-button'));
            setRecordMode(false);

            document.querySelector('#multistream-button').hidden = false;
            document.querySelector('#onlyRecord-button').hidden = false;
            document.querySelector('#stopRecord-button').hidden = true;

            startStream();
        })
}

function setRecordMode(status) {
    if (status) {
        // document.querySelector('.startRecord-button').hidden = true;
        // document.querySelector('.stopRecord-button').hidden = false;

        document.querySelector('#recStatus').hidden = false;
    } else {
        // document.querySelector('.stopRecord-button').hidden = true;
        // document.querySelector('.startRecord-button').hidden = false;

        document.querySelector('#recStatus').hidden = true;
    }
}

function setTime() {
    const date = new Date(document.querySelector('#setTime-value').value);

    let year = date.getFullYear().toString().split('');
    year = `${year[2]}${year[3]}`;
    let month = date.getMonth() + 1;
    month = month < 10? '0' + month: month;
    let day = date.getDate() < 10? '0' + date.getDate(): date.getDate();
    let hour = date.getHours() < 10? '0' + date.getHours(): date.getHours();
    let minute = date.getMinutes() < 10? '0' + date.getMinutes(): date.getMinutes();
    let second = '00';
    let week = date.getDay();

    let data = {
        date: `${hour}${minute}${second}${day}${month}${year}${week}`
    }

    submitRequest('/setTime', 'post', data)
}

// function checkRCStatus() {
//     if (rcPairedStatus) {
//         openModal(document.querySelector('#confirmRCModal'));
//     } else {
//         addRC();
//     }
// }

// function addRC() {
//     addSpinner(document.querySelector('.rc-button'));

//     submitRequest('/addRC')
// }

/* Send requests */
function submitRequest(url, method, data) {
    return fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(res => {
        if (!res.ok) throw res;

        if (res.headers.get('Content-Type') == 'application/json; charset=utf-8') {
            return res.json();
        } else {
            return res.text();
        }
    }).catch(err => Promise.reject(err))
}

/* Account dropdown Functions */
// const dropdown = document.querySelector('.bi-list');
// const dropdownMenu = document.querySelector('.dropdown-menu');
// const setPasswordModal = document.querySelector('#setPassword');

// dropdown.addEventListener('click', () => {
//     if (dropdownMenu.style.display === 'none') {
//         dropdownMenu.style.display = 'block';
//     } else {
//         dropdownMenu.style.display = 'none';
//     }
// });

/* Logout */
// function logout() {
//     localStorage.removeItem('token');
//     window.location.reload();
// }

/* Modal functions */
function openModal(modal) {
    modal.style.display = 'flex';

    if (modal.getAttribute('id') == 'settingsModal') {
        restoreIndicator();
    }
}

function closeModal(modal) {
    modal.style.display = 'none';
}

const overlayModal = document.querySelectorAll('.modal-overlay');
overlayModal.forEach(item => {
    item.addEventListener('click', (e) => {
        if (e.target === item) {
            closeModal(item);
        }
    });
})

/* Animate percent counter */
function animateCounter(targetValue, startValue = 0) {
    let animateDuration = 1500;
    let frameDuration = 20;
    let currentFrame = 0;
    let counterElement = document.querySelector('.progress-val');

    let totalFrames = Math.round(animateDuration / frameDuration);
    let increment = (targetValue - startValue) / totalFrames;

    function updateCounter() {
        let currentValue = startValue + (increment * currentFrame);
        counterElement.innerText = Math.round(currentValue) + '%';

        if (currentFrame === totalFrames) {
            clearInterval(counterInterval);
        } else {
            currentFrame++;
        }
    }

    let counterInterval = setInterval(updateCounter, frameDuration);
}

/* Spinner functions */
function addSpinner(element) {
    element.disabled = true;

    // if (element.querySelector('i')) {
    //     element.querySelector('i').hidden = true;
    // }

    // let spinner = document.createElement('div');
    // spinner.classList.add('button-spinner', 'me-3');
    // element.insertAdjacentElement('afterbegin', spinner)
}

function deleteSpinner(element) {
    element.disabled = false;

    // if (element.querySelector('i')) {
    //     element.querySelector('i').hidden = false;
    // }

    // element.querySelector('.button-spinner').remove();
}

/* Toggle button */
function chgToggle(indicator, values) {
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
                handleIndicator(e.target);
            })
        } else {
            item?.addEventListener('click', function (e) {
                handleIndicator(e.target);
            })
        }
        item.classList.contains('active') && handleIndicator(item);
    })
}

/* Close dropdown menu */
// document.querySelector('main').addEventListener('click', () => {
//     dropdownMenu.style.display = 'none';
// });

/* Web socket */
let domainName = window.location.href.split('/')[2];
let ws = new WebSocket(`ws://${domainName}/socket`);
let wsTimeout;
wsConnection();

ws.onmessage = function (e) {
    wsMessage(e.data);
}

function wsMessage(data) {
    clearTimeout(wsTimeout);
    wsConnection();
    if (data == 'ping') return;

    let message = JSON.parse(data);

    switch (message.command) {
        case 'record-start':
            record = true;
            setRecordMode(true);
            if (!watchedFiles) {
                videoTag.removeAttribute('src');
                videoTag.load();
            }
            break;
        case 'record-stop':
            record = false;
            setRecordMode(false);
            if (!watchedFiles) {
                startStream();
            }
            break;
    }
}

function wsConnection() {
    wsTimeout = setTimeout(() => {
        ws = new WebSocket(`ws://${domainName}/socket`);

        ws.onopen = function () {
            console.log('socket opened');
        }

        ws.onmessage = function (e) {
            wsMessage(e.data);
        }

        ws.onclose = function () {
            console.log('socket closed');
        }
    }, 40000);
}