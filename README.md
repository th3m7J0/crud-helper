# crud-helper
This is a CRUD Helper module for expressjs apps used with `mongoose`
in order to simplify the common operations

## Installation 

`$ npm install crud-helper --save`

## Examples
```
const express = require('express');
const router = express.Router();
const crudHelper = require('crud-helper');
const pandaModel = require('../models/panda');


router.route('/pandas')
    // add panda using panda model
    .post(
            crudHelper.create(pandaModel,(req)=>{
                const {name,skill} = req.body;
                return {name:name,skill:skill};
        })
    )
    // get all pandas
    .get(
            crudHelper.getByMany(pandaModel)
    )

router.route('/:id')
    // get panda by id
    .get(
            crudHelper.getById(pandaModel)
    )
    // put panda by id
    .put(
            crudHelper.updateById(pandaModel,(req)=>{
                const {name,skill} = req.body;
                return {name:name,skill:skill};
            })
    )
    //delete panda by id
    .delete(
            crudHelper.deleteById(pandaModel)
    )


module.exports = router;
```


## Usage
This module supports several **crud functions** as follows :
1. CRUD general :

- create(resourceModel,data[,middleware])
- get(resourceModel,filter[,projection,middleware])
- update(resourceModel,filter,data[,middleware])
- delete(resourceModel,filter[,middleware])

2. CRUD ById :

- getById(resourceModel[,projection,middleware])
- updateById(resourceModel,data[,middleware])
- deleteById(resourceModel[,middleware])

3. CRUD ByMany : 

- getByMany(resourceModel[,projection,middleware])


### params description

- resourceModel : mongoose schema object
- data : callback function with `req` parameter that return the data for CREATE or UPDATE operations 
```
(req)=>{
    // ...
    return data;
} 
```
- filter : filter object just like mongoose, (eg. {name:'th3m7j0'} filter by name)  
- projection : projection object just like mongoose , (eg. {name:1,_id:0} show only the name attribut) [optional]
- middlware : boolean (true,false) if middlware is true then the **crud function** will act as a middleware [optional]

## Project example 

check this example api : [panda api](https://github.com/th3m7J0/express-panda-api)