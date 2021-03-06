/*
 * Copyright (c) 2013 Soulberto Lorenzo <slorenzot@gmail.com>
 *
 * Licensed under MIT
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
    
    var NodeConnection  = brackets.getModule("utils/NodeConnection"),
        StringUtils     = brackets.getModule("utils/StringUtils"),
        ExtensionUtils  = brackets.getModule("utils/ExtensionUtils"),
        Commands        = require('Commands'),
        Languages       = require("Strings");
    
    var _nodeConnection  = null,
        _node            = null,
        langs           = Languages.Strings(brackets.app.language); // get app correct language
    
     // connect to Node
    function connectNode() {
        _node = _nodeConnection.connect(true);
        
        console.info(StringUtils.format(langs.DBG_CONNECTING_TO_NODE, Commands.EXTENSION_ID));
        
        _node
            .fail(function () {
                console.error(StringUtils.format(langs.DBG_CONNECTING_TO_NODE_FAIL, Commands.EXTENSION_ID));
            })
            .done(function () {
                console.info(StringUtils.format(langs.DBG_CONNECTION_TO_NODE_SUCCESS, Commands.EXTENSION_ID));
            });
        
        return _node;
    }
    
    // load NodeJS module
    function loadNodeModule(nodeExecDomain) {
        var nodepath = ExtensionUtils.getModulePath(module, nodeExecDomain),
            nodeDomains = _nodeConnection.loadDomains([nodepath], true);
        
        nodeDomains
            .fail(function () {
                console.log(StringUtils.format(
                    langs.DBG_TO_LOAD_NODEEXEC_DOMAIN_ERROR,
                    Commands.EXTENSION_ID,
                    nodepath
                ));
            })
            .done(function () {
                console.info(StringUtils.format(
                    langs.DBG_TO_LOAD_NODEEXEC_DOMAIN_SUCCESS,
                    Commands.EXTENSION_ID,
                    nodepath
                ));
            });
        
        return nodeDomains;
    }
    
    // private function for chaining process (functions)
    function _chain() {
        var functions = Array.prototype.slice.call(arguments, 0);
        
        if (functions.length > 0) {
            var currentFunction = functions.shift(),
                callee = currentFunction.call();

            callee.done(function () {
                _chain.apply(null, functions);
            });
        }
    }
    
    _nodeConnection = new NodeConnection(); // connect NodeJS
    
    function getNode(nodeExec) {
        _chain(connectNode, loadNodeModule);
    }
    
    exports.node = _node;
    exports.load = loadNodeModule;
    exports.connect = connectNode;
    exports.getNode = getNode;
});