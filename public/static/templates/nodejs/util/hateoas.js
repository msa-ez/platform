var hal = require('hal');

hateoas = {}

function hal_get_id(entity, req, name){
    url = req.headers.host+req.originalUrl
    
    delete entity['id'];
    var response = new hal.Resource(entity, url);
    
    response.link(name, url);

    return response;
}

function hal_post(entity, req, name){
    url = req.headers.host+req.originalUrl+'/'+entity['id']
    
    delete entity['id'];
    var response = new hal.Resource(entity, url);
    response.link(name, url);

    return response;
}

function hal_get_list(entity_list, req, name){
    var hal_list = [];
    var collection = new hal.Resource();
    for(var i = 0 ; i < entity_list.length ; i++){
        id = entity_list[i]['id'];
        delete entity_list[i]['id'];

        url = req.headers.host + req.originalUrl +'/'+id;
        var entity = new hal.Resource(entity_list[i], url);
        entity.link(name, url);

        hal_list.push(entity);
    }
    var embedname = req.baseUrl.split('/');

    collection.embed(embedname[1],hal_list);
    
    var baseUrl = req.headers.host
    var profileUrl = baseUrl + '/profile' + req.baseUrl
    var linkUrl = baseUrl +req.baseUrl+'{?page,size,sort}'
    
    collection.link('profile', profileUrl);
    collection.link('self', linkUrl);
    
    var totalelement = entity_list.length;
    var size = 20;
    var number = parseInt(totalelement/size);
    var pagenumber = number + 1;

    collection.page = {
        'number' : number,
        'size' : size,
        'totalElement' : totalelement,
        'totalPages' : pagenumber
    }
    

    return collection;
}

hateoas.hal_get_id = hal_get_id;
hateoas.hal_post = hal_post;
hateoas.hal_get_list = hal_get_list;
module.exports = hateoas;