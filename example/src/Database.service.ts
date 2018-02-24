import { Service } from 'raf/core';
import { Mongoose, Schema } from 'mongoose'
const mongoose:Mongoose = require('mongoose')

var mongourl = 'mongourl'
var connection = mongoose.createConnection(mongourl)

@Service
export class Database{
	constructor(){
	}
}

export var BaseModel = mongoose.model('Base', new Schema({}))

export function Model<T extends {new(...args):any}>(constructor:T){
	var properties = Reflect.getMetadata('properties', constructor.prototype)
	var schema:any = {}
	properties.forEach(prop=>{
		schema[prop.name] = prop.type
	})
	var model = connection.model(constructor.name, new Schema(schema, {
		toJSON: {
			virtuals: true,
			transform: function(doc, obj, a){
				for(let prop in schema){
					if(schema[prop].select===false){
						delete obj[prop]
					}
				}
				delete obj.__v
				delete obj._id
				return obj
			}
		},
		timestamps: {
			createdAt: 'createdDate',
			updatedAt: 'updatedDate'
		}
	}))

	constructor = Object.assign(constructor, model)
	return class extends constructor{
		constructor(...args){
			super(...args)

			var props:any = {}
			properties.forEach(prop=>{
				var obj = args[0]||{}
				props[prop.name] = obj[prop.name]||this[prop.name]
			})

			var gen = new model(props)

			var self = this
			Object.getOwnPropertyNames(model.prototype).forEach(name=>{
				if(name=='constructor') return;
				var v = gen[name]
				if(typeof v == 'function')
					self[name] = v.bind(gen)
				else
					self[name] = v
			})
			Object.getOwnPropertyNames(gen).forEach(name=>{
				if(name=='constructor') return;
				var v = gen[name]
				if(typeof v == 'function')
					self[name] = v.bind(gen)
				else
					self[name] = v
			})
			Object.keys(props).forEach(i=>{
				Object.defineProperty(this, i, {
					set: function(v:any){
						gen[i] = v
					},
					get: function(){
						return gen[i]
					}
				})
			})
		}
		toString(){
			return `[${constructor.name}Model:${this.id}]`
		}
	}
}

export function Property(type){
	return function(target:any, key:string){
		var properties = Reflect.getMetadata('properties', target)
		if(!properties){
			properties = []
			Reflect.defineMetadata('properties', properties, target)
		}
		properties.push({type: type, name: key})
	}
}

export function prepareObject(model, obj:any){
  var hideProps = ['$__', 'isNew','errors', '_doc', 'db', 'discriminators',
    'schema', 'collection', '$__save', '$__validate', '$__remove', '$__init']
  var modelProperties = Object.getOwnPropertyNames(model)

  for(let prop in obj){
    if(hideProps.includes(prop)||!modelProperties.includes(prop)
    ||typeof model[prop] == 'function'){
      delete obj[prop]
    }
  }
}
