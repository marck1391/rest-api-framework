var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Service } from 'raf/core';
import { Schema } from 'mongoose';
const mongoose = require('mongoose');
var mongourl = 'mongourl';
var connection = mongoose.createConnection(mongourl);
let Database = class Database {
    constructor() {
    }
};
Database = __decorate([
    Service,
    __metadata("design:paramtypes", [])
], Database);
export { Database };
export var BaseModel = mongoose.model('Base', new Schema({}));
export function Model(constructor) {
    var properties = Reflect.getMetadata('properties', constructor.prototype);
    var schema = {};
    properties.forEach(prop => {
        schema[prop.name] = prop.type;
    });
    var model = connection.model(constructor.name, new Schema(schema, {
        toJSON: {
            virtuals: true,
            transform: function (doc, obj, a) {
                for (let prop in schema) {
                    if (schema[prop].select === false) {
                        delete obj[prop];
                    }
                }
                delete obj.__v;
                delete obj._id;
                return obj;
            }
        },
        timestamps: {
            createdAt: 'createdDate',
            updatedAt: 'updatedDate'
        }
    }));
    constructor = Object.assign(constructor, model);
    return class extends constructor {
        constructor(...args) {
            super(...args);
            var props = {};
            properties.forEach(prop => {
                var obj = args[0] || {};
                props[prop.name] = obj[prop.name] || this[prop.name];
            });
            var gen = new model(props);
            var self = this;
            Object.getOwnPropertyNames(model.prototype).forEach(name => {
                if (name == 'constructor')
                    return;
                var v = gen[name];
                if (typeof v == 'function')
                    self[name] = v.bind(gen);
                else
                    self[name] = v;
            });
            Object.getOwnPropertyNames(gen).forEach(name => {
                if (name == 'constructor')
                    return;
                var v = gen[name];
                if (typeof v == 'function')
                    self[name] = v.bind(gen);
                else
                    self[name] = v;
            });
            Object.keys(props).forEach(i => {
                Object.defineProperty(this, i, {
                    set: function (v) {
                        gen[i] = v;
                    },
                    get: function () {
                        return gen[i];
                    }
                });
            });
        }
        toString() {
            return `[${constructor.name}Model:${this.id}]`;
        }
    };
}
export function Property(type) {
    return function (target, key) {
        var properties = Reflect.getMetadata('properties', target);
        if (!properties) {
            properties = [];
            Reflect.defineMetadata('properties', properties, target);
        }
        properties.push({ type: type, name: key });
    };
}
export function prepareObject(model, obj) {
    var hideProps = ['$__', 'isNew', 'errors', '_doc', 'db', 'discriminators',
        'schema', 'collection', '$__save', '$__validate', '$__remove', '$__init'];
    var modelProperties = Object.getOwnPropertyNames(model);
    for (let prop in obj) {
        if (hideProps.includes(prop) || !modelProperties.includes(prop)
            || typeof model[prop] == 'function') {
            delete obj[prop];
        }
    }
}
