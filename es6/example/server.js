import { HttpServer } from 'raf';
import { app } from './app';
var server = new HttpServer(app, { port: 3000, host: '0.0.0.0' });
server.listen();
