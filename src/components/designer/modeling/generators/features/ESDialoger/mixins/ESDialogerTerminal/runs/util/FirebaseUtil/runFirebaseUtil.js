const { FirebaseUtil } = require("../../../../../../../utils")

export default async function runFirebaseUtil(commandArgs, client) {
    const token = await FirebaseUtil.getCurrentUserJWT()
    console.log(`FirebaseUtil JWT token: `, token)
}