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
      var response = { project: project };
      var issue_title = req.body.issue_title;
      var issue_text = req.body.issue_text;
      var created_by = req.body.created_by;
      var assigned_to = req.body.assigned_to || '';
      var status_text = req.body.status_text || '';
      if (!issue_title) {
        return res.status(422).json({ error: '"Titile" field is empty!' })
      }
      else {
        response.issue_title = issue_title;
      }

      if (!issue_text) {
        return res.status(422).json({ error: '"Text" field is empty!' })
      }
      else {
        response.issue_text = issue_text;
      }

      if (!created_by) {
        return res.status(422).json({ error: '"Created by" field is empty!' })
      }
      else {
        response.created_by = created_by;
      }

      response.assigned_to = assigned_to;
      response.status_text = status_text;

      const now = new Date().toISOString();
      response.created_on = now;
      response.updated_on = now;

      let result;
      try {
        result = await insertData(project, response);
      }
      catch (error) {
        return res.json({ error: error });
      }

      if (result.error) {
        return res.json(result);
      }
      return res.json(result.ops[0]);
    })

    .put(function (req, res) {
      var project = req.params.project;

    })

    .delete(function (req, res) {
      var project = req.params.project;

    });

};
