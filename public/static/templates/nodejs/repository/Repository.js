forEach: Aggregate
fileName: {{namePascalCase}}Repository.js
path: {{boundedContext.name}}/repository
---
const db = require('../models')

async function save(body){
    return await db.{{namePascalCase}}.create(body,{
        returning: true
    })
}

async function findall(){
    var results = await db.{{namePascalCase}}.findAll({raw:true})
    console.log('results',results);
    return results
}

async function find_by_id(id){
    var results = await db.{{namePascalCase}}.findOne({
        where:{
            id: id 
        },
        raw:true,
    })
    
    return results
}

async function update(id, body){
    var results = await db.{{namePascalCase}}.update(body,{
        where:{
            id: id,
        },
        raw:true,
        returning:true,
    })
    if (results){
        var result = await find_by_id(id)
        return result
    }
}

async function destroy(id){
    var result = await db.{{namePascalCase}}.destroy({
        where:{
            id : id,
        }
    })
    console.log('result', result)
    return result
}

exports.save = save
exports.read = findall
exports.read_by_id = find_by_id
exports.update = update
exports.delete = destroy
