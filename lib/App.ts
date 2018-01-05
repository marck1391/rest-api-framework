const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const Session = require('express-session')
const helmet = require('helmet')
const logger = require('morgan')
import { multipart, binary } from './FormData'
import guuid from '../lib/Guuid'

const Router = express.Router

declare var process:any
//TODO: cors:{origin:... maxAge, credentials}
//'.8dKCWQ]4fs/Q!jCu)]Z+4PQ8asFS=t'
export class App{
  express:any
  _routes:any

  error404Handler:(req:any, res:any, next:any)=>any
  errorHandler:(err:any, req:any, res:any, next:any)=>any
  beforeMiddlewares:(express:any)=>void
  afterMiddlewares:(express:any)=>void

  constructor(public config:any){
    this._routes = config.routes
    this.express = express()
  }

  init(){
    var before = this.beforeMiddlewares
    var after = this.afterMiddlewares
    before&&before(this.express)
    this.middlewares()
    after&&after(this.express)
    this.routes()
    this.errorHandlers()
    return this.express
  }

  middlewares(){
    var app = this.express
    var config = this.config

    app.use(logger('dev'));
    app.use(helmet())
    if(config.cache===false){
      app.use(helmet.noCache())
    }
    app.use(bodyParser.raw())
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(multipart(config.tmpDir))
    app.use(binary(config.tmpDir))
    if(config.cookies){
      app.use(cookieParser(config.secret))
    }
    if(config.useSessions){
      var session = Session({
          secret: this.config.secret,
          cookie: { maxAge: 25200000 },
          resave: false,
          saveUninitialized: true,
          //store: Session.MemoryStore,
          name: 'sid',
          genid: guuid,
          //secure: true
      })
      app.use(session)
    }
    if(config.views){
      app.set('views', config.views.path)
      app.set('view engine', config.viewEngine)
    }
    if(typeof config.static=='object'&&!Array.isArray(config.static)){
      if(config.static.route){
        app.use(config.static.route, express.static(config.static.path))
      }else{
        app.use(express.static(config.static.path))
      }
    }else if(Array.isArray(config.static)){
      config.static.forEach(content=>{
        app.use(content.route, express.static(content.path))
      })
    }else if(typeof config.static=='string'){
      app.use(express.static(config.static))
    }

    if(config.cors){
      this.cors()
    }
  }

  cors(allow:boolean=false){
    var config = this.config
    var allowedMethods = 'GET, POST, PUT, DELETE'
    this.express.use(function(req, res, next){
      var reqOrigin = req.get('origin')
      //TODO: Default origin * > if req.get(origin)==undefined > *
      if(config.allowOrigin){
        var origin = config.allowOrigin
        if(origin=='*'&&config.credentials){
          //No wildcard * allowed with credentials flag
          origin = req.get('origin')
        }else if(Array.isArray(origin)){
          origin = origin.some(allowed=>allowed==reqOrigin)?reqOrigin:false
        }
        res.header('Access-Control-Allow-Origin', origin)
      }

      if(config.credentials){
        res.header('Access-Control-Allow-Credentials', 'true')
      }
      //res.header('Content-Security-Policy', "default-src 'self'")

      if(req.method=='OPTIONS'){
        //X-Requested-With when crossDomain: false (same origin)
        //Allow Headers in controllers and application config
        res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type')
        res.header('Access-Control-Allow-Methods', allowedMethods)
        return res.send(allowedMethods)
      }
      next()
    })
  }

  routes(){
    var app = this.express
    var config = this.config
    var _router = Router()
    this._routes.forEach(({path, controller})=>{
      var router = Reflect.getMetadata('router', controller)
      _router.use(path, router)
    })
    app.use(config.endpoint, _router)
  }

  errorHandlers(){
    var app = this.express
    var error404Handler = this.error404Handler
    var errorHandler = this.errorHandler
    app.use(function(req, res, next){
      var result = error404Handler(req, res, next)
      if(result) res.status(404).send(result||'')
    })

    app.use(function(err, req, res, next){
      var result = errorHandler(err, req, res, next)
      res.send(result||{})
    })
  }
}
