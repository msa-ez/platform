const PptxGenJS = require("pptxgenjs");
const convert = require('convert-length');

const pptGen = PptxGenJS.default;
let pptx;
if (pptGen) {
    pptx = new pptGen();
} else {
    pptx = new PptxGenJS();
}

const types = {
    // EventStorming
    BoundedContext: {
        fill: "ffffff",
        stroke: "000000",
        transparency: 100,
    },
    Event: {
        fill: "f1a746",
        stroke: "f1a746",
        transparency: 0,
    },
    Aggregate: {
        fill: "f8d454",
        stroke: "f8d454",
        transparency: 50,
    },
    Command: {
        fill: "5099f7",
        stroke: "5099f7",
        transparency: 0,
    },
    Policy: {
        fill: "bb94bf",
        stroke: "bb94bf",
        transparency: 0,
    },
    View: {
        fill: "5fc08b",
        stroke: "5fc08b",
        transparency: 0,
    },
    Issue: {
        fill: "8e24aa",
        stroke: "8e24aa",
        transparency: 0,
    },
    External: {
        fill: "ed73b6",
        stroke: "ed73b6",
        transparency: 0,
    },
    Actor: {
        fill: "f8d454",
        stroke: "f8d454",
        transparency: 0,
    },

    // Business Model
    BusinessModelPerspective: {
        fill: "ffffff",
        stroke: "000000",
        transparency: 100,
    },
    ValueProposition: {
        fill: "ff4da5",
        stroke: "ff4da5",
        transparency: 0,
    },
    CustomerSegment: {
        fill: "a2d471",
        stroke: "a2d471",
        transparency: 0,
    },
    channel: {
        fill: "f17171",
        stroke: "f17171",
        transparency: 0,
    },
    CustomerRelationship: {
        fill: "ffd071",
        stroke: "ffd071",
        transparency: 0,
    },
    KeyActivity: {
        fill: "71e2d0",
        stroke: "71e2d0",
        transparency: 0,
    },
    KeyResource: {
        fill: "7ea9ff",
        stroke: "7ea9ff",
        transparency: 0,
    },
    KeyPartner: {
        fill: "71d0ff",
        stroke: "71d0ff",
        transparency: 0,
    },
    RevenueStream: {
        fill: "838dff",
        stroke: "838dff",
        transparency: 0,
    },
    CostStructure: {
        fill: "ffad71",
        stroke: "ffad71",
        transparency: 0,
    },

    // Customer Journey Map
    Persona: {
        fill: "f8d454",
        stroke: "f8d454",
        transparency: 0,
    },
    Phase: {
        fill: "535353",
        stroke: "535353",
        transparency: 0,
    },
    UserAction: {
        fill: "81e174",
        stroke: "81e174",
        transparency: 0,
    },
    TouchPoint: {
        fill: "45d8c1",
        stroke: "45d8c1",
        transparency: 0,
    },
    PainPoint: {
        fill: "93bffe",
        stroke: "93bffe",
        transparency: 0,
    },
    PossibleSolution: {
        fill: "817ffc",
        stroke: "817ffc",
        transparency: 0,
    },
    Emotion: {
        fill: "326ce5",
        stroke: "326ce5",
        transparency: 0,
    },
};

// Business Model Canvas
const perspectives = [
    {
        "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
        "name": "Key Partners",
        "perspective": "key-partner",
        "elementView": {
            "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
            "id": "e8f5cd23-616c-b911-5bcd-a5bd1243df24",
            "x": 300,
            "y": 400,
            "width": 300,
            "height": 600,
            "style": "{}"
        },
    }, {
        "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
        "name": "Key Activities",
        "perspective": "key-activity",
        "elementView": {
            "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
            "id": "d8deafd1-564b-19b7-1d0b-2ace2730f6cf",
            "x": 600,
            "y": 250,
            "width": 300,
            "height": 300,
            "style": "{}"
        },
    }, {
        "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
        "name": "Key Resources",
        "perspective": "key-resource",
        "elementView": {
            "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
            "id": "462bb51c-8efb-6657-3b04-6c754876be40",
            "x": 600,
            "y": 550,
            "width": 300,
            "height": 300,
            "style": "{}"
        },
    }, {
        "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
        "name": "Value Proposition",
        "perspective": "value-proposition",
        "elementView": {
            "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
            "id": "2fde0b06-3c34-d5c1-d43c-36a52718a205",
            "x": 900,
            "y": 400,
            "width": 300,
            "height": 600,
            "style": "{}"
        },
    }, {
        "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
        "name": "Customer Relationships",
        "perspective": "customer-relationship",
        "elementView": {
            "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
            "id": "ecdf7402-a80d-1474-ec23-9363a74698af",
            "x": 1200,
            "y": 250,
            "width": 300,
            "height": 300,
            "style": "{}"
        },
    }, {
        "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
        "name": "Channels",
        "perspective": "channel",
        "elementView": {
            "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
            "id": "d0183098-e987-3214-7f42-20dcf8a364c5",
            "x": 1200,
            "y": 550,
            "width": 300,
            "height": 300,
            "style": "{}"
        },
    }, {
        "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
        "name": "Customer Segments",
        "perspective": "customer-segment",
        "elementView": {
            "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
            "id": "84f0b913-207f-7229-cdb4-a536625138c2",
            "x": 1500,
            "y": 400,
            "width": 300,
            "height": 600,
            "style": "{}"
        },
    }, {
        "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
        "name": "Cost Structure",
        "perspective": "cost-structure",
        "elementView": {
            "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
            "id": "5b350418-d0aa-37de-7185-2ba8613bfa25",
            "x": 525,
            "y": 850,
            "width": 750,
            "height": 300,
            "style": "{}"
        },
    }, {
        "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
        "name": "Revenue Streams",
        "perspective": "revenue-stream",
        "elementView": {
            "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
            "id": "636ae7aa-186a-0a54-00cf-bf221578aab4",
            "x": 1275,
            "y": 850,
            "width": 750,
            "height": 300,
            "style": "{}"
        },
    }
];

class PowerPointGenerator {

    constructor(pptName) {
        this.pptName = pptName;
    }

    convertToShape(slide, modelData) {
        const me = this;

        if (modelData.value.hasOwnProperty("elements") && Object.values(modelData.value.elements).length > 0) {
            let elements = Object.values(modelData.value.elements);
            let list = [];

            if (modelData.canvasType === "bm") {
                elements = elements.concat(perspectives);
            }

            elements.forEach((item) => {
                if (item && item.elementView) {
                    if (item._type.includes("Text")) {
                        //
                    } else if (item._type.includes("Line")) {
                        //
                    }  else {
                        item.elementView.x = item.elementView.x - (item.elementView.width/2)
                        item.elementView.y = item.elementView.y - (item.elementView.height/2)
                        list = me.setShapeByType(item, list, modelData.canvasType);
                    }
                }
            });

            const borders = list.filter((shape) => shape.type === "border");
            const shapes = list.filter((shape) => shape.type !== "border");
            list = borders.concat(shapes);
            
            list.forEach((shape) => {
                slide.addText(shape.textList, shape);
            })
        }
        return slide;
    }

    /**
     * TODO: relations Line 그룹화
     */
    convertToArrow(slide, modelData) {
        if (modelData.value.hasOwnProperty("relations") && Object.values(modelData.value.relations).length > 0) {
            const relations = Object.values(modelData.value.relations);
            relations.forEach((item) => {
                if (item && item.relationView) {
                    const vertices = JSON.parse(item.relationView.value);
                    const midIdx = Math.floor((vertices.length + 1)/2);
                    const lastIdx = vertices.length - 1;
                    if (vertices.length > 0) {
                        vertices.forEach((val, idx) => {
                            if (idx > 0) {
                                const preVal = vertices[idx-1];
                                const shape = {
                                    shape: pptx.shapes.LINE,
                                    x: convert(preVal[0], "px", "in"),
                                    y: convert(preVal[1], "px", "in"),
                                    line: {
                                        width: 1,
                                    },
                                    fontSize: 10,
                                    align: "center",
                                    valign: "top",
                                };

                                if (preVal[0] >= val[0]) {
                                    shape.x = convert(val[0], "px", "in");
                                    shape.w = convert(preVal[0] - val[0], "px", "in");
                                } else {
                                    shape.w = convert(val[0] - preVal[0], "px", "in");
                                }
                                if (preVal[1] >= val[1]) {
                                    shape.y = convert(val[1], "px", "in");
                                    shape.h = convert(preVal[1] - val[1], "px", "in");
                                } else {
                                    shape.h = convert(val[1] - preVal[1], "px", "in");
                                }

                                if (idx === lastIdx && (
                                        preVal[0] < val[0] || preVal[1] < val[1]
                                )) {
                                    shape.line.beginArrowType = "none";
                                    shape.line.endArrowType = "triangle";
                                } else if (idx === lastIdx && (
                                        preVal[0] >= val[0] || preVal[1] >= val[1]
                                )) {
                                    shape.line.beginArrowType = "triangle";
                                    shape.line.endArrowType = "none";
                                }
                                
                                if (modelData.canvasType === "es") {
                                    if (item.sourceElement._type.endsWith('Event') && 
                                        item.targetElement._type.endsWith('Policy')
                                    ) {
                                        shape.line.dashType = "dash"
                                    } else if (item.sourceElement._type.endsWith('Policy') && 
                                        item.targetElement._type.endsWith('Event')
                                    ) {
                                        shape.line.dashType = "dash"
                                    } else if (item.sourceElement._type.endsWith('Event') && 
                                        item.targetElement._type.endsWith('Command')
                                    ) {
                                        shape.line.dashType = "solid"
                                    } else if ( (item.sourceElement._type.endsWith('Policy') || 
                                        item.sourceElement._type.endsWith('Command')) && 
                                        item.targetElement._type.endsWith('View')
                                    ) {
                                        shape.line.dashType = "solid"
                                    } else if (item.sourceElement._type.endsWith('Command') && 
                                        item.targetElement._type.endsWith('Event')
                                    ) {
                                        shape.line.dashType = "dash"
                                    } else if (item.sourceElement._type.endsWith('View') && 
                                        item.targetElement._type.endsWith('Aggregate')
                                    ) {
                                        shape.line.dashType = "solid"
                                    } else if (item.sourceElement._type.endsWith('Aggregate') && 
                                        item.targetElement._type.endsWith('Aggregate')
                                    ) {
                                        shape.line.dashType = "dash"
                                    } else if((item.sourceElement._type.endsWith('Command') || 
                                        item.sourceElement._type.endsWith('Policy')) && 
                                        item.targetElement._type.endsWith('Aggregate')
                                    ) {
                                        return
                                    }
                                }

                                if (idx === midIdx) {
                                    slide.addText(item.name, shape);
                                } else {
                                    slide.addShape(pptx.shapes.LINE, shape);
                                }
                                
                            }
                        })
                    }
                }
            });
        }

        return slide;
    }

    setShapeByType(object, list, canvasType) {
        const me = this;
        if (canvasType === "uml") {
            let shapes = me.generateUMLClassDiagram(object);
            list = list.concat(shapes);
        } else {
            let shape;
            if (canvasType === "es") {
                shape = me.generateEventStorming(object);
            } else if (canvasType === "bm") {
                shape = me.generateBusinessModel(object);
            } else if (canvasType === "cjm") {
                shape = me.generateCustomerJourneyMap(object);
            }
            list.push(shape)
        }
        return list;
    }

    // EventStorming Canvas
    generateEventStorming(object) {
        const me = this;
        let type;
        if (object._type.includes(".")) {
            type = object._type.split(".").pop();
        } else {
            type = object._type;
        }
        let shape = {
            type: "shape",
            textList: [],
            shape: pptx.shapes.RECTANGLE,
            x: convert(object.elementView.x, "px", "in"),
            y: convert(object.elementView.y, "px", "in"),
            w: convert(object.elementView.width, "px", "in"),
            h: convert(object.elementView.height, "px", "in"),
            fill: {
                color: types[type].fill,
                transparency: types[type].transparency,
            },
            line: {
                color: types[type].stroke
            },
            valign: "top",
            autoFit: true
        };

        if (type.includes("Event") || type.includes("View") || type.includes("Command")) {
            shape.textList = [
                {
                    text: `<< ${type} >>\n`,
                    options: {
                        fontSize: 9,
                        align: "center"
                    }
                },
                {
                    text: object.displayName ? object.displayName : object.name,
                    options: {
                        fontSize: 12,
                        align: "center",
                        bold: true,
                    }
                }
            ];
            
            if (object.fieldDescriptors && object.fieldDescriptors.length > 1) {
                const lastIdx = object.fieldDescriptors.length-1
                object.fieldDescriptors.forEach((attr, idx) => {
                    let text = `● ${attr.displayName ? attr.displayName : attr.name}`
                    if (idx < lastIdx) {
                        text += "\n"
                    }
                    shape.textList.push({
                        text: text,
                        options: {
                            fontSize: 8,
                            align: "left"
                        }
                    })
                })
            } else {
                shape.valign = "middle"
            }

        } else if (type.includes("Aggregate")) {
            shape.textList = [
                {
                    text: `<< ${type} >>\n`,
                    options: {
                        fontSize: 9,
                        align: "center"
                    }
                },
                {
                    text: object.displayName ? object.displayName : object.name,
                    options: {
                        fontSize: 12,
                        align: "center",
                        bold: true,
                    }
                }
            ];

            if (object.aggregateRoot && 
                object.aggregateRoot.fieldDescriptors && 
                object.aggregateRoot.fieldDescriptors.length > 1
            ) {
                const lastIdx = object.aggregateRoot.fieldDescriptors.length-1
                object.aggregateRoot.fieldDescriptors.forEach((attr, idx) => {
                    let text = `● ${attr.displayName ? attr.displayName : attr.name}`
                    if (idx < lastIdx) {
                        text += "\n"
                    }
                    shape.textList.push({
                        text: text,
                        options: {
                            fontSize: 8,
                            align: "left"
                        }
                    })
                })
            }

            if (object.aggregateRoot.entities &&
                object.aggregateRoot.entities.elements &&
                Object.values(object.aggregateRoot.entities.elements).length > 0
            ) {
                let slide = pptx.addSlide();
                let model = {
                    canvasType: "uml",
                    value: object.aggregateRoot.entities
                };
                slide = me.convertToShape(slide, model);
                slide = me.convertToArrow(slide, model);
            }

        } else if (type.includes("Actor")) {
            shape.textList = [
                {
                    text: object.displayName ? object.displayName : object.name,
                    options: {
                        fontSize: 10,
                        align: "center",
                    }
                }
            ];

        } else if (type.includes("BoundedContext")) {
            shape.type = "border";
            shape.textList = [
                {
                    text: object.displayName ? object.displayName : object.name,
                    options: {
                        fontSize: 10,
                        align: "center",
                        bold: true
                    }
                    
                }
            ];

        } else {
            shape.textList = [
                {
                    text: `<< ${type} >>\n`,
                    options: {
                        fontSize: 9,
                        align: "center"
                    }
                    
                },
                {
                    text: object.displayName ? object.displayName : object.name,
                    options: {
                        fontSize: 12,
                        align: "center",
                        bold: true
                    }
                    
                }
            ];
        }

        return shape;
    }

    // Business Model Canvas
    generateBusinessModel(object) {
        let type;
        if (object._type.includes(".")) {
            type = object._type.split(".").pop();
        } else {
            type = object._type;
        }
        let shape = {
            type: "shape",
            textList: [],
            shape: pptx.shapes.RECTANGLE,
            x: convert(object.elementView.x, "px", "in"),
            y: convert(object.elementView.y, "px", "in"),
            w: convert(object.elementView.width, "px", "in"),
            h: convert(object.elementView.height, "px", "in"),
            fill: {
                color: types[type].fill,
                transparency: types[type].transparency,
            },
            line: {
                color: types[type].stroke
            },
            valign: "top",
            autoFit: true
        };

        if (type.includes("BusinessModelPerspective")) {
            shape.type = "border";
            shape.textList = [
                {
                    text: object.displayName ? object.displayName : object.name,
                    options: {
                        fontSize: 12,
                        align: "center",
                        bold: true
                    }
                    
                }
            ];

        } else {
            shape.textList = [
                {
                    text: `<< ${type} >>\n`,
                    options: {
                        fontSize: 9,
                        align: "center"
                    }
                    
                },
                {
                    text: object.displayName ? object.displayName : object.name,
                    options: {
                        fontSize: 12,
                        align: "center",
                        bold: true
                    }
                    
                }
            ];
        }
        
        return shape;
    }

    // CustomerJourneyMap
    generateCustomerJourneyMap(object) {
        let type = object._type;
        if (object._type.includes("Emotion")) {
            type = "Emotion";
        }
        let shape = {
            type: "shape",
            textList: [],
            shape: pptx.shapes.RECTANGLE,
            x: convert(object.elementView.x, "px", "in"),
            y: convert(object.elementView.y, "px", "in"),
            w: convert(object.elementView.width, "px", "in"),
            h: convert(object.elementView.height, "px", "in"),
            fill: {
                color: types[type].fill,
                transparency: types[type].transparency,
            },
            line: {
                color: types[type].stroke
            },
            valign: "top",
            autoFit: true
        };

        if (type.includes("Persona")) {
            shape.shape = pptx.shapes.ROUNDED_RECTANGLE;
            shape.rectRadius = 1;
            shape.textList = [
                {
                    text: object.displayName ? object.displayName : object.name,
                    options: {
                        fontSize: 12,
                        align: "center",
                        bold: true,
                        valign: "middle"
                    }
                    
                }
            ];

        } else if (type.includes("Phase")) {
            // shape.shape = pptx.shapes.CUSTOM_GEOMETRY;
            shape.textList = [
                {
                    text: `<< ${type} >>\n`,
                    options: {
                        fontSize: 9,
                        align: "center"
                    }
                    
                },
                {
                    text: object.displayName ? object.displayName : object.name,
                    options: {
                        fontSize: 12,
                        align: "center",
                        bold: true,
                        color: "ffffff"
                    }
                    
                }
            ];

        } else if (type.includes("Emotion")) {
            shape.shape = pptx.shapes.CIRCLE;
        } else {
            shape.shape = pptx.shapes.ROUNDED_RECTANGLE;
            shape.rectRadius = 1;
            shape.textList = [
                {
                    text: `<< ${type} >>\n`,
                    options: {
                        fontSize: 9,
                        align: "center"
                    }
                    
                },
                {
                    text: object.displayName ? object.displayName : object.name,
                    options: {
                        fontSize: 12,
                        align: "center",
                        bold: true
                    }
                    
                }
            ];
        }

        return shape;
    }

    // UML Class Diagram
    generateUMLClassDiagram(object) {
        let shapes = [];

        // Entity Class
        if (object._type.endsWith("Class")) {
            let titleShape = {
                type: "shape",
                textList: [],
                shape: pptx.shapes.RECTANGLE,
                x: convert(object.elementView.x, "px", "in"),
                y: convert(object.elementView.y, "px", "in"),
                w: convert(object.elementView.width, "px", "in"),
                h: convert(object.elementView.titleH, "px", "in"),
                fill: {
                    color: "ffa400",
                    transparency: 0,
                },
                line: {
                    color: "ffa400"
                },
                valign: "top",
                autoFit: true
            };
            if (object.isAggregateRoot) {
                titleShape.textList.push({
                    text: "<< AggregateRoot >>\n",
                    options: {
                        fontSize: 9,
                        align: "center"
                    }
                })
            } else if (object.isValueObject || object._type.includes("vo")) {
                titleShape.textList.push({
                    text: "<< ValueObject >>\n",
                    options: {
                        fontSize: 9,
                        align: "center"
                    }
                })
            } else if (object.isInterface) {
                titleShape.textList.push({
                    text: "<< Interface >>\n",
                    options: {
                        fontSize: 9,
                        align: "center"
                    }
                })
            }
            titleShape.textList.push({
                text: object.displayName ? object.displayName : object.name,
                options: {
                    fontSize: 12,
                    align: "center",
                    bold: true
                }
            });

            let fieldShape = {
                type: "shape",
                textList: [],
                shape: pptx.shapes.RECTANGLE,
                x: convert(object.elementView.x, "px", "in"),
                y: convert(object.elementView.y+object.elementView.titleH, "px", "in"),
                w: convert(object.elementView.width, "px", "in"),
                h: convert(object.elementView.fieldH, "px", "in"),
                fill: {
                    color: "050038",
                    transparency: 0,
                },
                line: {
                    color: "050038"
                },
                valign: "top",
                autoFit: true
            };
            if (object.fieldDescriptors && object.fieldDescriptors.length > 0) {
                const lastIdx = object.fieldDescriptors.length-1
                object.fieldDescriptors.forEach((attr, idx) => {
                    let text = attr.label ? 
                        attr.label : `- ${attr.displayName ? attr.displayName : attr.name}: ${attr.className}`
                    if (idx < lastIdx) {
                        text += "\n"
                    }
                    fieldShape.textList.push({
                        text: text,
                        options: {
                            fontSize: 8,
                            align: "left",
                            color: "fafafa"
                        }
                    })
                })
            }

            let operationShape = {
                type: "shape",
                textList: [],
                shape: pptx.shapes.RECTANGLE,
                x: convert(object.elementView.x, "px", "in"),
                y: convert(object.elementView.y+object.elementView.subEdgeH, "px", "in"),
                w: convert(object.elementView.width, "px", "in"),
                h: convert(object.elementView.methodH, "px", "in"),
                fill: {
                    color: "7cafc4",
                    transparency: 0,
                },
                line: {
                    color: "7cafc4"
                },
                valign: "top",
                autoFit: true
            };
            if (object.operations && object.operations.length > 0) {
                const lastIdx = object.fieldDescriptors.length-1
                object.operations.forEach((attr, idx) => {
                    let text = attr.label ? attr.label : `+ ${attr.name}(): ${attr.returnType}`
                    if (idx < lastIdx) {
                        text += "\n"
                    }
                    operationShape.textList.push({
                        text: text,
                        options: {
                            fontSize: 8,
                            align: "left",
                            color: "fafafa"
                        }
                    })
                })                
            }

            shapes = [titleShape, fieldShape, operationShape];

        } else if (object._type.includes("enum")) { // Enumeration Class
            let titleShape = {
                type: "shape",
                textList: [
                    {
                        text: "<< Enumeration >>\n",
                        options: {
                            fontSize: 9,
                            align: "center"
                        }
                    }
                ],
                shape: pptx.shapes.RECTANGLE,
                x: convert(object.elementView.x, "px", "in"),
                y: convert(object.elementView.y, "px", "in"),
                w: convert(object.elementView.width, "px", "in"),
                h: convert(object.elementView.titleH, "px", "in"),
                fill: {
                    color: "ffa400",
                    transparency: 0,
                },
                line: {
                    color: "ffa400"
                },
                valign: "top",
                autoFit: true
            };
            titleShape.textList.push({
                text: object.displayName ? object.displayName : object.name,
                options: {
                    fontSize: 12,
                    align: "center",
                    bold: true
                }
            });

            let itemShape = {
                type: "shape",
                textList: [],
                shape: pptx.shapes.RECTANGLE,
                x: convert(object.elementView.x, "px", "in"),
                y: convert(object.elementView.y+object.elementView.titleH, "px", "in"),
                w: convert(object.elementView.width, "px", "in"),
                h: convert(object.elementView.itemH, "px", "in"),
                fill: {
                    color: "050038",
                    transparency: 0,
                },
                line: {
                    color: "050038"
                },
                valign: "top",
                autoFit: true
            };
            if (object.items && object.items.length > 0) {
                const lastIdx = object.items.length-1
                object.items.forEach((item, idx) => {
                    let text = item.label ? item.label : item.value
                    if (idx < lastIdx) {
                        text += "\n"
                    }
                    itemShape.textList.push({
                        text: text,
                        options: {
                            fontSize: 8,
                            align: "left",
                            color: "fafafa"
                        }
                    })
                })
            }

            shapes = [titleShape, itemShape];

        } else if (object._type.includes("Exception")) { // Exception Class
            let titleShape = {
                type: "shape",
                textList: [
                    {
                        text: "<< Exception >>\n",
                        options: {
                            fontSize: 9,
                            align: "center"
                        }
                    }
                ],
                shape: pptx.shapes.RECTANGLE,
                x: convert(object.elementView.x, "px", "in"),
                y: convert(object.elementView.y, "px", "in"),
                w: convert(object.elementView.width, "px", "in"),
                h: convert(50, "px", "in"),
                fill: {
                    color: "ffa400",
                    transparency: 0,
                },
                line: {
                    color: "ffa400"
                },
                valign: "top",
                autoFit: true
            };
            titleShape.textList.push({
                text: object.displayName ? object.displayName : object.name,
                options: {
                    fontSize: 12,
                    align: "center",
                    bold: true
                }
            });

            let messageShape = {
                type: "shape",
                textList: [],
                shape: pptx.shapes.RECTANGLE,
                x: convert(object.elementView.x, "px", "in"),
                y: convert(object.elementView.y+50, "px", "in"),
                w: convert(object.elementView.width, "px", "in"),
                h: convert(object.elementView.height-50, "px", "in"),
                fill: {
                    color: "050038",
                    transparency: 0,
                },
                line: {
                    color: "050038"
                },
                valign: "top",
                autoFit: true
            };
            if (object.message) {
                messageShape.textList.push({
                    text: object.message,
                    options: {
                        fontSize: 8,
                        align: "left",
                        color: "fafafa"
                    }
                })
            }

            shapes = [titleShape, fieldShape];
        }

        return shapes;
    }

    createPowerPoint(modelData) {
        const me = this;

        pptx.defineLayout({ name:'canvas', width: 20, height: 12 });
        pptx.layout = 'canvas';

        modelData.forEach((model) => {
            let slide = pptx.addSlide();
            slide = me.convertToShape(slide, model);
            slide = me.convertToArrow(slide, model);
        })
        pptx.writeFile({ fileName: me.pptName });
    }
}

module.exports = PowerPointGenerator;