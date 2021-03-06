var Alexa = require('alexa-sdk');
// Data
var alexaMeetups = require('./data/alexaMeetups');

// Helpers
var convertArrayToReadableString = require('./helpers/convertArrayToReadableString');

var omegaRestAPI = require('./helpers/omegaRestAPI');

exports.handler = function(event, context, callback){
  var alexa = Alexa.handler(event, context);
  alexa.registerHandlers(handlers);
  alexa.execute();
};

var handlers = {

  'NewSession': function () {
    this.emit(':ask', `Welcome to Omega Tech Skill! The skill that gives you all the information about the test execution report for your team.
    You can ask me about the test execution by your team name and even by team name and test status.
    But first, I\'d like to get to know you better. Tell me your name by saying: My name is, and then your name.`,
    `Tell me your name by saying: My name is, and then your name.`);
  },

  'LaunchRequest': function () {
    this.emit(':ask', `Welcome to Omega Tech Skill! The skill that gives you all the information about the test execution report for your team.
    You can ask me about the status of test execution by saying.
     Give me test result for your team name like for example Give me test result for avengers
     or you can also say
     How many scenarios have passed for avengers team.,
     What would you like to do?`, `You can ask me about the status of test execution by saying.
      Give me test result for your team name like for example Give me test result for avengers
      or you can also say
      How many scenarios have passed for avengers team.,
      What would you like to do?`);
  },

  'NameCapture': function () {
    // Get Slot Values
    var USFirstNameSlot = this.event.request.intent.slots.USFirstName.value;
    var UKFirstNameSlot = this.event.request.intent.slots.UKFirstName.value;

    // Get Name
    var name;
    if (USFirstNameSlot) {
      name = USFirstNameSlot;
    } else if (UKFirstNameSlot) {
      name = UKFirstNameSlot;
    }

    // Save Name in Session Attributes and Ask for Country
    if (name) {
      this.attributes['userName'] = name;
      this.emit(':ask', `Ok ${name}! Tell me what state you're from by saying: I'm from, and then the state you're from.`, `Tell me what state you're from by saying: I'm from, and then the state you're from.`, `Tell me what state you're from by saying: I'm from, and then the state you're from.`);
    } else {
      this.emit(':ask', `Sorry, I didn\'t recognise that name!`, `'Tell me your name by saying: My name is, and then your name.'`);
    }
  },

  'StateCapture': function () {
    // Get Slot Values
    var state = this.event.request.intent.slots.State.value;

    // Get User Name from Session Attributes
    var userName = this.attributes['userName'];

    // Save Country in Session Attributes and Move Into Main Skill
    // Save Country in Session Attributes and Move Into Main Skill
    if (state) {
      this.attributes['userState'] = state;
      this.emit(':ask', `Ok ${userName}! Your from ${state}, that's great! Tell me what city you're from by saying: I live in.. then the city you live in`, `Tell me what city you're from by saying: I live in.. and then the city you live in`);
    } else {
      this.emit(':ask', `Sorry, I didn\'t recognise that state!`, `Tell me what state you're from by saying: I am from and then the state you're from.`, `Tell me what state you're from by saying: I am from, and then the state you're from.`);
    }
  },

  'CityCapture': function () {
    // Get Slot Values
    var city = this.event.request.intent.slots.City.value;

    // Get User Name from Session Attributes
    var userName = this.attributes['userName'];

    if (city) {
      this.attributes['userCity'] = city;
      //this.emit(':ask', `Ok ${userName}! Your from ${country}, that's great! Tell me what city you're from by saying: I live in and then the city you're from.`, `Tell me what city you're from by saying: I live in, and then the city you're from.`);
      this.emit(':ask', `Ok ${userName}! You live in ${city}, that's great!  You can ask me about the status of test execution by saying.
      <break time=\"0.5s\"/> Give me test result for your team name <break time=\"0.2s\"/> like for example <break time=\"0.5s\"/>
      Give me test result for avengers <break time=\"0.5s\"/>
      or you can also say
      How many scenarios have passed for avengers team.`,
      `You can ask me about the status of test execution by saying.<break time=\"1s\"/>
       Give me test result for your team name <break time=\"1s\"/>  like for example <break time=\"1s\"/>
        Give me test result for avengers <break time=\"1s\"/>
       or you can also say
       How many scenarios have passed for avengers team., <break time=\"1s\"/>
       What would you like to do?`);
     } else {
       this.emit(':ask', `Sorry, I didn\'t recognise that city!`, `Tell me what city you live in by saying:
       I live in.. then the city you live in..`,
       `Tell me what city you live in by saying:
       I live in.. then the city you live in..`);
     }

  },

  'TeamStatusIntentRequest': function () {
    var teamName = this.event.request.intent.slots.TeamName.value;
    if (!teamName) {
      this.emit(':ask', `Sorry, I couldn't find your team ${teamName}. Please try again.`, 'Please try again.');
    } else {
      omegaRestAPI.GetTeamScenarioDetails(teamName)
        .then((scenarioDetails) => {
          var resultArray = scenarioDetails.Result;
          var scenarioArray = Object.keys(resultArray);
          var arrayLength = scenarioArray.length;
          var passedScenarios = 0;
          var failedScenarios = 0;
          var pendingScenarios = 0;
          for (var i = 0; i < arrayLength; i++){
            if (resultArray[i].Status.toLowerCase() === "passed") {
              passedScenarios += 1;
            } else if (resultArray[i].Status.toLowerCase() === "failed") {
              failedScenarios += 1;
            } else {
              pendingScenarios += 1;
            }
          }

          if (arrayLength >= 1) {
            // this.emit(':ask', `Your ${team} have ${arrayLength} scenarios. Your scenario Array is of type ${typeof resultArray}`, 'What would you like to do?');
            var message = `Your team avengers have ${passedScenarios} passed scenarios,  ${failedScenarios} failed scenarios and  ${pendingScenarios} pending scenarios`;
            this.attributes['testResults'] = message;
            this.emit(':ask', `Your team ${teamName} have ${arrayLength} scenarios.
            Out of ${arrayLength} scenarios, ${passedScenarios} have passed, ${failedScenarios} have failed,
            there are ${pendingScenarios} pending scenarios. Would you like me to text the test results to you?`, 'What would you like to do?');

          } else {
            this.emit(':ask', `Your team ${teamName} don't have any scenarios.`, 'What would you like to do?');
          }
        })
        .catch((error) => {
          console.log("OMEGA REST API ERROR: ", error);
              this.emit(':tell', 'Sorry, there was a problem accessing your rest api details.');
        });
    }
  },

  'TestStatusIntentRequest': function () {
    var teamName = this.event.request.intent.slots.TeamName.value;
    var testStatus = this.event.request.intent.slots.TestStatus.value;
    if (!teamName) {
      this.emit(':ask', `Sorry, I couldn't find your team ${teamName}. Please try again.`, 'Please try again.');
    } else {
      omegaRestAPI.GetTestDetails(teamName, testStatus)
        .then((testDetails) => {
          var resultArray = testDetails.Result;
          var scenarioArray = Object.keys(resultArray);
          var arrayLength = scenarioArray.length;
          //var passedTestCaseCount = resultArray.result;
          var nScenarios = 0;
          for (var i = 0; i < arrayLength; i++){
            nScenarios = resultArray[i].result;
          }
          if (arrayLength >= 1) {
            // this.emit(':ask', `Your ${team} have ${arrayLength} scenarios. Your scenario Array is of type ${typeof resultArray}`, 'What would you like to do?');
            this.emit(':ask', `Your team ${teamName} have ${nScenarios} ${testStatus} scenarios.`,
            'What would you like to do?');

          } else {
            this.emit(':ask', `Your team ${teamName} don't have any ${testStatus} scenarios.`, 'What would you like to do?');
          }
        })
        .catch((error) => {
          console.log("OMEGA REST API ERROR: ", error);
              this.emit(':tell', 'Sorry, there was a problem accessing your rest api details.');
        });
    }
  },

  'SendResultsBySMSIntentRequest': function () {
    var message = this.attributes['testResults'];
    //var address =  '101 post st san francisco ca';
    var toPhoneNumber = '14433733926';
    //this.emit(':tell', `${message}`);
    omegaRestAPI.SendResultsBySMS(message, toPhoneNumber)
    .then((messageDetails) => {
      var resultStatus = messageDetails.Results;
      if (resultStatus ) {
        this.emit(':ask', `Your teams test execution result is sent to your phone. ${message}.`, `Your teams test execution result is sent to your phone.`);
      } else {
        this.emit(':ask', `Sorry, I was not able to sent the results to your phone.`);
      }
    })
    .catch((error) => {
      console.log("SEND TEST RESULTS REST API ERROR: ", error);
      this.emit(':tell', 'Sorry, there was a problem accessing your send results rest api details.');
    });
  },
  'AMAZON.StopIntent': function () {
    //State Automactially Saved with : tell
    this.emit(':tell', 'Good Bye');
  },

  'AMAZON.CancelIntent': function () {
    //State Automactially Saved with : tell
    this.emit(':tell', 'Good Bye');
  },

  'AMAZON.HelpIntent': function () {
    //State Automactially Saved with : tell
    this.emit(':tell', 'Good Bye');
  },

  'SessionEndedRequest': function () {
    //Force State to Save when the user times out
    this.emit(':saveState', true);
  }



};
