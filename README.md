# crud-helper
This is a CRUD Helper module for expressjs apps used with [mongoose](https://www.npmjs.com/package/mongoose) and [Joi](https://www.npmjs.com/package/joi)
in order to simplify the common operations


## Installation 

`$ npm install crud-helper --save`

## requirements
- This module supports `mongoDB` database only for now.
- This module supports soft remove only for now.
- You need to add this snippet of code after schema definition for (search and soft remove): 
```
// index all string attributes for search
mySchema.index({'$**': 'text'});

//*********  for soft remove ********* 
mySchema.pre('aggregate', function () {
    if(this._pipeline[0]['$match'].deleted === undefined)
        this._pipeline[0]['$match'].deleted = {_state: false};
});

mySchema.pre('countDocuments', function () {
    if(this._conditions.deleted === undefined)
        this.where({deleted: {_state: false}});
});

mySchema.pre('find', function () {
    if(this._conditions.deleted === undefined)
        this.where({deleted: {_state: false}});
});

mySchema.pre('findOne', function () {
    if(this._conditions.deleted === undefined)
        this.where({deleted: {_state: false}});
});

mySchema.pre('findOneAndUpdate', function () {
    if(this._conditions.deleted === undefined)
        this.where({deleted: {_state: false}});
    this.options.new = true;
    this.options.runValidators = true;

});
// ********************************
```
for more details check the [panda api](https://github.com/th3m7J0/express-panda-api) example.

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
2. supports `expand` parameter in order to get all the data, the expansion of nested fields is done using `..` (eg. `user..photo` this will expand the user and his photo)
3. supports `sort` parameter
4. supports `limit` parameter
5. supports `start` parameter
6. supports `filter` parameter
    - supports several operations: `['equals','gt','lt','gte','lte','regex','ne','or']`
    - the delimiter between the attribute and the operation is `__`
    - the delimiter between the attribute and the value is `::`
    - usage:  `filter=attribute__operation::value` by default `operation=equals`
7. supports `page` (the number of the page) parameter used with `limit`
8. supports `search` parameter, works with mongoDB text index search.
9. supports `count` parameter

(eg. `/SomeEndpoint?display=attr1,attr2&expand=attr3,attr4&sort=attr5&limit=5&start=1&filter=attr::val`)
(eg. `/SomeEndpoint?count=1`)
(eg. `/SomeEndpoint?count=1&filter=attr::val`)
(eg. `/SomeEndpoint?search=val`)

## Input Validation

- crud-helper >= 4.0.0 supports input validation with the help of [Joi](https://www.npmjs.com/package/joi).
the validation of fields [data(req)/ filter(req)] will be done automatically using the types of mongoose schema.

## Project example 

check this example api : [panda api](https://github.com/th3m7J0/express-panda-api)
