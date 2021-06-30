var http = require("http");
const ewelink = require("ewelink-api");
const url = require("url");
var devices;
var connection;
var auth;
var onlineDevice;
var HTMLheader = "<head></head>";
//var device;

console.log("====================");
console.log(Date());
console.log("====================");

//create a server object:
http
  .createServer(
    function (req, res) {
      res.write(
        "<html>" +
          HTMLheader +
          "<body>" +
          timestampLC() +
          " - <b>Ewelink</b> - " +
          Date() +
          "<br>\n"
      );
      res.write("<br>Parameters:<br><ul>");
      res.write(
        "<li><i>login: false/real - use <b>false</b> without any other parameter for a demo response; use <b>real</b> to specify your credentials</i><br>"
      );
      res.write("<li>user/pass - Your ewelink credentials<br>");
      res.write(
        "<li>console: yes/no -  print debug data to node.js console<br>"
      );
      res.write("<li>verbose: yes/no - Use yes to see details of devices<br>");
      res.write("</ul><br><br>");
      const queryObject = url.parse(req.url, true).query;
      eweRetrieve(res, queryObject);
    } // function in createserver
  ) // createserver
  .listen(8080); //the server object listens on port 8080

function printOfflineDevice(res, device) {
  res.write(timestampLC() + " -     Name: " + device.name + "<br>\n");
  res.write(timestampLC() + " -     Type: " + device.type + "<br>\n");
  res.write(
    timestampLC() + " -     Brand name: " + device.brandName + "<br>\n"
  );
  res.write(timestampLC() + " -     Model: " + device.productModel + "<br>\n");
  res.write(
    timestampLC() +
      " -     Url: <a href='" +
      device.deviceUrl +
      "'>" +
      device.deviceUrl +
      "</a> <br>\n"
  );
}

////////////////////

async function eweRetrieve(res, queryObject) {
  res.write(timestampLC() + " - Attempting connection of user ");
  if (queryObject.login === "false") {
    res.write(
      "login = '" +
        queryObject.login +
        "'" +
        (queryObject.login === "false") +
        ", logging with tugsbayar.g@gmail.com'<br>\n"
    );
    try {
      res.write(timestampLC() + " - Trying...<br>\n");
      connection = new ewelink({
        email: "tugsbayar.g@gmail.com",
        password: "mdk06tgs6",
        region: "as"
      });
      res.write(timestampLC() + " - Ewelink - user DEBUG connected<br>\n");
    } catch {
      res.write(
        timestampLC() +
          " - Fail 001 - no connection available for DEBUG user<br>\n"
      );
      return 1;
    }
  } else {
    res.write("login = true, logging with '" + queryObject.user + "'<br>\n");
    try {
      res.write(timestampLC() + " - Trying...<br>\n");
      connection = new ewelink({
        email: queryObject.user,
        password: queryObject.pass
        //region: "it"
      });

      res.write(
        timestampLC() +
          " - >>> Initial login SUCCESS: user " +
          connection.email +
          " connected<br>\n"
      );
      // res.write(timestampLC() + " - ID: " + connection.APP_ID + "<br>\n");
      //res.write(timestampLC() + " - SEC: " + connection.APP_SECRET + "<br>\n");
    } catch {
      res.write(
        timestampLC() +
          " - Fail 002 - no connecion available for real user<br>\n"
      );
      return 2;
    }

    //credentialsLogin(res, connection);
    try {
      console.log(timestampLC() + " - Credentials...");
      res.write(timestampLC() + " - Credentials...");
      auth = await connection.getCredentials();
      res.write("SUCCESS! <<<<<<<<<<<br>\n");
      console.log("access token: ", auth.at);
      console.log("api key: ", auth.user.apikey);
      console.log("region: ", auth.region);
    } catch {
      res.write(timestampLC() + "***ERROR*** - cannot login<br>\n");
      console.log(timestampLC() + "***ERROR*** - cannot login<br>\n");
    }
  }

  /* get all devices */
  try {
    res.write(timestampLC() + " - Connected. Reading devices list...<br>\n");
    devices = await connection.getDevices();
    res.write(
      timestampLC() + " - Found n." + devices.length + " devices<br>\n<br>\n"
    );
    console.log(
      timestampLC() + " - Found n. " + devices.length + " devices\n\n"
    );
    console.log(timestampLC() + " - Reading info...");
  } catch {
    res.write(timestampLC() + " - Fail 003 - no devices<br>\n");
    console.log(timestampLC() + " - No devices found.");
    return 3;
  }
  //console.log("=== Begin devices list ===");
  //console.log(devices);
  //console.log("=== End devices list ===");

  /* get specific device info */
  for (var x = 0; x < devices.length; x++) {
    var element = devices[x];
    res.write(
      timestampLC() +
        " - Device n. " +
        (x + 1) +
        " (<b>" +
        element.name +
        "</b>)<br>\n<ul>"
    );
    res.write("<ul><li>Id: " + element.deviceid + "<br>\n");
    res.write("<li><b>Online: " + element.online + "</b><br>\n");
    //console.log(element);
    if (element.online) {
      res.write("<li>Device is online, fetching data...<br>\n");

      try {
        onlineDevice = await connection.getDevice(element.deviceid);
        res.write("<li>DATA:<br><ul>\n");
        res.write("<li>apikey: " + element.apikey + "<br>\n");
        res.write(
          "<li>description: " + element.extra.extra.description + "<br>\n"
        );
        var button = 'alert("To be implemented...");';
        res.write(
          "<li>swich status: <b>" +
            element.params.switch +
            "</b><button onclick='" +
            button +
            "'>Toggle</button><br>\n"
        );
        if (queryObject.verbose === "yes") {
          res.write("<li>created: " + element.createdAt + "<br>\n");
          res.write("<li>last check: " + element.onlineTime + "<br>\n");
          res.write("<li>last ip: " + element.ip + "<br>\n");
          res.write(
            "<li>model info: " + element.extra.extra.modelInfo + "<br>\n"
          );
          res.write(
            "<li> device URL: <a href='" +
              element.deviceUrl +
              "'>" +
              element.deviceUrl +
              "</a><br>\n"
          );
          res.write("<li>device name: " + element.brandName + "<br>\n");
          res.write("<li>product name: " + element.productModel + "<br>\n");
          res.write(
            "<li>Connected to  ssid: " + element.params.ssid + "<br>\n"
          );
          res.write(
            "<li>Connected to bssid: " + element.params.bssid + "<br>\n"
          );
        }
        if (queryObject.console === "yes") {
          console.log(
            timestampLC() + "***********************<br>\n",
            onlineDevice,
            "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<br>\n"
          );
        }
      } catch {
        res.write(
          timestampLC() +
            " -     ***** ONLINE ERROR: cannot retrieve *****<br>\n"
        );
        console.log(
          timestampLC() +
            "!!!!!!!!!!!!! Impossibile scaricare dati per " +
            element.name +
            " !!!!!!!!!!!!!!!"
        );
      }

      //printDevice(res, device);
    } else {
      printOfflineDevice(res, element);
    }
    res.write(" ------------<br>\n<br>\n</ul></ul></ul>");
  }

  /* toggle device */
  //await connection.toggleDevice('1000aea4dd');
  res.write("</body></html>");
  res.end(); //end the response
  console.log("Finished.");
}

eweRetrieve().catch(function (err) {
  console.log(timestampLC() + " - retrieve failed ", err);
});

function timestampLC() {
  let d = new Date();
  return d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
}
