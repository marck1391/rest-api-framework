import 'reflect-metadata'
import {Router} from 'express'
import {RouteInjector, ClassInjector} from './Injector'
import getParamNames from './GetParamNames'
import { join } from 'path';

export function Controller(constructor:any){
	var _class
	if(!constructor.instance){
		var args = ClassInjector(constructor)
		_class = new constructor(...args)
		constructor.instance = _class
	}else
		_class = constructor.instance

	var _router = Router()
	constructor.router = _router

	//constructor.methods.forEach(({type, fn}, route)=>{ ES5
	for(let [route, {type, fn, middlewares}] of constructor.methods.entries()){
		var args = [route]
		if(middlewares.length>0){
			args = [route, ...middlewares]
		}
		args.push(fn.bind(_class))
		_router[type.toLowerCase()](...args)
	}

	if(_class.error){
		/*_router.use(function(req, res, next){
			//TODO: Default _app.error404
			res.send('Error 404')
		})*/
		_router.use(function(err, req, res, next){
			res.send(_class.error(err))
		})
	}
}

export function Get(path:string=null, {middlewares}:{middlewares?:Function[]}={}){
	return RouteDecorator('GET', path, middlewares)
}

export function Post(path:string=null, {middlewares}:{middlewares?:Function[]}={}){
	return RouteDecorator('POST', path, middlewares)
}

function RouteDecorator(type, path, middlewares:Function[]=[]){
	return function(target, key:any, descriptor:PropertyDescriptor){
		if(!target.constructor.methods){
			target.constructor.methods = new Map()
		}
		target.constructor.methods.set((path||key).replace(/^\/?(.*)/, '/$1'), {
			type: type,
			fn: RouteInjector(target, key),
			middlewares: middlewares
		})
	}
}

export function Service(constructor:any){
	if(!constructor.instance){
		var args = ClassInjector(constructor)
		var _class = new constructor(...args)
		constructor.instance = _class
	}
}

var env = process.env.NODE_ENV||''
var envFile = join(process.cwd(), './environments/environment.json')

if(env.toLowerCase().includes('production')){
	envFile = join(process.cwd(), './environments/environment.prod.json')
}

export const environment = require(envFile)
