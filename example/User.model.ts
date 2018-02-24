import { BaseModel, Model, Property } from './Database.service'

@Model
export class User extends BaseModel{
	@Property({type: String})
	firstname:string
	@Property({type: String})
	lastname:string
	@Property({type: String, required: true, unique: true})
	email:string
	@Property({type: String, required: true, select: false})
	password:string

	save():Promise<any>{
		return super.save().then(user=>{
			return {id: user._id}
		})
	}
}
