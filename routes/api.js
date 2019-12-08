/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB;
const DB_NAME = process.env.DB_NAME;

// aync:await in mongodb
let client;
async function connectDB() {
  if (!client) {
    try {
      client = await MongoClient.connect(CONNECTION_STRING, { useUnifiedTopology: true });
      return { db: client.db(DB_NAME) };
    }
    catch (error) {
      return { error: error };
    }
  }
  return { error: 'Previous connection was not closed!' };
}

async function insertData(project, data) {
  const dbConn = await connectDB();
  if (dbConn.error) {
    return { error: dbConn.error };
  }
  const db = dbConn.db;
  const collection = db.collection(project);
  let result;
  try {
    result = await collection.insertOne(data);
    if (client) {
      await client.close();
      client = undefined;
    }
    return result;
  }
  catch (error) {
    return { error: error };
  }
}

// end of mongodb functions

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(function (req, res) {
      var project = req.params;
      res.json(project);
    })

    .post(async function (req, res) {
      var project = req.params.project;
      var issue_title = req.body.issue_title;
      var issue_text = req.body.issue_text;
      var created_by = req.body.created_by;
      var assigned_to = req.body.assigned_to || '';
      var status_text = req.body.status_text || '';

      var issue = { project: project };
      var now = new Date().toISOString();

      // sanity check
      if (!issue_title || !issue_text || !created_by) {
        return res.status(422).json({ error: '"One or more important fields are empty!' })
      }

      issue.assigned_to = assigned_to;
      issue.status_text = status_text;
      issue.created_on = now;
      issue.updated_on = now;
      issue.issue_title = issue_title;
      issue.issue_text = issue_text;
      issue.created_by = created_by;

      let result;
      try {
        result = await insertData(project, issue);
      }
      catch (error) {
        return res.json({ error: error });
      }

      if (result.error) {
        return res.json(result);
      }
      issue._id = result.insertedId;
      return res.json(issue);
    })

    .put(function (req, res) {
      var project = req.params.project;

    })

    .delete(function (req, res) {
      var project = req.params.project;

    });

};
