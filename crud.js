const {catchAsync,AppError} = require('./error');


module.exports = {
    // ******************************* CRUD general *******************************
    create: (resourceModel,data,middleware)=>{
        return catchAsync(async (req,res,next)=>{
            let resource = (await resourceModel.create(data(req))).toObject();
            // for soft remove
            if(resource.deleted)
                delete resource.deleted;
            if(middleware){
                req.resource = resource;
                return next();
            }
            res.status(200).json(resource);
        },'crud => create');
    },
    get: (resourceModel, type, _filter, middleware)=> {
        return catchAsync(async (req,res,next)=>{
            let count = 0;
            let sortObject = {};
            let projection = {};
            let result = {};
            let {display,expand,limit,sort,start,filter} = req.query;
            // 1. support projection in order to get the desired fields
            if (display){
                let elements = display.split(',');
                elements.forEach(element=>{
                    projection[element] = 1;
                })
            }

            let resource = projection?  resourceModel[type](_filter(req),projection):
                resourceModel[type](_filter(req));

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
                // 4. support start parameter
                if (start) {
                    resource.skip(parseInt(start));
                }
                // 6. support filter
                if (filter) {
                    let elements = filter.split(',');
                    elements.forEach(element=>{
                        let attribute = element.split(':')[0];
                        let value = element.split(':')[1];
                        resource.where(attribute).equals(value);
                    })
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
            result = await resource;

            if(type ==='findOne' && !result)
                return next(new AppError(404,'resource not found'));

            if(middleware){
                req.resource = result;
                return next();
            }
            res.status(200).json(result);
        },'crud => get');
    },
    get: (resourceModel, type, _filter, middleware)=> {
        return catchAsync(async (req,res,next)=>{
            let count = 0;
            let sortObject = {};
            let projection = {};
            let result = {};
            let {display,expand,limit,sort,start,filter} = req.query;
            // 1. support projection in order to get the desired fields
            if (display){
                let elements = display.split(',');
                elements.forEach(element=>{
                    projection[element] = 1;
                })
            }

            let resource = projection?  resourceModel[type](_filter(req),projection):
                resourceModel[type](_filter(req));

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
                // 4. support start parameter
                if (start) {
                    resource.skip(parseInt(start));
                }
                // 6. support filter
                if (filter) {
                    let elements = filter.split(',');
                    elements.forEach(element=>{
                        let attribute = element.split(':')[0];
                        let value = element.split(':')[1];
                        resource.where(attribute).equals(value);
                    })
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
            result = await resource;

            if(type ==='findOne' && !result)
                return next(new AppError(404,'resource not found'));

            if(middleware){
                req.resource = result;
                return next();
            }
            res.status(200).json(result);
        },'crud => get');
    },
    update: (resourceModel,type, filter, data, middleware)=>{
        return catchAsync(async (req,res,next)=>{
            const resource = await resourceModel[type](
                filter(req),data(req));
            if(!resource)
                return next(new AppError(404,'resource not found'));
            if(middleware){
                req.resource = resource;
                return next();
            }
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
            if(middleware){
                req.resource = resource;
                return next();
            }
            res.status(200).json(resource);
        },'crud => delete');
    },



}
