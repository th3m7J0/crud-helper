const {catchAsync,AppError} = require('./error');
const bodyValidation = require('./validations/bodyValidation');
const filterValidation = require('./validations/filterValidation');

const doExpand = async (expand,resource)=>{
    if(expand){
        let elements = expand.split(',');
        for (let i = 0; i < elements.length; i++) {
            let components = elements[i].split('..');

            if(components.length > 3){
                return next(new AppError(409,'max 3 nested docs'));
            }
            let populateObject = {};
            for (let i = 0; i < components.length; i++) {
                let obj = {};
                obj['path'] = components[i];
                obj['match'] =  {'deleted._state':false};
                switch (i){
                case 0: populateObject = obj;
                    break;
                case 1: populateObject['populate'] = obj;
                    break;
                case 2: populateObject['populate']['populate'] = obj;
                    break;
                }
            }
            await resource.populate(populateObject).execPopulate();
        }
    }
};

const doExpandGet = (expand,resource)=>{
    if(expand){
        let elements = expand.split(';')[0].split(',');
        for (let i = 0; i < elements.length; i++) {
            let components = elements[i].split('..');

            if(components.length > 3){
                return next(new AppError(409,'max 3 nested docs'));
            }
            let populateObject = {};
            for (let i = 0; i < components.length; i++) {
                let obj = {};
                obj['path'] = components[i];
                obj['match'] =  {'deleted._state':false};
                switch (i){
                case 0: populateObject = obj;
                    break;
                case 1: populateObject['populate'] = obj;
                    break;
                case 2: populateObject['populate']['populate'] = obj;
                    break;
                }
            }
            resource.populate(populateObject);
        }
    }
};

module.exports = {
    // ******************************* CRUD general *******************************
    
    create: (resourceModel,data,middleware)=>{
        return catchAsync(async (req,res,next)=>{

            let {expand} = req.query;

            // input validation
            let myBody = await bodyValidation(resourceModel,data(req),next);
            if(!myBody)
                return;

            let resource = await resourceModel.create(myBody);

            // support populate in order to get all the data
            await doExpand(expand,resource);

            // make it editable
            resource = resource.toObject();

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
            let nbPages = 0;
            let _count = 0;
            let sortObject = {};
            let projection = {};
            let result = {};
            let {display,expand,limit,sort,start,filter,page,count,search} = req.query;

            // support projection in order to get the desired fields
            if (display){
                let elements = display.split(',');
                elements.forEach(element=>{
                    projection[element] = 1;
                })
            }

            // filters from controller
            let myFilter = _filter(req);


            // support search parameter
            if(search && type === 'find'){
                myFilter['$text']= {$search: search,$diacriticSensitive:true,$language: 'none'};
            }

            let resource = projection?  resourceModel[type](myFilter,projection):
                resourceModel[type](myFilter);

            if(type === 'find') {

                // support sort parameter
                if (sort) {
                    let elements = sort.split(',');
                    elements.forEach(element => {
                        sortObject[element] = 1;
                    })
                    resource.sort(sortObject);
                }

                // support limit parameter
                if (limit) {
                    resource.limit(parseInt(limit));
                }

                // support start parameter
                if (start) {
                    resource.skip(parseInt(start));
                }


                // support filter
                if (filter) {
                    let elemDelimiter = ',';
                    let elements = filter.split(elemDelimiter);
                    // allowed operations
                    let operations = ['equals','gt','lt','gte','lte','regex','ne','or'];
                    let orElements = [];
                    elements.forEach(element=>{
                        let opDelimiter = '__';
                        let valueDelimiter = '::';

                        let attributeWithOp = element.split(valueDelimiter)[0];

                        let attribute = attributeWithOp.split(opDelimiter)[0];
                        let operation = operations.includes(attributeWithOp.split(opDelimiter)[1])?attributeWithOp.split(opDelimiter)[1]:'equals';
                        let value = element.split(valueDelimiter)[1];

                        // add or elements
                        if(operation === 'or'){
                             orElements.push({[attribute]:value});
                        } else
                            resource.where(attribute)[operation](value);
                    });
                    if(orElements.length>0){
                        resource.where({'$or':orElements});
                    }
                }

                // support pagination, give it number of page and how much docs to limit
                if (page) {
                    if(page<1)
                        return next(new AppError(409,'page is out of range'));
                    resource.skip((parseInt(page) - 1) * parseInt(limit));
                    let c = await resourceModel.countDocuments(myFilter);
                    nbPages = parseInt(c) % parseInt(limit) === 0 ? Math.trunc(parseInt(c)/parseInt(limit)) : Math.trunc(parseInt(c)/parseInt(limit))+1;
                }
            }

            // support populate in order to get all the data
            doExpandGet(expand,resource);


            resource = await  resource;

            // filter in expand attributes with only one attribute and equal operation

            // get the filter for populated attributes with ; delimiter
            if(expand){
                let matches = expand.split(';').length>1 ? expand.split(';')[1]:'';
                if(matches.length>0){
                    let elemDelimiter = ',';
                    let elements = matches.split(elemDelimiter);

                    elements.forEach(element=>{
                        let valueDelimiter = '::';
                        let attribute = element.split(valueDelimiter)[0];
                        let expanded = attribute.split('.')[0];
                        let attributeOfexpanded = attribute.split('.')[1];
                        let value = element.split(valueDelimiter)[1];
                        resource = resource.filter(res=> res[expanded][attributeOfexpanded].toString() === value);
                    });
                }
            }


            // final result
            if(type === 'find' && page)
                result = {resource: resource,nbPages: nbPages};
             // support count parameter
            else if (count === '1')
                result = resource.length;
            else
                result = resource;

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
            let {expand} = req.query;

            // body input validation
            let myBody = await bodyValidation(resourceModel,data(req),next);
            if(!myBody)
                return;
            // filters from controller
            let myFilter = filter(req);

            let resource = await resourceModel[type](
                myFilter,myBody);
            if(!resource)
                return next(new AppError(404,'resource not found'));

            // support populate in order to get all the data
            await doExpand(expand,resource);

            if(middleware){
                req.resource = resource;
                return next();
            }
            res.status(200).json(resource);
        },'crud => update');
    },
    delete:(resourceModel, type, filter, middleware)=>{
        return catchAsync(async (req,res,next)=>{
            // filters from controller
            let myFilter = filter(req);

            const resource =  await resourceModel[type](
                myFilter,
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
