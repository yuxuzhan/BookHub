var https = require('https');
var http = require('http');
var GOOGLE_BOOKS_API_BASE = 'www.googleapis.com';
var GOOGLE_BOOKS_API_BOOK = '/books/v1/volumes';

module.exports = {
    resolveGoogle: function(isbn, callback) {
        var requestOptions = {
            host: GOOGLE_BOOKS_API_BASE,
            path: GOOGLE_BOOKS_API_BOOK + '?q=isbn:' + isbn
        };

        var request = https.request(requestOptions, function(response) {
            if (response.statusCode !== 200) {
                return callback(new Error('wrong response code: ' + response.statusCode));
            }

        var body = '';
        response.on('data', function(chunk) {
            body += chunk;
        })

        response.on('end', function() {
            var books = JSON.parse(body);

            if (!books.totalItems) {
                return callback(new Error('no books found with isbn: ' + isbn));
            }

            var book = books.items[0].volumeInfo;
            return callback(null, book);
            })
        });

        request.on('error', function(err) {
            return callback(err);
        })

        request.end();
    }
}
