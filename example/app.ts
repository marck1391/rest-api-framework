import { App } from 'raf'
import { UsersController } from './Users.controller'
import { AuthController } from './Auth.controller'

var routes = [
	{path: '/user', controller: UsersController},
	{path: '/auth', controller: AuthController}
]

export var app = new App({
	routes,
	endpoint: '/api/v1',
	tmpDir: './temp',
	allowOrigin: '*',
	credentials: true,
	cache: false,
	cors: true,
	allowHeaders: ['X-Auth-Token', 'Authorization'],
	static: './public'
})

app.init()
