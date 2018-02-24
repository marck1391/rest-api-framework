var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Controller, Get, Post, Put, Delete } from 'raf/core';
import { Header } from 'raf/types';
import { User } from './User.model';
import { AuthMiddleware } from './Auth.controller';
import { hash, compare } from './SecurePassword.helper';
const passwordSecret = 'mySuperSecret';
let UsersController = class UsersController {
    list() {
        return __awaiter(this, void 0, void 0, function* () {
            return User.find({});
        });
    }
    read(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return User.findOne({ _id: id }).select('+password').then((user) => {
                if (!user)
                    throw new Error('User not found');
                return user;
            });
        });
    }
    create(firstname, lastname, email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            var phash = hash(password, passwordSecret, 15);
            var user = new User({ firstname, lastname, email, password: phash });
            return user.save().catch(err => {
                if (err.message.includes('dup key')) {
                    throw new Error('Email already registered');
                }
                return err;
            });
        });
    }
    changePassword(userid, current, password) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.read(userid).then((user) => __awaiter(this, void 0, void 0, function* () {
                if (!compare(current, user.password, passwordSecret, 15))
                    throw new Error('Invalid password');
                user.password = hash(password, passwordSecret, 15);
                return user.save().then(res => {
                    return true;
                });
            }));
        });
    }
    delete(id) {
        return this.read(id).then(user => {
            return user.remove();
        });
    }
};
__decorate([
    Get('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "list", null);
__decorate([
    Get('/:id([a-f0-9]{24})'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "read", null);
__decorate([
    Post('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    Put('/', { middlewares: [AuthMiddleware] }),
    __param(0, Header),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "changePassword", null);
__decorate([
    Delete('/:id([a-f0-9]{24})', { middlewares: [AuthMiddleware] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "delete", null);
UsersController = __decorate([
    Controller
], UsersController);
export { UsersController };
