const flatten = require('flat');
const{catchAsync,AppError} = require('../error');

module.exports = async (schema,data,next)=>{
	let myData;
	try {
		let flatData = flatten(data,{safe: true}); // do not flat arrays
		const value = await schema.validateAsync(flatData,{abortEarly:false});
		myData = value;
	} catch (errors){
		// console.log(errors);
		return next(new AppError(422,{msg:'Input validation',data:{details:errors.details}}));
	}
	return myData;
}
