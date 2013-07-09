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
/*global define, exports, require */

define(function (require, exports, module) {
    'use strict';
    
    var _languages = {
        'en-US': {
            // commands
            "CMD_COMPRESS_NOW"                  : 'Compress',
            "CMD_ACTIVE_COMPRESS_ON_SAVE"       : 'Compress JS/CSS on save',
            // debug
            "DBG_CONNECTING_TO_NODE"            : "[{0}] Connecting to NODE...",
            "DBG_CONNECTING_TO_NODE_FAIL"       : "[{0}] Failed to connect to NODE",
            "DBG_CONNECTION_TO_NODE_SUCCESS"    : "[{0}] Successful connecting to NODE",
            "DBG_LANGUAGE_DETECTED"             : '[{0}] Language detected: {1}',
            "DBG_LANGUAGE_NOT_FOUND"            : '[{0}] Language {1} not found... setting {1}',
            "DBG_TO_LOAD_NODEEXEC_DOMAIN_SUCCESS" : "[{0}] Success to load node-exec domain {1}",
            "DBG_TO_LOAD_NODEEXEC_DOMAIN_ERROR" : "[{0}] failed to load node-exec domain {1}",
            "DBG_GENERIC_ERROR"                 : "[{0}] error: {1}",
            "DBG_BUILD_SUCCESSFUL"              : "[{0}] building successful...",
            //
            "DLG_JRE_NOT_FOUND_TITLE"           : '[{0}]: JRE not found',
            "DLG_JRE_NOT_FOUND_MSG"             : 'Did not find any installation of Java JRE. This is a prerequisite for the extension brackets-jscompressor. <br> <br> If you want to download and install the Java JRE <a target=\"new\" href=\"{0}\"> click here </ a>.',
            "DLG_ERROR_BUILDING_TITLE"          : "{0} Error",
            "DLG_ERROR_BUILDING_MSG"            : "Error building compress file: {0}"
        },
        'es': {
            // commands
            "CMD_COMPRESS_NOW"                  : 'Comprimir',
            "CMD_ACTIVE_COMPRESS_ON_SAVE"       : "Comprimir JS/CSS al guardar",
            // debug
            "DBG_CONNECTING_TO_NODE"            : "[{0}] Conectando a NODE...",
            "DBG_CONNECTING_TO_NODE_FAIL"       : "[{0}] Falló la conexión con NODE",
            "DBG_CONNECTION_TO_NODE_SUCCESS"    : "[{0}] Éxito conectando con NODE",
            "DBG_LANGUAGE_DETECTED"             : '[{0}] Idioma detectado: {1}',
            "DBG_LANGUAGE_NOT_FOUND"            : '[{0}] Idioma {1} no encontrado... se usará el idioma {1}',
            "DBG_TO_LOAD_NODEEXEC_DOMAIN_SUCCESS" : "[{0}] Éxito al cargar el nodo de ejecución {1}",
            "DBG_TO_LOAD_NODEEXEC_DOMAIN_ERROR" : "[{0}] Falló al cargar el dominio node-exec {1}",
            "DBG_GENERIC_ERROR"                 : "[{0}] error: {1}",
            "DBG_BUILD_SUCCESSFUL"              : "[{0}] construcción exitosa...",
            //
            "DLG_JRE_NOT_FOUND_TITLE"           : '[{0}]: JRE no encontrado',
            "DLG_JRE_NOT_FOUND_MSG"             : 'No se encontró ninguna instalación de la JRE de Java. Este es un requisito indispensable para la extensión brackets-jscompressor.<br><br>Si desea descargar e instalar la JRE de Java haga clic <a target=\"new\" href=\"{0}\"> aquí </a>.',
            "DLG_ERROR_BUILDING_TITLE"          : "Error de {0}",
            "DLG_ERROR_BUILDING_MSG"            : "Error construyendo el archivo comprimido: {0}"
        }
    };
    
    function getLanguage(lang_flag) {
        var def_language = "en-US", _lang = lang_flag.split('-')[0] || lang_flag;
        console.log(_languages[_lang]);
        
        return _languages[_lang] || _languages[def_language];
    }
    
    exports.Strings = getLanguage;
});