const { XmlUtil } = require("../../../../../../../utils")
const { xmlUtilInputs } = require("./mocks");

export default async function runXmlUtil(commandArgs, client) {
    const utilInputs = structuredClone(xmlUtilInputs)

    for(const input of utilInputs) {
        console.log(`입력값: `, input.data)
        const xml = XmlUtil.from_dict(input.data)
        console.log(`출력값: `, xml)
    }
}