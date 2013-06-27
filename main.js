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
//        Commands = brackets.getModule("command/Commands"),
//        KeyBindingManager = brackets.getModule("command/KeyBindingManager"),
//        EditorManager = brackets.getModule("editor/EditorManager"),
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
            
            var command = "java -jar '" + compressor_path + "' -o '" + dst + "'  '" + src + "'";

            console.log('[brackets-jscompressor] execute: ' + command);
            
            nodeConnection.domains.nodeexec.runScript(command, null, {
                cwd: getExtensionPath()
            });
//                .fail(function (err) {
//                    console.log("[brackets-jscompressor] error: " + err.toString());
//                    
//                    var dialog = Dialogs.showModalDialog(
//                        Dialogs.DIALOG_ID_ERROR,
//                        "Run Script Error",
//                        "The test file contained an error: " + err.toString()
//                    );
//                });
        }
    };
            
    jscompressor.is_active_autocompress = prefStorage.getValue("enabled");
            
    var autocompress_cmd, compressfile_cmd;
    
    // Regiter autocompress command
    autocompress_cmd = CommandManager.register("Autocomprimir", "ext.autocompress_cmd", function () {
        jscompressor.is_active_autocompress = !jscompressor.is_active_autocompress;
        var command = CommandManager.get("ext.autocompress_cmd");
        if (!command) {
            return;
        }
                
        command.setChecked(jscompressor.is_active_autocompress);
        prefStorage.setValue("enabled", jscompressor.is_active_autocompress);
        PreferencesManager.savePreferences();
                
        if (jscompressor.is_active_autocompress) {
            alert("Ha activado la autocompresión de archivos.\r\n\r\nLa función de autocompresión permite comprimir automáticamente el archivo js/css usando el reconocido compresor YUI en archivos optimizados para la publicación en la web.\r\n\r\nEl resultado será un segundo archivo con el nombre *.min.js/*-min.css en el mismo directorio del archivo original.");
        }
    });
    
    // Register compress file command
    compressfile_cmd = CommandManager.register("Comprimir...", "ext.compressfile_cmd", jscompressor.compressfile);
                
//    var c = Menus.getContextMenu(Menus.ContextMenuIds.PROJECT_MENU);
                
    if (projectMenu) {
        projectMenu.addMenuDivider();
//        projectMenu.addMenuItem("ext.autocompress_cmd");
        projectMenu.addMenuItem("ext.compressfile_cmd");
    }
            
//    $(DocumentManager).on("documentSaved", function (evt, entry) {
//        if (jscompressor.is_active_autocompress) {
//            var extfile = entry.file.name.split(".").pop();
//            for (extfile in jscompressor.extensions) {
//                if (jscompressor.extensions.hasOwnProperty(extfile)) {
//                    var B = entry.file.fullPath.replace(".js", ".css");
//                }
//            }
//        }
//    });
                
//    function isValidFile(entry) {
//        var pos, extfile = "";
//        if (entry && entry.isFile) {
//            extfile = entry.name.split(".").pop();
//            for (pos in jscompressor.extensions) {
//                if (jscompressor.extensions.hasOwnProperty(pos)) {
//                    if (jscompressor.extensions[pos] === extfile) {
//                        return true;
//                    }
//                }
//            }
//        }
//                
//        return false;
//    }

    $(projectMenu).on("beforeContextMenuOpen", function (B) {
        var selectedItem = ProjectManager.getSelectedItem(), D;
        compressfile_cmd.setEnabled(false);
        
        console.log(/^(\w+)(\.(js|css))$/.test(selectedItem.name));
        
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
            
            console.info("[brackets-jscompressor] load: " + nodeModule);
            
            nodeDomains.fail(function () {
                console.log("[brackets-jscompressor] failed to load node-exec domain");
                
                var dialog = Dialogs.showModalDialog(
                    Dialogs.DIALOG_ID_ERROR,
                    "Error de cargando módulo de " + jscompressor.name,
                    "No se pudo cargar el módulo NodeExecDomain."
                );
            });
            
            return nodeDomains;
        }
        
        // update status (working) function
        $(nodeConnection)
            .on("nodeexec.update", function (domain, err) {
                var error = JSON.parse(err); // parsing json from node js
            
                if (error.err) { // if compressing process fail
                    var dialog = Dialogs.showModalDialog(
                        Dialogs.DIALOG_ID_ERROR,
                        "Error de construyendo de " + jscompressor.name,
                        "Se generó el siguiente error: " + err.stderr
                    );
                }
                
                ProjectManager.refreshFileTree(); // refresh file tree to see new file
            });
        
        // load in chain
        chain(connectNode, loadNodeModule);
    });
});