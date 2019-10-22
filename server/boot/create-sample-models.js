let userPrompts = require("../../userPrompts");

module.exports = function(app) {
    app.dataSources.io_datasource.autoupdate('deviceConfiguration', function(err) {
      if (err) throw err;

      app.models.deviceConfiguration.findOrCreate({where: {_did: userPrompts.deviceName}, limit: 1}, {
        _did: userPrompts.deviceName,
        name: userPrompts.deviceName,
        needProcessing: false,
        propietaryParameters: [{
            name: "resourcePath",
            value: userPrompts.resourcePath
          },{
            name: "username",
            value: userPrompts.username
          },{
            name: "password",
            value: userPrompts.password
          },{
            name: "security",
            value: userPrompts.security
          }
        ]
      }, function(err, models) {
        if (err) throw err;

        console.log('Models created: \n', models);
      });
    });

    app.dataSources.io_datasource.autoupdate('sensorConfiguration', function(err) {
      if (err) throw err;

      let triggerConfig = JSON.stringify({
        samplingInterval: 100,
        discardOldest: true,
        queueSize: 10
      });

      app.models.sensorConfiguration.findOrCreate({where: {_sid: userPrompts.sensorName}, limit: 1}, {
        _sid: userPrompts.sensorName,
        _did: userPrompts.deviceName,
        name: userPrompts.sensorName,
        properties: {
          name: "Code",
          type: userPrompts.type,
          value: "",
          unit: "units"
        },
        driver: {
          name: 'mqtt',
          protocol: 'mqtt',
          version: '1',
          description: 'driver for mqtt'
        },
        events: [{
          type: 'subscription',
          intervalTime: 100
        }],
        historicData: true,
        computingExpression: "%v",
        actuator: false,
        propietaryParameters: [
          {
            name: "topic",
            value: userPrompts.topic
          },
          {
            name: "jsonPath",
            value: userPrompts.jsonPath
          }
        ]
      }, function(err, models) {
        if (err) throw err;

        console.log('Models created: \n', models);
      });
    });

    function callback(msg){
      console.log("Suscribed succesfully");
    }

    app.models.sensorConfiguration.all()
    .then(result => {
      for (let item in result) {
        if (result[item].events != null && result[item].events.length > 0) {   
          app.models.sensor.subscribeSensor(result[item]._did, result[item]._sid, callback);
        }
      };
    })
    .catch(e => {
      console.log(e);
    });
  };
