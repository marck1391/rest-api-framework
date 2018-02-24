export class HTTPError extends Error{
  constructor(public error:any, public code:number=400){
    super(error)
    this.name = 'HTTP Error'
  }

  toJSON(){
    return {error: this.message}
  }
}
