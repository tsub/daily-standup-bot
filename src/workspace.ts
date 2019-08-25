import { AuthorizeSourceData } from "@slack/bolt";
import * as WebApi from "seratch-slack-types/web-api";
import * as AWS from "aws-sdk";
import { workspaceDynamoDBTable, dynamoDBEndpoint } from "./env";

type workspace = {
  teamID: string;
  userID: string;
  userAccessToken: string;
  botAccessToken: string;
  botUserID: string;
};

export const dynamoDBClient: AWS.DynamoDB = new AWS.DynamoDB({
  endpoint: dynamoDBEndpoint
});

export const saveWorkspace: (
  _: WebApi.OauthAccessResponse
) => Promise<AWS.DynamoDB.PutItemOutput> = async results => {
  return dynamoDBClient
    .putItem({
      Item: {
        teamID: { S: results.team_id },
        userID: { S: results.user_id },
        userAccessToken: { S: results.access_token },
        botAccessToken: { S: results.bot.bot_access_token },
        botUserID: { S: results.bot.bot_user_id }
      },
      TableName: workspaceDynamoDBTable
    })
    .promise();
};

export const getWorkspace: (
  _: AuthorizeSourceData
) => Promise<workspace> = async source => {
  let item: AWS.DynamoDB.AttributeMap;

  if (source.userId) {
    const getItemResult = await dynamoDBClient
      .getItem({
        Key: {
          teamID: { S: source.teamId },
          userID: { S: source.userId }
        },
        TableName: workspaceDynamoDBTable
      })
      .promise();

    item = getItemResult.Item;
  } else {
    const queryResult = await dynamoDBClient
      .query({
        ExpressionAttributeValues: {
          ":teamID": { S: source.teamId }
        },
        KeyConditionExpression: "teamID = :teamID",
        TableName: workspaceDynamoDBTable
      })
      .promise();

    item = queryResult.Items[0];
  }

  return {
    teamID: item.teamID.S,
    userID: item.userID.S,
    userAccessToken: item.userAccessToken.S,
    botAccessToken: item.botAccessToken.S,
    botUserID: item.botUserID.S
  } as workspace;
};
