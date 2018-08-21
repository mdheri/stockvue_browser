var express = require('express');
var router = express.Router();
var io = require('../io');

const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')

var soap = require('soap')
var url = 'http://74.208.109.93/stockvue_staging/src/iManagerService1.asmx?WSDL'

var get_id_args = {clientGuid:  "75CBF7EB-8D68-4005-A094-34C106D912BF"};

var args = {
  companyId:9,
  readings:{
    clsSensorReading: {
      timePolledUtc: "2018-08-21-00:50",
      sensorAddress: "20M-12334",
      sensorSs1: 	"20M-12334",   
      loadingLb: 	"20.23"
    },
   

  }
}
console.log(Date.now())

soap.createClient(url, function(err,client){
  
  var id = client.GetClientIdFromGuid(get_id_args,function(err,result){
    if(err){
      console.log(err);
    }
    console.log(result);
  });

  client.NewSensorReadingUtcWithError(args,function(err,result){
    if(err){
      console.log(err);
    }
    console.log(result);
  });
});


/*let allPorts = SerialPort.list();

let getWeight = function(comport){
  return new Promise(function(resolve,reject){
      comport.write("O0w1\r");
      resolve();
  });
};

allPorts.then(function(ports){
  
  openPorts = [];
  ports.forEach(function(port){
    sp = new SerialPort(port.comName, {
      buadRate: 9600
    });
    const parser = sp.pipe(new Readline({ delimiter: '\r\n' }))
    parser.on('data', console.log)
    spReadObject = {
      comport : sp,
      parse: parser
    }
    openPorts.push(spReadObject)
    console.log(port.comName, " opened");
  });
*/





/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'stockvue_alpha' });
});


var sp = new SerialPort("COM11", {
  buadRate: 9600,
});

const parser = sp.pipe(new Readline({ delimiter: '\r\n' }))

sp.on("open", onOpen)
parser.on('data', onData)



function onOpen(){
  console.log("port opened")
}


function onData(data){
  if(data == "E"){
    io.instance().emit("data", "Invalid Data");
  }
  else if(data != "A"){
    io.instance().emit("data", data);
  }
}



router.post('/command', function(req, res, next) {
  command = req.body.command;
  if(command == "CT0"){
    io.instance().emit("data", "Tared");
  }
  if(command == ""){
    io.instance().emit("data", "Stopped");
  }
  sp.write(req.body.command + "\r");  
});





module.exports = router;
