let mongoose = require('mongoose');
mongoose.connect('mongodb://mongodb/jobs');

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('We have connected to the database.');
    // we're connected!
});

const resultsSchema = mongoose.Schema({
    name: String,
    results: String
});
const Result = mongoose.model('Result', resultsSchema);

module.exports = Result;