import { ServerResponse, IncomingMessage } from 'http';
//export class Response{[prop: string]:any}
//export class Request{[prop: string]:any}
export class Headers {
}
export class Params {
}
export class Query {
}
export class Body {
}
export class Session {
}
export class Files {
}
export function Header(target, key, index) {
    var types = Reflect.getMetadata('argtypes', target, key);
    if (!types) {
        types = [];
        Reflect.defineMetadata('argtypes', types, target, key);
    }
    types.push({ arg: index, type: 'header' });
}
export class Response extends ServerResponse {
}
export class Request extends IncomingMessage {
}
