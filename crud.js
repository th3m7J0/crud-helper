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
    get: (resourceModel,filter,projection,middleware)=>{
        return catchAsync(async (req,res,next)=>{
            const resource = projection? await resourceModel.findOne(filter,projection):
                await resourceModel.findOne(filter);
            if(!resource)
                return next(new AppError(404,'resource not found'));
            if(middleware)
                return next();
            res.status(200).json(resource);
        },'crud => get');
    },
    update: (resourceModel,filter,data,middleware)=>{
        return catchAsync(async (req,res,next)=>{
            const resource = await resourceModel.findOneAndUpdate(
                filter,data(req));
            if(!resource)
                return next(new AppError(404,'resource not found'));
            if(middleware)
                return next();
            res.status(200).json(resource);
        },'crud => update');
    },
    delete:(resourceModel,filter,middleware)=>{
        return catchAsync(async (req,res,next)=>{
            const resource =  await resourceModel.findOneAndUpdate(
                filter,
                {'deleted._state':true,'deleted._at':Date.now()},
            );
            if(!resource)
                return next(new AppError(404,'resource not found'));
            if(middleware)
                return next();
            res.status(200).json(resource);
        },'crud => delete');
    },
    // ******************************* CRUD ById *******************************
    getById: (resourceModel,projection,middleware)=>{
        return catchAsync(async (req,res,next)=>{
            const resource = projection? await resourceModel.findOne({_id: req.params.id},projection):
                                         await resourceModel.findOne({_id: req.params.id});
            if(!resource)
                return next(new AppError(404,'resource not found'));
            if(middleware)
                return next();
            res.status(200).json(resource);
        },'crud => getById');
    },
    updateById:(resourceModel,data,middleware)=>{
        return catchAsync(async (req,res,next)=>{
            const resource = await resourceModel.findOneAndUpdate(
                {_id: req.params.id},data(req));
            if(!resource)
                return next(new AppError(404,'resource not found'));
            if(middleware)
                return next();
            res.status(200).json(resource);
        },'crud => update');
    },
    deleteById: (resourceModel,middleware)=>{
        return catchAsync(async (req,res,next)=>{
            const resource =  await resourceModel.findOneAndUpdate(
                {_id:req.params.id},
                {'deleted._state':true,'deleted._at':Date.now()},
            );
            if(!resource)
                return next(new AppError(404,'resource not found'));
            if(middleware)
                return next();
            res.status(200).json(resource);
        },'crud => deleteById');
    },
    // ******************************* CRUD ByIdCurrent *******************************
    getByIdCurrent: (resourceModel,projection,middleware)=>{
        return catchAsync(async (req,res,next)=>{
            const resource = projection? await resourceModel.findOne({_id: req.params.id,userId: req.user.userId},projection):
                await resourceModel.findOne({_id: req.params.id,userId: req.user.userId});
            if(!resource)
                return next(new AppError(404,'resource not found'));
            if(middleware)
                return next();
            res.status(200).json(resource);
        },'crud => getById');
    },
    updateByIdCurrent:(resourceModel,data,middleware)=>{
        return catchAsync(async (req,res,next)=>{
            const resource = await resourceModel.findOneAndUpdate(
                {_id: req.params.id,userId: req.user.userId},data(req));
            if(!resource)
                return next(new AppError(404,'resource not found'));
            if(middleware)
                return next();
            res.status(200).json(resource);
        },'crud => update');
    },
    deleteByIdCurrent: (resourceModel,middleware)=>{
        return catchAsync(async (req,res,next)=>{
            const resource =  await resourceModel.findOneAndUpdate(
                {_id:req.params.id,userId: req.user.userId},
                {'deleted._state':true,'deleted._at':Date.now()},
            );
            if(!resource)
                return next(new AppError(404,'resource not found'));
            if(middleware)
                return next();
            res.status(200).json(resource);
        },'crud => deleteById');
    },

    // ******************************* CRUD ByMany *******************************
    getByMany: (resourceModel,projection,middleware)=>{
        return catchAsync(async (req,res,next)=>{
            const resource = projection? await resourceModel.find({},projection):
                                         await resourceModel.find({});
            if(middleware)
                return next();
            res.status(200).json(resource);
        },'crud => getByMany');
    },
    // ******************************* CRUD ByManyCurrent *******************************
    getByManyCurrent: (resourceModel,projection,middleware)=>{
        return  catchAsync(async (req,res,next)=>{
            const resource = projection? await resourceModel.find({userId: req.user.userId},projection):
                                         await resourceModel.find({userId: req.user.userId});
            if(!resource)
                return next(new AppError(404,'resource not found'));
            if(middleware)
                return next();
            res.status(200).json(resource);
        },'crud => getCurrent');
    },
    // ******************************* CRUD ByCurrent *******************************
    getByCurrent: (resourceModel,projection,middleware)=>{
      return  catchAsync(async (req,res,next)=>{
          const resource = projection? await resourceModel.findOne({userId: req.user.userId},projection):
                                       await resourceModel.findOne({userId: req.user.userId});
          if(!resource)
              return next(new AppError(404,'resource not found'));
          if(middleware)
              return next();
          res.status(200).json(resource);
      },'crud => getCurrent');
    },
    updateByCurrent: (resourceModel,data,middleware)=>{
        return catchAsync(async (req,res,next)=>{
            const resource = await resourceModel.findOneAndUpdate(
                {userId: req.user.userId},data(req));
            if(!resource)
                return next(new AppError(404,'resource not found'));
            if(middleware)
                return next();
            res.status(200).json(resource);
        },'crud => updateCurrent');
    },

}
