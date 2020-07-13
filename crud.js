const {catchAsync,AppError} = require('./error');


module.exports = {
    // ******************************* CRUD general *******************************
    create: (resourceModel,data,middleware)=>{
        return catchAsync(async (req,res,next)=>{
            const resource = await resourceModel.create(data(req));
            if(middleware)
                return next();
            res.status(200).json(resource);
        },'crud => create');
    },
    get: (resourceModel, type, filter, middleware)=> {
        return catchAsync(async (req,res,next)=>{
            let projection = {};
            let {display,expand} = req.query;
            // 1. support projection in order to get the desired fields
            if (display){
                let elements = display.split(',');
                elements.forEach(element=>{
                    projection[element] = 1;
                })
            }

            let resource = projection?  resourceModel[type](filter(req),projection):
                resourceModel[type](filter(req));
            // 2. support populate in order to get all the data
            if(expand){
                let elements = expand.split(',');
                elements.forEach(element=>{
                    resource.populate({path:element,match:{'deleted._state':false}})
                })
            }
            // final result
            resource = await resource;

            if(type ==='findOne' && !resource)
                return next(new AppError(404,'resource not found'));

            if(middleware)
                return next();
            res.status(200).json(resource);
        },'crud => get');
    },
    update: (resourceModel,type, filter, data, middleware)=>{
        return catchAsync(async (req,res,next)=>{
            const resource = await resourceModel[type](
                filter(req),data(req));
            if(!resource)
                return next(new AppError(404,'resource not found'));
            if(middleware)
                return next();
            res.status(200).json(resource);
        },'crud => update');
    },
    delete:(resourceModel, type, filter, middleware)=>{
        return catchAsync(async (req,res,next)=>{
            const resource =  await resourceModel[type](
                filter(req),
                {'deleted._state':true,'deleted._at':Date.now()},
            );
            if(!resource)
                return next(new AppError(404,'resource not found'));
            if(middleware)
                return next();
            res.status(200).json(resource);
        },'crud => delete');
    },



}
