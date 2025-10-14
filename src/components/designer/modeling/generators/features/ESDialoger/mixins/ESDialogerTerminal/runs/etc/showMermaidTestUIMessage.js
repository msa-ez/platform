export default async function showMermaidTestUIMessage(commandArgs, client) {
    client.messages = [
        {
            type: 'mermaidStringTest'
        }
    ]
}