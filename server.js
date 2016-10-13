var http = require('http'),
    server = http.createServer(),
    port = process.env.PORT || 8080,
    fs = require('fs'),
    klocka = require('klocka');

server.on('request', function(req, res){
  // debug
  klocka(req, res);
  // html
  if (req.url !== '/public/router.js') {
    fs.readFile('./public/index.html', 'utf8', function(err, html){
      if (err) throw err;
      res.end(html);
    });
  // js
  } else {
    fs.readFile('./public/router.js', function(err, js){
      if (err) throw err;
      res.end(js);
    });
  }
})

server.listen(port, function(){
  console.log('Server running..');
});
