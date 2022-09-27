set -a; source .env; set +a
node ./src/index.js

docker run --rm -it \
        -e AWS_DEFAULT_REGION=us-east-1 \
        -e AWS_ACCESS_KEY_ID=local \
        -e AWS_SECRET_ACCESS_KEY=local \
        --network dynamodb-local \
    amazon/aws-cli \
    dynamodb create-table \
        --table-name $TABLE_NAME \
        --attribute-definitions \
            AttributeName=$PARTITION_KEY,AttributeType=S \
            AttributeName=$SORT_KEY,AttributeType=S \
        --key-schema \
            AttributeName=$PARTITION_KEY,KeyType=HASH \
            AttributeName=$SORT_KEY,KeyType=RANGE \
        --provisioned-throughput \
            ReadCapacityUnits=5,WriteCapacityUnits=5 \
        --table-class STANDARD \
        --global-secondary-indexes \
            "[
                {
                    \"IndexName\": \"$SORT_KEY\",
                    \"KeySchema\": [{\"AttributeName\":\"$SORT_KEY\",\"KeyType\":\"HASH\"},
                                    {\"AttributeName\":\"$PARTITION_KEY\",\"KeyType\":\"RANGE\"}],
                    \"Projection\":{
                        \"ProjectionType\":\"ALL\"
                    },
                    \"ProvisionedThroughput\": {
                        \"ReadCapacityUnits\": 10,
                        \"WriteCapacityUnits\": 5
                    }
                }
            ]" \
        --endpoint-url http://dynamodb-local:8000 \