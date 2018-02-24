import { Controller, Get, Post } from 'raf/core'
import { sign, verify } from  'jsonwebtoken'
import { User } from './User.model'
import { compare } from './SecurePassword.helper'
import { HTTPError } from './HTTPError'

const jwtsecret = 'supersecrettoken'
const passwordSecret = 'mySuperSecret'

@Controller
export class AuthController{
  @Post('/')
  async auth(email:string, password:string){
    return User.findOne({email}).select('+password').then((user:User)=>{
      if(!user||!compare(password, user.password, passwordSecret, 15))
        throw new Error('Invalid email or password')
      var token = sign({id: user._id}, jwtsecret)
      return {token}
    })
  }
}

export function AuthMiddleware(req, res, next){
  var auth = req.headers['authorization']
  if(!auth) return next(new HTTPError('Authentication required', 403))
  var token = auth.split(' ')[1]
  verify(token, jwtsecret, function(err, data){
    if(err) return next(new HTTPError(err, 401))
    if(!data.id.match(/[a-f0-9]{24}/)) return next(new HTTPError('Invalid user id', 401))
    req.headers.userid = data.id
    next()
  })
}
