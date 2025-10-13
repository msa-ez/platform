const { XmlUtil } = require("../../../../../../../utils")
const { xmlUtilInputs } = require("./mocks");

export default function testXmlUtil(commandArgs, client, runner) {
    runner.describe('XmlUtil', ({ it }) => {
        it('주어진 dict 입력에 대해서 적절한 XML 문자열이 생성되어야 함', async () => {
            for(const input of xmlUtilInputs) {
                const xml = XmlUtil.from_dict(input.input)
                runner.expect(xml).toBe(input.expected)
            }
        });
    });
}