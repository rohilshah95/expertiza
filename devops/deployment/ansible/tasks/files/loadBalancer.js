/*
A load balancer and blue-green deployment implementation of Expertiza which are running on two port, 3000 and 3001.
Handle all incoming requests on port 8080.
Also load balancer and blue-green deployment implementation of Expertiza ReactJS front-end which are running on two port, 5000 and 5001.
Handle all incoming requests on port 4000.
The ansible script runs this file.
*/

var fs = require('fs');
var http = require('https');
var httpProxy = require('http-proxy')
var proxy = httpProxy.createProxyServer({secure: false});
var options = {
        key: fs.readFileSync('/home/expertiza/key.pem'),
        cert: fs.readFileSync('/home/expertiza/cert.pem')
};
//var credentials = crypto.createCredentials({key: privateKey, cert: certificate});
var server=http.createServer(options, function (req, res){

        /*
        Math.random() is used to randomly generate a new number since we
        only want 20% of all requests to be redirected to the green channel on port 3001.
        */

        var random = Math.random()

        /*
        The 0.8 figure is used to route 20% of all requests to be redirected to the green channel on port 3001.
        */

        if(random<=0.8) {

                /*
                Redirect to port 3000. If an error occus then redirect to port 3002.
                */

                proxy.web(req, res, {target: "https://localhost:3000"}, function (e){
                        proxy.web(req, res, {target: "https://localhost:3002"});
                });
        }
        else {

                /*
                Redirect to port 3002. If an error occus then redirect to port 3000.
                */

                proxy.web(req, res, {target: "https://localhost:3002"}, function (e){
                    proxy.web(req, res, {target: "https://localhost:3000"});
                });
        }
});

/*
Serve all incoming requests on port 8080.
*/

server.listen(8080);
