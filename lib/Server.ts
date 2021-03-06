import * as http from 'http'

export class HttpServer{
  server:any
  port:number
  host:string
  options:any

  constructor(public app:any, {port, host}){
    this.port = port||3000
    this.host = host||'0.0.0.0'
    this.createServer()
  }

  createServer(){
    this.server = http.createServer(this.app.express)
  }

  listen(){
    var server = this.server.listen(this.port, this.host, function(){
      console.log('Server listening on http://%s:%d', server.address().address, server.address().port);
    })
  }
}
