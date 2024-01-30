const JsonAIGenerator = require("./JsonAIGenerator");

class BusinessLogicGenerator extends JsonAIGenerator {
    constructor(client){
        super(client);
    }

    createPrompt(){
        return `You have to look at the java file and figure out the entire code and business logic.
Full code: ${this.client.filteredOpenCode[0].code}

Then, you must properly implement the corresponding function or class contents in the '//implement business logic here:' section at the bottom of the code I cut and sent.
implement here: ${this.client.promptValue}

Example correct answer: '\nrepository().findById(orderPlaced.getProductId()).ifPresent(inventory -> {\n inventory.setStockRemain(inventory.getStockRemain() - orderPlaced.getQuantity());\n repository(). save(inventory);\n\n InventoryUpdated inventoryUpdated = new InventoryUpdated(inventory);\n inventoryUpdated.publishAfterCommit();\n});\n'

Don't provide natural language or code descriptions; only return code implemented within a function or class. Also, the implemented code content should not be enclosed in parentheses like "{ code }".
`
    }
    createModel(text){
        // return super.createModel(text)
        return text
    }


}


module.exports = BusinessLogicGenerator;