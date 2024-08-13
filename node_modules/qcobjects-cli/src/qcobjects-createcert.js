#!/usr/bin/env node
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
const absolutePath = path.resolve( __dirname, "./" );
const templatePath = path.resolve( __dirname, "./templates/apps/" )+"/";
const os = require("os");
const isWindows = ()=>{
  return os.platform().toLowerCase().startsWith("win");
};
const isMac = ()=>{
  return os.platform().toLowerCase().startsWith("darwin");
};


require("qcobjects");

require(absolutePath+"/org.quickcorp.qcobjects.defaultsettings.js");

const { execSync } = require("child_process");

class Main extends InheritClass {
  constructor (){
    super(...arguments);
    this.start();
  }

  start (){
    const certificate_provider = CONFIG.get("certificate_provider","self_signed");
    let stdout;
    switch (certificate_provider) {
      case "self_signed":
        // stderr is sent to stderr of parent process
        // you can set options.stdio if you want it to go elsewhere
        if (isWindows()){
          stdout = execSync("openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj \"/CN="+CONFIG.get("domain")+"\"  -keyout "+CONFIG.get("private-key-pem")+" -out "+CONFIG.get("private-cert-pem"));
        } else {
          stdout = execSync("openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN="+CONFIG.get("domain")+"'  -keyout "+CONFIG.get("private-key-pem")+" -out "+CONFIG.get("private-cert-pem"));
        }
        break;
      case "letsencrypt":
        if (isWindows()){
          throw Error("Letsencrypt certificate is not supported in Windows");
        } else {
          var prehook_posthook = "--pre-hook \"service qcobjects stop\" --post-hook=\"service qcobjects start\"";
          stdout = execSync(`certbot -n -d ${CONFIG.get("domain")} certonly --standalone ${prehook_posthook}`);
        }
        break;
      default:
        break;
    }
    
  }
}

let __main__ = new Main();
