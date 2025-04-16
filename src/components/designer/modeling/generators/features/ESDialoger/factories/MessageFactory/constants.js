export const aggregateDraftDialogDtoMessage = {
    type: "aggregateDraftDialogDto",
    uniqueId: "",
    isShow: false,
    draftOptions: [],
    draftUIInfos: {
        leftBoundedContextCount: 1,
        directMessage: "Preprocessing for generating aggregate actions...",
        progress: 0
    },
    isGeneratorButtonEnabled: true,
    boundedContextVersion: 1,
    actions: {
        stop: null,
        retry: null
    },
    retryInputs: {
        initialInputs: [],
        initialAccumulatedDrafts: {}
    }
}

export const botMessage = {
    type: "botMessage",
    subType: "",
    uniqueId: "",
    message: "",
    metadatas: {}
}

export const userMessage = {
    type: "userMessage",
    subType: "",
    uniqueId: "", 
    message: "",
    metadatas: {
      targetBoundedContextName: null
    }
}
