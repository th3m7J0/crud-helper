const sanitizeHtml = require('sanitize-html');

module.exports = (value, helpers) => {
	const clean = sanitizeHtml(value, {
		allowedTags: [],
		allowedAttributes: {},
	});
	if(clean !== value)
		return helpers.message('should not contain html tags');
	return clean;
};
