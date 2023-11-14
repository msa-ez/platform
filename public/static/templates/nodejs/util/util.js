function objectmapping(source, target){
    keys = Object.keys(source);
    values = Object.values(source);

    for(const key in source){
        if(key in target){
            target[key] = source[key];
        }
    }

    return target;
}

module.exports = objectmapping;