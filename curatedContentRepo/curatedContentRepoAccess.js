const request = require('request');

//const apiKey = '4742d2564ae332ec2c54eaa847bd554d'

//const serverURL = 'http://localhost:3000/';
const serverURL = 'https://still-castle-18778.herokuapp.com';

var getCuratedContent = function(pknowledgeStep,pcontentSubjectArea,callback) {

  request({
    //url: `http://localhost:3000/curatedcontent/${pknowledgeStep}/${pcontentSubjectArea}/3`,
    url: `${serverURL}/curatedcontent/${pknowledgeStep}/${pcontentSubjectArea}/3`,
    json: true

  }, (error, response, body) => {
    if (!error & response.statusCode === 200) {
      callback(undefined, body);
    } else {
      callback('Unable to connect to the Server');
    }
  });
};

var getAllSubjectAreas = function(callback) {

  request({
    url: `${serverURL}/curatedcontent/contentSubjectArea/1`,
    json: true

  }, (error, response, body) => {
    if (!error & response.statusCode === 200) {
      callback(undefined, body);
    } else {
      callback('Unable to connect to the Server');
    }
  });
};

var getFilteredSubjectAreas = function(primaryModule, callback) {

  request({
    url: `${serverURL}/curatedcontent/contentSubjectAreaSubArea/${primaryModule}/2`,
    json: true

  }, (error, response, body) => {
    if (!error & response.statusCode === 200) {
      callback(undefined, body);
    } else {
      callback('Unable to connect to the Server');
    }
  });
};


var getUserEnrolledModuleData = function(pUserName, pEnrolledModule, callback) {

  request({
    //url: `http://localhost:3000/userdata/${pUserName}/${pEnrolledModule}`,
    url: `${serverURL}/userdata/${pUserName}/${pEnrolledModule}`,
    json: true

  }, (error, response, body) => {
    if (!error & response.statusCode === 200) {
      callback(undefined, body);
    } else {
      callback('Unable to connect to the Server');
    }
  });
  
};

var insertProgress = function(pUserName, pEnrolledModule, callback2) {

//  request.post('http://localhost:3000/userdata',{
    request.post(`${serverURL}/userdata`,{
    body: {userName: pUserName, enrolledModule: pEnrolledModule},
    json: true
  }, (error, response, body) => {
    if (!error & response.statusCode === 200) {
      callback2(undefined, body);
    } else {
      callback2('Unable to connect to the Server');
    }
  });
  
};

var recordFeedback = function(pUserName, pEnrolledModule, pfeedbackOnContent,pfeedbackOnExperience, callback) {

  //request.post('http://localhost:3000/feedbackdata',{
    request.post(`${serverURL}/feedbackdata`,{
    body: {userName: pUserName, feedbackModule: pEnrolledModule, feedbackOnContent: pfeedbackOnContent, feedbackOnExperience: pfeedbackOnExperience},
    json: true
  }, (error, response, body) => {
    if (!error & response.statusCode === 200) {
      callback(undefined, body);
    } else {
      callback('Unable to connect to the Server');
    }
  });
  
};

var recordLog = function(pUserName, pEnrolledModule, callback) {

  //request.post('http://localhost:3000/logdata',{
    request.post(`${serverURL}/logdata`,{
    body: {userName: pUserName, enrolledModule: pEnrolledModule},
    json: true
  }, (error, response, body) => {
    if (!error & response.statusCode === 200) {
      callback(undefined, body);
    } else {
      callback('Unable to connect to the Server');
    }
  });
  
};

var updateProgress = function(pUserName, pEnrolledModule, pLearningStep, pEarnedKnowledgePoints, callback) {

  //request.patch('http://localhost:3000/userdata',{
    request.patch(`${serverURL}/userdata`,{
    body: {userName: pUserName, enrolledModule: pEnrolledModule, learningStep: pLearningStep, earnedKnowledgePoints: pEarnedKnowledgePoints},
    json: true
  }, (error, response, body) => {
    if (!error & response.statusCode === 200) {
      callback(undefined, body);
    } else {
      callback('Unable to connect to the Server');
    }
  });
  
};

var updatePoints = function(pUserName, pEarnedKnowledgePoints, callback) {

  //request.patch('http://localhost:3000/pointsdata',{
    request.patch(`${serverURL}/pointsdata`,{
    body: {userName: pUserName, earnedKnowledgePoints: pEarnedKnowledgePoints},
    json: true
  }, (error, response, body) => {
    if (!error & response.statusCode === 200) {
      callback(undefined, body);
    } else {
      callback('Unable to connect to the Server');
    }
  });
  
};

module.exports = {
  getCuratedContent,
  getUserEnrolledModuleData,
  insertProgress,
  updateProgress,
  getAllSubjectAreas,
  getFilteredSubjectAreas,
  recordFeedback,
  updatePoints,
  recordLog
};
