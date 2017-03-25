var request = require('request-promise');

module.exports = {
  GetTeamScenarioDetails: (teamName) => {
    return new Promise((resolve, reject) => {

      // Call Omega Rest API for team
      request({
        url: `https://guarded-retreat-39694.herokuapp.com/api/${teamName}` ,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then((response) => {
        //Return user details
        resolve(JSON.parse(response));
      })
      .catch((error) => {
        //Return error
        reject("Omega REST API Error", error);
      });
    });
  },

  GetTestDetails: (teamName, testStatus) => {
    return new Promise((resolve, reject) => {

      // Call Meetup api
      request({
        //url: "https://guarded-retreat-39694.herokuapp.com/api/"+teamName +"/"+status ,
        url: `https://guarded-retreat-39694.herokuapp.com/api/${teamName}/${testStatus}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then((response) => {
        //Return user details
        resolve(JSON.parse(response));
      })
      .catch((error) => {
        //Return error
        reject("Omega REST API Error", error);
      });
    });
  },
  SendResultsBySMS: (message, toPhoneNumber) => {
    return new Promise((resolve, reject) => {

      // Call Meetup api
      request({
        url: `https://hidden-thicket-90736.herokuapp.com/api/send/results/${message}/${toPhoneNumber}`,
    //   url: `https://hidden-thicket-90736.herokuapp.com/api/send/${address}/${phoneNumber}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then((response) => {
        //Return user details
        resolve(JSON.parse(response));
      })
      .catch((error) => {
        //Return error
        reject("Send SMS REST API Error", error);
      });
    });
  }


};
