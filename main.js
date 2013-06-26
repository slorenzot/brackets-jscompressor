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
        x = null;
            
    var EXTENSION_ID = "com.adobe.brackets.jscompressor",
        o = "bracketless.enabled",
        prefStorage = PreferencesManager.getPreferenceStorage(EXTENSION_ID);
    
    var jscompressor = {
        is_active_autocompress : prefStorage.getValue("enabled"),
        extensions: ["js", "css"],
        compressed_extensions: [".min.js", ".min.css"],
        isValidFile: function (B) {
            return true;
        },
        autocompress: function () {
            alert("Activa la compresión automática de archivo js/css");
        },
        compressfile: function () {
            var B = ProjectManager.getSelectedItem();
            if (B === null) {
                B = DocumentManager.getCurrentDocument().file;
            }
            
            var C = B.fullPath;
            x.domains.nodeexec.runScript(C, null, {
                module_path: module.uri.replace("main.js", "")
            })
                .fail(function (err) {
                    console.log("[brackets-jscompressor] error: " + err.toString());
                    
                    var dialog = Dialogs.showModalDialog(
                        Dialogs.DIALOG_ID_ERROR,
                        "Run Script Error",
                        "The test file contained an error: " + err.toString()
                    );
                });
        }
    };
            
    jscompressor.is_active_autocompress = prefStorage.getValue("enabled");
            
    var autocompress_cmd, compressfile_cmd;
            
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
    
    compressfile_cmd = CommandManager.register("Construir *.min.js", "ext.compressfile_cmd", jscompressor.compressfile);
                
//    var c = Menus.getContextMenu(Menus.ContextMenuIds.PROJECT_MENU);
                
    if (projectMenu) {
        projectMenu.addMenuDivider();
        projectMenu.addMenuItem("ext.autocompress_cmd");
        projectMenu.addMenuItem("ext.compressfile_cmd");
    }
            
    $(DocumentManager).on("documentSaved", function (evt, entry) {
//        if (jscompressor.is_active_autocompress) {
//            var extfile = entry.file.name.split(".").pop();
//            for (extfile in jscompressor.extensions) {
//                if (jscompressor.extensions.hasOwnProperty(extfile)) {
//                    var B = entry.file.fullPath.replace(".js", ".css");
//                }
//            }
//        }
    });
                
    function isValidFile(entry) {
        var pos, extfile = "";
        if (entry && entry.isFile) {
            extfile = entry.name.split(".").pop();
            for (pos in jscompressor.extensions) {
                if (jscompressor.extensions.hasOwnProperty(pos)) {
                    if (jscompressor.extensions[pos] === extfile) {
                        return true;
                    }
                }
            }
        }
                
        return false;
    }
            
    $(projectMenu).on("beforeContextMenuOpen", function (B) {
        var selectedItem = ProjectManager.getSelectedItem(), D;
        compressfile_cmd.setEnabled(false);
        
        if (isValidFile(selectedItem)) {
            compressfile_cmd.setEnabled(true);
        }
    });
            
    function chain() {
        var C = Array.prototype.slice.call(arguments, 0);
        if (C.length > 0) {
            var B = C.shift();
            var D = B.call();
            D.done(function () {
                chain.apply(null, C);
            });
        }
    }
    
    AppInit.appReady(function () {
        x = new NodeConnection();
        
        function B() {
            var D = x.connect(true);
            D.fail(function () {
                console.error("[brackets-jscompressor] failed to connect to node");
            });
            
            return D;
        }
        
        function C() {
            var E = ExtensionUtils.getModulePath(module, "node/NodeExecDomain");
            var D = x.loadDomains([E], true);
            D.fail(function () {
                console.log("[brackets-jscompressor] failed to load node-exec domain");
            });
            
            return D;
        }
        
        $(x).on("nodeexec.update", function (D, E) {
            console.log(E);
        });
        
        chain(B, C);
    });
});