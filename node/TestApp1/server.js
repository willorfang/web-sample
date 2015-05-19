var http = require('https');
var fs = require('fs');
var expand_tilde = require('expand-tilde');
var formidable = require('formidable');
var port = 3000;

var options = {
	key: fs.readFileSync(expand_tilde('~/.ssh/key.pem')),
	cert: fs.readFileSync(expand_tilde('~/.ssh/key-cert.pem'))
};
var server = http.createServer(options, function(req, res) {
	if ('/' == req.url) {
		switch(req.method) {
			case 'GET':
				show(res);
				break;
			case 'POST':
				upload(req, res);
				break;
			default:
				badRequest(res);
		}
	} else {
		notFound(res);
	}
});

server.listen(port, function() {
	console.log('Listening on %s', port);
});

function show(res) 
{
  var html = '<html><head><title>Todo List</title></head><body>'
			+ '<h1>Todo List</h1>'
           	+ '<form method="post" action="/" enctype="multipart/form-data">'
           	+ '<p><input type="text" name="name" /></p>'
           	+ '<p><input type="file" name="file" /></p>'
           	+ '<p><input type="submit" value="Upload" /></p>'
           	+ '</form></body></html>';
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Length', Buffer.byteLength(html));
  res.end(html);
}

function notFound(res)
{
	res.statusCode = 404;
	res.setHeader('Content-Type', 'text-plain');
	res.end('Not Found');
}

function badRequest(res)
{
	res.statusCode = 400;
	res.setHeader('Content-Type', 'text-plain');
	res.end('Bad Request');
}

function isFormData(req)
{
	var type = req.headers['content-type'] || '';
	return 0 == type.indexOf('multipart/form-data');
}

function upload(req, res)
{
	if (!isFormData(req)) {
		badRequest(res);
	}

	var form = new formidable.IncomingForm();
	form.on('progress', function(recv, expect) {
		var percent = Math.floor(recv/expect*100);
		console.log(percent);
	});
	form.parse(req, function(err, fields, files) {
		if (err) {
			badRequest(res);
		} else {
			console.log(fields);
			console.log(files);
			res.end('Upload complete!');
		}
	});
}