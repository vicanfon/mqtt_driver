// Specific driver
// it covers the mappings to specific protocols
// the methods will be used by devices

var mqtt = require("mqtt");

module.exports = function(loggerCB){
    
    // callback method to send error messages back to the platform to be logged
    this.logger = loggerCB;

    // propietaryParameters: list of propietary parameters that will be part of the configuration necessary 
    // to handle to work properly
    // @param [resourcePath="http://url:1388"] {String} url with port where the message broker is hosted and listening
    // @param [topic="topic_x"] {String} name of the topic where you want to subscribe
    
    // mandatory methods of the driver. Any developer must code them
    return {
        /**
         * method called by the Devide Driver SDK when reading a sensor according to the protocol
         * @param {object} sensorConf configuration of a sensor containing the proprietary parameters to connect to a server and read data
         * @callback {Function} callback Callback function
         *      @param {string} result string with the value of the sensor data
         */
        readSensorData: async function (deviceConf, sensorConf) {
            throw ["MQTT doesn't support reading options, you must subscribe", "err", new Date()]
        },
        /**
         * method called by the Devide Driver SDK when subscribing to changes of a sensor
         * @param {object} sensorConf configuration of a sensor containing the proprietary parameters to subscribe to a server monitoring sensor changes
         * @callback {Function} callback Callback function
         *      @param {string} result string with the value of the sensor data
         */
        subscribe: async function (deviceConf, sensorConf, callback) {
            // Retrieval of MQTT resourPath and topic
            let resourcePath = deviceConf.propietaryParameters.find( item => item.name == "resourcePath").value;
            let username = deviceConf.propietaryParameters.find( item => item.name == "username").value;
            let password = deviceConf.propietaryParameters.find( item => item.name == "password").value;
            let security = deviceConf.propietaryParameters.find( item => item.name == "security").value;
            let jsonPath = deviceConf.propietaryParameters.find( item => item.name == "jsonPath").value;
            let topic = sensorConf.propietaryParameters.find( item => item.name == "topic").value;

            // Create MQTT client
            
            var options={
                protocol: 'mqtt'
              }
            if (security) {
                options.username= username;
                options.password= password;
              }
            
            var client  = security ? mqtt.connect(resourcePath, options) : mqtt.connect(resourcePath);

            // MQTT subscription
            client.on('connect', function(){
                console.log("Subscribed to "+resourcePath);
                client.subscribe(topic);
                console.log("Listening to "+topic);
            });


            client.on('message', function (topic, message) {
                // message is Buffer
                var result=message;
                if(jsonPath.length>0){
                    result=JSON.parse(message);
                    result=result[jsonPath]
                }
                callback([result.toString(), "Good", new Date()]);
              });
              
        },
        /**
         * method called by the Devide Driver SDK when sending a command action to a sensor
         * @param {object} command command for the sensor
         * @callback {Function} callback Callback function
         *      @param {string} acknowledge string with a message of success or failure
         */
        sendCommand: async function (deviceConf, sensorConf, command) {
            // Retrieval of MQTT resourPath and topic
            let resourcePath = deviceConf.propietaryParameters.find( item => item.name == "resourcePath").value;
            let username = deviceConf.propietaryParameters.find( item => item.name == "username").value;
            let password = deviceConf.propietaryParameters.find( item => item.name == "password").value;
            let topic = sensorConf.propietaryParameters.find( item => item.name == "topic").value;

            // Create MQTT client
            var options = {
                username: username,
                password: password,
                protocol: 'mqtt'
              }
            
            var client  = username.length > 0 ? mqtt.connect(resourcePath, options) : mqtt.connect(resourcePath);

            // MQTT subscription
            client.on('connect', function(){
                client.publish(topic, command.command);
            });
        },
        getDriverMetadata: function () {
            // propietaryParameters: list of propietary parameters that will be part of the configuration necessary 
            // to handle to work properly
            // @param [subscription_requestedPublishingInterval=2000] {Integer} how often the server checks if there are notification packages.
            // @param [subscription_requestedLifetimeCount="100"] {Integer} the number of PublishingIntervals to wait for a new PublishRequest, before realizing that the client is no longer active.
            // @param [subscription_requestedMaxKeepAliveCount="2"] {Integer} how many intervals may be skipped, before an empty notification is sent anyway.
            // @param [subscription_maxNotificationsPerPublish="10"] {Integer} ???.
            // @param [subscription_publishingEnabled=true] {Boolean} ???.
            // @param [subscription_priority="10"] {Integer} Priority ???.
            // @param [security_certificatefile="certificates/client_selfsigned_cert_1024.pem"] {String} client certificate pem file.
            // @param [security_privatekeyfile="certificates/client_key_1024.pem"] {String} client private key pem file.
            // @param [security_securityMode=MessageSecurityMode.None] {MessageSecurityMode} the default security mode.
            // @param [security_securityPolicy =SecurityPolicy.NONE] {SecurityPolicy} the security mode.
            let device_proprietaryParameters = [["resourcePath","mqtt://m24.cloudmqtt.com:17074"],["username",""],["password",""]];
            let sensor_proprietaryParameters = [["topic","topic1"],["jsonPath","elem.attr"]];

            return {
                driver: "mqtt",
                device_proprietaryParameters: device_proprietaryParameters,
                sensor_proprietaryParameters: sensor_proprietaryParameters
            };
        }
    }
    // TODO: the developer will write here the private methods necessary for the driver
}