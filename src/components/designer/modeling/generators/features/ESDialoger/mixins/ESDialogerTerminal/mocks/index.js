export const getDelayedMockedDatas = async (type) => {
    switch(type) {
        case "senarioMocks":
            return (await import("./senarioMocks")).senarioMocks
    }
}