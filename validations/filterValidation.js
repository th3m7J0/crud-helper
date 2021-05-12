const getAttributesBySchema = require('./getAttributesBySchema');
const buildJoiObject = require('./buildJoiObject');
const validate = require('./validate');
const Joi = require('@hapi/joi');


module.exports = async (resourceModel,data,next)=>{
	let attributes = getAttributesBySchema(resourceModel.schema,false);
	let myFilters = [];
	for(key in data){
		myFilters.push(attributes.find((attribute)=>attribute.name===key));

	}
	let joiObject = buildJoiObject(myFilters);
	const schema = Joi.object(joiObject);
	return validate(schema,data,next);
};


