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
            let count = 0;
            let sortObject = {};
            let projection = {};
            let result = {};
            let {display,expand,limit,sort,page} = req.query;
            // 1. support projection in order to get the desired fields
            if (display){
                let elements = display.split(',');
                elements.forEach(element=>{
                    projection[element] = 1;
                })
            }

            let resource = projection?  resourceModel[type](filter(req),projection):
                resourceModel[type](filter(req));

            if(type === 'find') {

                // 2. support sort parameter
                if (sort) {
                    let elements = sort.split(',');
                    elements.forEach(element => {
                        sortObject[element] = 1;
                    })
                    resource.sort(sortObject);
                }
                // 3. support limit parameter
                if (limit) {
                    resource.limit(parseInt(limit));
                }
                // 4. support pagination
                if (page) {
                    resource.skip((parseInt(page) - 1) * parseInt(limit));
                    let c = await resourceModel.countDocuments(filter(req));
                    count = parseInt(c) % parseInt(limit) === 0 ? Math.trunc(parseInt(c)/parseInt(limit)) : Math.trunc(parseInt(c)/parseInt(limit))+1;
                }
            }

            // 5. support populate in order to get all the data
            if(expand){
                let elements = expand.split(',');
                elements.forEach(element=>{
                    resource.populate({path:element,match:{'deleted._state':false}})
                })
            }
            // final result
            if(type === 'find' && page)
                result = {resource:await resource,count: count};
            else
                result = await resource;

            if(type ==='findOne' && !resource)
                return next(new AppError(404,'resource not found'));

            if(middleware)
                return next();
            res.status(200).json(result);
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
