import 'reflect-metadata'
import {Router} from 'express'
import {RouteInjector, ClassInjector} from './Injector'
import getParamNames from './GetParamNames'
import { join } from 'path';

export function Controller(config:any={}){
	return function(constructor:any){
		var _class = Reflect.getMetadata('instance', constructor)
		if(!_class){
			var args = ClassInjector(constructor)
			_class = new constructor(...args)
			Reflect.defineMetadata('instance', _class, constructor)
		}
		var _router = Router(config)
		Reflect.defineMetadata('router', _router, constructor)
		var methods = Reflect.getMetadata('methods', constructor)
		methods.forEach(({route, type, fn, middlewares})=>{
			var args = [route]
			if(middlewares.length>0){
				args = [route, ...middlewares]
			}
			args.push(fn.bind(_class))
			_router[type.toLowerCase()](...args)
		})

		if(_class.error){
			/*_router.use(function(req, res, next){
				res.send('Error 404')
			})*/
			_router.use(function(err, req, res, next){
				res.status(err.status||err.code||400).send(_class.error(err))
			})
		}
	}
}

function decorate(path:string=null, {middlewares}:{middlewares?:Function[]}={}){
	return RouteDecorator(this.type, path, middlewares)
}

export var Post = decorate.bind({type: 'POST'})
export var Get = decorate.bind({type: 'GET'})
export var Put = decorate.bind({type: 'PUT'})
export var Delete = decorate.bind({type: 'DELETE'})

function RouteDecorator(type, path, middlewares:Function[]=[]){
	return function(target, key:any, descriptor:PropertyDescriptor){
		var methods = Reflect.getMetadata('methods', target.constructor)

		if(!methods){
			methods = []
			Reflect.defineMetadata('methods', methods, target.constructor)
		}

		methods.push({
			route: (path||key).replace(/^\/?(.*)/, '/$1'),
			type: type,
			fn: RouteInjector(target, key),
			middlewares: middlewares
		})
	}
}

export function Service(constructor:any){
	var _class = Reflect.getMetadata('instance', constructor)
	if(!_class){
		var args = ClassInjector(constructor)
		var _class = new constructor(...args)
		Reflect.defineMetadata('instance', _class, constructor)
	}
}

var env = process.env.NODE_ENV||''
var envFile = join(process.cwd(), './environments/environment.json')

if(env.toLowerCase().includes('production')){
	envFile = join(process.cwd(), './environments/environment.prod.json')
}

export const environment = require(envFile)
