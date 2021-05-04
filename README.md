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
           crudHelper.get(pandaModel,'find',(req)=>{
                   return {};
           })
    )

router.route('/:id')
    // get panda by id
    .get(
            crudHelper.get(pandaModel,'findOne',(req)=>{
                    return {_id: req.params.id};
            })
    )
    // put panda by id
    .put(
            crudHelper.update(pandaModel,'findOneAndUpdate',(req)=>{
                    return {_id: req.params.id};
                },(req)=>{
                    const {name,skill} = req.body;
                    const myBody = {name:name,skill:skill};
                    return extra.flexible(myBody);
            })
    )
    //delete panda by id
    .delete(
            crudHelper.delete(pandaModel,'findOneAndDelete',(req)=>{
                return {_id: req.params.id};
            })
    )


module.exports = router;
```


## Usage

- create(resourceModel, data[,middleware])
- get(resourceModel, type, filter[,projection,middleware])
- update(resourceModel,type, filter, data[,middleware])
- delete(resourceModel, type, filter[,middleware])


### params description

- resourceModel : mongoose schema object
- type : type of query (eg. find, findOne, findOneAndUpdate)
- data : callback function with `req` parameter which return the data for CREATE or UPDATE operations 
```
(req)=>{
    // ...
    return data;
} 
```
- filter : callback function with `req` parameter which return filter object just like mongoose, (eg. {name:'th3m7j0'} filter by name)  
```
(req)=>{
    // ...
    return {name:'th3m7j0'};
} 
```
- middleware : boolean (true,false) if middleware is true then the **crud function** will act as a middleware [optional]

### Params GET
1. supports `display` parameter in order to get the desired fields
2. supports `expand` parameter in order to get all the data
3. supports `sort` parameter
4. supports `limit` parameter
5. supports `start` parameter
6. supports `filter` parameter
(eg. `/SomeEndpoint?display=attr1,attr2&expand=attr3,attr4&sort=attr5&limit=5&start=1&filter=attr:val`)

## Project example 

check this example api : [panda api](https://github.com/th3m7J0/express-panda-api)
