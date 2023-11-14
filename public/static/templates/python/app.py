forEach: BoundedContext
fileName: app.py
path: {{name}}
---
from flask import Flask
import KafkaProcessor
from config import config_reader
{{#aggregates}}
import {{namePascalCase}}Controller
{{/aggregates}}

config = config_reader.reader()

app = Flask(__name__)

sh = KafkaProcessor.streamhandler

{{#aggregates}}
app.register_blueprint({{namePascalCase}}Controller.bp)
{{/aggregates}}
if __name__ == "__main__":
	sh.consumer.run()
	app.run(debug=True, port=int(config['port']))


<function>
window.$HandleBars.registerHelper('checkDateType', function (fieldDescriptors) {
    for(var i = 0; i < fieldDescriptors.length; i ++ ){
        if(fieldDescriptors[i] && fieldDescriptors[i].className == 'Date'){
        return "import java.util.Date; \n"
        }
    }
});

</function>