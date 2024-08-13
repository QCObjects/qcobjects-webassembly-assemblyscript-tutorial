/**
 * QCObjects CLI 2.4.x
 * ________________
 *
 * Author: Jean Machuca <correojean@gmail.com>
 *
 * Cross Browser Javascript Framework for MVC Patterns
 * QuickCorp/QCObjects is licensed under the
 * GNU Lesser General Public License v3.0
 * [LICENSE] (https://github.com/QuickCorp/QCObjects/blob/master/LICENSE.txt)
 *
 * Permissions of this copyleft license are conditioned on making available
 * complete source code of licensed works and modifications under the same
 * license or the GNU GPLv3. Copyright and license notices must be preserved.
 * Contributors provide an express grant of patent rights. However, a larger
 * work using the licensed work through interfaces provided by the licensed
 * work may be distributed under different terms and without source code for
 * the larger work.
 *
 * Copyright (C) 2015 Jean Machuca,<correojean@gmail.com>
 *
 * Everyone is permitted to copy and distribute verbatim copies of this
 * license document, but changing it is not allowed.
*/
/*eslint no-unused-vars: "off"*/
/*eslint no-redeclare: "off"*/
/*eslint no-empty: "off"*/
/*eslint strict: "off"*/
/*eslint no-mixed-operators: "off"*/
/*eslint no-undef: "off"*/
"use strict";

const path = require("path");
const absolutePath = path.resolve(__dirname, "./");

const fs = require("fs");
const mime = require("mime");
require(absolutePath + "/org.quickcorp.qcobjects.main.file.js");
require(absolutePath + "/org.qcobjects.common.pipelog.js");

let ImportMicroservice = function (microservicePackage) {
  var _ret_;
  var standardPath = findPackageNodePath(microservicePackage) || findPackageNodePath(microservicePackage + ".js");
  if (standardPath !== null) {
    _ret_ = Import(microservicePackage);
  } else {
    var nonStandardPath = findPackageNodePath(absolutePath + "/backend/" + microservicePackage) || findPackageNodePath(absolutePath + "/backend/" + microservicePackage + ".js");
    if (nonStandardPath !== null){
      _ret_ = Import(absolutePath + "/backend/" + microservicePackage);
    } else {
      _ret_ = Promise.resolve(require (microservicePackage));
    }
  }
  return _ret_;
};

Package("org.quickcorp.qcobjects.main.http.server",[

  class BackendMicroservice extends InheritClass {
    constructor({
      domain=CONFIG.get("domain"),
      basePath=CONFIG.get("basePath"),
      body=null,
      stream=null,
      request=null
    }){
      super(...arguments);

      logger.debug("Initializing Legacy BackendMicroservice...");
      let microservice = this;
      if (typeof this.body === "undefined") {
        this.body = null;
      }
      if (typeof body !== "undefined"){
        this.body = body;
      }
      this.cors();
      microservice.stream = stream;
      microservice.req.on("data", (data) => {
        // data from POST, GET
        var requestMethod = request.method.toLowerCase();
        var supportedMethods = {"post":microservice.post,
                              };
        if (Object.hasOwnProperty.call(supportedMethods,requestMethod)) {
          supportedMethods[requestMethod].call(microservice,data);
        }
      });

      // data from POST, GET
      var requestMethod = request.method.toLowerCase();
      var supportedMethods = {"get":microservice.get,
                              "head":microservice.head,
                              "put":microservice.put,
                              "delete":microservice.delete,
                              "connect":microservice.connect,
                              "options":microservice.options,
                              "trace":microservice.trace,
                              "patch":microservice.patch
                            };
      if (Object.hasOwnProperty.call(supportedMethods,requestMethod)) {
        supportedMethods[requestMethod].call(microservice);
      }


    }

    cors() {
      if (this.route.cors) {
        logger.debug("Validating CORS...");
        let {
          allow_origins,
          allow_credentials,
          allow_methods,
          allow_headers
        } = this.route.cors;
        var microservice = this;
        if (typeof microservice.headers !== "object") {
          microservice.headers = {};
        }
        if (typeof microservice.route.responseHeaders !== "object") {
          microservice.route.responseHeaders = {};
        }
        if (typeof allow_origins !== "undefined") {
          logger.debug("CORS: allow_origins available. Validating origins...");
          // an example of allow_origins is ['https://example.com','http://www.example.com']
          if (allow_origins === "*" || (typeof microservice.request.headers.origin === "undefined") || [...allow_origins].indexOf(microservice.request.headers.origin) !== -1) {
            // for compatibility with all browsers allways return a wildcard when the origin is allowed
            logger.debug("CORS: Adding header Access-Control-Allow-Origin=*");
            microservice.route.responseHeaders["Access-Control-Allow-Origin"] = "*";
          } else {
            logger.debug("CORS: Origin is not allowed: " + microservice.request.headers.origin);
            logger.debug("CORS: Forcing to finish the response...");
            this.body = {};
            try {
              this.done();
            } catch (e) {
              logger.debug(`It was not possible to finish the call to the microservice: ${e}`);
            }
          }
        } else {
          logger.debug("CORS: no allow_origins available. Allowing all origins...");
          logger.debug("CORS: Adding header Access-Control-Allow-Origin=*");
          microservice.route.responseHeaders["Access-Control-Allow-Origin"] = "*";
        }
        if (typeof allow_credentials !== "undefined") {
          logger.debug(`CORS: allow_credentials present. Allowing ${allow_credentials}...`);
          microservice.route.responseHeaders["Access-Control-Allow-Credentials"] = allow_credentials.toString();
        } else {
          logger.debug("CORS: No allow_credentials present. Allowing all credentials.");
          microservice.route.responseHeaders["Access-Control-Allow-Credentials"] = "true";
        }
        if (typeof allow_methods !== "undefined") {
          logger.debug(`CORS: allow_methods present. Allowing ${allow_methods}...`);
          microservice.route.responseHeaders["Access-Control-Allow-Methods"] = [...allow_methods].join(",");
        } else {
          logger.debug("CORS: No allow_methods present. Allowing only GET, OPTIONS and POST");
          microservice.route.responseHeaders["Access-Control-Allow-Methods"] = "GET, OPTIONS, POST";
        }
        if (typeof allow_headers !== "undefined") {
          logger.debug(`CORS: allow_headers present. Allowing ${allow_headers}...`);
          microservice.route.responseHeaders["Access-Control-Allow-Headers"] = [...allow_headers].join(",");
        } else {
          logger.debug(`CORS: No allow_headers present. Allowing all headers...`);
          microservice.route.responseHeaders["Access-Control-Allow-Headers"] = "*";
        }
      } else {
        logger.debug("No CORS validation available. You can specify cors in CONFIG.backend.routes[].cors");
      }
    }
    head(formData){this.done();}
    post(formData){this.done();}
    put(formData){this.done();}
    delete(formData){this.done();}
    connect(formData){this.done();}
    options(formData){this.done();}
    trace(formData){this.done();}
    patch(formData){this.done();}
    finishWithBody(stream){
      try {
        stream.write(JSON.stringify(this.body));
        stream.end();
      } catch (e){
        logger.debug(`Something wrong writing the response for microservice: ${e}`);
        throw Error(e);
      }
    }
    done(){
      var microservice = this;
      var stream = microservice.stream;
      try {
        stream.writeHead(200, microservice.headers);
      } catch (e){
        logger.debug(`Something went wront while sending headers in http... ${e}`);
        throw Error(e);
      }
      if (microservice.body != null){
        microservice.finishWithBody.call(microservice,stream);
      }
    }



  },

  class HTTPServerResponse extends InheritClass {
    constructor ({
      headers={
        "status": 200,
        "content-type": "text/html"
      },
      body = "",
      request = null,
      fileDispatcher = null,
      stream = null
    }) {
      super(...arguments);
      var self = this;
      self.stream = stream;
      self._generateResponse();

    }

    sendFile(stream, fileName) {
      // read and send file content in the stream

      try {
        console.log("trying to read "+ fileName);
        const fd = fs.openSync(fileName, "r");
        const stat = fs.fstatSync(fd);
        const headers = {
          "content-length": stat.size,
          "last-modified": stat.mtime.toUTCString(),
          "content-type": mime.getType(fileName),
          "cache-control": CONFIG.get("cacheControl", "max-age=31536000")
        };
        logger.debug("closing file " + fileName);
        fs.closeSync(fd);
        stream.setHeader("content-length", headers["content-length"]);
        stream.setHeader("last-modified", headers["last-modified"]);
        stream.setHeader("content-type", headers["content-type"]);
        stream.setHeader("cache-control", headers["cache-control"]);

        // This line opens the file as a readable stream
        var readStream = fs.createReadStream(fileName);

        // This will wait until we know the readable stream is actually valid before piping
        readStream.on("open", function () {
          // This just pipes the read stream to the response object (which goes to the client)
          readStream.pipe(stream);
        });

        readStream.on("end",function (){
          stream.end();
        });

        // This catches any errors that happen while creating the readable stream (usually invalid names)
        readStream.on("error", function(err) {
          const headers = {
            "status": 500,
            "content-type": mime.getType(fileName)
          };
          stream.setHeader("content-type", headers["content-type"]);
          stream.setHeader("status", headers["status"]);
          stream.write(`<h1>500 - INTERNAL SERVER ERROR</h1>
            <p>${err}</p>
          `);

          stream.end(err);
        });

      } catch (e){
        if (e.errno==-2){
          const headers = {
            "status": 404,
            "content-type": mime.getType(fileName)
          };
          stream.setHeader("content-type", headers["content-type"]);
          stream.setHeader("status", headers["status"]);
          stream.write("<h1>404 - FILE NOT FOUND</h1>");
          stream.on("close", () => {
            logger.debug("closing file " + fileName);
          });
          stream.end();
        }
      }
    }
    _generateResponse(){
      var response = this;
      response.fileDispatcher = New(FileDispatcher,{
        scriptname:response.request.scriptname,
        pathname:response.request.pathname,
        done(headers,body,templateURI,isTemplate){
          response.headers = headers;
          var stream = response.stream;
          if (isTemplate){
            response.body = body;
            Object.keys(headers).map((header)=>stream.setHeader(header, headers[header]));
            stream.write(response.body);
            stream.end();
          } else if (headers["status"] == 200 || headers[":status"] == 200) {
            response.sendFile(stream, templateURI);
          } else {
            Object.keys(headers).map((header)=>stream.setHeader(header, headers[header]));
            stream.end();
          }
        }
      });

    }

  },

  class HTTPServerRequest extends InheritClass {
    constructor({
      scriptname = "",
      path = "",
      method = "",
      url = "",
      headers = null,
      flags = null,
      protocol = null,
      slashes = null,
      auth = null,
      host = null,
      port = null,
      hostname = null,
      hash = null,
      search = "",
      query = "",
      pathname = "",
      href = ""
    }) {
      super(...arguments);
    }
  },

  class HTTPServer extends InheritClass {
    constructor({
      request = null,
      response = "",
      server = null,
      scriptname = "",
      interceptorInstances = []
    }) {
      super(...arguments);

      const welcometo = "Welcome to \n";
      const instructions = "QCObjects Legacy HTTPServer \n";
      const logo = " .d88888b.  .d8888b.  .d88888b. 888       d8b                888            \r\nd88P\" \"Y88bd88P  Y88bd88P\" \"Y88b888       Y8P                888            \r\n888     888888    888888     888888                          888            \r\n888     888888       888     88888888b.  8888 .d88b.  .d8888b888888.d8888b  \r\n888     888888       888     888888 \"88b \"888d8P  Y8bd88P\"   888   88K      \r\n888 Y8b 888888    888888     888888  888  88888888888888     888   \"Y8888b. \r\nY88b.Y8b88PY88b  d88PY88b. .d88P888 d88P  888Y8b.    Y88b.   Y88b.      X88 \r\n \"Y888888\"  \"Y8888P\"  \"Y88888P\" 88888P\"   888 \"Y8888  \"Y8888P \"Y888 88888P' \r\n       Y8b                                888                               \r\n                                         d88P                               \r\n                                       888P\"   ";
      console.log(welcometo);
      console.log(logo);
      console.log(instructions);
      logger.debug(this.showIPAddress());
      logger.info("Listening on HTTP PORT: "+CONFIG.get("serverPortHTTP").toString());
      logger.info("Go to: \n"+this.showPossibleURL());
      this.interceptorInstances = interceptorInstances;

      const http = require("http");
      this.server = http.createServer((req, res) => {
        logger.debug("Legacy Server Instantiated.");
      });

      this.server.on("error", (err) => console.error(err));

      if (global.get("backendAvailable")){
        logger.info("Loading backend interceptors...");
        let interceptors = CONFIG.get("backend", {}).interceptors;
        if (typeof interceptors !== "undefined") {
          logger.info("Backend Interceptors Available");
          interceptors.map(interceptor => {
            ImportMicroservice(interceptor.microservice);
            var interceptorClassFactory = ClassFactory(interceptor.microservice + ".Interceptor");
            var interceptorInstance = New(interceptorClassFactory, {
              domain: CONFIG.get("domain"),
              basePath: CONFIG.get("basePath"),
              projectPath: CONFIG.get("projectPath"),
              interceptor: interceptor,
              server: this.server
            });
            this.interceptorInstances.push(interceptorInstance);
          });
        }
      }

      this.server.on("request", (req, res) => {

        let request = Object.assign(New(HTTPServerRequest),require("url").parse(req.url));
        request.headers = req.headers;
        this.request = request;
        this.request.method = req.method;
        this.request.path = req.url;
        this.server.setMaxListeners(9999999999);
        CONFIG.set("backendTimeout",CONFIG.get("backendTimeout") || 20000);
        var timeoutHandler = ()=>{
          // end the stream on timeout
          try {
            if (!res.destroyed){
              logger.info("A timeout occurred..." + CONFIG.get("backendTimeout").toString());
              logger.info("Killing session...");

              res.writeHeader( 500, {
                "content-type": "text/html"
              });
              res.on("error",()=>{});
              res.write("<h1>500 - INTERNAL SERVER ERROR (TIMEOUT)</h1>");
              res.end();
            } else {
              logger.debug("Session was normally finishing...");
            }
          } catch (e) {
            logger.debug(`An unhandled error occurred during timeout catching: ${e}`);
          }
          this.server.removeListener("timeout",timeoutHandler);

        };
        if (!res.destroyed){
          this.server.setTimeout(CONFIG.get("backendTimeout"), timeoutHandler);
        }

        if (this.request.pathname.indexOf(".")<0){
            this.request.scriptname = CONFIG.get("documentRootFileIndex");
        } else {
          this.request.scriptname = this.request.pathname.split("/").reverse()[0];
        }
        this.request.pathname = this.request.pathname.substr(0,this.request.pathname.lastIndexOf("/"));

        logger.debug((new PipeLog()).pipe(this.request));

        if (global.get("backendAvailable")) {
          logger.info("Backend Legacy Microservices Available...");

          logger.info("Loading backend routes...");
          let routes = CONFIG.get("backend", {}).routes;
          let selectedRoute = routes.filter(route => {
            let standardRoutePath = route.path.replace(/{(.*?)}/g, "(?<$1>.*)");
            return (new RegExp(standardRoutePath, "g")).test(request.path);
          });
          if (selectedRoute.length > 0) {
            selectedRoute.map(route => {
              let standardRoutePath = route.path.replace(/{(.*?)}/g, "(?<$1>.*)"); //allowing {param}
              console.log(standardRoutePath);
              let selectedRouteParams = {
                ...[...request.path.matchAll((new RegExp(standardRoutePath, "g")))][0]["groups"]
              };
              ImportMicroservice(route.microservice).then (()=>{
                logger.debug(`Trying to execute ${route.microservice + ".Microservice"}...`);
                var microServiceClassFactory = ClassFactory(route.microservice + ".Microservice");
                if (typeof microServiceClassFactory !== "undefined"){
                  const server = this.server;
                  this.response = New(microServiceClassFactory, {
                    domain: CONFIG.get("domain"),
                    basePath: CONFIG.get("basePath"),
                    projectPath: CONFIG.get("projectPath"),
                    route: route,
                    routeParams: selectedRouteParams,
                    server: server,
                    stream: res,
                    req:req,
                    request: request
                  });
    
                } else {
                  throw Error (`${route.microservice + ".Microservice"} not defined.`);
                }
              }).catch (e=> {
                throw Error (e);
              });
            });
          } else {
            this.response = New(HTTPServerResponse,{
              domain: CONFIG.get("domain"),
              basePath: CONFIG.get("basePath"),
              projectPath: CONFIG.get("projectPath"),              
              server:this.server,
              stream:res,
              req:req,
              request:this.request
            });
          }

        } else {
          // ...

          this.response = New(HTTPServerResponse,{
            server:this.server,
            stream:res,
            req:req,
            request:this.request
          });

        }

      });

    }


    showIPAddress(){
      var _ret_ = "";
      var os = require("os");
      var ifaces = os.networkInterfaces();
      Object.keys(ifaces).forEach(function (iface) {
        ifaces[iface].map(function (ipGroup) {
          _ret_ += iface + ": " + (new PipeLog()).pipe(ipGroup) + "\n";
        });
      });
      return _ret_;
    }
    showPossibleURL(){
      var _ret_ = "";
      var os = require("os");
      var ifaces = os.networkInterfaces();
      Object.keys(ifaces).forEach(function (iface){
        ifaces[iface].map(function (ipGroup){
          if (ipGroup["family"].toLowerCase()=="ipv4"){
            _ret_ += "http://"+ipGroup["address"]+":"+CONFIG.get("serverPortHTTP").toString()+"/\n";
          }
        });
      });
      return _ret_;
    }
    start(){
      var server = this.server;
      server.listen(process.env.PORT || CONFIG.get("serverPortHTTP"));
    }
    
  }

]);
