class AppError extends Error {
	constructor(status, msg ) {
		super(msg);

		this.status = status;
		this.msg = msg;
		this.isOperational = true;
	}
}




const catchAsync = (fn,where) => {
	return (req, res, next) => {
		fn(req, res, next).catch(err=>{
			err.where = where;
			next(err);
		});
	};
};

module.exports = {
	AppError,
	catchAsync
};
