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
const fs = require("fs");
const path = require("path");
const absolutePath = path.resolve( __dirname, "./" );
const templatePath = path.resolve( __dirname, "./templates/apps/" )+"/";
const templatePwaPath = path.resolve( __dirname, "./templates/pwa/" )+"/";
const package_config = require(absolutePath+"/../package.json");
const { exec,execSync } = require("child_process");

CONFIG.set("node_modules_path","./node_modules/");
CONFIG.set("qcobjectsnewapp_path",CONFIG.get("node_modules_path")+"/qcobjectsnewapp");

require(absolutePath+"/org.qcobjects.enterprise.commands");
require(absolutePath+"/org.quickcorp.qcobjects.api.client_services");
require(absolutePath+"/com.qcobjects.cli.commands");

let ImportCustomCommand = function (commandName, commandPackage){
  let _ret_;
  var standardPath = findPackageNodePath(commandPackage) || findPackageNodePath(commandPackage+".js");
  if (standardPath !== null){
    _ret_ = Import (commandPackage);
  } else {
    logger.debug(`${commandPackage} is not a valid package for ${commandName}!`);
    _ret_ = Promise.reject(new Error(`${commandName} does not exist!`));
  }
  return _ret_;
};


Package("org.quickcorp.qcobjects.cli",[

  class SwitchCommander extends InheritClass {

    choiceOption = {
      generateSw(_appName, options){
        let dirPrefix = options.dir;
        let switchCommander = this;
        let appName = (typeof _appName ==="undefined" || _appName === true)?("MyAppName"):(_appName);
        switchCommander.generateServiceWorker(appName, dirPrefix);

      },
      create(_appName, options){
        const version = global.__get_version__();
        let switchCommander = this;
        let appName = (typeof _appName ==="undefined" || _appName === true)?("MyAppName"):(_appName);

        let _package_json_content;

        _package_json_content = `{
          "name": "${appName}"
          "version": "1.0.0",
          "dependencies":{
            "qcobjectsnewphp": "latest",
            "qcobjects": "${version.qcobjects}",
            "qcobjects-sdk": "^${version.sdk}"
          }
        }`;

        let createAppCommand;
        let appTemplateName;

        if (options.createAmp){
          appTemplateName = "qcobjects-ecommerce-amp";
        } else if (options.createPwa){
          appTemplateName = "qcobjectsnewapp";
        } else if (options.createPhp){
          appTemplateName = "qcobjectsnewphp";
        } else if (options.createCustom){
          appTemplateName = options.createCustom;
        } else {
          appTemplateName = "qcobjectsnewapp";
        }
        CONFIG.set("qcobjectsnewapp_path",CONFIG.get("node_modules_path")+"/"+appTemplateName);

        let _package_json_template_fname = path.resolve(CONFIG.get("qcobjectsnewapp_path", "qcobjectsnewapp"), "./package.json");

/*          if (!process.platform.toLowerCase().startsWith("win")){
          _package_json_content = _package_json_content.replace(/(")/g, String.fromCharCode(92)+"\"");
        }*/
        
        createAppCommand = "npm init -y";
        let _package_json_file = path.resolve(CONFIG.get("projectPath"),"./package.json");
        logger.debug("_package_json_file: "+_package_json_file);
        logger.debug(createAppCommand);

        exec(createAppCommand, (err, stdout, stderr) => {
          if (err) {
            throw Error (err.message);
            process.exit(1);
            return;
          }

          exec(`npm i --save-dev ${appTemplateName}`, ()=> {
            let _package_json_template_file = require (_package_json_template_fname);
            _package_json_template_file.name = appName;
            _package_json_template_file.version = "1.0.0";
            _package_json_template_file.repository = {};
            fs.writeFileSync(_package_json_file, JSON.stringify(_package_json_template_file,null,4));
            logger.info("Good! App Templates was installed!");

            console.log(`Starting to copy files from app template ${appTemplateName} to your project...`);
  
            switchCommander.copyTemplate(path.resolve(findPackageNodePath(appTemplateName),appTemplateName),path.resolve(CONFIG.get("projectPath"),"./") )
            .then(()=>{

              exec("npm uninstall "+appTemplateName+" --save && npm cache verify",(err,stdout,stderr)=>{
                if (err) {
                  throw Error (err.message);
                  process.exit(1);
                  return;
                }

                /*
                switchCommander.generateServiceWorker(appName)
                .then(()=>{
                  execSync("npm install --save-dev qcobjects-cli ");
                });
                */
                execSync("npm install --save-dev qcobjects-cli ");
              });
        
              exec("npm cache verify && npm i ", (err, stdout, stderr) => {
                if (err) {
                  throw Error (err.message);
                  process.exit(1);
                  return;
                }
  
                logger.info("Good! Your application is done. You can play with QCObjects now!");
                  
                logger.info("I will create the SSL certificates now. It may take some time...");
                exec("qcobjects-createcert",(err,stdout,stderr)=>{
                  logger.info("Test certificates generated");

                  let githubService = New(Service);
                  githubService.url= "https://raw.githubusercontent.com/QuickCorp/QCObjects/main/.gitignore";
                  githubService.headers= {
                    Accept: 'application/vnd.github+json',
                    'X-GitHub-Api-Version': '2022-11-28',
                    'User-Agent': 'qcobjects-cli'
                  };
                  githubService.done = ()=>{};
                  serviceLoader(githubService)
                  .then (({service})=> {
                    fs.writeFileSync(path.resolve(CONFIG.get("projectPath"),"./.gitignore"),service.template);
                    try {
                      execSync("git init");
                      logger.debug("Git initialized.");
                    } catch (e){
                      logger.debug("Could not initialize git.");
                    }
                  });

                }).stdout.on("data", function(data) {
                    console.log(data);
                });
  
              }).stdout.on("data", function(data) {
                  console.log(data);
              });
  
            })
            .catch((e)=>{
              console.log(e);
            });
  
  
          }).stdout.on("data", function(data) {
            console.log(data);
          });

        }).stdout.on("data", function(data) {
            console.log("App generation started...");
        });

      },
      publish(_appName){
        logger.debug("publish is not yet implemented");
      },
      upgradeToEnterprise (){
        let switchCommander = this;
        QCObjectsEnterprise.upgrade(switchCommander);
      }
    };

    constructor (){
      super(...arguments);
      this.program = require("commander");
    }

    shellCommands(_shell_commands){
      return new Promise(function (resolve_all,reject_all){
        var _promises_set = _shell_commands.map(
          function (shell_command){
            return (new Promise(
            function (resolve,reject){
              logger.debug(shell_command);
              exec(shell_command,(err,stdout,stderr)=>{
                if (!err){
                  resolve(stdout);
                } else {
                  logger.debug(`[FAILED]: ${shell_command}`);
                  logger.debug(`${stderr}`);
                  reject(stderr);
                }
              }).stdout.on("data", function(data) {
                  logger.info(data);
              });
            })).catch(e=>reject_all(e));
          }
        );
        var _promise_all = Promise.all(_promises_set).then(function (response){
          resolve_all(response);
        }).catch(function (e){
          reject_all(e);
        });
      }).catch(e=>console.log(e));
    }

    fileListRecursive (dir) {
        var instance = this;
        return (fs.statSync(dir).isDirectory())
            ? (Array.prototype.concat(...fs.readdirSync(dir).map(f =>instance.fileListRecursive(path.join(dir, f))))
            .filter((f)=>{return !f.startsWith(".git")
              && f.lastIndexOf(".DS_Store")==-1;
            })
          )
            : (dir);
    }

    register(email,phonenumber){
      return new Promise (function (resolve,reject){
        logger.info("I'm going to register your profile on the cloud...");
        let cloudClient = New(QuickCorpCloud, {
          apiMethod: "register",
          data:{email:email,phonenumber:phonenumber}
        });
//        logger.debugEnabled = true;
        try {
          let service = serviceLoader(cloudClient).then(successResonse => {
            let template = successResonse.service.template;
            let response = JSON.parse(template);
            resolve(response);
          }).catch ((e)=>{
            console.log("\u{1F926} Something went wrong \u{1F926} when trying to register you in the cloud");
            reject();
          });
        } catch (e){
          console.log("\u{1F926} Something went wrong \u{1F926} when trying to register you in the cloud");
          reject();
        }

      });
    }

    generateServiceWorker(appName, dirPrefix = "./"){
      const writeContent = (component) => {
        const parsedText = component.parseTemplate(component.template);
        logger.debug("Starting to write the sw file...");
        fs.writeFile(`${dirPrefix}/sw.js`, parsedText , (err) => {
          if (err){
            throw Error (err);
          }
          logger.info("Service Worker Generated");
          console.log("");
          console.log("Now simply put:");
          console.log("CONFIG.set('serviceWorkerURI','/sw.js');");
          console.log(" In your init.js file ");
          console.log("");
          console.log("To start your app in a local server ");
          console.log("Execute the command: ");
          console.log("> qcobjects launch <appname>");
          console.log("");
        });

      };


      class ServiceWorkerComponent extends Component {
        cached = false;
        templateURI= "sw.js";
        basePath = templatePwaPath;
        name ="sw";
        tplsource= "default";
        template = "";

        done ({request, component}){
          super.done({request, component});
          writeContent(this);
        }
      }

      return new Promise( (resolve, reject) => {
        var filelist = ["/"].concat(this.fileListRecursive(`${dirPrefix}`));
        if (typeof dirPrefix !== "undefined" && dirPrefix !== "./" && dirPrefix !== "."){
          filelist = filelist.map(f=>f.replace(new RegExp(`${dirPrefix}/`), ""));
        }
        filelist = filelist.filter(function (fl){return fl !== "sw.js" && (!fl.startsWith("node_modules/")); });
        filelist = filelist.filter(fname => !fname.endsWith(".pem"));
        filelist = filelist.filter(fname => !fname.endsWith(".sh"));
        filelist = filelist.filter(fname => !(new RegExp("^package(.*).json$")).test(fname));
        filelist = filelist.filter(fname => !fname.startsWith("."));
        var fileListString = "\n\t\""+filelist.join("\",\n\t\"")+"\"";
        let component;

        new Promise ((resolve, reject)=> {
            component = new ServiceWorkerComponent({
              name: "sw",
              data: {
                appName: appName,
                appVersion: "1.0.0",
                filelist: fileListString
              }
            });
            setTimeout(()=> {
              component.done({request:null, component});
            }, 1000);
        });
      });
    }

    copyTemplate(source, dest){
      return new Promise ((resolve, reject)=> {

        const copyDir = (source, dest, exclude) => {
          source = path.resolve(source);
          dest = path.resolve(dest);
          const dname = path.basename(source);
          const dirExcluded = (exclude.includes(dname));

          const isDir = (d) => {
            return (fs.existsSync(d) && fs.statSync(d).isDirectory())?(true):(false);
          };

          const isFile = (d) => {
            return (fs.existsSync(d) && fs.statSync(d).isFile())?(true):(false);
          }

          if (isDir(source) && !dirExcluded){
            fs.mkdirSync(dest, {recursive:true});
            const paths = fs.readdirSync(source, {withFileTypes:true})
            const dirs = paths.filter(d=>d.isDirectory());
            const files = paths.filter(f=>f.isFile());
            (async function (paths, dirs, files, exclude){
              files.map((f)=>{
                const sourceFile = path.resolve(source, f.name);
                const destFile = path.resolve(dest, f.name);
                const fileExcluded = exclude.includes(f.name);
                if (isFile(sourceFile) && !fileExcluded){
                  logger.debug(`[publish:static] Copying files from ${sourceFile} to ${destFile} excluding ${exclude}...`);
                  fs.copyFileSync(sourceFile, destFile);
                  logger.debug(`[publish:static] Copying files from ${sourceFile} to ${destFile} excluding ${exclude}...DONE!`);
                }
              });
              dirs.map((d)=>{
                const sourceDir = path.resolve(source, d.name);
                const destDir = path.resolve(dest, d.name);
                copyDir(sourceDir,destDir, exclude);
              });
            })(paths, dirs, files, exclude);
          }

        };

        try {
          const exclude = [
            "package.json",
            "node_modules",
            ".DS_Store"
          ]
          logger.info(`[create] Copying files from ${source} to ${dest} excluding ${exclude}...`);
          copyDir(source, dest, (typeof exclude !== "undefined") ? (exclude) : ([]));
          resolve();
        } catch (e) {
          logger.warn(`Something went wrong trying to publish static files: ${e.message}`);
          reject(e);
        }
        
      });

    }

    initCommand(){
      let switchCommander = this;
      if (process.argv.length>1){
        logger.debug("Installing Commands...");

        switchCommander.program
          .version(global.__get_version_string__());
        switchCommander.program
          .command("create <appname>")
          .description("Creates an app with <appname>")
          .option("--pwa, --create-pwa", "Creates the progressive web app assets")
          .option("--amp, --create-amp", "Creates the accelerated mobile pages assets")
          .option("--php, --create-php", "Creates the PWA PHP assets")
          .option("--custom, --create-custom <templateappname>", "Creates an App from any NPM package template")
          .option("--tests, --create-tests", "Creates the test suite")
          .action(function(args, options){
              switchCommander.choiceOption.create.call(switchCommander,args,options);
          });


          try {
            logger.debug("Loading Plugin Commands...");
            const importPluginCommands = function (switchCommander){
              return global.ClassesList
              .filter(c=>c.packageName.startsWith("com.qcobjects.cli.commands."))
              .filter(p=>p.classFactory.name.endsWith("CommandHandler"))
              .map(pluginCommand => {
                try {
                  logger.debug(`Loading plugin ${pluginCommand.packageName}`);
                  const classFactory = pluginCommand.classFactory;
                  pluginCommand.plugin = New(classFactory,{switchCommander:switchCommander});
                } catch (e){
                  throw Error(`Something went wrong loading ${pluginCommand.packageName}`);
                }
                return pluginCommand;
              });
            };
            importPluginCommands(switchCommander);  
          } catch (e){
            throw Error (`Something went wrong loading plugins: ${e.message}`);
          }

        switchCommander.program.command("publish <appname>")
          .description("Publishes an app with <appname>")
          .option("--pwa, --create-pwa", "Publishes the progressive web app assets")
          .option("--amp, --create-amp", "Publishes the accelerated mobile pages assets")
          .option("--php, --create-php", "Creates the PWA PHP assets")
          .option("--custom, --create-custom", "Creates an App from any NPM package template")
          .option("--tests, --create-tests", "Publishes the test suite")
          .action(function(args, options){
              switchCommander.choiceOption.publish.call(switchCommander,args,options);
          });

        switchCommander.program.command("upgrade-to-enterprise")
          .description("Upgrades to QCObjects Enterprise Edition")
          .action(function(args, options){
              switchCommander.choiceOption.upgradeToEnterprise.call(switchCommander,args,options);
          });
        switchCommander.program.command("generate-sw <appname>")
          .option("-d, --dir <dirPrefix> ", "creates the service worker in a specific dir <dirPrefix>")
          .description("Generates the service worker <appname>")
          .action(function(args, options){
              switchCommander.choiceOption.generateSw.call(switchCommander,args,options);
          });
        switchCommander.program.command("launch <appname>")
          .description("Launches the application")
          .action(function (args,options){
            logger.info("Launching...");
            setTimeout(()=>{
              logger.info("Go to the browser and open https://localhost ");
              logger.info("Press Ctrl-C to stop serving ");
              exec("qcobjects-server",(err,stdout,stderr)=>{
              }).stdout.on("data", function(data) {
                  console.log(data);
              });
            },5000);
  //          setTimeout(()=>{
  //            execSync("open -a \"google chrome\" https://localhost");
  //          },6000);

          });

          switchCommander.program.on("--help", function(){
            console.log("");
            console.log("Use:");
            console.log("  $ qcobjects-cli [command] --help");
            console.log("  For detailed information of a command ");
            console.log("");
            process.exit(0);
          });

          switchCommander.program.on("command:*", function () {
            console.error("Invalid command: %s\nSee --help for a list of available commands.", switchCommander.program.args.join(" "));
            process.exit(1);
          });
          switchCommander.program.parse(process.argv);
        } else {
          console.log("");
          console.log("Use:");
          console.log("  $ qcobjects-cli [command] --help");
          console.log("  For detailed information of a command ");
          console.log("");
          process.exit(0);

        }

    }

  }

]);
