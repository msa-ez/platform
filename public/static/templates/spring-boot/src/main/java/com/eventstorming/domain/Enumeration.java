forEach: Enumeration
fileName: {{pascalCase name}}.java
path: {{boundedContext.name}}/{{{options.packagePath}}}/domain
mergeType: template
---
package {{options.package}}.domain;

import javax.persistence.*;
import org.springframework.beans.BeanUtils;
import java.util.List;
import lombok.Data;
import java.util.Date;


public enum {{pascalCase name}} {

    {{#items}}
    {{#setItems value ../items ../useKeyValue}}{{/setItems}}
    {{/items}}
}

<function>

window.$HandleBars.registerHelper('setItems', function (value, items, hasKey) {
    try {
        var text = '';
        for(var i = 0; i < items.length; i ++ ){
            if(items[i]) {
                if(items[i].value == value) {
                    if (hasKey) {
                        text = `${items[i].key}("${value}")`;
                    } else {
                        text = value
                    }
                    if(i === items.length-1) {
                        text += ';'
                    } else {
                        text += ','
                    }
                }
            }
        }
        return text
        
    } catch (e) {
        console.log(e)
    }
});

</function>