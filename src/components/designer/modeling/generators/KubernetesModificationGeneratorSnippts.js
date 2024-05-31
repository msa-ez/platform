const elementGuides = {
    horizontalPodAutoscaler: {
        "elementType": "horizontalPodAutoscaler",
        "description": "부하에 따라 파드의 수를 조절하는 자동 스케일링 기능을 제공",
        "usecasePrompts": ["부하량이 많을 경우, 자동으로 10개까지 알아서 늘려주세요."],
        "defaultKubeConfig": {
            "apiVersion": "autoscaling/v2beta2",
            "kind": "HorizontalPodAutoscaler",
            "metadata": {
                "name": ""
            },
            "spec": {
                "scaleTargetRef": {},
                "minReplicas": 1,
                "maxReplicas": 10,
                "metrics": []
            }
        }
    }
}

const newElementGuides = {
    "Deployment": [
        {
            connectFlow: "OUT",
            elementGuide: elementGuides.horizontalPodAutoscaler
        }
    ]
}


export function getNewElementGuidesForAI(elementToModify, defaultName="") {
    if(!newElementGuides[elementToModify]) return []

    const newElementGuidesForAI = newElementGuides[elementToModify].map((element) => element.elementGuide)
    newElementGuidesForAI.forEach((element) => {
        if(element.defaultKubeConfig.metadata && (element.defaultKubeConfig.metadata.name !== undefined))
            element.defaultKubeConfig.metadata.name = defaultName
    })
    return newElementGuidesForAI
}

export function getNewElementGuide(elementToModify, elementToCreate) {
    const newElementGuide = newElementGuides[elementToModify].filter((element) => element.elementGuide.elementType === elementToCreate)
    return (newElementGuide.length > 0) ? JSON.parse(JSON.stringify(newElementGuide[0])) : null
}

