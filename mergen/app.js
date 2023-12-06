const express = require('express');
const app = express();

const fs = require('fs');
const os = require('os');
const path = require('path');
const shell = require('child_process');

const expressWs = require('express-ws');
const wsInstance = expressWs(app);
const wss = wsInstance.getWss();

app.set('view engine', 'ejs');

const hostname = 'localhost';
const PORT = 3000;

const createPath = (page) => path.resolve(__dirname, 'views-ejs', `${page}.ejs`);

app.listen(PORT, hostname, (err) => {
    err ? console.log(`${getDateTime()} Ошибка: ${err}`) : console.log(`Listening port ${PORT}`);
});

// app.use((req, res, next) => {
//     console.log(`path: ${req.path}`);
//     console.log(`url: ${req.url}`);
//     next();
// });

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(__dirname + '/static'));
// app.use(express.static(__dirname + '/files'));
app.use(express.static('/data'));

/* Functions */
function getJSON(jsonName) {
    jsonPath = path.join('/etc/mergen', jsonName);
    // jsonPath = path.join(__dirname, 'data.json');

    return JSON.parse(
        fs.existsSync(jsonPath)
            ? fs.readFileSync(jsonPath).toString()
            : '""'
    );
}

async function updateJSON(jsonName, jsonUpdate) {
    return new Promise((resolve, reject) => {
        fs.readFile(jsonName, (readErr, data) => {
            if (readErr) {
                console.error(`${getDateTime()} Ошибка чтения файла: `, readErr);
                reject(readErr);
                return;
            }

            const jsonParsed = JSON.parse(data);

            for (const key in jsonUpdate) {
                if (jsonParsed.hasOwnProperty(key)) {
                    jsonParsed[key] = jsonUpdate[key];
                }
            }

            fs.writeFile(jsonName, JSON.stringify(jsonParsed, null, 4), (writeErr) => {
                if (writeErr) {
                    console.log(`${getDateTime()} Ошибка записи в файл: `, writeErr);
                    reject(writeErr);
                    return;
                } else {
                    resolve();
                }
            });
        })
    })
}

async function getFileProperties() {
    try {
        const filesDirPath = (os.type() == 'Windows_NT')? __dirname + '/files': '/data';
        const allFiles = await fs.readdirSync(filesDirPath);
        const fileProperties = [];

        for (const file of allFiles) {
            const filePath = path.join(filesDirPath, file);
            const stats = await fs.statSync(filePath);

            const fileInfo = {
                fileName: file,
                fileSize: (stats.size / 1024 / 1024).toFixed(1),
                fileCreationDate: stats.birthtime
            };

            // let size = getJSON();
            fileInfo.fileDuration = 'mm:ss';

            fileProperties.push(fileInfo);
        }

        fileProperties.sort((a, b) => b.fileCreationDate - a.fileCreationDate);

        return fileProperties;
    } catch (err) {
        console.error(`${getDateTime()} Ошибка получения данных о файле: ${err}`);
    }
}

function getDateTime() {
    let date = new Date();

    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    month = month < 10? '0' + month: month;
    let day = date.getDate() < 10? '0' + date.getDate(): date.getDate();
    let hour = date.getHours() < 10? '0' + date.getHours(): date.getHours();
    let minute = date.getMinutes() < 10? '0' + date.getMinutes(): date.getMinutes();
    let second = date.getSeconds() < 10? '0' + date.getSeconds(): date.getSeconds();

    return `${hour}:${minute}:${second} ${day}.${month}.${year}`;
}

// async function multipleDelete(filesArray) {
//     return new Promise((resolve, reject) => {
//         filesArray.forEach(item => {
//             const vidPath = (os.type() == 'Windows_NT')? __dirname + '/files/' + item : '/data/' + item;

//             fs.unlink(vidPath, function (err) {
//                 if (err) {
//                     console.error(`${getDateTime()} Ошибка удаления: ${err}`);
//                     reject(err);
//                     return;
//                 } else {
//                     console.log(`${getDateTime()} Все четко удалено ${item}`);
//                 }
//             });
//         })
        
//         resolve();
//     })
// }

const sleep = ms => {
    return new Promise(resolve => {
        setTimeout(() => resolve(), ms);
    })
}

/* Requests */
app.get('/', (req, res) => {
    const title = 'Home';

    res.render(createPath('index'), { title });
});

/* app.get('/login', (req, res) => {
    const title = 'Login';

    res.render(createPath('login'), { title });
});

app.get('/error', (req, res) => {
    const title = 'Error';

    res.render(createPath('error'), { title });
}); */

app.get('/getFiles', (req, res) => {
    getFileProperties().then((data) => {
        res.status(200).send(data);
    })
});

app.get('/getFile/:fileId', (req, res) => {
    const vidPath = (os.type() == 'Windows_NT')? __dirname + '/files/' + req.params.fileId : '/data/' + req.params.fileId;
    const streamVideo = fs.createReadStream(vidPath);
    streamVideo.pipe(res)
        // .on('drain', () => {
        //     console.log(`--- RS Drain ---`)
        // })
        // .on('finish', () => {
        //     console.log('--- RS Finish ---')
        // })
});

app.get('/downloadFile/:fileId', (req, res) => {
    const vidPath = (os.type() == 'Windows_NT')? __dirname + '/files/' + req.params.fileId : '/data/' + req.params.fileId;
    res.download(vidPath, function(err) {
        if (err) {
            console.error(`${getDateTime()} Ошибка скачивания: ${err}`);
            return;
        }
    })
});

app.get('/deleteFile/:fileId', (req, res) => {
    const vidPath = (os.type() == 'Windows_NT')? __dirname + '/files/' + req.params.fileId : '/data/' + req.params.fileId;
    fs.unlinkSync(vidPath);
    res.sendStatus(200);
});

// app.post('/deleteFiles', (req, res) => {
//     if(!req.body) return res.sendStatus(400);

//     multipleDelete(req.body).then(() => {
//         res.sendStatus(200);
//     })
// });

app.get('/getDeviceSettings', (req, res) => {
    const deviceConf = getJSON('deviceConf.json');
    res.setHeader('Content-Type', 'application/json');
    res.json(deviceConf);
});

app.get('/getRecordSettings', (req, res) => {
    const recordConf = getJSON('recordConf.json');
    res.setHeader('Content-Type', 'application/json');
    res.json(recordConf);
});

app.get('/getBattery', (req, res) => {
    shell.exec("remoteControlCommands.sh getBatteryLevel", (err, stdout, stderr) => {
        if (err) {
            console.error(`${getDateTime()} Ошибка: ${err}`);
            return;
        }
    })

    sleep(2000).then(() => {
        fs.readFile('/tmp/volLvl.txt', (err, data) => {
            if (err) {
                console.error(`${getDateTime()} Ошибка чтения txt: ${err}`);
                return;
            }
            res.status(200).send(data);
        })
    })
});

app.get('/getMemory', (req, res) => {
    shell.exec("df -BM | grep /dev/root | awk '{ print $2 } { print $4 }'", (err, stdout, stderr) => {
        if (err) {
            console.error(`${getDateTime()} Ошибка: ${err}`);
            return;
        }
        res.status(200).send(stdout);
    })
});

app.get('/getTemperature', (req, res) => {
    shell.exec("remoteControlCommands.sh getTemp", (err, stdout, stderr) => {
        if (err) {
            console.error(`${getDateTime()} Ошибка: ${err}`)
            return;
        }

        sleep(2000).then(() => {
            fs.readFile('/tmp/tempLvl.txt', (err, data) => {
                if (err) {
                    console.error(`${getDateTime()} Ошибка чтения txt: ${err}`);
                    return;
                }
                res.status(200).send(data);
            })
        })
    })
});

app.get('/getTime', (req, res) => {
    shell.exec("date '+%H:%M %d.%m.%y'", (err, stdout, stderr) => {
        if (err) {
            console.error(`${getDateTime()} Ошибка: ${err}`);
            return;
        }
        res.status(200).send(stdout);
    })
});

app.post('/setTime', (req, res) => {
    shell.exec(`remoteControlCommands.sh setTime ${req.body.date}`, (err, stdout, stderr) => {
        if (err) {
            console.error(`${getDateTime()} Ошибка: ${err}`);
            return;
        }
        res.sendStatus(200);
    })
});

// app.get('/addRC', (req, res) => {
//     shell.exec("remoteControlCommands.sh key", (err, stdout, stderr) => {
//         if (err) {
//             console.error(`${getDateTime()} Ошибка: ${err}`);
//             return;
//         }
//     })
// });

app.get('/startRec', (req, res) => {
    shell.exec("startupRecorder.sh mp4", (err, stdout, stderr) => {
        if (err) {
            console.error(`${getDateTime()} Ошибка: ${err}`);
            return;
        }
    })

    setTimeout(() => {
        shell.exec("ps -ef | grep gst | grep mp4 | grep -v grep | awk '{ print $2 }'", (err, stdout, stderr) => {
            if (err) {
                console.error(`${getDateTime()} Ошибка: ${err}`);
                return;
            }

            updateJSON('/etc/mergen/recordConf.json', { record: 'on' }).then(() => {
                res.sendStatus(200);
            })
        })
    }, 5000)
});

app.get('/stopRec', (req, res) => {
    shell.exec("startupRecorder.sh killRec", (err, stdout, stderr) => {
        if (err) {
            console.error(`${getDateTime()} Ошибка: ${err}`);
            return;
        }
    })

    setTimeout(() => {
        shell.exec("ps -ef | grep gst | grep mp4 | grep -v grep | awk '{ print $2 }'", (err, stdout, stderr) => {
            if (err) {
                console.error(`${getDateTime()} Ошибка: ${err}`);
                return;
            }

            updateJSON('/etc/mergen/recordConf.json', { record: 'off' }).then(() => {
                shell.exec("indication.sh standart", (err, stdout, stderr) => {
                    if (err) {
                        console.error(`${getDateTime()} Ошибка: ${err}`);
                        return;
                    }
                })

                res.sendStatus(200);
            })
        })
    }, 5000)
});

app.get('/multistream', (req, res) => {
    shell.exec("startupRecorder.sh streamRecord", (err, stdout, stderr) => {
        if (err) {
            console.error(`${getDateTime()} Ошибка: ${err}`);
            return;
        }
    })

    setTimeout(() => {
        shell.exec("ps -ef | grep stream | grep mp4 | grep -v grep | awk '{ print $2 }'", (err, stdout, stderr) => {
            if (err) {
                console.error(`${getDateTime()} Ошибка: ${err}`);
                return;
            }
            res.sendStatus(200);
        })
    }, 5000)
});

app.get('/startStream', (req, res) => {
    shell.exec("startupRecorder.sh stream", (err, stdout, stderr) => {
        if (err) {
            console.error(`${getDateTime()} Ошибка: ${err}`);
            return;
        } else {
            res.sendStatus(200);
        }
    })
});

app.get('/stopStream', (req, res) => {
    shell.exec("startupRecorder.sh killStream", (err, stdout, stderr) => {
        if (err) {
            console.error(`${getDateTime()} Ошибка: ${err}`);
            return;
        } else {
            res.sendStatus(200);
        }
    })
});

app.post('/applyRecordSettings', (req, res) => {
    if(!req.body) return res.sendStatus(400);

    updateJSON('/etc/mergen/recordConf.json', req.body).then(() => {
        res.sendStatus(200);
    })
});

app.ws('/socket', function(ws, req) {
    setInterval(() => {
        ws.send('ping');
    }, 30000);
})

app.post('/device/notification', (req, res) => {
    if(req.body) {
        // console.log(req.body);
        sendMessage(JSON.stringify(req.body));
    } else {
        console.log(`${getDateTime()} Ошбика: request.body is empty`);
    }
});

function sendMessage(message) {
    wss.clients.forEach(client => {
        if (client.readyState == 1) {
            client.send(message);
        }
    })
}

// app.use('*', (req, res) => {
//     const title = 'Error';

//     res
//         .status(404)
//         .render(createPath('error'), { title });
// });

