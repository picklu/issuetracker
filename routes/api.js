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
var MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;

var CONNECTION_STRING = process.env.DB_URL;
const DB_NAME = process.env.DB_NAME;
const DB_TYPE = process.env.DB_TYPE;

// aync:await in mongodb
let client;
let memoryServer;
// connect to the database
async function connectDB() {
  if (DB_TYPE === 'mongodb-memory-server') {
    if (!memoryServer) {
      memoryServer = new MongoMemoryServer();
      CONNECTION_STRING = await memoryServer.getConnectionString();
    }
  }
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

// insert data to the database
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

    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = undefined;
    }

    return result;
  }
  catch (error) {
    return { error: error };
  }
}

// update issue in the database
async function updateData(project, id, data) {
  const dbConn = await connectDB();
  if (dbConn.error) {
    return { error: dbConn.error };
  }
  const db = dbConn.db;
  const collection = db.collection(project);
  let result;
  try {
    result = await collection.updateOne({ _id: id }, { $set: data });
    if (client) {
      await client.close();
      client = undefined;
    }

    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = undefined;
    }

    return result;
  }
  catch (error) {
    return { error: error };
  }
}

// get issue from the database
async function getData(project, data) {
  const dbConn = await connectDB();
  if (dbConn.error) {
    return { error: dbConn.error };
  }
  const db = dbConn.db;
  const collection = db.collection(project);
  let result;
  try {
    result = await collection.find(data);
    if (client) {
      await client.close();
      client = undefined;
    }

    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = undefined;
    }

    return result;
  }
  catch (error) {
    return { error: error };
  }
}


// delete issue in the database
async function deleteData(project, id) {
  const dbConn = await connectDB();
  if (dbConn.error) {
    return { error: dbConn.error };
  }
  const db = dbConn.db;
  const collection = db.collection(project);
  let result;
  try {
    result = await collection.findOneAndDelete({ _id: id }, { $set: data });
    if (client) {
      await client.close();
      client = undefined;
    }

    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = undefined;
    }

    if (result) {
      return result;
    }
    else {
      return {};
    }

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

      // sanity check for body
      if (!req.body) {
        return res.status(422).json({ error: 'All the fields are empty!' });
      }

      var issue_title = req.body.issue_title;
      var issue_text = req.body.issue_text;
      var created_by = req.body.created_by;
      var assigned_to = req.body.assigned_to || '';
      var status_text = req.body.status_text || '';


      // sanity check for important fields
      if (!issue_title || !issue_text || !created_by) {
        return res.status(422).json({ error: 'One or more important fields are empty!' })
      }

      var issue = {};
      var now = new Date().toISOString();

      issue.assigned_to = assigned_to;
      issue.status_text = status_text;
      issue.created_on = now;
      issue.updated_on = now;
      issue.issue_title = issue_title;
      issue.issue_text = issue_text;
      issue.created_by = created_by;
      issue.open = true;

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

    .put(async function (req, res) {
      var project = req.params.project;
      var issueId = req.body ? req.body._id : undefined;

      // sanity check for body
      if (Object.keys(req.body).length === 0) {
        return res.status(422).send('All the fields are empty!');
      }

      if (!issueId) {
        return res.status(422).send('_id must be provided!');
      }

      var issue_title = req.body.issue_title;
      var issue_text = req.body.issue_text;
      var created_by = req.body.created_by;
      var assigned_to = req.body.assigned_to;
      var status_text = req.body.status_text;
      var open = req.body.open;

      // sanity check for update fields
      if (!issue_title && !issue_text && !created_by && assigned_to && status_text) {
        return res.send('Update fields are empty!');
      }

      var issue = {}
      if (issue_title) issue.issue_title = issue_title;
      if (issue_text) issue.issue_text = issue_text;
      if (created_by) issue.created_by = created_by;
      if (assigned_to) issue.assigned_to = assigned_to;
      if (status_text) issue.status_text = status_text;
      if (open === false) issue.open = open;

      issue.updated_on = new Date().toISOString();

      let result;
      try {
        result = await updateData(project, ObjectId(issueId), issue);
      }
      catch (error) {
        return res.send('Couldn\'t update ' + issueId);
      }

      if (result.error) {
        return res.json(result);
      }

      return res.send('Successfully updated ' + issueId);
    })

    .delete(function (req, res) {
      var project = req.params.project;

    });

};
