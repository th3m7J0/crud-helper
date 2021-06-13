const Joi = require('@hapi/joi');
const sanitizeHtml = require('./sanitizeHtml');

module.exports = function buildJoiObject(attributes){
	let joiValidations = [
		{
			type: 'String',
			value: Joi.string().trim().custom(sanitizeHtml).allow(null),
		},
		{
			type: 'Number',
			value: Joi.number().allow(null),
		},
		{
			type: 'ObjectID',
			value: Joi.string().trim().$.pattern(new RegExp(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/)).rule({message: 'must be a valid object id'}).allow(null),
		},
		{
			type: 'Boolean',
			value: Joi.boolean().default(false),
		},
		{
			type: 'Date',
			value: Joi.date().iso().allow(null), // date
		}
	]
	let joiObject= {};
	attributes.forEach(attribute => {
		if(attribute.type === 'Array'){
			let item = attribute.kind === 'Object' ? Joi.object(buildJoiObject(attribute.attributes))
				:joiValidations.find(validation => validation.type === attribute.kind).value
			joiObject[attribute.name] = Joi.array().items(item);
		}
		else
			joiObject[attribute.name] = joiValidations.find(validation => validation.type === attribute.type).value;
	});
	return joiObject;
};
