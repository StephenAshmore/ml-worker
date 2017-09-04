const fetch    = require('node-fetch');
let amqp = require('amqplib/callback_api');
let PythonShell = require('python-shell');
let fs = require('fs');

let Result = require('./database');

const port = process.env.PORT || 4027;

let queue = {}
let results = {}

connection = amqp.connect('amqp://rabbitmq', function(err, conn) {
    if (!conn) {
        // Exit here
        console.log('Could not connect to rabbitmq.');
        process.exit(1);
    }
    console.log('Connected to Rabbit MQ!');
    queue = conn.createChannel(function(err, ch1) {
        const q1 = 'jobs';

        queueSuccess1 = ch1.assertQueue(q1, {durable: true});
        // Note: on Node 6 Buffer.from(msg) should be used
        // ch.sendToQueue(q, new Buffer('Hello World!'));
        // console.log(" [x] Sent 'Hello World!'");
        if (queueSuccess1) {
            console.log(`Connected to Queue: ${q1}`);
        }
        else {
            console.log('Queue Assert resolving, or has failed.');
        }
        return ch1;
    });

    queue.consume('jobs', function(msg) {
        if ( msg ) {
            m = JSON.parse(msg.content);
            console.log(" [x] Received %s", m[1]);
            fs.open('script.py', 'w', function(err, fd) {
                if (err) {
                    // save the error in mongo, and acknowledge this
                    queue.ackAll();
                }

                // split the msg[1] by __n__ for newlines:
                lines = m[1].split('_n_');
                lines.forEach(function(line){
                    fs.writeSync(fd, line);
                    fs.writeSync(fd, '\n');
                });

                 // Run Python script in here:
                PythonShell.run('script.py', function (err, results) {
                    if (err) throw err;
                    console.log('results: %j', results);
                    // store in mongo:

                    queue.ackAll();
                });
            });
        }
        else {
        }
    }, {noAck: false});
});



