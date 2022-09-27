import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const makeSut = (): { client: DocumentClient } => {
    const database = new DocumentClient({
        endpoint: process.env.ENDPOINT_DYNAMODB?.replace("172.17.0.2", "localhost"),
        region: process.env.REGION,
    })

    return {
        client: database,
    }
}

const TABLE_NAME = process.env.TABLE_NAME!
describe('tests on shopping cart database', () => {
    it('Should return list all customers', async () => {
        const { client } = makeSut()
        let params: DocumentClient.QueryInput = {
            TableName: TABLE_NAME,
            IndexName: 'sort_key',
            KeyConditionExpression: 'sort_key = :userKey',
            ExpressionAttributeValues: {
                ':userKey': 'USER#',
            },
        }
        const result = await client.query(params).promise()
        expect(result.Count).toBe(3)
    })

    it('Should return list all customers who were born in the year 1999', async () => {
        const { client } = makeSut()
        let params: DocumentClient.QueryInput = {
            TableName: TABLE_NAME,
            IndexName: 'sort_key',
            KeyConditionExpression:
                'sort_key = :userKey and begins_with(partition_key, :customerKey)',
            ExpressionAttributeValues: {
                ':userKey': 'USER#',
                ':customerKey': 'CUSTOMER#YEAR_BIRTH#1999',
            },
        }

        const result = await client.query(params).promise()
        expect(result.Count).toBe(2)
    })

    it('Should return list all products', async () => {
        const { client } = makeSut()
        let params: DocumentClient.QueryInput = {
            TableName: TABLE_NAME,
            IndexName: 'sort_key',
            KeyConditionExpression: 'sort_key = :productKey',
            ExpressionAttributeValues: {
                ':productKey': 'PRODUCT#',
            },
        }

        const result = await client.query(params).promise()
        expect(result.Count).toBe(3)
    })

    it('Should return cart by customer', async () => {
        const { client } = makeSut()

        const customerId = 1
        let params: DocumentClient.QueryInput = {
            TableName: TABLE_NAME,
            IndexName: 'sort_key',
            KeyConditionExpression:
                'sort_key = :customerKey and begins_with(partition_key, :cartKey)',
            ExpressionAttributeValues: {
                ':customerKey': 'CUSTOMER#' + customerId,
                ':cartKey': 'CART#',
            },
            ProjectionExpression: 'id,amount,total_items,customer',
        }

        const result = await client.query(params).promise()
        const [cart] = result.Items!

        expect(cart.amount).toBe(199)
        expect(cart.id).toBe(1)
        expect(cart.total_items).toBe(5)
        expect(cart.customer).toBe(1)
    })

    it('Should return items by cart', async () => {
        const { client } = makeSut()

        const cartId = 2
        let params: DocumentClient.QueryInput = {
            TableName: TABLE_NAME,
            IndexName: 'sort_key',
            KeyConditionExpression:
                'sort_key = :cartKey and begins_with(partition_key, :itemKey)',
            ExpressionAttributeValues: {
                ':cartKey': 'CART#' + cartId,
                ':itemKey': 'ITEM#',
            },
            ProjectionExpression: 'id,amount,total_items,customer',
        }

        const result = await client.query(params).promise()

        expect(result.Count).toBe(2)
    })

    it('should return amount of the cart', async () => {
        const { client } = makeSut()

        const cartId = 2
        let params: DocumentClient.QueryInput = {
            TableName: TABLE_NAME,
            IndexName: 'sort_key',
            KeyConditionExpression:
                'sort_key = :cartKey and begins_with(partition_key, :itemKey)',
            ExpressionAttributeValues: {
                ':cartKey': 'CART#' + cartId,
                ':itemKey': 'ITEM#',
            },
            ProjectionExpression: 'id,amount,total_items,customer',
        }

        const result = await client.query(params).promise()
        const amount = result.Items?.map((val) => val.amount).reduce(
            (a, b) => a + b,
            0
        )

        expect(amount).toBe(10)
    })
})
