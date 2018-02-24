# Raf
Typescript RESTful API Framework with Express

1. Copy example folder ([Example](https://github.com/marck1391/rest-api-framework/tree/master/example))
2. `npm install`
3. Change the mongourl on `Database.service.ts` file
4. `npm run start:dev`


Resources
- User: http://localhost:3000/api/v1/user [User Controller](https://github.com/marck1391/rest-api-framework/blob/master/example/src/Users.controller.ts)
  - List all users: `Get /`
  - Get user by id: `Get /:id([a-f0-9]{24})` (MongoDB ObjectId)
  - Create user: `Post /` (Fields: firstname:string, lastname:string, email:string, password:string)
  - ...
- Auth: http://localhost:3000/api/v1/auth [Auth Controller](https://github.com/marck1391/rest-api-framework/blob/master/example/src/Auth.controller.ts)


##TODO
- Documentation

##Licence
[MIT](https://github.com/marck1391/rest-api-framework/blob/master/LICENSE)
