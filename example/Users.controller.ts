import { Controller, Get, Post, Put, Delete } from 'raf/core'
import { Request, Response, Header } from 'raf/types'
import { User } from './User.model'
import { AuthMiddleware } from './Auth.controller'
import { hash, compare } from './SecurePassword.helper'

const passwordSecret = 'mySuperSecret'

@Controller
export class UsersController{
  @Get('/')
  async list(){
    return User.find({})
  }

  @Get('/:id([a-f0-9]{24})')
  async read(id:string):Promise<User>{
    return User.findOne({_id: id}).select('+password').then((user:User)=>{
      if(!user) throw new Error('User not found')
      return user
    })
  }

  @Post('/')
  async create(firstname:string, lastname:string, email:string, password:string):Promise<{id:string}>{
    var phash = hash(password, passwordSecret, 15)
    var user = new User({firstname, lastname, email, password: phash})
    return user.save().catch(err=>{
      if(err.message.includes('dup key')){
        throw new Error('Email already registered')
      }
      return err
    })
  }

  @Put('/', {middlewares: [AuthMiddleware]})
  async changePassword(@Header userid:string, current:string,
    password:string):Promise<boolean>{
    return this.read(userid).then(async (user)=>{
      if(!compare(current, user.password, passwordSecret, 15)) throw new Error('Invalid password')
      user.password = hash(password, passwordSecret, 15)
      return user.save().then(res=>{
        return true
      })
    })
  }

  @Delete('/:id([a-f0-9]{24})', {middlewares: [AuthMiddleware]})
  delete(id:string):Promise<User>{
    return this.read(id).then(user=>{
      return user.remove()
    })
  }
}
