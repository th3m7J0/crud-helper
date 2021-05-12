const getAttributesBySchema = require('./getAttributesBySchema');
const buildJoiObject = require('./buildJoiObject');
const validate = require('./validate');
const Joi = require('@hapi/joi');


module.exports = async (resourceModel,data,next)=>{
		let attributes = getAttributesBySchema(resourceModel.schema);
		let joiObject = buildJoiObject(attributes);
		const schema = Joi.object(joiObject);
		return validate(schema,data,next);
};


