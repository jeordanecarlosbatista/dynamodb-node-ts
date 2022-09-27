const { DocumentClient } = require('aws-sdk/clients/dynamodb')
const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
dotenv.config()

const tableName = process.env.TABLE_NAME
const database = new DocumentClient({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    endpoint: process.env.ENDPOINT_DYNAMODB.replace("172.17.0.2", "localhost"),
    region: process.env.REGION,
})
const data = JSON.parse(
    fs.readFileSync(path.resolve('src', 'data.json'), 'utf8')
)

const init = async () => {
    await Promise.all(
        data.map((element) =>
            database.put({ TableName: tableName, Item: element }).promise()
        )
    )
    console.log('database loaded successfully 🚀')
}

init()
