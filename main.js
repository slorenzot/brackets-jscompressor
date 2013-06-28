/*
 * Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 * brackets-jscompressor - a brackets plugin to run scripts
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, brackets, $, window, exports, require */

define(function (require, exports, module) {
    'use strict';
    var AppInit = brackets.getModule("utils/AppInit"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        Dialogs = brackets.getModule("widgets/Dialogs"),
        DocumentManager = brackets.getModule("document/DocumentManager"),
        CommandManager = brackets.getModule("command/CommandManager"),
        PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
        ProjectManager = brackets.getModule("project/ProjectManager"),
        Menus = brackets.getModule("command/Menus"),
        NodeConnection = brackets.getModule("utils/NodeConnection");
    
    var projectMenu = Menus.getContextMenu(Menus.ContextMenuIds.PROJECT_MENU),
        workingsetMenu = Menus.getContextMenu(Menus.ContextMenuIds.WORKING_SET_MENU),
        nodeConnection = null;
            
    var EXTENSION_ID = "com.adobe.brackets.jscompressor",
        o = "bracketless.enabled",
        prefStorage = PreferencesManager.getPreferenceStorage(EXTENSION_ID);
    
    function getExtensionPath() {
        var selectedItem = ProjectManager.getSelectedItem();
        var file_cwd = selectedItem.fullPath.split('/');
        file_cwd.pop();
        return file_cwd.join('/');
    }
    
    var jscompressor = {
        name: 'Brackets JSCompressor',
        is_active_autocompress : prefStorage.getValue("enabled"),
        extensions: ["js", "css"],
        compressed_extension: "-min.",
        compressor_relpath: '/compressor/yuicompressor-2.4.2.jar',
        getCompressorPath: function () {
            return getExtensionPath() + this.compressor_relpath;
        },
        autocompress: function () {
            alert("Activa la compresión automática de archivo js/css");
        },
        compressfile: function () {
            var selectedItem = ProjectManager.getSelectedItem();

            if (selectedItem === null) {
                selectedItem = DocumentManager.getCurrentDocument().file;
            }
            
            var compressor_path = jscompressor.getCompressorPath(), // get path to compressor
                src = selectedItem.fullPath,
                filename = src.split('.').shift(), // full filename without extension
                new_ext = jscompressor.compressed_extension + src.split('.').pop(), // only new extension file
                dst = filename + new_ext; // compressed filepath (path + filename + new extension)
            
            var command = "/usr/bin/java -jar '" + compressor_path + "' -o '" + dst + "' '" + src + "'";
            
            nodeConnection.domains.nodeexec.runScript(command, null, {
                cwd: getExtensionPath()
            });
        }
    };
            
    jscompressor.is_active_autocompress = prefStorage.getValue("enabled");
            
    var autocompress_cmd, compressfile_cmd;
    
    // Regiter autocompress command
    autocompress_cmd = CommandManager.register("Comprimir al guardar", "ext.autocompress_cmd", function () {
        jscompressor.is_active_autocompress = !jscompressor.is_active_autocompress;
        var command = CommandManager.get("ext.autocompress_cmd");
//        if (!command) {
//            return;
//        }
                
        command.setChecked(jscompressor.is_active_autocompress);
        prefStorage.setValue("enabled", jscompressor.is_active_autocompress);
        PreferencesManager.savePreferences();
    });
    
    var menu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
    
    if (menu) {
        menu.addMenuDivider();
        menu.addMenuItem("ext.autocompress_cmd");
    }
    
    // Register compress file command
    compressfile_cmd = CommandManager.register("Comprimir...", "ext.compressfile_cmd", jscompressor.compressfile);
                
    if (projectMenu) {
        projectMenu.addMenuDivider();
        projectMenu.addMenuItem("ext.compressfile_cmd");
    }
            
    $(DocumentManager).on("documentSaved", function (evt, entry) {
        if (jscompressor.is_active_autocompress) {
            jscompressor.compressfile();
        }
    });

    $(projectMenu).on("beforeContextMenuOpen", function (B) {
        var selectedItem = ProjectManager.getSelectedItem(), D;
        compressfile_cmd.setEnabled(false);
        
        if (selectedItem.isFile && /^(\w+)(\.(js|css))$/.test(selectedItem.name)) {
            compressfile_cmd.setEnabled(true);
        }
    });
            
    function chain() {
        var functions = Array.prototype.slice.call(arguments, 0);
        
        if (functions.length > 0) {
            var currentFunction = functions.shift(),
                callee = currentFunction.call();

            callee.done(function () {
                chain.apply(null, functions);
            });
        }
    }
    
//    console.log(String);
    
    // extension main function
    AppInit.appReady(function () {
        nodeConnection = new NodeConnection(); // connect NodeJS
        
        function connectNode() {
            var node = nodeConnection.connect(true);
            
            console.info("[brackets-jscompressor] Connecting to NODE...");
            
            node.fail(function () {
                console.error("[brackets-jscompressor] failed to connect to node");
            });
            
            return node;
        }
        
        // load NodeJS module
        function loadNodeModule() {
            var nodeModule = ExtensionUtils.getModulePath(module, 'node/NodeExecDomain');
            var nodeDomains = nodeConnection.loadDomains([nodeModule], true);
            
            nodeDomains.fail(function () {
                console.log("[brackets-jscompressor] failed to load node-exec domain");
            });
            
            console.info("[brackets-jscompressor] loaded " + nodeModule);
            
            return nodeDomains;
        }
        
        // update status (working) function
        $(nodeConnection)
            .on("nodeexec.update", function (domain, err) {
                var error = JSON.parse(err); // parsing json from node js
            
                if (error.stderr) { // if compressing process fail
                    console.error(error.stderr);
                    
                    var dialog = Dialogs.showModalDialog(
                        Dialogs.DIALOG_ID_ERROR,
                        "Error de construyendo de " + jscompressor.name,
                        "Se generó el siguiente error: " + error.stderr
                    );
                } else {
                    console.info("[brackets-jscompressor] processed successful...");
                }
                
                ProjectManager.refreshFileTree(); // refresh file tree to see new file
            });
        
        // load in chain
        chain(connectNode, loadNodeModule);
    });
});