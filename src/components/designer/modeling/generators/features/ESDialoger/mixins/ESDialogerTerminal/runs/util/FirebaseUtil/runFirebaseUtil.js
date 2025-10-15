const { FirebaseUtil } = require("../../../../../../../utils")

export default async function runFirebaseUtil(commandArgs, client) {
    const token = await FirebaseUtil.getCurrentUserGWTToken()
    console.log(`FirebaseUtil JWT token: `, token)
}