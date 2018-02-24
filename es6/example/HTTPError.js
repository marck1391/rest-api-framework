export class HTTPError extends Error {
    constructor(error, code = 400) {
        super(error);
        this.error = error;
        this.code = code;
        this.name = 'HTTP Error';
    }
    toJSON() {
        return { error: this.message };
    }
}
