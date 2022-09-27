set -a; source .env; set +a
node ./src/index.js

docker run --rm -it \
        -e AWS_DEFAULT_REGION=us-east-1 \
        -e AWS_ACCESS_KEY_ID=local \
        -e AWS_SECRET_ACCESS_KEY=local \
        --network dynamodb-local \
    amazon/aws-cli \
    dynamodb delete-table \
        --table-name $TABLE_NAME \
        --endpoint-url http://dynamodb-local:8000 \