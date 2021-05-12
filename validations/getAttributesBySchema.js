
// from mongoose schema
module.exports = function getAttributesBySchema(schema,isBlacklisted=true){
	let attributes = [];
	let blacklist = ['deleted','_id','updatedAt','createdAt','__v'];
	for(const key in  schema.paths){
		let myObject = {};
		if(blacklist.includes(key) && isBlacklisted)
			continue;
		if(schema.paths[key].instance === 'Array'){
			// check if array is object or a primitive type (string, number, objectId ...etc)
			myObject.kind = schema.paths[key].schema ? 'Object' : schema.paths[key]['$embeddedSchemaType'].instance;
			if(myObject.kind === 'Object')
				myObject.attributes = getAttributesBySchema(schema.paths[key].schema);

		}
		myObject.name = key;
		myObject.type = schema.paths[key].instance;
		attributes.push(myObject);
	}
	return attributes;
};
