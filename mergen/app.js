const express = require('express');
const app = express();

const fs = require('fs');
const path = require('path');
const shell_process = require('child_process');

app.set('view engine', 'ejs');

const hostname = 'localhost';
const PORT = 3000;

const createPath = (page) => path.resolve(__dirname, 'views-ejs', `${page}.ejs`);

const subProcess = require('child_process')

app.listen(PORT, hostname, (error) => {
    error ? console.log(error) : console.log(`Listening port ${PORT}`);
});

// app.use((req, res, next) => {
//     console.log(`path: ${req.path}`);
//     console.log(`url: ${req.url}`);
//     next();
// });

// app.use(express.urlencoded({ extended: false }));

app.use(express.static(__dirname + '/static'));

app.get('/', (req, res) => {
    const title = 'Home';

    const url = 'http://192.168.2.87:1500/hls/stream.m3u8';
    const data = loadJSON('data.json');

    res.render(createPath('index'), { title, data, url });
});

app.get('/login', (req, res) => {
    const title = 'Login';

    res.render(createPath('login'), { title });
});

app.get('/error', (req, res) => {
    const title = 'Error';

    res.render(createPath('error'), { title });
});

/*app.get('/startRec2', (req, res) => {

     var abc1 = shell_process.exec("capture.sh mp4", (err, stdout, stderr) => {
         if (err !== null) {
             console.log(err);
         }
     });

    const title = 'Home';

    const url = 'http://192.168.2.87:1500/hls/stream.m3u8';
    const data = loadJSON('data.json');

    res.render(createPath('index'), { title, data, url });

});*/

/*app.get('/startRecAnalog', (req, res) => {

     var abc1 = shell_process.exec("capture.sh mp4 720 576", (err, stdout, stderr) => {
         if (err !== null) {
             console.log(err);
         }
     });

    const title = 'Home';

    const url = 'http://192.168.2.87:1500/hls/stream.m3u8';
    const data = loadJSON('data.json');

    res.render(createPath('index'), { title, data, url });

});*/


app.get('/stopRec', (req, res) => {
     var abc2 = shell_process.exec("killSigInt.sh gst-launch-1.0 capture.sh", (err, stdout, stderr) => {
         if (err !== null) {
             console.log(err);
         }
     });

    const title = 'Home';

    const url = 'http://192.168.2.87:1500/hls/stream.m3u8';
    const data = loadJSON('data.json');

    res.render(createPath('index'), { title, data, url });
});

/*app.get('/startStream', (req, res) => {
    // var abc3 = shell_process.exec(command, (err, stdout, stderr) => {
    //     if (err !== null) {
    //         console.log(err);
    //     }
    // });

    const title = 'Home';

    const url = 'http://192.168.2.87:1500/hls/stream.m3u8';
    const data = loadJSON('data.json');

    res.render(createPath('index'), { title, data, url });
});

app.get('/stopStream', (req, res) => {
    // var abc4 = shell_process.exec(command, (err, stdout, stderr) => {
    //     if (err !== null) {
    //         console.log(err);
    //     }
    // });

    const title = 'Home';

    const url = 'http://192.168.2.87:1500/hls/stream.m3u8';
    const data = loadJSON('data.json');

    res.render(createPath('index'), { title, data, url });
});
*/
app.get('/startStream',(req, res) => {

    subProcess.exec(' capture.sh stream 1920 1080 3000', (err, stdout, stderr) => {
        if (err) {
          console.error(err)
		//process.exit(1)
        } else {
          console.log(`The stdout Buffer from shell: ${stdout.toString()}`)
          console.log(`The stderr Buffer from shell: ${stderr.toString()}`)
        }

    const title = 'Home';

    const url = 'http://192.168.2.87:1500/hls/stream.m3u8';
    const data = loadJSON('data.json');

    res.render(createPath('index'), { title, data, url });

})});

/*app.get('/startStreamAnalog',(req, res) => {

    subProcess.exec(' capture.sh stream 720 576', (err, stdout, stderr) => {
        if (err) {
          console.error(err)
                //process.exit(1)
        } else {
          console.log(`The stdout Buffer from shell: ${stdout.toString()}`)
          console.log(`The stderr Buffer from shell: ${stderr.toString()}`)
        }

    const title = 'Home';

    const url = 'http://192.168.2.87:1500/hls/stream.m3u8';
    const data = loadJSON('data.json');

    res.render(createPath('index'), { title, data, url });

      })});*/
 
app.get('/stopStream',(req, res) => {

    subProcess.exec(' killSigInt.sh capture.sh gst-launch', (err, stdout, stderr) => {
        if (err) {
          console.error(err)
		//process.exit(1)
        } else {
          console.log(`The stdout Buffer from shell: ${stdout.toString()}`)
          console.log(`The stderr Buffer from shell: ${stderr.toString()}`)
        }
})});

app.get('/startRec',(req, res) => {

    subProcess.exec('capture.sh mp4', (err, stdout, stderr) => {
        if (err) {
          console.error(err)
                //process.exit(1)
        } else {
          console.log(`The stdout Buffer from shell: ${stdout.toString()}`)
          console.log(`The stderr Buffer from shell: ${stderr.toString()}`)
        }
})});

/*app.get('/startRecAnalog',(req, res) => {

    subProcess.exec('capture.sh mp4 720 576', (err, stdout, stderr) => {
        if (err) {
          console.error(err)
                //process.exit(1)
        } else {
          console.log(`The stdout Buffer from shell: ${stdout.toString()}`)
          console.log(`The stderr Buffer from shell: ${stderr.toString()}`)
        }
})});*/


// app.use('*', (req, res) => {
//     const title = 'Error';

//     res
//         .status(404)
//         .render(createPath('error'), { title });
// });

function loadJSON(filename = '') {
    return JSON.parse(
        fs.existsSync(filename)
            ? fs.readFileSync(filename).toString()
            : '""'
    );
}

function saveJSON(filename = '', data = '""') {
    return fs.writeFileSync(filename, JSON.stringify(data));
}
