var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Controller, Post } from 'raf/core';
import { sign, verify } from 'jsonwebtoken';
import { User } from './User.model';
import { compare } from './SecurePassword.helper';
import { HTTPError } from './HTTPError';
const jwtsecret = 'supersecrettoken';
const passwordSecret = 'mySuperSecret';
let AuthController = class AuthController {
    auth(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            return User.findOne({ email }).select('+password').then((user) => {
                if (!user || !compare(password, user.password, passwordSecret, 15))
                    throw new Error('Invalid email or password');
                var token = sign({ id: user._id }, jwtsecret);
                return { token };
            });
        });
    }
};
__decorate([
    Post('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "auth", null);
AuthController = __decorate([
    Controller
], AuthController);
export { AuthController };
export function AuthMiddleware(req, res, next) {
    var auth = req.headers['authorization'];
    if (!auth)
        return next(new HTTPError('Authentication required', 403));
    var token = auth.split(' ')[1];
    verify(token, jwtsecret, function (err, data) {
        if (err)
            return next(new HTTPError(err, 401));
        if (!data.id.match(/[a-f0-9]{24}/))
            return next(new HTTPError('Invalid user id', 401));
        req.headers.userid = data.id;
        next();
    });
}
