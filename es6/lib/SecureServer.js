import * as https from 'https';
export class HttpSecureServer {
    constructor(app, { port, host, options }) {
        this.app = app;
        this.port = port || 443;
        this.host = host || '0.0.0.0';
        this.options = options;
        this.createServer();
    }
    createServer() {
        var options = this.options;
        /*var options = {
          key: fs.readFileSync('./sslcert/cert.key'),
          cert: fs.readFileSync('./sslcert/cert.crt')
        }*/
        if (!options.key || !options.cert) {
            throw new Error('No credentials set for secure server');
        }
        this.server = https.createServer(options, this.app.express);
    }
    listen() {
        var server = this.server.listen(this.port, this.host, function () {
            console.log('Server listening on https://%s:%d', server.address().address, server.address().port);
        });
    }
}
