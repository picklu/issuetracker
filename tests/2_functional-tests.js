/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var moment = require('moment');
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  var issueId1;
  var issueId2;
  suite('POST /api/issues/{project} => object with issue data', function () {
    test('Every field filled in', function (done) {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .then(function (res) {
          const { body, status } = res;
          assert.equal(status, 200);

          assert.property(body, 'issue_title');
          assert.property(body, 'issue_text');
          assert.property(body, 'created_by');
          assert.property(body, 'assigned_to');
          assert.property(body, 'status_text');
          assert.property(body, '_id');
          assert.property(body, 'open');
          assert.property(body, 'created_on');
          assert.property(body, 'updated_on');

          issueId1 = body._id;
          assert.isString(issueId1);

          assert.equal(body.issue_title, 'Title');
          assert.equal(body.issue_text, 'text');
          assert.equal(body.created_by, 'Functional Test - Every field filled in');
          assert.equal(body.assigned_to, 'Chai and Mocha');
          assert.equal(body.status_text, 'In QA');
          assert.isBoolean(body.open);
          assert.equal(body.open, true);
          assert.equal(moment(body.created_on, moment.ISO_8601, true).isValid(), true)
          assert.equal(moment(body.updated_on, moment.ISO_8601, true).isValid(), true)
          done();
        })
        .catch(function (err) {
          console.log(err);
        });
    });

    test('Required fields filled in', function (done) {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
        })
        .then(function (res) {
          const { body, status } = res;
          assert.equal(status, 200);

          assert.property(body, 'issue_title');
          assert.property(body, 'issue_text');
          assert.property(body, 'created_by');
          assert.property(body, 'assigned_to');
          assert.property(body, 'status_text');
          assert.property(body, '_id');
          assert.property(body, 'open');
          assert.property(body, 'created_on');
          assert.property(body, 'updated_on');

          issueId2 = body._id;
          assert.isString(issueId2);

          assert.equal(body.issue_title, 'Title');
          assert.equal(body.issue_text, 'text');
          assert.equal(body.created_by, 'Functional Test - Every field filled in');
          assert.equal(body.assigned_to, '');
          assert.equal(body.status_text, '');
          assert.isBoolean(body.open);
          assert.equal(body.open, true);
          assert.equal(moment(body.created_on, moment.ISO_8601, true).isValid(), true)
          assert.equal(moment(body.updated_on, moment.ISO_8601, true).isValid(), true)
          done();
        })
        .catch(function (err) {
          console.log(err);
        })
    });

    test('Missing required fields', function (done) {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .then(function (res) {
          const { body, status } = res;
          assert.equal(status, 422);
          assert.property(body, 'error');
          done();
        })
        .catch(function (err) {
          console.log(err);
        })
    });
  });

  suite('PUT /api/issues/{project} => text', function () {

    test('No body', function (done) {
      chai.request(server)
        .put('/api/issues/test')
        .then(function (res) {
          assert.equal(res.status, 422);
          assert.property(res, 'text');
          assert.equal(res.text, 'All the fields are empty!');
          done();
        })
        .catch(function (err) {
          console.log(err);
        });
    });

    test('One field to update', function (done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: issueId1,
          issue_title: 'New title'
        })
        .then(function (res) {
          assert.equal(res.status, 200);
          assert.property(res, 'text');
          assert.equal(res.text, 'Successfully updated ' + issueId1);
          done();
        })
        .catch(function (err) {
          console.log(err);
        });
    });

    test('Multiple fields to update', function (done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: issueId2,
          issue_title: 'Updated Title',
          issue_text: 'Updated text',
          created_by: 'Updated Functional Test - Every field filled in',
          assigned_to: 'Updated Chai and Mocha',
          status_text: 'Updated In QA',
          open: false
        })
        .then(function (res) {
          assert.equal(res.status, 200);
          assert.property(res, 'text');
          assert.equal(res.text, 'Successfully updated ' + issueId2);
          done();
        })
        .catch(function (err) {
          console.log(err);
        });
    });

  });

  suite('GET /api/issues/{project} => Array of objects with issue data', function () {

    test('No filter', function (done) {
      chai.request(server)
        .get('/api/issues/test')
        .query({})
        .then(function (res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        })
        .catch(function (err) {
          console.log(err);
        });
    });

    test('One filter', function (done) {
      chai.request(server)
        .get('/api/issues/test')
        .query({ _id: issueId2 })
        .then(function (res) {
          assert.equal(res.status, 200);

          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');

          assert.equal(res.body[0]._id, issueId2);

          done();
        })
        .catch(function (err) {
          console.log(err);
        });
    });

    test('Multiple filters (test for multiple fields you know will be in the db for a return)', function (done) {
      chai.request(server)
        .get('/api/issues/test')
        .query({
          issue_title: 'Updated Title',
          issue_text: 'Updated text',
          created_by: 'Updated Functional Test - Every field filled in',
          assigned_to: 'Updated Chai and Mocha',
          status_text: 'Updated In QA',
        })
        .then(function (res) {
          assert.equal(res.status, 200);

          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');

          assert.equal(res.body[0].issue_title, 'Updated Title');
          assert.equal(res.body[0].issue_text, 'Updated text');
          assert.equal(res.body[0].created_by, 'Updated Functional Test - Every field filled in');
          assert.equal(res.body[0].assigned_to, 'Updated Chai and Mocha');
          assert.equal(res.body[0].status_text, 'Updated In QA');

          done();
        })
        .catch(function (err) {
          console.log(err);
        });
    });

  });

  suite('DELETE /api/issues/{project} => text', function () {

    test('No _id', function (done) {
      chai.request(server)
        .delete('/api/issues/test')
        .query({})
        .then(function (res) {
          assert.equal(res.status, 200);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'id error!');
          done();
        })
        .catch(function (err) {
          console.log(err);
        });
    });

    test('Valid _id', function (done) {
      // for issueId1
      chai.request(server)
        .delete('/api/issues/test')
        .query({ _id: issueId1 })
        .then(function (res) {
          assert.equal(res.status, 200);
          assert.property(res.body, 'success');
          assert.equal(res.body.success, 'deleted ' + issueId1 + '.');
          done();
        })
        .catch(function (err) {
          console.log(err);
        });
    });
  });
});