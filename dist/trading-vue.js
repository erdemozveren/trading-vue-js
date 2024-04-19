/*!
 * TradingVue.JS - v1.0.2 - Sat Apr 20 2024
 *     https://github.com/tvjsx/trading-vue-js
 *     Copyright (c) 2019 C451 Code's All Right;
 *     Licensed under the MIT license
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["TradingVueJs"] = factory();
	else
		root["TradingVueJs"] = factory();
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 62:
/***/ ((module) => {

/**
 * Utility compare functions
 */

module.exports = {

    /**
     * Compare two numbers.
     *
     * @param {Number} a
     * @param {Number} b
     * @returns {Number} 1 if a > b, 0 if a = b, -1 if a < b
     */
    numcmp: function (a, b) {
        return a - b;
    },

    /**
     * Compare two strings.
     *
     * @param {Number|String} a
     * @param {Number|String} b
     * @returns {Number} 1 if a > b, 0 if a = b, -1 if a < b
     */
    strcmp: function (a, b) {
        return a < b ? -1 : a > b ? 1 : 0;
    }

};


/***/ }),

/***/ 74:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Indexed Array Binary Search module
 */

/**
 * Dependencies
 */
var util = __webpack_require__(396),
    cmp = __webpack_require__(62),
    bin = __webpack_require__(874);

/**
 * Module interface definition
 */
module.exports = IndexedArray;

/**
 * Indexed Array constructor
 *
 * It loads the array data, defines the index field and the comparison function
 * to be used.
 *
 * @param {Array} data is an array of objects
 * @param {String} index is the object's property used to search the array
 */
function IndexedArray(data, index) {

    // is data sortable array or array-like object?
    if (!util.isSortableArrayLike(data))
        throw new Error("Invalid data");

    // is index a valid property?
    if (!index || data.length > 0 && !(index in data[0]))
        throw new Error("Invalid index");

    // data array
    this.data = data;

    // name of the index property
    this.index = index;

    // set index boundary values
    this.setBoundaries();

    // default comparison function
    this.compare = typeof this.minv === "number" ? cmp.numcmp : cmp.strcmp;

    // default search function
    this.search = bin.search;

    // cache of index values to array positions
    // each value stores an object as { found: true|false, index: array-index }
    this.valpos = {};

    // cursor and adjacent positions
    this.cursor = null;
    this.nextlow = null;
    this.nexthigh = null;
}

/**
 * Set the comparison function
 *
 * @param {Function} fn to compare index values that returnes 1, 0, -1
 */
IndexedArray.prototype.setCompare = function (fn) {
    if (typeof fn !== "function")
        throw new Error("Invalid argument");

    this.compare = fn;
    return this;
};

/**
 * Set the search function
 *
 * @param {Function} fn to search index values in the array of objects
 */
IndexedArray.prototype.setSearch = function (fn) {
    if (typeof fn !== "function")
        throw new Error("Invalid argument");

    this.search = fn;
    return this;
};

/**
 * Sort the data array by its index property
 */
IndexedArray.prototype.sort = function () {
    var self = this,
        index = this.index;

    // sort the array
    this.data.sort(function (a, b) {
        return self.compare(a[index], b[index]);
    });

    // recalculate boundary values
    this.setBoundaries();

    return this;
};

/**
 * Inspect and set the boundaries of the internal data array
 */
IndexedArray.prototype.setBoundaries = function () {
    var data = this.data,
        index = this.index;

    this.minv = data.length && data[0][index];
    this.maxv = data.length && data[data.length - 1][index];

    return this;
};

/**
 * Get the position of the object corresponding to the given index
 *
 * @param {Number|String} index is the id of the requested object
 * @returns {Number} the position of the object in the array
 */
IndexedArray.prototype.fetch = function (value) {
    // check data has objects
    if (this.data.length === 0) {
        this.cursor = null;
        this.nextlow = null;
        this.nexthigh = null;
        return this;
    }

    // check the request is within range
    if (this.compare(value, this.minv) === -1) {
        this.cursor = null;
        this.nextlow = null;
        this.nexthigh = 0;
        return this;
    }
    if (this.compare(value, this.maxv) === 1) {
        this.cursor = null;
        this.nextlow = this.data.length - 1;
        this.nexthigh = null;
        return this;
    }

    var valpos = this.valpos,
        pos = valpos[value];

    // if the request is memorized, just give it back
    if (pos) {
        if (pos.found) {
            this.cursor = pos.index;
            this.nextlow = null;
            this.nexthigh = null;
        } else {
            this.cursor = null;
            this.nextlow = pos.prev;
            this.nexthigh = pos.next;
        }
        return this;
    }

    // if not, do the search
    var result = this.search.call(this, value);
    this.cursor = result.index;
    this.nextlow = result.prev;
    this.nexthigh = result.next;
    return this;
};

/**
 * Get the object corresponding to the given index
 *
 * When no value is given, the function will default to the last fetched item.
 *
 * @param {Number|String} [optional] index is the id of the requested object
 * @returns {Object} the found object or null
 */
IndexedArray.prototype.get = function (value) {
    if (value)
        this.fetch(value);

    var pos = this.cursor;
    return pos !== null ? this.data[pos] : null;
};

/**
 * Get an slice of the data array
 *
 * Boundaries have to be in order.
 *
 * @param {Number|String} begin index is the id of the requested object
 * @param {Number|String} end index is the id of the requested object
 * @returns {Object} the slice of data array or []
 */
IndexedArray.prototype.getRange = function (begin, end) {
    // check if boundaries are in order
    if (this.compare(begin, end) === 1) {
        return [];
    }

    // fetch start and default to the next index above
    this.fetch(begin);
    var start = this.cursor || this.nexthigh;

    // fetch finish and default to the next index below
    this.fetch(end);
    var finish = this.cursor || this.nextlow;

    // if any boundary is not set, return no range
    if (start === null || finish === null) {
        return [];
    }

    // return range
    return this.data.slice(start, finish + 1);
};


/***/ }),

/***/ 874:
/***/ ((module) => {

/**
 * Binary search implementation
 */

/**
 * Main search recursive function
 */
function loop(data, min, max, index, valpos) {

    // set current position as the middle point between min and max
    var curr = (max + min) >>> 1;

    // compare current index value with the one we are looking for
    var diff = this.compare(data[curr][this.index], index);

    // found?
    if (!diff) {
        return valpos[index] = {
            "found": true,
            "index": curr,
            "prev": null,
            "next": null
        };
    }

    // no more positions available?
    if (min >= max) {
        return valpos[index] = {
            "found": false,
            "index": null,
            "prev": (diff < 0) ? max : max - 1,
            "next": (diff < 0) ? max + 1 : max
        };
    }

    // continue looking for index in one of the remaining array halves
    // current position can be skept as index is not there...
    if (diff > 0)
        return loop.call(this, data, min, curr - 1, index, valpos);
    else
        return loop.call(this, data, curr + 1, max, index, valpos);
}

/**
 * Search bootstrap
 * The function has to be executed in the context of the IndexedArray object
 */
function search(index) {
    var data = this.data;
    return loop.call(this, data, 0, data.length - 1, index, this.valpos);
}

/**
 * Export search function
 */
module.exports.search = search;


/***/ }),

/***/ 396:
/***/ ((module) => {

/**
 * Utils module
 */

/**
 * Check if an object is an array-like object
 *
 * @credit Javascript: The Definitive Guide, O'Reilly, 2011
 */
function isArrayLike(o) {
    if (o &&                                 // o is not null, undefined, etc.
        typeof o === "object" &&             // o is an object
        isFinite(o.length) &&                // o.length is a finite number
        o.length >= 0 &&                     // o.length is non-negative
        o.length === Math.floor(o.length) && // o.length is an integer
        o.length < 4294967296)               // o.length < 2^32
        return true;                         // Then o is array-like
    else
        return false;                        // Otherwise it is not
}

/**
 * Check for the existence of the sort function in the object
 */
function isSortable(o) {
    if (o &&                                 // o is not null, undefined, etc.
        typeof o === "object" &&             // o is an object
        typeof o.sort === "function")        // o.sort is a function
        return true;                         // Then o is array-like
    else
        return false;                        // Otherwise it is not
}

/**
 * Check for sortable-array-like objects
 */
module.exports.isSortableArrayLike = function (o) {
    return isArrayLike(o) && isSortable(o);
};


/***/ }),

/***/ 955:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(314);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n/* Anit-boostrap tactix */\n.trading-vue *, .trading-vue *::after, .trading-vue *::before {\n    box-sizing: content-box;\n}\n.trading-vue img {\n    vertical-align: initial;\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 520:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(314);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-botbar {\n    position: relative !important;\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 882:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(314);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.t-vue-lbtn-grp {\n    margin-left: 0.5em;\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 841:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(314);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.tvjs-item-list {\n    position: absolute;\n    user-select: none;\n    margin-top: -5px;\n}\n.tvjs-item-list-item {\n    display: flex;\n    align-items: center;\n    padding-right: 20px;\n    font-size: 1.15em;\n    letter-spacing: 0.05em;\n}\n.tvjs-item-list-item:hover {\n    background-color: #76878319;\n}\n.tvjs-item-list-item * {\n    position: relative !important;\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 866:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(314);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-legend {\n  position: relative;\n  z-index: 100;\n  font-size: 1.25em;\n  margin-left: 10px;\n  pointer-events: none;\n  text-align: left;\n  user-select: none;\n  font-weight: 300;\n}\n@media (min-resolution: 2x) {\n.trading-vue-legend {\n    font-weight: 400;\n}\n}\n.trading-vue-ohlcv {\n  pointer-events: none;\n  margin-bottom: 0.5em;\n}\n.t-vue-lspan {\n  font-variant-numeric: tabular-nums;\n  font-size: 0.95em;\n  color: #999999; /* TODO: move => params */\n  margin-left: 0.1em;\n  margin-right: 0.2em;\n}\n.t-vue-title {\n  margin-right: 0.25em;\n  font-size: 1.45em;\n}\n.t-vue-ind {\n  margin-left: 0.2em;\n  margin-bottom: 0.5em;\n  font-size: 1em;\n  margin-top: 0.3em;\n}\n.t-vue-ivalue {\n  margin-left: 0.5em;\n}\n.t-vue-unknown {\n  color: #999999; /* TODO: move => params */\n}\n.tvjs-appear-enter-active,\n.tvjs-appear-leave-active {\n  transition: all 0.25s ease;\n}\n.tvjs-appear-enter,\n.tvjs-appear-leave-to {\n  opacity: 0;\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 673:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(314);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.t-vue-lbtn {\n    z-index: 100;\n    pointer-events: all;\n    cursor: pointer;\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 812:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(314);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-section {\n    height: 0;\n    position: absolute;\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 407:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(314);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.tvjs-spinner {\n    display: inline-block;\n    position: relative;\n    width: 20px;\n    height: 16px;\n    margin: -4px 0px -1px 0px;\n    opacity: 0.7;\n}\n.tvjs-spinner div {\n    position: absolute;\n    top: 8px;\n    width: 4px;\n    height: 4px;\n    border-radius: 50%;\n    animation-timing-function: cubic-bezier(1, 1, 1, 1);\n}\n.tvjs-spinner div:nth-child(1) {\n    left: 2px;\n    animation: tvjs-spinner1 0.6s infinite;\n    opacity: 0.9;\n}\n.tvjs-spinner div:nth-child(2) {\n    left: 2px;\n    animation: tvjs-spinner2 0.6s infinite;\n}\n.tvjs-spinner div:nth-child(3) {\n    left: 9px;\n    animation: tvjs-spinner2 0.6s infinite;\n}\n.tvjs-spinner div:nth-child(4) {\n    left: 16px;\n    animation: tvjs-spinner3 0.6s infinite;\n    opacity: 0.9;\n}\n@keyframes tvjs-spinner1 {\n0% {\n        transform: scale(0);\n}\n100% {\n        transform: scale(1);\n}\n}\n@keyframes tvjs-spinner3 {\n0% {\n        transform: scale(1);\n}\n100% {\n        transform: scale(0);\n}\n}\n@keyframes tvjs-spinner2 {\n0% {\n        transform: translate(0, 0);\n}\n100% {\n        transform: translate(7px, 0);\n}\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 64:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(314);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.tvjs-drift-enter-active {\n    transition: all .3s ease;\n}\n.tvjs-drift-leave-active {\n    transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);\n}\n.tvjs-drift-enter, .tvjs-drift-leave-to\n{\n    transform: translateX(10px);\n    opacity: 0;\n}\n.tvjs-the-tip {\n    position: absolute;\n    width: 200px;\n    text-align: center;\n    z-index: 10001;\n    color: #ffffff;\n    font-size: 1.5em;\n    line-height: 1.15em;\n    padding: 10px;\n    border-radius: 3px;\n    right: 70px;\n    top: 10px;\n    text-shadow: 1px 1px black;\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 268:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(314);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-toolbar {\n    position: absolute;\n    border-right: 1px solid black;\n    z-index: 101;\n    padding-top: 3px;\n    user-select: none;\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 108:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(314);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-tbitem {\n}\n.trading-vue-tbitem:hover {\n    background-color: #76878319;\n}\n.trading-vue-tbitem-exp {\n    position: absolute;\n    right: -3px;\n    padding: 18.5px 5px;\n    font-stretch: extra-condensed;\n    transform: scaleX(0.6);\n    font-size: 0.6em;\n    opacity: 0.0;\n    user-select: none;\n    line-height: 0;\n}\n.trading-vue-tbitem:hover\n.trading-vue-tbitem-exp {\n    opacity: 0.5;\n}\n.trading-vue-tbitem-exp:hover {\n    background-color: #76878330;\n    opacity: 0.9 !important;\n}\n.trading-vue-tbicon {\n    position: absolute;\n}\n.trading-vue-tbitem.selected-item > .trading-vue-tbicon,\n.tvjs-item-list-item.selected-item > .trading-vue-tbicon {\n     filter: brightness(1.45) sepia(1) hue-rotate(90deg) saturate(4.5) !important;\n}\n.tvjs-pixelated {\n    -ms-interpolation-mode: nearest-neighbor;\n    image-rendering: -webkit-optimize-contrast;\n    image-rendering: -webkit-crisp-edges;\n    image-rendering: -moz-crisp-edges;\n    image-rendering: -o-crisp-edges;\n    image-rendering: pixelated;\n}\n\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 727:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(314);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-ux-wrapper {\n    position: absolute;\n    display: flex;\n}\n.tvjs-ux-wrapper-pin {\n    position: absolute;\n    width: 9px;\n    height: 9px;\n    z-index: 100;\n    background-color: #23a776;\n    border-radius: 10px;\n    margin-left: -6px;\n    margin-top: -6px;\n    pointer-events: none;\n}\n.tvjs-ux-wrapper-head {\n    position: absolute;\n    height: 23px;\n    width: 100%;\n}\n.tvjs-ux-wrapper-close {\n    position: absolute;\n    width: 11px;\n    height: 11px;\n    font-size: 1.5em;\n    line-height: 0.5em;\n    padding: 1px 1px 1px 1px;\n    border-radius: 10px;\n    right: 5px;\n    top: 5px;\n    user-select: none;\n    text-align: center;\n    z-index: 100;\n}\n.tvjs-ux-wrapper-close-hb {\n}\n.tvjs-ux-wrapper-close:hover {\n    background-color: #FF605C !important;\n    color: #692324 !important;\n}\n.tvjs-ux-wrapper-full {\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 175:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(314);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.tvjs-widgets {\n    position: absolute;\n    z-index: 1000;\n    pointer-events: none;\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 314:
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names
module.exports = function (useSourceMap) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item, useSourceMap);

      if (item[2]) {
        return "@media ".concat(item[2], " {").concat(content, "}");
      }

      return content;
    }).join('');
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery, dedupe) {
    if (typeof modules === 'string') {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, '']];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var i = 0; i < this.length; i++) {
        // eslint-disable-next-line prefer-destructuring
        var id = this[i][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = [].concat(modules[_i]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (mediaQuery) {
        if (!item[2]) {
          item[2] = mediaQuery;
        } else {
          item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
        }
      }

      list.push(item);
    }
  };

  return list;
};

function cssWithMappingToString(item, useSourceMap) {
  var content = item[1] || ''; // eslint-disable-next-line prefer-destructuring

  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (useSourceMap && typeof btoa === 'function') {
    var sourceMapping = toComment(cssMapping);
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || '').concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
  }

  return [content].join('\n');
} // Adapted from convert-source-map (MIT)


function toComment(sourceMap) {
  // eslint-disable-next-line no-undef
  var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
  var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
  return "/*# ".concat(data, " */");
}

/***/ }),

/***/ 168:
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;/*! Hammer.JS - v2.0.7 - 2016-04-22
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2016 Jorik Tangelder;
 * Licensed under the MIT license */
(function(window, document, exportName, undefined) {
  'use strict';

var VENDOR_PREFIXES = ['', 'webkit', 'Moz', 'MS', 'ms', 'o'];
var TEST_ELEMENT = document.createElement('div');

var TYPE_FUNCTION = 'function';

var round = Math.round;
var abs = Math.abs;
var now = Date.now;

/**
 * set a timeout with a given scope
 * @param {Function} fn
 * @param {Number} timeout
 * @param {Object} context
 * @returns {number}
 */
function setTimeoutContext(fn, timeout, context) {
    return setTimeout(bindFn(fn, context), timeout);
}

/**
 * if the argument is an array, we want to execute the fn on each entry
 * if it aint an array we don't want to do a thing.
 * this is used by all the methods that accept a single and array argument.
 * @param {*|Array} arg
 * @param {String} fn
 * @param {Object} [context]
 * @returns {Boolean}
 */
function invokeArrayArg(arg, fn, context) {
    if (Array.isArray(arg)) {
        each(arg, context[fn], context);
        return true;
    }
    return false;
}

/**
 * walk objects and arrays
 * @param {Object} obj
 * @param {Function} iterator
 * @param {Object} context
 */
function each(obj, iterator, context) {
    var i;

    if (!obj) {
        return;
    }

    if (obj.forEach) {
        obj.forEach(iterator, context);
    } else if (obj.length !== undefined) {
        i = 0;
        while (i < obj.length) {
            iterator.call(context, obj[i], i, obj);
            i++;
        }
    } else {
        for (i in obj) {
            obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj);
        }
    }
}

/**
 * wrap a method with a deprecation warning and stack trace
 * @param {Function} method
 * @param {String} name
 * @param {String} message
 * @returns {Function} A new function wrapping the supplied method.
 */
function deprecate(method, name, message) {
    var deprecationMessage = 'DEPRECATED METHOD: ' + name + '\n' + message + ' AT \n';
    return function() {
        var e = new Error('get-stack-trace');
        var stack = e && e.stack ? e.stack.replace(/^[^\(]+?[\n$]/gm, '')
            .replace(/^\s+at\s+/gm, '')
            .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@') : 'Unknown Stack Trace';

        var log = window.console && (window.console.warn || window.console.log);
        if (log) {
            log.call(window.console, deprecationMessage, stack);
        }
        return method.apply(this, arguments);
    };
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} target
 * @param {...Object} objects_to_assign
 * @returns {Object} target
 */
var assign;
if (typeof Object.assign !== 'function') {
    assign = function assign(target) {
        if (target === undefined || target === null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var output = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source !== undefined && source !== null) {
                for (var nextKey in source) {
                    if (source.hasOwnProperty(nextKey)) {
                        output[nextKey] = source[nextKey];
                    }
                }
            }
        }
        return output;
    };
} else {
    assign = Object.assign;
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} dest
 * @param {Object} src
 * @param {Boolean} [merge=false]
 * @returns {Object} dest
 */
var extend = deprecate(function extend(dest, src, merge) {
    var keys = Object.keys(src);
    var i = 0;
    while (i < keys.length) {
        if (!merge || (merge && dest[keys[i]] === undefined)) {
            dest[keys[i]] = src[keys[i]];
        }
        i++;
    }
    return dest;
}, 'extend', 'Use `assign`.');

/**
 * merge the values from src in the dest.
 * means that properties that exist in dest will not be overwritten by src
 * @param {Object} dest
 * @param {Object} src
 * @returns {Object} dest
 */
var merge = deprecate(function merge(dest, src) {
    return extend(dest, src, true);
}, 'merge', 'Use `assign`.');

/**
 * simple class inheritance
 * @param {Function} child
 * @param {Function} base
 * @param {Object} [properties]
 */
function inherit(child, base, properties) {
    var baseP = base.prototype,
        childP;

    childP = child.prototype = Object.create(baseP);
    childP.constructor = child;
    childP._super = baseP;

    if (properties) {
        assign(childP, properties);
    }
}

/**
 * simple function bind
 * @param {Function} fn
 * @param {Object} context
 * @returns {Function}
 */
function bindFn(fn, context) {
    return function boundFn() {
        return fn.apply(context, arguments);
    };
}

/**
 * let a boolean value also be a function that must return a boolean
 * this first item in args will be used as the context
 * @param {Boolean|Function} val
 * @param {Array} [args]
 * @returns {Boolean}
 */
function boolOrFn(val, args) {
    if (typeof val == TYPE_FUNCTION) {
        return val.apply(args ? args[0] || undefined : undefined, args);
    }
    return val;
}

/**
 * use the val2 when val1 is undefined
 * @param {*} val1
 * @param {*} val2
 * @returns {*}
 */
function ifUndefined(val1, val2) {
    return (val1 === undefined) ? val2 : val1;
}

/**
 * addEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function addEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.addEventListener(type, handler, false);
    });
}

/**
 * removeEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function removeEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.removeEventListener(type, handler, false);
    });
}

/**
 * find if a node is in the given parent
 * @method hasParent
 * @param {HTMLElement} node
 * @param {HTMLElement} parent
 * @return {Boolean} found
 */
function hasParent(node, parent) {
    while (node) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

/**
 * small indexOf wrapper
 * @param {String} str
 * @param {String} find
 * @returns {Boolean} found
 */
function inStr(str, find) {
    return str.indexOf(find) > -1;
}

/**
 * split string on whitespace
 * @param {String} str
 * @returns {Array} words
 */
function splitStr(str) {
    return str.trim().split(/\s+/g);
}

/**
 * find if a array contains the object using indexOf or a simple polyFill
 * @param {Array} src
 * @param {String} find
 * @param {String} [findByKey]
 * @return {Boolean|Number} false when not found, or the index
 */
function inArray(src, find, findByKey) {
    if (src.indexOf && !findByKey) {
        return src.indexOf(find);
    } else {
        var i = 0;
        while (i < src.length) {
            if ((findByKey && src[i][findByKey] == find) || (!findByKey && src[i] === find)) {
                return i;
            }
            i++;
        }
        return -1;
    }
}

/**
 * convert array-like objects to real arrays
 * @param {Object} obj
 * @returns {Array}
 */
function toArray(obj) {
    return Array.prototype.slice.call(obj, 0);
}

/**
 * unique array with objects based on a key (like 'id') or just by the array's value
 * @param {Array} src [{id:1},{id:2},{id:1}]
 * @param {String} [key]
 * @param {Boolean} [sort=False]
 * @returns {Array} [{id:1},{id:2}]
 */
function uniqueArray(src, key, sort) {
    var results = [];
    var values = [];
    var i = 0;

    while (i < src.length) {
        var val = key ? src[i][key] : src[i];
        if (inArray(values, val) < 0) {
            results.push(src[i]);
        }
        values[i] = val;
        i++;
    }

    if (sort) {
        if (!key) {
            results = results.sort();
        } else {
            results = results.sort(function sortUniqueArray(a, b) {
                return a[key] > b[key];
            });
        }
    }

    return results;
}

/**
 * get the prefixed property
 * @param {Object} obj
 * @param {String} property
 * @returns {String|Undefined} prefixed
 */
function prefixed(obj, property) {
    var prefix, prop;
    var camelProp = property[0].toUpperCase() + property.slice(1);

    var i = 0;
    while (i < VENDOR_PREFIXES.length) {
        prefix = VENDOR_PREFIXES[i];
        prop = (prefix) ? prefix + camelProp : property;

        if (prop in obj) {
            return prop;
        }
        i++;
    }
    return undefined;
}

/**
 * get a unique id
 * @returns {number} uniqueId
 */
var _uniqueId = 1;
function uniqueId() {
    return _uniqueId++;
}

/**
 * get the window object of an element
 * @param {HTMLElement} element
 * @returns {DocumentView|Window}
 */
function getWindowForElement(element) {
    var doc = element.ownerDocument || element;
    return (doc.defaultView || doc.parentWindow || window);
}

var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;

var SUPPORT_TOUCH = ('ontouchstart' in window);
var SUPPORT_POINTER_EVENTS = prefixed(window, 'PointerEvent') !== undefined;
var SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);

var INPUT_TYPE_TOUCH = 'touch';
var INPUT_TYPE_PEN = 'pen';
var INPUT_TYPE_MOUSE = 'mouse';
var INPUT_TYPE_KINECT = 'kinect';

var COMPUTE_INTERVAL = 25;

var INPUT_START = 1;
var INPUT_MOVE = 2;
var INPUT_END = 4;
var INPUT_CANCEL = 8;

var DIRECTION_NONE = 1;
var DIRECTION_LEFT = 2;
var DIRECTION_RIGHT = 4;
var DIRECTION_UP = 8;
var DIRECTION_DOWN = 16;

var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;

var PROPS_XY = ['x', 'y'];
var PROPS_CLIENT_XY = ['clientX', 'clientY'];

/**
 * create new input type manager
 * @param {Manager} manager
 * @param {Function} callback
 * @returns {Input}
 * @constructor
 */
function Input(manager, callback) {
    var self = this;
    this.manager = manager;
    this.callback = callback;
    this.element = manager.element;
    this.target = manager.options.inputTarget;

    // smaller wrapper around the handler, for the scope and the enabled state of the manager,
    // so when disabled the input events are completely bypassed.
    this.domHandler = function(ev) {
        if (boolOrFn(manager.options.enable, [manager])) {
            self.handler(ev);
        }
    };

    this.init();

}

Input.prototype = {
    /**
     * should handle the inputEvent data and trigger the callback
     * @virtual
     */
    handler: function() { },

    /**
     * bind the events
     */
    init: function() {
        this.evEl && addEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && addEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && addEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    },

    /**
     * unbind the events
     */
    destroy: function() {
        this.evEl && removeEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && removeEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && removeEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    }
};

/**
 * create new input type manager
 * called by the Manager constructor
 * @param {Hammer} manager
 * @returns {Input}
 */
function createInputInstance(manager) {
    var Type;
    var inputClass = manager.options.inputClass;

    if (inputClass) {
        Type = inputClass;
    } else if (SUPPORT_POINTER_EVENTS) {
        Type = PointerEventInput;
    } else if (SUPPORT_ONLY_TOUCH) {
        Type = TouchInput;
    } else if (!SUPPORT_TOUCH) {
        Type = MouseInput;
    } else {
        Type = TouchMouseInput;
    }
    return new (Type)(manager, inputHandler);
}

/**
 * handle input events
 * @param {Manager} manager
 * @param {String} eventType
 * @param {Object} input
 */
function inputHandler(manager, eventType, input) {
    var pointersLen = input.pointers.length;
    var changedPointersLen = input.changedPointers.length;
    var isFirst = (eventType & INPUT_START && (pointersLen - changedPointersLen === 0));
    var isFinal = (eventType & (INPUT_END | INPUT_CANCEL) && (pointersLen - changedPointersLen === 0));

    input.isFirst = !!isFirst;
    input.isFinal = !!isFinal;

    if (isFirst) {
        manager.session = {};
    }

    // source event is the normalized value of the domEvents
    // like 'touchstart, mouseup, pointerdown'
    input.eventType = eventType;

    // compute scale, rotation etc
    computeInputData(manager, input);

    // emit secret event
    manager.emit('hammer.input', input);

    manager.recognize(input);
    manager.session.prevInput = input;
}

/**
 * extend the data with some usable properties like scale, rotate, velocity etc
 * @param {Object} manager
 * @param {Object} input
 */
function computeInputData(manager, input) {
    var session = manager.session;
    var pointers = input.pointers;
    var pointersLength = pointers.length;

    // store the first input to calculate the distance and direction
    if (!session.firstInput) {
        session.firstInput = simpleCloneInputData(input);
    }

    // to compute scale and rotation we need to store the multiple touches
    if (pointersLength > 1 && !session.firstMultiple) {
        session.firstMultiple = simpleCloneInputData(input);
    } else if (pointersLength === 1) {
        session.firstMultiple = false;
    }

    var firstInput = session.firstInput;
    var firstMultiple = session.firstMultiple;
    var offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center;

    var center = input.center = getCenter(pointers);
    input.timeStamp = now();
    input.deltaTime = input.timeStamp - firstInput.timeStamp;

    input.angle = getAngle(offsetCenter, center);
    input.distance = getDistance(offsetCenter, center);

    computeDeltaXY(session, input);
    input.offsetDirection = getDirection(input.deltaX, input.deltaY);

    var overallVelocity = getVelocity(input.deltaTime, input.deltaX, input.deltaY);
    input.overallVelocityX = overallVelocity.x;
    input.overallVelocityY = overallVelocity.y;
    input.overallVelocity = (abs(overallVelocity.x) > abs(overallVelocity.y)) ? overallVelocity.x : overallVelocity.y;

    input.scale = firstMultiple ? getScale(firstMultiple.pointers, pointers) : 1;
    input.rotation = firstMultiple ? getRotation(firstMultiple.pointers, pointers) : 0;

    input.maxPointers = !session.prevInput ? input.pointers.length : ((input.pointers.length >
        session.prevInput.maxPointers) ? input.pointers.length : session.prevInput.maxPointers);

    computeIntervalInputData(session, input);

    // find the correct target
    var target = manager.element;
    if (hasParent(input.srcEvent.target, target)) {
        target = input.srcEvent.target;
    }
    input.target = target;
}

function computeDeltaXY(session, input) {
    var center = input.center;
    var offset = session.offsetDelta || {};
    var prevDelta = session.prevDelta || {};
    var prevInput = session.prevInput || {};

    if (input.eventType === INPUT_START || prevInput.eventType === INPUT_END) {
        prevDelta = session.prevDelta = {
            x: prevInput.deltaX || 0,
            y: prevInput.deltaY || 0
        };

        offset = session.offsetDelta = {
            x: center.x,
            y: center.y
        };
    }

    input.deltaX = prevDelta.x + (center.x - offset.x);
    input.deltaY = prevDelta.y + (center.y - offset.y);
}

/**
 * velocity is calculated every x ms
 * @param {Object} session
 * @param {Object} input
 */
function computeIntervalInputData(session, input) {
    var last = session.lastInterval || input,
        deltaTime = input.timeStamp - last.timeStamp,
        velocity, velocityX, velocityY, direction;

    if (input.eventType != INPUT_CANCEL && (deltaTime > COMPUTE_INTERVAL || last.velocity === undefined)) {
        var deltaX = input.deltaX - last.deltaX;
        var deltaY = input.deltaY - last.deltaY;

        var v = getVelocity(deltaTime, deltaX, deltaY);
        velocityX = v.x;
        velocityY = v.y;
        velocity = (abs(v.x) > abs(v.y)) ? v.x : v.y;
        direction = getDirection(deltaX, deltaY);

        session.lastInterval = input;
    } else {
        // use latest velocity info if it doesn't overtake a minimum period
        velocity = last.velocity;
        velocityX = last.velocityX;
        velocityY = last.velocityY;
        direction = last.direction;
    }

    input.velocity = velocity;
    input.velocityX = velocityX;
    input.velocityY = velocityY;
    input.direction = direction;
}

/**
 * create a simple clone from the input used for storage of firstInput and firstMultiple
 * @param {Object} input
 * @returns {Object} clonedInputData
 */
function simpleCloneInputData(input) {
    // make a simple copy of the pointers because we will get a reference if we don't
    // we only need clientXY for the calculations
    var pointers = [];
    var i = 0;
    while (i < input.pointers.length) {
        pointers[i] = {
            clientX: round(input.pointers[i].clientX),
            clientY: round(input.pointers[i].clientY)
        };
        i++;
    }

    return {
        timeStamp: now(),
        pointers: pointers,
        center: getCenter(pointers),
        deltaX: input.deltaX,
        deltaY: input.deltaY
    };
}

/**
 * get the center of all the pointers
 * @param {Array} pointers
 * @return {Object} center contains `x` and `y` properties
 */
function getCenter(pointers) {
    var pointersLength = pointers.length;

    // no need to loop when only one touch
    if (pointersLength === 1) {
        return {
            x: round(pointers[0].clientX),
            y: round(pointers[0].clientY)
        };
    }

    var x = 0, y = 0, i = 0;
    while (i < pointersLength) {
        x += pointers[i].clientX;
        y += pointers[i].clientY;
        i++;
    }

    return {
        x: round(x / pointersLength),
        y: round(y / pointersLength)
    };
}

/**
 * calculate the velocity between two points. unit is in px per ms.
 * @param {Number} deltaTime
 * @param {Number} x
 * @param {Number} y
 * @return {Object} velocity `x` and `y`
 */
function getVelocity(deltaTime, x, y) {
    return {
        x: x / deltaTime || 0,
        y: y / deltaTime || 0
    };
}

/**
 * get the direction between two points
 * @param {Number} x
 * @param {Number} y
 * @return {Number} direction
 */
function getDirection(x, y) {
    if (x === y) {
        return DIRECTION_NONE;
    }

    if (abs(x) >= abs(y)) {
        return x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
    }
    return y < 0 ? DIRECTION_UP : DIRECTION_DOWN;
}

/**
 * calculate the absolute distance between two points
 * @param {Object} p1 {x, y}
 * @param {Object} p2 {x, y}
 * @param {Array} [props] containing x and y keys
 * @return {Number} distance
 */
function getDistance(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];

    return Math.sqrt((x * x) + (y * y));
}

/**
 * calculate the angle between two coordinates
 * @param {Object} p1
 * @param {Object} p2
 * @param {Array} [props] containing x and y keys
 * @return {Number} angle
 */
function getAngle(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];
    return Math.atan2(y, x) * 180 / Math.PI;
}

/**
 * calculate the rotation degrees between two pointersets
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} rotation
 */
function getRotation(start, end) {
    return getAngle(end[1], end[0], PROPS_CLIENT_XY) + getAngle(start[1], start[0], PROPS_CLIENT_XY);
}

/**
 * calculate the scale factor between two pointersets
 * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} scale
 */
function getScale(start, end) {
    return getDistance(end[0], end[1], PROPS_CLIENT_XY) / getDistance(start[0], start[1], PROPS_CLIENT_XY);
}

var MOUSE_INPUT_MAP = {
    mousedown: INPUT_START,
    mousemove: INPUT_MOVE,
    mouseup: INPUT_END
};

var MOUSE_ELEMENT_EVENTS = 'mousedown';
var MOUSE_WINDOW_EVENTS = 'mousemove mouseup';

/**
 * Mouse events input
 * @constructor
 * @extends Input
 */
function MouseInput() {
    this.evEl = MOUSE_ELEMENT_EVENTS;
    this.evWin = MOUSE_WINDOW_EVENTS;

    this.pressed = false; // mousedown state

    Input.apply(this, arguments);
}

inherit(MouseInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function MEhandler(ev) {
        var eventType = MOUSE_INPUT_MAP[ev.type];

        // on start we want to have the left mouse button down
        if (eventType & INPUT_START && ev.button === 0) {
            this.pressed = true;
        }

        if (eventType & INPUT_MOVE && ev.which !== 1) {
            eventType = INPUT_END;
        }

        // mouse must be down
        if (!this.pressed) {
            return;
        }

        if (eventType & INPUT_END) {
            this.pressed = false;
        }

        this.callback(this.manager, eventType, {
            pointers: [ev],
            changedPointers: [ev],
            pointerType: INPUT_TYPE_MOUSE,
            srcEvent: ev
        });
    }
});

var POINTER_INPUT_MAP = {
    pointerdown: INPUT_START,
    pointermove: INPUT_MOVE,
    pointerup: INPUT_END,
    pointercancel: INPUT_CANCEL,
    pointerout: INPUT_CANCEL
};

// in IE10 the pointer types is defined as an enum
var IE10_POINTER_TYPE_ENUM = {
    2: INPUT_TYPE_TOUCH,
    3: INPUT_TYPE_PEN,
    4: INPUT_TYPE_MOUSE,
    5: INPUT_TYPE_KINECT // see https://twitter.com/jacobrossi/status/480596438489890816
};

var POINTER_ELEMENT_EVENTS = 'pointerdown';
var POINTER_WINDOW_EVENTS = 'pointermove pointerup pointercancel';

// IE10 has prefixed support, and case-sensitive
if (window.MSPointerEvent && !window.PointerEvent) {
    POINTER_ELEMENT_EVENTS = 'MSPointerDown';
    POINTER_WINDOW_EVENTS = 'MSPointerMove MSPointerUp MSPointerCancel';
}

/**
 * Pointer events input
 * @constructor
 * @extends Input
 */
function PointerEventInput() {
    this.evEl = POINTER_ELEMENT_EVENTS;
    this.evWin = POINTER_WINDOW_EVENTS;

    Input.apply(this, arguments);

    this.store = (this.manager.session.pointerEvents = []);
}

inherit(PointerEventInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function PEhandler(ev) {
        var store = this.store;
        var removePointer = false;

        var eventTypeNormalized = ev.type.toLowerCase().replace('ms', '');
        var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
        var pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;

        var isTouch = (pointerType == INPUT_TYPE_TOUCH);

        // get index of the event in the store
        var storeIndex = inArray(store, ev.pointerId, 'pointerId');

        // start and mouse must be down
        if (eventType & INPUT_START && (ev.button === 0 || isTouch)) {
            if (storeIndex < 0) {
                store.push(ev);
                storeIndex = store.length - 1;
            }
        } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
            removePointer = true;
        }

        // it not found, so the pointer hasn't been down (so it's probably a hover)
        if (storeIndex < 0) {
            return;
        }

        // update the event in the store
        store[storeIndex] = ev;

        this.callback(this.manager, eventType, {
            pointers: store,
            changedPointers: [ev],
            pointerType: pointerType,
            srcEvent: ev
        });

        if (removePointer) {
            // remove from the store
            store.splice(storeIndex, 1);
        }
    }
});

var SINGLE_TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var SINGLE_TOUCH_TARGET_EVENTS = 'touchstart';
var SINGLE_TOUCH_WINDOW_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Touch events input
 * @constructor
 * @extends Input
 */
function SingleTouchInput() {
    this.evTarget = SINGLE_TOUCH_TARGET_EVENTS;
    this.evWin = SINGLE_TOUCH_WINDOW_EVENTS;
    this.started = false;

    Input.apply(this, arguments);
}

inherit(SingleTouchInput, Input, {
    handler: function TEhandler(ev) {
        var type = SINGLE_TOUCH_INPUT_MAP[ev.type];

        // should we handle the touch events?
        if (type === INPUT_START) {
            this.started = true;
        }

        if (!this.started) {
            return;
        }

        var touches = normalizeSingleTouches.call(this, ev, type);

        // when done, reset the started state
        if (type & (INPUT_END | INPUT_CANCEL) && touches[0].length - touches[1].length === 0) {
            this.started = false;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function normalizeSingleTouches(ev, type) {
    var all = toArray(ev.touches);
    var changed = toArray(ev.changedTouches);

    if (type & (INPUT_END | INPUT_CANCEL)) {
        all = uniqueArray(all.concat(changed), 'identifier', true);
    }

    return [all, changed];
}

var TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var TOUCH_TARGET_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Multi-user touch events input
 * @constructor
 * @extends Input
 */
function TouchInput() {
    this.evTarget = TOUCH_TARGET_EVENTS;
    this.targetIds = {};

    Input.apply(this, arguments);
}

inherit(TouchInput, Input, {
    handler: function MTEhandler(ev) {
        var type = TOUCH_INPUT_MAP[ev.type];
        var touches = getTouches.call(this, ev, type);
        if (!touches) {
            return;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function getTouches(ev, type) {
    var allTouches = toArray(ev.touches);
    var targetIds = this.targetIds;

    // when there is only one touch, the process can be simplified
    if (type & (INPUT_START | INPUT_MOVE) && allTouches.length === 1) {
        targetIds[allTouches[0].identifier] = true;
        return [allTouches, allTouches];
    }

    var i,
        targetTouches,
        changedTouches = toArray(ev.changedTouches),
        changedTargetTouches = [],
        target = this.target;

    // get target touches from touches
    targetTouches = allTouches.filter(function(touch) {
        return hasParent(touch.target, target);
    });

    // collect touches
    if (type === INPUT_START) {
        i = 0;
        while (i < targetTouches.length) {
            targetIds[targetTouches[i].identifier] = true;
            i++;
        }
    }

    // filter changed touches to only contain touches that exist in the collected target ids
    i = 0;
    while (i < changedTouches.length) {
        if (targetIds[changedTouches[i].identifier]) {
            changedTargetTouches.push(changedTouches[i]);
        }

        // cleanup removed touches
        if (type & (INPUT_END | INPUT_CANCEL)) {
            delete targetIds[changedTouches[i].identifier];
        }
        i++;
    }

    if (!changedTargetTouches.length) {
        return;
    }

    return [
        // merge targetTouches with changedTargetTouches so it contains ALL touches, including 'end' and 'cancel'
        uniqueArray(targetTouches.concat(changedTargetTouches), 'identifier', true),
        changedTargetTouches
    ];
}

/**
 * Combined touch and mouse input
 *
 * Touch has a higher priority then mouse, and while touching no mouse events are allowed.
 * This because touch devices also emit mouse events while doing a touch.
 *
 * @constructor
 * @extends Input
 */

var DEDUP_TIMEOUT = 2500;
var DEDUP_DISTANCE = 25;

function TouchMouseInput() {
    Input.apply(this, arguments);

    var handler = bindFn(this.handler, this);
    this.touch = new TouchInput(this.manager, handler);
    this.mouse = new MouseInput(this.manager, handler);

    this.primaryTouch = null;
    this.lastTouches = [];
}

inherit(TouchMouseInput, Input, {
    /**
     * handle mouse and touch events
     * @param {Hammer} manager
     * @param {String} inputEvent
     * @param {Object} inputData
     */
    handler: function TMEhandler(manager, inputEvent, inputData) {
        var isTouch = (inputData.pointerType == INPUT_TYPE_TOUCH),
            isMouse = (inputData.pointerType == INPUT_TYPE_MOUSE);

        if (isMouse && inputData.sourceCapabilities && inputData.sourceCapabilities.firesTouchEvents) {
            return;
        }

        // when we're in a touch event, record touches to  de-dupe synthetic mouse event
        if (isTouch) {
            recordTouches.call(this, inputEvent, inputData);
        } else if (isMouse && isSyntheticEvent.call(this, inputData)) {
            return;
        }

        this.callback(manager, inputEvent, inputData);
    },

    /**
     * remove the event listeners
     */
    destroy: function destroy() {
        this.touch.destroy();
        this.mouse.destroy();
    }
});

function recordTouches(eventType, eventData) {
    if (eventType & INPUT_START) {
        this.primaryTouch = eventData.changedPointers[0].identifier;
        setLastTouch.call(this, eventData);
    } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
        setLastTouch.call(this, eventData);
    }
}

function setLastTouch(eventData) {
    var touch = eventData.changedPointers[0];

    if (touch.identifier === this.primaryTouch) {
        var lastTouch = {x: touch.clientX, y: touch.clientY};
        this.lastTouches.push(lastTouch);
        var lts = this.lastTouches;
        var removeLastTouch = function() {
            var i = lts.indexOf(lastTouch);
            if (i > -1) {
                lts.splice(i, 1);
            }
        };
        setTimeout(removeLastTouch, DEDUP_TIMEOUT);
    }
}

function isSyntheticEvent(eventData) {
    var x = eventData.srcEvent.clientX, y = eventData.srcEvent.clientY;
    for (var i = 0; i < this.lastTouches.length; i++) {
        var t = this.lastTouches[i];
        var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
        if (dx <= DEDUP_DISTANCE && dy <= DEDUP_DISTANCE) {
            return true;
        }
    }
    return false;
}

var PREFIXED_TOUCH_ACTION = prefixed(TEST_ELEMENT.style, 'touchAction');
var NATIVE_TOUCH_ACTION = PREFIXED_TOUCH_ACTION !== undefined;

// magical touchAction value
var TOUCH_ACTION_COMPUTE = 'compute';
var TOUCH_ACTION_AUTO = 'auto';
var TOUCH_ACTION_MANIPULATION = 'manipulation'; // not implemented
var TOUCH_ACTION_NONE = 'none';
var TOUCH_ACTION_PAN_X = 'pan-x';
var TOUCH_ACTION_PAN_Y = 'pan-y';
var TOUCH_ACTION_MAP = getTouchActionProps();

/**
 * Touch Action
 * sets the touchAction property or uses the js alternative
 * @param {Manager} manager
 * @param {String} value
 * @constructor
 */
function TouchAction(manager, value) {
    this.manager = manager;
    this.set(value);
}

TouchAction.prototype = {
    /**
     * set the touchAction value on the element or enable the polyfill
     * @param {String} value
     */
    set: function(value) {
        // find out the touch-action by the event handlers
        if (value == TOUCH_ACTION_COMPUTE) {
            value = this.compute();
        }

        if (NATIVE_TOUCH_ACTION && this.manager.element.style && TOUCH_ACTION_MAP[value]) {
            this.manager.element.style[PREFIXED_TOUCH_ACTION] = value;
        }
        this.actions = value.toLowerCase().trim();
    },

    /**
     * just re-set the touchAction value
     */
    update: function() {
        this.set(this.manager.options.touchAction);
    },

    /**
     * compute the value for the touchAction property based on the recognizer's settings
     * @returns {String} value
     */
    compute: function() {
        var actions = [];
        each(this.manager.recognizers, function(recognizer) {
            if (boolOrFn(recognizer.options.enable, [recognizer])) {
                actions = actions.concat(recognizer.getTouchAction());
            }
        });
        return cleanTouchActions(actions.join(' '));
    },

    /**
     * this method is called on each input cycle and provides the preventing of the browser behavior
     * @param {Object} input
     */
    preventDefaults: function(input) {
        var srcEvent = input.srcEvent;
        var direction = input.offsetDirection;

        // if the touch action did prevented once this session
        if (this.manager.session.prevented) {
            srcEvent.preventDefault();
            return;
        }

        var actions = this.actions;
        var hasNone = inStr(actions, TOUCH_ACTION_NONE) && !TOUCH_ACTION_MAP[TOUCH_ACTION_NONE];
        var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_Y];
        var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_X];

        if (hasNone) {
            //do not prevent defaults if this is a tap gesture

            var isTapPointer = input.pointers.length === 1;
            var isTapMovement = input.distance < 2;
            var isTapTouchTime = input.deltaTime < 250;

            if (isTapPointer && isTapMovement && isTapTouchTime) {
                return;
            }
        }

        if (hasPanX && hasPanY) {
            // `pan-x pan-y` means browser handles all scrolling/panning, do not prevent
            return;
        }

        if (hasNone ||
            (hasPanY && direction & DIRECTION_HORIZONTAL) ||
            (hasPanX && direction & DIRECTION_VERTICAL)) {
            return this.preventSrc(srcEvent);
        }
    },

    /**
     * call preventDefault to prevent the browser's default behavior (scrolling in most cases)
     * @param {Object} srcEvent
     */
    preventSrc: function(srcEvent) {
        this.manager.session.prevented = true;
        srcEvent.preventDefault();
    }
};

/**
 * when the touchActions are collected they are not a valid value, so we need to clean things up. *
 * @param {String} actions
 * @returns {*}
 */
function cleanTouchActions(actions) {
    // none
    if (inStr(actions, TOUCH_ACTION_NONE)) {
        return TOUCH_ACTION_NONE;
    }

    var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
    var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);

    // if both pan-x and pan-y are set (different recognizers
    // for different directions, e.g. horizontal pan but vertical swipe?)
    // we need none (as otherwise with pan-x pan-y combined none of these
    // recognizers will work, since the browser would handle all panning
    if (hasPanX && hasPanY) {
        return TOUCH_ACTION_NONE;
    }

    // pan-x OR pan-y
    if (hasPanX || hasPanY) {
        return hasPanX ? TOUCH_ACTION_PAN_X : TOUCH_ACTION_PAN_Y;
    }

    // manipulation
    if (inStr(actions, TOUCH_ACTION_MANIPULATION)) {
        return TOUCH_ACTION_MANIPULATION;
    }

    return TOUCH_ACTION_AUTO;
}

function getTouchActionProps() {
    if (!NATIVE_TOUCH_ACTION) {
        return false;
    }
    var touchMap = {};
    var cssSupports = window.CSS && window.CSS.supports;
    ['auto', 'manipulation', 'pan-y', 'pan-x', 'pan-x pan-y', 'none'].forEach(function(val) {

        // If css.supports is not supported but there is native touch-action assume it supports
        // all values. This is the case for IE 10 and 11.
        touchMap[val] = cssSupports ? window.CSS.supports('touch-action', val) : true;
    });
    return touchMap;
}

/**
 * Recognizer flow explained; *
 * All recognizers have the initial state of POSSIBLE when a input session starts.
 * The definition of a input session is from the first input until the last input, with all it's movement in it. *
 * Example session for mouse-input: mousedown -> mousemove -> mouseup
 *
 * On each recognizing cycle (see Manager.recognize) the .recognize() method is executed
 * which determines with state it should be.
 *
 * If the recognizer has the state FAILED, CANCELLED or RECOGNIZED (equals ENDED), it is reset to
 * POSSIBLE to give it another change on the next cycle.
 *
 *               Possible
 *                  |
 *            +-----+---------------+
 *            |                     |
 *      +-----+-----+               |
 *      |           |               |
 *   Failed      Cancelled          |
 *                          +-------+------+
 *                          |              |
 *                      Recognized       Began
 *                                         |
 *                                      Changed
 *                                         |
 *                                  Ended/Recognized
 */
var STATE_POSSIBLE = 1;
var STATE_BEGAN = 2;
var STATE_CHANGED = 4;
var STATE_ENDED = 8;
var STATE_RECOGNIZED = STATE_ENDED;
var STATE_CANCELLED = 16;
var STATE_FAILED = 32;

/**
 * Recognizer
 * Every recognizer needs to extend from this class.
 * @constructor
 * @param {Object} options
 */
function Recognizer(options) {
    this.options = assign({}, this.defaults, options || {});

    this.id = uniqueId();

    this.manager = null;

    // default is enable true
    this.options.enable = ifUndefined(this.options.enable, true);

    this.state = STATE_POSSIBLE;

    this.simultaneous = {};
    this.requireFail = [];
}

Recognizer.prototype = {
    /**
     * @virtual
     * @type {Object}
     */
    defaults: {},

    /**
     * set options
     * @param {Object} options
     * @return {Recognizer}
     */
    set: function(options) {
        assign(this.options, options);

        // also update the touchAction, in case something changed about the directions/enabled state
        this.manager && this.manager.touchAction.update();
        return this;
    },

    /**
     * recognize simultaneous with an other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    recognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'recognizeWith', this)) {
            return this;
        }

        var simultaneous = this.simultaneous;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (!simultaneous[otherRecognizer.id]) {
            simultaneous[otherRecognizer.id] = otherRecognizer;
            otherRecognizer.recognizeWith(this);
        }
        return this;
    },

    /**
     * drop the simultaneous link. it doesnt remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRecognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRecognizeWith', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        delete this.simultaneous[otherRecognizer.id];
        return this;
    },

    /**
     * recognizer can only run when an other is failing
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    requireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'requireFailure', this)) {
            return this;
        }

        var requireFail = this.requireFail;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (inArray(requireFail, otherRecognizer) === -1) {
            requireFail.push(otherRecognizer);
            otherRecognizer.requireFailure(this);
        }
        return this;
    },

    /**
     * drop the requireFailure link. it does not remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRequireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRequireFailure', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        var index = inArray(this.requireFail, otherRecognizer);
        if (index > -1) {
            this.requireFail.splice(index, 1);
        }
        return this;
    },

    /**
     * has require failures boolean
     * @returns {boolean}
     */
    hasRequireFailures: function() {
        return this.requireFail.length > 0;
    },

    /**
     * if the recognizer can recognize simultaneous with an other recognizer
     * @param {Recognizer} otherRecognizer
     * @returns {Boolean}
     */
    canRecognizeWith: function(otherRecognizer) {
        return !!this.simultaneous[otherRecognizer.id];
    },

    /**
     * You should use `tryEmit` instead of `emit` directly to check
     * that all the needed recognizers has failed before emitting.
     * @param {Object} input
     */
    emit: function(input) {
        var self = this;
        var state = this.state;

        function emit(event) {
            self.manager.emit(event, input);
        }

        // 'panstart' and 'panmove'
        if (state < STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }

        emit(self.options.event); // simple 'eventName' events

        if (input.additionalEvent) { // additional event(panleft, panright, pinchin, pinchout...)
            emit(input.additionalEvent);
        }

        // panend and pancancel
        if (state >= STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }
    },

    /**
     * Check that all the require failure recognizers has failed,
     * if true, it emits a gesture event,
     * otherwise, setup the state to FAILED.
     * @param {Object} input
     */
    tryEmit: function(input) {
        if (this.canEmit()) {
            return this.emit(input);
        }
        // it's failing anyway
        this.state = STATE_FAILED;
    },

    /**
     * can we emit?
     * @returns {boolean}
     */
    canEmit: function() {
        var i = 0;
        while (i < this.requireFail.length) {
            if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
                return false;
            }
            i++;
        }
        return true;
    },

    /**
     * update the recognizer
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        // make a new copy of the inputData
        // so we can change the inputData without messing up the other recognizers
        var inputDataClone = assign({}, inputData);

        // is is enabled and allow recognizing?
        if (!boolOrFn(this.options.enable, [this, inputDataClone])) {
            this.reset();
            this.state = STATE_FAILED;
            return;
        }

        // reset when we've reached the end
        if (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED)) {
            this.state = STATE_POSSIBLE;
        }

        this.state = this.process(inputDataClone);

        // the recognizer has recognized a gesture
        // so trigger an event
        if (this.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED)) {
            this.tryEmit(inputDataClone);
        }
    },

    /**
     * return the state of the recognizer
     * the actual recognizing happens in this method
     * @virtual
     * @param {Object} inputData
     * @returns {Const} STATE
     */
    process: function(inputData) { }, // jshint ignore:line

    /**
     * return the preferred touch-action
     * @virtual
     * @returns {Array}
     */
    getTouchAction: function() { },

    /**
     * called when the gesture isn't allowed to recognize
     * like when another is being recognized or it is disabled
     * @virtual
     */
    reset: function() { }
};

/**
 * get a usable string, used as event postfix
 * @param {Const} state
 * @returns {String} state
 */
function stateStr(state) {
    if (state & STATE_CANCELLED) {
        return 'cancel';
    } else if (state & STATE_ENDED) {
        return 'end';
    } else if (state & STATE_CHANGED) {
        return 'move';
    } else if (state & STATE_BEGAN) {
        return 'start';
    }
    return '';
}

/**
 * direction cons to string
 * @param {Const} direction
 * @returns {String}
 */
function directionStr(direction) {
    if (direction == DIRECTION_DOWN) {
        return 'down';
    } else if (direction == DIRECTION_UP) {
        return 'up';
    } else if (direction == DIRECTION_LEFT) {
        return 'left';
    } else if (direction == DIRECTION_RIGHT) {
        return 'right';
    }
    return '';
}

/**
 * get a recognizer by name if it is bound to a manager
 * @param {Recognizer|String} otherRecognizer
 * @param {Recognizer} recognizer
 * @returns {Recognizer}
 */
function getRecognizerByNameIfManager(otherRecognizer, recognizer) {
    var manager = recognizer.manager;
    if (manager) {
        return manager.get(otherRecognizer);
    }
    return otherRecognizer;
}

/**
 * This recognizer is just used as a base for the simple attribute recognizers.
 * @constructor
 * @extends Recognizer
 */
function AttrRecognizer() {
    Recognizer.apply(this, arguments);
}

inherit(AttrRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof AttrRecognizer
     */
    defaults: {
        /**
         * @type {Number}
         * @default 1
         */
        pointers: 1
    },

    /**
     * Used to check if it the recognizer receives valid input, like input.distance > 10.
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {Boolean} recognized
     */
    attrTest: function(input) {
        var optionPointers = this.options.pointers;
        return optionPointers === 0 || input.pointers.length === optionPointers;
    },

    /**
     * Process the input and return the state for the recognizer
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {*} State
     */
    process: function(input) {
        var state = this.state;
        var eventType = input.eventType;

        var isRecognized = state & (STATE_BEGAN | STATE_CHANGED);
        var isValid = this.attrTest(input);

        // on cancel input and we've recognized before, return STATE_CANCELLED
        if (isRecognized && (eventType & INPUT_CANCEL || !isValid)) {
            return state | STATE_CANCELLED;
        } else if (isRecognized || isValid) {
            if (eventType & INPUT_END) {
                return state | STATE_ENDED;
            } else if (!(state & STATE_BEGAN)) {
                return STATE_BEGAN;
            }
            return state | STATE_CHANGED;
        }
        return STATE_FAILED;
    }
});

/**
 * Pan
 * Recognized when the pointer is down and moved in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function PanRecognizer() {
    AttrRecognizer.apply(this, arguments);

    this.pX = null;
    this.pY = null;
}

inherit(PanRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PanRecognizer
     */
    defaults: {
        event: 'pan',
        threshold: 10,
        pointers: 1,
        direction: DIRECTION_ALL
    },

    getTouchAction: function() {
        var direction = this.options.direction;
        var actions = [];
        if (direction & DIRECTION_HORIZONTAL) {
            actions.push(TOUCH_ACTION_PAN_Y);
        }
        if (direction & DIRECTION_VERTICAL) {
            actions.push(TOUCH_ACTION_PAN_X);
        }
        return actions;
    },

    directionTest: function(input) {
        var options = this.options;
        var hasMoved = true;
        var distance = input.distance;
        var direction = input.direction;
        var x = input.deltaX;
        var y = input.deltaY;

        // lock to axis?
        if (!(direction & options.direction)) {
            if (options.direction & DIRECTION_HORIZONTAL) {
                direction = (x === 0) ? DIRECTION_NONE : (x < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
                hasMoved = x != this.pX;
                distance = Math.abs(input.deltaX);
            } else {
                direction = (y === 0) ? DIRECTION_NONE : (y < 0) ? DIRECTION_UP : DIRECTION_DOWN;
                hasMoved = y != this.pY;
                distance = Math.abs(input.deltaY);
            }
        }
        input.direction = direction;
        return hasMoved && distance > options.threshold && direction & options.direction;
    },

    attrTest: function(input) {
        return AttrRecognizer.prototype.attrTest.call(this, input) &&
            (this.state & STATE_BEGAN || (!(this.state & STATE_BEGAN) && this.directionTest(input)));
    },

    emit: function(input) {

        this.pX = input.deltaX;
        this.pY = input.deltaY;

        var direction = directionStr(input.direction);

        if (direction) {
            input.additionalEvent = this.options.event + direction;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Pinch
 * Recognized when two or more pointers are moving toward (zoom-in) or away from each other (zoom-out).
 * @constructor
 * @extends AttrRecognizer
 */
function PinchRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(PinchRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'pinch',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.scale - 1) > this.options.threshold || this.state & STATE_BEGAN);
    },

    emit: function(input) {
        if (input.scale !== 1) {
            var inOut = input.scale < 1 ? 'in' : 'out';
            input.additionalEvent = this.options.event + inOut;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Press
 * Recognized when the pointer is down for x ms without any movement.
 * @constructor
 * @extends Recognizer
 */
function PressRecognizer() {
    Recognizer.apply(this, arguments);

    this._timer = null;
    this._input = null;
}

inherit(PressRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PressRecognizer
     */
    defaults: {
        event: 'press',
        pointers: 1,
        time: 251, // minimal time of the pointer to be pressed
        threshold: 9 // a minimal movement is ok, but keep it low
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_AUTO];
    },

    process: function(input) {
        var options = this.options;
        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTime = input.deltaTime > options.time;

        this._input = input;

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (!validMovement || !validPointers || (input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime)) {
            this.reset();
        } else if (input.eventType & INPUT_START) {
            this.reset();
            this._timer = setTimeoutContext(function() {
                this.state = STATE_RECOGNIZED;
                this.tryEmit();
            }, options.time, this);
        } else if (input.eventType & INPUT_END) {
            return STATE_RECOGNIZED;
        }
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function(input) {
        if (this.state !== STATE_RECOGNIZED) {
            return;
        }

        if (input && (input.eventType & INPUT_END)) {
            this.manager.emit(this.options.event + 'up', input);
        } else {
            this._input.timeStamp = now();
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Rotate
 * Recognized when two or more pointer are moving in a circular motion.
 * @constructor
 * @extends AttrRecognizer
 */
function RotateRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(RotateRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof RotateRecognizer
     */
    defaults: {
        event: 'rotate',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.rotation) > this.options.threshold || this.state & STATE_BEGAN);
    }
});

/**
 * Swipe
 * Recognized when the pointer is moving fast (velocity), with enough distance in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function SwipeRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(SwipeRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof SwipeRecognizer
     */
    defaults: {
        event: 'swipe',
        threshold: 10,
        velocity: 0.3,
        direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
        pointers: 1
    },

    getTouchAction: function() {
        return PanRecognizer.prototype.getTouchAction.call(this);
    },

    attrTest: function(input) {
        var direction = this.options.direction;
        var velocity;

        if (direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
            velocity = input.overallVelocity;
        } else if (direction & DIRECTION_HORIZONTAL) {
            velocity = input.overallVelocityX;
        } else if (direction & DIRECTION_VERTICAL) {
            velocity = input.overallVelocityY;
        }

        return this._super.attrTest.call(this, input) &&
            direction & input.offsetDirection &&
            input.distance > this.options.threshold &&
            input.maxPointers == this.options.pointers &&
            abs(velocity) > this.options.velocity && input.eventType & INPUT_END;
    },

    emit: function(input) {
        var direction = directionStr(input.offsetDirection);
        if (direction) {
            this.manager.emit(this.options.event + direction, input);
        }

        this.manager.emit(this.options.event, input);
    }
});

/**
 * A tap is ecognized when the pointer is doing a small tap/click. Multiple taps are recognized if they occur
 * between the given interval and position. The delay option can be used to recognize multi-taps without firing
 * a single tap.
 *
 * The eventData from the emitted event contains the property `tapCount`, which contains the amount of
 * multi-taps being recognized.
 * @constructor
 * @extends Recognizer
 */
function TapRecognizer() {
    Recognizer.apply(this, arguments);

    // previous time and center,
    // used for tap counting
    this.pTime = false;
    this.pCenter = false;

    this._timer = null;
    this._input = null;
    this.count = 0;
}

inherit(TapRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'tap',
        pointers: 1,
        taps: 1,
        interval: 300, // max time between the multi-tap taps
        time: 250, // max time of the pointer to be down (like finger on the screen)
        threshold: 9, // a minimal movement is ok, but keep it low
        posThreshold: 10 // a multi-tap can be a bit off the initial position
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_MANIPULATION];
    },

    process: function(input) {
        var options = this.options;

        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTouchTime = input.deltaTime < options.time;

        this.reset();

        if ((input.eventType & INPUT_START) && (this.count === 0)) {
            return this.failTimeout();
        }

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (validMovement && validTouchTime && validPointers) {
            if (input.eventType != INPUT_END) {
                return this.failTimeout();
            }

            var validInterval = this.pTime ? (input.timeStamp - this.pTime < options.interval) : true;
            var validMultiTap = !this.pCenter || getDistance(this.pCenter, input.center) < options.posThreshold;

            this.pTime = input.timeStamp;
            this.pCenter = input.center;

            if (!validMultiTap || !validInterval) {
                this.count = 1;
            } else {
                this.count += 1;
            }

            this._input = input;

            // if tap count matches we have recognized it,
            // else it has began recognizing...
            var tapCount = this.count % options.taps;
            if (tapCount === 0) {
                // no failing requirements, immediately trigger the tap event
                // or wait as long as the multitap interval to trigger
                if (!this.hasRequireFailures()) {
                    return STATE_RECOGNIZED;
                } else {
                    this._timer = setTimeoutContext(function() {
                        this.state = STATE_RECOGNIZED;
                        this.tryEmit();
                    }, options.interval, this);
                    return STATE_BEGAN;
                }
            }
        }
        return STATE_FAILED;
    },

    failTimeout: function() {
        this._timer = setTimeoutContext(function() {
            this.state = STATE_FAILED;
        }, this.options.interval, this);
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function() {
        if (this.state == STATE_RECOGNIZED) {
            this._input.tapCount = this.count;
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Simple way to create a manager with a default set of recognizers.
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Hammer(element, options) {
    options = options || {};
    options.recognizers = ifUndefined(options.recognizers, Hammer.defaults.preset);
    return new Manager(element, options);
}

/**
 * @const {string}
 */
Hammer.VERSION = '2.0.7';

/**
 * default settings
 * @namespace
 */
Hammer.defaults = {
    /**
     * set if DOM events are being triggered.
     * But this is slower and unused by simple implementations, so disabled by default.
     * @type {Boolean}
     * @default false
     */
    domEvents: false,

    /**
     * The value for the touchAction property/fallback.
     * When set to `compute` it will magically set the correct value based on the added recognizers.
     * @type {String}
     * @default compute
     */
    touchAction: TOUCH_ACTION_COMPUTE,

    /**
     * @type {Boolean}
     * @default true
     */
    enable: true,

    /**
     * EXPERIMENTAL FEATURE -- can be removed/changed
     * Change the parent input target element.
     * If Null, then it is being set the to main element.
     * @type {Null|EventTarget}
     * @default null
     */
    inputTarget: null,

    /**
     * force an input class
     * @type {Null|Function}
     * @default null
     */
    inputClass: null,

    /**
     * Default recognizer setup when calling `Hammer()`
     * When creating a new Manager these will be skipped.
     * @type {Array}
     */
    preset: [
        // RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
        [RotateRecognizer, {enable: false}],
        [PinchRecognizer, {enable: false}, ['rotate']],
        [SwipeRecognizer, {direction: DIRECTION_HORIZONTAL}],
        [PanRecognizer, {direction: DIRECTION_HORIZONTAL}, ['swipe']],
        [TapRecognizer],
        [TapRecognizer, {event: 'doubletap', taps: 2}, ['tap']],
        [PressRecognizer]
    ],

    /**
     * Some CSS properties can be used to improve the working of Hammer.
     * Add them to this method and they will be set when creating a new Manager.
     * @namespace
     */
    cssProps: {
        /**
         * Disables text selection to improve the dragging gesture. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userSelect: 'none',

        /**
         * Disable the Windows Phone grippers when pressing an element.
         * @type {String}
         * @default 'none'
         */
        touchSelect: 'none',

        /**
         * Disables the default callout shown when you touch and hold a touch target.
         * On iOS, when you touch and hold a touch target such as a link, Safari displays
         * a callout containing information about the link. This property allows you to disable that callout.
         * @type {String}
         * @default 'none'
         */
        touchCallout: 'none',

        /**
         * Specifies whether zooming is enabled. Used by IE10>
         * @type {String}
         * @default 'none'
         */
        contentZooming: 'none',

        /**
         * Specifies that an entire element should be draggable instead of its contents. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userDrag: 'none',

        /**
         * Overrides the highlight color shown when the user taps a link or a JavaScript
         * clickable element in iOS. This property obeys the alpha value, if specified.
         * @type {String}
         * @default 'rgba(0,0,0,0)'
         */
        tapHighlightColor: 'rgba(0,0,0,0)'
    }
};

var STOP = 1;
var FORCED_STOP = 2;

/**
 * Manager
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Manager(element, options) {
    this.options = assign({}, Hammer.defaults, options || {});

    this.options.inputTarget = this.options.inputTarget || element;

    this.handlers = {};
    this.session = {};
    this.recognizers = [];
    this.oldCssProps = {};

    this.element = element;
    this.input = createInputInstance(this);
    this.touchAction = new TouchAction(this, this.options.touchAction);

    toggleCssProps(this, true);

    each(this.options.recognizers, function(item) {
        var recognizer = this.add(new (item[0])(item[1]));
        item[2] && recognizer.recognizeWith(item[2]);
        item[3] && recognizer.requireFailure(item[3]);
    }, this);
}

Manager.prototype = {
    /**
     * set options
     * @param {Object} options
     * @returns {Manager}
     */
    set: function(options) {
        assign(this.options, options);

        // Options that need a little more setup
        if (options.touchAction) {
            this.touchAction.update();
        }
        if (options.inputTarget) {
            // Clean up existing event listeners and reinitialize
            this.input.destroy();
            this.input.target = options.inputTarget;
            this.input.init();
        }
        return this;
    },

    /**
     * stop recognizing for this session.
     * This session will be discarded, when a new [input]start event is fired.
     * When forced, the recognizer cycle is stopped immediately.
     * @param {Boolean} [force]
     */
    stop: function(force) {
        this.session.stopped = force ? FORCED_STOP : STOP;
    },

    /**
     * run the recognizers!
     * called by the inputHandler function on every movement of the pointers (touches)
     * it walks through all the recognizers and tries to detect the gesture that is being made
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        var session = this.session;
        if (session.stopped) {
            return;
        }

        // run the touch-action polyfill
        this.touchAction.preventDefaults(inputData);

        var recognizer;
        var recognizers = this.recognizers;

        // this holds the recognizer that is being recognized.
        // so the recognizer's state needs to be BEGAN, CHANGED, ENDED or RECOGNIZED
        // if no recognizer is detecting a thing, it is set to `null`
        var curRecognizer = session.curRecognizer;

        // reset when the last recognizer is recognized
        // or when we're in a new session
        if (!curRecognizer || (curRecognizer && curRecognizer.state & STATE_RECOGNIZED)) {
            curRecognizer = session.curRecognizer = null;
        }

        var i = 0;
        while (i < recognizers.length) {
            recognizer = recognizers[i];

            // find out if we are allowed try to recognize the input for this one.
            // 1.   allow if the session is NOT forced stopped (see the .stop() method)
            // 2.   allow if we still haven't recognized a gesture in this session, or the this recognizer is the one
            //      that is being recognized.
            // 3.   allow if the recognizer is allowed to run simultaneous with the current recognized recognizer.
            //      this can be setup with the `recognizeWith()` method on the recognizer.
            if (session.stopped !== FORCED_STOP && ( // 1
                    !curRecognizer || recognizer == curRecognizer || // 2
                    recognizer.canRecognizeWith(curRecognizer))) { // 3
                recognizer.recognize(inputData);
            } else {
                recognizer.reset();
            }

            // if the recognizer has been recognizing the input as a valid gesture, we want to store this one as the
            // current active recognizer. but only if we don't already have an active recognizer
            if (!curRecognizer && recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED)) {
                curRecognizer = session.curRecognizer = recognizer;
            }
            i++;
        }
    },

    /**
     * get a recognizer by its event name.
     * @param {Recognizer|String} recognizer
     * @returns {Recognizer|Null}
     */
    get: function(recognizer) {
        if (recognizer instanceof Recognizer) {
            return recognizer;
        }

        var recognizers = this.recognizers;
        for (var i = 0; i < recognizers.length; i++) {
            if (recognizers[i].options.event == recognizer) {
                return recognizers[i];
            }
        }
        return null;
    },

    /**
     * add a recognizer to the manager
     * existing recognizers with the same event name will be removed
     * @param {Recognizer} recognizer
     * @returns {Recognizer|Manager}
     */
    add: function(recognizer) {
        if (invokeArrayArg(recognizer, 'add', this)) {
            return this;
        }

        // remove existing
        var existing = this.get(recognizer.options.event);
        if (existing) {
            this.remove(existing);
        }

        this.recognizers.push(recognizer);
        recognizer.manager = this;

        this.touchAction.update();
        return recognizer;
    },

    /**
     * remove a recognizer by name or instance
     * @param {Recognizer|String} recognizer
     * @returns {Manager}
     */
    remove: function(recognizer) {
        if (invokeArrayArg(recognizer, 'remove', this)) {
            return this;
        }

        recognizer = this.get(recognizer);

        // let's make sure this recognizer exists
        if (recognizer) {
            var recognizers = this.recognizers;
            var index = inArray(recognizers, recognizer);

            if (index !== -1) {
                recognizers.splice(index, 1);
                this.touchAction.update();
            }
        }

        return this;
    },

    /**
     * bind event
     * @param {String} events
     * @param {Function} handler
     * @returns {EventEmitter} this
     */
    on: function(events, handler) {
        if (events === undefined) {
            return;
        }
        if (handler === undefined) {
            return;
        }

        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            handlers[event] = handlers[event] || [];
            handlers[event].push(handler);
        });
        return this;
    },

    /**
     * unbind event, leave emit blank to remove all handlers
     * @param {String} events
     * @param {Function} [handler]
     * @returns {EventEmitter} this
     */
    off: function(events, handler) {
        if (events === undefined) {
            return;
        }

        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            if (!handler) {
                delete handlers[event];
            } else {
                handlers[event] && handlers[event].splice(inArray(handlers[event], handler), 1);
            }
        });
        return this;
    },

    /**
     * emit event to the listeners
     * @param {String} event
     * @param {Object} data
     */
    emit: function(event, data) {
        // we also want to trigger dom events
        if (this.options.domEvents) {
            triggerDomEvent(event, data);
        }

        // no handlers, so skip it all
        var handlers = this.handlers[event] && this.handlers[event].slice();
        if (!handlers || !handlers.length) {
            return;
        }

        data.type = event;
        data.preventDefault = function() {
            data.srcEvent.preventDefault();
        };

        var i = 0;
        while (i < handlers.length) {
            handlers[i](data);
            i++;
        }
    },

    /**
     * destroy the manager and unbinds all events
     * it doesn't unbind dom events, that is the user own responsibility
     */
    destroy: function() {
        this.element && toggleCssProps(this, false);

        this.handlers = {};
        this.session = {};
        this.input.destroy();
        this.element = null;
    }
};

/**
 * add/remove the css properties as defined in manager.options.cssProps
 * @param {Manager} manager
 * @param {Boolean} add
 */
function toggleCssProps(manager, add) {
    var element = manager.element;
    if (!element.style) {
        return;
    }
    var prop;
    each(manager.options.cssProps, function(value, name) {
        prop = prefixed(element.style, name);
        if (add) {
            manager.oldCssProps[prop] = element.style[prop];
            element.style[prop] = value;
        } else {
            element.style[prop] = manager.oldCssProps[prop] || '';
        }
    });
    if (!add) {
        manager.oldCssProps = {};
    }
}

/**
 * trigger dom event
 * @param {String} event
 * @param {Object} data
 */
function triggerDomEvent(event, data) {
    var gestureEvent = document.createEvent('Event');
    gestureEvent.initEvent(event, true, true);
    gestureEvent.gesture = data;
    data.target.dispatchEvent(gestureEvent);
}

assign(Hammer, {
    INPUT_START: INPUT_START,
    INPUT_MOVE: INPUT_MOVE,
    INPUT_END: INPUT_END,
    INPUT_CANCEL: INPUT_CANCEL,

    STATE_POSSIBLE: STATE_POSSIBLE,
    STATE_BEGAN: STATE_BEGAN,
    STATE_CHANGED: STATE_CHANGED,
    STATE_ENDED: STATE_ENDED,
    STATE_RECOGNIZED: STATE_RECOGNIZED,
    STATE_CANCELLED: STATE_CANCELLED,
    STATE_FAILED: STATE_FAILED,

    DIRECTION_NONE: DIRECTION_NONE,
    DIRECTION_LEFT: DIRECTION_LEFT,
    DIRECTION_RIGHT: DIRECTION_RIGHT,
    DIRECTION_UP: DIRECTION_UP,
    DIRECTION_DOWN: DIRECTION_DOWN,
    DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
    DIRECTION_VERTICAL: DIRECTION_VERTICAL,
    DIRECTION_ALL: DIRECTION_ALL,

    Manager: Manager,
    Input: Input,
    TouchAction: TouchAction,

    TouchInput: TouchInput,
    MouseInput: MouseInput,
    PointerEventInput: PointerEventInput,
    TouchMouseInput: TouchMouseInput,
    SingleTouchInput: SingleTouchInput,

    Recognizer: Recognizer,
    AttrRecognizer: AttrRecognizer,
    Tap: TapRecognizer,
    Pan: PanRecognizer,
    Swipe: SwipeRecognizer,
    Pinch: PinchRecognizer,
    Rotate: RotateRecognizer,
    Press: PressRecognizer,

    on: addEventListeners,
    off: removeEventListeners,
    each: each,
    merge: merge,
    extend: extend,
    assign: assign,
    inherit: inherit,
    bindFn: bindFn,
    prefixed: prefixed
});

// this prevents errors when Hammer is loaded in the presence of an AMD
//  style loader but by script tag, not by the loader.
var freeGlobal = (typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : {})); // jshint ignore:line
freeGlobal.Hammer = Hammer;

if (true) {
    !(__WEBPACK_AMD_DEFINE_RESULT__ = (function() {
        return Hammer;
    }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else {}

})(window, document, 'Hammer');


/***/ }),

/***/ 240:
/***/ ((module) => {

/*
 * Hamster.js v1.1.2
 * (c) 2013 Monospaced http://monospaced.com
 * License: MIT
 */

(function(window, document){
'use strict';

/**
 * Hamster
 * use this to create instances
 * @returns {Hamster.Instance}
 * @constructor
 */
var Hamster = function(element) {
  return new Hamster.Instance(element);
};

// default event name
Hamster.SUPPORT = 'wheel';

// default DOM methods
Hamster.ADD_EVENT = 'addEventListener';
Hamster.REMOVE_EVENT = 'removeEventListener';
Hamster.PREFIX = '';

// until browser inconsistencies have been fixed...
Hamster.READY = false;

Hamster.Instance = function(element){
  if (!Hamster.READY) {
    // fix browser inconsistencies
    Hamster.normalise.browser();

    // Hamster is ready...!
    Hamster.READY = true;
  }

  this.element = element;

  // store attached event handlers
  this.handlers = [];

  // return instance
  return this;
};

/**
 * create new hamster instance
 * all methods should return the instance itself, so it is chainable.
 * @param   {HTMLElement}       element
 * @returns {Hamster.Instance}
 * @constructor
 */
Hamster.Instance.prototype = {
  /**
   * bind events to the instance
   * @param   {Function}    handler
   * @param   {Boolean}     useCapture
   * @returns {Hamster.Instance}
   */
  wheel: function onEvent(handler, useCapture){
    Hamster.event.add(this, Hamster.SUPPORT, handler, useCapture);

    // handle MozMousePixelScroll in older Firefox
    if (Hamster.SUPPORT === 'DOMMouseScroll') {
      Hamster.event.add(this, 'MozMousePixelScroll', handler, useCapture);
    }

    return this;
  },

  /**
   * unbind events to the instance
   * @param   {Function}    handler
   * @param   {Boolean}     useCapture
   * @returns {Hamster.Instance}
   */
  unwheel: function offEvent(handler, useCapture){
    // if no handler argument,
    // unbind the last bound handler (if exists)
    if (handler === undefined && (handler = this.handlers.slice(-1)[0])) {
      handler = handler.original;
    }

    Hamster.event.remove(this, Hamster.SUPPORT, handler, useCapture);

    // handle MozMousePixelScroll in older Firefox
    if (Hamster.SUPPORT === 'DOMMouseScroll') {
      Hamster.event.remove(this, 'MozMousePixelScroll', handler, useCapture);
    }

    return this;
  }
};

Hamster.event = {
  /**
   * cross-browser 'addWheelListener'
   * @param   {Instance}    hamster
   * @param   {String}      eventName
   * @param   {Function}    handler
   * @param   {Boolean}     useCapture
   */
  add: function add(hamster, eventName, handler, useCapture){
    // store the original handler
    var originalHandler = handler;

    // redefine the handler
    handler = function(originalEvent){

      if (!originalEvent) {
        originalEvent = window.event;
      }

      // create a normalised event object,
      // and normalise "deltas" of the mouse wheel
      var event = Hamster.normalise.event(originalEvent),
          delta = Hamster.normalise.delta(originalEvent);

      // fire the original handler with normalised arguments
      return originalHandler(event, delta[0], delta[1], delta[2]);

    };

    // cross-browser addEventListener
    hamster.element[Hamster.ADD_EVENT](Hamster.PREFIX + eventName, handler, useCapture || false);

    // store original and normalised handlers on the instance
    hamster.handlers.push({
      original: originalHandler,
      normalised: handler
    });
  },

  /**
   * removeWheelListener
   * @param   {Instance}    hamster
   * @param   {String}      eventName
   * @param   {Function}    handler
   * @param   {Boolean}     useCapture
   */
  remove: function remove(hamster, eventName, handler, useCapture){
    // find the normalised handler on the instance
    var originalHandler = handler,
        lookup = {},
        handlers;
    for (var i = 0, len = hamster.handlers.length; i < len; ++i) {
      lookup[hamster.handlers[i].original] = hamster.handlers[i];
    }
    handlers = lookup[originalHandler];
    handler = handlers.normalised;

    // cross-browser removeEventListener
    hamster.element[Hamster.REMOVE_EVENT](Hamster.PREFIX + eventName, handler, useCapture || false);

    // remove original and normalised handlers from the instance
    for (var h in hamster.handlers) {
      if (hamster.handlers[h] == handlers) {
        hamster.handlers.splice(h, 1);
        break;
      }
    }
  }
};

/**
 * these hold the lowest deltas,
 * used to normalise the delta values
 * @type {Number}
 */
var lowestDelta,
    lowestDeltaXY;

Hamster.normalise = {
  /**
   * fix browser inconsistencies
   */
  browser: function normaliseBrowser(){
    // detect deprecated wheel events
    if (!('onwheel' in document || document.documentMode >= 9)) {
      Hamster.SUPPORT = document.onmousewheel !== undefined ?
                        'mousewheel' : // webkit and IE < 9 support at least "mousewheel"
                        'DOMMouseScroll'; // assume remaining browsers are older Firefox
    }

    // detect deprecated event model
    if (!window.addEventListener) {
      // assume IE < 9
      Hamster.ADD_EVENT = 'attachEvent';
      Hamster.REMOVE_EVENT = 'detachEvent';
      Hamster.PREFIX = 'on';
    }

  },

  /**
   * create a normalised event object
   * @param   {Function}    originalEvent
   * @returns {Object}      event
   */
   event: function normaliseEvent(originalEvent){
    var event = {
          // keep a reference to the original event object
          originalEvent: originalEvent,
          target: originalEvent.target || originalEvent.srcElement,
          type: 'wheel',
          deltaMode: originalEvent.type === 'MozMousePixelScroll' ? 0 : 1,
          deltaX: 0,
          deltaZ: 0,
          preventDefault: function(){
            if (originalEvent.preventDefault) {
              originalEvent.preventDefault();
            } else {
              originalEvent.returnValue = false;
            }
          },
          stopPropagation: function(){
            if (originalEvent.stopPropagation) {
              originalEvent.stopPropagation();
            } else {
              originalEvent.cancelBubble = false;
            }
          }
        };

    // calculate deltaY (and deltaX) according to the event

    // 'mousewheel'
    if (originalEvent.wheelDelta) {
      event.deltaY = - 1/40 * originalEvent.wheelDelta;
    }
    // webkit
    if (originalEvent.wheelDeltaX) {
      event.deltaX = - 1/40 * originalEvent.wheelDeltaX;
    }

    // 'DomMouseScroll'
    if (originalEvent.detail) {
      event.deltaY = originalEvent.detail;
    }

    return event;
  },

  /**
   * normalise 'deltas' of the mouse wheel
   * @param   {Function}    originalEvent
   * @returns {Array}       deltas
   */
  delta: function normaliseDelta(originalEvent){
    var delta = 0,
      deltaX = 0,
      deltaY = 0,
      absDelta = 0,
      absDeltaXY = 0,
      fn;

    // normalise deltas according to the event

    // 'wheel' event
    if (originalEvent.deltaY) {
      deltaY = originalEvent.deltaY * -1;
      delta  = deltaY;
    }
    if (originalEvent.deltaX) {
      deltaX = originalEvent.deltaX;
      delta  = deltaX * -1;
    }

    // 'mousewheel' event
    if (originalEvent.wheelDelta) {
      delta = originalEvent.wheelDelta;
    }
    // webkit
    if (originalEvent.wheelDeltaY) {
      deltaY = originalEvent.wheelDeltaY;
    }
    if (originalEvent.wheelDeltaX) {
      deltaX = originalEvent.wheelDeltaX * -1;
    }

    // 'DomMouseScroll' event
    if (originalEvent.detail) {
      delta = originalEvent.detail * -1;
    }

    // Don't return NaN
    if (delta === 0) {
      return [0, 0, 0];
    }

    // look for lowest delta to normalize the delta values
    absDelta = Math.abs(delta);
    if (!lowestDelta || absDelta < lowestDelta) {
      lowestDelta = absDelta;
    }
    absDeltaXY = Math.max(Math.abs(deltaY), Math.abs(deltaX));
    if (!lowestDeltaXY || absDeltaXY < lowestDeltaXY) {
      lowestDeltaXY = absDeltaXY;
    }

    // convert deltas to whole numbers
    fn = delta > 0 ? 'floor' : 'ceil';
    delta  = Math[fn](delta / lowestDelta);
    deltaX = Math[fn](deltaX / lowestDeltaXY);
    deltaY = Math[fn](deltaY / lowestDeltaXY);

    return [delta, deltaX, deltaY];
  }
};

if (typeof window.define === 'function' && window.define.amd) {
  // AMD
  window.define('hamster', [], function(){
    return Hamster;
  });
} else if (true) {
  // CommonJS
  module.exports = Hamster;
} else {}

})(window, window.document);


/***/ }),

/***/ 992:
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;// Copyright (c) 2013 Pieroxy <pieroxy@pieroxy.net>
// This work is free. You can redistribute it and/or modify it
// under the terms of the WTFPL, Version 2
// For more information see LICENSE.txt or http://www.wtfpl.net/
//
// For more information, the home page:
// http://pieroxy.net/blog/pages/lz-string/testing.html
//
// LZ-based compression algorithm, version 1.4.5
var LZString = (function() {

// private property
var f = String.fromCharCode;
var keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
var keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
var baseReverseDic = {};

function getBaseValue(alphabet, character) {
  if (!baseReverseDic[alphabet]) {
    baseReverseDic[alphabet] = {};
    for (var i=0 ; i<alphabet.length ; i++) {
      baseReverseDic[alphabet][alphabet.charAt(i)] = i;
    }
  }
  return baseReverseDic[alphabet][character];
}

var LZString = {
  compressToBase64 : function (input) {
    if (input == null) return "";
    var res = LZString._compress(input, 6, function(a){return keyStrBase64.charAt(a);});
    switch (res.length % 4) { // To produce valid Base64
    default: // When could this happen ?
    case 0 : return res;
    case 1 : return res+"===";
    case 2 : return res+"==";
    case 3 : return res+"=";
    }
  },

  decompressFromBase64 : function (input) {
    if (input == null) return "";
    if (input == "") return null;
    return LZString._decompress(input.length, 32, function(index) { return getBaseValue(keyStrBase64, input.charAt(index)); });
  },

  compressToUTF16 : function (input) {
    if (input == null) return "";
    return LZString._compress(input, 15, function(a){return f(a+32);}) + " ";
  },

  decompressFromUTF16: function (compressed) {
    if (compressed == null) return "";
    if (compressed == "") return null;
    return LZString._decompress(compressed.length, 16384, function(index) { return compressed.charCodeAt(index) - 32; });
  },

  //compress into uint8array (UCS-2 big endian format)
  compressToUint8Array: function (uncompressed) {
    var compressed = LZString.compress(uncompressed);
    var buf=new Uint8Array(compressed.length*2); // 2 bytes per character

    for (var i=0, TotalLen=compressed.length; i<TotalLen; i++) {
      var current_value = compressed.charCodeAt(i);
      buf[i*2] = current_value >>> 8;
      buf[i*2+1] = current_value % 256;
    }
    return buf;
  },

  //decompress from uint8array (UCS-2 big endian format)
  decompressFromUint8Array:function (compressed) {
    if (compressed===null || compressed===undefined){
        return LZString.decompress(compressed);
    } else {
        var buf=new Array(compressed.length/2); // 2 bytes per character
        for (var i=0, TotalLen=buf.length; i<TotalLen; i++) {
          buf[i]=compressed[i*2]*256+compressed[i*2+1];
        }

        var result = [];
        buf.forEach(function (c) {
          result.push(f(c));
        });
        return LZString.decompress(result.join(''));

    }

  },


  //compress into a string that is already URI encoded
  compressToEncodedURIComponent: function (input) {
    if (input == null) return "";
    return LZString._compress(input, 6, function(a){return keyStrUriSafe.charAt(a);});
  },

  //decompress from an output of compressToEncodedURIComponent
  decompressFromEncodedURIComponent:function (input) {
    if (input == null) return "";
    if (input == "") return null;
    input = input.replace(/ /g, "+");
    return LZString._decompress(input.length, 32, function(index) { return getBaseValue(keyStrUriSafe, input.charAt(index)); });
  },

  compress: function (uncompressed) {
    return LZString._compress(uncompressed, 16, function(a){return f(a);});
  },
  _compress: function (uncompressed, bitsPerChar, getCharFromInt) {
    if (uncompressed == null) return "";
    var i, value,
        context_dictionary= {},
        context_dictionaryToCreate= {},
        context_c="",
        context_wc="",
        context_w="",
        context_enlargeIn= 2, // Compensate for the first entry which should not count
        context_dictSize= 3,
        context_numBits= 2,
        context_data=[],
        context_data_val=0,
        context_data_position=0,
        ii;

    for (ii = 0; ii < uncompressed.length; ii += 1) {
      context_c = uncompressed.charAt(ii);
      if (!Object.prototype.hasOwnProperty.call(context_dictionary,context_c)) {
        context_dictionary[context_c] = context_dictSize++;
        context_dictionaryToCreate[context_c] = true;
      }

      context_wc = context_w + context_c;
      if (Object.prototype.hasOwnProperty.call(context_dictionary,context_wc)) {
        context_w = context_wc;
      } else {
        if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate,context_w)) {
          if (context_w.charCodeAt(0)<256) {
            for (i=0 ; i<context_numBits ; i++) {
              context_data_val = (context_data_val << 1);
              if (context_data_position == bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
            }
            value = context_w.charCodeAt(0);
            for (i=0 ; i<8 ; i++) {
              context_data_val = (context_data_val << 1) | (value&1);
              if (context_data_position == bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          } else {
            value = 1;
            for (i=0 ; i<context_numBits ; i++) {
              context_data_val = (context_data_val << 1) | value;
              if (context_data_position ==bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = 0;
            }
            value = context_w.charCodeAt(0);
            for (i=0 ; i<16 ; i++) {
              context_data_val = (context_data_val << 1) | (value&1);
              if (context_data_position == bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          }
          context_enlargeIn--;
          if (context_enlargeIn == 0) {
            context_enlargeIn = Math.pow(2, context_numBits);
            context_numBits++;
          }
          delete context_dictionaryToCreate[context_w];
        } else {
          value = context_dictionary[context_w];
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }


        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
        // Add wc to the dictionary.
        context_dictionary[context_wc] = context_dictSize++;
        context_w = String(context_c);
      }
    }

    // Output the code for w.
    if (context_w !== "") {
      if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate,context_w)) {
        if (context_w.charCodeAt(0)<256) {
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
          }
          value = context_w.charCodeAt(0);
          for (i=0 ; i<8 ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        } else {
          value = 1;
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1) | value;
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = 0;
          }
          value = context_w.charCodeAt(0);
          for (i=0 ; i<16 ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
        delete context_dictionaryToCreate[context_w];
      } else {
        value = context_dictionary[context_w];
        for (i=0 ; i<context_numBits ; i++) {
          context_data_val = (context_data_val << 1) | (value&1);
          if (context_data_position == bitsPerChar-1) {
            context_data_position = 0;
            context_data.push(getCharFromInt(context_data_val));
            context_data_val = 0;
          } else {
            context_data_position++;
          }
          value = value >> 1;
        }


      }
      context_enlargeIn--;
      if (context_enlargeIn == 0) {
        context_enlargeIn = Math.pow(2, context_numBits);
        context_numBits++;
      }
    }

    // Mark the end of the stream
    value = 2;
    for (i=0 ; i<context_numBits ; i++) {
      context_data_val = (context_data_val << 1) | (value&1);
      if (context_data_position == bitsPerChar-1) {
        context_data_position = 0;
        context_data.push(getCharFromInt(context_data_val));
        context_data_val = 0;
      } else {
        context_data_position++;
      }
      value = value >> 1;
    }

    // Flush the last char
    while (true) {
      context_data_val = (context_data_val << 1);
      if (context_data_position == bitsPerChar-1) {
        context_data.push(getCharFromInt(context_data_val));
        break;
      }
      else context_data_position++;
    }
    return context_data.join('');
  },

  decompress: function (compressed) {
    if (compressed == null) return "";
    if (compressed == "") return null;
    return LZString._decompress(compressed.length, 32768, function(index) { return compressed.charCodeAt(index); });
  },

  _decompress: function (length, resetValue, getNextValue) {
    var dictionary = [],
        next,
        enlargeIn = 4,
        dictSize = 4,
        numBits = 3,
        entry = "",
        result = [],
        i,
        w,
        bits, resb, maxpower, power,
        c,
        data = {val:getNextValue(0), position:resetValue, index:1};

    for (i = 0; i < 3; i += 1) {
      dictionary[i] = i;
    }

    bits = 0;
    maxpower = Math.pow(2,2);
    power=1;
    while (power!=maxpower) {
      resb = data.val & data.position;
      data.position >>= 1;
      if (data.position == 0) {
        data.position = resetValue;
        data.val = getNextValue(data.index++);
      }
      bits |= (resb>0 ? 1 : 0) * power;
      power <<= 1;
    }

    switch (next = bits) {
      case 0:
          bits = 0;
          maxpower = Math.pow(2,8);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
        c = f(bits);
        break;
      case 1:
          bits = 0;
          maxpower = Math.pow(2,16);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
        c = f(bits);
        break;
      case 2:
        return "";
    }
    dictionary[3] = c;
    w = c;
    result.push(c);
    while (true) {
      if (data.index > length) {
        return "";
      }

      bits = 0;
      maxpower = Math.pow(2,numBits);
      power=1;
      while (power!=maxpower) {
        resb = data.val & data.position;
        data.position >>= 1;
        if (data.position == 0) {
          data.position = resetValue;
          data.val = getNextValue(data.index++);
        }
        bits |= (resb>0 ? 1 : 0) * power;
        power <<= 1;
      }

      switch (c = bits) {
        case 0:
          bits = 0;
          maxpower = Math.pow(2,8);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }

          dictionary[dictSize++] = f(bits);
          c = dictSize-1;
          enlargeIn--;
          break;
        case 1:
          bits = 0;
          maxpower = Math.pow(2,16);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
          dictionary[dictSize++] = f(bits);
          c = dictSize-1;
          enlargeIn--;
          break;
        case 2:
          return result.join('');
      }

      if (enlargeIn == 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }

      if (dictionary[c]) {
        entry = dictionary[c];
      } else {
        if (c === dictSize) {
          entry = w + w.charAt(0);
        } else {
          return null;
        }
      }
      result.push(entry);

      // Add w+entry[0] to the dictionary.
      dictionary[dictSize++] = w + entry.charAt(0);
      enlargeIn--;

      w = entry;

      if (enlargeIn == 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }

    }
  }
};
  return LZString;
})();

if (true) {
  !(__WEBPACK_AMD_DEFINE_RESULT__ = (function () { return LZString; }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else {}


/***/ }),

/***/ 712:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(955);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(534)/* ["default"] */ .A)
var update = add("41c88e7e", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 77:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(520);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(534)/* ["default"] */ .A)
var update = add("3ce8da18", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 197:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(882);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(534)/* ["default"] */ .A)
var update = add("32d743bb", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 156:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(841);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(534)/* ["default"] */ .A)
var update = add("6a14b67c", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 67:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(866);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(534)/* ["default"] */ .A)
var update = add("4004f58f", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 152:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(673);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(534)/* ["default"] */ .A)
var update = add("a00d5c4c", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 391:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(812);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(534)/* ["default"] */ .A)
var update = add("1d817c21", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 688:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(407);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(534)/* ["default"] */ .A)
var update = add("0f5b62f0", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 837:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(64);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(534)/* ["default"] */ .A)
var update = add("171d407e", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 723:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(268);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(534)/* ["default"] */ .A)
var update = add("4a4b489f", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 608:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(108);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(534)/* ["default"] */ .A)
var update = add("6fcc5481", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 880:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(727);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(534)/* ["default"] */ .A)
var update = add("4460a626", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 787:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(175);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(534)/* ["default"] */ .A)
var update = add("2a395bbc", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 534:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  A: () => (/* binding */ addStylesClient)
});

;// CONCATENATED MODULE: ./node_modules/vue-style-loader/lib/listToStyles.js
/**
 * Translates the list format produced by css-loader into something
 * easier to manipulate.
 */
function listToStyles (parentId, list) {
  var styles = []
  var newStyles = {}
  for (var i = 0; i < list.length; i++) {
    var item = list[i]
    var id = item[0]
    var css = item[1]
    var media = item[2]
    var sourceMap = item[3]
    var part = {
      id: parentId + ':' + i,
      css: css,
      media: media,
      sourceMap: sourceMap
    }
    if (!newStyles[id]) {
      styles.push(newStyles[id] = { id: id, parts: [part] })
    } else {
      newStyles[id].parts.push(part)
    }
  }
  return styles
}

;// CONCATENATED MODULE: ./node_modules/vue-style-loader/lib/addStylesClient.js
/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
  Modified by Evan You @yyx990803
*/



var hasDocument = typeof document !== 'undefined'

if (typeof DEBUG !== 'undefined' && DEBUG) {
  if (!hasDocument) {
    throw new Error(
    'vue-style-loader cannot be used in a non-browser environment. ' +
    "Use { target: 'node' } in your Webpack config to indicate a server-rendering environment."
  ) }
}

/*
type StyleObject = {
  id: number;
  parts: Array<StyleObjectPart>
}

type StyleObjectPart = {
  css: string;
  media: string;
  sourceMap: ?string
}
*/

var stylesInDom = {/*
  [id: number]: {
    id: number,
    refs: number,
    parts: Array<(obj?: StyleObjectPart) => void>
  }
*/}

var head = hasDocument && (document.head || document.getElementsByTagName('head')[0])
var singletonElement = null
var singletonCounter = 0
var isProduction = false
var noop = function () {}
var options = null
var ssrIdKey = 'data-vue-ssr-id'

// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
// tags it will allow on a page
var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\b/.test(navigator.userAgent.toLowerCase())

function addStylesClient (parentId, list, _isProduction, _options) {
  isProduction = _isProduction

  options = _options || {}

  var styles = listToStyles(parentId, list)
  addStylesToDom(styles)

  return function update (newList) {
    var mayRemove = []
    for (var i = 0; i < styles.length; i++) {
      var item = styles[i]
      var domStyle = stylesInDom[item.id]
      domStyle.refs--
      mayRemove.push(domStyle)
    }
    if (newList) {
      styles = listToStyles(parentId, newList)
      addStylesToDom(styles)
    } else {
      styles = []
    }
    for (var i = 0; i < mayRemove.length; i++) {
      var domStyle = mayRemove[i]
      if (domStyle.refs === 0) {
        for (var j = 0; j < domStyle.parts.length; j++) {
          domStyle.parts[j]()
        }
        delete stylesInDom[domStyle.id]
      }
    }
  }
}

function addStylesToDom (styles /* Array<StyleObject> */) {
  for (var i = 0; i < styles.length; i++) {
    var item = styles[i]
    var domStyle = stylesInDom[item.id]
    if (domStyle) {
      domStyle.refs++
      for (var j = 0; j < domStyle.parts.length; j++) {
        domStyle.parts[j](item.parts[j])
      }
      for (; j < item.parts.length; j++) {
        domStyle.parts.push(addStyle(item.parts[j]))
      }
      if (domStyle.parts.length > item.parts.length) {
        domStyle.parts.length = item.parts.length
      }
    } else {
      var parts = []
      for (var j = 0; j < item.parts.length; j++) {
        parts.push(addStyle(item.parts[j]))
      }
      stylesInDom[item.id] = { id: item.id, refs: 1, parts: parts }
    }
  }
}

function createStyleElement () {
  var styleElement = document.createElement('style')
  styleElement.type = 'text/css'
  head.appendChild(styleElement)
  return styleElement
}

function addStyle (obj /* StyleObjectPart */) {
  var update, remove
  var styleElement = document.querySelector('style[' + ssrIdKey + '~="' + obj.id + '"]')

  if (styleElement) {
    if (isProduction) {
      // has SSR styles and in production mode.
      // simply do nothing.
      return noop
    } else {
      // has SSR styles but in dev mode.
      // for some reason Chrome can't handle source map in server-rendered
      // style tags - source maps in <style> only works if the style tag is
      // created and inserted dynamically. So we remove the server rendered
      // styles and inject new ones.
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  if (isOldIE) {
    // use singleton mode for IE9.
    var styleIndex = singletonCounter++
    styleElement = singletonElement || (singletonElement = createStyleElement())
    update = applyToSingletonTag.bind(null, styleElement, styleIndex, false)
    remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true)
  } else {
    // use multi-style-tag mode in all other cases
    styleElement = createStyleElement()
    update = applyToTag.bind(null, styleElement)
    remove = function () {
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  update(obj)

  return function updateStyle (newObj /* StyleObjectPart */) {
    if (newObj) {
      if (newObj.css === obj.css &&
          newObj.media === obj.media &&
          newObj.sourceMap === obj.sourceMap) {
        return
      }
      update(obj = newObj)
    } else {
      remove()
    }
  }
}

var replaceText = (function () {
  var textStore = []

  return function (index, replacement) {
    textStore[index] = replacement
    return textStore.filter(Boolean).join('\n')
  }
})()

function applyToSingletonTag (styleElement, index, remove, obj) {
  var css = remove ? '' : obj.css

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = replaceText(index, css)
  } else {
    var cssNode = document.createTextNode(css)
    var childNodes = styleElement.childNodes
    if (childNodes[index]) styleElement.removeChild(childNodes[index])
    if (childNodes.length) {
      styleElement.insertBefore(cssNode, childNodes[index])
    } else {
      styleElement.appendChild(cssNode)
    }
  }
}

function applyToTag (styleElement, obj) {
  var css = obj.css
  var media = obj.media
  var sourceMap = obj.sourceMap

  if (media) {
    styleElement.setAttribute('media', media)
  }
  if (options.ssrId) {
    styleElement.setAttribute(ssrIdKey, obj.id)
  }

  if (sourceMap) {
    // https://developer.chrome.com/devtools/docs/javascript-debugging
    // this makes source maps inside style tags work properly in Chrome
    css += '\n/*# sourceURL=' + sourceMap.sources[0] + ' */'
    // http://stackoverflow.com/a/26603875
    css += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + ' */'
  }

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild)
    }
    styleElement.appendChild(document.createTextNode(css))
  }
}


/***/ }),

/***/ 633:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _typeof = (__webpack_require__(738)["default"]);
function _regeneratorRuntime() {
  "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */
  module.exports = _regeneratorRuntime = function _regeneratorRuntime() {
    return e;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports;
  var t,
    e = {},
    r = Object.prototype,
    n = r.hasOwnProperty,
    o = Object.defineProperty || function (t, e, r) {
      t[e] = r.value;
    },
    i = "function" == typeof Symbol ? Symbol : {},
    a = i.iterator || "@@iterator",
    c = i.asyncIterator || "@@asyncIterator",
    u = i.toStringTag || "@@toStringTag";
  function define(t, e, r) {
    return Object.defineProperty(t, e, {
      value: r,
      enumerable: !0,
      configurable: !0,
      writable: !0
    }), t[e];
  }
  try {
    define({}, "");
  } catch (t) {
    define = function define(t, e, r) {
      return t[e] = r;
    };
  }
  function wrap(t, e, r, n) {
    var i = e && e.prototype instanceof Generator ? e : Generator,
      a = Object.create(i.prototype),
      c = new Context(n || []);
    return o(a, "_invoke", {
      value: makeInvokeMethod(t, r, c)
    }), a;
  }
  function tryCatch(t, e, r) {
    try {
      return {
        type: "normal",
        arg: t.call(e, r)
      };
    } catch (t) {
      return {
        type: "throw",
        arg: t
      };
    }
  }
  e.wrap = wrap;
  var h = "suspendedStart",
    l = "suspendedYield",
    f = "executing",
    s = "completed",
    y = {};
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  var p = {};
  define(p, a, function () {
    return this;
  });
  var d = Object.getPrototypeOf,
    v = d && d(d(values([])));
  v && v !== r && n.call(v, a) && (p = v);
  var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p);
  function defineIteratorMethods(t) {
    ["next", "throw", "return"].forEach(function (e) {
      define(t, e, function (t) {
        return this._invoke(e, t);
      });
    });
  }
  function AsyncIterator(t, e) {
    function invoke(r, o, i, a) {
      var c = tryCatch(t[r], t, o);
      if ("throw" !== c.type) {
        var u = c.arg,
          h = u.value;
        return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) {
          invoke("next", t, i, a);
        }, function (t) {
          invoke("throw", t, i, a);
        }) : e.resolve(h).then(function (t) {
          u.value = t, i(u);
        }, function (t) {
          return invoke("throw", t, i, a);
        });
      }
      a(c.arg);
    }
    var r;
    o(this, "_invoke", {
      value: function value(t, n) {
        function callInvokeWithMethodAndArg() {
          return new e(function (e, r) {
            invoke(t, n, e, r);
          });
        }
        return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
      }
    });
  }
  function makeInvokeMethod(e, r, n) {
    var o = h;
    return function (i, a) {
      if (o === f) throw Error("Generator is already running");
      if (o === s) {
        if ("throw" === i) throw a;
        return {
          value: t,
          done: !0
        };
      }
      for (n.method = i, n.arg = a;;) {
        var c = n.delegate;
        if (c) {
          var u = maybeInvokeDelegate(c, n);
          if (u) {
            if (u === y) continue;
            return u;
          }
        }
        if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) {
          if (o === h) throw o = s, n.arg;
          n.dispatchException(n.arg);
        } else "return" === n.method && n.abrupt("return", n.arg);
        o = f;
        var p = tryCatch(e, r, n);
        if ("normal" === p.type) {
          if (o = n.done ? s : l, p.arg === y) continue;
          return {
            value: p.arg,
            done: n.done
          };
        }
        "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg);
      }
    };
  }
  function maybeInvokeDelegate(e, r) {
    var n = r.method,
      o = e.iterator[n];
    if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y;
    var i = tryCatch(o, e.iterator, r.arg);
    if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y;
    var a = i.arg;
    return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y);
  }
  function pushTryEntry(t) {
    var e = {
      tryLoc: t[0]
    };
    1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e);
  }
  function resetTryEntry(t) {
    var e = t.completion || {};
    e.type = "normal", delete e.arg, t.completion = e;
  }
  function Context(t) {
    this.tryEntries = [{
      tryLoc: "root"
    }], t.forEach(pushTryEntry, this), this.reset(!0);
  }
  function values(e) {
    if (e || "" === e) {
      var r = e[a];
      if (r) return r.call(e);
      if ("function" == typeof e.next) return e;
      if (!isNaN(e.length)) {
        var o = -1,
          i = function next() {
            for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next;
            return next.value = t, next.done = !0, next;
          };
        return i.next = i;
      }
    }
    throw new TypeError(_typeof(e) + " is not iterable");
  }
  return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", {
    value: GeneratorFunctionPrototype,
    configurable: !0
  }), o(GeneratorFunctionPrototype, "constructor", {
    value: GeneratorFunction,
    configurable: !0
  }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) {
    var e = "function" == typeof t && t.constructor;
    return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name));
  }, e.mark = function (t) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t;
  }, e.awrap = function (t) {
    return {
      __await: t
    };
  }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () {
    return this;
  }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) {
    void 0 === i && (i = Promise);
    var a = new AsyncIterator(wrap(t, r, n, o), i);
    return e.isGeneratorFunction(r) ? a : a.next().then(function (t) {
      return t.done ? t.value : a.next();
    });
  }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () {
    return this;
  }), define(g, "toString", function () {
    return "[object Generator]";
  }), e.keys = function (t) {
    var e = Object(t),
      r = [];
    for (var n in e) r.push(n);
    return r.reverse(), function next() {
      for (; r.length;) {
        var t = r.pop();
        if (t in e) return next.value = t, next.done = !1, next;
      }
      return next.done = !0, next;
    };
  }, e.values = values, Context.prototype = {
    constructor: Context,
    reset: function reset(e) {
      if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t);
    },
    stop: function stop() {
      this.done = !0;
      var t = this.tryEntries[0].completion;
      if ("throw" === t.type) throw t.arg;
      return this.rval;
    },
    dispatchException: function dispatchException(e) {
      if (this.done) throw e;
      var r = this;
      function handle(n, o) {
        return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o;
      }
      for (var o = this.tryEntries.length - 1; o >= 0; --o) {
        var i = this.tryEntries[o],
          a = i.completion;
        if ("root" === i.tryLoc) return handle("end");
        if (i.tryLoc <= this.prev) {
          var c = n.call(i, "catchLoc"),
            u = n.call(i, "finallyLoc");
          if (c && u) {
            if (this.prev < i.catchLoc) return handle(i.catchLoc, !0);
            if (this.prev < i.finallyLoc) return handle(i.finallyLoc);
          } else if (c) {
            if (this.prev < i.catchLoc) return handle(i.catchLoc, !0);
          } else {
            if (!u) throw Error("try statement without catch or finally");
            if (this.prev < i.finallyLoc) return handle(i.finallyLoc);
          }
        }
      }
    },
    abrupt: function abrupt(t, e) {
      for (var r = this.tryEntries.length - 1; r >= 0; --r) {
        var o = this.tryEntries[r];
        if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) {
          var i = o;
          break;
        }
      }
      i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null);
      var a = i ? i.completion : {};
      return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a);
    },
    complete: function complete(t, e) {
      if ("throw" === t.type) throw t.arg;
      return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y;
    },
    finish: function finish(t) {
      for (var e = this.tryEntries.length - 1; e >= 0; --e) {
        var r = this.tryEntries[e];
        if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y;
      }
    },
    "catch": function _catch(t) {
      for (var e = this.tryEntries.length - 1; e >= 0; --e) {
        var r = this.tryEntries[e];
        if (r.tryLoc === t) {
          var n = r.completion;
          if ("throw" === n.type) {
            var o = n.arg;
            resetTryEntry(r);
          }
          return o;
        }
      }
      throw Error("illegal catch attempt");
    },
    delegateYield: function delegateYield(e, r, n) {
      return this.delegate = {
        iterator: values(e),
        resultName: r,
        nextLoc: n
      }, "next" === this.method && (this.arg = t), y;
    }
  }, e;
}
module.exports = _regeneratorRuntime, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 738:
/***/ ((module) => {

function _typeof(o) {
  "@babel/helpers - typeof";

  return (module.exports = _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports), _typeof(o);
}
module.exports = _typeof, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 756:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// TODO(Babel 8): Remove this file.

var runtime = __webpack_require__(633)();
module.exports = runtime;

// Copied from https://github.com/facebook/regenerator/blob/main/packages/runtime/runtime.js#L736=
try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  if (typeof globalThis === "object") {
    globalThis.regeneratorRuntime = runtime;
  } else {
    Function("r", "regeneratorRuntime = r")(runtime);
  }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  Candle: () => (/* reexport */ CandleExt),
  Constants: () => (/* reexport */ constants),
  DataCube: () => (/* reexport */ DataCube),
  Interface: () => (/* reexport */ mixins_interface),
  Overlay: () => (/* reexport */ overlay),
  Tool: () => (/* reexport */ tool),
  TradingVue: () => (/* reexport */ TradingVue),
  Utils: () => (/* reexport */ utils),
  Volbar: () => (/* reexport */ VolbarExt),
  "default": () => (/* binding */ src),
  layout_cnv: () => (/* reexport */ layout_cnv),
  layout_vol: () => (/* reexport */ layout_vol),
  primitives: () => (/* binding */ primitives)
});

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/TradingVue.vue?vue&type=template&id=d471edb6
var render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("div", {
    staticClass: "trading-vue",
    style: {
      color: this.chart_props.colors.text,
      font: this.font_comp,
      width: this.width + "px",
      height: this.height + "px"
    },
    attrs: {
      id: _vm.id
    },
    on: {
      mousedown: _vm.mousedown,
      mouseleave: _vm.mouseleave
    }
  }, [_vm.toolbar ? _c("toolbar", _vm._b({
    ref: "toolbar",
    attrs: {
      config: _vm.chart_config
    },
    on: {
      "custom-event": _vm.custom_event
    }
  }, "toolbar", _vm.chart_props, false)) : _vm._e(), _vm._v(" "), _vm.controllers.length ? _c("widgets", {
    ref: "widgets",
    attrs: {
      map: _vm.ws,
      width: _vm.width,
      height: _vm.height,
      tv: this,
      dc: _vm.data
    }
  }) : _vm._e(), _vm._v(" "), _c("chart", _vm._b({
    key: _vm.reset,
    ref: "chart",
    attrs: {
      tv_id: _vm.id,
      config: _vm.chart_config
    },
    on: {
      "custom-event": _vm.custom_event,
      "range-changed": _vm.range_changed,
      "legend-button-click": _vm.legend_button
    }
  }, "chart", _vm.chart_props, false)), _vm._v(" "), _c("transition", {
    attrs: {
      name: "tvjs-drift"
    }
  }, [_vm.tip ? _c("the-tip", {
    attrs: {
      data: _vm.tip
    },
    on: {
      "remove-me": function removeMe($event) {
        _vm.tip = null;
      }
    }
  }) : _vm._e()], 1)], 1);
};
var staticRenderFns = [];
render._withStripped = true;

;// CONCATENATED MODULE: ./src/TradingVue.vue?vue&type=template&id=d471edb6

;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/iterableToArray.js
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js




function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}
;// CONCATENATED MODULE: ./src/stuff/constants.js
var SECOND = 1000;
var MINUTE = SECOND * 60;
var MINUTE3 = MINUTE * 3;
var MINUTE5 = MINUTE * 5;
var MINUTE15 = MINUTE * 15;
var MINUTE30 = MINUTE * 30;
var HOUR = MINUTE * 60;
var HOUR4 = HOUR * 4;
var HOUR12 = HOUR * 12;
var DAY = HOUR * 24;
var WEEK = DAY * 7;
var MONTH = WEEK * 4;
var YEAR = DAY * 365;
var MONTHMAP = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Grid time steps
var TIMESCALES = [YEAR * 10, YEAR * 5, YEAR * 3, YEAR * 2, YEAR, MONTH * 6, MONTH * 4, MONTH * 3, MONTH * 2, MONTH, DAY * 15, DAY * 10, DAY * 7, DAY * 5, DAY * 3, DAY * 2, DAY, HOUR * 12, HOUR * 6, HOUR * 3, HOUR * 1.5, HOUR, MINUTE30, MINUTE15, MINUTE * 10, MINUTE5, MINUTE * 2, MINUTE];

// Grid $ steps
var $SCALES = [0.05, 0.1, 0.2, 0.25, 0.5, 0.8, 1, 2, 5];
var ChartConfig = {
  SBMIN: 60,
  // Minimal sidebar px
  SBMAX: Infinity,
  // Max sidebar, px
  TOOLBAR: 57,
  // Toolbar width px
  TB_ICON: 25,
  // Toolbar icon size px
  TB_ITEM_M: 6,
  // Toolbar item margin px
  TB_ICON_BRI: 1,
  // Toolbar icon brightness
  TB_ICON_HOLD: 420,
  // ms, wait to expand
  TB_BORDER: 1,
  // Toolbar border px
  TB_B_STYLE: 'dotted',
  // Toolbar border style
  TOOL_COLL: 7,
  // Tool collision threshold
  EXPAND: 0.15,
  // %/100 of range
  CANDLEW: 0.6,
  // %/100 of step
  GRIDX: 100,
  // px
  GRIDY: 47,
  // px
  BOTBAR: 28,
  // px
  PANHEIGHT: 22,
  // px
  DEFAULT_LEN: 50,
  // candles
  MINIMUM_LEN: 5,
  // candles,
  MIN_ZOOM: 25,
  // candles
  MAX_ZOOM: 1000,
  // candles,
  VOLSCALE: 0.15,
  // %/100 of height
  UX_OPACITY: 0.9,
  // Ux background opacity
  ZOOM_MODE: 'tv',
  // 'tv' or 'tl'
  L_BTN_SIZE: 21,
  // Legend Button size, px
  L_BTN_MARGIN: '-6px 0 -6px 0',
  // css margin
  SCROLL_WHEEL: 'prevent' // 'pass', 'click'
};
ChartConfig.FONT = "11px -apple-system,BlinkMacSystemFont,\n    Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,\n    Fira Sans,Droid Sans,Helvetica Neue,\n    sans-serif";
var IB_TF_WARN = "When using IB mode you should specify " + "timeframe ('tf' filed in 'chart' object)," + "otherwise you can get an unexpected behaviour";
var MAP_UNIT = {
  "1s": SECOND,
  "5s": SECOND * 5,
  "10s": SECOND * 10,
  "20s": SECOND * 20,
  "30s": SECOND * 30,
  "1m": MINUTE,
  "3m": MINUTE3,
  "5m": MINUTE5,
  "15m": MINUTE15,
  "30m": MINUTE30,
  "1H": HOUR,
  "2H": HOUR * 2,
  "3H": HOUR * 3,
  "4H": HOUR4,
  "12H": HOUR12,
  "1D": DAY,
  "1W": WEEK,
  "1M": MONTH,
  "1Y": YEAR
};
/* harmony default export */ const constants = ({
  SECOND: SECOND,
  MINUTE: MINUTE,
  MINUTE5: MINUTE5,
  MINUTE15: MINUTE15,
  MINUTE30: MINUTE30,
  HOUR: HOUR,
  HOUR4: HOUR4,
  DAY: DAY,
  WEEK: WEEK,
  MONTH: MONTH,
  YEAR: YEAR,
  MONTHMAP: MONTHMAP,
  TIMESCALES: TIMESCALES,
  $SCALES: $SCALES,
  ChartConfig: ChartConfig,
  map_unit: MAP_UNIT,
  IB_TF_WARN: IB_TF_WARN
});
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Chart.vue?vue&type=template&id=f7d40a04
var Chartvue_type_template_id_f7d40a04_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("div", {
    staticClass: "trading-vue-chart",
    style: _vm.styles
  }, [_c("keyboard", {
    ref: "keyboard"
  }), _vm._v(" "), _vm._l(this._layout.grids, function (grid, i) {
    return _c("grid-section", {
      key: grid.id,
      ref: "sec",
      refInFor: true,
      attrs: {
        common: _vm.section_props(i),
        grid_id: i
      },
      on: {
        "register-kb-listener": _vm.register_kb,
        "remove-kb-listener": _vm.remove_kb,
        "range-changed": _vm.range_changed,
        "cursor-changed": _vm.cursor_changed,
        "cursor-locked": _vm.cursor_locked,
        "sidebar-transform": _vm.set_ytransform,
        "layer-meta-props": _vm.layer_meta_props,
        "custom-event": _vm.emit_custom_event,
        "legend-button-click": _vm.legend_button_click
      }
    });
  }), _vm._v(" "), _c("botbar", _vm._b({
    attrs: {
      shaders: _vm.shaders,
      timezone: _vm.timezone
    }
  }, "botbar", _vm.botbar_props, false))], 2);
};
var Chartvue_type_template_id_f7d40a04_staticRenderFns = [];
Chartvue_type_template_id_f7d40a04_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/Chart.vue?vue&type=template&id=f7d40a04

;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js
function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e,
      n,
      i,
      u,
      a = [],
      f = !0,
      o = !1;
    try {
      if (i = (t = t.call(r)).next, 0 === l) {
        if (Object(t) !== t) return;
        f = !1;
      } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
    } catch (r) {
      o = !0, n = r;
    } finally {
      try {
        if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/nonIterableRest.js
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/slicedToArray.js




function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}
;// CONCATENATED MODULE: ./src/stuff/context.js
// Canvas context for text measurments

function Context($p) {
  var el = document.createElement('canvas');
  var ctx = el.getContext("2d");
  ctx.font = $p.font;
  return ctx;
}
/* harmony default export */ const context = (Context);
// EXTERNAL MODULE: ./node_modules/arrayslicer/lib/index.js
var lib = __webpack_require__(74);
var lib_default = /*#__PURE__*/__webpack_require__.n(lib);
;// CONCATENATED MODULE: ./src/stuff/utils.js



/* harmony default export */ const utils = ({
  clamp: function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
  },
  add_zero: function add_zero(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  },
  // Start of the day (zero millisecond)
  day_start: function day_start(t) {
    var start = new Date(t);
    return start.setUTCHours(0, 0, 0, 0);
  },
  // Start of the month
  month_start: function month_start(t) {
    var date = new Date(t);
    return Date.UTC(date.getFullYear(), date.getMonth(), 1);
  },
  // Start of the year
  year_start: function year_start(t) {
    return Date.UTC(new Date(t).getFullYear());
  },
  get_year: function get_year(t) {
    if (!t) return undefined;
    return new Date(t).getUTCFullYear();
  },
  get_month: function get_month(t) {
    if (!t) return undefined;
    return new Date(t).getUTCMonth();
  },
  // Nearest in array
  nearest_a: function nearest_a(x, array) {
    var dist = Infinity;
    var val = null;
    var index = -1;
    for (var i = 0; i < array.length; i++) {
      var xi = array[i];
      if (Math.abs(xi - x) < dist) {
        dist = Math.abs(xi - x);
        val = xi;
        index = i;
      }
    }
    return [index, val];
  },
  round: function round(num, decimals) {
    if (decimals === void 0) {
      decimals = 8;
    }
    return parseFloat(num.toFixed(decimals));
  },
  // Strip? No, it's ugly floats in js
  strip: function strip(number) {
    return parseFloat(parseFloat(number).toPrecision(12));
  },
  get_day: function get_day(t) {
    return t ? new Date(t).getDate() : null;
  },
  // Update array keeping the same reference
  overwrite: function overwrite(arr, new_arr) {
    arr.splice.apply(arr, [0, arr.length].concat(_toConsumableArray(new_arr)));
  },
  // Copy layout in reactive way
  copy_layout: function copy_layout(obj, new_obj) {
    for (var k in obj) {
      if (Array.isArray(obj[k])) {
        // (some offchart indicators are added/removed)
        // we need to update layout in a reactive way
        if (obj[k].length !== new_obj[k].length) {
          this.overwrite(obj[k], new_obj[k]);
          continue;
        }
        for (var m in obj[k]) {
          Object.assign(obj[k][m], new_obj[k][m]);
        }
      } else {
        Object.assign(obj[k], new_obj[k]);
      }
    }
  },
  // Detects candles interval
  detect_interval: function detect_interval(ohlcv) {
    var len = Math.min(ohlcv.length - 1, 99);
    var min = Infinity;
    ohlcv.slice(0, len).forEach(function (x, i) {
      var d = ohlcv[i + 1][0] - x[0];
      if (d === d && d < min) min = d;
    });
    // This saves monthly chart from being awkward
    if (min >= constants.MONTH && min <= constants.DAY * 30) {
      return constants.DAY * 31;
    }
    return min;
  },
  // Gets numberic part of overlay id (e.g 'EMA_1' = > 1)
  get_num_id: function get_num_id(id) {
    return parseInt(id.split('_').pop());
  },
  // Fast filter. Really fast, like 10X
  fast_filter: function fast_filter(arr, t1, t2) {
    if (!arr.length) return [arr, undefined];
    try {
      var ia = new (lib_default())(arr, "0");
      var res = ia.getRange(t1, t2);
      var i0 = ia.valpos[t1].next;
      return [res, i0];
    } catch (e) {
      // Something wrong with fancy slice lib
      // Fast fix: fallback to filter
      return [arr.filter(function (x) {
        return x[0] >= t1 && x[0] <= t2;
      }), 0];
    }
  },
  // Fast filter (index-based)
  fast_filter_i: function fast_filter_i(arr, t1, t2) {
    if (!arr.length) return [arr, undefined];
    var i1 = Math.floor(t1);
    if (i1 < 0) i1 = 0;
    var i2 = Math.floor(t2 + 1);
    var res = arr.slice(i1, i2);
    return [res, i1];
  },
  // Nearest indexes (left and right)
  fast_nearest: function fast_nearest(arr, t1) {
    var ia = new (lib_default())(arr, "0");
    ia.fetch(t1);
    return [ia.nextlow, ia.nexthigh];
  },
  now: function now() {
    return new Date().getTime();
  },
  pause: function pause(delay) {
    return new Promise(function (rs, rj) {
      return setTimeout(rs, delay);
    });
  },
  // Limit crazy wheel delta values
  smart_wheel: function smart_wheel(delta) {
    var abs = Math.abs(delta);
    if (abs > 500) {
      return (200 + Math.log(abs)) * Math.sign(delta);
    }
    return delta;
  },
  // Parse the original mouse event to find deltaX
  get_deltaX: function get_deltaX(event) {
    return event.originalEvent.deltaX / 12;
  },
  // Parse the original mouse event to find deltaY
  get_deltaY: function get_deltaY(event) {
    return event.originalEvent.deltaY / 12;
  },
  // Apply opacity to a hex color
  apply_opacity: function apply_opacity(c, op) {
    if (c.length === 7) {
      var n = Math.floor(op * 255);
      n = this.clamp(n, 0, 255);
      c += n.toString(16);
    }
    return c;
  },
  // Parse timeframe or return value in ms
  parse_tf: function parse_tf(smth) {
    if (typeof smth === 'string') {
      return constants.map_unit[smth];
    } else {
      return smth;
    }
  },
  // Detect index shift between the main data sub
  // and the overlay's sub (for IB-mode)
  index_shift: function index_shift(sub, data) {
    // Find the second timestamp (by value)
    if (!data.length) return 0;
    var first = data[0][0];
    var second;
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] !== first) {
        second = data[i][0];
        break;
      }
    }
    for (var j = 0; j < sub.length; j++) {
      if (sub[j][0] === second) {
        return j - i;
      }
    }
    return 0;
  },
  // Fallback fix for Brave browser
  // https://github.com/brave/brave-browser/issues/1738
  measureText: function measureText(ctx, text, tv_id) {
    var m = ctx.measureTextOrg(text);
    if (m.width === 0) {
      var doc = document;
      var id = 'tvjs-measure-text';
      var el = doc.getElementById(id);
      if (!el) {
        var base = doc.getElementById(tv_id);
        el = doc.createElement("div");
        el.id = id;
        el.style.position = 'absolute';
        el.style.top = '-1000px';
        base.appendChild(el);
      }
      if (ctx.font) el.style.font = ctx.font;
      el.innerText = text.replace(/ /g, '.');
      return {
        width: el.offsetWidth
      };
    } else {
      return m;
    }
  },
  uuid: function uuid(temp) {
    if (temp === void 0) {
      temp = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    }
    return temp.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : r & 0x3 | 0x8;
      return v.toString(16);
    });
  },
  uuid2: function uuid2() {
    return this.uuid('xxxxxxxxxxxx');
  },
  // Delayed warning, f = condition lambda fn
  warn: function warn(f, text, delay) {
    if (delay === void 0) {
      delay = 0;
    }
    setTimeout(function () {
      if (f()) console.warn(text);
    }, delay);
  },
  // Checks if script props updated
  // (and not style settings or something else)
  is_scr_props_upd: function is_scr_props_upd(n, prev) {
    var p = prev.find(function (x) {
      return x.v.$uuid === n.v.$uuid;
    });
    if (!p) return false;
    var props = n.p.settings.$props;
    if (!props) return false;
    return props.some(function (x) {
      return n.v[x] !== p.v[x];
    });
  },
  // Checks if it's time to make a script update
  // (based on execInterval in ms)
  delayed_exec: function delayed_exec(v) {
    if (!v.script || !v.script.execInterval) return true;
    var t = this.now();
    var dt = v.script.execInterval;
    if (!v.settings.$last_exec || t > v.settings.$last_exec + dt) {
      v.settings.$last_exec = t;
      return true;
    }
    return false;
  },
  // Format names such 'RSI, $length', where
  // length - is one of the settings
  format_name: function format_name(ov) {
    if (!ov.name) return undefined;
    var name = ov.name;
    for (var k in ov.settings || {}) {
      var val = ov.settings[k];
      var reg = new RegExp("\\$".concat(k), 'g');
      name = name.replace(reg, val);
    }
    return name;
  },
  // Default cursor mode
  xmode: function xmode() {
    return this.is_mobile ? 'explore' : 'default';
  },
  default_prevented: function default_prevented(event) {
    if (event.original) {
      return event.original.defaultPrevented;
    }
    return event.defaultPrevented;
  },
  // WTF with modern web development
  is_mobile: function (w) {
    return 'onorientationchange' in w && (!!navigator.maxTouchPoints || !!navigator.msMaxTouchPoints || 'ontouchstart' in w || w.DocumentTouch && document instanceof w.DocumentTouch);
  }(typeof window !== 'undefined' ? window : {})
});
;// CONCATENATED MODULE: ./src/stuff/math.js
// Math/Geometry

/* harmony default export */ const math = ({
  // Distance from point to line
  // p1 = point, (p2, p3) = line
  point2line: function point2line(p1, p2, p3) {
    var _this$tri = this.tri(p1, p2, p3),
      area = _this$tri.area,
      base = _this$tri.base;
    return Math.abs(this.tri_h(area, base));
  },
  // Distance from point to segment
  // p1 = point, (p2, p3) = segment
  point2seg: function point2seg(p1, p2, p3) {
    var _this$tri2 = this.tri(p1, p2, p3),
      area = _this$tri2.area,
      base = _this$tri2.base;
    // Vector projection
    var proj = this.dot_prod(p1, p2, p3) / base;
    // Distance from left pin
    var l1 = Math.max(-proj, 0);
    // Distance from right pin
    var l2 = Math.max(proj - base, 0);
    // Normal
    var h = Math.abs(this.tri_h(area, base));
    return Math.max(h, l1, l2);
  },
  // Distance from point to ray
  // p1 = point, (p2, p3) = ray
  point2ray: function point2ray(p1, p2, p3) {
    var _this$tri3 = this.tri(p1, p2, p3),
      area = _this$tri3.area,
      base = _this$tri3.base;
    // Vector projection
    var proj = this.dot_prod(p1, p2, p3) / base;
    // Distance from left pin
    var l1 = Math.max(-proj, 0);
    // Normal
    var h = Math.abs(this.tri_h(area, base));
    return Math.max(h, l1);
  },
  tri: function tri(p1, p2, p3) {
    var area = this.area(p1, p2, p3);
    var dx = p3[0] - p2[0];
    var dy = p3[1] - p2[1];
    var base = Math.sqrt(dx * dx + dy * dy);
    return {
      area: area,
      base: base
    };
  },
  /* Area of triangle:
          p1
        /    \
      p2  _  p3
  */
  area: function area(p1, p2, p3) {
    return p1[0] * (p2[1] - p3[1]) + p2[0] * (p3[1] - p1[1]) + p3[0] * (p1[1] - p2[1]);
  },
  // Triangle height
  tri_h: function tri_h(area, base) {
    return area / base;
  },
  // Dot product of (p2, p3) and (p2, p1)
  dot_prod: function dot_prod(p1, p2, p3) {
    var v1 = [p3[0] - p2[0], p3[1] - p2[1]];
    var v2 = [p1[0] - p2[0], p1[1] - p2[1]];
    return v1[0] * v2[0] + v1[1] * v2[1];
  },
  // Symmetrical log
  log: function log(x) {
    // TODO: log for small values
    return Math.sign(x) * Math.log(Math.abs(x) + 1);
  },
  // Symmetrical exp
  exp: function exp(x) {
    return Math.sign(x) * (Math.exp(Math.abs(x)) - 1);
  },
  // Middle line on log scale based on range & px height
  log_mid: function log_mid(r, h) {
    var log_hi = this.log(r[0]);
    var log_lo = this.log(r[1]);
    var px = h / 2;
    var gx = log_hi - px * (log_hi - log_lo) / h;
    return this.exp(gx);
  },
  // Return new adjusted range, based on the previous
  // range, new $_hi, target middle line
  re_range: function re_range(r1, hi2, mid) {
    var log_hi1 = this.log(r1[0]);
    var log_lo1 = this.log(r1[1]);
    var log_hi2 = this.log(hi2);
    var log_$ = this.log(mid);
    var W = (log_hi2 - log_$) * (log_hi1 - log_lo1) / (log_hi1 - log_$);
    return this.exp(log_hi2 - W);
  } // Return new adjusted range, based on the previous
  // range, new $_hi, target middle line + dy (shift)
  // WASTE
  /*range_shift(r1, hi2, mid, dy, h) {
      let log_hi1 = this.log(r1[0])
      let log_lo1 = this.log(r1[1])
      let log_hi2 = this.log(hi2)
      let log_$ = this.log(mid)
       let W = h * (log_hi2 - log_$) /
              (h * (log_hi1 - log_$) / (log_hi1 - log_lo1) + dy)
       return this.exp(log_hi2 - W)
   }*/
});
;// CONCATENATED MODULE: ./src/components/js/layout_fn.js
// Layout functional interface



/* harmony default export */ function layout_fn(self, range) {
  var ib = self.ti_map.ib;
  var dt = range[1] - range[0];
  var r = self.spacex / dt;
  var ls = self.grid.logScale || false;
  Object.assign(self, {
    // Time to screen coordinates
    t2screen: function t2screen(t) {
      if (ib) t = self.ti_map.smth2i(t);
      return Math.floor((t - range[0]) * r) - 0.5;
    },
    // $ to screen coordinates
    $2screen: function $2screen(y) {
      if (ls) y = math.log(y);
      return Math.floor(y * self.A + self.B) - 0.5;
    },
    // Time-axis nearest step
    t_magnet: function t_magnet(t) {
      if (ib) t = self.ti_map.smth2i(t);
      var cn = self.candles || self.master_grid.candles;
      var arr = cn.map(function (x) {
        return x.raw[0];
      });
      var i = utils.nearest_a(t, arr)[0];
      if (!cn[i]) return;
      return Math.floor(cn[i].x) - 0.5;
    },
    // Screen-Y to dollar value (or whatever)
    screen2$: function screen2$(y) {
      if (ls) return math.exp((y - self.B) / self.A);
      return (y - self.B) / self.A;
    },
    // Screen-X to timestamp
    screen2t: function screen2t(x) {
      // TODO: most likely Math.floor not needed
      // return Math.floor(range[0] + x / r)
      return range[0] + x / r;
    },
    // $-axis nearest step
    $_magnet: function $_magnet(price) {},
    // Nearest candlestick
    c_magnet: function c_magnet(t) {
      var cn = self.candles || self.master_grid.candles;
      var arr = cn.map(function (x) {
        return x.raw[0];
      });
      var i = utils.nearest_a(t, arr)[0];
      return cn[i];
    },
    // Nearest data points
    data_magnet: function data_magnet(t) {/* TODO: implement */}
  });
  return self;
}
;// CONCATENATED MODULE: ./src/components/js/log_scale.js
// Log-scale mode helpers

// TODO: all-negative numbers (sometimes wrong scaling)


/* harmony default export */ const log_scale = ({
  candle: function candle(self, mid, p, $p) {
    return {
      x: mid,
      w: self.px_step * $p.config.CANDLEW,
      o: Math.floor(math.log(p[1]) * self.A + self.B),
      h: Math.floor(math.log(p[2]) * self.A + self.B),
      l: Math.floor(math.log(p[3]) * self.A + self.B),
      c: Math.floor(math.log(p[4]) * self.A + self.B),
      raw: p
    };
  },
  expand: function expand(self, height) {
    // expand log scale
    var A = -height / (math.log(self.$_hi) - math.log(self.$_lo));
    var B = -math.log(self.$_hi) * A;
    var top = -height * 0.1;
    var bot = height * 1.1;
    self.$_hi = math.exp((top - B) / A);
    self.$_lo = math.exp((bot - B) / A);
  }
});
;// CONCATENATED MODULE: ./src/components/js/grid_maker.js






var grid_maker_TIMESCALES = constants.TIMESCALES,
  grid_maker_$SCALES = constants.$SCALES,
  grid_maker_WEEK = constants.WEEK,
  grid_maker_MONTH = constants.MONTH,
  grid_maker_YEAR = constants.YEAR,
  grid_maker_HOUR = constants.HOUR,
  grid_maker_DAY = constants.DAY;
var MAX_INT = Number.MAX_SAFE_INTEGER;

// master_grid - ref to the master grid
function GridMaker(id, params, master_grid) {
  if (master_grid === void 0) {
    master_grid = null;
  }
  var sub = params.sub,
    interval = params.interval,
    range = params.range,
    ctx = params.ctx,
    $p = params.$p,
    layers_meta = params.layers_meta,
    height = params.height,
    y_t = params.y_t,
    ti_map = params.ti_map,
    grid = params.grid,
    timezone = params.timezone;
  var self = {
    ti_map: ti_map
  };
  var lm = layers_meta[id];
  var y_range_fn = null;
  var ls = grid.logScale;
  if (lm && Object.keys(lm).length) {
    // Gets last y_range fn()
    var yrs = Object.values(lm).filter(function (x) {
      return x.y_range;
    });
    // The first y_range() determines the range
    if (yrs.length) y_range_fn = yrs[0].y_range;
  }

  // Calc vertical ($/₿) range
  function calc_$range() {
    if (!master_grid) {
      // $ candlestick range
      if (y_range_fn) {
        var _y_range_fn = y_range_fn(hi, lo),
          _y_range_fn2 = _slicedToArray(_y_range_fn, 2),
          hi = _y_range_fn2[0],
          lo = _y_range_fn2[1];
      } else {
        hi = -Infinity, lo = Infinity;
        for (var i = 0, n = sub.length; i < n; i++) {
          var x = sub[i];
          if (x[2] > hi) hi = x[2];
          if (x[3] < lo) lo = x[3];
        }
      }
    } else {
      // Offchart indicator range
      hi = -Infinity, lo = Infinity;
      for (var i = 0; i < sub.length; i++) {
        for (var j = 1; j < sub[i].length; j++) {
          var v = sub[i][j];
          if (v > hi) hi = v;
          if (v < lo) lo = v;
        }
      }
      if (y_range_fn) {
        var _y_range_fn3 = y_range_fn(hi, lo),
          _y_range_fn4 = _slicedToArray(_y_range_fn3, 3),
          hi = _y_range_fn4[0],
          lo = _y_range_fn4[1],
          exp = _y_range_fn4[2];
      }
    }

    // Fixed y-range in non-auto mode
    if (y_t && !y_t.auto && y_t.range) {
      self.$_hi = y_t.range[0];
      self.$_lo = y_t.range[1];
    } else {
      if (!ls) {
        exp = exp === false ? 0 : 1;
        self.$_hi = hi + (hi - lo) * $p.config.EXPAND * exp;
        self.$_lo = lo - (hi - lo) * $p.config.EXPAND * exp;
      } else {
        self.$_hi = hi;
        self.$_lo = lo;
        log_scale.expand(self, height);
      }
      if (self.$_hi === self.$_lo) {
        if (!ls) {
          self.$_hi *= 1.05; // Expand if height range === 0
          self.$_lo *= 0.95;
        } else {
          log_scale.expand(self, height);
        }
      }
    }
  }
  function calc_sidebar() {
    if (sub.length < 2) {
      self.prec = 0;
      self.sb = $p.config.SBMIN;
      return;
    }

    // TODO: improve sidebar width calculation
    // at transition point, when one precision is
    // replaced with another

    // Gets formated levels (their lengths),
    // calculates max and measures the sidebar length
    // from it:

    // TODO: add custom formatter f()

    self.prec = calc_precision(sub);
    var lens = [];
    lens.push(self.$_hi.toFixed(self.prec).length);
    lens.push(self.$_lo.toFixed(self.prec).length);
    var str = '0'.repeat(Math.max.apply(Math, lens)) + '    ';
    self.sb = ctx.measureText(str).width;
    self.sb = Math.max(Math.floor(self.sb), $p.config.SBMIN);
    self.sb = Math.min(self.sb, $p.config.SBMAX);
  }

  // Calculate $ precision for the Y-axis
  function calc_precision(data) {
    var max_r = 0,
      max_l = 0;
    var min = Infinity;
    var max = -Infinity;

    // Speed UP
    for (var i = 0, n = data.length; i < n; i++) {
      var x = data[i];
      if (x[1] > max) max = x[1];else if (x[1] < min) min = x[1];
    }
    // Get max lengths of integer and fractional parts
    [min, max].forEach(function (x) {
      // Fix undefined bug
      var str = x != null ? x.toString() : '';
      if (x < 0.000001) {
        // Parsing the exponential form. Gosh this
        // smells trickily
        var _str$split = str.split('e-'),
          _str$split2 = _slicedToArray(_str$split, 2),
          ls = _str$split2[0],
          rs = _str$split2[1];
        var _ls$split = ls.split('.'),
          _ls$split2 = _slicedToArray(_ls$split, 2),
          l = _ls$split2[0],
          r = _ls$split2[1];
        if (!r) r = '';
        r = {
          length: r.length + parseInt(rs) || 0
        };
      } else {
        var _str$split3 = str.split('.'),
          _str$split4 = _slicedToArray(_str$split3, 2),
          l = _str$split4[0],
          r = _str$split4[1];
      }
      if (r && r.length > max_r) {
        max_r = r.length;
      }
      if (l && l.length > max_l) {
        max_l = l.length;
      }
    });

    // Select precision scheme depending
    // on the left and right part lengths
    //
    var even = max_r - max_r % 2 + 2;
    if (max_l === 1) {
      return Math.min(8, Math.max(2, even));
    }
    if (max_l <= 2) {
      return Math.min(4, Math.max(2, even));
    }
    return 2;
  }
  function calc_positions() {
    if (sub.length < 2) return;
    var dt = range[1] - range[0];

    // A pixel space available to draw on (x-axis)
    self.spacex = $p.width - self.sb;

    // Candle capacity
    var capacity = dt / interval;
    self.px_step = self.spacex / capacity;

    // px / time ratio
    var r = self.spacex / dt;
    self.startx = (sub[0][0] - range[0]) * r;

    // Candle Y-transform: (A = scale, B = shift)
    if (!grid.logScale) {
      self.A = -height / (self.$_hi - self.$_lo);
      self.B = -self.$_hi * self.A;
    } else {
      self.A = -height / (math.log(self.$_hi) - math.log(self.$_lo));
      self.B = -math.log(self.$_hi) * self.A;
    }
  }

  // Select nearest good-loking t step (m is target scale)
  function time_step() {
    var k = ti_map.ib ? 60000 : 1;
    var xrange = (range[1] - range[0]) * k;
    var m = xrange * ($p.config.GRIDX / $p.width);
    var s = grid_maker_TIMESCALES;
    return utils.nearest_a(m, s)[1] / k;
  }

  // Select nearest good-loking $ step (m is target scale)
  function dollar_step() {
    var yrange = self.$_hi - self.$_lo;
    var m = yrange * ($p.config.GRIDY / height);
    var p = parseInt(yrange.toExponential().split('e')[1]);
    var d = Math.pow(10, p);
    var s = grid_maker_$SCALES.map(function (x) {
      return x * d;
    });

    // TODO: center the range (look at RSI for example,
    // it looks ugly when "80" is near the top)
    return utils.strip(utils.nearest_a(m, s)[1]);
  }
  function dollar_mult() {
    var mult_hi = dollar_mult_hi();
    var mult_lo = dollar_mult_lo();
    return Math.max(mult_hi, mult_lo);
  }

  // Price step multiplier (for the log-scale mode)
  function dollar_mult_hi() {
    var h = Math.min(self.B, height);
    if (h < $p.config.GRIDY) return 1;
    var n = h / $p.config.GRIDY; // target grid N
    var yrange = self.$_hi;
    if (self.$_lo > 0) {
      var yratio = self.$_hi / self.$_lo;
    } else {
      yratio = self.$_hi / 1; // TODO: small values
    }
    var m = yrange * ($p.config.GRIDY / h);
    var p = parseInt(yrange.toExponential().split('e')[1]);
    return Math.pow(yratio, 1 / n);
  }
  function dollar_mult_lo() {
    var h = Math.min(height - self.B, height);
    if (h < $p.config.GRIDY) return 1;
    var n = h / $p.config.GRIDY; // target grid N
    var yrange = Math.abs(self.$_lo);
    if (self.$_hi < 0 && self.$_lo < 0) {
      var yratio = Math.abs(self.$_lo / self.$_hi);
    } else {
      yratio = Math.abs(self.$_lo) / 1;
    }
    var m = yrange * ($p.config.GRIDY / h);
    var p = parseInt(yrange.toExponential().split('e')[1]);
    return Math.pow(yratio, 1 / n);
  }
  function grid_x() {
    // If this is a subgrid, no need to calc a timeline,
    // we just borrow it from the master_grid
    if (!master_grid) {
      self.t_step = time_step();
      self.xs = [];
      var dt = range[1] - range[0];
      var r = self.spacex / dt;

      /* TODO: remove the left-side glitch
       let year_0 = Utils.get_year(sub[0][0])
      for (var t0 = year_0; t0 < range[0]; t0 += self.t_step) {}
       let m0 = Utils.get_month(t0)*/

      for (var i = 0; i < sub.length; i++) {
        var p = sub[i];
        var prev = sub[i - 1] || [];
        var prev_xs = self.xs[self.xs.length - 1] || [0, []];
        var x = Math.floor((p[0] - range[0]) * r);
        insert_line(prev, p, x);

        // Filtering lines that are too near
        var xs = self.xs[self.xs.length - 1] || [0, []];
        if (prev_xs === xs) continue;
        if (xs[1][0] - prev_xs[1][0] < self.t_step * 0.8) {
          // prev_xs is a higher "rank" label
          if (xs[2] <= prev_xs[2]) {
            self.xs.pop();
          } else {
            // Otherwise
            self.xs.splice(self.xs.length - 2, 1);
          }
        }
      }

      // TODO: fix grid extension for bigger timeframes
      if (interval < grid_maker_WEEK && r > 0) {
        extend_left(dt, r);
        extend_right(dt, r);
      }
    } else {
      self.t_step = master_grid.t_step;
      self.px_step = master_grid.px_step;
      self.startx = master_grid.startx;
      self.xs = master_grid.xs;
    }
  }
  function insert_line(prev, p, x, m0) {
    var prev_t = ti_map.ib ? ti_map.i2t(prev[0]) : prev[0];
    var p_t = ti_map.ib ? ti_map.i2t(p[0]) : p[0];
    if (ti_map.tf < grid_maker_DAY) {
      prev_t += timezone * grid_maker_HOUR;
      p_t += timezone * grid_maker_HOUR;
    }
    var d = timezone * grid_maker_HOUR;

    // TODO: take this block =========> (see below)
    if ((prev[0] || interval === grid_maker_YEAR) && utils.get_year(p_t) !== utils.get_year(prev_t)) {
      self.xs.push([x, p, grid_maker_YEAR]); // [px, [...], rank]
    } else if (prev[0] && utils.get_month(p_t) !== utils.get_month(prev_t)) {
      self.xs.push([x, p, grid_maker_MONTH]);
    }
    // TODO: should be added if this day !== prev day
    // And the same for 'botbar.js', TODO(*)
    else if (utils.day_start(p_t) === p_t) {
      self.xs.push([x, p, grid_maker_DAY]);
    } else if (p[0] % self.t_step === 0) {
      self.xs.push([x, p, interval]);
    }
  }
  function extend_left(dt, r) {
    if (!self.xs.length || !isFinite(r)) return;
    var t = self.xs[0][1][0];
    while (true) {
      t -= self.t_step;
      var x = Math.floor((t - range[0]) * r);
      if (x < 0) break;
      // TODO: ==========> And insert it here somehow
      if (t % interval === 0) {
        self.xs.unshift([x, [t], interval]);
      }
    }
  }
  function extend_right(dt, r) {
    if (!self.xs.length || !isFinite(r)) return;
    var t = self.xs[self.xs.length - 1][1][0];
    while (true) {
      t += self.t_step;
      var x = Math.floor((t - range[0]) * r);
      if (x > self.spacex) break;
      if (t % interval === 0) {
        self.xs.push([x, [t], interval]);
      }
    }
  }
  function grid_y() {
    // Prevent duplicate levels
    var m = Math.pow(10, -self.prec);
    self.$_step = Math.max(m, dollar_step());
    self.ys = [];
    var y1 = self.$_lo - self.$_lo % self.$_step;
    for (var y$ = y1; y$ <= self.$_hi; y$ += self.$_step) {
      var y = Math.floor(y$ * self.A + self.B);
      if (y > height) continue;
      self.ys.push([y, utils.strip(y$)]);
    }
  }
  function grid_y_log() {
    // TODO: Prevent duplicate levels, is this even
    // a problem here ?
    self.$_mult = dollar_mult();
    self.ys = [];
    if (!sub.length) return;
    var v = Math.abs(sub[sub.length - 1][1] || 1);
    var y1 = search_start_pos(v);
    var y2 = search_start_neg(-v);
    var yp = -Infinity; // Previous y value
    var n = height / $p.config.GRIDY; // target grid N

    var q = 1 + (self.$_mult - 1) / 2;

    // Over 0
    for (var y$ = y1; y$ > 0; y$ /= self.$_mult) {
      y$ = log_rounder(y$, q);
      var y = Math.floor(math.log(y$) * self.A + self.B);
      self.ys.push([y, utils.strip(y$)]);
      if (y > height) break;
      if (y - yp < $p.config.GRIDY * 0.7) break;
      if (self.ys.length > n + 1) break;
      yp = y;
    }

    // Under 0
    yp = Infinity;
    for (var y$ = y2; y$ < 0; y$ /= self.$_mult) {
      y$ = log_rounder(y$, q);
      var _y = Math.floor(math.log(y$) * self.A + self.B);
      if (yp - _y < $p.config.GRIDY * 0.7) break;
      self.ys.push([_y, utils.strip(y$)]);
      if (_y < 0) break;
      if (self.ys.length > n * 3 + 1) break;
      yp = _y;
    }

    // TODO: remove lines near to 0
  }

  // Search a start for the top grid so that
  // the fixed value always included
  function search_start_pos(value) {
    var N = height / $p.config.GRIDY; // target grid N
    var y = Infinity,
      y$ = value,
      count = 0;
    while (y > 0) {
      y = Math.floor(math.log(y$) * self.A + self.B);
      y$ *= self.$_mult;
      if (count++ > N * 3) return 0; // Prevents deadloops
    }
    return y$;
  }
  function search_start_neg(value) {
    var N = height / $p.config.GRIDY; // target grid N
    var y = -Infinity,
      y$ = value,
      count = 0;
    while (y < height) {
      y = Math.floor(math.log(y$) * self.A + self.B);
      y$ *= self.$_mult;
      if (count++ > N * 3) break; // Prevents deadloops
    }
    return y$;
  }

  // Make log scale levels look great again
  function log_rounder(x, quality) {
    var s = Math.sign(x);
    x = Math.abs(x);
    if (x > 10) {
      for (var div = 10; div < MAX_INT; div *= 10) {
        var nice = Math.floor(x / div) * div;
        if (x / nice > quality) {
          // More than 10% off
          break;
        }
      }
      div /= 10;
      return s * Math.floor(x / div) * div;
    } else if (x < 1) {
      for (var ro = 10; ro >= 1; ro--) {
        var _nice = utils.round(x, ro);
        if (x / _nice > quality) {
          // More than 10% off
          break;
        }
      }
      return s * utils.round(x, ro + 1);
    } else {
      return s * Math.floor(x);
    }
  }
  function apply_sizes() {
    self.width = $p.width - self.sb;
    self.height = height;
  }
  calc_$range();
  calc_sidebar();
  return {
    // First we need to calculate max sidebar width
    // (among all grids). Then we can actually make
    // them
    create: function create() {
      calc_positions();
      grid_x();
      if (grid.logScale) {
        grid_y_log();
      } else {
        grid_y();
      }
      apply_sizes();

      // Link to the master grid (candlesticks)
      if (master_grid) {
        self.master_grid = master_grid;
      }
      self.grid = grid; // Grid params

      // Here we add some helpful functions for
      // plugin creators
      return layout_fn(self, range);
    },
    get_layout: function get_layout() {
      return self;
    },
    set_sidebar: function set_sidebar(v) {
      return self.sb = v;
    },
    get_sidebar: function get_sidebar() {
      return self.sb;
    }
  };
}
/* harmony default export */ const grid_maker = (GridMaker);
;// CONCATENATED MODULE: ./src/components/js/layout.js


function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = layout_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function layout_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return layout_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return layout_arrayLikeToArray(o, minLen); }
function layout_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
// Calculates all necessary s*it to build the chart
// Heights, widths, transforms, ... = everything
// Why such a mess you ask? Well, that's because
// one components size can depend on other component
// data formatting (e.g. grid width depends on sidebar precision)
// So it's better to calc all in one place.





function Layout(params) {
  var chart = params.chart,
    sub = params.sub,
    offsub = params.offsub,
    interval = params.interval,
    range = params.range,
    ctx = params.ctx,
    layers_meta = params.layers_meta,
    ti_map = params.ti_map,
    $p = params.$props,
    y_ts = params.y_transforms;
  var mgrid = chart.grid || {};
  offsub = offsub.filter(function (x, i) {
    // Skip offchart overlays with custom grid id,
    // because they will be mergred with the existing grids
    return !(x.grid && x.grid.id);
  });

  // Splits space between main chart
  // and offchart indicator grids
  function grid_hs() {
    var height = $p.height - $p.config.BOTBAR;

    // When at least one height defined (default = 1),
    // Pxs calculated as: (sum of weights) / number
    if (mgrid.height || offsub.find(function (x) {
      return x.grid.height;
    })) {
      return weighted_hs(mgrid, height);
    }
    var n = offsub.length;
    var off_h = 2 * Math.sqrt(n) / 7 / (n || 1);

    // Offchart grid height
    var px = Math.floor(height * off_h);

    // Main grid height
    var m = height - px * n;
    return [m].concat(Array(n).fill(px));
  }
  function weighted_hs(grid, height) {
    var hs = [{
      grid: grid
    }].concat(_toConsumableArray(offsub)).map(function (x) {
      return x.grid.height || 1;
    });
    var sum = hs.reduce(function (a, b) {
      return a + b;
    }, 0);
    hs = hs.map(function (x) {
      return Math.floor(x / sum * height);
    });

    // Refine the height if Math.floor decreased px sum
    sum = hs.reduce(function (a, b) {
      return a + b;
    }, 0);
    for (var i = 0; i < height - sum; i++) hs[i % hs.length]++;
    return hs;
  }
  function candles_n_vol() {
    self.candles = [];
    self.volume = [];
    var maxv = Math.max.apply(Math, _toConsumableArray(sub.map(function (x) {
      return x[5];
    })));
    var vs = $p.config.VOLSCALE * $p.height / maxv;
    var x1,
      x2,
      mid,
      prev = undefined;
    var splitter = self.px_step > 5 ? 1 : 0;
    var hf_px_step = self.px_step * 0.5;
    for (var i = 0; i < sub.length; i++) {
      var p = sub[i];
      mid = self.t2screen(p[0]) + 0.5;
      self.candles.push(mgrid.logScale ? log_scale.candle(self, mid, p, $p) : {
        x: mid,
        w: self.px_step * $p.config.CANDLEW,
        o: Math.floor(p[1] * self.A + self.B),
        h: Math.floor(p[2] * self.A + self.B),
        l: Math.floor(p[3] * self.A + self.B),
        c: Math.floor(p[4] * self.A + self.B),
        raw: p
      });
      // Clear volume bar if there is a time gap
      if (sub[i - 1] && p[0] - sub[i - 1][0] > interval) {
        prev = null;
      }
      x1 = prev || Math.floor(mid - hf_px_step);
      x2 = Math.floor(mid + hf_px_step) - 0.5;
      self.volume.push({
        x1: x1,
        x2: x2,
        h: p[5] * vs,
        green: p[4] >= p[1],
        raw: p
      });
      prev = x2 + splitter;
    }
  }

  // Main grid
  var hs = grid_hs();
  var specs = {
    sub: sub,
    interval: interval,
    range: range,
    ctx: ctx,
    $p: $p,
    layers_meta: layers_meta,
    ti_map: ti_map,
    height: hs[0],
    y_t: y_ts[0],
    grid: mgrid,
    timezone: $p.timezone
  };
  var gms = [new grid_maker(0, specs)];

  // Sub grids
  var _iterator = _createForOfIteratorHelper(offsub.entries()),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _step$value = _slicedToArray(_step.value, 2),
        i = _step$value[0],
        _step$value$ = _step$value[1],
        data = _step$value$.data,
        grid = _step$value$.grid;
      specs.sub = data;
      specs.height = hs[i + 1];
      specs.y_t = y_ts[i + 1];
      specs.grid = grid || {};
      gms.push(new grid_maker(i + 1, specs, gms[0].get_layout()));
    }

    // Max sidebar among all grinds
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  var sb = Math.max.apply(Math, _toConsumableArray(gms.map(function (x) {
    return x.get_sidebar();
  })));
  var grids = [],
    offset = 0;
  for (i = 0; i < gms.length; i++) {
    gms[i].set_sidebar(sb);
    grids.push(gms[i].create());
    grids[i].id = i;
    grids[i].offset = offset;
    offset += grids[i].height;
  }
  var self = grids[0];
  candles_n_vol();
  return {
    grids: grids,
    botbar: {
      width: $p.width,
      height: $p.config.BOTBAR,
      offset: offset,
      xs: grids[0] ? grids[0].xs : []
    }
  };
}
/* harmony default export */ const layout = (Layout);
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/classCallCheck.js
function classCallCheck_classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/typeof.js
function typeof_typeof(o) {
  "@babel/helpers - typeof";

  return typeof_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, typeof_typeof(o);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/toPrimitive.js

function toPrimitive(t, r) {
  if ("object" != typeof_typeof(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof_typeof(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/toPropertyKey.js


function toPropertyKey(t) {
  var i = toPrimitive(t, "string");
  return "symbol" == typeof_typeof(i) ? i : i + "";
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/createClass.js

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, toPropertyKey(descriptor.key), descriptor);
  }
}
function createClass_createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}
;// CONCATENATED MODULE: ./src/components/js/updater.js



function updater_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = updater_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function updater_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return updater_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return updater_arrayLikeToArray(o, minLen); }
function updater_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
// Cursor updater: calculates current values for
// OHLCV and all other indicators


var CursorUpdater = /*#__PURE__*/function () {
  function CursorUpdater(comp) {
    classCallCheck_classCallCheck(this, CursorUpdater);
    this.comp = comp, this.grids = comp._layout.grids, this.cursor = comp.cursor;
  }
  return createClass_createClass(CursorUpdater, [{
    key: "sync",
    value: function sync(e) {
      // TODO: values not displaying if a custom grid id is set:
      // grid: { id: N }
      this.cursor.grid_id = e.grid_id;
      var once = true;
      var _iterator = updater_createForOfIteratorHelper(this.grids),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var grid = _step.value;
          var c = this.cursor_data(grid, e);
          if (!this.cursor.locked) {
            // TODO: find a better fix to invisible cursor prob
            if (once) {
              this.cursor.t = this.cursor_time(grid, e, c);
              if (this.cursor.t) once = false;
            }
            if (c.values) {
              this.comp.$set(this.cursor.values, grid.id, c.values);
            }
          }
          if (grid.id !== e.grid_id) continue;
          this.cursor.x = grid.t2screen(this.cursor.t);
          this.cursor.y = c.y;
          this.cursor.y$ = c.y$;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "overlay_data",
    value: function overlay_data(grid, e) {
      var s = grid.id === 0 ? 'main_section' : 'sub_section';
      var data = this.comp[s].data;

      // Split offchart data between offchart grids
      if (grid.id > 0) {
        // Sequential grids
        var _d = data.filter(function (x) {
          return x.grid.id === undefined;
        });
        // grids with custom ids (for merging)
        var m = data.filter(function (x) {
          return x.grid.id === grid.id;
        });
        data = [_d[grid.id - 1]].concat(_toConsumableArray(m));
      }
      var t = grid.screen2t(e.x);
      var ids = {},
        res = {};
      var _iterator2 = updater_createForOfIteratorHelper(data),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var d = _step2.value;
          var ts = d.data.map(function (x) {
            return x[0];
          });
          var i = utils.nearest_a(t, ts)[0];
          d.type in ids ? ids[d.type]++ : ids[d.type] = 0;
          res["".concat(d.type, "_").concat(ids[d.type])] = d.data[i];
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      return res;
    }

    // Nearest datapoints
  }, {
    key: "cursor_data",
    value: function cursor_data(grid, e) {
      var data = this.comp.main_section.sub;
      var xs = data.map(function (x) {
        return grid.t2screen(x[0]) + 0.5;
      });
      var i = utils.nearest_a(e.x, xs)[0];
      if (!xs[i]) return {};
      return {
        x: Math.floor(xs[i]) - 0.5,
        y: Math.floor(e.y - 2) - 0.5 - grid.offset,
        y$: grid.screen2$(e.y - 2 - grid.offset),
        t: (data[i] || [])[0],
        values: Object.assign({
          ohlcv: grid.id === 0 ? data[i] : undefined
        }, this.overlay_data(grid, e))
      };
    }

    // Get cursor t-position (extended)
  }, {
    key: "cursor_time",
    value: function cursor_time(grid, mouse, candle) {
      var t = grid.screen2t(mouse.x);
      var r = Math.abs((t - candle.t) / this.comp.interval);
      var sign = Math.sign(t - candle.t);
      if (r >= 0.5) {
        // Outside the data range
        var n = Math.round(r);
        return candle.t + n * this.comp.interval * sign;
      }
      // Inside the data range
      return candle.t;
    }
  }]);
}();
/* harmony default export */ const updater = (CursorUpdater);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Section.vue?vue&type=template&id=6a086200
var Sectionvue_type_template_id_6a086200_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("div", {
    staticClass: "trading-vue-section"
  }, [_c("chart-legend", {
    ref: "legend",
    attrs: {
      values: _vm.section_values,
      grid_id: _vm.grid_id,
      common: _vm.legend_props,
      meta_props: _vm.get_meta_props
    },
    on: {
      "legend-button-click": _vm.button_click
    }
  }), _vm._v(" "), _c("grid", _vm._b({
    ref: "grid",
    attrs: {
      grid_id: _vm.grid_id
    },
    on: {
      "register-kb-listener": _vm.register_kb,
      "remove-kb-listener": _vm.remove_kb,
      "range-changed": _vm.range_changed,
      "cursor-changed": _vm.cursor_changed,
      "cursor-locked": _vm.cursor_locked,
      "layer-meta-props": _vm.emit_meta_props,
      "custom-event": _vm.emit_custom_event,
      "sidebar-transform": _vm.sidebar_transform,
      "rezoom-range": _vm.rezoom_range
    }
  }, "grid", _vm.grid_props, false)), _vm._v(" "), _c("sidebar", _vm._b({
    ref: "sb-" + _vm.grid_id,
    attrs: {
      grid_id: _vm.grid_id,
      rerender: _vm.rerender
    },
    on: {
      "sidebar-transform": _vm.sidebar_transform
    }
  }, "sidebar", _vm.sidebar_props, false))], 1);
};
var Sectionvue_type_template_id_6a086200_staticRenderFns = [];
Sectionvue_type_template_id_6a086200_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/Section.vue?vue&type=template&id=6a086200

;// CONCATENATED MODULE: ./src/stuff/frame.js


// Annimation frame with a fallback for
// slower devices


var FrameAnimation = /*#__PURE__*/function () {
  function FrameAnimation(cb) {
    var _this = this;
    classCallCheck_classCallCheck(this, FrameAnimation);
    this.t0 = this.t = utils.now();
    this.id = setInterval(function () {
      // The prev frame took too long
      if (utils.now() - _this.t > 100) return;
      if (utils.now() - _this.t0 > 1200) {
        _this.stop();
      }
      if (_this.id) cb(_this);
      _this.t = utils.now();
    }, 16);
  }
  return createClass_createClass(FrameAnimation, [{
    key: "stop",
    value: function stop() {
      clearInterval(this.id);
      this.id = null;
    }
  }]);
}();

// EXTERNAL MODULE: ./node_modules/hammerjs/hammer.js
var hammer = __webpack_require__(168);
// EXTERNAL MODULE: ./node_modules/hamsterjs/hamster.js
var hamster = __webpack_require__(240);
var hamster_default = /*#__PURE__*/__webpack_require__.n(hamster);
;// CONCATENATED MODULE: ./src/components/js/grid.js




function grid_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = grid_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function grid_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return grid_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return grid_arrayLikeToArray(o, minLen); }
function grid_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
// Grid.js listens to various user-generated events,
// emits Vue-events if something has changed (e.g. range)
// Think of it as an I/O system for Grid.vue







// Grid is good.
var Grid = /*#__PURE__*/function () {
  function Grid(canvas, comp) {
    classCallCheck_classCallCheck(this, Grid);
    this.MIN_ZOOM = comp.config.MIN_ZOOM;
    this.MAX_ZOOM = comp.config.MAX_ZOOM;
    if (utils.is_mobile) this.MIN_ZOOM *= 0.5;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.comp = comp;
    this.$p = comp.$props;
    this.data = this.$p.sub;
    this.range = this.$p.range;
    this.id = this.$p.grid_id;
    this.layout = this.$p.layout.grids[this.id];
    this.interval = this.$p.interval;
    this.cursor = comp.$props.cursor;
    this.offset_x = 0;
    this.offset_y = 0;
    this.deltas = 0; // Wheel delta events
    this.wmode = this.$p.config.SCROLL_WHEEL;
    this.listeners();
    this.overlays = [];
  }
  return createClass_createClass(Grid, [{
    key: "listeners",
    value: function listeners() {
      var _this = this;
      this.hm = hamster_default()(this.canvas);
      this.hm.wheel(function (event, delta) {
        return _this.mousezoom(-delta * 50, event);
      });
      var mc = this.mc = new hammer.Manager(this.canvas);
      var T = utils.is_mobile ? 10 : 0;
      mc.add(new hammer.Pan({
        threshold: T
      }));
      mc.add(new hammer.Tap());
      mc.add(new hammer.Pinch({
        threshold: 0
      }));
      mc.get('pinch').set({
        enable: true
      });
      if (utils.is_mobile) mc.add(new hammer.Press());
      mc.on('panstart', function (event) {
        if (_this.cursor.scroll_lock) return;
        if (_this.cursor.mode === 'aim') {
          return _this.emit_cursor_coord(event);
        }
        var tfrm = _this.$p.y_transform;
        _this.drug = {
          x: event.center.x + _this.offset_x,
          y: event.center.y + _this.offset_y,
          r: _this.range.slice(),
          t: _this.range[1] - _this.range[0],
          o: tfrm ? tfrm.offset || 0 : 0,
          y_r: tfrm && tfrm.range ? tfrm.range.slice() : undefined,
          B: _this.layout.B,
          t0: utils.now()
        };
        _this.comp.$emit('cursor-changed', {
          grid_id: _this.id,
          x: event.center.x + _this.offset_x,
          y: event.center.y + _this.offset_y
        });
        _this.comp.$emit('cursor-locked', true);
      });
      mc.on('panmove', function (event) {
        if (utils.is_mobile) {
          _this.calc_offset();
          _this.propagate('mousemove', _this.touch2mouse(event));
        }
        if (_this.drug) {
          _this.mousedrag(_this.drug.x + event.deltaX, _this.drug.y + event.deltaY);
          _this.comp.$emit('cursor-changed', {
            grid_id: _this.id,
            x: event.center.x + _this.offset_x,
            y: event.center.y + _this.offset_y
          });
        } else if (_this.cursor.mode === 'aim') {
          _this.emit_cursor_coord(event);
        }
      });
      mc.on('panend', function (event) {
        if (utils.is_mobile && _this.drug) {
          _this.pan_fade(event);
        }
        _this.drug = null;
        _this.comp.$emit('cursor-locked', false);
      });
      mc.on('tap', function (event) {
        if (!utils.is_mobile) return;
        _this.sim_mousedown(event);
        if (_this.fade) _this.fade.stop();
        _this.comp.$emit('cursor-changed', {});
        _this.comp.$emit('cursor-changed', {
          /*grid_id: this.id,
          x: undefined,//event.center.x + this.offset_x,
          y: undefined,//event.center.y + this.offset_y,*/
          mode: 'explore'
        });
        _this.update();
      });
      mc.on('pinchstart', function () {
        _this.drug = null;
        _this.pinch = {
          t: _this.range[1] - _this.range[0],
          r: _this.range.slice()
        };
      });
      mc.on('pinchend', function () {
        _this.pinch = null;
      });
      mc.on('pinch', function (event) {
        if (_this.pinch) _this.pinchzoom(event.scale);
      });
      mc.on('press', function (event) {
        if (!utils.is_mobile) return;
        if (_this.fade) _this.fade.stop();
        _this.calc_offset();
        _this.emit_cursor_coord(event, {
          mode: 'aim'
        });
        setTimeout(function () {
          return _this.update();
        });
        _this.sim_mousedown(event);
      });
      var add = addEventListener;
      add("gesturestart", this.gesturestart);
      add("gesturechange", this.gesturechange);
      add("gestureend", this.gestureend);
    }
  }, {
    key: "gesturestart",
    value: function gesturestart(event) {
      event.preventDefault();
    }
  }, {
    key: "gesturechange",
    value: function gesturechange(event) {
      event.preventDefault();
    }
  }, {
    key: "gestureend",
    value: function gestureend(event) {
      event.preventDefault();
    }
  }, {
    key: "mousemove",
    value: function mousemove(event) {
      if (utils.is_mobile) return;
      this.comp.$emit('cursor-changed', {
        grid_id: this.id,
        x: event.layerX,
        y: event.layerY + this.layout.offset
      });
      this.calc_offset();
      this.propagate('mousemove', event);
    }
  }, {
    key: "mouseout",
    value: function mouseout(event) {
      if (utils.is_mobile) return;
      this.comp.$emit('cursor-changed', {});
      this.propagate('mouseout', event);
    }
  }, {
    key: "mouseup",
    value: function mouseup(event) {
      this.drug = null;
      this.comp.$emit('cursor-locked', false);
      this.propagate('mouseup', event);
    }
  }, {
    key: "mousedown",
    value: function mousedown(event) {
      if (utils.is_mobile) return;
      this.propagate('mousedown', event);
      this.comp.$emit('cursor-locked', true);
      if (event.defaultPrevented) return;
      this.comp.$emit('custom-event', {
        event: 'grid-mousedown',
        args: [this.id, event]
      });
    }

    // Simulated mousedown (for mobile)
  }, {
    key: "sim_mousedown",
    value: function sim_mousedown(event) {
      var _this2 = this;
      if (event.srcEvent.defaultPrevented) return;
      this.comp.$emit('custom-event', {
        event: 'grid-mousedown',
        args: [this.id, event]
      });
      this.propagate('mousemove', this.touch2mouse(event));
      this.update();
      this.propagate('mousedown', this.touch2mouse(event));
      setTimeout(function () {
        _this2.propagate('click', _this2.touch2mouse(event));
      });
    }

    // Convert touch to "mouse" event
  }, {
    key: "touch2mouse",
    value: function touch2mouse(e) {
      this.calc_offset();
      return {
        original: e.srcEvent,
        layerX: e.center.x + this.offset_x,
        layerY: e.center.y + this.offset_y,
        preventDefault: function preventDefault() {
          this.original.preventDefault();
        }
      };
    }
  }, {
    key: "click",
    value: function click(event) {
      this.propagate('click', event);
    }
  }, {
    key: "emit_cursor_coord",
    value: function emit_cursor_coord(event, add) {
      if (add === void 0) {
        add = {};
      }
      this.comp.$emit('cursor-changed', Object.assign({
        grid_id: this.id,
        x: event.center.x + this.offset_x,
        y: event.center.y + this.offset_y + this.layout.offset
      }, add));
    }
  }, {
    key: "pan_fade",
    value: function pan_fade(event) {
      var _this3 = this;
      var dt = utils.now() - this.drug.t0;
      var dx = this.range[1] - this.drug.r[1];
      var v = 42 * dx / dt;
      var v0 = Math.abs(v * 0.01);
      if (dt > 500) return;
      if (this.fade) this.fade.stop();
      this.fade = new FrameAnimation(function (self) {
        v *= 0.85;
        if (Math.abs(v) < v0) {
          self.stop();
        }
        _this3.range[0] += v;
        _this3.range[1] += v;
        _this3.change_range();
      });
    }
  }, {
    key: "calc_offset",
    value: function calc_offset() {
      var rect = this.canvas.getBoundingClientRect();
      this.offset_x = -rect.x;
      this.offset_y = -rect.y;
    }
  }, {
    key: "new_layer",
    value: function new_layer(layer) {
      if (layer.name === 'crosshair') {
        this.crosshair = layer;
      } else {
        this.overlays.push(layer);
      }
      this.update();
    }
  }, {
    key: "del_layer",
    value: function del_layer(id) {
      this.overlays = this.overlays.filter(function (x) {
        return x.id !== id;
      });
      this.update();
    }
  }, {
    key: "show_hide_layer",
    value: function show_hide_layer(event) {
      var l = this.overlays.filter(function (x) {
        return x.id === event.id;
      });
      if (l.length) l[0].display = event.display;
    }
  }, {
    key: "update",
    value: function update() {
      var _this4 = this;
      // Update reference to the grid
      // TODO: check what happens if data changes interval
      this.layout = this.$p.layout.grids[this.id];
      this.interval = this.$p.interval;
      if (!this.layout) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (this.$p.shaders.length) this.apply_shaders();
      this.grid();
      var overlays = [];
      overlays.push.apply(overlays, _toConsumableArray(this.overlays));

      // z-index sorting
      overlays.sort(function (l1, l2) {
        return l1.z - l2.z;
      });
      overlays.forEach(function (l) {
        if (!l.display) return;
        _this4.ctx.save();
        var r = l.renderer;
        if (r.pre_draw) r.pre_draw(_this4.ctx);
        r.draw(_this4.ctx);
        if (r.post_draw) r.post_draw(_this4.ctx);
        _this4.ctx.restore();
      });
      if (this.crosshair) {
        this.crosshair.renderer.draw(this.ctx);
      }
    }
  }, {
    key: "apply_shaders",
    value: function apply_shaders() {
      var layout = this.$p.layout.grids[this.id];
      var props = {
        layout: layout,
        range: this.range,
        interval: this.interval,
        tf: layout.ti_map.tf,
        cursor: this.cursor,
        colors: this.$p.colors,
        sub: this.data,
        font: this.$p.font,
        config: this.$p.config,
        meta: this.$p.meta
      };
      var _iterator = grid_createForOfIteratorHelper(this.$p.shaders),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var s = _step.value;
          this.ctx.save();
          s.draw(this.ctx, props);
          this.ctx.restore();
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }

    // Actually draws the grid (for real)
  }, {
    key: "grid",
    value: function grid() {
      this.ctx.strokeStyle = this.$p.colors.grid;
      this.ctx.beginPath();
      var ymax = this.layout.height;
      var _iterator2 = grid_createForOfIteratorHelper(this.layout.xs),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _step2$value = _slicedToArray(_step2.value, 2),
            x = _step2$value[0],
            p = _step2$value[1];
          this.ctx.moveTo(x - 0.5, 0);
          this.ctx.lineTo(x - 0.5, ymax);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      var _iterator3 = grid_createForOfIteratorHelper(this.layout.ys),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var _step3$value = _slicedToArray(_step3.value, 2),
            y = _step3$value[0],
            y$ = _step3$value[1];
          this.ctx.moveTo(0, y - 0.5);
          this.ctx.lineTo(this.layout.width, y - 0.5);
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      this.ctx.stroke();
      if (this.$p.grid_id) this.upper_border();
    }
  }, {
    key: "upper_border",
    value: function upper_border() {
      this.ctx.strokeStyle = this.$p.colors.scale;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0.5);
      this.ctx.lineTo(this.layout.width, 0.5);
      this.ctx.stroke();
    }
  }, {
    key: "mousezoom",
    value: function mousezoom(delta, event) {
      // TODO: for mobile
      if (this.wmode !== 'pass') {
        if (this.wmode === 'click' && !this.$p.meta.activated) {
          return;
        }
        event.originalEvent.preventDefault();
        event.preventDefault();
      }
      event.deltaX = event.deltaX || utils.get_deltaX(event);
      event.deltaY = event.deltaY || utils.get_deltaY(event);
      if (Math.abs(event.deltaX) > 0) {
        this.trackpad = true;
        if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) {
          delta *= 0.1;
        }
        this.trackpad_scroll(event);
      }
      if (this.trackpad) delta *= 0.032;
      delta = utils.smart_wheel(delta);

      // TODO: mouse zooming is a little jerky,
      // needs to follow f(mouse_wheel_speed) and
      // if speed is low, scroll shoud be slower
      if (delta < 0 && this.data.length <= this.MIN_ZOOM) return;
      if (delta > 0 && this.data.length > this.MAX_ZOOM) return;
      var k = this.interval / 1000;
      var diff = delta * k * this.data.length;
      var tl = this.comp.config.ZOOM_MODE === 'tl';
      if (event.originalEvent.ctrlKey || tl) {
        var offset = event.originalEvent.offsetX;
        var diff1 = offset / (this.canvas.width - 1) * diff;
        var diff2 = diff - diff1;
        this.range[0] -= diff1;
        this.range[1] += diff2;
      } else {
        this.range[0] -= diff;
      }
      if (tl) {
        var _offset = event.originalEvent.offsetY;
        var _diff = _offset / (this.canvas.height - 1) * 2;
        var _diff2 = 2 - _diff;
        var z = diff / (this.range[1] - this.range[0]);
        //rezoom_range(z, diff_x, diff_y)
        this.comp.$emit('rezoom-range', {
          grid_id: this.id,
          z: z,
          diff1: _diff,
          diff2: _diff2
        });
      }
      this.change_range();
    }
  }, {
    key: "mousedrag",
    value: function mousedrag(x, y) {
      var dt = this.drug.t * (this.drug.x - x) / this.layout.width;
      var d$ = this.layout.$_hi - this.layout.$_lo;
      d$ *= (this.drug.y - y) / this.layout.height;
      var offset = this.drug.o + d$;
      var ls = this.layout.grid.logScale;
      if (ls && this.drug.y_r) {
        var dy = this.drug.y - y;
        var range = this.drug.y_r.slice();
        range[0] = math.exp((0 - this.drug.B + dy) / this.layout.A);
        range[1] = math.exp((this.layout.height - this.drug.B + dy) / this.layout.A);
      }
      if (this.drug.y_r && this.$p.y_transform && !this.$p.y_transform.auto) {
        this.comp.$emit('sidebar-transform', {
          grid_id: this.id,
          range: ls ? range || this.drug.y_r : [this.drug.y_r[0] - offset, this.drug.y_r[1] - offset]
        });
      }
      this.range[0] = this.drug.r[0] + dt;
      this.range[1] = this.drug.r[1] + dt;
      this.change_range();
    }
  }, {
    key: "pinchzoom",
    value: function pinchzoom(scale) {
      if (scale > 1 && this.data.length <= this.MIN_ZOOM) return;
      if (scale < 1 && this.data.length > this.MAX_ZOOM) return;
      var t = this.pinch.t;
      var nt = t * 1 / scale;
      this.range[0] = this.pinch.r[0] - (nt - t) * 0.5;
      this.range[1] = this.pinch.r[1] + (nt - t) * 0.5;
      this.change_range();
    }
  }, {
    key: "trackpad_scroll",
    value: function trackpad_scroll(event) {
      var dt = this.range[1] - this.range[0];
      this.range[0] += event.deltaX * dt * 0.011;
      this.range[1] += event.deltaX * dt * 0.011;
      this.change_range();
    }
  }, {
    key: "change_range",
    value: function change_range() {
      // TODO: better way to limit the view. Problem:
      // when you are at the dead end of the data,
      // and keep scrolling,
      // the chart continues to scale down a little.
      // Solution: I don't know yet

      if (!this.range.length || this.data.length < 2) return;
      var l = this.data.length - 1;
      var data = this.data;
      var range = this.range;
      range[0] = utils.clamp(range[0], -Infinity, data[l][0] - this.interval * 5.5);
      range[1] = utils.clamp(range[1], data[0][0] + this.interval * 5.5, Infinity);

      // TODO: IMPORTANT scrolling is jerky The Problem caused
      // by the long round trip of 'range-changed' event.
      // First it propagates up to update layout in Chart.vue,
      // then it moves back as watch() update. It takes 1-5 ms.
      // And because the delay is different each time we see
      // the lag. No smooth movement and it's annoying.
      // Solution: we could try to calc the layout immediatly
      // somewhere here. Still will hurt the sidebar & bottombar
      this.comp.$emit('range-changed', range);
    }

    // Propagate mouse event to overlays
  }, {
    key: "propagate",
    value: function propagate(name, event) {
      var _iterator4 = grid_createForOfIteratorHelper(this.overlays),
        _step4;
      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var layer = _step4.value;
          if (layer.renderer[name]) {
            layer.renderer[name](event);
          }
          var mouse = layer.renderer.mouse;
          var keys = layer.renderer.keys;
          if (mouse.listeners) {
            mouse.emit(name, event);
          }
          if (keys && keys.listeners) {
            keys.emit(name, event);
          }
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var rm = removeEventListener;
      rm("gesturestart", this.gesturestart);
      rm("gesturechange", this.gesturechange);
      rm("gestureend", this.gestureend);
      if (this.mc) this.mc.destroy();
      if (this.hm) this.hm.unwheel();
    }
  }]);
}();

;// CONCATENATED MODULE: ./src/mixins/canvas.js
// Interactive canvas-based component
// Should implement: mousemove, mouseout, mouseup, mousedown, click


/* harmony default export */ const canvas = ({
  methods: {
    setup: function setup() {
      var _this = this;
      var id = "".concat(this.$props.tv_id, "-").concat(this._id, "-canvas");
      var canvas = document.getElementById(id);
      var dpr = window.devicePixelRatio || 1;
      canvas.style.width = "".concat(this._attrs.width, "px");
      canvas.style.height = "".concat(this._attrs.height, "px");
      if (dpr < 1) dpr = 1; // Realy ? That's it? Issue #63
      this.$nextTick(function () {
        var rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        var ctx = canvas.getContext('2d', {
          // TODO: test the boost:
          //alpha: false,
          //desynchronized: true,
          //preserveDrawingBuffer: false
        });
        ctx.scale(dpr, dpr);
        _this.redraw();
        // Fallback fix for Brave browser
        // https://github.com/brave/brave-browser/issues/1738
        if (!ctx.measureTextOrg) {
          ctx.measureTextOrg = ctx.measureText;
        }
        ctx.measureText = function (text) {
          return utils.measureText(ctx, text, _this.$props.tv_id);
        };
      });
    },
    create_canvas: function create_canvas(h, id, props) {
      var _this2 = this;
      this._id = id;
      this._attrs = props.attrs;
      return h('div', {
        "class": "trading-vue-".concat(id),
        style: {
          left: props.position.x + 'px',
          top: props.position.y + 'px',
          position: 'absolute'
        }
      }, [h('canvas', {
        on: {
          mousemove: function mousemove(e) {
            return _this2.renderer.mousemove(e);
          },
          mouseout: function mouseout(e) {
            return _this2.renderer.mouseout(e);
          },
          mouseup: function mouseup(e) {
            return _this2.renderer.mouseup(e);
          },
          mousedown: function mousedown(e) {
            return _this2.renderer.mousedown(e);
          }
        },
        attrs: Object.assign({
          id: "".concat(this.$props.tv_id, "-").concat(id, "-canvas")
        }, props.attrs),
        ref: 'canvas',
        style: props.style
      })].concat(props.hs || []));
    },
    redraw: function redraw() {
      if (!this.renderer) return;
      this.renderer.update();
    }
  },
  watch: {
    width: function width(val) {
      this._attrs.width = val;
      this.setup();
    },
    height: function height(val) {
      this._attrs.height = val;
      this.setup();
    }
  }
});
;// CONCATENATED MODULE: ./src/mixins/uxlist.js
// Manager for Inteerface objects

/* harmony default export */ const uxlist = ({
  methods: {
    on_ux_event: function on_ux_event(d, target) {
      if (d.event === 'new-interface') {
        if (d.args[0].target === target) {
          d.args[0].vars = d.args[0].vars || {};
          d.args[0].grid_id = d.args[1];
          d.args[0].overlay_id = d.args[2];
          this.uxs.push(d.args[0]);
          // this.rerender++
        }
      } else if (d.event === 'close-interface') {
        this.uxs = this.uxs.filter(function (x) {
          return x.uuid !== d.args[0];
        });
      } else if (d.event === 'modify-interface') {
        var ux = this.uxs.filter(function (x) {
          return x.uuid === d.args[0];
        });
        if (ux.length) {
          this.modify(ux[0], d.args[1]);
        }
      } else if (d.event === 'hide-interface') {
        var _ux = this.uxs.filter(function (x) {
          return x.uuid === d.args[0];
        });
        if (_ux.length) {
          _ux[0].hidden = true;
          this.modify(_ux[0], {
            hidden: true
          });
        }
      } else if (d.event === 'show-interface') {
        var _ux2 = this.uxs.filter(function (x) {
          return x.uuid === d.args[0];
        });
        if (_ux2.length) {
          this.modify(_ux2[0], {
            hidden: false
          });
        }
      } else {
        return d;
      }
    },
    modify: function modify(ux, obj) {
      if (obj === void 0) {
        obj = {};
      }
      for (var k in obj) {
        if (k in ux) {
          this.$set(ux, k, obj[k]);
        }
      }
    },
    // Remove all UXs for a given overlay id
    remove_all_ux: function remove_all_ux(id) {
      this.uxs = this.uxs.filter(function (x) {
        return x.overlay.id !== id;
      });
    }
  },
  data: function data() {
    return {
      uxs: []
    };
  }
});
;// CONCATENATED MODULE: ./src/components/js/crosshair.js


var Crosshair = /*#__PURE__*/function () {
  function Crosshair(comp) {
    classCallCheck_classCallCheck(this, Crosshair);
    this.comp = comp;
    this.$p = comp.$props;
    this.data = this.$p.sub;
    this._visible = false;
    this.locked = false;
    this.layout = this.$p.layout;
  }
  return createClass_createClass(Crosshair, [{
    key: "draw",
    value: function draw(ctx) {
      // Update reference to the grid
      this.layout = this.$p.layout;
      var cursor = this.comp.$props.cursor;
      if (!this.visible && cursor.mode === 'explore') return;
      this.x = this.$p.cursor.x;
      this.y = this.$p.cursor.y;
      ctx.save();
      ctx.strokeStyle = this.$p.colors.cross;
      ctx.beginPath();
      ctx.setLineDash([5]);

      // H
      if (this.$p.cursor.grid_id === this.layout.id) {
        ctx.moveTo(0, this.y);
        ctx.lineTo(this.layout.width - 0.5, this.y);
      }

      // V
      ctx.moveTo(this.x, 0);
      ctx.lineTo(this.x, this.layout.height);
      ctx.stroke();
      ctx.restore();
    }
  }, {
    key: "hide",
    value: function hide() {
      this.visible = false;
      this.x = undefined;
      this.y = undefined;
    }
  }, {
    key: "visible",
    get: function get() {
      return this._visible;
    },
    set: function set(val) {
      this._visible = val;
    }
  }]);
}();

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Crosshair.vue?vue&type=script&lang=js


/* harmony default export */ const Crosshairvue_type_script_lang_js = ({
  name: 'Crosshair',
  props: ['cursor', 'colors', 'layout', 'sub'],
  methods: {
    create: function create() {
      this.ch = new Crosshair(this);

      // New grid overlay-renderer descriptor.
      // Should implement draw() (see Spline.vue)
      this.$emit('new-grid-layer', {
        name: 'crosshair',
        renderer: this.ch
      });
    }
  },
  watch: {
    cursor: {
      handler: function handler() {
        if (!this.ch) this.create();

        // Explore = default mode on mobile
        var cursor = this.$props.cursor;
        var explore = cursor.mode === 'explore';
        if (!cursor.x || !cursor.y) {
          this.ch.hide();
          this.$emit('redraw-grid');
          return;
        }
        this.ch.visible = !explore;
      },
      deep: true
    }
  },
  render: function render(h) {
    return h();
  }
});
;// CONCATENATED MODULE: ./src/components/Crosshair.vue?vue&type=script&lang=js
 /* harmony default export */ const components_Crosshairvue_type_script_lang_js = (Crosshairvue_type_script_lang_js); 
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/runtime/componentNormalizer.js
/* globals __VUE_SSR_CONTEXT__ */

// IMPORTANT: Do NOT use ES2015 features in this file (except for modules).
// This module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle.

function normalizeComponent(
  scriptExports,
  render,
  staticRenderFns,
  functionalTemplate,
  injectStyles,
  scopeId,
  moduleIdentifier /* server only */,
  shadowMode /* vue-cli only */
) {
  // Vue.extend constructor export interop
  var options =
    typeof scriptExports === 'function' ? scriptExports.options : scriptExports

  // render functions
  if (render) {
    options.render = render
    options.staticRenderFns = staticRenderFns
    options._compiled = true
  }

  // functional template
  if (functionalTemplate) {
    options.functional = true
  }

  // scopedId
  if (scopeId) {
    options._scopeId = 'data-v-' + scopeId
  }

  var hook
  if (moduleIdentifier) {
    // server build
    hook = function (context) {
      // 2.3 injection
      context =
        context || // cached call
        (this.$vnode && this.$vnode.ssrContext) || // stateful
        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
      // 2.2 with runInNewContext: true
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__
      }
      // inject component styles
      if (injectStyles) {
        injectStyles.call(this, context)
      }
      // register component module identifier for async chunk inferrence
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier)
      }
    }
    // used by ssr in case component is cached and beforeCreate
    // never gets called
    options._ssrRegister = hook
  } else if (injectStyles) {
    hook = shadowMode
      ? function () {
          injectStyles.call(
            this,
            (options.functional ? this.parent : this).$root.$options.shadowRoot
          )
        }
      : injectStyles
  }

  if (hook) {
    if (options.functional) {
      // for template-only hot-reload because in that case the render fn doesn't
      // go through the normalizer
      options._injectStyles = hook
      // register for functional component in vue file
      var originalRender = options.render
      options.render = function renderWithStyleInjection(h, context) {
        hook.call(context)
        return originalRender(h, context)
      }
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate
      options.beforeCreate = existing ? [].concat(existing, hook) : [hook]
    }
  }

  return {
    exports: scriptExports,
    options: options
  }
}

;// CONCATENATED MODULE: ./src/components/Crosshair.vue
var Crosshair_render, Crosshair_staticRenderFns
;



/* normalize component */
;
var component = normalizeComponent(
  components_Crosshairvue_type_script_lang_js,
  Crosshair_render,
  Crosshair_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const components_Crosshair = (component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/KeyboardListener.vue?vue&type=script&lang=js
/* harmony default export */ const KeyboardListenervue_type_script_lang_js = ({
  name: 'KeyboardListener',
  render: function render(h) {
    return h();
  },
  created: function created() {
    this.$emit('register-kb-listener', {
      id: this._uid,
      keydown: this.keydown,
      keyup: this.keyup,
      keypress: this.keypress
    });
  },
  beforeDestroy: function beforeDestroy() {
    this.$emit('remove-kb-listener', {
      id: this._uid
    });
  },
  methods: {
    keydown: function keydown(event) {
      this.$emit('keydown', event);
    },
    keyup: function keyup(event) {
      this.$emit('keyup', event);
    },
    keypress: function keypress(event) {
      this.$emit('keypress', event);
    }
  }
});
;// CONCATENATED MODULE: ./src/components/KeyboardListener.vue?vue&type=script&lang=js
 /* harmony default export */ const components_KeyboardListenervue_type_script_lang_js = (KeyboardListenervue_type_script_lang_js); 
;// CONCATENATED MODULE: ./src/components/KeyboardListener.vue
var KeyboardListener_render, KeyboardListener_staticRenderFns
;



/* normalize component */
;
var KeyboardListener_component = normalizeComponent(
  components_KeyboardListenervue_type_script_lang_js,
  KeyboardListener_render,
  KeyboardListener_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const KeyboardListener = (KeyboardListener_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/UxLayer.vue?vue&type=template&id=072774c0
var UxLayervue_type_template_id_072774c0_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("span", {
    "class": "trading-vue-grid-ux-".concat(_vm.id),
    style: _vm.style
  }, _vm._l(_vm.uxs, function (ux) {
    return _c("ux-wrapper", {
      key: ux.uuid,
      attrs: {
        ux: ux,
        updater: _vm.updater,
        colors: _vm.colors,
        config: _vm.config
      },
      on: {
        "custom-event": _vm.on_custom_event
      }
    });
  }), 1);
};
var UxLayervue_type_template_id_072774c0_staticRenderFns = [];
UxLayervue_type_template_id_072774c0_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/UxLayer.vue?vue&type=template&id=072774c0

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/UxWrapper.vue?vue&type=template&id=26d7be98
var UxWrappervue_type_template_id_26d7be98_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _vm.visible ? _c("div", {
    staticClass: "trading-vue-ux-wrapper",
    style: _vm.style,
    attrs: {
      id: "tvjs-ux-wrapper-".concat(_vm.ux.uuid)
    }
  }, [_c(_vm.ux.component, {
    tag: "component",
    attrs: {
      ux: _vm.ux,
      updater: _vm.updater,
      wrapper: _vm.wrapper,
      colors: _vm.colors
    },
    on: {
      "custom-event": _vm.on_custom_event
    }
  }), _vm._v(" "), _vm.ux.show_pin ? _c("div", {
    staticClass: "tvjs-ux-wrapper-pin",
    style: _vm.pin_style
  }) : _vm._e(), _vm._v(" "), _vm.ux.win_header !== false ? _c("div", {
    staticClass: "tvjs-ux-wrapper-head"
  }, [_c("div", {
    staticClass: "tvjs-ux-wrapper-close",
    style: _vm.btn_style,
    on: {
      click: _vm.close
    }
  }, [_vm._v("×")])]) : _vm._e()], 1) : _vm._e();
};
var UxWrappervue_type_template_id_26d7be98_staticRenderFns = [];
UxWrappervue_type_template_id_26d7be98_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/UxWrapper.vue?vue&type=template&id=26d7be98

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/UxWrapper.vue?vue&type=script&lang=js

/* harmony default export */ const UxWrappervue_type_script_lang_js = ({
  name: 'UxWrapper',
  props: ['ux', 'updater', 'colors', 'config'],
  mounted: function mounted() {
    this.self = document.getElementById(this.uuid);
    this.w = this.self.offsetWidth; // TODO: => width: "content"
    this.h = this.self.offsetHeight; // TODO: => height: "content"
    this.update_position();
  },
  created: function created() {
    this.mouse.on('mousemove', this.mousemove);
    this.mouse.on('mouseout', this.mouseout);
  },
  beforeDestroy: function beforeDestroy() {
    this.mouse.off('mousemove', this.mousemove);
    this.mouse.off('mouseout', this.mouseout);
  },
  methods: {
    update_position: function update_position() {
      if (this.uxr.hidden) return;
      var lw = this.layout.width;
      var lh = this.layout.height;
      var pin = this.uxr.pin;
      switch (pin[0]) {
        case 'cursor':
          var x = this.uxr.overlay.cursor.x;
          break;
        case 'mouse':
          x = this.mouse.x;
          break;
        default:
          if (typeof pin[0] === 'string') {
            x = this.parse_coord(pin[0], lw);
          } else {
            x = this.layout.t2screen(pin[0]);
          }
      }
      switch (pin[1]) {
        case 'cursor':
          var y = this.uxr.overlay.cursor.y;
          break;
        case 'mouse':
          y = this.mouse.y;
          break;
        default:
          if (typeof pin[1] === 'string') {
            y = this.parse_coord(pin[1], lh);
          } else {
            y = this.layout.$2screen(pin[1]);
          }
      }
      this.x = x + this.ox;
      this.y = y + this.oy;
    },
    parse_coord: function parse_coord(str, scale) {
      str = str.trim();
      if (str === '0' || str === '') return 0;
      var plus = str.split('+');
      if (plus.length === 2) {
        return this.parse_coord(plus[0], scale) + this.parse_coord(plus[1], scale);
      }
      var minus = str.split('-');
      if (minus.length === 2) {
        return this.parse_coord(minus[0], scale) - this.parse_coord(minus[1], scale);
      }
      var per = str.split('%');
      if (per.length === 2) {
        return scale * parseInt(per[0]) / 100;
      }
      var px = str.split('px');
      if (px.length === 2) {
        return parseInt(px[0]);
      }
      return undefined;
    },
    mousemove: function mousemove() {
      this.update_position();
      this.visible = true;
    },
    mouseout: function mouseout() {
      if (this.uxr.pin.includes('cursor') || this.uxr.pin.includes('mouse')) this.visible = false;
    },
    on_custom_event: function on_custom_event(event) {
      this.$emit('custom-event', event);
      if (event.event === 'modify-interface') {
        if (this.self) {
          this.w = this.self.offsetWidth;
          this.h = this.self.offsetHeight;
        }
        this.update_position();
      }
    },
    close: function close() {
      this.$emit('custom-event', {
        event: 'close-interface',
        args: [this.$props.ux.uuid]
      });
    }
  },
  computed: {
    uxr: function uxr() {
      return this.$props.ux; // just a ref
    },
    layout: function layout() {
      return this.$props.ux.overlay.layout;
    },
    settings: function settings() {
      return this.$props.ux.overlay.settings;
    },
    uuid: function uuid() {
      return "tvjs-ux-wrapper-".concat(this.uxr.uuid);
    },
    mouse: function mouse() {
      return this.uxr.overlay.mouse;
    },
    style: function style() {
      var st = {
        'display': this.uxr.hidden ? 'none' : undefined,
        'left': "".concat(this.x, "px"),
        'top': "".concat(this.y, "px"),
        'pointer-events': this.uxr.pointer_events || 'all',
        'z-index': this.z_index
      };
      if (this.uxr.win_styling !== false) st = Object.assign(st, {
        'border': "1px solid ".concat(this.$props.colors.grid),
        'border-radius': '3px',
        'background': "".concat(this.background)
      });
      return st;
    },
    pin_style: function pin_style() {
      return {
        'left': "".concat(-this.ox, "px"),
        'top': "".concat(-this.oy, "px"),
        'background-color': this.uxr.pin_color
      };
    },
    btn_style: function btn_style() {
      return {
        'background': "".concat(this.inactive_btn_color),
        'color': "".concat(this.inactive_btn_color)
      };
    },
    pin_pos: function pin_pos() {
      return this.uxr.pin_position ? this.uxr.pin_position.split(',') : ['0', '0'];
    },
    // Offset x
    ox: function ox() {
      if (this.pin_pos.length !== 2) return undefined;
      var x = this.parse_coord(this.pin_pos[0], this.w);
      return -x;
    },
    // Offset y
    oy: function oy() {
      if (this.pin_pos.length !== 2) return undefined;
      var y = this.parse_coord(this.pin_pos[1], this.h);
      return -y;
    },
    z_index: function z_index() {
      var base_index = this.settings['z-index'] || this.settings['zIndex'] || 0;
      var ux_index = this.uxr['z_index'] || 0;
      return base_index + ux_index;
    },
    background: function background() {
      var c = this.uxr.background || this.$props.colors.back;
      return utils.apply_opacity(c, this.uxr.background_opacity || this.$props.config.UX_OPACITY);
    },
    inactive_btn_color: function inactive_btn_color() {
      return this.uxr.inactive_btn_color || this.$props.colors.grid;
    },
    wrapper: function wrapper() {
      return {
        x: this.x,
        y: this.y,
        pin_x: this.x - this.ox,
        pin_y: this.y - this.oy
      };
    }
  },
  watch: {
    updater: function updater() {
      this.update_position();
    }
  },
  data: function data() {
    return {
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      visible: true
    };
  }
});
;// CONCATENATED MODULE: ./src/components/UxWrapper.vue?vue&type=script&lang=js
 /* harmony default export */ const components_UxWrappervue_type_script_lang_js = (UxWrappervue_type_script_lang_js); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/UxWrapper.vue?vue&type=style&index=0&id=26d7be98&prod&lang=css
var UxWrappervue_type_style_index_0_id_26d7be98_prod_lang_css = __webpack_require__(880);
;// CONCATENATED MODULE: ./src/components/UxWrapper.vue?vue&type=style&index=0&id=26d7be98&prod&lang=css

;// CONCATENATED MODULE: ./src/components/UxWrapper.vue



;


/* normalize component */

var UxWrapper_component = normalizeComponent(
  components_UxWrappervue_type_script_lang_js,
  UxWrappervue_type_template_id_26d7be98_render,
  UxWrappervue_type_template_id_26d7be98_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const UxWrapper = (UxWrapper_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/UxLayer.vue?vue&type=script&lang=js

/* harmony default export */ const UxLayervue_type_script_lang_js = ({
  name: 'UxLayer',
  props: ['tv_id', 'id', 'uxs', 'updater', 'colors', 'config'],
  components: {
    UxWrapper: UxWrapper
  },
  created: function created() {},
  mounted: function mounted() {},
  beforeDestroy: function beforeDestroy() {},
  methods: {
    on_custom_event: function on_custom_event(event) {
      this.$emit('custom-event', event);
    }
  },
  computed: {
    style: function style() {
      return {
        'top': this.$props.id !== 0 ? '1px' : 0,
        'left': 0,
        'width': '100%',
        'height': 'calc(100% - 2px)',
        'position': 'absolute',
        'z-index': '1',
        'pointer-events': 'none',
        'overflow': 'hidden'
      };
    }
  }
});
;// CONCATENATED MODULE: ./src/components/UxLayer.vue?vue&type=script&lang=js
 /* harmony default export */ const components_UxLayervue_type_script_lang_js = (UxLayervue_type_script_lang_js); 
;// CONCATENATED MODULE: ./src/components/UxLayer.vue





/* normalize component */
;
var UxLayer_component = normalizeComponent(
  components_UxLayervue_type_script_lang_js,
  UxLayervue_type_template_id_072774c0_render,
  UxLayervue_type_template_id_072774c0_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const UxLayer = (UxLayer_component.exports);
;// CONCATENATED MODULE: ./src/stuff/mouse.js


function mouse_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = mouse_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function mouse_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return mouse_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return mouse_arrayLikeToArray(o, minLen); }
function mouse_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
// Mouse event handler for overlay
var Mouse = /*#__PURE__*/function () {
  function Mouse(comp) {
    classCallCheck_classCallCheck(this, Mouse);
    this.comp = comp;
    this.map = {};
    this.listeners = 0;
    this.pressed = false;
    this.x = comp.$props.cursor.x;
    this.y = comp.$props.cursor.y;
    this.t = comp.$props.cursor.t;
    this.y$ = comp.$props.cursor.y$;
  }

  // You can choose where to place the handler
  // (beginning or end of the queue)
  return createClass_createClass(Mouse, [{
    key: "on",
    value: function on(name, handler, dir) {
      if (dir === void 0) {
        dir = "unshift";
      }
      if (!handler) return;
      this.map[name] = this.map[name] || [];
      this.map[name][dir](handler);
      this.listeners++;
    }
  }, {
    key: "off",
    value: function off(name, handler) {
      if (!this.map[name]) return;
      var i = this.map[name].indexOf(handler);
      if (i < 0) return;
      this.map[name].splice(i, 1);
      this.listeners--;
    }

    // Called by grid.js
  }, {
    key: "emit",
    value: function emit(name, event) {
      var l = this.comp.layout;
      if (name in this.map) {
        var _iterator = mouse_createForOfIteratorHelper(this.map[name]),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var f = _step.value;
            f(event);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
      if (name === 'mousemove') {
        this.x = event.layerX;
        this.y = event.layerY;
        this.t = l.screen2t(this.x);
        this.y$ = l.screen2$(this.y);
      }
      if (name === 'mousedown') {
        this.pressed = true;
      }
      if (name === 'mouseup') {
        this.pressed = false;
      }
    }
  }]);
}();

;// CONCATENATED MODULE: ./src/mixins/overlay.js
// Usuful stuff for creating overlays. Include as mixin


/* harmony default export */ const overlay = ({
  props: ['id', 'num', 'interval', 'cursor', 'colors', 'layout', 'sub', 'data', 'settings', 'grid_id', 'font', 'config', 'meta', 'tf', 'i0', 'last'],
  mounted: function mounted() {
    // TODO(1): when hot reloading, dynamicaly changed mixins
    // dissapear (cuz it's a hack), the only way for now
    // is to reload the browser
    if (!this.draw) {
      this.draw = function (ctx) {
        var text = 'EARLY ADOPTER BUG: reload the browser & enjoy';
        console.warn(text);
      };
    }
    // Main chart?
    var main = this.$props.sub === this.$props.data;
    this.meta_info();

    // TODO(1): quick fix for vue2, in vue3 we use 3rd party emit
    try {
      new Function('return ' + this.$emit)();
      this._$emit = this.$emit;
      this.$emit = this.custom_event;
    } catch (e) {
      return;
    }
    this._$emit('new-grid-layer', {
      name: this.$options.name,
      id: this.$props.id,
      renderer: this,
      display: 'display' in this.$props.settings ? this.$props.settings['display'] : true,
      z: this.$props.settings['z-index'] || this.$props.settings['zIndex'] || (main ? 0 : -1)
    });

    // Overlay meta-props (adjusting behaviour)
    this._$emit('layer-meta-props', {
      grid_id: this.$props.grid_id,
      layer_id: this.$props.id,
      legend: this.legend,
      data_colors: this.data_colors,
      y_range: this.y_range
    });
    this.exec_script();
    this.mouse = new Mouse(this);
    if (this.init_tool) this.init_tool();
    if (this.init) this.init();
  },
  beforeDestroy: function beforeDestroy() {
    if (this.destroy) this.destroy();
    this._$emit('delete-grid-layer', this.$props.id);
  },
  methods: {
    use_for: function use_for() {
      /* override it (mandatory) */
      console.warn('use_for() should be implemented');
      console.warn("Format: use_for() {\n                  return ['type1', 'type2', ...]\n            }");
    },
    meta_info: function meta_info() {
      /* override it (optional) */
      var id = this.$props.id;
      console.warn("".concat(id, " meta_info() is req. for publishing"));
      console.warn("Format: meta_info() {\n                author: 'Satoshi Smith',\n                version: '1.0.0',\n                contact (opt) '<email>'\n                github: (opt) '<GitHub Page>',\n            }");
    },
    custom_event: function custom_event(event) {
      if (event.split(':')[0] === 'hook') return;
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      if (event === 'change-settings' || event === 'object-selected' || event === 'new-shader' || event === 'new-interface' || event === 'remove-tool') {
        args.push(this.grid_id, this.id);
        if (this.$props.settings.$uuid) {
          args.push(this.$props.settings.$uuid);
        }
      }
      if (event === 'new-interface') {
        args[0].overlay = this;
        args[0].uuid = this.last_ux_id = "".concat(this.grid_id, "-").concat(this.id, "-").concat(this.uxs_count++);
      }
      // TODO: add a namespace to the event name
      // TODO(2): this prevents call overflow, but
      // the root of evil is in (1)
      if (event === 'custom-event') return;
      this._$emit('custom-event', {
        event: event,
        args: args
      });
    },
    // TODO: the event is not firing when the same
    // overlay type is added to the offchart[]
    exec_script: function exec_script() {
      if (this.calc) this.$emit('exec-script', {
        grid_id: this.$props.grid_id,
        layer_id: this.$props.id,
        src: this.calc(),
        use_for: this.use_for()
      });
    }
  },
  watch: {
    settings: {
      handler: function handler(n, p) {
        if (this.watch_uuid) this.watch_uuid(n, p);
        this._$emit('show-grid-layer', {
          id: this.$props.id,
          display: 'display' in this.$props.settings ? this.$props.settings['display'] : true
        });
      },
      deep: true
    }
  },
  data: function data() {
    return {
      uxs_count: 0,
      last_ux_id: null
    };
  },
  render: function render(h) {
    return h();
  }
});
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Spline.vue?vue&type=script&lang=js
// Spline renderer. (SMAs, EMAs, TEMAs...
// you know what I mean)
// TODO: make a real spline, not a bunch of lines...

// Adds all necessary stuff for you.

/* harmony default export */ const Splinevue_type_script_lang_js = ({
  name: 'Spline',
  mixins: [overlay],
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.1.2'
      };
    },
    // Here goes your code. You are provided with:
    // { All stuff is reactive }
    // $props.layout -> positions of all chart elements +
    //  some helper functions (see layout_fn.js)
    // $props.interval -> candlestick time interval
    // $props.sub -> current subset of candlestick data
    // $props.data -> your indicator's data subset.
    //  Comes "as is", should have the following format:
    //  [[<timestamp>, ... ], ... ]
    // $props.colors -> colors (see TradingVue.vue)
    // $props.cursor -> current position of crosshair
    // $props.settings -> indicator's custom settings
    //  E.g. colors, line thickness, etc. You define it.
    // $props.num -> indicator's layer number (of All
    // layers in the current grid)
    // $props.id -> indicator's id (e.g. EMA_0)
    // ~
    // Finally, let's make the canvas dirty!
    draw: function draw(ctx) {
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color;
      ctx.beginPath();
      var layout = this.$props.layout;
      var i = this.data_index;
      var data = this.$props.data;
      if (!this.skip_nan) {
        for (var k = 0, n = data.length; k < n; k++) {
          var p = data[k];
          var x = layout.t2screen(p[0]);
          var y = layout.$2screen(p[i]);
          ctx.lineTo(x, y);
        }
      } else {
        var skip = false;
        for (var k = 0, n = data.length; k < n; k++) {
          var _p = data[k];
          var _x = layout.t2screen(_p[0]);
          var _y = layout.$2screen(_p[i]);
          if (_p[i] == null || _y !== _y) {
            skip = true;
          } else {
            if (skip) ctx.moveTo(_x, _y);
            ctx.lineTo(_x, _y);
            skip = false;
          }
        }
      }
      ctx.stroke();
    },
    // For all data with these types overlay will be
    // added to the renderer list. And '$props.data'
    // will have the corresponding values. If you want to
    // redefine the default behviour for a prticular
    // indicator (let's say EMA),
    // just create a new overlay with the same type:
    // e.g. use_for() { return ['EMA'] }.
    use_for: function use_for() {
      return ['Spline', 'EMA', 'SMA'];
    },
    // Colors for the legend, should have the
    // same dimention as a data point (excl. timestamp)
    data_colors: function data_colors() {
      return [this.color];
    }
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 0.75;
    },
    color: function color() {
      var n = this.$props.num % 5;
      return this.sett.color || this.COLORS[n];
    },
    data_index: function data_index() {
      return this.sett.dataIndex || 1;
    },
    // Don't connect separate parts if true
    skip_nan: function skip_nan() {
      return this.sett.skipNaN;
    }
  },
  data: function data() {
    return {
      COLORS: ['#42b28a', '#5691ce', '#612ff9', '#d50b90', '#ff2316']
    };
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Spline.vue?vue&type=script&lang=js
 /* harmony default export */ const overlays_Splinevue_type_script_lang_js = (Splinevue_type_script_lang_js); 
;// CONCATENATED MODULE: ./src/components/overlays/Spline.vue
var Spline_render, Spline_staticRenderFns
;



/* normalize component */
;
var Spline_component = normalizeComponent(
  overlays_Splinevue_type_script_lang_js,
  Spline_render,
  Spline_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Spline = (Spline_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Splines.vue?vue&type=script&lang=js
// Channel renderer. (Keltner, Bollinger)

/* harmony default export */ const Splinesvue_type_script_lang_js = ({
  name: 'Splines',
  mixins: [overlay],
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.1.0'
      };
    },
    draw: function draw(ctx) {
      for (var i = 0; i < this.lines_num; i++) {
        var _i = i % this.clrx.length;
        ctx.strokeStyle = this.clrx[_i];
        ctx.lineWidth = this.widths[i] || this.line_width;
        ctx.beginPath();
        this.draw_spline(ctx, i);
        ctx.stroke();
      }
    },
    draw_spline: function draw_spline(ctx, i) {
      var layout = this.$props.layout;
      var data = this.$props.data;
      if (!this.skip_nan) {
        for (var k = 0, n = data.length; k < n; k++) {
          var p = data[k];
          var x = layout.t2screen(p[0]);
          var y = layout.$2screen(p[i + 1]);
          ctx.lineTo(x, y);
        }
      } else {
        var skip = false;
        for (var k = 0, n = data.length; k < n; k++) {
          var _p = data[k];
          var _x = layout.t2screen(_p[0]);
          var _y = layout.$2screen(_p[i + 1]);
          if (_p[i + 1] == null || _y !== _y) {
            skip = true;
          } else {
            if (skip) ctx.moveTo(_x, _y);
            ctx.lineTo(_x, _y);
            skip = false;
          }
        }
      }
    },
    use_for: function use_for() {
      return ['Splines', 'DMI'];
    },
    data_colors: function data_colors() {
      return this.clrx;
    }
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 0.75;
    },
    widths: function widths() {
      return this.sett.lineWidths || [];
    },
    clrx: function clrx() {
      var colors = this.sett.colors || [];
      var n = this.$props.num;
      if (!colors.length) {
        for (var i = 0; i < this.lines_num; i++) {
          colors.push(this.COLORS[(n + i) % 5]);
        }
      }
      return colors;
    },
    lines_num: function lines_num() {
      if (!this.$props.data[0]) return 0;
      return this.$props.data[0].length - 1;
    },
    // Don't connect separate parts if true
    skip_nan: function skip_nan() {
      return this.sett.skipNaN;
    }
  },
  data: function data() {
    return {
      COLORS: ['#42b28a', '#5691ce', '#612ff9', '#d50b90', '#ff2316']
    };
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Splines.vue?vue&type=script&lang=js
 /* harmony default export */ const overlays_Splinesvue_type_script_lang_js = (Splinesvue_type_script_lang_js); 
;// CONCATENATED MODULE: ./src/components/overlays/Splines.vue
var Splines_render, Splines_staticRenderFns
;



/* normalize component */
;
var Splines_component = normalizeComponent(
  overlays_Splinesvue_type_script_lang_js,
  Splines_render,
  Splines_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Splines = (Splines_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Range.vue?vue&type=script&lang=js
// R S I . Because we love it

// Adds all necessary stuff for you.

/* harmony default export */ const Rangevue_type_script_lang_js = ({
  name: 'Range',
  mixins: [overlay],
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.0.1'
      };
    },
    // Here goes your code. You are provided with:
    // { All stuff is reactive }
    // $props.layout -> positions of all chart elements +
    //  some helper functions (see layout_fn.js)
    // $props.interval -> candlestick time interval
    // $props.sub -> current subset of candlestick data
    // $props.data -> your indicator's data subset.
    //  Comes "as is", should have the following format:
    //  [[<timestamp>, ... ], ... ]
    // $props.colors -> colors (see TradingVue.vue)
    // $props.cursor -> current position of crosshair
    // $props.settings -> indicator's custom settings
    //  E.g. colors, line thickness, etc. You define it.
    // $props.num -> indicator's layer number (of All
    // layers in the current grid)
    // $props.id -> indicator's id (e.g. EMA_0)
    // ~
    // Finally, let's make the canvas dirty!
    draw: function draw(ctx) {
      var layout = this.$props.layout;
      var upper = layout.$2screen(this.sett.upper || 70);
      var lower = layout.$2screen(this.sett.lower || 30);
      var data = this.$props.data;

      // RSI values

      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color;
      ctx.beginPath();
      for (var k = 0, n = data.length; k < n; k++) {
        var p = data[k];
        var x = layout.t2screen(p[0]);
        var y = layout.$2screen(p[1]);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.strokeStyle = this.band_color;
      ctx.setLineDash([5]); // Will be removed after draw()
      ctx.beginPath();

      // Fill the area between the bands
      ctx.fillStyle = this.back_color;
      ctx.fillRect(0, upper, layout.width, lower - upper);

      // Upper band
      ctx.moveTo(0, upper);
      ctx.lineTo(layout.width, upper);

      // Lower band
      ctx.moveTo(0, lower);
      ctx.lineTo(layout.width, lower);
      ctx.stroke();
    },
    // For all data with these types overlay will be
    // added to the renderer list. And '$props.data'
    // will have the corresponding values. If you want to
    // redefine the default behviour for a prticular
    // indicator (let's say EMA),
    // just create a new overlay with the same type:
    // e.g. use_for() { return ['EMA'] }.
    use_for: function use_for() {
      return ['Range', 'RSI'];
    },
    // Colors for the legend, should have the
    // same dimention as a data point (excl. timestamp)
    data_colors: function data_colors() {
      return [this.color];
    },
    // Y-Range tansform. For example you need a fixed
    // Y-range for an indicator, you can do it here!
    // Gets estimated range, @return you favorite range
    y_range: function y_range(hi, lo) {
      return [Math.max(hi, this.sett.upper || 70), Math.min(lo, this.sett.lower || 30)];
    }
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 0.75;
    },
    color: function color() {
      return this.sett.color || '#ec206e';
    },
    band_color: function band_color() {
      return this.sett.bandColor || '#ddd';
    },
    back_color: function back_color() {
      return this.sett.backColor || '#381e9c16';
    }
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Range.vue?vue&type=script&lang=js
 /* harmony default export */ const overlays_Rangevue_type_script_lang_js = (Rangevue_type_script_lang_js); 
;// CONCATENATED MODULE: ./src/components/overlays/Range.vue
var Range_render, Range_staticRenderFns
;



/* normalize component */
;
var Range_component = normalizeComponent(
  overlays_Rangevue_type_script_lang_js,
  Range_render,
  Range_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Range = (Range_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Trades.vue?vue&type=script&lang=js

/* harmony default export */ const Tradesvue_type_script_lang_js = ({
  name: 'Trades',
  mixins: [overlay],
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.0.2'
      };
    },
    draw: function draw(ctx) {
      var layout = this.$props.layout;
      var data = this.$props.data;
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'black';
      for (var k = 0, n = data.length; k < n; k++) {
        var p = data[k];
        ctx.fillStyle = p[1] ? this.buy_color : this.sell_color;
        ctx.beginPath();
        var x = layout.t2screen(p[0]); // x - Mapping
        var y = layout.$2screen(p[2]); // y - Mapping
        ctx.arc(x, y, this.marker_size + 0.5, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.stroke();
        if (this.show_label && p[3]) {
          this.draw_label(ctx, x, y, p);
        }
      }
    },
    draw_label: function draw_label(ctx, x, y, p) {
      ctx.fillStyle = this.label_color;
      ctx.font = this.new_font;
      ctx.textAlign = 'center';
      ctx.fillText(p[3], x, y - 25);
    },
    use_for: function use_for() {
      return ['Trades'];
    },
    // Defines legend format (values & colors)
    legend: function legend(values) {
      switch (values[1]) {
        case 0:
          var pos = 'Sell';
          break;
        case 1:
          pos = 'Buy';
          break;
        default:
          pos = 'Unknown';
      }
      return [{
        value: pos
      }, {
        value: values[2].toFixed(4),
        color: this.$props.colors.text
      }].concat(values[3] ? [{
        value: values[3]
      }] : []);
    }
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    default_font: function default_font() {
      return '12px ' + this.$props.font.split('px').pop();
    },
    buy_color: function buy_color() {
      return this.sett.buyColor || '#63df89';
    },
    sell_color: function sell_color() {
      return this.sett.sellColor || '#ec4662';
    },
    label_color: function label_color() {
      return this.sett.labelColor || '#999';
    },
    marker_size: function marker_size() {
      return this.sett.markerSize || 5;
    },
    show_label: function show_label() {
      return this.sett.showLabel !== false;
    },
    new_font: function new_font() {
      return this.sett.font || this.default_font;
    }
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Trades.vue?vue&type=script&lang=js
 /* harmony default export */ const overlays_Tradesvue_type_script_lang_js = (Tradesvue_type_script_lang_js); 
;// CONCATENATED MODULE: ./src/components/overlays/Trades.vue
var Trades_render, Trades_staticRenderFns
;



/* normalize component */
;
var Trades_component = normalizeComponent(
  overlays_Tradesvue_type_script_lang_js,
  Trades_render,
  Trades_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Trades = (Trades_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Channel.vue?vue&type=script&lang=js
// Channel renderer. (Keltner, Bollinger)
// TODO: allow color transparency
// TODO: improve performance: draw in one solid chunk

/* harmony default export */ const Channelvue_type_script_lang_js = ({
  name: 'Channel',
  mixins: [overlay],
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.0.1'
      };
    },
    /*draw(ctx) {
        ctx.lineWidth = this.line_width
        ctx.strokeStyle = this.color
        ctx.fillStyle = this.back_color
         for (var i = 0; i < this.$props.data.length - 1; i++) {
              let p1 = this.mapp(this.$props.data[i])
            let p2 = this.mapp(this.$props.data[i+1])
             if (!p2) continue
            if (p1.y1 !== p1.y1) continue // Fix NaN
             // Background
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y1)
            ctx.lineTo(p2.x + 0.1, p2.y1)
            ctx.lineTo(p2.x + 0.1, p2.y3)
            ctx.lineTo(p1.x, p1.y3)
            ctx.fill()
             // Lines
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y1)
            ctx.lineTo(p2.x, p2.y1)
            if (this.show_mid) {
                ctx.moveTo(p1.x, p1.y2)
                ctx.lineTo(p2.x, p2.y2)
            }
            ctx.moveTo(p1.x, p1.y3)
            ctx.lineTo(p2.x, p2.y3)
            ctx.stroke()
         }
    },*/
    draw: function draw(ctx) {
      // Background
      var data = this.data;
      var layout = this.layout;
      ctx.beginPath();
      ctx.fillStyle = this.back_color;
      for (var i = 0; i < data.length; i++) {
        var p = data[i];
        var x = layout.t2screen(p[0]);
        var y = layout.$2screen(p[1] || undefined);
        ctx.lineTo(x, y);
      }
      for (var i = data.length - 1; i >= 0; i--) {
        var _p = data[i];
        var _x = layout.t2screen(_p[0]);
        var _y = layout.$2screen(_p[3] || undefined);
        ctx.lineTo(_x, _y);
      }
      ctx.fill();

      // Lines
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color;

      // Top line
      ctx.beginPath();
      for (var i = 0; i < data.length; i++) {
        var _p2 = data[i];
        var _x2 = layout.t2screen(_p2[0]);
        var _y2 = layout.$2screen(_p2[1] || undefined);
        ctx.lineTo(_x2, _y2);
      }
      ctx.stroke();
      // Bottom line
      ctx.beginPath();
      for (var i = 0; i < data.length; i++) {
        var _p3 = data[i];
        var _x3 = layout.t2screen(_p3[0]);
        var _y3 = layout.$2screen(_p3[3] || undefined);
        ctx.lineTo(_x3, _y3);
      }
      ctx.stroke();
      // Middle line
      if (!this.show_mid) return;
      ctx.beginPath();
      for (var i = 0; i < data.length; i++) {
        var _p4 = data[i];
        var _x4 = layout.t2screen(_p4[0]);
        var _y4 = layout.$2screen(_p4[2] || undefined);
        ctx.lineTo(_x4, _y4);
      }
      ctx.stroke();
    },
    mapp: function mapp(p) {
      var layout = this.$props.layout;
      return p && {
        x: layout.t2screen(p[0]),
        y1: layout.$2screen(p[1]),
        y2: layout.$2screen(p[2]),
        y3: layout.$2screen(p[3])
      };
    },
    use_for: function use_for() {
      return ['Channel', 'KC', 'BB'];
    },
    data_colors: function data_colors() {
      return [this.color, this.color, this.color];
    }
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 0.75;
    },
    color: function color() {
      var n = this.$props.num % 5;
      return this.sett.color || this.COLORS[n];
    },
    show_mid: function show_mid() {
      return 'showMid' in this.sett ? this.sett.showMid : true;
    },
    back_color: function back_color() {
      return this.sett.backColor || this.color + '11';
    }
  },
  data: function data() {
    return {
      COLORS: ['#42b28a', '#5691ce', '#612ff9', '#d50b90', '#ff2316']
    };
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Channel.vue?vue&type=script&lang=js
 /* harmony default export */ const overlays_Channelvue_type_script_lang_js = (Channelvue_type_script_lang_js); 
;// CONCATENATED MODULE: ./src/components/overlays/Channel.vue
var Channel_render, Channel_staticRenderFns
;



/* normalize component */
;
var Channel_component = normalizeComponent(
  overlays_Channelvue_type_script_lang_js,
  Channel_render,
  Channel_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Channel = (Channel_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Segment.vue?vue&type=script&lang=js
// Segment renderer.


/* harmony default export */ const Segmentvue_type_script_lang_js = ({
  name: 'Segment',
  mixins: [overlay],
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.0.0'
      };
    },
    draw: function draw(ctx) {
      if (!this.p1 || !this.p2) return;
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color;
      ctx.beginPath();
      var layout = this.$props.layout;
      var x1 = layout.t2screen(this.p1[0]);
      var y1 = layout.$2screen(this.p1[1]);
      ctx.moveTo(x1, y1);
      var x2 = layout.t2screen(this.p2[0]);
      var y2 = layout.$2screen(this.p2[1]);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    },
    use_for: function use_for() {
      return ['Segment'];
    },
    data_colors: function data_colors() {
      return [this.color];
    }
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    p1: function p1() {
      return this.$props.settings.p1;
    },
    p2: function p2() {
      return this.$props.settings.p2;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 0.9;
    },
    color: function color() {
      var n = this.$props.num % 5;
      return this.sett.color || this.COLORS[n];
    }
  },
  data: function data() {
    return {
      COLORS: ['#42b28a', '#5691ce', '#612ff9', '#d50b90', '#ff2316']
    };
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Segment.vue?vue&type=script&lang=js
 /* harmony default export */ const overlays_Segmentvue_type_script_lang_js = (Segmentvue_type_script_lang_js); 
;// CONCATENATED MODULE: ./src/components/overlays/Segment.vue
var Segment_render, Segment_staticRenderFns
;



/* normalize component */
;
var Segment_component = normalizeComponent(
  overlays_Segmentvue_type_script_lang_js,
  Segment_render,
  Segment_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Segment = (Segment_component.exports);
;// CONCATENATED MODULE: ./src/components/js/layout_cnv.js


// Claculates postions and sizes for candlestick
// and volume bars for the given subset of data


function layout_cnv(self) {
  var $p = self.$props;
  var sub = $p.data;
  var t2screen = $p.layout.t2screen;
  var layout = $p.layout;
  var candles = [];
  var volume = [];

  // The volume bar height is determined as a percentage of
  // the chart's height (VOLSCALE)
  var maxv = Math.max.apply(Math, _toConsumableArray(sub.map(function (x) {
    return x[5];
  })));
  var vs = $p.config.VOLSCALE * layout.height / maxv;
  var x1,
    x2,
    w,
    avg_w,
    mid,
    prev = undefined;

  // Subset interval against main interval
  var _new_interval = new_interval(layout, $p, sub),
    _new_interval2 = _slicedToArray(_new_interval, 2),
    interval2 = _new_interval2[0],
    ratio = _new_interval2[1];
  var px_step2 = layout.px_step * ratio;
  var splitter = px_step2 > 5 ? 1 : 0;

  // A & B are current chart tranformations:
  // A === scale,  B === Y-axis shift
  for (var i = 0; i < sub.length; i++) {
    var p = sub[i];
    mid = t2screen(p[0]) + 1;

    // Clear volume bar if there is a time gap
    if (sub[i - 1] && p[0] - sub[i - 1][0] > interval2) {
      prev = null;
    }
    x1 = prev || Math.floor(mid - px_step2 * 0.5);
    x2 = Math.floor(mid + px_step2 * 0.5) - 0.5;

    // TODO: add log scale support
    candles.push({
      x: mid,
      w: layout.px_step * $p.config.CANDLEW * ratio,
      o: Math.floor(p[1] * layout.A + layout.B),
      h: Math.floor(p[2] * layout.A + layout.B),
      l: Math.floor(p[3] * layout.A + layout.B),
      c: Math.floor(p[4] * layout.A + layout.B),
      raw: p
    });
    volume.push({
      x1: x1,
      x2: x2,
      h: p[5] * vs,
      green: p[4] >= p[1],
      raw: p
    });
    prev = x2 + splitter;
  }
  return {
    candles: candles,
    volume: volume
  };
}
function layout_vol(self) {
  var $p = self.$props;
  var sub = $p.data;
  var t2screen = $p.layout.t2screen;
  var layout = $p.layout;
  var volume = [];

  // Detect data second dimention size:
  var dim = sub[0] ? sub[0].length : 0;

  // Support special volume data (see API book), or OHLCV
  // Data indices:
  self._i1 = dim < 6 ? 1 : 5;
  self._i2 = dim < 6 ? function (p) {
    return p[2];
  } : function (p) {
    return p[4] >= p[1];
  };
  var maxv = Math.max.apply(Math, _toConsumableArray(sub.map(function (x) {
    return x[self._i1];
  })));
  var volscale = self.volscale || $p.config.VOLSCALE;
  var vs = volscale * layout.height / maxv;
  var x1,
    x2,
    mid,
    prev = undefined;

  // Subset interval against main interval
  var _new_interval3 = new_interval(layout, $p, sub),
    _new_interval4 = _slicedToArray(_new_interval3, 2),
    interval2 = _new_interval4[0],
    ratio = _new_interval4[1];
  var px_step2 = layout.px_step * ratio;
  var splitter = px_step2 > 5 ? 1 : 0;

  // A & B are current chart tranformations:
  // A === scale,  B === Y-axis shift
  for (var i = 0; i < sub.length; i++) {
    var p = sub[i];
    mid = t2screen(p[0]) + 1;

    // Clear volume bar if there is a time gap
    if (sub[i - 1] && p[0] - sub[i - 1][0] > interval2) {
      prev = null;
    }
    x1 = prev || Math.floor(mid - px_step2 * 0.5);
    x2 = Math.floor(mid + px_step2 * 0.5) - 0.5;
    volume.push({
      x1: x1,
      x2: x2,
      h: p[self._i1] * vs,
      green: self._i2(p),
      raw: p
    });
    prev = x2 + splitter;
  }
  return volume;
}
function new_interval(layout, $p, sub) {
  // Subset interval against main interval
  if (!layout.ti_map.ib) {
    var interval2 = $p.tf || utils.detect_interval(sub);
    var ratio = interval2 / $p.interval;
  } else {
    if ($p.tf) {
      var ratio = $p.tf / layout.ti_map.tf;
      var interval2 = ratio;
    } else {
      var interval2 = utils.detect_interval(sub);
      var ratio = interval2 / $p.interval;
    }
  }
  return [interval2, ratio];
}
;// CONCATENATED MODULE: ./src/components/primitives/candle.js


// Candle object for Candles overlay
var CandleExt = /*#__PURE__*/function () {
  function CandleExt(overlay, ctx, data) {
    classCallCheck_classCallCheck(this, CandleExt);
    this.ctx = ctx;
    this.self = overlay;
    this.style = data.raw[6] || this.self;
    this.draw(data);
  }
  return createClass_createClass(CandleExt, [{
    key: "draw",
    value: function draw(data) {
      var green = data.raw[4] >= data.raw[1];
      var body_color = green ? this.style.colorCandleUp : this.style.colorCandleDw;
      var wick_color = green ? this.style.colorWickUp : this.style.colorWickDw;
      var w = Math.max(data.w, 1);
      var hw = Math.max(Math.floor(w * 0.5), 1);
      var h = Math.abs(data.o - data.c);
      var max_h = data.c === data.o ? 1 : 2;
      var x05 = Math.floor(data.x) - 0.5;
      this.ctx.strokeStyle = wick_color;
      this.ctx.beginPath();
      this.ctx.moveTo(x05, Math.floor(data.h));
      this.ctx.lineTo(x05, Math.floor(data.l));
      this.ctx.stroke();
      if (data.w > 1.5) {
        this.ctx.fillStyle = body_color;
        // TODO: Move common calculations to layout.js
        var s = green ? 1 : -1;
        this.ctx.fillRect(Math.floor(data.x - hw - 1), data.c, Math.floor(hw * 2 + 1), s * Math.max(h, max_h));
      } else {
        this.ctx.strokeStyle = body_color;
        this.ctx.beginPath();
        this.ctx.moveTo(x05, Math.floor(Math.min(data.o, data.c)));
        this.ctx.lineTo(x05, Math.floor(Math.max(data.o, data.c)) + (data.o === data.c ? 1 : 0));
        this.ctx.stroke();
      }
    }
  }]);
}();

;// CONCATENATED MODULE: ./src/components/primitives/volbar.js


var VolbarExt = /*#__PURE__*/function () {
  function VolbarExt(overlay, ctx, data) {
    classCallCheck_classCallCheck(this, VolbarExt);
    this.ctx = ctx;
    this.$p = overlay.$props;
    this.self = overlay;
    this.style = data.raw[6] || this.self;
    this.draw(data);
  }
  return createClass_createClass(VolbarExt, [{
    key: "draw",
    value: function draw(data) {
      var y0 = this.$p.layout.height;
      var w = data.x2 - data.x1;
      var h = Math.floor(data.h);
      this.ctx.fillStyle = data.green ? this.style.colorVolUp : this.style.colorVolDw;
      this.ctx.fillRect(Math.floor(data.x1), Math.floor(y0 - h - 0.5), Math.floor(w), Math.floor(h + 1));
    }
  }]);
}();

;// CONCATENATED MODULE: ./src/components/primitives/price.js


// Price bar & price line (shader)
var Price = /*#__PURE__*/function () {
  function Price(comp) {
    classCallCheck_classCallCheck(this, Price);
    this.comp = comp;
  }

  // Defines an inline shader (has access to both
  // target & overlay's contexts)
  return createClass_createClass(Price, [{
    key: "init_shader",
    value: function init_shader() {
      var _this = this;
      var layout = this.comp.$props.layout;
      var config = this.comp.$props.config;
      var comp = this.comp;
      var last_bar = function last_bar() {
        return _this.last_bar();
      };
      this.comp.$emit('new-shader', {
        target: 'sidebar',
        draw: function draw(ctx) {
          var bar = last_bar();
          if (!bar) return;
          var w = ctx.canvas.width;
          var h = config.PANHEIGHT;
          var lbl = bar.price.toFixed(layout.prec);
          ctx.fillStyle = bar.color;
          var x = -0.5;
          var y = bar.y - h * 0.5 - 0.5;
          var a = 7;
          ctx.fillRect(x - 0.5, y, w + 1, h);
          ctx.fillStyle = comp.$props.colors.textHL;
          ctx.textAlign = 'left';
          ctx.fillText(lbl, a, y + 15);
        }
      });
      this.shader = true;
    }

    // Regular draw call for overaly
  }, {
    key: "draw",
    value: function draw(ctx) {
      if (!this.comp.$props.meta.last) return;
      if (!this.shader) this.init_shader();
      var layout = this.comp.$props.layout;
      var last = this.comp.$props.last;
      var dir = last[4] >= last[1];
      var color = dir ? this.green() : this.red();
      var y = layout.$2screen(last[4]) + (dir ? 1 : 0);
      ctx.strokeStyle = color;
      ctx.setLineDash([1, 1]);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(layout.width, y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, {
    key: "last_bar",
    value: function last_bar() {
      if (!this.comp.data.length) return undefined;
      var layout = this.comp.$props.layout;
      var last = this.comp.data[this.comp.data.length - 1];
      var y = layout.$2screen(last[4]);
      //let cndl = layout.c_magnet(last[0])
      return {
        y: y,
        //Math.floor(cndl.c) - 0.5,
        price: last[4],
        color: last[4] >= last[1] ? this.green() : this.red()
      };
    }
  }, {
    key: "last_price",
    value: function last_price() {
      return this.comp.$props.meta.last ? this.comp.$props.meta.last[4] : undefined;
    }
  }, {
    key: "green",
    value: function green() {
      return this.comp.colorCandleUp;
    }
  }, {
    key: "red",
    value: function red() {
      return this.comp.colorCandleDw;
    }
  }]);
}();

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Candles.vue?vue&type=script&lang=js
// Renedrer for candlesticks + volume (optional)
// It can be used as the main chart or an indicator






/* harmony default export */ const Candlesvue_type_script_lang_js = ({
  name: 'Candles',
  mixins: [overlay],
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.2.1'
      };
    },
    init: function init() {
      this.price = new Price(this);
    },
    draw: function draw(ctx) {
      // If data === main candlestick data
      // render as main chart:
      if (this.$props.sub === this.$props.data) {
        var cnv = {
          candles: this.$props.layout.candles,
          volume: this.$props.layout.volume
        };
        // Else, as offchart / onchart indicator:
      } else {
        cnv = layout_cnv(this);
      }
      if (this.show_volume) {
        var cv = cnv.volume;
        for (var i = 0, n = cv.length; i < n; i++) {
          new VolbarExt(this, ctx, cv[i]);
        }
      }
      var cc = cnv.candles;
      for (var i = 0, n = cc.length; i < n; i++) {
        new CandleExt(this, ctx, cc[i]);
      }
      if (this.price_line) this.price.draw(ctx);
    },
    use_for: function use_for() {
      return ['Candles'];
    },
    // In case it's added as offchart overlay
    y_range: function y_range() {
      var hi = -Infinity,
        lo = Infinity;
      for (var i = 0, n = this.sub.length; i < n; i++) {
        var x = this.sub[i];
        if (x[2] > hi) hi = x[2];
        if (x[3] < lo) lo = x[3];
      }
      return [hi, lo];
    }
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    show_volume: function show_volume() {
      return 'showVolume' in this.sett ? this.sett.showVolume : true;
    },
    price_line: function price_line() {
      return 'priceLine' in this.sett ? this.sett.priceLine : true;
    },
    colorCandleUp: function colorCandleUp() {
      return this.sett.colorCandleUp || this.$props.colors.candleUp;
    },
    colorCandleDw: function colorCandleDw() {
      return this.sett.colorCandleDw || this.$props.colors.candleDw;
    },
    colorWickUp: function colorWickUp() {
      return this.sett.colorWickUp || this.$props.colors.wickUp;
    },
    colorWickDw: function colorWickDw() {
      return this.sett.colorWickDw || this.$props.colors.wickDw;
    },
    colorWickSm: function colorWickSm() {
      return this.sett.colorWickSm || this.$props.colors.wickSm;
    },
    colorVolUp: function colorVolUp() {
      return this.sett.colorVolUp || this.$props.colors.volUp;
    },
    colorVolDw: function colorVolDw() {
      return this.sett.colorVolDw || this.$props.colors.volDw;
    }
  },
  data: function data() {
    return {
      price: {}
    };
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Candles.vue?vue&type=script&lang=js
 /* harmony default export */ const overlays_Candlesvue_type_script_lang_js = (Candlesvue_type_script_lang_js); 
;// CONCATENATED MODULE: ./src/components/overlays/Candles.vue
var Candles_render, Candles_staticRenderFns
;



/* normalize component */
;
var Candles_component = normalizeComponent(
  overlays_Candlesvue_type_script_lang_js,
  Candles_render,
  Candles_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Candles = (Candles_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Volume.vue?vue&type=script&lang=js

function Volumevue_type_script_lang_js_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = Volumevue_type_script_lang_js_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function Volumevue_type_script_lang_js_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return Volumevue_type_script_lang_js_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return Volumevue_type_script_lang_js_arrayLikeToArray(o, minLen); }
function Volumevue_type_script_lang_js_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
// Standalone renedrer for the volume




/* harmony default export */ const Volumevue_type_script_lang_js = ({
  name: 'Volume',
  mixins: [overlay],
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.1.0'
      };
    },
    draw: function draw(ctx) {
      // TODO: volume average
      // TODO: Y-axis scaling
      var _iterator = Volumevue_type_script_lang_js_createForOfIteratorHelper(layout_vol(this)),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var v = _step.value;
          new VolbarExt(this, ctx, v);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    },
    use_for: function use_for() {
      return ['Volume'];
    },
    // Defines legend format (values & colors)
    // _i2 - detetected data index (see layout_cnv)
    legend: function legend(values) {
      var flag = this._i2 ? this._i2(values) : values[2];
      var color = flag ? this.colorVolUpLegend : this.colorVolDwLegend;
      return [{
        value: values[this._i1 || 1],
        color: color
      }];
    },
    // When added as offchart overlay
    // If data is OHLCV => recalc y-range
    // _i1 - detetected data index (see layout_cnv)
    y_range: function y_range(hi, lo) {
      var _this = this;
      if (this._i1 === 5) {
        var sub = this.$props.sub;
        return [Math.max.apply(Math, _toConsumableArray(sub.map(function (x) {
          return x[_this._i1];
        }))), Math.min.apply(Math, _toConsumableArray(sub.map(function (x) {
          return x[_this._i1];
        })))];
      } else {
        return [hi, lo];
      }
    }
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    colorVolUp: function colorVolUp() {
      return this.sett.colorVolUp || this.$props.colors.volUp;
    },
    colorVolDw: function colorVolDw() {
      return this.sett.colorVolDw || this.$props.colors.volDw;
    },
    colorVolUpLegend: function colorVolUpLegend() {
      return this.sett.colorVolUpLegend || this.$props.colors.candleUp;
    },
    colorVolDwLegend: function colorVolDwLegend() {
      return this.sett.colorVolDwLegend || this.$props.colors.candleDw;
    },
    volscale: function volscale() {
      return this.sett.volscale || this.$props.grid_id > 0 ? 0.85 : this.$props.config.VOLSCALE;
    }
  },
  data: function data() {
    return {};
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Volume.vue?vue&type=script&lang=js
 /* harmony default export */ const overlays_Volumevue_type_script_lang_js = (Volumevue_type_script_lang_js); 
;// CONCATENATED MODULE: ./src/components/overlays/Volume.vue
var Volume_render, Volume_staticRenderFns
;



/* normalize component */
;
var Volume_component = normalizeComponent(
  overlays_Volumevue_type_script_lang_js,
  Volume_render,
  Volume_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Volume = (Volume_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Splitters.vue?vue&type=script&lang=js
// Data section splitters (with labels)


/* harmony default export */ const Splittersvue_type_script_lang_js = ({
  name: 'Splitters',
  mixins: [overlay],
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.0.1'
      };
    },
    draw: function draw(ctx) {
      var _this = this;
      var layout = this.$props.layout;
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.line_color;
      this.$props.data.forEach(function (p, i) {
        ctx.beginPath();
        var x = layout.t2screen(p[0]); // x - Mapping
        ctx.setLineDash([10, 10]);
        ctx.moveTo(x, 0);
        ctx.lineTo(x, _this.layout.height);
        ctx.stroke();
        if (p[1]) _this.draw_label(ctx, x, p);
      });
    },
    draw_label: function draw_label(ctx, x, p) {
      var side = p[2] ? 1 : -1;
      x += 2.5 * side;
      ctx.font = this.new_font;
      var pos = p[4] || this.y_position;
      var w = ctx.measureText(p[1]).width + 10;
      var y = this.layout.height * (1.0 - pos);
      y = Math.floor(y);
      ctx.fillStyle = p[3] || this.flag_color;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 10 * side, y - 10 * side);
      ctx.lineTo(x + (w + 10) * side, y - 10 * side);
      ctx.lineTo(x + (w + 10) * side, y + 10 * side);
      ctx.lineTo(x + 10 * side, y + 10 * side);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = this.label_color;
      ctx.textAlign = side < 0 ? 'right' : 'left';
      ctx.fillText(p[1], x + 15 * side, y + 4);
    },
    use_for: function use_for() {
      return ['Splitters'];
    }
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    new_font: function new_font() {
      return this.sett.font || '12px ' + this.$props.font.split('px').pop();
    },
    flag_color: function flag_color() {
      return this.sett.flagColor || '#4285f4';
    },
    label_color: function label_color() {
      return this.sett.labelColor || '#fff';
    },
    line_color: function line_color() {
      return this.sett.lineColor || '#4285f4';
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 1.0;
    },
    y_position: function y_position() {
      return this.sett.yPosition || 0.9;
    }
  },
  data: function data() {
    return {};
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Splitters.vue?vue&type=script&lang=js
 /* harmony default export */ const overlays_Splittersvue_type_script_lang_js = (Splittersvue_type_script_lang_js); 
;// CONCATENATED MODULE: ./src/components/overlays/Splitters.vue
var Splitters_render, Splitters_staticRenderFns
;



/* normalize component */
;
var Splitters_component = normalizeComponent(
  overlays_Splittersvue_type_script_lang_js,
  Splitters_render,
  Splitters_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Splitters = (Splitters_component.exports);
;// CONCATENATED MODULE: ./src/stuff/keys.js


function keys_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = keys_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function keys_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return keys_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return keys_arrayLikeToArray(o, minLen); }
function keys_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
// Keyboard event handler for overlay
var Keys = /*#__PURE__*/function () {
  function Keys(comp) {
    classCallCheck_classCallCheck(this, Keys);
    this.comp = comp;
    this.map = {};
    this.listeners = 0;
    this.keymap = {};
  }
  return createClass_createClass(Keys, [{
    key: "on",
    value: function on(name, handler) {
      if (!handler) return;
      this.map[name] = this.map[name] || [];
      this.map[name].push(handler);
      this.listeners++;
    }

    // Called by grid.js
  }, {
    key: "emit",
    value: function emit(name, event) {
      if (name in this.map) {
        var _iterator = keys_createForOfIteratorHelper(this.map[name]),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var f = _step.value;
            f(event);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
      if (name === 'keydown') {
        if (!this.keymap[event.key]) {
          this.emit(event.key);
        }
        this.keymap[event.key] = true;
      }
      if (name === 'keyup') {
        this.keymap[event.key] = false;
      }
    }
  }, {
    key: "pressed",
    value: function pressed(key) {
      return this.keymap[key];
    }
  }]);
}();

;// CONCATENATED MODULE: ./src/mixins/tool.js
function tool_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = tool_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function tool_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return tool_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return tool_arrayLikeToArray(o, minLen); }
function tool_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
// Usuful stuff for creating tools. Include as mixin



/* harmony default export */ const tool = ({
  methods: {
    init_tool: function init_tool() {
      var _this = this;
      // Collision functions (float, float) => bool,
      this.collisions = [];
      this.pins = [];
      this.mouse.on('mousemove', function (e) {
        if (_this.collisions.some(function (f) {
          return f(_this.mouse.x, _this.mouse.y);
        })) {
          _this.show_pins = true;
        } else {
          _this.show_pins = false;
        }
        if (_this.drag) _this.drag_update();
      });
      this.mouse.on('mousedown', function (e) {
        if (utils.default_prevented(e)) return;
        if (_this.collisions.some(function (f) {
          return f(_this.mouse.x, _this.mouse.y);
        })) {
          if (!_this.selected) {
            _this.$emit('object-selected');
          }
          _this.start_drag();
          e.preventDefault();
          _this.pins.forEach(function (x) {
            return x.mousedown(e, true);
          });
        }
      });
      this.mouse.on('mouseup', function (e) {
        _this.drag = null;
        _this.$emit('scroll-lock', false);
      });
      this.keys = new Keys(this);
      this.keys.on('Delete', this.remove_tool);
      this.keys.on('Backspace', this.remove_tool);
      this.show_pins = false;
      this.drag = null;
    },
    render_pins: function render_pins(ctx) {
      if (this.selected || this.show_pins) {
        this.pins.forEach(function (x) {
          return x.draw(ctx);
        });
      }
    },
    set_state: function set_state(name) {
      this.$emit('change-settings', {
        $state: name
      });
    },
    watch_uuid: function watch_uuid(n, p) {
      // If layer $uuid is changed, then re-init
      // pins & collisions
      if (n.$uuid !== p.$uuid) {
        var _iterator = tool_createForOfIteratorHelper(this.pins),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var p = _step.value;
            p.re_init();
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        this.collisions = [];
        this.show_pins = false;
        this.drag = null;
      }
    },
    pre_draw: function pre_draw() {
      // Delete all collision functions before
      // the draw() call and let primitives set
      // them again
      this.collisions = [];
    },
    remove_tool: function remove_tool() {
      if (this.selected) this.$emit('remove-tool');
    },
    start_drag: function start_drag() {
      this.$emit('scroll-lock', true);
      var cursor = this.$props.cursor;
      this.drag = {
        t: cursor.t,
        y$: cursor.y$
      };
      this.pins.forEach(function (x) {
        return x.rec_position();
      });
    },
    drag_update: function drag_update() {
      var dt = this.$props.cursor.t - this.drag.t;
      var dy = this.$props.cursor.y$ - this.drag.y$;
      this.pins.forEach(function (x) {
        return x.update_from([x.t1 + dt, x.y$1 + dy], true);
      });
    }
  },
  computed: {
    // Settings starting with $ are reserved
    selected: function selected() {
      return this.$props.settings.$selected;
    },
    state: function state() {
      return this.$props.settings.$state;
    }
  }
});
;// CONCATENATED MODULE: ./src/stuff/icons.json
const icons_namespaceObject = /*#__PURE__*/JSON.parse('{"extended.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAANElEQVR4nGNggABGEMEEIlhABAeI+AASF0AlHmAqA4kzKAAx8wGQuAMKwd6AoYzBAWonAwAcLwTgNfJ3RQAAAABJRU5ErkJggg==","ray.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAAMklEQVR4nGNgQAJMIIIFRHCACAEQoQAiHICYvQEkjkrwYypjAIkzwk2zAREuqIQFzD4AE3kE4BEmGggAAAAASUVORK5CYII=","segment.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAgMAAAC5h23wAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAlQTFRFAAAATU1NJCQkCxcHIQAAAAN0Uk5TAP8SmutI5AAAACxJREFUeJxjYMACGAMgNAsLdpoVKi8AVe8A1QblQlWRKt0AoULw2w1zGxoAABdiAviQhF/mAAAAAElFTkSuQmCC","add.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAH5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAACgoKBgYGGxsbKioqPz8/Pj4+BQUFCQkJAQEBZGRkh4eHAgICEBAQNjY2g4ODgYGBAAAAAwMDeXl5d3d3GBgYERERgICAgICANDQ0PDw8Y2NjCAgIhYWFGhoaJycnOjo6YWFhgICAdXV14Y16sQAAACp0Uk5TAAILDxIKESEnJiYoKCgTKSkpKCAnKSkFKCkpJiDl/ycpKSA2JyYpKSkpOkQ+xgAAARdJREFUeJzllNt2gyAQRTWiRsHLoDU0GpPYmMv//2BMS+sgl6Z9bM8bi73gnJkBz/sn8lcBIUHofwtG8TpJKUuTLI6cYF7QEqRKynP71VX9AkhNXVlsbMQrLLQVGyPZLsGHWgPrCxMJwHUPlXa79NBp2et5d9f3u3m1XxatQNn7SagOXCUjCjYUDuqxcWlHj4MSfw12FDJchFViRN8+1qcQoUH6lR1L1mEMEErofB6WzEUwylzomfzOQGiOJdXiWH7mQoUyMa4WXJQWOBvLFvPCGxt6FSr5kyH0qi0YddNG2/pgCsOjff4ZTizXPNwKIzl56OoGg9d9Z/+5cs6On+CFCfevFQ3ZaTycx1YMbvDdRvjkp/lHdAcPXzokxcwfDwAAAABJRU5ErkJggg==","cursor.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAgMAAAC5h23wAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAxQTFRFAAAATU1NTU1NTU1NwlMHHwAAAAR0Uk5TAOvhxbpPrUkAAAAkSURBVHicY2BgYHBggAByabxg1WoGBq2pRCk9AKUbcND43AEAufYHlSuusE4AAAAASUVORK5CYII=","display_off.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAU1QTFRFAAAAh4eHh4eHAAAAAAAAAAAAAwMDAAAAAAAAhoaGGBgYgYGBAAAAPz8/AgICg4ODCQkJhISEh4eHh4eHPj4+NjY2gYGBg4ODgYGBgYGBgoKCAQEBJycngoKChYWFEBAQg4ODCAgIKioqZGRkCgoKBQUFERERd3d3gYGBGxsbNDQ0hISEgYGBPDw8gYGBgYGBh4eHh4eHhYWFh4eHgoKChYWFgYGBgYGBg4ODhoaGg4ODYWFhgoKCBgYGdXV1goKCg4ODgYGBgICAgYGBAAAAg4ODhYWFhISEh4eHgoKChYWFOjo6goKCGhoah4eHh4eHh4eHgoKCh4eHeXl5hoaGgoKChISEgYGBgYGBgoKCY2NjgYGBgoKCh4eHgoKCgYGBhoaGg4ODhoaGhYWFh4eHgYGBhoaGhoaGhoaGg4ODgoKChISEgoKChYWFh4eHfKktUwAAAG90Uk5TACn/AhEFKA8SLCbxCigoVBNKUTYoJ/lh3PyAKSaTNiBtICYpISggKSkmJ0LEKef3lGxA8rn//+pcMSkpnCcptHPJKe0LUjnx5LzKKaMnX73hl64pLnhkzNSgKeLv17LQ+liIzaLe7PfTw5tFpz3K1fXR/gAAAgBJREFUeJzllNdXwjAUxknB0lIoCKVsGTIFQRAZ7r333nuv///R3LZ4mlDQZ/0ekp7b37n5bnITk+mfyDxv5Tir3fwjaElO5BIOKZFLJS1dQVfI0Y809TtEV+elo95RpFPWG+1go4fdQ5QybI8haaNBkM2ANbM09bnrwaPY7iFKrz7EMBdu7CHdVruXIt0M1hb+GKA3LTRKkp5lTA6Dg6xIkhaHhvQ1IlW/UCouQdJNJTRIpk1qO7+wUpcfpl537oBc7VNip3Gi/AmVPBAC1UrL6HXtSGVT+k2Yz0Focad07OMRf3P5BEbd63PFQx7HN+w61JoAm+uBlV48O/0jkLSMmtPCmQ8HwlYdykFV4/LJPp7e3hVyFdapHNehLk6PSjhSkBvwu/cFyJGIYvOyhoc1jjYQFGbygD4CWjoAMla/og3YoSw+KPhjPNoFcim4iFD+pFYA8zZ9WeYU5OBjZ3ORWyCfG03E+47kKpCIJTpGO4KP8XMgtw990xG/PBNTgmPEEXwf7P42oOdFIRAoBCtqTKL6Rcwq4Xsgh5xYC/mmSs6yJKk1YbnVeTq1NaEpmlHbmVn2EORkW2trF2ZzmHGTSUMGl1a9hp4ySRpdQ8yKGURpMmRIYg9pb1YPzg6kO79cLlE6bYFjEtv91bLEUxvhwbWwjY13BxUb9l8+mn9EX8x3Nki8ff5wAAAAAElFTkSuQmCC","display_on.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAR1QTFRFAAAAh4eHgYGBAAAAAAAAgYGBAAAAAwMDAAAAAAAAgYGBg4ODGBgYgYGBhISEAAAAPz8/AgIChoaGCQkJhYWFPj4+NjY2goKCgYGBAQEBJycngYGBgoKCEBAQCAgIhISEKioqZGRkCgoKBQUFERERd3d3gYGBg4ODgYGBGxsbNDQ0hISEgoKCgoKChYWFPDw8gYGBgYGBhoaGgoKCg4ODgoKCgYGBgoKCgoKCgoKCg4ODgoKChoaGgoKCgYGBhoaGg4ODYWFhBgYGdXV1gYGBg4ODgoKCgICAg4ODg4ODhISEAAAAg4ODOjo6gYGBGhoaeXl5goKCgYGBgoKChYWFgoKChISEgoKCY2NjgYGBg4ODgYGBgYGBg4ODgYGBo8n54AAAAF90Uk5TACn/AhH3BSgPEuhUJvFACigoLBM2KCeA6ykm+pMgIEkmKSEoICn9XCkmJ0u6nDop4sUypGuEzLZ6vmCYLZ/dLykpJynUYa8pcllCC1Ip2ycpisl1PadFsintbsPQZdi/bTW7AAAB4UlEQVR4nOWUZ1fCMBSGSSGWFiq0UDbIkr2XbBwMxS0b1P//M0xK9XSiftX7oel585zkvfcmMRj+SRhvzRRlthm/BU3Ry3TYzofTsajpIOjw2iNAjIiddehvHXSdA0mkXEEdG0fkE1DEKXmkSVqVIA6rBmsktUgAWLWHoGp30UNclbtLmwQgoyya91wPTbFy0mQXJ5zJQO6BgXRjfH0iSkX5stHIXr5r0bB/lu8syjR8rzsFbR2SpX+5J2eMP3csLtYsEY2K8BeTFuE2jaVCBw7bHOBuxq16AXmpbui3LtIfbRLUHMY2q4lcFo2WB4KA1SUAlWumNEKCzyxBKZxVHvYGaFguCBx1vM/x0IPzoqQoj5SdP4mns2cCGhBsrgj0uaeUBtzMyxQN8w4mYROTW8+r0oANp8W5mf6WQw5aCYJ2o7ymPaKMi2uVpmWM4TW6tdImgGo1bT4nK6DbbsCc0AZSdmLEFszzHrh6riVvRrNA3/9SE8QLWQu+Gjto9+gE9NBMwr9zi83gFeeFTe11zpm1CHE3HeyVCSknf3MIDcFTbfJKdbR1L4xX49L+/BoillV5uPJqkshD3JWSgpNMXP/lcrD8+hO84MnDr5YpFHv0Fe99VjJ0GBRs2H74aP6R+ACr+TFvZNAQ1wAAAABJRU5ErkJggg==","down.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAAAXNSR0IB2cksfwAAAKVQTFRFAAAAg4ODgICAAAAAAAAAAAAACAgIAAAAAAAAAAAAAAAAOTk5hYWFEBAQfHx8ODg4dnZ2NDQ0XV1dGxsbKCgogICAFBQUIiIiZGRkgICAgICAFRUVAAAAgICAgICAgICAf39/Li4ugICAcHBwgoKCgICAgoKCgICAg4ODgYGBPj4+goKCgICAhISEgYGBgICAgoKCgICAgYGBgYGBf39/gICAgICAIdPQHAAAADd0Uk5TACn/KAIRIBMFDwooKyApKSknKSYmzCcmKfL7JRCUi2L3J7IpcLUrr0VbKXntNEnkMbxrUcG56CMpi50AAAFZSURBVHic5ZRpf4MgDIeFKFatWm/tfW091u7evv9Hm1Acoujm2y0vFPH5Jf+EEE37J6bblmlatv4jaBCI4rMfR0CMXtAEJ0fccgfM7tAkQHXzArdDxggmqGETGCnJWROkNlOwOqhIhKCtgbSicw1uK/dATSK0aRatIzytA8ik4XSiyJnLSm+VPxULgeyLI3uHRJH+qcB4WZGrKb4c20WwI7b3iUt74OS6XD+xZWrXUCtme0uKTvfcJ65CZFa9VOebqwXmft+oT8yF+/VymT4XeGB+Xx8L+j4gBcoFIDT+oMz6Qp93Y74pCeBpUXaLuW0rUk6r1iv3nP322ewYkgv2nZIvgpSPQDrY5wTjRJDNg9XAE/+uSXIVX812GdKEmtvR2rtWaw+5MAOuofJy79SXu9TgBl4d9DZdI0NjgyiswNCB/qk1J5Bmvp+lQOa9IJNhW4bxm6H5R+wLQYMSQXZNzbcAAAAASUVORK5CYII=","price_range.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAAIUlEQVR4nGNggAPm/w9gTA4QIQMitECEJ1yMEgLNDiAAADfgBMRu78GgAAAAAElFTkSuQmCC","price_time.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAAOklEQVR4nGNggAPm/w9gTA4QIQPEClpMQMITRHCACScQoQQihBgY9P//grKgYk5wdTACYhQHFjuAAABZFAlc4e1fcQAAAABJRU5ErkJggg==","remove.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAK5QTFRFAAAAh4eHgICAAAAAAAAAh4eHAAAAAwMDAAAAAAAAgICAGBgYAAAAPz8/AgICgICACQkJhoaGhoaGgICAPj4+NjY2gYGBg4ODgYGBAQEBJycngoKCEBAQgICAgICACAgIKioqZGRkCgoKBQUFERERd3d3gYGBGxsbNDQ0gICAPDw8YWFhBgYGdXV1gICAg4ODgICAAAAAOjo6GhoaeXl5gICAhYWFY2NjhYWFgICA9O0oCgAAADp0Uk5TACn/AhErBSgPEvEmCigowxMuMcgoJ7hWrCkmdCD6vSAmKSEoICkpJie6KSknKSkp0wspJynCMik11rrLte8AAAFwSURBVHic5ZTXkoIwFIZNAAPSpKkoRQV7Wcva3v/FFiRmEwise7t7bs7MP98k/ylJq/VPQjjKiiJrwo+gON0uxro7XiRTsRHs+voE4JjoRrf+6sD7AFTMvaDGRht9glLMUJtLqmUwD5XDCohHAmBUPQSV27GHtFK7xycBWJab5uPaR+Hlmue7GfZxHwyWFHVMQghXFgD2A8IOZtfssdNJIXcyFEaSfchzp9BuMVP+Fhvr5Qh0nGfqYTGhm3BcYFUaQBKOhMWzRqHyGFRY03ppQ5lCFZ30RloVZGQTaa3QqEt0OyrQnkSkk8I1YJkvAwPCMgY0UpbzXRZhVbosIWGbZTLNQszGMCM42FJEjWDDjIAMtp+xj6x2K+/DqNDc0r4Yc8yGl3uer2aIyT1iyd8sYSuY8cldZbVrH4zPebTvP8OMNSoedj6XzDyk3pwG98u0/ufqGu7tBW5c1PxriXFyHq5PQxXFzeDThvbmp/lH4gt6WxfZ03H8DwAAAABJRU5ErkJggg==","settings.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAW5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAACgoKBgYGGxsbKioqQEBAPj4+BQUFCAgIAQEBPz8/ZWVlh4eHZGRkAgICCQkJDw8PNjY2g4ODgoKCNTU1EBAQAAAAAwMDeXl5d3d3AAAAGBgYAAAAERERioqKgoKCgoKCgoKCgYGBgoKChISEhoaGNDQ0g4ODgICAgICAgICAgYGBgYGBhYWFgICAgICAPT09AAAAgYGBgICAgICAgICAgICAY2NjCAgIgICAgICAhYWFhYWFgYGBHBwcgICAhYWFGhoagYGBgYGBg4ODhoaGJycnAAAAhISEgICAg4ODPDw8AAAAgoKCgICAhISEOjo6h4eHgoKCgYGBgICAf39/gYGBgoKCgICAGBgYgYGBg4ODg4ODgICACwsLgYGBgICAgYGBgYGBgYGBgICAgYGBYWFhf39/g4ODPj4+gYGBg4ODgICAhYWFgoKCgYGBgICAgYGBgoKCdXV1T0kC9QAAAHp0Uk5TAAILDxMKESEnJiYpKSgTKSgpKSkoEyAnKSknIAYoKSkFJQEgKl94jYVvVC4nU9f/+K8pOu71KBCi3NPq/ikg0e01Nokm1UUnsZVqQSYOT9lrKRJz5lIpK12jyu+sesgnhGVLxCG55a6Um+GaKfJCKKRgKUt8ocergymDQ9knAAABsElEQVR4nOWUV1vCMBSGg1AQpBZrcVdE3KJxo4LgnuCoe4F7orjHv7doTk3bgF7rd5OnX94nZ+SkCP0TWQqsNpuVs/wI2h2FTleR2+XkHfa8YLHgKRGJSj2SN3fosvIKkVJlVXWONGrkWtEgn1zHJP1GMCs/g7XILFIUpXoTWmaKTnIImGovh72Gxqbmlta2dvgOGpsmQO0dnfhTXd3E6JH0pN1DNnr7MFE/HDsQ0qEO6Pxg9sCh4XDkGx2J6sovBD+G8eiYuo5PxLTKeLoJBZNgT2EcnjY0YYajUKsL7Fk1gcjU3PwChcYTFGorAnsRqlpa1tAVhUbdmr+6RtjIOlgbCjMBUdzc2t7ZzbJ7zAQ4p6GSfRVNwkeKLsvCg31w2JBdjlT0GDxZNzEnpcQ+xWfnFxeXVyp6Tay07gq+L/YUOoBvbomV0V8skiq//DutWfeEfJD1JPLCED4+Pb8kX986tApNQ4iqfSJT76bRzvlgBPODQXW/foYqK5lyeBeYJEL1gaoeGnwIBhjRoQ9SZgTAdEbO/9cKRfmZ+MpGPCVHQ3nBzzS4hKIkuNyh/5g+ALiAXSSas9hwAAAAAElFTkSuQmCC","time_range.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAAJElEQVR4nGNgwAsUGJhQCScQoQQihBgY9P//grKgYk4YOvACACOpBKG6Svj+AAAAAElFTkSuQmCC","trash.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAALUlEQVR4nGNgAIN6ENHQACX4//9gYBBgYIESYC4LkA0lPEkmGFAI5v8PILYCAHygDJxlK0RUAAAAAElFTkSuQmCC","up.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAMZQTFRFAAAAh4eHgICAAAAAAAAAAAAAAwMDAAAAAAAAGBgYAAAAPz8/AgICCQkJgICAh4eHPj4+NjY2AQEBJycnEBAQgICAgICACAgIKioqZGRkCgoKBQUFgYGBERERd3d3gYGBGxsbNDQ0gICAgYGBPDw8gYGBh4eHgICAYWFhBgYGgYGBdXV1goKCg4ODhYWFgICAgoKCAAAAhISEOjo6gICAGhoagYGBeXl5hoaGgICAY2Njg4ODgoKCgoKCgYGBgoKCg4ODgoKC64uw1gAAAEJ0Uk5TACn/AhEFKA8SJgooKBP7KignKSYg9c0gJikhKLQgKSkmJ7ywKY8s5SknlClxKTMpXwtFKe0neiku8ClKWmSbbFFjM5GHSgAAAW5JREFUeJzllGd/gjAQxk3AMFWWOHDvVa2rVbu//5cqhJWQQO3b9nkVjv/v7rnLKJX+iYS9JMuSKvwIiu3loKkZzYHXFgvBiqW1QKSWplfySzvmAyDUN50cG2X0DDLqoTKXVLJgIIXDCohHAqCzHhymeuShy/Ru8kkAhtmhWUTvW9fdEnPQaVLU0n8XF0L3kn5P6LTtZPKgNoK+RrUkcGtQ7S9TsgOxxinrkUPYD+LwLCIh7CTsWSVQqRmTuPqpitlZFLQlApXjrsYBc335wOw47ksmUSMMrgKi/gnAE/awCqNHmTUwDf5X34LlBuedsgbUsK15kPMxTIXzzvFSIdsSPBw7nGD1K+7bL3F9xStEnZhoCw71TbpL71GBBbUF1MZmZWTOi97PI3eIJn9zCEtOj0+umaOde2EszqW9/xr6rM54WFtc0vfQNak57Ibd/Jerohu3GFwYqPjVEhve2Z4cbQU1ikFsQ73z0fwj+ga3VBezGuggFQAAAABJRU5ErkJggg=="}');
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/defineProperty.js

function _defineProperty(obj, key, value) {
  key = toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
;// CONCATENATED MODULE: ./src/components/primitives/pin.js



// Semi-automatic pin object. For stretching things.


var Pin = /*#__PURE__*/function () {
  // (Comp reference, a name in overlay settings,
  // pin parameters)
  function Pin(comp, name, params) {
    var _this = this;
    if (params === void 0) {
      params = {};
    }
    classCallCheck_classCallCheck(this, Pin);
    this.RADIUS = comp.$props.config.PIN_RADIUS || 5.5;
    this.RADIUS_SQ = Math.pow(this.RADIUS + 7, 2);
    if (utils.is_mobile) {
      this.RADIUS += 2;
      this.RADIUS_SQ *= 2.5;
    }
    this.COLOR_BACK = comp.$props.colors.back;
    this.COLOR_BR = comp.$props.colors.text;
    this.comp = comp;
    this.layout = comp.layout;
    this.mouse = comp.mouse;
    this.name = name;
    this.state = params.state || 'settled';
    this.hidden = params.hidden || false;
    this.mouse.on('mousemove', function (e) {
      return _this.mousemove(e);
    });
    this.mouse.on('mousedown', function (e) {
      return _this.mousedown(e);
    });
    this.mouse.on('mouseup', function (e) {
      return _this.mouseup(e);
    });
    if (comp.state === 'finished') {
      this.state = 'settled';
      this.update_from(comp.$props.settings[name]);
    } else {
      this.update();
    }
    if (this.state !== 'settled') {
      this.comp.$emit('scroll-lock', true);
    }
  }
  return createClass_createClass(Pin, [{
    key: "re_init",
    value: function re_init() {
      this.update_from(this.comp.$props.settings[this.name]);
    }
  }, {
    key: "draw",
    value: function draw(ctx) {
      if (this.hidden) return;
      switch (this.state) {
        case 'tracking':
          break;
        case 'dragging':
          if (!this.moved) this.draw_circle(ctx);
          break;
        case 'settled':
          this.draw_circle(ctx);
          break;
      }
    }
  }, {
    key: "draw_circle",
    value: function draw_circle(ctx) {
      this.layout = this.comp.layout;
      if (this.comp.selected) {
        var r = this.RADIUS,
          lw = 1.5;
      } else {
        var r = this.RADIUS * 0.95,
          lw = 1;
      }
      ctx.lineWidth = lw;
      ctx.strokeStyle = this.COLOR_BR;
      ctx.fillStyle = this.COLOR_BACK;
      ctx.beginPath();
      ctx.arc(this.x = this.layout.t2screen(this.t), this.y = this.layout.$2screen(this.y$), r + 0.5, 0, Math.PI * 2, true);
      ctx.fill();
      ctx.stroke();
    }
  }, {
    key: "update",
    value: function update() {
      this.y$ = this.comp.$props.cursor.y$;
      this.y = this.comp.$props.cursor.y;
      this.t = this.comp.$props.cursor.t;
      this.x = this.comp.$props.cursor.x;

      // Save pin as time in IB mode
      //if (this.layout.ti_map.ib) {
      //    this.t = this.layout.ti_map.i2t(this.t )
      //}

      // Reset the settings attahed to the pin (position)
      this.comp.$emit('change-settings', _defineProperty({}, this.name, [this.t, this.y$]));
    }
  }, {
    key: "update_from",
    value: function update_from(data, emit) {
      if (emit === void 0) {
        emit = false;
      }
      if (!data) return;
      this.layout = this.comp.layout;
      this.y$ = data[1];
      this.y = this.layout.$2screen(this.y$);
      this.t = data[0];
      this.x = this.layout.t2screen(this.t);

      // TODO: Save pin as time in IB mode
      //if (this.layout.ti_map.ib) {
      //    this.t = this.layout.ti_map.i2t(this.t )
      //}

      if (emit) this.comp.$emit('change-settings', _defineProperty({}, this.name, [this.t, this.y$]));
    }
  }, {
    key: "rec_position",
    value: function rec_position() {
      this.t1 = this.t;
      this.y$1 = this.y$;
    }
  }, {
    key: "mousemove",
    value: function mousemove(event) {
      switch (this.state) {
        case 'tracking':
        case 'dragging':
          this.moved = true;
          this.update();
          break;
      }
    }
  }, {
    key: "mousedown",
    value: function mousedown(event, force) {
      if (force === void 0) {
        force = false;
      }
      if (utils.default_prevented(event) && !force) return;
      switch (this.state) {
        case 'tracking':
          this.state = 'settled';
          if (this.on_settled) this.on_settled();
          this.comp.$emit('scroll-lock', false);
          break;
        case 'settled':
          if (this.hidden) return;
          if (this.hover()) {
            this.state = 'dragging';
            this.moved = false;
            this.comp.$emit('scroll-lock', true);
            this.comp.$emit('object-selected');
          }
          break;
      }
      if (this.hover()) {
        event.preventDefault();
      }
    }
  }, {
    key: "mouseup",
    value: function mouseup(event) {
      switch (this.state) {
        case 'dragging':
          this.state = 'settled';
          if (this.on_settled) this.on_settled();
          this.comp.$emit('scroll-lock', false);
          break;
      }
    }
  }, {
    key: "on",
    value: function on(name, handler) {
      switch (name) {
        case 'settled':
          this.on_settled = handler;
          break;
      }
    }
  }, {
    key: "hover",
    value: function hover() {
      var x = this.x;
      var y = this.y;
      return (x - this.mouse.x) * (x - this.mouse.x) + (y - this.mouse.y) * (y - this.mouse.y) < this.RADIUS_SQ;
    }
  }]);
}();

;// CONCATENATED MODULE: ./src/components/primitives/seg.js


// Draws a segment, adds corresponding collision f-n



var Seg = /*#__PURE__*/function () {
  // Overlay ref, canvas ctx
  function Seg(overlay, ctx) {
    classCallCheck_classCallCheck(this, Seg);
    this.ctx = ctx;
    this.comp = overlay;
    this.T = overlay.$props.config.TOOL_COLL;
    if (utils.is_mobile) this.T *= 2;
  }

  // p1[t, $], p2[t, $] (time-price coordinates)
  return createClass_createClass(Seg, [{
    key: "draw",
    value: function draw(p1, p2) {
      var layout = this.comp.$props.layout;
      var x1 = layout.t2screen(p1[0]);
      var y1 = layout.$2screen(p1[1]);
      var x2 = layout.t2screen(p2[0]);
      var y2 = layout.$2screen(p2[1]);
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.comp.collisions.push(this.make([x1, y1], [x2, y2]));
    }

    // Collision function. x, y - mouse coord.
  }, {
    key: "make",
    value: function make(p1, p2) {
      var _this = this;
      return function (x, y) {
        return math.point2seg([x, y], p1, p2) < _this.T;
      };
    }
  }]);
}();

;// CONCATENATED MODULE: ./src/components/primitives/line.js


// Draws a line, adds corresponding collision f-n



var Line = /*#__PURE__*/function () {
  // Overlay ref, canvas ctx
  function Line(overlay, ctx) {
    classCallCheck_classCallCheck(this, Line);
    this.ctx = ctx;
    this.comp = overlay;
    this.T = overlay.$props.config.TOOL_COLL;
    if (utils.is_mobile) this.T *= 2;
  }

  // p1[t, $], p2[t, $] (time-price coordinates)
  return createClass_createClass(Line, [{
    key: "draw",
    value: function draw(p1, p2) {
      var layout = this.comp.$props.layout;
      var x1 = layout.t2screen(p1[0]);
      var y1 = layout.$2screen(p1[1]);
      var x2 = layout.t2screen(p2[0]);
      var y2 = layout.$2screen(p2[1]);
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      var w = layout.width;
      var h = layout.height;
      // TODO: transform k (angle) to screen ratio
      // (this requires a new a2screen function)
      var k = (y2 - y1) / (x2 - x1);
      var s = Math.sign(x2 - x1 || y2 - y1);
      var dx = w * s * 2;
      var dy = w * k * s * 2;
      if (dy === Infinity) {
        dx = 0, dy = h * s;
      }
      this.ctx.moveTo(x2, y2);
      this.ctx.lineTo(x2 + dx, y2 + dy);
      if (!this.ray) {
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x1 - dx, y1 - dy);
      }
      this.comp.collisions.push(this.make([x1, y1], [x2, y2]));
    }

    // Collision function. x, y - mouse coord.
  }, {
    key: "make",
    value: function make(p1, p2) {
      var _this = this;
      var f = this.ray ? math.point2ray.bind(math) : math.point2line.bind(math);
      return function (x, y) {
        return f([x, y], p1, p2) < _this.T;
      };
    }
  }]);
}();

;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js


function _possibleConstructorReturn(self, call) {
  if (call && (typeof_typeof(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }
  return _assertThisInitialized(self);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js
function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js
function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };
  return _setPrototypeOf(o, p);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/inherits.js

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  Object.defineProperty(subClass, "prototype", {
    writable: false
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}
;// CONCATENATED MODULE: ./src/components/primitives/ray.js





function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
// Draws a ray, adds corresponding collision f-n


var Ray = /*#__PURE__*/function (_Line) {
  function Ray(overlay, ctx) {
    var _this;
    classCallCheck_classCallCheck(this, Ray);
    _this = _callSuper(this, Ray, [overlay, ctx]);
    _this.ray = true;
    return _this;
  }
  _inherits(Ray, _Line);
  return createClass_createClass(Ray);
}(Line);

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/LineTool.vue?vue&type=script&lang=js
// Line drawing tool
// TODO: make an angle-snap when "Shift" is pressed








/* harmony default export */ const LineToolvue_type_script_lang_js = ({
  name: 'LineTool',
  mixins: [overlay, tool],
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.1.0'
      };
    },
    tool: function tool() {
      return {
        // Descriptor for the tool
        group: 'Lines',
        icon: icons_namespaceObject["segment.png"],
        type: 'Segment',
        hint: 'This hint will be shown on hover',
        data: [],
        // Default data
        settings: {},
        // Default settings
        // Modifications
        mods: {
          'Extended': {
            // Rewrites the default setting fields
            settings: {
              extended: true
            },
            icon: icons_namespaceObject["extended.png"]
          },
          'Ray': {
            // Rewrites the default setting fields
            settings: {
              ray: true
            },
            icon: icons_namespaceObject["ray.png"]
          }
        }
      };
    },
    // Called after overlay mounted
    init: function init() {
      var _this = this;
      // First pin is settled at the mouse position
      this.pins.push(new Pin(this, 'p1'));
      // Second one is following mouse until it clicks
      this.pins.push(new Pin(this, 'p2', {
        state: 'tracking'
      }));
      this.pins[1].on('settled', function () {
        // Call when current tool drawing is finished
        // (Optionally) reset the mode back to 'Cursor'
        _this.set_state('finished');
        _this.$emit('drawing-mode-off');
      });
    },
    draw: function draw(ctx) {
      if (!this.p1 || !this.p2) return;
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color;
      ctx.beginPath();
      if (this.sett.ray) {
        new Ray(this, ctx).draw(this.p1, this.p2);
      } else if (this.sett.extended) {
        new Line(this, ctx).draw(this.p1, this.p2);
      } else {
        new Seg(this, ctx).draw(this.p1, this.p2);
      }
      ctx.stroke();
      this.render_pins(ctx);
    },
    use_for: function use_for() {
      return ['LineTool'];
    },
    data_colors: function data_colors() {
      return [this.color];
    }
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    p1: function p1() {
      return this.$props.settings.p1;
    },
    p2: function p2() {
      return this.$props.settings.p2;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 0.9;
    },
    color: function color() {
      return this.sett.color || '#42b28a';
    }
  },
  data: function data() {
    return {};
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/LineTool.vue?vue&type=script&lang=js
 /* harmony default export */ const overlays_LineToolvue_type_script_lang_js = (LineToolvue_type_script_lang_js); 
;// CONCATENATED MODULE: ./src/components/overlays/LineTool.vue
var LineTool_render, LineTool_staticRenderFns
;



/* normalize component */
;
var LineTool_component = normalizeComponent(
  overlays_LineToolvue_type_script_lang_js,
  LineTool_render,
  LineTool_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const LineTool = (LineTool_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/RangeTool.vue?vue&type=script&lang=js

// Price/Time measurment tool






/* harmony default export */ const RangeToolvue_type_script_lang_js = ({
  name: 'RangeTool',
  mixins: [overlay, tool],
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '2.0.1'
      };
    },
    tool: function tool() {
      return {
        // Descriptor for the tool
        group: 'Measurements',
        icon: icons_namespaceObject["price_range.png"],
        type: 'Price',
        hint: 'Price Range',
        data: [],
        // Default data
        settings: {},
        // Default settings
        mods: {
          'Time': {
            // Rewrites the default setting fields
            icon: icons_namespaceObject["time_range.png"],
            settings: {
              price: false,
              time: true
            }
          },
          'PriceTime': {
            // Rewrites the default setting fields
            icon: icons_namespaceObject["price_time.png"],
            settings: {
              price: true,
              time: true
            }
          },
          'ShiftMode': {
            // Rewrites the default setting fields
            settings: {
              price: true,
              time: true,
              shiftMode: true
            },
            hidden: true
          }
        }
      };
    },
    // Called after overlay mounted
    init: function init() {
      var _this = this;
      // First pin is settled at the mouse position
      this.pins.push(new Pin(this, 'p1', {
        hidden: this.shift
      }));
      // Second one is following mouse until it clicks
      this.pins.push(new Pin(this, 'p2', {
        state: 'tracking',
        hidden: this.shift
      }));
      this.pins[1].on('settled', function () {
        // Call when current tool drawing is finished
        // (Optionally) reset the mode back to 'Cursor'
        _this.set_state('finished');
        _this.$emit('drawing-mode-off');
        // Deselect the tool in shiftMode
        if (_this.shift) _this._$emit('custom-event', {
          event: 'object-selected',
          args: []
        });
      });
    },
    draw: function draw(ctx) {
      if (!this.p1 || !this.p2) return;
      var dir = Math.sign(this.p2[1] - this.p1[1]);
      var layout = this.$props.layout;
      var xm = layout.t2screen((this.p1[0] + this.p2[0]) * 0.5);
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color;

      // Background
      ctx.fillStyle = this.back_color;
      var x1 = layout.t2screen(this.p1[0]);
      var y1 = layout.$2screen(this.p1[1]);
      var x2 = layout.t2screen(this.p2[0]);
      var y2 = layout.$2screen(this.p2[1]);
      ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
      if (this.price) this.vertical(ctx, x1, y1, x2, y2, xm);
      if (this.time) this.horizontal(ctx, x1, y1, x2, y2, xm);
      this.draw_value(ctx, dir, xm, y2);
      this.render_pins(ctx);
    },
    vertical: function vertical(ctx, x1, y1, x2, y2, xm) {
      var layout = this.$props.layout;
      var dir = Math.sign(this.p2[1] - this.p1[1]);
      ctx.beginPath();
      if (!this.shift) {
        // Top
        new Seg(this, ctx).draw([this.p1[0], this.p2[1]], [this.p2[0], this.p2[1]]);
        // Bottom
        new Seg(this, ctx).draw([this.p1[0], this.p1[1]], [this.p2[0], this.p1[1]]);
      }

      // Vertical Arrow
      ctx.moveTo(xm - 4, y2 + 5 * dir);
      ctx.lineTo(xm, y2);
      ctx.lineTo(xm + 4, y2 + 5 * dir);
      ctx.stroke();

      // Vertical Line
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      new Seg(this, ctx).draw([(this.p1[0] + this.p2[0]) * 0.5, this.p2[1]], [(this.p1[0] + this.p2[0]) * 0.5, this.p1[1]]);
      ctx.stroke();
      ctx.setLineDash([]);
    },
    horizontal: function horizontal(ctx, x1, y1, x2, y2, xm) {
      var layout = this.$props.layout;
      var xdir = Math.sign(this.p2[0] - this.p1[0]);
      var ym = (layout.$2screen(this.p1[1]) + layout.$2screen(this.p2[1])) / 2;
      ctx.beginPath();
      if (!this.shift) {
        // Left
        new Seg(this, ctx).draw([this.p1[0], this.p1[1]], [this.p1[0], this.p2[1]]);
        // Right
        new Seg(this, ctx).draw([this.p2[0], this.p1[1]], [this.p2[0], this.p2[1]]);
      }

      // Horizontal Arrow
      ctx.moveTo(x2 - 5 * xdir, ym - 4);
      ctx.lineTo(x2, ym);
      ctx.lineTo(x2 - 5 * xdir, ym + 4);
      ctx.stroke();

      // Horizontal Line
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.moveTo(x1, ym);
      ctx.lineTo(x2, ym);
      ctx.stroke();
      ctx.setLineDash([]);
    },
    // WTF? I know dude, a lot of shitty code here
    draw_value: function draw_value(ctx, dir, xm, y) {
      var _this2 = this;
      ctx.font = this.new_font;
      // Price delta (anf percent)
      var d$ = (this.p2[1] - this.p1[1]).toFixed(this.prec);
      var p = (100 * (this.p2[1] / this.p1[1] - 1)).toFixed(this.prec);
      // Map interval to the actual tf (in ms)
      var f = function f(t) {
        return _this2.layout.ti_map.smth2t(t);
      };
      var dt = f(this.p2[0]) - f(this.p1[0]);
      var tf = this.layout.ti_map.tf;
      // Bars count (through the candle index)
      var f2 = function f2(t) {
        var c = _this2.layout.c_magnet(t);
        var cn = _this2.layout.candles || _this2.layout.master_grid.candles;
        return cn.indexOf(c);
      };
      // Bars count (and handling the negative values)
      var b = f2(this.p2[0]) - f2(this.p1[0]);
      // Format time delta
      // Format time delta
      var dtstr = this.t2str(dt);
      var text = [];
      if (this.price) text.push("".concat(d$, "  (").concat(p, "%)"));
      if (this.time) text.push("".concat(b, " bars, ").concat(dtstr));
      text = text.join('\n');
      // "Multiple" fillText
      var lines = text.split('\n');
      var w = Math.max.apply(Math, _toConsumableArray(lines.map(function (x) {
        return ctx.measureText(x).width + 20;
      })).concat([100]));
      var n = lines.length;
      var h = 20 * n;
      ctx.fillStyle = this.value_back;
      ctx.fillRect(xm - w * 0.5, y - (10 + h) * dir, w, h * dir);
      ctx.fillStyle = this.value_color;
      ctx.textAlign = 'center';
      lines.forEach(function (l, i) {
        ctx.fillText(l, xm, y + (dir > 0 ? 20 * i - 20 * n + 5 : 20 * i + 25));
      });
    },
    // Formats time from ms to `1D 12h` for example
    t2str: function t2str(t) {
      var sign = Math.sign(t);
      var abs = Math.abs(t);
      var tfs = [[1000, 's', 60], [60000, 'm', 60], [3600000, 'h', 24], [86400000, 'D', 7], [604800000, 'W', 4], [2592000000, 'M', 12], [31536000000, 'Y', Infinity], [Infinity, 'Eternity', Infinity]];
      for (var i = 0; i < tfs.length; i++) {
        tfs[i][0] = Math.floor(abs / tfs[i][0]);
        if (tfs[i][0] === 0) {
          var p1 = tfs[i - 1];
          var p2 = tfs[i - 2];
          var txt = sign < 0 ? '-' : '';
          if (p1) {
            txt += p1.slice(0, 2).join('');
          }
          var n2 = p2 ? p2[0] - p1[0] * p2[2] : 0;
          if (p2 && n2) {
            txt += ' ';
            txt += "".concat(n2).concat(p2[1]);
          }
          return txt;
        }
      }
    },
    use_for: function use_for() {
      return ['RangeTool'];
    },
    data_colors: function data_colors() {
      return [this.color];
    }
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    p1: function p1() {
      return this.$props.settings.p1;
    },
    p2: function p2() {
      return this.$props.settings.p2;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 0.9;
    },
    color: function color() {
      return this.sett.color || this.$props.colors.cross;
    },
    back_color: function back_color() {
      return this.sett.backColor || '#9b9ba316';
    },
    value_back: function value_back() {
      return this.sett.valueBack || '#9b9ba316';
    },
    value_color: function value_color() {
      return this.sett.valueColor || this.$props.colors.text;
    },
    prec: function prec() {
      return this.sett.precision || 2;
    },
    new_font: function new_font() {
      return '12px ' + this.$props.font.split('px').pop();
    },
    price: function price() {
      return 'price' in this.sett ? this.sett.price : true;
    },
    time: function time() {
      return 'time' in this.sett ? this.sett.time : false;
    },
    shift: function shift() {
      return this.sett.shiftMode;
    }
  },
  data: function data() {
    return {};
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/RangeTool.vue?vue&type=script&lang=js
 /* harmony default export */ const overlays_RangeToolvue_type_script_lang_js = (RangeToolvue_type_script_lang_js); 
;// CONCATENATED MODULE: ./src/components/overlays/RangeTool.vue
var RangeTool_render, RangeTool_staticRenderFns
;



/* normalize component */
;
var RangeTool_component = normalizeComponent(
  overlays_RangeToolvue_type_script_lang_js,
  RangeTool_render,
  RangeTool_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const RangeTool = (RangeTool_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Grid.vue?vue&type=script&lang=js
function Gridvue_type_script_lang_js_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = Gridvue_type_script_lang_js_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function Gridvue_type_script_lang_js_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return Gridvue_type_script_lang_js_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return Gridvue_type_script_lang_js_arrayLikeToArray(o, minLen); }
function Gridvue_type_script_lang_js_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
// Sets up all layers/overlays for the grid with 'grid_id'


















/* harmony default export */ const Gridvue_type_script_lang_js = ({
  name: 'Grid',
  props: ['sub', 'layout', 'range', 'interval', 'cursor', 'colors', 'overlays', 'width', 'height', 'data', 'grid_id', 'y_transform', 'font', 'tv_id', 'config', 'meta', 'shaders'],
  mixins: [canvas, uxlist],
  components: {
    Crosshair: components_Crosshair,
    KeyboardListener: KeyboardListener
  },
  created: function created() {
    var _this = this;
    // List of all possible overlays (builtin + custom)
    this._list = [Spline, Splines, Range, Trades, Channel, Segment, Candles, Volume, Splitters, LineTool, RangeTool].concat(this.$props.overlays);
    this._registry = {};

    // We need to know which components we will use.
    // Custom overlay components overwrite built-ins:
    var tools = [];
    this._list.forEach(function (x, i) {
      var use_for = x.methods.use_for();
      if (x.methods.tool) tools.push({
        use_for: use_for,
        info: x.methods.tool()
      });
      use_for.forEach(function (indicator) {
        _this._registry[indicator] = i;
      });
    });
    this.$emit('custom-event', {
      event: 'register-tools',
      args: tools
    });
    this.$on('custom-event', function (e) {
      return _this.on_ux_event(e, 'grid');
    });
  },
  beforeDestroy: function beforeDestroy() {
    if (this.renderer) this.renderer.destroy();
  },
  mounted: function mounted() {
    var _this2 = this;
    var el = this.$refs['canvas'];
    this.renderer = new Grid(el, this);
    this.setup();
    this.$nextTick(function () {
      return _this2.redraw();
    });
  },
  render: function render(h) {
    var id = this.$props.grid_id;
    var layout = this.$props.layout.grids[id];
    return this.create_canvas(h, "grid-".concat(id), {
      position: {
        x: 0,
        y: layout.offset || 0
      },
      attrs: {
        width: layout.width,
        height: layout.height,
        overflow: 'hidden'
      },
      style: {
        backgroundColor: this.$props.colors.back
      },
      hs: [h(components_Crosshair, {
        props: this.common_props(),
        on: this.layer_events
      }), h(KeyboardListener, {
        on: this.keyboard_events
      }), h(UxLayer, {
        props: {
          id: id,
          tv_id: this.$props.tv_id,
          uxs: this.uxs,
          colors: this.$props.colors,
          config: this.$props.config,
          updater: Math.random()
        },
        on: {
          'custom-event': this.emit_ux_event
        }
      })].concat(this.get_overlays(h))
    });
  },
  methods: {
    new_layer: function new_layer(layer) {
      var _this3 = this;
      this.$nextTick(function () {
        return _this3.renderer.new_layer(layer);
      });
    },
    del_layer: function del_layer(layer) {
      var _this4 = this;
      this.$nextTick(function () {
        return _this4.renderer.del_layer(layer);
      });
      var grid_id = this.$props.grid_id;
      this.$emit('custom-event', {
        event: 'remove-shaders',
        args: [grid_id, layer]
      });
      // TODO: close all interfaces
      this.$emit('custom-event', {
        event: 'remove-layer-meta',
        args: [grid_id, layer]
      });
      this.remove_all_ux(layer);
    },
    get_overlays: function get_overlays(h) {
      var _this5 = this;
      // Distributes overlay data & settings according
      // to this._registry; returns compo list
      var comp_list = [],
        count = {};
      var _iterator = Gridvue_type_script_lang_js_createForOfIteratorHelper(this.$props.data),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var d = _step.value;
          var comp = this._list[this._registry[d.type]];
          if (comp) {
            if (comp.methods.calc) {
              comp = this.inject_renderer(comp);
            }
            comp_list.push({
              cls: comp,
              type: d.type,
              data: d.data,
              settings: d.settings,
              i0: d.i0,
              tf: d.tf,
              last: d.last
            });
            count[d.type] = 0;
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return comp_list.map(function (x, i) {
        return h(x.cls, {
          on: _this5.layer_events,
          attrs: Object.assign(_this5.common_props(), {
            id: "".concat(x.type, "_").concat(count[x.type]++),
            type: x.type,
            data: x.data,
            settings: x.settings,
            i0: x.i0,
            tf: x.tf,
            num: i,
            grid_id: _this5.$props.grid_id,
            meta: _this5.$props.meta,
            last: x.last
          })
        });
      });
    },
    common_props: function common_props() {
      return {
        cursor: this.$props.cursor,
        colors: this.$props.colors,
        layout: this.$props.layout.grids[this.$props.grid_id],
        interval: this.$props.interval,
        sub: this.$props.sub,
        font: this.$props.font,
        config: this.$props.config
      };
    },
    emit_ux_event: function emit_ux_event(e) {
      var e_pass = this.on_ux_event(e, 'grid');
      if (e_pass) this.$emit('custom-event', e);
    },
    // Replace the current comp with 'renderer'
    inject_renderer: function inject_renderer(comp) {
      var src = comp.methods.calc();
      if (!src.conf || !src.conf.renderer || comp.__renderer__) {
        return comp;
      }

      // Search for an overlay with the target 'name'
      var f = this._list.find(function (x) {
        return x.name === src.conf.renderer;
      });
      if (!f) return comp;
      comp.mixins.push(f);
      comp.__renderer__ = src.conf.renderer;
      return comp;
    }
  },
  computed: {
    is_active: function is_active() {
      return this.$props.cursor.t !== undefined && this.$props.cursor.grid_id === this.$props.grid_id;
    }
  },
  watch: {
    range: {
      handler: function handler() {
        var _this6 = this;
        // TODO: Left-side render lag fix:
        // Overlay data is updated one tick later than
        // the main sub. Fast fix is to delay redraw()
        // call. It will be a solution until a better
        // one comes by.
        this.$nextTick(function () {
          return _this6.redraw();
        });
      },
      deep: true
    },
    cursor: {
      handler: function handler() {
        if (!this.$props.cursor.locked) this.redraw();
      },
      deep: true
    },
    overlays: {
      // Track changes in calc() functions
      handler: function handler(ovs) {
        var _iterator2 = Gridvue_type_script_lang_js_createForOfIteratorHelper(ovs),
          _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var ov = _step2.value;
            var _iterator3 = Gridvue_type_script_lang_js_createForOfIteratorHelper(this.$children),
              _step3;
            try {
              for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                var comp = _step3.value;
                if (typeof comp.id !== 'string') continue;
                var tuple = comp.id.split('_');
                tuple.pop();
                if (tuple.join('_') === ov.name) {
                  comp.calc = ov.methods.calc;
                  if (!comp.calc) continue;
                  var calc = comp.calc.toString();
                  if (calc !== ov.__prevscript__) {
                    comp.exec_script();
                  }
                  ov.__prevscript__ = calc;
                }
              }
            } catch (err) {
              _iterator3.e(err);
            } finally {
              _iterator3.f();
            }
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      },
      deep: true
    },
    // Redraw on the shader list change
    shaders: function shaders(n, p) {
      this.redraw();
    }
  },
  data: function data() {
    var _this7 = this;
    return {
      layer_events: {
        'new-grid-layer': this.new_layer,
        'delete-grid-layer': this.del_layer,
        'show-grid-layer': function showGridLayer(d) {
          _this7.renderer.show_hide_layer(d);
          _this7.redraw();
        },
        'redraw-grid': this.redraw,
        'layer-meta-props': function layerMetaProps(d) {
          return _this7.$emit('layer-meta-props', d);
        },
        'custom-event': function customEvent(d) {
          return _this7.$emit('custom-event', d);
        }
      },
      keyboard_events: {
        'register-kb-listener': function registerKbListener(event) {
          _this7.$emit('register-kb-listener', event);
        },
        'remove-kb-listener': function removeKbListener(event) {
          _this7.$emit('remove-kb-listener', event);
        },
        'keyup': function keyup(event) {
          if (!_this7.is_active) return;
          _this7.renderer.propagate('keyup', event);
        },
        'keydown': function keydown(event) {
          if (!_this7.is_active) return; // TODO: is this neeeded?
          _this7.renderer.propagate('keydown', event);
        },
        'keypress': function keypress(event) {
          if (!_this7.is_active) return;
          _this7.renderer.propagate('keypress', event);
        }
      }
    };
  }
});
;// CONCATENATED MODULE: ./src/components/Grid.vue?vue&type=script&lang=js
 /* harmony default export */ const components_Gridvue_type_script_lang_js = (Gridvue_type_script_lang_js); 
;// CONCATENATED MODULE: ./src/components/Grid.vue
var Grid_render, Grid_staticRenderFns
;



/* normalize component */
;
var Grid_component = normalizeComponent(
  components_Gridvue_type_script_lang_js,
  Grid_render,
  Grid_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const components_Grid = (Grid_component.exports);
;// CONCATENATED MODULE: ./src/components/js/sidebar.js


function sidebar_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = sidebar_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function sidebar_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return sidebar_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return sidebar_arrayLikeToArray(o, minLen); }
function sidebar_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }



var PANHEIGHT;
var Sidebar = /*#__PURE__*/function () {
  function Sidebar(canvas, comp, side) {
    if (side === void 0) {
      side = 'right';
    }
    classCallCheck_classCallCheck(this, Sidebar);
    PANHEIGHT = comp.config.PANHEIGHT;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.comp = comp;
    this.$p = comp.$props;
    this.data = this.$p.sub;
    this.range = this.$p.range;
    this.id = this.$p.grid_id;
    this.layout = this.$p.layout.grids[this.id];
    this.side = side;
    this.listeners();
  }
  return createClass_createClass(Sidebar, [{
    key: "listeners",
    value: function listeners() {
      var _this = this;
      var mc = this.mc = new hammer.Manager(this.canvas);
      mc.add(new hammer.Pan({
        direction: hammer.DIRECTION_VERTICAL,
        threshold: 0
      }));
      mc.add(new hammer.Tap({
        event: 'doubletap',
        taps: 2,
        posThreshold: 50
      }));
      mc.on('panstart', function (event) {
        if (_this.$p.y_transform) {
          _this.zoom = _this.$p.y_transform.zoom;
        } else {
          _this.zoom = 1.0;
        }
        _this.y_range = [_this.layout.$_hi, _this.layout.$_lo];
        _this.drug = {
          y: event.center.y,
          z: _this.zoom,
          mid: math.log_mid(_this.y_range, _this.layout.height),
          A: _this.layout.A,
          B: _this.layout.B
        };
      });
      mc.on('panmove', function (event) {
        if (_this.drug) {
          _this.zoom = _this.calc_zoom(event);
          _this.comp.$emit('sidebar-transform', {
            grid_id: _this.id,
            zoom: _this.zoom,
            auto: false,
            range: _this.calc_range(),
            drugging: true
          });
          _this.update();
        }
      });
      mc.on('panend', function () {
        _this.drug = null;
        _this.comp.$emit('sidebar-transform', {
          grid_id: _this.id,
          drugging: false
        });
      });
      mc.on('doubletap', function () {
        _this.comp.$emit('sidebar-transform', {
          grid_id: _this.id,
          zoom: 1.0,
          auto: true
        });
        _this.zoom = 1.0;
        _this.update();
      });

      // TODO: Do later for mobile version
    }
  }, {
    key: "update",
    value: function update() {
      // Update reference to the grid
      this.layout = this.$p.layout.grids[this.id];
      var points = this.layout.ys;
      var x,
        y,
        w,
        h,
        side = this.side;
      var sb = this.layout.sb;

      //this.ctx.fillStyle = this.$p.colors.back
      this.ctx.font = this.$p.font;
      switch (side) {
        case 'left':
          x = 0;
          y = 0;
          w = Math.floor(sb);
          h = this.layout.height;

          //this.ctx.fillRect(x, y, w, h)
          this.ctx.clearRect(x, y, w, h);
          this.ctx.strokeStyle = this.$p.colors.scale;
          this.ctx.beginPath();
          this.ctx.moveTo(x + 0.5, 0);
          this.ctx.lineTo(x + 0.5, h);
          this.ctx.stroke();
          break;
        case 'right':
          x = 0;
          y = 0;
          w = Math.floor(sb);
          h = this.layout.height;
          //this.ctx.fillRect(x, y, w, h)
          this.ctx.clearRect(x, y, w, h);
          this.ctx.strokeStyle = this.$p.colors.scale;
          this.ctx.beginPath();
          this.ctx.moveTo(x + 0.5, 0);
          this.ctx.lineTo(x + 0.5, h);
          this.ctx.stroke();
          break;
      }
      this.ctx.fillStyle = this.$p.colors.text;
      this.ctx.beginPath();
      var _iterator = sidebar_createForOfIteratorHelper(points),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var p = _step.value;
          if (p[0] > this.layout.height) continue;
          var x1 = side === 'left' ? w - 0.5 : x - 0.5;
          var x2 = side === 'left' ? x1 - 4.5 : x1 + 4.5;
          this.ctx.moveTo(x1, p[0] - 0.5);
          this.ctx.lineTo(x2, p[0] - 0.5);
          var offst = side === 'left' ? -10 : 10;
          this.ctx.textAlign = side === 'left' ? 'end' : 'start';
          var d = this.layout.prec;
          this.ctx.fillText(p[1].toFixed(d), x1 + offst, p[0] + 4);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      this.ctx.stroke();
      if (this.$p.grid_id) this.upper_border();
      this.apply_shaders();
      if (this.$p.cursor.y && this.$p.cursor.y$) this.panel();
    }
  }, {
    key: "apply_shaders",
    value: function apply_shaders() {
      var layout = this.$p.layout.grids[this.id];
      var props = {
        layout: layout,
        cursor: this.$p.cursor
      };
      var _iterator2 = sidebar_createForOfIteratorHelper(this.$p.shaders),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var s = _step2.value;
          this.ctx.save();
          s.draw(this.ctx, props);
          this.ctx.restore();
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }, {
    key: "upper_border",
    value: function upper_border() {
      this.ctx.strokeStyle = this.$p.colors.scale;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0.5);
      this.ctx.lineTo(this.layout.width, 0.5);
      this.ctx.stroke();
    }

    // A gray bar behind the current price
  }, {
    key: "panel",
    value: function panel() {
      if (this.$p.cursor.grid_id !== this.layout.id) {
        return;
      }
      var lbl = this.$p.cursor.y$.toFixed(this.layout.prec);
      this.ctx.fillStyle = this.$p.colors.panel;
      var panwidth = this.layout.sb + 1;
      var x = -0.5;
      var y = this.$p.cursor.y - PANHEIGHT * 0.5 - 0.5;
      var a = 7;
      this.ctx.fillRect(x - 0.5, y, panwidth, PANHEIGHT);
      this.ctx.fillStyle = this.$p.colors.textHL;
      this.ctx.textAlign = 'left';
      this.ctx.fillText(lbl, a, y + 15);
    }
  }, {
    key: "calc_zoom",
    value: function calc_zoom(event) {
      var d = this.drug.y - event.center.y;
      var speed = d > 0 ? 3 : 1;
      var k = 1 + speed * d / this.layout.height;
      return utils.clamp(this.drug.z * k, 0.005, 100);
    }

    // Not the best place to calculate y-range but
    // this is the simplest solution I found up to
    // date
  }, {
    key: "calc_range",
    value: function calc_range(diff1, diff2) {
      var _this2 = this;
      if (diff1 === void 0) {
        diff1 = 1;
      }
      if (diff2 === void 0) {
        diff2 = 1;
      }
      var z = this.zoom / this.drug.z;
      var zk = (1 / z - 1) / 2;
      var range = this.y_range.slice();
      var delta = range[0] - range[1];
      if (!this.layout.grid.logScale) {
        range[0] = range[0] + delta * zk * diff1;
        range[1] = range[1] - delta * zk * diff2;
      } else {
        var px_mid = this.layout.height / 2;
        var new_hi = px_mid - px_mid * (1 / z);
        var new_lo = px_mid + px_mid * (1 / z);

        // Use old mapping to get a new range
        var f = function f(y) {
          return math.exp((y - _this2.drug.B) / _this2.drug.A);
        };
        var copy = range.slice();
        range[0] = f(new_hi);
        range[1] = f(new_lo);
      }
      return range;
    }
  }, {
    key: "rezoom_range",
    value: function rezoom_range(delta, diff1, diff2) {
      if (!this.$p.y_transform || this.$p.y_transform.auto) return;
      this.zoom = 1.0;
      // TODO: further work (improve scaling ratio)
      if (delta < 0) delta /= 3.75; // Btw, idk why 3.75, but it works
      delta *= 0.25;
      this.y_range = [this.layout.$_hi, this.layout.$_lo];
      this.drug = {
        y: 0,
        z: this.zoom,
        mid: math.log_mid(this.y_range, this.layout.height),
        A: this.layout.A,
        B: this.layout.B
      };
      this.zoom = this.calc_zoom({
        center: {
          y: delta * this.layout.height
        }
      });
      this.comp.$emit('sidebar-transform', {
        grid_id: this.id,
        zoom: this.zoom,
        auto: false,
        range: this.calc_range(diff1, diff2),
        drugging: true
      });
      this.drug = null;
      this.comp.$emit('sidebar-transform', {
        grid_id: this.id,
        drugging: false
      });
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (this.mc) this.mc.destroy();
    }
  }, {
    key: "mousemove",
    value: function mousemove() {}
  }, {
    key: "mouseout",
    value: function mouseout() {}
  }, {
    key: "mouseup",
    value: function mouseup() {}
  }, {
    key: "mousedown",
    value: function mousedown() {}
  }]);
}();

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Sidebar.vue?vue&type=script&lang=js
// The side bar (yep, that thing with a bunch of $$$)



/* harmony default export */ const Sidebarvue_type_script_lang_js = ({
  name: 'Sidebar',
  props: ['sub', 'layout', 'range', 'interval', 'cursor', 'colors', 'font', 'width', 'height', 'grid_id', 'rerender', 'y_transform', 'tv_id', 'config', 'shaders'],
  mixins: [canvas],
  mounted: function mounted() {
    var el = this.$refs['canvas'];
    this.renderer = new Sidebar(el, this);
    this.setup();
    this.redraw();
  },
  render: function render(h) {
    var id = this.$props.grid_id;
    var layout = this.$props.layout.grids[id];
    return this.create_canvas(h, "sidebar-".concat(id), {
      position: {
        x: layout.width,
        y: layout.offset || 0
      },
      attrs: {
        rerender: this.$props.rerender,
        width: this.$props.width,
        height: layout.height
      },
      style: {
        backgroundColor: this.$props.colors.back
      }
    });
  },
  watch: {
    range: {
      handler: function handler() {
        this.redraw();
      },
      deep: true
    },
    cursor: {
      handler: function handler() {
        this.redraw();
      },
      deep: true
    },
    rerender: function rerender() {
      var _this = this;
      this.$nextTick(function () {
        return _this.redraw();
      });
    }
  },
  beforeDestroy: function beforeDestroy() {
    if (this.renderer) this.renderer.destroy();
  }
});
;// CONCATENATED MODULE: ./src/components/Sidebar.vue?vue&type=script&lang=js
 /* harmony default export */ const components_Sidebarvue_type_script_lang_js = (Sidebarvue_type_script_lang_js); 
;// CONCATENATED MODULE: ./src/components/Sidebar.vue
var Sidebar_render, Sidebar_staticRenderFns
;



/* normalize component */
;
var Sidebar_component = normalizeComponent(
  components_Sidebarvue_type_script_lang_js,
  Sidebar_render,
  Sidebar_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const components_Sidebar = (Sidebar_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Legend.vue?vue&type=template&id=92b0463a
var Legendvue_type_template_id_92b0463a_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("div", {
    staticClass: "trading-vue-legend",
    style: _vm.calc_style
  }, [_vm.grid_id === 0 ? _c("div", {
    staticClass: "trading-vue-ohlcv",
    style: {
      "max-width": _vm.common.width + "px"
    }
  }, [_c("span", {
    staticClass: "t-vue-title",
    style: {
      color: _vm.common.colors.title
    }
  }, [_vm._v("\n      " + _vm._s(_vm.common.title_txt) + "\n    ")]), _vm._v(" "), _vm.show_values ? _c("span", [_vm._v("\n      O"), _c("span", {
    staticClass: "t-vue-lspan"
  }, [_vm._v(_vm._s(_vm.ohlcv[0]))]), _vm._v(" H"), _c("span", {
    staticClass: "t-vue-lspan"
  }, [_vm._v(_vm._s(_vm.ohlcv[1]))]), _vm._v("\n      L"), _c("span", {
    staticClass: "t-vue-lspan"
  }, [_vm._v(_vm._s(_vm.ohlcv[2]))]), _vm._v(" C"), _c("span", {
    staticClass: "t-vue-lspan"
  }, [_vm._v(_vm._s(_vm.ohlcv[3]))]), _vm._v("\n      V"), _c("span", {
    staticClass: "t-vue-lspan"
  }, [_vm._v(_vm._s(_vm.ohlcv[4]))])]) : _vm._e(), _vm._v(" "), !_vm.show_values ? _c("span", {
    staticClass: "t-vue-lspan",
    style: {
      color: _vm.common.colors.text
    }
  }, [_vm._v("\n      " + _vm._s((_vm.common.meta.last || [])[4]) + "\n    ")]) : _vm._e()]) : _vm._e(), _vm._v(" "), _vm._l(_vm.indicators, function (ind, i) {
    return _c("div", {
      key: "indicator-toolbar" + i,
      staticClass: "t-vue-ind"
    }, [_c("span", {
      staticClass: "t-vue-iname"
    }, [_vm._v(_vm._s(ind.name))]), _vm._v(" "), _c("button-group", {
      attrs: {
        buttons: _vm.common.buttons,
        config: _vm.common.config,
        ov_id: ind.id,
        grid_id: _vm.grid_id,
        index: ind.index,
        tv_id: _vm.common.tv_id,
        display: ind.v
      },
      on: {
        "legend-button-click": _vm.button_click
      }
    }), _vm._v(" "), ind.v && _vm.show_values ? _c("span", {
      staticClass: "t-vue-ivalues"
    }, _vm._l(ind.values, function (v, iv) {
      return _c("span", {
        key: "legend-span" + iv,
        staticClass: "t-vue-lspan t-vue-ivalue",
        style: {
          color: v.color
        }
      }, [_vm._v("\n        " + _vm._s(v.value) + "\n      ")]);
    }), 0) : _vm._e(), _vm._v(" "), ind.unk ? _c("span", {
      staticClass: "t-vue-unknown"
    }, [_vm._v(" (Unknown type) ")]) : _vm._e(), _vm._v(" "), _c("transition", {
      attrs: {
        name: "tvjs-appear"
      }
    }, [ind.loading ? _c("spinner", {
      attrs: {
        colors: _vm.common.colors
      }
    }) : _vm._e()], 1)], 1);
  })], 2);
};
var Legendvue_type_template_id_92b0463a_staticRenderFns = [];
Legendvue_type_template_id_92b0463a_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/Legend.vue?vue&type=template&id=92b0463a

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ButtonGroup.vue?vue&type=template&id=aee8964e
var ButtonGroupvue_type_template_id_aee8964e_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("span", {
    staticClass: "t-vue-lbtn-grp"
  }, _vm._l(_vm.buttons, function (b, i) {
    return _c("legend-button", {
      key: i,
      attrs: {
        id: b.name || b,
        tv_id: _vm.tv_id,
        ov_id: _vm.ov_id,
        grid_id: _vm.grid_id,
        index: _vm.index,
        display: _vm.display,
        icon: b.icon,
        config: _vm.config
      },
      on: {
        "legend-button-click": _vm.button_click
      }
    });
  }), 1);
};
var ButtonGroupvue_type_template_id_aee8964e_staticRenderFns = [];
ButtonGroupvue_type_template_id_aee8964e_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/ButtonGroup.vue?vue&type=template&id=aee8964e

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/LegendButton.vue?vue&type=template&id=7271720b
var LegendButtonvue_type_template_id_7271720b_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("img", {
    staticClass: "t-vue-lbtn",
    style: {
      width: _vm.config.L_BTN_SIZE + "px",
      height: _vm.config.L_BTN_SIZE + "px",
      margin: _vm.config.L_BTN_MARGIN
    },
    attrs: {
      src: _vm.base64,
      id: _vm.uuid
    },
    on: {
      click: _vm.onclick
    }
  });
};
var LegendButtonvue_type_template_id_7271720b_staticRenderFns = [];
LegendButtonvue_type_template_id_7271720b_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/LegendButton.vue?vue&type=template&id=7271720b

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/LegendButton.vue?vue&type=script&lang=js

/* harmony default export */ const LegendButtonvue_type_script_lang_js = ({
  name: 'LegendButton',
  props: ['id', 'tv_id', 'grid_id', 'ov_id', 'index', 'display', 'icon', 'config'],
  mounted: function mounted() {},
  computed: {
    base64: function base64() {
      return this.icon || icons_namespaceObject[this.file_name];
    },
    file_name: function file_name() {
      var id = this.$props.id;
      if (this.$props.id === 'display') {
        id = this.$props.display ? 'display_on' : 'display_off';
      }
      return id + '.png';
    },
    uuid: function uuid() {
      var tv = this.$props.tv_id;
      var gr = this.$props.grid_id;
      var ov = this.$props.ov_id;
      return "".concat(tv, "-btn-g").concat(gr, "-").concat(ov);
    },
    data_type: function data_type() {
      return this.$props.grid_id === 0 ? "onchart" : "offchart";
    },
    data_index: function data_index() {
      return this.$props.index;
    }
  },
  methods: {
    onclick: function onclick() {
      this.$emit('legend-button-click', {
        button: this.$props.id,
        type: this.data_type,
        dataIndex: this.data_index,
        grid: this.$props.grid_id,
        overlay: this.$props.ov_id
      });
    }
  }
});
;// CONCATENATED MODULE: ./src/components/LegendButton.vue?vue&type=script&lang=js
 /* harmony default export */ const components_LegendButtonvue_type_script_lang_js = (LegendButtonvue_type_script_lang_js); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/LegendButton.vue?vue&type=style&index=0&id=7271720b&prod&lang=css
var LegendButtonvue_type_style_index_0_id_7271720b_prod_lang_css = __webpack_require__(152);
;// CONCATENATED MODULE: ./src/components/LegendButton.vue?vue&type=style&index=0&id=7271720b&prod&lang=css

;// CONCATENATED MODULE: ./src/components/LegendButton.vue



;


/* normalize component */

var LegendButton_component = normalizeComponent(
  components_LegendButtonvue_type_script_lang_js,
  LegendButtonvue_type_template_id_7271720b_render,
  LegendButtonvue_type_template_id_7271720b_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const LegendButton = (LegendButton_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ButtonGroup.vue?vue&type=script&lang=js

/* harmony default export */ const ButtonGroupvue_type_script_lang_js = ({
  name: 'ButtonGroup',
  props: ['buttons', 'tv_id', 'ov_id', 'grid_id', 'index', 'display', 'config'],
  components: {
    LegendButton: LegendButton
  },
  methods: {
    button_click: function button_click(event) {
      this.$emit('legend-button-click', event);
    }
  }
});
;// CONCATENATED MODULE: ./src/components/ButtonGroup.vue?vue&type=script&lang=js
 /* harmony default export */ const components_ButtonGroupvue_type_script_lang_js = (ButtonGroupvue_type_script_lang_js); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ButtonGroup.vue?vue&type=style&index=0&id=aee8964e&prod&lang=css
var ButtonGroupvue_type_style_index_0_id_aee8964e_prod_lang_css = __webpack_require__(197);
;// CONCATENATED MODULE: ./src/components/ButtonGroup.vue?vue&type=style&index=0&id=aee8964e&prod&lang=css

;// CONCATENATED MODULE: ./src/components/ButtonGroup.vue



;


/* normalize component */

var ButtonGroup_component = normalizeComponent(
  components_ButtonGroupvue_type_script_lang_js,
  ButtonGroupvue_type_template_id_aee8964e_render,
  ButtonGroupvue_type_template_id_aee8964e_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const ButtonGroup = (ButtonGroup_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Spinner.vue?vue&type=template&id=a6fff878
var Spinnervue_type_template_id_a6fff878_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("div", {
    staticClass: "tvjs-spinner"
  }, _vm._l(4, function (i) {
    return _c("div", {
      key: i,
      style: {
        background: _vm.colors.text
      }
    });
  }), 0);
};
var Spinnervue_type_template_id_a6fff878_staticRenderFns = [];
Spinnervue_type_template_id_a6fff878_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/Spinner.vue?vue&type=template&id=a6fff878

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Spinner.vue?vue&type=script&lang=js
/* harmony default export */ const Spinnervue_type_script_lang_js = ({
  name: 'Spinner',
  props: ['colors']
});
;// CONCATENATED MODULE: ./src/components/Spinner.vue?vue&type=script&lang=js
 /* harmony default export */ const components_Spinnervue_type_script_lang_js = (Spinnervue_type_script_lang_js); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Spinner.vue?vue&type=style&index=0&id=a6fff878&prod&lang=css
var Spinnervue_type_style_index_0_id_a6fff878_prod_lang_css = __webpack_require__(688);
;// CONCATENATED MODULE: ./src/components/Spinner.vue?vue&type=style&index=0&id=a6fff878&prod&lang=css

;// CONCATENATED MODULE: ./src/components/Spinner.vue



;


/* normalize component */

var Spinner_component = normalizeComponent(
  components_Spinnervue_type_script_lang_js,
  Spinnervue_type_template_id_a6fff878_render,
  Spinnervue_type_template_id_a6fff878_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Spinner = (Spinner_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Legend.vue?vue&type=script&lang=js


/* harmony default export */ const Legendvue_type_script_lang_js = ({
  name: "ChartLegend",
  components: {
    ButtonGroup: ButtonGroup,
    Spinner: Spinner
  },
  props: ["common", "values", "grid_id", "meta_props"],
  computed: {
    ohlcv: function ohlcv() {
      if (!this.values || !this.values.ohlcv) {
        return Array(6).fill("n/a");
      }
      var prec = this.layout.prec;

      // TODO: main the main legend more customizable
      var id = this.main_type + "_0";
      var meta = this.meta_props[id] || {};
      if (meta.legend) {
        return (meta.legend() || []).map(function (x) {
          return x.value;
        });
      }
      return [this.values.ohlcv[1].toFixed(prec), this.values.ohlcv[2].toFixed(prec), this.values.ohlcv[3].toFixed(prec), this.values.ohlcv[4].toFixed(prec), this.values.ohlcv[5] ? this.values.ohlcv[5].toFixed(2) : "n/a"];
    },
    // TODO: add support for { grid: { id : N }}
    indicators: function indicators() {
      var _this = this;
      var values = this.values;
      var f = this.format;
      var types = {};
      return this.json_data.filter(function (x) {
        return x.settings.legend !== false && !x.main;
      }).map(function (x) {
        var _x$settings;
        if (!(x.type in types)) types[x.type] = 0;
        var id = x.type + "_".concat(types[x.type]++);
        return {
          v: "display" in x.settings ? x.settings.display : true,
          name: x.name || id,
          index: (_this.off_data || _this.json_data).indexOf(x),
          id: id,
          values: values ? f(id, values, (_x$settings = x.settings) === null || _x$settings === void 0 ? void 0 : _x$settings.labels) : _this.n_a(1),
          unk: !(id in (_this.meta_props || {})),
          loading: x.loading
        };
      });
    },
    calc_style: function calc_style() {
      var top = this.layout.height > 150 ? 10 : 5;
      var grids = this.common.layout.grids;
      var w = grids[0] ? grids[0].width : undefined;
      return {
        top: "".concat(this.layout.offset + top, "px"),
        width: "".concat(w - 20, "px")
      };
    },
    layout: function layout() {
      var id = this.grid_id;
      return this.common.layout.grids[id];
    },
    json_data: function json_data() {
      return this.common.data;
    },
    off_data: function off_data() {
      return this.common.offchart;
    },
    main_type: function main_type() {
      var f = this.common.data.find(function (x) {
        return x.main;
      });
      return f ? f.type : undefined;
    },
    show_values: function show_values() {
      return this.common.cursor.mode !== "explore";
    }
  },
  methods: {
    format: function format(id, values, labels) {
      var meta = this.meta_props[id] || {};
      // Matches Overlay.data_colors with the data values
      // (see Spline.vue)
      if (!values[id]) return this.n_a(1);

      // Custom formatter
      if (meta.legend) return meta.legend(values[id]);
      return values[id].slice(1).map(function (x, i) {
        var cs = meta.data_colors ? meta.data_colors() : [];
        if (typeof x == "number") {
          // Show 8 digits for small values
          x = x.toFixed(Math.abs(x) > 0.001 ? 4 : 8);
        }
        if (labels) {
          x = labels[i % labels.length] + ": " + x;
        }
        return {
          value: x,
          color: cs ? cs[i % cs.length] : undefined
        };
      });
    },
    n_a: function n_a(len) {
      return Array(len).fill({
        value: "n/a"
      });
    },
    button_click: function button_click(event) {
      this.$emit("legend-button-click", event);
    }
  }
});
;// CONCATENATED MODULE: ./src/components/Legend.vue?vue&type=script&lang=js
 /* harmony default export */ const components_Legendvue_type_script_lang_js = (Legendvue_type_script_lang_js); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Legend.vue?vue&type=style&index=0&id=92b0463a&prod&lang=css
var Legendvue_type_style_index_0_id_92b0463a_prod_lang_css = __webpack_require__(67);
;// CONCATENATED MODULE: ./src/components/Legend.vue?vue&type=style&index=0&id=92b0463a&prod&lang=css

;// CONCATENATED MODULE: ./src/components/Legend.vue



;


/* normalize component */

var Legend_component = normalizeComponent(
  components_Legendvue_type_script_lang_js,
  Legendvue_type_template_id_92b0463a_render,
  Legendvue_type_template_id_92b0463a_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Legend = (Legend_component.exports);
;// CONCATENATED MODULE: ./src/mixins/shaders.js
function shaders_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = shaders_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function shaders_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return shaders_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return shaders_arrayLikeToArray(o, minLen); }
function shaders_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
// Parser for shader events

/* harmony default export */ const shaders = ({
  methods: {
    // Init shaders from extensions
    init_shaders: function init_shaders(skin, prev) {
      if (skin !== prev) {
        if (prev) this.shaders = this.shaders.filter(function (x) {
          return x.owner !== prev.id;
        });
        var _iterator = shaders_createForOfIteratorHelper(skin.shaders),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var Shader = _step.value;
            var shader = new Shader();
            shader.owner = skin.id;
            this.shaders.push(shader);
          }
          // TODO: Sort by zIndex
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
    },
    on_shader_event: function on_shader_event(d, target) {
      if (d.event === 'new-shader') {
        if (d.args[0].target === target) {
          d.args[0].id = "".concat(d.args[1], "-").concat(d.args[2]);
          this.shaders.push(d.args[0]);
          this.rerender++;
        }
      }
      if (d.event === 'remove-shaders') {
        var id = d.args.join('-');
        this.shaders = this.shaders.filter(function (x) {
          return x.id !== id;
        });
      }
    }
  },
  watch: {
    skin: function skin(n, p) {
      this.init_shaders(n, p);
    }
  },
  data: function data() {
    return {
      shaders: []
    };
  }
});
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Section.vue?vue&type=script&lang=js





/* harmony default export */ const Sectionvue_type_script_lang_js = ({
  name: 'GridSection',
  props: ['common', 'grid_id'],
  mixins: [shaders],
  components: {
    Grid: components_Grid,
    Sidebar: components_Sidebar,
    ChartLegend: Legend
  },
  mounted: function mounted() {
    this.init_shaders(this.$props.common.skin);
  },
  methods: {
    range_changed: function range_changed(r) {
      this.$emit('range-changed', r);
    },
    cursor_changed: function cursor_changed(c) {
      c.grid_id = this.$props.grid_id;
      this.$emit('cursor-changed', c);
    },
    cursor_locked: function cursor_locked(state) {
      this.$emit('cursor-locked', state);
    },
    sidebar_transform: function sidebar_transform(s) {
      this.$emit('sidebar-transform', s);
    },
    emit_meta_props: function emit_meta_props(d) {
      this.$set(this.meta_props, d.layer_id, d);
      this.$emit('layer-meta-props', d);
    },
    emit_custom_event: function emit_custom_event(d) {
      this.on_shader_event(d, 'sidebar');
      this.$emit('custom-event', d);
    },
    button_click: function button_click(event) {
      this.$emit('legend-button-click', event);
    },
    register_kb: function register_kb(event) {
      this.$emit('register-kb-listener', event);
    },
    remove_kb: function remove_kb(event) {
      this.$emit('remove-kb-listener', event);
    },
    rezoom_range: function rezoom_range(event) {
      var id = 'sb-' + event.grid_id;
      if (this.$refs[id]) {
        this.$refs[id].renderer.rezoom_range(event.z, event.diff1, event.diff2);
      }
    },
    ghash: function ghash(val) {
      // Measures grid heights configuration
      var hs = val.layout.grids.map(function (x) {
        return x.height;
      });
      return hs.reduce(function (a, b) {
        return a + b;
      }, '');
    }
  },
  computed: {
    // Component-specific props subsets:
    grid_props: function grid_props() {
      var id = this.$props.grid_id;
      var p = Object.assign({}, this.$props.common);

      // Split offchart data between offchart grids
      if (id > 0) {
        var _p$data;
        var all = p.data;
        p.data = [p.data[id - 1]];
        // Merge offchart overlays with custom ids with
        // the existing onse (by comparing the grid ids)
        (_p$data = p.data).push.apply(_p$data, _toConsumableArray(all.filter(function (x) {
          return x.grid && x.grid.id === id;
        })));
      }
      p.width = p.layout.grids[id].width;
      p.height = p.layout.grids[id].height;
      p.y_transform = p.y_ts[id];
      p.shaders = this.grid_shaders;
      return p;
    },
    sidebar_props: function sidebar_props() {
      var id = this.$props.grid_id;
      var p = Object.assign({}, this.$props.common);
      p.width = p.layout.grids[id].sb;
      p.height = p.layout.grids[id].height;
      p.y_transform = p.y_ts[id];
      p.shaders = this.sb_shaders;
      return p;
    },
    section_values: function section_values() {
      var id = this.$props.grid_id;
      var p = Object.assign({}, this.$props.common);
      p.width = p.layout.grids[id].width;
      return p.cursor.values[id];
    },
    legend_props: function legend_props() {
      var id = this.$props.grid_id;
      var p = Object.assign({}, this.$props.common);

      // Split offchart data between offchart grids
      if (id > 0) {
        var _p$data2;
        var all = p.data;
        p.offchart = all;
        p.data = [p.data[id - 1]];
        (_p$data2 = p.data).push.apply(_p$data2, _toConsumableArray(all.filter(function (x) {
          return x.grid && x.grid.id === id;
        })));
      }
      return p;
    },
    get_meta_props: function get_meta_props() {
      return this.meta_props;
    },
    grid_shaders: function grid_shaders() {
      return this.shaders.filter(function (x) {
        return x.target === 'grid';
      });
    },
    sb_shaders: function sb_shaders() {
      return this.shaders.filter(function (x) {
        return x.target === 'sidebar';
      });
    }
  },
  watch: {
    common: {
      handler: function handler(val, old_val) {
        var newhash = this.ghash(val);
        if (newhash !== this.last_ghash) {
          this.rerender++;
        }
        if (val.data.length !== old_val.data.length) {
          // Look at this nasty trick!
          this.rerender++;
        }
        this.last_ghash = newhash;
      },
      deep: true
    }
  },
  data: function data() {
    return {
      meta_props: {},
      rerender: 0,
      last_ghash: ''
    };
  }
});
;// CONCATENATED MODULE: ./src/components/Section.vue?vue&type=script&lang=js
 /* harmony default export */ const components_Sectionvue_type_script_lang_js = (Sectionvue_type_script_lang_js); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Section.vue?vue&type=style&index=0&id=6a086200&prod&lang=css
var Sectionvue_type_style_index_0_id_6a086200_prod_lang_css = __webpack_require__(391);
;// CONCATENATED MODULE: ./src/components/Section.vue?vue&type=style&index=0&id=6a086200&prod&lang=css

;// CONCATENATED MODULE: ./src/components/Section.vue



;


/* normalize component */

var Section_component = normalizeComponent(
  components_Sectionvue_type_script_lang_js,
  Sectionvue_type_template_id_6a086200_render,
  Sectionvue_type_template_id_6a086200_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Section = (Section_component.exports);
;// CONCATENATED MODULE: ./src/components/js/botbar.js


function botbar_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = botbar_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function botbar_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return botbar_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return botbar_arrayLikeToArray(o, minLen); }
function botbar_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }


var botbar_MINUTE15 = constants.MINUTE15,
  botbar_MINUTE = constants.MINUTE,
  botbar_HOUR = constants.HOUR,
  botbar_DAY = constants.DAY,
  botbar_WEEK = constants.WEEK,
  botbar_MONTH = constants.MONTH,
  botbar_YEAR = constants.YEAR,
  botbar_MONTHMAP = constants.MONTHMAP;
var Botbar = /*#__PURE__*/function () {
  function Botbar(canvas, comp) {
    classCallCheck_classCallCheck(this, Botbar);
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.comp = comp;
    this.$p = comp.$props;
    this.data = this.$p.sub;
    this.range = this.$p.range;
    this.layout = this.$p.layout;
  }
  return createClass_createClass(Botbar, [{
    key: "update",
    value: function update() {
      this.grid_0 = this.layout.grids[0];
      var width = this.layout.botbar.width;
      var height = this.layout.botbar.height;
      var sb = this.layout.grids[0].sb;

      //this.ctx.fillStyle = this.$p.colors.back
      this.ctx.font = this.$p.font;
      //this.ctx.fillRect(0, 0, width, height)
      this.ctx.clearRect(0, 0, width, height);
      this.ctx.strokeStyle = this.$p.colors.scale;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0.5);
      this.ctx.lineTo(Math.floor(width + 1), 0.5);
      this.ctx.stroke();
      this.ctx.fillStyle = this.$p.colors.text;
      this.ctx.beginPath();
      var _iterator = botbar_createForOfIteratorHelper(this.layout.botbar.xs),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var p = _step.value;
          var lbl = this.format_date(p);
          if (p[0] > width - sb) continue;
          this.ctx.moveTo(p[0] - 0.5, 0);
          this.ctx.lineTo(p[0] - 0.5, 4.5);
          if (!this.lbl_highlight(p[1][0])) {
            this.ctx.globalAlpha = 0.85;
          }
          this.ctx.textAlign = 'center';
          this.ctx.fillText(lbl, p[0], 18);
          this.ctx.globalAlpha = 1;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      this.ctx.stroke();
      this.apply_shaders();
      if (this.$p.cursor.x && this.$p.cursor.t !== undefined) this.panel();
    }
  }, {
    key: "apply_shaders",
    value: function apply_shaders() {
      var layout = this.layout.grids[0];
      var props = {
        layout: layout,
        cursor: this.$p.cursor
      };
      var _iterator2 = botbar_createForOfIteratorHelper(this.comp.bot_shaders),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var s = _step2.value;
          this.ctx.save();
          s.draw(this.ctx, props);
          this.ctx.restore();
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }, {
    key: "panel",
    value: function panel() {
      var lbl = this.format_cursor_x();
      this.ctx.fillStyle = this.$p.colors.panel;
      var measure = this.ctx.measureText(lbl + '    ');
      var panwidth = Math.floor(measure.width);
      var cursor = this.$p.cursor.x;
      var x = Math.floor(cursor - panwidth * 0.5);
      var y = -0.5;
      var panheight = this.comp.config.PANHEIGHT;
      this.ctx.fillRect(x, y, panwidth, panheight + 0.5);
      this.ctx.fillStyle = this.$p.colors.textHL;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(lbl, cursor, y + 16);
    }
  }, {
    key: "format_date",
    value: function format_date(p) {
      var t = p[1][0];
      t = this.grid_0.ti_map.i2t(t);
      var ti = this.$p.layout.grids[0].ti_map.tf;
      // Enable timezones only for tf < 1D
      var k = ti < botbar_DAY ? 1 : 0;
      var tZ = t + k * this.$p.timezone * botbar_HOUR;

      //t += new Date(t).getTimezoneOffset() * MINUTE
      var d = new Date(tZ);
      if (p[2] === botbar_YEAR || utils.year_start(t) === t) {
        return d.getUTCFullYear();
      }
      if (p[2] === botbar_MONTH || utils.month_start(t) === t) {
        return botbar_MONTHMAP[d.getUTCMonth()];
      }
      // TODO(*) see grid_maker.js
      if (utils.day_start(tZ) === tZ) return d.getUTCDate();
      var h = utils.add_zero(d.getUTCHours());
      var m = utils.add_zero(d.getUTCMinutes());
      return h + ":" + m;
    }
  }, {
    key: "format_cursor_x",
    value: function format_cursor_x() {
      var t = this.$p.cursor.t;
      t = this.grid_0.ti_map.i2t(t);
      //let ti = this.$p.interval
      var ti = this.$p.layout.grids[0].ti_map.tf;
      // Enable timezones only for tf < 1D
      var k = ti < botbar_DAY ? 1 : 0;

      //t += new Date(t).getTimezoneOffset() * MINUTE
      var d = new Date(t + k * this.$p.timezone * botbar_HOUR);
      if (ti === botbar_YEAR) {
        return d.getUTCFullYear();
      }
      if (ti < botbar_YEAR) {
        var yr = '`' + "".concat(d.getUTCFullYear()).slice(-2);
        var mo = botbar_MONTHMAP[d.getUTCMonth()];
        var dd = '01';
      }
      if (ti <= botbar_WEEK) dd = d.getUTCDate();
      var date = "".concat(dd, " ").concat(mo, " ").concat(yr);
      var time = '';
      if (ti < botbar_DAY) {
        var h = utils.add_zero(d.getUTCHours());
        var m = utils.add_zero(d.getUTCMinutes());
        time = h + ":" + m;
      }
      return "".concat(date, "  ").concat(time);
    }

    // Highlights the begining of a time interval
    // TODO: improve. Problem: let's say we have a new month,
    // but if there is no grid line in place, there
    // will be no month name on t-axis. Sad.
    // Solution: manipulate the grid, skew it, you know
  }, {
    key: "lbl_highlight",
    value: function lbl_highlight(t) {
      var ti = this.$p.interval;
      if (t === 0) return true;
      if (utils.month_start(t) === t) return true;
      if (utils.day_start(t) === t) return true;
      if (ti <= botbar_MINUTE15 && t % botbar_HOUR === 0) return true;
      return false;
    }
  }, {
    key: "mousemove",
    value: function mousemove() {}
  }, {
    key: "mouseout",
    value: function mouseout() {}
  }, {
    key: "mouseup",
    value: function mouseup() {}
  }, {
    key: "mousedown",
    value: function mousedown() {}
  }]);
}();

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Botbar.vue?vue&type=script&lang=js
// The bottom bar (yep, that thing with a bunch of dates)



/* harmony default export */ const Botbarvue_type_script_lang_js = ({
  name: 'Botbar',
  props: ['sub', 'layout', 'range', 'interval', 'cursor', 'colors', 'font', 'width', 'height', 'rerender', 'tv_id', 'config', 'shaders', 'timezone'],
  mixins: [canvas],
  mounted: function mounted() {
    var el = this.$refs['canvas'];
    this.renderer = new Botbar(el, this);
    this.setup();
    this.redraw();
  },
  render: function render(h) {
    var sett = this.$props.layout.botbar;
    return this.create_canvas(h, 'botbar', {
      position: {
        x: 0,
        y: sett.offset || 0
      },
      attrs: {
        rerender: this.$props.rerender,
        width: sett.width,
        height: sett.height
      },
      style: {
        backgroundColor: this.$props.colors.back
      }
    });
  },
  computed: {
    bot_shaders: function bot_shaders() {
      return this.$props.shaders.filter(function (x) {
        return x.target === 'botbar';
      });
    }
  },
  watch: {
    range: {
      handler: function handler() {
        this.redraw();
      },
      deep: true
    },
    cursor: {
      handler: function handler() {
        this.redraw();
      },
      deep: true
    },
    rerender: function rerender() {
      var _this = this;
      this.$nextTick(function () {
        return _this.redraw();
      });
    }
  }
});
;// CONCATENATED MODULE: ./src/components/Botbar.vue?vue&type=script&lang=js
 /* harmony default export */ const components_Botbarvue_type_script_lang_js = (Botbarvue_type_script_lang_js); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Botbar.vue?vue&type=style&index=0&id=46ebcacf&prod&lang=css
var Botbarvue_type_style_index_0_id_46ebcacf_prod_lang_css = __webpack_require__(77);
;// CONCATENATED MODULE: ./src/components/Botbar.vue?vue&type=style&index=0&id=46ebcacf&prod&lang=css

;// CONCATENATED MODULE: ./src/components/Botbar.vue
var Botbar_render, Botbar_staticRenderFns
;

;


/* normalize component */

var Botbar_component = normalizeComponent(
  components_Botbarvue_type_script_lang_js,
  Botbar_render,
  Botbar_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const components_Botbar = (Botbar_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Keyboard.vue?vue&type=script&lang=js
/* harmony default export */ const Keyboardvue_type_script_lang_js = ({
  name: 'Keyboard',
  created: function created() {
    window.addEventListener('keydown', this.keydown);
    window.addEventListener('keyup', this.keyup);
    window.addEventListener('keypress', this.keypress);
    this._listeners = {};
  },
  beforeDestroy: function beforeDestroy() {
    window.removeEventListener('keydown', this.keydown);
    window.removeEventListener('keyup', this.keyup);
    window.removeEventListener('keypress', this.keypress);
  },
  render: function render(h) {
    return h();
  },
  methods: {
    keydown: function keydown(event) {
      for (var id in this._listeners) {
        var l = this._listeners[id];
        if (l && l.keydown) {
          l.keydown(event);
        } else {
          console.warn("No 'keydown' listener for ".concat(id));
        }
      }
    },
    keyup: function keyup(event) {
      for (var id in this._listeners) {
        var l = this._listeners[id];
        if (l && l.keyup) {
          l.keyup(event);
        } else {
          console.warn("No 'keyup' listener for ".concat(id));
        }
      }
    },
    keypress: function keypress(event) {
      for (var id in this._listeners) {
        var l = this._listeners[id];
        if (l && l.keypress) {
          l.keypress(event);
        } else {
          console.warn("No 'keypress' listener for ".concat(id));
        }
      }
    },
    register: function register(listener) {
      this._listeners[listener.id] = listener;
    },
    remove: function remove(listener) {
      delete this._listeners[listener.id];
    }
  }
});
;// CONCATENATED MODULE: ./src/components/Keyboard.vue?vue&type=script&lang=js
 /* harmony default export */ const components_Keyboardvue_type_script_lang_js = (Keyboardvue_type_script_lang_js); 
;// CONCATENATED MODULE: ./src/components/Keyboard.vue
var Keyboard_render, Keyboard_staticRenderFns
;



/* normalize component */
;
var Keyboard_component = normalizeComponent(
  components_Keyboardvue_type_script_lang_js,
  Keyboard_render,
  Keyboard_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Keyboard = (Keyboard_component.exports);
;// CONCATENATED MODULE: ./src/mixins/datatrack.js
// Data tracker/watcher


/* harmony default export */ const datatrack = ({
  methods: {
    data_changed: function data_changed() {
      var n = this.ohlcv;
      var changed = false;
      if (this._data_n0 !== n[0] && this._data_len !== n.length) {
        changed = true;
      }
      this.check_all_data(changed);
      if (this.ti_map.ib) {
        this.reindex_delta(n[0], this._data_n0);
      }
      this._data_n0 = n[0];
      this._data_len = n.length;
      this.save_data_t();
      return changed;
    },
    check_all_data: function check_all_data(changed) {
      // If length of data in the Structure changed by > 1 point
      // emit a special event for DC to recalc the scripts
      // TODO: check overlays data too
      var len = this._data_len || 0;
      if (Math.abs(this.ohlcv.length - len) > 1 || this._data_n0 !== this.ohlcv[0]) {
        this.$emit('custom-event', {
          event: 'data-len-changed',
          args: []
        });
      }
    },
    reindex_delta: function reindex_delta(n, p) {
      n = n || [[0]];
      p = p || [[0]];
      var dt = n[0] - p[0];
      if (dt !== 0 && this._data_t) {
        // Convert t back to index
        try {
          // More precise method first
          var nt = this._data_t + 0.01; // fix for the filter lib
          var res = utils.fast_nearest(this.ohlcv, nt);
          var cndl = this.ohlcv[res[0]];
          var off = (nt - cndl[0]) / this.interval_ms;
          this["goto"](res[0] + off);
        } catch (e) {
          this["goto"](this.ti_map.t2i(this._data_t));
        }
      }
    },
    save_data_t: function save_data_t() {
      this._data_t = this.ti_map.i2t(this.range[1]); // save as t
    }
  },
  data: function data() {
    return {
      _data_n0: null,
      _data_len: 0,
      _data_t: 0
    };
  }
});
;// CONCATENATED MODULE: ./src/components/js/ti_mapping.js




// Time-index mapping (for non-linear t-axis)


var MAX_ARR = Math.pow(2, 32);

// 3 MODES of index calculation for overlays/subcharts:
// ::: indexSrc :::
// * "map"      -> use TI mapping functions to detect index
//                 (slowest, for stocks only. DEFAULT)
//
// * "calc"     -> calculate shift between sub & data
//                 (faster, but overlay data should be perfectly
//                  align with the main chart,
//                  1-1 candle/data point. Supports Renko)
//
// * "data"     -> overlay data should come with candle index
//                 (fastest, supports Renko)
var TI = /*#__PURE__*/function () {
  function TI() {
    classCallCheck_classCallCheck(this, TI);
    this.ib = false;
  }
  return createClass_createClass(TI, [{
    key: "init",
    value: function init(params, res) {
      var sub = params.sub,
        interval = params.interval,
        meta = params.meta,
        $p = params.$props,
        interval_ms = params.interval_ms,
        sub_start = params.sub_start,
        ib = params.ib;
      this.ti_map = [];
      this.it_map = [];
      this.sub_i = [];
      this.ib = ib;
      this.sub = res;
      this.ss = sub_start;
      this.tf = interval_ms;
      var start = meta.sub_start;

      // Skip mapping for the regular mode
      if (this.ib) {
        this.map_sub(res);
      }
    }

    // Make maps for the main subset
  }, {
    key: "map_sub",
    value: function map_sub(res) {
      for (var i = 0; i < res.length; i++) {
        var t = res[i][0];
        var _i = this.ss + i;
        this.ti_map[t] = _i;
        this.it_map[_i] = t;

        // Overwrite t with i
        var copy = _toConsumableArray(res[i]);
        copy[0] = _i;
        this.sub_i.push(copy);
      }
    }

    // Map overlay data
    // TODO: parse() called 3 times instead of 2 for 'spx_sample.json'
  }, {
    key: "parse",
    value: function parse(data, mode) {
      if (!this.ib || !this.sub[0] || mode === 'data') return data;
      var res = [];
      var k = 0; // Candlestick index

      if (mode === 'calc') {
        var shift = utils.index_shift(this.sub, data);
        for (var i = 0; i < data.length; i++) {
          var _i = this.ss + i;
          var copy = _toConsumableArray(data[i]);
          copy[0] = _i + shift;
          res.push(copy);
        }
        return res;
      }

      // If indicator data starts after ohlcv, calc the first index
      if (data.length) {
        try {
          var k1 = utils.fast_nearest(this.sub, data[0][0])[0];
          if (k1 !== null && k1 >= 0) k = k1;
        } catch (e) {}
      }
      var t0 = this.sub[0][0];
      var tN = this.sub[this.sub.length - 1][0];
      for (var i = 0; i < data.length; i++) {
        var _copy = _toConsumableArray(data[i]);
        var tk = this.sub[k][0];
        var t = data[i][0];
        var index = this.ti_map[t];
        if (index === undefined) {
          // Linear extrapolation
          if (t < t0 || t > tN) {
            index = this.ss + k - (tk - t) / this.tf;
            t = data[i + 1] ? data[i + 1][0] : undefined;
          }

          // Linear interpolation
          else {
            var tk2 = this.sub[k + 1][0];
            index = tk === tk2 ? this.ss + k : this.ss + k + (t - tk) / (tk2 - tk);
            t = data[i + 1] ? data[i + 1][0] : undefined;
          }
        }
        // Race of data points & sub points (ohlcv)
        // (like turn based increments)
        while (k + 1 < this.sub.length - 1 && t > this.sub[k + 1][0]) {
          k++;
          tk = this.sub[k][0];
        }
        _copy[0] = index;
        res.push(_copy);
      }
      return res;
    }

    // index => time
  }, {
    key: "i2t",
    value: function i2t(i) {
      if (!this.ib || !this.sub.length) return i; // Regular mode

      // Discrete mapping
      var res = this.it_map[i];
      if (res !== undefined) return res;
      // Linear extrapolation
      else if (i >= this.ss + this.sub_i.length) {
        var di = i - (this.ss + this.sub_i.length) + 1;
        var last = this.sub[this.sub.length - 1];
        return last[0] + di * this.tf;
      } else if (i < this.ss) {
        var _di = i - this.ss;
        return this.sub[0][0] + _di * this.tf;
      }

      // Linear Interpolation
      var i1 = Math.floor(i) - this.ss;
      var i2 = i1 + 1;
      var len = this.sub.length;
      if (i2 >= len) i2 = len - 1;
      var sub1 = this.sub[i1];
      var sub2 = this.sub[i2];
      if (sub1 && sub2) {
        var t1 = sub1[0];
        var t2 = sub2[0];
        return t1 + (t2 - t1) * (i - i1 - this.ss);
      }
      return undefined;
    }

    // Map or bypass depending on the mode
  }, {
    key: "i2t_mode",
    value: function i2t_mode(i, mode) {
      return mode === 'data' ? i : this.i2t(i);
    }

    // time => index
    // TODO: when switch from IB mode to regular tools
    // disappear (bc there is no more mapping)
  }, {
    key: "t2i",
    value: function t2i(t) {
      if (!this.sub.length) return undefined;

      // Discrete mapping
      var res = this.ti_map[t];
      if (res !== undefined) return res;
      var t0 = this.sub[0][0];
      var tN = this.sub[this.sub.length - 1][0];

      // Linear extrapolation
      if (t < t0) {
        return this.ss - (t0 - t) / this.tf;
      } else if (t > tN) {
        var k = this.sub.length - 1;
        return this.ss + k - (tN - t) / this.tf;
      }
      try {
        // Linear Interpolation
        var i = utils.fast_nearest(this.sub, t);
        var tk = this.sub[i[0]][0];
        var tk2 = this.sub[i[1]][0];
        var _k = (t - tk) / (tk2 - tk);
        return this.ss + i[0] + _k * (i[1] - i[0]);
      } catch (e) {}
      return undefined;
    }

    // Auto detect: is it time or index?
    // Assuming that index-based mode is ON
  }, {
    key: "smth2i",
    value: function smth2i(smth) {
      if (smth > MAX_ARR) {
        return this.t2i(smth); // it was time
      } else {
        return smth; // it was an index
      }
    }
  }, {
    key: "smth2t",
    value: function smth2t(smth) {
      if (smth < MAX_ARR) {
        return this.i2t(smth); // it was an index
      } else {
        return smth; // it was time
      }
    }

    // Global Time => Index (uses all data, approx. method)
    // Used by tv.goto()
  }, {
    key: "gt2i",
    value: function gt2i(smth, ohlcv) {
      if (smth > MAX_ARR) {
        var E = 0.1; // Fixes the arrayslicer bug
        var _Utils$fast_nearest = utils.fast_nearest(ohlcv, smth + E),
          _Utils$fast_nearest2 = _slicedToArray(_Utils$fast_nearest, 2),
          i1 = _Utils$fast_nearest2[0],
          i2 = _Utils$fast_nearest2[1];
        if (typeof i1 === 'number') {
          return i1;
        } else {
          return this.t2i(smth); // fallback
        }
      } else {
        return smth; // it was an index
      }
    }
  }]);
}();

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Chart.vue?vue&type=script&lang=js













/* harmony default export */ const Chartvue_type_script_lang_js = ({
  name: 'Chart',
  props: ['title_txt', 'data', 'width', 'height', 'font', 'colors', 'overlays', 'tv_id', 'config', 'buttons', 'toolbar', 'ib', 'skin', 'timezone'],
  mixins: [shaders, datatrack],
  components: {
    GridSection: Section,
    Botbar: components_Botbar,
    Keyboard: Keyboard
  },
  created: function created() {
    // Context for text measurements
    this.ctx = new context(this.$props);

    // Initial layout (All measurments for the chart)
    this.init_range();
    this.sub = this.subset();
    utils.overwrite(this.range, this.range); // Fix for IB mode
    this._layout = new layout(this);

    // Updates current cursor values
    this.updater = new updater(this);
    this.update_last_values();
    this.init_shaders(this.skin);
  },
  methods: {
    range_changed: function range_changed(r) {
      // Overwite & keep the original references
      // Quick fix for IB mode (switch 2 next lines)
      // TODO: wtf?
      var sub = this.subset(r);
      utils.overwrite(this.range, r);
      utils.overwrite(this.sub, sub);
      this.update_layout();
      this.$emit('range-changed', r);
      if (this.$props.ib) this.save_data_t();
    },
    "goto": function goto(t) {
      var dt = this.range[1] - this.range[0];
      this.range_changed([t - dt, t]);
    },
    setRange: function setRange(t1, t2) {
      this.range_changed([t1, t2]);
    },
    cursor_changed: function cursor_changed(e) {
      if (e.mode) this.cursor.mode = e.mode;
      if (this.cursor.mode !== 'explore') {
        this.updater.sync(e);
      }
      if (this._hook_xchanged) this.ce('?x-changed', e);
    },
    cursor_locked: function cursor_locked(state) {
      if (this.cursor.scroll_lock && state) return;
      this.cursor.locked = state;
      if (this._hook_xlocked) this.ce('?x-locked', state);
    },
    calc_interval: function calc_interval() {
      var _this = this;
      var tf = utils.parse_tf(this.forced_tf);
      if (this.ohlcv.length < 2 && !tf) return;
      this.interval_ms = tf || utils.detect_interval(this.ohlcv);
      this.interval = this.$props.ib ? 1 : this.interval_ms;
      utils.warn(function () {
        return _this.$props.ib && !_this.chart.tf;
      }, constants.IB_TF_WARN, constants.SECOND);
    },
    set_ytransform: function set_ytransform(s) {
      var obj = this.y_transforms[s.grid_id] || {};
      Object.assign(obj, s);
      this.$set(this.y_transforms, s.grid_id, obj);
      this.update_layout();
      utils.overwrite(this.range, this.range);
    },
    default_range: function default_range() {
      var dl = this.$props.config.DEFAULT_LEN;
      var ml = this.$props.config.MINIMUM_LEN + 0.5;
      var l = this.ohlcv.length - 1;
      if (this.ohlcv.length < 2) return;
      if (this.ohlcv.length <= dl) {
        var s = 0,
          d = ml;
      } else {
        s = l - dl, d = 0.5;
      }
      if (!this.$props.ib) {
        utils.overwrite(this.range, [this.ohlcv[s][0] - this.interval * d, this.ohlcv[l][0] + this.interval * ml]);
      } else {
        utils.overwrite(this.range, [s - this.interval * d, l + this.interval * ml]);
      }
    },
    subset: function subset(range) {
      if (range === void 0) {
        range = this.range;
      }
      var _this$filter = this.filter(this.ohlcv, range[0] - this.interval, range[1]),
        _this$filter2 = _slicedToArray(_this$filter, 2),
        res = _this$filter2[0],
        index = _this$filter2[1];
      this.ti_map = new TI();
      if (res) {
        this.sub_start = index;
        this.ti_map.init(this, res);
        if (!this.$props.ib) return res || [];
        return this.ti_map.sub_i;
      }
      return [];
    },
    common_props: function common_props() {
      return {
        title_txt: this.chart.name || this.$props.title_txt,
        layout: this._layout,
        sub: this.sub,
        range: this.range,
        interval: this.interval,
        cursor: this.cursor,
        colors: this.$props.colors,
        font: this.$props.font,
        y_ts: this.y_transforms,
        tv_id: this.$props.tv_id,
        config: this.$props.config,
        buttons: this.$props.buttons,
        meta: this.meta,
        skin: this.$props.skin
      };
    },
    overlay_subset: function overlay_subset(source, side) {
      var _this2 = this;
      return source.map(function (d, i) {
        var res = utils.fast_filter(d.data, _this2.ti_map.i2t_mode(_this2.range[0] - _this2.interval, d.indexSrc), _this2.ti_map.i2t_mode(_this2.range[1], d.indexSrc));
        return {
          type: d.type,
          name: utils.format_name(d),
          data: _this2.ti_map.parse(res[0] || [], d.indexSrc || 'map'),
          settings: d.settings || _this2.settings_ov,
          grid: d.grid || {},
          tf: utils.parse_tf(d.tf),
          i0: res[1],
          loading: d.loading,
          last: (_this2.last_values[side] || [])[i]
        };
      });
    },
    section_props: function section_props(i) {
      return i === 0 ? this.main_section : this.sub_section;
    },
    init_range: function init_range() {
      this.calc_interval();
      this.default_range();
    },
    layer_meta_props: function layer_meta_props(d) {
      // TODO: check reactivity when layout is changed
      if (!(d.grid_id in this.layers_meta)) {
        this.$set(this.layers_meta, d.grid_id, {});
      }
      this.$set(this.layers_meta[d.grid_id], d.layer_id, d);

      // Rerender
      this.update_layout();
    },
    remove_meta_props: function remove_meta_props(grid_id, layer_id) {
      if (grid_id in this.layers_meta) {
        this.$delete(this.layers_meta[grid_id], layer_id);
      }
    },
    emit_custom_event: function emit_custom_event(d) {
      this.on_shader_event(d, 'botbar');
      this.$emit('custom-event', d);
      if (d.event === 'remove-layer-meta') {
        this.remove_meta_props.apply(this, _toConsumableArray(d.args));
      }
    },
    update_layout: function update_layout(clac_tf) {
      if (clac_tf) this.calc_interval();
      var lay = new layout(this);
      utils.copy_layout(this._layout, lay);
      if (this._hook_update) this.ce('?chart-update', lay);
    },
    legend_button_click: function legend_button_click(event) {
      this.$emit('legend-button-click', event);
    },
    register_kb: function register_kb(event) {
      if (!this.$refs.keyboard) return;
      this.$refs.keyboard.register(event);
    },
    remove_kb: function remove_kb(event) {
      if (!this.$refs.keyboard) return;
      this.$refs.keyboard.remove(event);
    },
    update_last_values: function update_last_values() {
      var _this3 = this;
      this.last_candle = this.ohlcv ? this.ohlcv[this.ohlcv.length - 1] : undefined;
      this.last_values = {
        onchart: [],
        offchart: []
      };
      this.onchart.forEach(function (x, i) {
        var d = x.data || [];
        _this3.last_values.onchart[i] = d[d.length - 1];
      });
      this.offchart.forEach(function (x, i) {
        var d = x.data || [];
        _this3.last_values.offchart[i] = d[d.length - 1];
      });
    },
    // Hook events for extensions
    ce: function ce(event) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      this.emit_custom_event({
        event: event,
        args: args
      });
    },
    // Set hooks list (called from an extension)
    hooks: function hooks() {
      var _this4 = this;
      for (var _len2 = arguments.length, list = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        list[_key2] = arguments[_key2];
      }
      list.forEach(function (x) {
        return _this4["_hook_".concat(x)] = true;
      });
    }
  },
  computed: {
    // Component-specific props subsets:
    main_section: function main_section() {
      var p = Object.assign({}, this.common_props());
      p.data = this.overlay_subset(this.onchart, 'onchart');
      p.data.push({
        type: this.chart.type || 'Candles',
        main: true,
        data: this.sub,
        i0: this.sub_start,
        settings: this.chart.settings || this.settings_ohlcv,
        grid: this.chart.grid || {},
        last: this.last_candle
      });
      p.overlays = this.$props.overlays;
      return p;
    },
    sub_section: function sub_section() {
      var p = Object.assign({}, this.common_props());
      p.data = this.overlay_subset(this.offchart, 'offchart');
      p.overlays = this.$props.overlays;
      return p;
    },
    botbar_props: function botbar_props() {
      var p = Object.assign({}, this.common_props());
      p.width = p.layout.botbar.width;
      p.height = p.layout.botbar.height;
      p.rerender = this.rerender;
      return p;
    },
    offsub: function offsub() {
      return this.overlay_subset(this.offchart, 'offchart');
    },
    // Datasets: candles, onchart, offchart indicators
    ohlcv: function ohlcv() {
      return this.$props.data.ohlcv || this.chart.data || [];
    },
    chart: function chart() {
      return this.$props.data.chart || {
        grid: {}
      };
    },
    onchart: function onchart() {
      return this.$props.data.onchart || [];
    },
    offchart: function offchart() {
      return this.$props.data.offchart || [];
    },
    filter: function filter() {
      return this.$props.ib ? utils.fast_filter_i : utils.fast_filter;
    },
    styles: function styles() {
      var w = this.$props.toolbar ? this.$props.config.TOOLBAR : 0;
      return {
        'margin-left': "".concat(w, "px")
      };
    },
    meta: function meta() {
      return {
        last: this.last_candle,
        sub_start: this.sub_start,
        activated: this.activated
      };
    },
    forced_tf: function forced_tf() {
      return this.chart.tf;
    }
  },
  data: function data() {
    return {
      // Current data slice
      sub: [],
      // Time range
      range: [],
      // Candlestick interval
      interval: 0,
      // Crosshair states
      cursor: {
        x: null,
        y: null,
        t: null,
        y$: null,
        grid_id: null,
        locked: false,
        values: {},
        scroll_lock: false,
        mode: utils.xmode()
      },
      // A trick to re-render botbar
      rerender: 0,
      // Layers meta-props (changing behaviour)
      layers_meta: {},
      // Y-transforms (for y-zoom and -shift)
      y_transforms: {},
      // Default OHLCV settings (when using DataStructure v1.0)
      settings_ohlcv: {},
      // Default overlay settings
      settings_ov: {},
      // Meta data
      last_candle: [],
      last_values: {},
      sub_start: undefined,
      activated: false
    };
  },
  watch: {
    width: function width() {
      this.update_layout();
      if (this._hook_resize) this.ce('?chart-resize');
    },
    height: function height() {
      this.update_layout();
      if (this._hook_resize) this.ce('?chart-resize');
    },
    ib: function ib(nw) {
      if (!nw) {
        // Change range index => time
        var t1 = this.ti_map.i2t(this.range[0]);
        var t2 = this.ti_map.i2t(this.range[1]);
        utils.overwrite(this.range, [t1, t2]);
        this.interval = this.interval_ms;
      } else {
        this.init_range(); // TODO: calc index range instead
        utils.overwrite(this.range, this.range);
        this.interval = 1;
      }
      var sub = this.subset();
      utils.overwrite(this.sub, sub);
      this.update_layout();
    },
    timezone: function timezone() {
      this.update_layout();
    },
    colors: function colors() {
      utils.overwrite(this.range, this.range);
    },
    forced_tf: function forced_tf(n, p) {
      this.update_layout(true);
      this.ce('exec-all-scripts');
    },
    data: {
      handler: function handler(n, p) {
        if (!this.sub.length) this.init_range();
        var sub = this.subset();
        // Fixes Infinite loop warn, when the subset is empty
        // TODO: Consider removing 'sub' from data entirely
        if (this.sub.length || sub.length) {
          utils.overwrite(this.sub, sub);
        }
        var nw = this.data_changed();
        this.update_layout(nw);
        utils.overwrite(this.range, this.range);
        this.cursor.scroll_lock = !!n.scrollLock;
        if (n.scrollLock && this.cursor.locked) {
          this.cursor.locked = false;
        }
        if (this._hook_data) this.ce('?chart-data', nw);
        this.update_last_values();
        // TODO: update legend values for overalys
        this.rerender++;
      },
      deep: true
    }
  }
});
;// CONCATENATED MODULE: ./src/components/Chart.vue?vue&type=script&lang=js
 /* harmony default export */ const components_Chartvue_type_script_lang_js = (Chartvue_type_script_lang_js); 
;// CONCATENATED MODULE: ./src/components/Chart.vue





/* normalize component */
;
var Chart_component = normalizeComponent(
  components_Chartvue_type_script_lang_js,
  Chartvue_type_template_id_f7d40a04_render,
  Chartvue_type_template_id_f7d40a04_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Chart = (Chart_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Toolbar.vue?vue&type=template&id=1d908e28
var Toolbarvue_type_template_id_1d908e28_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("div", {
    key: _vm.tool_count,
    staticClass: "trading-vue-toolbar",
    style: _vm.styles
  }, _vm._l(_vm.groups, function (tool, i) {
    return tool.icon && !tool.hidden ? _c("toolbar-item", {
      key: i,
      attrs: {
        data: tool,
        subs: _vm.sub_map,
        dc: _vm.data,
        config: _vm.config,
        colors: _vm.colors,
        selected: _vm.is_selected(tool)
      },
      on: {
        "item-selected": _vm.selected
      }
    }) : _vm._e();
  }), 1);
};
var Toolbarvue_type_template_id_1d908e28_staticRenderFns = [];
Toolbarvue_type_template_id_1d908e28_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/Toolbar.vue?vue&type=template&id=1d908e28

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ToolbarItem.vue?vue&type=template&id=24cfb58a
var ToolbarItemvue_type_template_id_24cfb58a_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("div", {
    "class": ["trading-vue-tbitem", _vm.selected ? "selected-item" : ""],
    style: _vm.item_style,
    on: {
      click: function click($event) {
        return _vm.emit_selected("click");
      },
      mousedown: _vm.mousedown,
      touchstart: _vm.mousedown,
      touchend: function touchend($event) {
        return _vm.emit_selected("touch");
      }
    }
  }, [_c("div", {
    staticClass: "trading-vue-tbicon tvjs-pixelated",
    style: _vm.icon_style
  }), _vm._v(" "), _vm.data.group ? _c("div", {
    staticClass: "trading-vue-tbitem-exp",
    style: _vm.exp_style,
    on: {
      click: _vm.exp_click,
      mousedown: _vm.expmousedown,
      mouseover: _vm.expmouseover,
      mouseleave: _vm.expmouseleave
    }
  }, [_vm._v("\n        ᐳ\n    ")]) : _vm._e(), _vm._v(" "), _vm.show_exp_list ? _c("item-list", {
    attrs: {
      config: _vm.config,
      items: _vm.data.items,
      colors: _vm.colors,
      dc: _vm.dc
    },
    on: {
      "close-list": _vm.close_list,
      "item-selected": _vm.emit_selected_sub
    }
  }) : _vm._e()], 1);
};
var ToolbarItemvue_type_template_id_24cfb58a_staticRenderFns = [];
ToolbarItemvue_type_template_id_24cfb58a_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/ToolbarItem.vue?vue&type=template&id=24cfb58a

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ItemList.vue?vue&type=template&id=428f7654
var ItemListvue_type_template_id_428f7654_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("div", {
    staticClass: "tvjs-item-list",
    style: _vm.list_style(),
    on: {
      mousedown: _vm.thismousedown
    }
  }, _vm._l(_vm.items, function (item) {
    return !item.hidden ? _c("div", {
      "class": _vm.item_class(item),
      style: _vm.item_style(item),
      on: {
        click: function click(e) {
          return _vm.item_click(e, item);
        }
      }
    }, [_c("div", {
      staticClass: "trading-vue-tbicon tvjs-pixelated",
      style: _vm.icon_style(item)
    }), _vm._v(" "), _c("div", [_vm._v(_vm._s(item.type))])]) : _vm._e();
  }), 0);
};
var ItemListvue_type_template_id_428f7654_staticRenderFns = [];
ItemListvue_type_template_id_428f7654_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/ItemList.vue?vue&type=template&id=428f7654

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ItemList.vue?vue&type=script&lang=js
/* harmony default export */ const ItemListvue_type_script_lang_js = ({
  name: 'ItemList',
  props: ['config', 'items', 'colors', 'dc'],
  mounted: function mounted() {
    window.addEventListener('mousedown', this.onmousedown);
  },
  beforeDestroy: function beforeDestroy() {
    window.removeEventListener('mousedown', this.onmousedown);
  },
  methods: {
    list_style: function list_style() {
      var conf = this.$props.config;
      var w = conf.TOOLBAR;
      var brd = this.colors.tbListBorder || this.colors.grid;
      var bstl = "1px solid ".concat(brd);
      return {
        left: "".concat(w, "px"),
        background: this.colors.back,
        borderTop: bstl,
        borderRight: bstl,
        borderBottom: bstl
      };
    },
    item_class: function item_class(item) {
      if (this.dc.tool === item.type) {
        return "tvjs-item-list-item selected-item";
      }
      return "tvjs-item-list-item";
    },
    item_style: function item_style(item) {
      var conf = this.$props.config;
      var h = conf.TB_ICON + conf.TB_ITEM_M * 2 + 8;
      var sel = this.dc.tool === item.type;
      return {
        height: "".concat(h, "px"),
        color: sel ? undefined : "#888888"
      };
    },
    icon_style: function icon_style(data) {
      var conf = this.$props.config;
      var br = conf.TB_ICON_BRI;
      var im = conf.TB_ITEM_M;
      return {
        'background-image': "url(".concat(data.icon, ")"),
        'width': '25px',
        'height': '25px',
        'margin': "".concat(im, "px"),
        'filter': "brightness(".concat(br, ")")
      };
    },
    item_click: function item_click(e, item) {
      e.cancelBubble = true;
      this.$emit('item-selected', item);
      this.$emit('close-list');
    },
    onmousedown: function onmousedown() {
      this.$emit('close-list');
    },
    thismousedown: function thismousedown(e) {
      e.stopPropagation();
    }
  },
  computed: {},
  data: function data() {
    return {};
  }
});
;// CONCATENATED MODULE: ./src/components/ItemList.vue?vue&type=script&lang=js
 /* harmony default export */ const components_ItemListvue_type_script_lang_js = (ItemListvue_type_script_lang_js); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ItemList.vue?vue&type=style&index=0&id=428f7654&prod&lang=css
var ItemListvue_type_style_index_0_id_428f7654_prod_lang_css = __webpack_require__(156);
;// CONCATENATED MODULE: ./src/components/ItemList.vue?vue&type=style&index=0&id=428f7654&prod&lang=css

;// CONCATENATED MODULE: ./src/components/ItemList.vue



;


/* normalize component */

var ItemList_component = normalizeComponent(
  components_ItemListvue_type_script_lang_js,
  ItemListvue_type_template_id_428f7654_render,
  ItemListvue_type_template_id_428f7654_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const ItemList = (ItemList_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ToolbarItem.vue?vue&type=script&lang=js


/* harmony default export */ const ToolbarItemvue_type_script_lang_js = ({
  name: 'ToolbarItem',
  props: ['data', 'selected', 'colors', 'tv_id', 'config', 'dc', 'subs'],
  components: {
    ItemList: ItemList
  },
  mounted: function mounted() {
    if (this.data.group) {
      var type = this.subs[this.data.group];
      var item = this.data.items.find(function (x) {
        return x.type === type;
      });
      if (item) this.sub_item = item;
    }
  },
  methods: {
    mousedown: function mousedown(e) {
      var _this = this;
      this.click_start = utils.now();
      this.click_id = setTimeout(function () {
        _this.show_exp_list = true;
      }, this.config.TB_ICON_HOLD);
    },
    expmouseover: function expmouseover() {
      this.exp_hover = true;
    },
    expmouseleave: function expmouseleave() {
      this.exp_hover = false;
    },
    expmousedown: function expmousedown(e) {
      if (this.show_exp_list) e.stopPropagation();
    },
    emit_selected: function emit_selected(src) {
      if (utils.now() - this.click_start > this.config.TB_ICON_HOLD) return;
      clearTimeout(this.click_id);
      //if (Utils.is_mobile && src === 'click') return
      // TODO: double firing
      if (!this.data.group) {
        this.$emit('item-selected', this.data);
      } else {
        var item = this.sub_item || this.data.items[0];
        this.$emit('item-selected', item);
      }
    },
    emit_selected_sub: function emit_selected_sub(item) {
      this.$emit('item-selected', item);
      this.sub_item = item;
    },
    exp_click: function exp_click(e) {
      if (!this.data.group) return;
      e.cancelBubble = true;
      this.show_exp_list = !this.show_exp_list;
    },
    close_list: function close_list() {
      this.show_exp_list = false;
    }
  },
  computed: {
    item_style: function item_style() {
      if (this.$props.data.type === 'System:Splitter') {
        return this.splitter;
      }
      var conf = this.$props.config;
      var im = conf.TB_ITEM_M;
      var m = (conf.TOOLBAR - conf.TB_ICON) * 0.5 - im;
      var s = conf.TB_ICON + im * 2;
      var b = this.exp_hover ? 0 : 3;
      return {
        'width': "".concat(s, "px"),
        'height': "".concat(s, "px"),
        'margin': "8px ".concat(m, "px 0px ").concat(m, "px"),
        'border-radius': "3px ".concat(b, "px ").concat(b, "px 3px")
      };
    },
    icon_style: function icon_style() {
      if (this.$props.data.type === 'System:Splitter') {
        return {};
      }
      var conf = this.$props.config;
      var br = conf.TB_ICON_BRI;
      var sz = conf.TB_ICON;
      var im = conf.TB_ITEM_M;
      var ic = this.sub_item ? this.sub_item.icon : this.$props.data.icon;
      return {
        'background-image': "url(".concat(ic, ")"),
        'width': "".concat(sz, "px"),
        'height': "".concat(sz, "px"),
        'margin': "".concat(im, "px"),
        'filter': "brightness(".concat(br, ")")
      };
    },
    exp_style: function exp_style() {
      var conf = this.$props.config;
      var im = conf.TB_ITEM_M;
      var s = conf.TB_ICON * 0.5 + im;
      var p = (conf.TOOLBAR - s * 2) / 4;
      return {
        padding: "".concat(s, "px ").concat(p, "px"),
        transform: this.show_exp_list ? "scale(-0.6, 1)" : "scaleX(0.6)"
      };
    },
    splitter: function splitter() {
      var conf = this.$props.config;
      var colors = this.$props.colors;
      var c = colors.grid;
      var im = conf.TB_ITEM_M;
      var m = (conf.TOOLBAR - conf.TB_ICON) * 0.5 - im;
      var s = conf.TB_ICON + im * 2;
      return {
        'width': "".concat(s, "px"),
        'height': '1px',
        'margin': "8px ".concat(m, "px 8px ").concat(m, "px"),
        'background-color': c
      };
    }
  },
  data: function data() {
    return {
      exp_hover: false,
      show_exp_list: false,
      sub_item: null
    };
  }
});
;// CONCATENATED MODULE: ./src/components/ToolbarItem.vue?vue&type=script&lang=js
 /* harmony default export */ const components_ToolbarItemvue_type_script_lang_js = (ToolbarItemvue_type_script_lang_js); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ToolbarItem.vue?vue&type=style&index=0&id=24cfb58a&prod&lang=css
var ToolbarItemvue_type_style_index_0_id_24cfb58a_prod_lang_css = __webpack_require__(608);
;// CONCATENATED MODULE: ./src/components/ToolbarItem.vue?vue&type=style&index=0&id=24cfb58a&prod&lang=css

;// CONCATENATED MODULE: ./src/components/ToolbarItem.vue



;


/* normalize component */

var ToolbarItem_component = normalizeComponent(
  components_ToolbarItemvue_type_script_lang_js,
  ToolbarItemvue_type_template_id_24cfb58a_render,
  ToolbarItemvue_type_template_id_24cfb58a_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const ToolbarItem = (ToolbarItem_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Toolbar.vue?vue&type=script&lang=js
function Toolbarvue_type_script_lang_js_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = Toolbarvue_type_script_lang_js_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function Toolbarvue_type_script_lang_js_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return Toolbarvue_type_script_lang_js_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return Toolbarvue_type_script_lang_js_arrayLikeToArray(o, minLen); }
function Toolbarvue_type_script_lang_js_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

/* harmony default export */ const Toolbarvue_type_script_lang_js = ({
  name: 'Toolbar',
  props: ['data', 'height', 'colors', 'tv_id', 'config'],
  components: {
    ToolbarItem: ToolbarItem
  },
  mounted: function mounted() {},
  methods: {
    selected: function selected(tool) {
      this.$emit('custom-event', {
        event: 'tool-selected',
        args: [tool.type]
      });
      if (tool.group) {
        // TODO: emit the sub map to DC (save)
        this.sub_map[tool.group] = tool.type;
      }
    },
    is_selected: function is_selected(tool) {
      var _this = this;
      if (tool.group) {
        return !!tool.items.find(function (x) {
          return x.type === _this.data.tool;
        });
      }
      return tool.type === this.data.tool;
    }
  },
  computed: {
    styles: function styles() {
      var colors = this.$props.colors;
      var b = this.$props.config.TB_BORDER;
      var w = this.$props.config.TOOLBAR - b;
      var c = colors.grid;
      var cb = colors.tbBack || colors.back;
      var brd = colors.tbBorder || colors.scale;
      var st = this.$props.config.TB_B_STYLE;
      return {
        'width': "".concat(w, "px"),
        'height': "".concat(this.$props.height - 3, "px"),
        'background-color': cb,
        'border-right': "".concat(b, "px ").concat(st, " ").concat(brd)
      };
    },
    groups: function groups() {
      var arr = [];
      var _iterator = Toolbarvue_type_script_lang_js_createForOfIteratorHelper(this.data.tools || []),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var tool = _step.value;
          if (!tool.group) {
            arr.push(tool);
            continue;
          }
          var g = arr.find(function (x) {
            return x.group === tool.group;
          });
          if (!g) {
            arr.push({
              group: tool.group,
              icon: tool.icon,
              items: [tool]
            });
          } else {
            g.items.push(tool);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return arr;
    }
  },
  watch: {
    data: {
      handler: function handler(n) {
        // For some reason Vue.js doesn't want to
        // update 'tools' automatically when new item
        // is pushed/removed. Yo, Vue, I herd you
        // you want more dirty tricks?
        if (n.tools) this.tool_count = n.tools.length;
      },
      deep: true
    }
  },
  data: function data() {
    return {
      tool_count: 0,
      sub_map: {}
    };
  }
});
;// CONCATENATED MODULE: ./src/components/Toolbar.vue?vue&type=script&lang=js
 /* harmony default export */ const components_Toolbarvue_type_script_lang_js = (Toolbarvue_type_script_lang_js); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Toolbar.vue?vue&type=style&index=0&id=1d908e28&prod&lang=css
var Toolbarvue_type_style_index_0_id_1d908e28_prod_lang_css = __webpack_require__(723);
;// CONCATENATED MODULE: ./src/components/Toolbar.vue?vue&type=style&index=0&id=1d908e28&prod&lang=css

;// CONCATENATED MODULE: ./src/components/Toolbar.vue



;


/* normalize component */

var Toolbar_component = normalizeComponent(
  components_Toolbarvue_type_script_lang_js,
  Toolbarvue_type_template_id_1d908e28_render,
  Toolbarvue_type_template_id_1d908e28_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Toolbar = (Toolbar_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Widgets.vue?vue&type=template&id=00dc0900
var Widgetsvue_type_template_id_00dc0900_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("div", {
    staticClass: "tvjs-widgets",
    style: {
      width: _vm.width + "px",
      height: _vm.height + "px"
    }
  }, _vm._l(Object.keys(_vm.map), function (id) {
    return _c(_vm.initw(id), {
      key: id,
      tag: "component",
      attrs: {
        id: id,
        main: _vm.map[id].ctrl,
        data: _vm.map[id].data,
        tv: _vm.tv,
        dc: _vm.dc
      }
    });
  }), 1);
};
var Widgetsvue_type_template_id_00dc0900_staticRenderFns = [];
Widgetsvue_type_template_id_00dc0900_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/Widgets.vue?vue&type=template&id=00dc0900

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Widgets.vue?vue&type=script&lang=js
/* harmony default export */ const Widgetsvue_type_script_lang_js = ({
  name: 'Widgets',
  props: ['width', 'height', 'map', 'tv', 'dc'],
  methods: {
    initw: function initw(id) {
      return this.$props.map[id].cls;
    }
  }
});
;// CONCATENATED MODULE: ./src/components/Widgets.vue?vue&type=script&lang=js
 /* harmony default export */ const components_Widgetsvue_type_script_lang_js = (Widgetsvue_type_script_lang_js); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Widgets.vue?vue&type=style&index=0&id=00dc0900&prod&lang=css
var Widgetsvue_type_style_index_0_id_00dc0900_prod_lang_css = __webpack_require__(787);
;// CONCATENATED MODULE: ./src/components/Widgets.vue?vue&type=style&index=0&id=00dc0900&prod&lang=css

;// CONCATENATED MODULE: ./src/components/Widgets.vue



;


/* normalize component */

var Widgets_component = normalizeComponent(
  components_Widgetsvue_type_script_lang_js,
  Widgetsvue_type_template_id_00dc0900_render,
  Widgetsvue_type_template_id_00dc0900_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Widgets = (Widgets_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/TheTip.vue?vue&type=template&id=66c58c8a
var TheTipvue_type_template_id_66c58c8a_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("div", {
    staticClass: "tvjs-the-tip",
    style: _vm.style,
    domProps: {
      innerHTML: _vm._s(_vm.data.text)
    },
    on: {
      mousedown: function mousedown($event) {
        return _vm.$emit("remove-me");
      }
    }
  });
};
var TheTipvue_type_template_id_66c58c8a_staticRenderFns = [];
TheTipvue_type_template_id_66c58c8a_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/TheTip.vue?vue&type=template&id=66c58c8a

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/TheTip.vue?vue&type=script&lang=js
/* harmony default export */ const TheTipvue_type_script_lang_js = ({
  name: 'TheTip',
  props: ['data'],
  mounted: function mounted() {
    var _this = this;
    setTimeout(function () {
      return _this.$emit('remove-me');
    }, 3000);
  },
  computed: {
    style: function style() {
      return {
        background: this.data.color
      };
    }
  }
});
;// CONCATENATED MODULE: ./src/components/TheTip.vue?vue&type=script&lang=js
 /* harmony default export */ const components_TheTipvue_type_script_lang_js = (TheTipvue_type_script_lang_js); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/TheTip.vue?vue&type=style&index=0&id=66c58c8a&prod&lang=css
var TheTipvue_type_style_index_0_id_66c58c8a_prod_lang_css = __webpack_require__(837);
;// CONCATENATED MODULE: ./src/components/TheTip.vue?vue&type=style&index=0&id=66c58c8a&prod&lang=css

;// CONCATENATED MODULE: ./src/components/TheTip.vue



;


/* normalize component */

var TheTip_component = normalizeComponent(
  components_TheTipvue_type_script_lang_js,
  TheTipvue_type_template_id_66c58c8a_render,
  TheTipvue_type_template_id_66c58c8a_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const TheTip = (TheTip_component.exports);
;// CONCATENATED MODULE: ./src/mixins/xcontrol.js
function xcontrol_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = xcontrol_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function xcontrol_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return xcontrol_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return xcontrol_arrayLikeToArray(o, minLen); }
function xcontrol_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
// extensions control

/* harmony default export */ const xcontrol = ({
  mounted: function mounted() {
    this.ctrllist();
    this.skin_styles();
  },
  methods: {
    // Build / rebuild component list
    ctrllist: function ctrllist() {
      this.ctrl_destroy();
      this.controllers = [];
      var _iterator = xcontrol_createForOfIteratorHelper(this.$props.extensions),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var x = _step.value;
          var name = x.Main.__name__;
          if (!this.xSettings[name]) {
            this.$set(this.xSettings, name, {});
          }
          var nc = new x.Main(this,
          // tv inst
          this.data,
          // dc
          this.xSettings[name] // settings
          );
          nc.name = name;
          this.controllers.push(nc);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return this.controllers;
    },
    // TODO: preventDefault
    pre_dc: function pre_dc(e) {
      var _iterator2 = xcontrol_createForOfIteratorHelper(this.controllers),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var ctrl = _step2.value;
          if (ctrl.update) {
            ctrl.update(e);
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    },
    post_dc: function post_dc(e) {
      var _iterator3 = xcontrol_createForOfIteratorHelper(this.controllers),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var ctrl = _step3.value;
          if (ctrl.post_update) {
            ctrl.post_update(e);
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    },
    ctrl_destroy: function ctrl_destroy() {
      var _iterator4 = xcontrol_createForOfIteratorHelper(this.controllers),
        _step4;
      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var ctrl = _step4.value;
          if (ctrl.destroy) ctrl.destroy();
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
    },
    skin_styles: function skin_styles() {
      var id = 'tvjs-skin-styles';
      var stbr = document.getElementById(id);
      if (stbr) {
        var parent = stbr.parentNode;
        parent.removeChild(stbr);
      }
      if (this.skin_proto && this.skin_proto.styles) {
        var sheet = document.createElement('style');
        sheet.setAttribute("id", id);
        sheet.innerHTML = this.skin_proto.styles;
        this.$el.appendChild(sheet);
      }
    }
  },
  computed: {
    ws: function ws() {
      var ws = {};
      var _iterator5 = xcontrol_createForOfIteratorHelper(this.controllers),
        _step5;
      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var ctrl = _step5.value;
          if (ctrl.widgets) {
            for (var id in ctrl.widgets) {
              ws[id] = ctrl.widgets[id];
              ws[id].ctrl = ctrl;
            }
          }
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }
      return ws;
    },
    skins: function skins() {
      var sks = {};
      var _iterator6 = xcontrol_createForOfIteratorHelper(this.$props.extensions),
        _step6;
      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var x = _step6.value;
          for (var id in x.skins || {}) {
            sks[id] = x.skins[id];
          }
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }
      return sks;
    },
    skin_proto: function skin_proto() {
      return this.skins[this.$props.skin];
    },
    colorpack: function colorpack() {
      var sel = this.skins[this.$props.skin];
      return sel ? sel.colors : undefined;
    }
  },
  watch: {
    // TODO: This is fast & dirty fix, need
    // to fix the actual reactivity problem
    skin: function skin(n, p) {
      if (n !== p) this.resetChart();
      this.skin_styles();
    },
    extensions: function extensions() {
      this.ctrllist();
    },
    xSettings: {
      handler: function handler(n, p) {
        var _iterator7 = xcontrol_createForOfIteratorHelper(this.controllers),
          _step7;
        try {
          for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
            var ctrl = _step7.value;
            if (ctrl.onsettings) {
              ctrl.onsettings(n, p);
            }
          }
        } catch (err) {
          _iterator7.e(err);
        } finally {
          _iterator7.f();
        }
      },
      deep: true
    }
  },
  data: function data() {
    return {
      controllers: []
    };
  }
});
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/TradingVue.vue?vue&type=script&lang=js

function TradingVuevue_type_script_lang_js_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = TradingVuevue_type_script_lang_js_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function TradingVuevue_type_script_lang_js_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return TradingVuevue_type_script_lang_js_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return TradingVuevue_type_script_lang_js_arrayLikeToArray(o, minLen); }
function TradingVuevue_type_script_lang_js_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }






/* harmony default export */ const TradingVuevue_type_script_lang_js = ({
  name: 'TradingVue',
  components: {
    Chart: Chart,
    Toolbar: Toolbar,
    Widgets: Widgets,
    TheTip: TheTip
  },
  mixins: [xcontrol],
  props: {
    titleTxt: {
      type: String,
      "default": 'TradingVue.js'
    },
    id: {
      type: String,
      "default": 'trading-vue-js'
    },
    width: {
      type: Number,
      "default": 800
    },
    height: {
      type: Number,
      "default": 421
    },
    colorTitle: {
      type: String,
      "default": '#42b883'
    },
    colorBack: {
      type: String,
      "default": '#121826'
    },
    colorGrid: {
      type: String,
      "default": '#2f3240'
    },
    colorText: {
      type: String,
      "default": '#dedddd'
    },
    colorTextHL: {
      type: String,
      "default": '#fff'
    },
    colorScale: {
      type: String,
      "default": '#838383'
    },
    colorCross: {
      type: String,
      "default": '#8091a0'
    },
    colorCandleUp: {
      type: String,
      "default": '#23a776'
    },
    colorCandleDw: {
      type: String,
      "default": '#e54150'
    },
    colorWickUp: {
      type: String,
      "default": '#23a77688'
    },
    colorWickDw: {
      type: String,
      "default": '#e5415088'
    },
    colorWickSm: {
      type: String,
      "default": 'transparent' // deprecated
    },
    colorVolUp: {
      type: String,
      "default": '#79999e42'
    },
    colorVolDw: {
      type: String,
      "default": '#ef535042'
    },
    colorPanel: {
      type: String,
      "default": '#565c68'
    },
    colorTbBack: {
      type: String
    },
    colorTbBorder: {
      type: String,
      "default": '#8282827d'
    },
    colors: {
      type: Object
    },
    font: {
      type: String,
      "default": constants.ChartConfig.FONT
    },
    toolbar: {
      type: Boolean,
      "default": false
    },
    data: {
      type: Object,
      required: true
    },
    // Your overlay classes here
    overlays: {
      type: Array,
      "default": function _default() {
        return [];
      }
    },
    // Overwrites ChartConfig values,
    // see constants.js
    chartConfig: {
      type: Object,
      "default": function _default() {
        return {};
      }
    },
    legendButtons: {
      type: Array,
      "default": function _default() {
        return [];
      }
    },
    indexBased: {
      type: Boolean,
      "default": false
    },
    extensions: {
      type: Array,
      "default": function _default() {
        return [];
      }
    },
    xSettings: {
      type: Object,
      "default": function _default() {
        return {};
      }
    },
    skin: {
      type: String // Skin Name
    },
    timezone: {
      type: Number,
      "default": 0
    }
  },
  computed: {
    // Copy a subset of TradingVue props
    chart_props: function chart_props() {
      var offset = this.$props.toolbar ? this.chart_config.TOOLBAR : 0;
      var chart_props = {
        title_txt: this.$props.titleTxt,
        overlays: this.$props.overlays.concat(this.mod_ovs),
        data: this.decubed,
        width: this.$props.width - offset,
        height: this.$props.height,
        font: this.font_comp,
        buttons: this.$props.legendButtons,
        toolbar: this.$props.toolbar,
        ib: this.$props.indexBased || this.index_based || false,
        colors: Object.assign({}, this.$props.colors || this.colorpack),
        skin: this.skin_proto,
        timezone: this.$props.timezone
      };
      this.parse_colors(chart_props.colors);
      return chart_props;
    },
    chart_config: function chart_config() {
      return Object.assign({}, constants.ChartConfig, this.$props.chartConfig);
    },
    decubed: function decubed() {
      var data = this.$props.data;
      if (data.data !== undefined) {
        // DataCube detected
        data.init_tvjs(this);
        return data.data;
      } else {
        return data;
      }
    },
    index_based: function index_based() {
      var base = this.$props.data;
      if (base.chart) {
        return base.chart.indexBased;
      } else if (base.data) {
        return base.data.chart.indexBased;
      }
      return false;
    },
    mod_ovs: function mod_ovs() {
      var arr = [];
      var _iterator = TradingVuevue_type_script_lang_js_createForOfIteratorHelper(this.$props.extensions),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var x = _step.value;
          arr.push.apply(arr, _toConsumableArray(Object.values(x.overlays)));
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return arr;
    },
    font_comp: function font_comp() {
      return this.skin_proto && this.skin_proto.font ? this.skin_proto.font : this.font;
    }
  },
  data: function data() {
    return {
      reset: 0,
      tip: null
    };
  },
  beforeDestroy: function beforeDestroy() {
    this.custom_event({
      event: 'before-destroy'
    });
    this.ctrl_destroy();
  },
  methods: {
    // TODO: reset extensions?
    resetChart: function resetChart(resetRange) {
      var _this = this;
      if (resetRange === void 0) {
        resetRange = true;
      }
      this.reset++;
      var range = this.getRange();
      if (!resetRange && range[0] && range[1]) {
        this.$nextTick(function () {
          return _this.setRange.apply(_this, _toConsumableArray(range));
        });
      }
      this.$nextTick(function () {
        return _this.custom_event({
          event: 'chart-reset',
          args: []
        });
      });
    },
    "goto": function goto(t) {
      // TODO: limit goto & setRange (out of data error)
      if (this.chart_props.ib) {
        var ti_map = this.$refs.chart.ti_map;
        t = ti_map.gt2i(t, this.$refs.chart.ohlcv);
      }
      this.$refs.chart["goto"](t);
    },
    setRange: function setRange(t1, t2) {
      if (this.chart_props.ib) {
        var ti_map = this.$refs.chart.ti_map;
        var ohlcv = this.$refs.chart.ohlcv;
        t1 = ti_map.gt2i(t1, ohlcv);
        t2 = ti_map.gt2i(t2, ohlcv);
      }
      this.$refs.chart.setRange(t1, t2);
    },
    getRange: function getRange() {
      if (this.chart_props.ib) {
        var ti_map = this.$refs.chart.ti_map;
        // Time range => index range
        return this.$refs.chart.range.map(function (x) {
          return ti_map.i2t(x);
        });
      }
      return this.$refs.chart.range;
    },
    getCursor: function getCursor() {
      var cursor = this.$refs.chart.cursor;
      if (this.chart_props.ib) {
        var ti_map = this.$refs.chart.ti_map;
        var copy = Object.assign({}, cursor);
        copy.i = copy.t;
        copy.t = ti_map.i2t(copy.t);
        return copy;
      }
      return cursor;
    },
    showTheTip: function showTheTip(text, color) {
      if (color === void 0) {
        color = "orange";
      }
      this.tip = {
        text: text,
        color: color
      };
    },
    legend_button: function legend_button(event) {
      this.custom_event({
        event: 'legend-button-click',
        args: [event]
      });
    },
    custom_event: function custom_event(d) {
      if ('args' in d) {
        this.$emit.apply(this, [d.event].concat(_toConsumableArray(d.args)));
      } else {
        this.$emit(d.event);
      }
      var data = this.$props.data;
      var ctrl = this.controllers.length !== 0;
      if (ctrl) this.pre_dc(d);
      if (data.tv) {
        // If the data object is DataCube
        data.on_custom_event(d.event, d.args);
      }
      if (ctrl) this.post_dc(d);
    },
    range_changed: function range_changed(r) {
      if (this.chart_props.ib) {
        var ti_map = this.$refs.chart.ti_map;
        r = r.map(function (x) {
          return ti_map.i2t(x);
        });
      }
      this.$emit('range-changed', r);
      this.custom_event({
        event: 'range-changed',
        args: [r]
      });
      if (this.onrange) this.onrange(r);
    },
    set_loader: function set_loader(dc) {
      var _this2 = this;
      this.onrange = function (r) {
        var pf = _this2.chart_props.ib ? '_ms' : '';
        var tf = _this2.$refs.chart['interval' + pf];
        dc.range_changed(r, tf);
      };
    },
    parse_colors: function parse_colors(colors) {
      for (var k in this.$props) {
        if (k.indexOf('color') === 0 && k !== 'colors') {
          var k2 = k.replace('color', '');
          k2 = k2[0].toLowerCase() + k2.slice(1);
          if (colors[k2]) continue;
          colors[k2] = this.$props[k];
        }
      }
    },
    mousedown: function mousedown() {
      this.$refs.chart.activated = true;
    },
    mouseleave: function mouseleave() {
      this.$refs.chart.activated = false;
    }
  }
});
;// CONCATENATED MODULE: ./src/TradingVue.vue?vue&type=script&lang=js
 /* harmony default export */ const src_TradingVuevue_type_script_lang_js = (TradingVuevue_type_script_lang_js); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/TradingVue.vue?vue&type=style&index=0&id=d471edb6&prod&lang=css
var TradingVuevue_type_style_index_0_id_d471edb6_prod_lang_css = __webpack_require__(712);
;// CONCATENATED MODULE: ./src/TradingVue.vue?vue&type=style&index=0&id=d471edb6&prod&lang=css

;// CONCATENATED MODULE: ./src/TradingVue.vue



;


/* normalize component */

var TradingVue_component = normalizeComponent(
  src_TradingVuevue_type_script_lang_js,
  render,
  staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const TradingVue = (TradingVue_component.exports);
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}
function _asyncToGenerator(fn) {
  return function () {
    var self = this,
      args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }
      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }
      _next(undefined);
    });
  };
}
// EXTERNAL MODULE: ./node_modules/@babel/runtime/regenerator/index.js
var regenerator = __webpack_require__(756);
var regenerator_default = /*#__PURE__*/__webpack_require__.n(regenerator);
;// CONCATENATED MODULE: ./src/helpers/tmp/ww$$$.json
const ww$$$_namespaceObject = /*#__PURE__*/JSON.parse('["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"]');
// EXTERNAL MODULE: ./node_modules/lz-string/libs/lz-string.js
var lz_string = __webpack_require__(992);
var lz_string_default = /*#__PURE__*/__webpack_require__.n(lz_string);
;// CONCATENATED MODULE: ./src/helpers/script_ww_api.js




// Webworker interface

// Compiled webworker (see webpack/ww_plugin.js)



 // For webworker-loader to find the ww
var WebWork = /*#__PURE__*/function () {
  function WebWork(dc) {
    classCallCheck_classCallCheck(this, WebWork);
    this.dc = dc;
    this.tasks = {};
    this.onevent = function () {};
    this.start();
  }
  return createClass_createClass(WebWork, [{
    key: "start",
    value: function start() {
      var _this = this;
      if (this.worker) this.worker.terminate();
      // URL.createObjectURL
      window.URL = window.URL || window.webkitURL;
      var data = lz_string_default().decompressFromBase64(ww$$$_namespaceObject[0]);
      var blob;
      try {
        blob = new Blob([data], {
          type: 'application/javascript'
        });
      } catch (e) {
        // Backwards-compatibility
        window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
        blob = new BlobBuilder();
        blob.append(data);
        blob = blob.getBlob();
      }
      this.worker = new Worker(URL.createObjectURL(blob));
      this.worker.onmessage = function (e) {
        return _this.onmessage(e);
      };
    }
  }, {
    key: "start_socket",
    value: function start_socket() {
      var _this2 = this;
      if (!this.dc.sett.node_url) return;
      this.socket = new WebSocket(this.dc.sett.node_url);
      this.socket.addEventListener('message', function (e) {
        _this2.onmessage({
          data: JSON.parse(e.data)
        });
      });
      this.msg_queue = [];
    }
  }, {
    key: "send",
    value: function send(msg, tx_keys) {
      if (this.dc.sett.node_url) {
        return this.send_node(msg, tx_keys);
      }
      if (tx_keys) {
        var tx_objs = tx_keys.map(function (k) {
          return msg.data[k];
        });
        this.worker.postMessage(msg, tx_objs);
      } else {
        this.worker.postMessage(msg);
      }
    }

    // Send to node.js via websocket
  }, {
    key: "send_node",
    value: function send_node(msg, tx_keys) {
      if (!this.socket) this.start_socket();
      if (this.socket && this.socket.readyState) {
        // Send the old messages first
        while (this.msg_queue.length) {
          var m = this.msg_queue.shift();
          this.socket.send(JSON.stringify(m));
        }
        this.socket.send(JSON.stringify(msg));
      } else {
        this.msg_queue.push(msg);
      }
    }
  }, {
    key: "onmessage",
    value: function onmessage(e) {
      if (e.data.id in this.tasks) {
        this.tasks[e.data.id](e.data.data);
        delete this.tasks[e.data.id];
      } else {
        this.onevent(e);
      }
    }

    // Execute a task
  }, {
    key: "exec",
    value: function () {
      var _exec = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee(type, data, tx_keys) {
        var _this3 = this;
        return regenerator_default().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt("return", new Promise(function (rs, rj) {
                var id = utils.uuid();
                _this3.send({
                  type: type,
                  id: id,
                  data: data
                }, tx_keys);
                _this3.tasks[id] = function (res) {
                  rs(res);
                };
              }));
            case 1:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }));
      function exec(_x, _x2, _x3) {
        return _exec.apply(this, arguments);
      }
      return exec;
    }() // Execute a task, but just fucking do it,
    // do not wait for the result
  }, {
    key: "just",
    value: function just(type, data, tx_keys) {
      var id = utils.uuid();
      this.send({
        type: type,
        id: id,
        data: data
      }, tx_keys);
    }

    // Relay an event from iframe postMessage
    // (for the future)
  }, {
    key: "relay",
    value: function () {
      var _relay = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee2(event, just) {
        var _this4 = this;
        return regenerator_default().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              if (just === void 0) {
                just = false;
              }
              return _context2.abrupt("return", new Promise(function (rs, rj) {
                _this4.send(event, event.tx_keys);
                if (!just) {
                  _this4.tasks[event.id] = function (res) {
                    rs(res);
                  };
                }
              }));
            case 2:
            case "end":
              return _context2.stop();
          }
        }, _callee2);
      }));
      function relay(_x4, _x5) {
        return _relay.apply(this, arguments);
      }
      return relay;
    }()
  }, {
    key: "destroy",
    value: function destroy() {
      if (this.worker) this.worker.terminate();
    }
  }]);
}();
/* harmony default export */ const script_ww_api = (WebWork);
;// CONCATENATED MODULE: ./src/helpers/script_utils.js


var FDEFS = /(function |)([$A-Z_][0-9A-Z_$\.]*)[\s]*?\((.*?)\)/gmi;
var SBRACKETS = /([$A-Z_][0-9A-Z_$\.]*)[\s]*?\[([^"^\[^\]]+?)\]/gmi;
var TFSTR = /(\d+)(\w*)/gm;
var BUF_INC = 5;
var tf_cache = {};
function f_args(src) {
  FDEFS.lastIndex = 0;
  var m = FDEFS.exec(src);
  if (m) {
    var fkeyword = m[1].trim();
    var fname = m[2].trim();
    var fargs = m[3].trim();
    return fargs.split(',').map(function (x) {
      return x.trim();
    });
  }
  return [];
}
function f_body(src) {
  return src.slice(src.indexOf("{") + 1, src.lastIndexOf("}"));
}
function wrap_idxs(src, pre) {
  if (pre === void 0) {
    pre = '';
  }
  SBRACKETS.lastIndex = 0;
  var changed = false;
  do {
    var m = SBRACKETS.exec(src);
    if (m) {
      var vname = m[1].trim();
      var vindex = m[2].trim();
      if (vindex === '0' || parseInt(vindex) < BUF_INC) {
        continue;
      }
      switch (vname) {
        case 'let':
        case 'var':
        case 'return':
          continue;
      }

      //let wrap = `${pre}_v(${vname}, ${vindex})[${vindex}]`
      var wrap = "".concat(vname, "[").concat(pre, "_i(").concat(vindex, ", ").concat(vname, ")]");
      src = src.replace(m[0], wrap);
      changed = true;
    }
  } while (m);
  return changed ? src : src;
}

// Get all module helper classes
function make_module_lib(mod) {
  var lib = {};
  for (var k in mod) {
    if (k === 'main' || k === 'id') continue;
    var a = f_args(mod[k]);
    lib[k] = new Function(a, f_body(mod[k]));
  }
  return lib;
}
function get_raw_src(f) {
  if (typeof f === 'string') return f;
  var src = f.toString();
  return src.slice(src.indexOf("{") + 1, src.lastIndexOf("}"));
}

// Get tf in ms from pairs such (`15`, `m`)
function tf_from_pair(num, pf) {
  var mult = 1;
  switch (pf) {
    case 's':
      mult = Const.SECOND;
      break;
    case 'm':
      mult = Const.MINUTE;
      break;
    case 'H':
      mult = Const.HOUR;
      break;
    case 'D':
      mult = Const.DAY;
      break;
    case 'W':
      mult = Const.WEEK;
      break;
    case 'M':
      mult = Const.MONTH;
      break;
    case 'Y':
      mult = Const.YEAR;
      break;
  }
  return parseInt(num) * mult;
}
function tf_from_str(str) {
  if (typeof str === 'number') return str;
  if (tf_cache[str]) return tf_cache[str];
  TFSTR.lastIndex = 0;
  var m = TFSTR.exec(str);
  if (m) {
    tf_cache[str] = tf_from_pair(m[1], m[2]);
    return tf_cache[str];
  }
  return undefined;
}
function get_fn_id(pre, id) {
  return pre + '-' + id.split('<-').pop();
}

// Apply filter for all new overlays
function ovf(obj, f) {
  var nw = {};
  for (var id in obj) {
    nw[id] = {};
    for (var k in obj[id]) {
      if (k === 'data') continue;
      nw[id][k] = obj[id][k];
    }
    nw[id].data = f(obj[id].data);
  }
  return nw;
}

// Return index of the next element in
// dataset (since t). Impl: simple binary search
// TODO: optimize (remember the penultimate
// iteration and start from there)
function nextt(data, t, ti) {
  if (ti === void 0) {
    ti = 0;
  }
  var i0 = 0;
  var iN = data.length - 1;
  while (i0 <= iN) {
    var mid = Math.floor((i0 + iN) / 2);
    if (data[mid][ti] === t) {
      return mid;
    } else if (data[mid][ti] < t) {
      i0 = mid + 1;
    } else {
      iN = mid - 1;
    }
  }
  return t < data[mid][ti] ? mid : mid + 1;
}

// Estimated size of datasets
function size_of_dss(data) {
  var bytes = 0;
  for (var id in data) {
    if (data[id].data && data[id].data[0]) {
      var s0 = size_of(data[id].data[0]);
      bytes += s0 * data[id].data.length;
    }
  }
  return bytes;
}

// Used to measure the size of dataset
function size_of(object) {
  var list = [],
    stack = [object],
    bytes = 0;
  while (stack.length) {
    var value = stack.pop();
    var type = _typeof(value);
    if (type === 'boolean') {
      bytes += 4;
    } else if (type === 'string') {
      bytes += value.length * 2;
    } else if (type === 'number') {
      bytes += 8;
    } else if (type === 'object' && list.indexOf(value) === -1) {
      list.push(value);
      for (var i in value) {
        stack.push(value[i]);
      }
    }
  }
  return bytes;
}

// Update onchart/offchart
function update(data, val) {
  var i = data.length - 1;
  var last = data[i];
  if (!last || val[0] > last[0]) {
    data.push(val);
  } else {
    data[i] = val;
  }
}
function script_utils_now() {
  return new Date().getTime();
}
;// CONCATENATED MODULE: ./src/helpers/dataset.js




function dataset_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = dataset_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function dataset_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return dataset_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return dataset_arrayLikeToArray(o, minLen); }
function dataset_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

// Dataset proxy between vuejs & WebWorker


var Dataset = /*#__PURE__*/function () {
  function Dataset(dc, desc) {
    classCallCheck_classCallCheck(this, Dataset);
    // TODO: dataset url arrow fn tells WW
    // to load the ds directly from web

    this.type = desc.type;
    this.id = desc.id;
    this.dc = dc;

    // Send the data to WW
    if (desc.data) {
      this.dc.ww.just('upload-data', _defineProperty({}, this.id, desc));
      // Remove the data from the descriptor
      delete desc.data;
    }
    var proto = Object.getPrototypeOf(this);
    Object.setPrototypeOf(desc, proto);
    Object.defineProperty(desc, 'dc', {
      get: function get() {
        return dc;
      }
    });
  }

  // Watch for the changes of descriptors
  return createClass_createClass(Dataset, [{
    key: "set",
    value:
    // Set data (overwrite the whole dataset)
    function set(data, exec) {
      if (exec === void 0) {
        exec = true;
      }
      this.dc.ww.just('dataset-op', {
        id: this.id,
        type: 'set',
        data: data,
        exec: exec
      });
    }

    // Update with new data (array of data points)
  }, {
    key: "update",
    value: function update(arr) {
      this.dc.ww.just('update-data', _defineProperty({}, this.id, arr));
    }

    // Send WW a chunk to merge. The merge algo
    // here is simpler than in DC. It just adds
    // data at the beginning or/and the end of ds
  }, {
    key: "merge",
    value: function merge(data, exec) {
      if (exec === void 0) {
        exec = true;
      }
      this.dc.ww.just('dataset-op', {
        id: this.id,
        type: 'mrg',
        data: data,
        exec: exec
      });
    }

    // Remove the ds from WW
  }, {
    key: "remove",
    value: function remove(exec) {
      if (exec === void 0) {
        exec = true;
      }
      this.dc.del("datasets.".concat(this.id));
      this.dc.ww.just('dataset-op', {
        id: this.id,
        type: 'del',
        exec: exec
      });
      delete this.dc.dss[this.id];
    }

    // Fetch data from WW
  }, {
    key: "data",
    value: function () {
      var _data = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee() {
        var ds;
        return regenerator_default().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return this.dc.ww.exec('get-dataset', this.id);
            case 2:
              ds = _context.sent;
              if (ds) {
                _context.next = 5;
                break;
              }
              return _context.abrupt("return");
            case 5:
              return _context.abrupt("return", ds.data);
            case 6:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function data() {
        return _data.apply(this, arguments);
      }
      return data;
    }()
  }], [{
    key: "watcher",
    value: function watcher(n, p) {
      var nids = n.map(function (x) {
        return x.id;
      });
      var pids = p.map(function (x) {
        return x.id;
      });
      var _iterator = dataset_createForOfIteratorHelper(nids),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var id = _step.value;
          if (!pids.includes(id)) {
            var ds = n.filter(function (x) {
              return x.id === id;
            })[0];
            this.dss[id] = new Dataset(this, ds);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      var _iterator2 = dataset_createForOfIteratorHelper(pids),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var id = _step2.value;
          if (!nids.includes(id) && this.dss[id]) {
            this.dss[id].remove();
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }

    // Make an object for data transfer
  }, {
    key: "make_tx",
    value: function make_tx(dc, types) {
      var main = dc.data.chart.data;
      var base = {};
      if (types.find(function (x) {
        return x.type === 'OHLCV';
      })) {
        base = {
          ohlcv: main
        };
      }

      // TODO: add more sophisticated search
      // (using 'script.datasets' paramerter)
      /*for (var req of types) {
          let ds = Object.values(dc.dss || {})
              .find(x => x.type === req.type)
          if (ds && ds.data) {
              base[ds.id] = {
                  id: ds.id,
                  type: ds.type,
                  data: ds.data
              }
          }
      }*/
      // TODO: Data request callback ?

      return base;
    }
  }]);
}(); // Dataset reciever (created on WW)

var DatasetWW = /*#__PURE__*/(/* unused pure expression or super */ null && (function () {
  function DatasetWW(id, data) {
    _classCallCheck(this, DatasetWW);
    this.last_upd = now();
    this.id = id;
    if (Array.isArray(data)) {
      // Regular array
      this.data = data;
      if (id === 'ohlcv') this.type = 'OHLCV';
    } else {
      // Dataset descriptor
      this.data = data.data;
      this.type = data.type;
    }
  }

  // Update from 'update-data' event
  // TODO: ds size limit (in MB / data points)
  return _createClass(DatasetWW, [{
    key: "merge",
    value: function merge(data) {
      var len = this.data.length;
      if (!len) {
        this.data = data;
        return;
      }
      var t0 = this.data[0][0];
      var tN = this.data[len - 1][0];
      var l = data.filter(function (x) {
        return x[0] < t0;
      });
      var r = data.filter(function (x) {
        return x[0] > tN;
      });
      this.data = l.concat(this.data, r);
    }

    // On dataset operation
  }, {
    key: "op",
    value: function op(se, _op) {
      this.last_upd = now();
      switch (_op.type) {
        case 'set':
          this.data = _op.data;
          se.recalc_size();
          break;
        case 'del':
          delete se.data[this.id];
          se.recalc_size();
          break;
        case 'mrg':
          this.merge(_op.data);
          se.recalc_size();
          break;
      }
    }
  }], [{
    key: "update_all",
    value: function update_all(se, data) {
      for (var k in data) {
        if (k === 'ohlcv') continue;
        var id = k.split('.')[1] || k;
        if (!se.data[id]) continue;
        var arr = se.data[id].data;
        var iN = arr.length - 1;
        var last = arr[iN];
        var _iterator3 = dataset_createForOfIteratorHelper(data[k]),
          _step3;
        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var dp = _step3.value;
            if (!last || dp[0] > last[0]) {
              arr.push(dp);
            }
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
        se.data[id].last_upd = now();
      }
    }
  }]);
}()));
;// CONCATENATED MODULE: ./src/helpers/dc_events.js




function dc_events_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = dc_events_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function dc_events_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return dc_events_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return dc_events_arrayLikeToArray(o, minLen); }
function dc_events_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
// DataCube event handlers





var DCEvents = /*#__PURE__*/function () {
  function DCEvents() {
    var _this = this;
    classCallCheck_classCallCheck(this, DCEvents);
    this.ww = new script_ww_api(this);

    // Listen to the web-worker events
    this.ww.onevent = function (e) {
      var _iterator = dc_events_createForOfIteratorHelper(_this.tv.controllers),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var ctrl = _step.value;
          if (ctrl.ww) ctrl.ww(e.data);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      switch (e.data.type) {
        case 'request-data':
          // TODO: DataTunnel class for smarter data transfer
          if (_this.ww._data_uploading) break;
          var data = Dataset.make_tx(_this, e.data.data);
          _this.send_meta_2_ww();
          _this.ww.just('upload-data', data);
          _this.ww._data_uploading = true;
          break;
        case 'overlay-data':
          _this.on_overlay_data(e.data.data);
          break;
        case 'overlay-update':
          _this.on_overlay_update(e.data.data);
          break;
        case 'data-uploaded':
          _this.ww._data_uploading = false;
          break;
        case 'engine-state':
          _this.se_state = Object.assign(_this.se_state || {}, e.data.data);
          break;
        case 'modify-overlay':
          _this.modify_overlay(e.data.data);
          break;
        case 'script-signal':
          _this.tv.$emit('signal', e.data.data);
          break;
      }
      var _iterator2 = dc_events_createForOfIteratorHelper(_this.tv.controllers),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var ctrl = _step2.value;
          if (ctrl.post_ww) ctrl.post_ww(e.data);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    };
  }

  // Called when overalay/tv emits 'custom-event'
  return createClass_createClass(DCEvents, [{
    key: "on_custom_event",
    value: function on_custom_event(event, args) {
      switch (event) {
        case 'register-tools':
          this.register_tools(args);
          break;
        case 'exec-script':
          this.exec_script(args);
          break;
        case 'exec-all-scripts':
          this.exec_all_scripts();
          break;
        case 'data-len-changed':
          this.data_changed(args);
          break;
        case 'tool-selected':
          if (!args[0]) break; // TODO: Quick fix, investigate
          if (args[0].split(':')[0] === 'System') {
            this.system_tool(args[0].split(':')[1]);
            break;
          }
          this.tv.$set(this.data, 'tool', args[0]);
          if (args[0] === 'Cursor') {
            this.drawing_mode_off();
          }
          break;
        case 'grid-mousedown':
          this.grid_mousedown(args);
          break;
        case 'drawing-mode-off':
          this.drawing_mode_off();
          break;
        case 'change-settings':
          this.change_settings(args);
          break;
        case 'range-changed':
          this.scripts_onrange.apply(this, _toConsumableArray(args));
          break;
        case 'scroll-lock':
          this.on_scroll_lock(args[0]);
          break;
        case 'object-selected':
          this.object_selected(args);
          break;
        case 'remove-tool':
          this.system_tool('Remove');
          break;
        case 'before-destroy':
          this.before_destroy();
          break;
      }
    }

    // Triggered when one or multiple settings are changed
    // We select only the changed ones & re-exec them on the
    // web worker
  }, {
    key: "on_settings",
    value: function on_settings(values, prev) {
      var _this2 = this;
      if (!this.sett.scripts) return;
      var delta = {};
      var changed = false;
      var _loop = function _loop() {
        var n = values[i];
        var arr = prev.filter(function (x) {
          return x.v === n.v;
        });
        if (!arr.length && n.p.settings.$props) {
          var id = n.p.settings.$uuid;
          if (utils.is_scr_props_upd(n, prev) && utils.delayed_exec(n.p)) {
            delta[id] = n.v;
            changed = true;
            _this2.tv.$set(n.p, 'loading', true);
          }
        }
      };
      for (var i = 0; i < values.length; i++) {
        _loop();
      }
      if (changed && Object.keys(delta).length) {
        var tf = this.tv.$refs.chart.interval_ms || this.data.chart.tf;
        var range = this.tv.getRange();
        this.ww.just('update-ov-settings', {
          delta: delta,
          tf: tf,
          range: range
        });
      }
    }

    // When the set of $uuids is changed
  }, {
    key: "on_ids_changed",
    value: function on_ids_changed(values, prev) {
      var rem = prev.filter(function (x) {
        return x !== undefined && !values.includes(x);
      });
      if (rem.length) {
        this.ww.just('remove-scripts', rem);
      }
    }

    // Combine all tools and their mods
  }, {
    key: "register_tools",
    value: function register_tools(tools) {
      var preset = {};
      var _iterator3 = dc_events_createForOfIteratorHelper(this.data.tools || []),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var tool = _step3.value;
          preset[tool.type] = tool;
          delete tool.type;
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      this.tv.$set(this.data, 'tools', []);
      var list = [{
        type: 'Cursor',
        icon: icons_namespaceObject["cursor.png"]
      }];
      var _iterator4 = dc_events_createForOfIteratorHelper(tools),
        _step4;
      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var tool = _step4.value;
          var proto = Object.assign({}, tool.info);
          var type = tool.info.type || 'Default';
          proto.type = "".concat(tool.use_for, ":").concat(type);
          this.merge_presets(proto, preset[tool.use_for]);
          this.merge_presets(proto, preset[proto.type]);
          delete proto.mods;
          list.push(proto);
          for (var mod in tool.info.mods) {
            var mp = Object.assign({}, proto);
            mp = Object.assign(mp, tool.info.mods[mod]);
            mp.type = "".concat(tool.use_for, ":").concat(mod);
            this.merge_presets(mp, preset[tool.use_for]);
            this.merge_presets(mp, preset[mp.type]);
            list.push(mp);
          }
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
      this.tv.$set(this.data, 'tools', list);
      this.tv.$set(this.data, 'tool', 'Cursor');
    }
  }, {
    key: "exec_script",
    value: function exec_script(args) {
      if (args.length && this.sett.scripts) {
        var obj = this.get_overlay(args[0]);
        if (!obj || obj.scripts === false) return;
        if (obj.script && obj.script.src) {
          args[0].src = obj.script.src; // opt, override the src
        }
        // Parse script props & get the values from the ov
        // TODO: remove unnecessary script initializations
        var s = obj.settings;
        var props = args[0].src.props || {};
        if (!s.$uuid) s.$uuid = "".concat(obj.type, "-").concat(utils.uuid2());
        args[0].uuid = s.$uuid;
        args[0].sett = s;
        for (var k in props || {}) {
          var proto = props[k];
          if (s[k] !== undefined) {
            proto.val = s[k]; // use the existing val
            continue;
          }
          if (proto.def === undefined) {
            // TODO: add support of info / errors to the legend
            console.error("Overlay ".concat(obj.id, ": script prop '").concat(k, "' ") + "doesn't have a default value");
            return;
          }
          s[k] = proto.val = proto.def; // set the default
        }
        // Remove old props (dropped by the current exec)
        if (s.$props) {
          for (var k in s) {
            if (s.$props.includes(k) && !(k in props)) {
              delete s[k];
            }
          }
        }
        s.$props = Object.keys(args[0].src.props || {});
        this.tv.$set(obj, 'loading', true);
        var tf = this.tv.$refs.chart.interval_ms || this.data.chart.tf;
        var range = this.tv.getRange();
        if (obj.script && obj.script.output != null) {
          args[0].output = obj.script.output;
        }
        this.ww.just('exec-script', {
          s: args[0],
          tf: tf,
          range: range
        });
      }
    }
  }, {
    key: "exec_all_scripts",
    value: function exec_all_scripts() {
      if (!this.sett.scripts) return;
      this.set_loading(true);
      var tf = this.tv.$refs.chart.interval_ms || this.data.chart.tf;
      var range = this.tv.getRange();
      this.ww.just('exec-all-scripts', {
        tf: tf,
        range: range
      });
    }
  }, {
    key: "scripts_onrange",
    value: function scripts_onrange(r) {
      if (!this.sett.scripts) return;
      var delta = {};
      this.get('.').forEach(function (v) {
        if (v.script && v.script.execOnRange && v.settings.$uuid) {
          // TODO: execInterrupt flag?
          if (utils.delayed_exec(v)) {
            delta[v.settings.$uuid] = v.settings;
          }
        }
      });
      if (Object.keys(delta).length) {
        var tf = this.tv.$refs.chart.interval_ms || this.data.chart.tf;
        var range = this.tv.getRange();
        this.ww.just('update-ov-settings', {
          delta: delta,
          tf: tf,
          range: range
        });
      }
    }

    // Overlay modification from WW
  }, {
    key: "modify_overlay",
    value: function modify_overlay(upd) {
      var obj = this.get_overlay(upd);
      if (obj) {
        for (var k in upd.fields || {}) {
          if (typeof_typeof(obj[k]) === 'object') {
            this.merge("".concat(upd.uuid, ".").concat(k), upd.fields[k]);
          } else {
            this.tv.$set(obj, k, upd.fields[k]);
          }
        }
      }
    }
  }, {
    key: "data_changed",
    value: function data_changed(args) {
      if (!this.sett.scripts) return;
      if (this.sett.data_change_exec === false) return;
      var main = this.data.chart.data;
      if (this.ww._data_uploading) return;
      if (!this.se_state.scripts) return;
      this.send_meta_2_ww();
      this.ww.just('upload-data', {
        ohlcv: main
      });
      this.ww._data_uploading = true;
      this.set_loading(true);
    }
  }, {
    key: "set_loading",
    value: function set_loading(flag) {
      var skrr = this.get('.').filter(function (x) {
        return x.settings.$props;
      });
      var _iterator5 = dc_events_createForOfIteratorHelper(skrr),
        _step5;
      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var s = _step5.value;
          this.merge("".concat(s.id), {
            loading: flag
          });
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }
    }
  }, {
    key: "send_meta_2_ww",
    value: function send_meta_2_ww() {
      var tf = this.tv.$refs.chart.interval_ms || this.data.chart.tf;
      var range = this.tv.getRange();
      this.ww.just('send-meta-info', {
        tf: tf,
        range: range
      });
    }
  }, {
    key: "merge_presets",
    value: function merge_presets(proto, preset) {
      if (!preset) return;
      for (var k in preset) {
        if (k === 'settings') {
          Object.assign(proto[k], preset[k]);
        } else {
          proto[k] = preset[k];
        }
      }
    }
  }, {
    key: "grid_mousedown",
    value: function grid_mousedown(args) {
      var _this3 = this;
      // TODO: tool state finished?
      this.object_selected([]);
      // Remove the previous RangeTool
      var rem = function rem() {
        return _this3.get('RangeTool').filter(function (x) {
          return x.settings.shiftMode;
        }).forEach(function (x) {
          return _this3.del(x.id);
        });
      };
      if (this.data.tool && this.data.tool !== 'Cursor' && !this.data.drawingMode) {
        // Prevent from "null" tools (tool created with HODL)
        if (args[1].type !== 'tap') {
          this.tv.$set(this.data, 'drawingMode', true);
          this.build_tool(args[0]);
        } else {
          this.tv.showTheTip("<b>Hodl</b>+<b>Drug</b> to create, " + "<b>Tap</b> to finish a tool");
        }
      } else if (this.sett.shift_measure && args[1].shiftKey) {
        rem();
        this.tv.$nextTick(function () {
          return _this3.build_tool(args[0], 'RangeTool:ShiftMode');
        });
      } else {
        rem();
      }
    }
  }, {
    key: "drawing_mode_off",
    value: function drawing_mode_off() {
      this.tv.$set(this.data, 'drawingMode', false);
      this.tv.$set(this.data, 'tool', 'Cursor');
    }

    // Place a new tool
  }, {
    key: "build_tool",
    value: function build_tool(grid_id, type) {
      var list = this.data.tools;
      type = type || this.data.tool;
      var proto = list.find(function (x) {
        return x.type === type;
      });
      if (!proto) return;
      var sett = Object.assign({}, proto.settings || {});
      var data = (proto.data || []).slice();
      if (!('legend' in sett)) sett.legend = false;
      if (!('z-index' in sett)) sett['z-index'] = 100;
      sett.$selected = true;
      sett.$state = 'wip';
      var side = grid_id ? 'offchart' : 'onchart';
      var id = this.add(side, {
        name: proto.name,
        type: type.split(':')[0],
        settings: sett,
        data: data,
        grid: {
          id: grid_id
        }
      });
      sett.$uuid = "".concat(id, "-").concat(utils.now());
      this.tv.$set(this.data, 'selected', sett.$uuid);
      this.add_trash_icon();
    }

    // Remove selected / Remove all, etc
  }, {
    key: "system_tool",
    value: function system_tool(type) {
      switch (type) {
        case 'Remove':
          if (this.data.selected) {
            this.del(this.data.selected);
            this.remove_trash_icon();
            this.drawing_mode_off();
            this.on_scroll_lock(false);
          }
          break;
      }
    }

    // Apply new overlay settings
  }, {
    key: "change_settings",
    value: function change_settings(args) {
      var settings = args[0];
      delete settings.id;
      var grid_id = args[1];
      this.merge("".concat(args[3], ".settings"), settings);
    }

    // Lock the scrolling mechanism
  }, {
    key: "on_scroll_lock",
    value: function on_scroll_lock(flag) {
      this.tv.$set(this.data, 'scrollLock', flag);
    }

    // When new object is selected / unselected
  }, {
    key: "object_selected",
    value: function object_selected(args) {
      var q = this.data.selected;
      if (q) {
        // Check if current drawing is finished
        //let res = this.get_one(`${q}.settings`)
        //if (res && res.$state !== 'finished') return
        this.merge("".concat(q, ".settings"), {
          $selected: false
        });
        this.remove_trash_icon();
      }
      this.tv.$set(this.data, 'selected', null);
      if (!args.length) return;
      this.tv.$set(this.data, 'selected', args[2]);
      this.merge("".concat(args[2], ".settings"), {
        $selected: true
      });
      this.add_trash_icon();
    }
  }, {
    key: "add_trash_icon",
    value: function add_trash_icon() {
      var type = 'System:Remove';
      if (this.data.tools.find(function (x) {
        return x.type === type;
      })) {
        return;
      }
      this.data.tools.push({
        type: type,
        icon: icons_namespaceObject["trash.png"]
      });
    }
  }, {
    key: "remove_trash_icon",
    value: function remove_trash_icon() {
      // TODO: Does not call Toolbar render (distr version)
      var type = 'System:Remove';
      utils.overwrite(this.data.tools, this.data.tools.filter(function (x) {
        return x.type !== type;
      }));
    }

    // Set overlay data from the web-worker
  }, {
    key: "on_overlay_data",
    value: function on_overlay_data(data) {
      var _this4 = this;
      this.get('.').forEach(function (x) {
        if (x.settings.$synth) _this4.del("".concat(x.id));
      });
      var _iterator6 = dc_events_createForOfIteratorHelper(data),
        _step6;
      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var ov = _step6.value;
          var obj = this.get_one("".concat(ov.id));
          if (obj) {
            this.tv.$set(obj, 'loading', false);
            if (!ov.data) continue;
            obj.data = ov.data;
          }
          if (!ov.new_ovs) continue;
          for (var id in ov.new_ovs.onchart) {
            if (!this.get_one("onchart.".concat(id))) {
              this.add('onchart', ov.new_ovs.onchart[id]);
            }
          }
          for (var id in ov.new_ovs.offchart) {
            if (!this.get_one("offchart.".concat(id))) {
              this.add('offchart', ov.new_ovs.offchart[id]);
            }
          }
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }
    }

    // Push overlay updates from the web-worker
  }, {
    key: "on_overlay_update",
    value: function on_overlay_update(data) {
      var _iterator7 = dc_events_createForOfIteratorHelper(data),
        _step7;
      try {
        for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
          var ov = _step7.value;
          if (!ov.data) continue;
          var obj = this.get_one("".concat(ov.id));
          if (obj) {
            this.fast_merge(obj.data, ov.data, false);
          }
        }
      } catch (err) {
        _iterator7.e(err);
      } finally {
        _iterator7.f();
      }
    }

    // Clean-up unfinished business (tools)
  }, {
    key: "before_destroy",
    value: function before_destroy() {
      var f = function f(x) {
        return !x.settings.$state || x.settings.$state === 'finished';
      };
      this.data.onchart = this.data.onchart.filter(f);
      this.data.offchart = this.data.offchart.filter(f);
      this.drawing_mode_off();
      this.on_scroll_lock(false);
      this.object_selected([]);
      this.ww.destroy();
    }

    // Get overlay by grid-layer id
  }, {
    key: "get_overlay",
    value: function get_overlay(obj) {
      var id = obj.id || "g".concat(obj.grid_id, "_").concat(obj.layer_id);
      var dcid = obj.uuid || this.gldc[id];
      return this.get_one("".concat(dcid));
    }
  }]);
}();

;// CONCATENATED MODULE: ./src/helpers/dc_core.js








function dc_core_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = dc_core_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function dc_core_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return dc_core_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return dc_core_arrayLikeToArray(o, minLen); }
function dc_core_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function dc_core_callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, dc_core_isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function dc_core_isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (dc_core_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
// DataCube "private" methods




var DCCore = /*#__PURE__*/function (_DCEvents) {
  function DCCore() {
    classCallCheck_classCallCheck(this, DCCore);
    return dc_core_callSuper(this, DCCore, arguments);
  }
  _inherits(DCCore, _DCEvents);
  return createClass_createClass(DCCore, [{
    key: "init_tvjs",
    value:
    // Set TV instance (once). Called by TradingVue itself
    function init_tvjs($root) {
      var _this = this;
      if (!this.tv) {
        this.tv = $root;
        this.init_data();
        this.update_ids();

        // Listen to all setting changes
        // TODO: works only with merge()
        this.tv.$watch(function () {
          return _this.get_by_query('.settings');
        }, function (n, p) {
          return _this.on_settings(n, p);
        });

        // Listen to all indices changes
        this.tv.$watch(function () {
          return _this.get('.').map(function (x) {
            return x.settings.$uuid;
          });
        }, function (n, p) {
          return _this.on_ids_changed(n, p);
        });

        // Watch for all 'datasets' changes
        this.tv.$watch(function () {
          return _this.get('datasets');
        }, Dataset.watcher.bind(this));
      }
    }

    // Init Data Structure v1.1
  }, {
    key: "init_data",
    value: function init_data($root) {
      if (!('chart' in this.data)) {
        this.tv.$set(this.data, 'chart', {
          type: 'Candles',
          data: this.data.ohlcv || []
        });
      }
      if (!('onchart' in this.data)) {
        this.tv.$set(this.data, 'onchart', []);
      }
      if (!('offchart' in this.data)) {
        this.tv.$set(this.data, 'offchart', []);
      }
      if (!this.data.chart.settings) {
        this.tv.$set(this.data.chart, 'settings', {});
      }

      // Remove ohlcv cuz we have Data v1.1^
      delete this.data.ohlcv;
      if (!('datasets' in this.data)) {
        this.tv.$set(this.data, 'datasets', []);
      }

      // Init dataset proxies
      var _iterator = dc_core_createForOfIteratorHelper(this.data.datasets),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var ds = _step.value;
          if (!this.dss) this.dss = {};
          this.dss[ds.id] = new Dataset(this, ds);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }

    // Range change callback (called by TradingVue)
    // TODO: improve (reliablity + chunk with limited size)
  }, {
    key: "range_changed",
    value: function () {
      var _range_changed = _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee(range, tf, check) {
        var _this2 = this;
        var first, prom;
        return regenerator_default().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              if (check === void 0) {
                check = false;
              }
              if (this.loader) {
                _context.next = 3;
                break;
              }
              return _context.abrupt("return");
            case 3:
              if (this.loading) {
                _context.next = 19;
                break;
              }
              first = this.data.chart.data[0][0];
              if (!(range[0] < first)) {
                _context.next = 19;
                break;
              }
              this.loading = true;
              _context.next = 9;
              return utils.pause(250);
            case 9:
              // Load bigger chunks
              range = range.slice(); // copy
              range[0] = Math.floor(range[0]);
              range[1] = Math.floor(first);
              prom = this.loader(range, tf, function (d) {
                // Callback way
                _this2.chunk_loaded(d);
              });
              if (!(prom && prom.then)) {
                _context.next = 19;
                break;
              }
              _context.t0 = this;
              _context.next = 17;
              return prom;
            case 17:
              _context.t1 = _context.sent;
              _context.t0.chunk_loaded.call(_context.t0, _context.t1);
            case 19:
              if (!check) this.last_chunk = [range, tf];
            case 20:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function range_changed(_x, _x2, _x3) {
        return _range_changed.apply(this, arguments);
      }
      return range_changed;
    }() // A new chunk of data is loaded
    // TODO: bulletproof fetch
  }, {
    key: "chunk_loaded",
    value: function chunk_loaded(data) {
      // Updates only candlestick data, or
      if (Array.isArray(data)) {
        this.merge('chart.data', data);
      } else {
        // Bunch of overlays, including chart.data
        for (var k in data) {
          this.merge(k, data[k]);
        }
      }
      this.loading = false;
      if (this.last_chunk) {
        this.range_changed.apply(this, _toConsumableArray(this.last_chunk).concat([true]));
        this.last_chunk = null;
      }
    }

    // Update ids for all overlays
  }, {
    key: "update_ids",
    value: function update_ids() {
      this.data.chart.id = "chart.".concat(this.data.chart.type);
      var count = {};
      // grid_id,layer_id => DC id mapping
      this.gldc = {}, this.dcgl = {};
      var _iterator2 = dc_core_createForOfIteratorHelper(this.data.onchart),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var ov = _step2.value;
          if (count[ov.type] === undefined) {
            count[ov.type] = 0;
          }
          var i = count[ov.type]++;
          ov.id = "onchart.".concat(ov.type).concat(i);
          if (!ov.name) ov.name = ov.type + " ".concat(i);
          if (!ov.settings) this.tv.$set(ov, 'settings', {});

          // grid_id,layer_id => DC id mapping
          this.gldc["g0_".concat(ov.type, "_").concat(i)] = ov.id;
          this.dcgl[ov.id] = "g0_".concat(ov.type, "_").concat(i);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      count = {};
      var grids = [{}];
      var gid = 0;
      var _iterator3 = dc_core_createForOfIteratorHelper(this.data.offchart),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var ov = _step3.value;
          if (count[ov.type] === undefined) {
            count[ov.type] = 0;
          }
          var _i = count[ov.type]++;
          ov.id = "offchart.".concat(ov.type).concat(_i);
          if (!ov.name) ov.name = ov.type + " ".concat(_i);
          if (!ov.settings) this.tv.$set(ov, 'settings', {});

          // grid_id,layer_id => DC id mapping
          gid++;
          var rgid = (ov.grid || {}).id || gid; // real grid_id
          // When we merge grid, skip ++
          if ((ov.grid || {}).id) gid--;
          if (!grids[rgid]) grids[rgid] = {};
          if (grids[rgid][ov.type] === undefined) {
            grids[rgid][ov.type] = 0;
          }
          var ri = grids[rgid][ov.type]++;
          this.gldc["g".concat(rgid, "_").concat(ov.type, "_").concat(ri)] = ov.id;
          this.dcgl[ov.id] = "g".concat(rgid, "_").concat(ov.type, "_").concat(ri);
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    }

    // TODO: chart refine (from the exchange chart)
  }, {
    key: "update_candle",
    value: function update_candle(data) {
      var ohlcv = this.data.chart.data;
      var last = ohlcv[ohlcv.length - 1];
      var candle = data['candle'];
      var tf = this.tv.$refs.chart.interval_ms;
      var t_next = last[0] + tf;
      var now = data.t || utils.now();
      var t = now >= t_next ? now - now % tf : last[0];

      // Update the entire candle
      if (candle.length >= 6) {
        t = candle[0];
      } else {
        candle = [t].concat(_toConsumableArray(candle));
      }
      this.agg.push('ohlcv', candle);
      this.update_overlays(data, t, tf);
      return t >= t_next;
    }
  }, {
    key: "update_tick",
    value: function update_tick(data) {
      var ohlcv = this.data.chart.data;
      var last = ohlcv[ohlcv.length - 1];
      var tick = data['price'];
      var volume = data['volume'] || 0;
      var tf = this.tv.$refs.chart.interval_ms;
      if (!tf) {
        return console.warn('Define the main timeframe');
      }
      var now = data.t || utils.now();
      if (!last) last = [now - now % tf];
      var t_next = last[0] + tf;
      var t = now >= t_next ? now - now % tf : last[0];
      if ((t >= t_next || !ohlcv.length) && tick !== undefined) {
        // And new zero-height candle
        var nc = [t, tick, tick, tick, tick, volume];
        this.agg.push('ohlcv', nc, tf);
        ohlcv.push(nc);
        this.scroll_to(t);
      } else if (tick !== undefined) {
        // Update an existing one
        // TODO: make a separate class Sampler
        last[2] = Math.max(tick, last[2]);
        last[3] = Math.min(tick, last[3]);
        last[4] = tick;
        last[5] += volume;
        this.agg.push('ohlcv', last, tf);
      }
      this.update_overlays(data, t, tf);
      return t >= t_next;
    }

    // Updates all overlays with given values.
  }, {
    key: "update_overlays",
    value: function update_overlays(data, t, tf) {
      for (var k in data) {
        if (k === 'price' || k === 'volume' || k === 'candle' || k === 't') {
          continue;
        }
        if (k.includes('datasets.')) {
          this.agg.push(k, data[k], tf);
          continue;
        }
        if (!Array.isArray(data[k])) {
          var val = [data[k]];
        } else {
          val = data[k];
        }
        if (!k.includes('.data')) k += '.data';
        this.agg.push(k, [t].concat(_toConsumableArray(val)), tf);
      }
    }

    // Returns array of objects matching query.
    // Object contains { parent, index, value }
    // TODO: query caching
  }, {
    key: "get_by_query",
    value: function get_by_query(query, chuck) {
      var tuple = query.split('.');
      switch (tuple[0]) {
        case 'chart':
          var result = this.chart_as_piv(tuple);
          break;
        case 'onchart':
        case 'offchart':
          result = this.query_search(query, tuple);
          break;
        case 'datasets':
          result = this.query_search(query, tuple);
          var _iterator4 = dc_core_createForOfIteratorHelper(result),
            _step4;
          try {
            for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
              var r = _step4.value;
              if (r.i === 'data') {
                r.v = this.dss[r.p.id].data();
              }
            }
          } catch (err) {
            _iterator4.e(err);
          } finally {
            _iterator4.f();
          }
          break;
        default:
          /* Should get('.') return also the chart? */
          /*let ch = this.chart_as_query([
              'chart',
              tuple[1]
          ])*/
          var on = this.query_search(query, ['onchart', tuple[0], tuple[1]]);
          var off = this.query_search(query, ['offchart', tuple[0], tuple[1]]);
          result = [].concat(_toConsumableArray(on), _toConsumableArray(off));
          break;
      }
      return result.filter(function (x) {
        return !(x.v || {}).locked || chuck;
      });
    }
  }, {
    key: "chart_as_piv",
    value: function chart_as_piv(tuple) {
      var field = tuple[1];
      if (field) return [{
        p: this.data.chart,
        i: field,
        v: this.data.chart[field]
      }];else return [{
        p: this.data,
        i: 'chart',
        v: this.data.chart
      }];
    }
  }, {
    key: "query_search",
    value: function query_search(query, tuple) {
      var _this3 = this;
      var side = tuple[0];
      var path = tuple[1] || '';
      var field = tuple[2];
      var arr = this.data[side].filter(function (x) {
        return x.id === query || x.id && x.id.includes(path) || x.name === query || x.name && x.name.includes(path) || query.includes((x.settings || {}).$uuid);
      });
      if (field) {
        return arr.map(function (x) {
          return {
            p: x,
            i: field,
            v: x[field]
          };
        });
      }
      return arr.map(function (x, i) {
        return {
          p: _this3.data[side],
          i: _this3.data[side].indexOf(x),
          v: x
        };
      });
    }
  }, {
    key: "merge_objects",
    value: function merge_objects(obj, data, new_obj) {
      if (new_obj === void 0) {
        new_obj = {};
      }
      // The only way to get Vue to update all stuff
      // reactively is to create a brand new object.
      // TODO: Is there a simpler approach?
      Object.assign(new_obj, obj.v);
      Object.assign(new_obj, data);
      this.tv.$set(obj.p, obj.i, new_obj);
    }

    // Merge overlapping time series
  }, {
    key: "merge_ts",
    value: function merge_ts(obj, data) {
      // Assume that both arrays are pre-sorted

      if (!data.length) return obj.v;
      var r1 = [obj.v[0][0], obj.v[obj.v.length - 1][0]];
      var r2 = [data[0][0], data[data.length - 1][0]];

      // Overlap
      var o = [Math.max(r1[0], r2[0]), Math.min(r1[1], r2[1])];
      if (o[1] >= o[0]) {
        var _obj$v, _data;
        var _this$ts_overlap = this.ts_overlap(obj.v, data, o),
          od = _this$ts_overlap.od,
          d1 = _this$ts_overlap.d1,
          d2 = _this$ts_overlap.d2;
        (_obj$v = obj.v).splice.apply(_obj$v, _toConsumableArray(d1));
        (_data = data).splice.apply(_data, _toConsumableArray(d2));

        // Dst === Overlap === Src
        if (!obj.v.length && !data.length) {
          this.tv.$set(obj.p, obj.i, od);
          return obj.v;
        }

        // If src is totally contained in dst
        if (!data.length) {
          data = obj.v.splice(d1[0]);
        }

        // If dst is totally contained in src
        if (!obj.v.length) {
          obj.v = data.splice(d2[0]);
        }
        this.tv.$set(obj.p, obj.i, this.combine(obj.v, od, data));
      } else {
        this.tv.$set(obj.p, obj.i, this.combine(obj.v, [], data));
      }
      return obj.v;
    }

    // TODO: review performance, move to worker
  }, {
    key: "ts_overlap",
    value: function ts_overlap(arr1, arr2, range) {
      var t1 = range[0];
      var t2 = range[1];
      var ts = {}; // timestamp map

      var a1 = arr1.filter(function (x) {
        return x[0] >= t1 && x[0] <= t2;
      });
      var a2 = arr2.filter(function (x) {
        return x[0] >= t1 && x[0] <= t2;
      });

      // Indices of segments
      var id11 = arr1.indexOf(a1[0]);
      var id12 = arr1.indexOf(a1[a1.length - 1]);
      var id21 = arr2.indexOf(a2[0]);
      var id22 = arr2.indexOf(a2[a2.length - 1]);
      for (var i = 0; i < a1.length; i++) {
        ts[a1[i][0]] = a1[i];
      }
      for (var i = 0; i < a2.length; i++) {
        ts[a2[i][0]] = a2[i];
      }
      var ts_sorted = Object.keys(ts).sort();
      return {
        od: ts_sorted.map(function (x) {
          return ts[x];
        }),
        d1: [id11, id12 - id11 + 1],
        d2: [id21, id22 - id21 + 1]
      };
    }

    // Combine parts together:
    // (destination, overlap, source)
  }, {
    key: "combine",
    value: function combine(dst, o, src) {
      function last(arr) {
        return arr[arr.length - 1][0];
      }
      if (!dst.length) {
        dst = o;
        o = [];
      }
      if (!src.length) {
        src = o;
        o = [];
      }

      // The overlap right in the middle
      if (src[0][0] >= dst[0][0] && last(src) <= last(dst)) {
        return Object.assign(dst, o);

        // The overlap is on the right
      } else if (last(src) > last(dst)) {
        // Psh(...) is faster but can overflow the stack
        if (o.length < 100000 && src.length < 100000) {
          var _dst;
          (_dst = dst).push.apply(_dst, _toConsumableArray(o).concat(_toConsumableArray(src)));
          return dst;
        } else {
          return dst.concat(o, src);
        }

        // The overlap is on the left
      } else if (src[0][0] < dst[0][0]) {
        // Push(...) is faster but can overflow the stack
        if (o.length < 100000 && src.length < 100000) {
          var _src;
          (_src = src).push.apply(_src, _toConsumableArray(o).concat(_toConsumableArray(dst)));
          return src;
        } else {
          return src.concat(o, dst);
        }
      } else {
        return [];
      }
    }

    // Simple data-point merge (faster)
  }, {
    key: "fast_merge",
    value: function fast_merge(data, point, main) {
      if (main === void 0) {
        main = true;
      }
      if (!data) return;
      var last_t = (data[data.length - 1] || [])[0];
      var upd_t = point[0];
      if (!data.length || upd_t > last_t) {
        data.push(point);
        if (main && this.sett.auto_scroll) {
          this.scroll_to(upd_t);
        }
      } else if (upd_t === last_t) {
        if (main) {
          this.tv.$set(data, data.length - 1, point);
        } else {
          data[data.length - 1] = point;
        }
      }
    }
  }, {
    key: "scroll_to",
    value: function scroll_to(t) {
      if (this.tv.$refs.chart.cursor.locked) return;
      var last = this.tv.$refs.chart.last_candle;
      if (!last) return;
      var tl = last[0];
      var d = this.tv.getRange()[1] - tl;
      if (d > 0) this.tv["goto"](t + d);
    }
  }]);
}(DCEvents);

;// CONCATENATED MODULE: ./src/helpers/sett_proxy.js
// Sends all dc.sett changes to the web-worker

/* harmony default export */ function sett_proxy(sett, ww) {
  var h = {
    get: function get(sett, k) {
      return sett[k];
    },
    set: function set(sett, k, v) {
      sett[k] = v;
      ww.just('update-dc-settings', sett);
      return true;
    }
  };
  ww.just('update-dc-settings', sett);
  return new Proxy(sett, h);
}
;// CONCATENATED MODULE: ./src/helpers/agg_tool.js


// Tick aggregation


var AggTool = /*#__PURE__*/function () {
  function AggTool(dc, _int) {
    if (_int === void 0) {
      _int = 100;
    }
    classCallCheck_classCallCheck(this, AggTool);
    this.symbols = {};
    this["int"] = _int; // Itarval in ms
    this.dc = dc;
    this.st_id = null;
    this.data_changed = false;
  }
  return createClass_createClass(AggTool, [{
    key: "push",
    value: function push(sym, upd, tf) {
      var _this = this;
      // Start auto updates
      if (!this.st_id) {
        this.st_id = setTimeout(function () {
          return _this.update();
        });
      }
      tf = parseInt(tf);
      var old = this.symbols[sym];
      var t = utils.now();
      var isds = sym.includes('datasets.');
      this.data_changed = true;
      if (!old) {
        this.symbols[sym] = {
          upd: upd,
          t: t,
          data: []
        };
      } else if (upd[0] >= old.upd[0] + tf && !isds) {
        // Refine the previous data point
        this.refine(sym, old.upd.slice());
        this.symbols[sym] = {
          upd: upd,
          t: t,
          data: []
        };
      } else {
        // Tick updates the current
        this.symbols[sym].upd = upd;
        this.symbols[sym].t = t;
      }
      if (isds) {
        this.symbols[sym].data.push(upd);
      }
    }
  }, {
    key: "update",
    value: function update() {
      var _this2 = this;
      var out = {};
      for (var sym in this.symbols) {
        var upd = this.symbols[sym].upd;
        switch (sym) {
          case 'ohlcv':
            var data = this.dc.data.chart.data;
            this.dc.fast_merge(data, upd);
            out.ohlcv = data.slice(-2);
            break;
          default:
            if (sym.includes('datasets.')) {
              this.update_ds(sym, out);
              continue;
            }
            var data = this.dc.get_one("".concat(sym));
            if (!data) continue;
            this.dc.fast_merge(data, upd, false);
            break;
        }
      }
      // TODO: fill gaps
      if (this.data_changed) {
        this.dc.ww.just('update-data', out);
        this.data_changed = false;
      }
      setTimeout(function () {
        return _this2.update();
      }, this["int"]);
    }
  }, {
    key: "refine",
    value: function refine(sym, upd) {
      if (sym === 'ohlcv') {
        var data = this.dc.data.chart.data;
        this.dc.fast_merge(data, upd);
      } else {
        var data = this.dc.get_one("".concat(sym));
        if (!data) return;
        this.dc.fast_merge(data, upd, false);
      }
    }
  }, {
    key: "update_ds",
    value: function update_ds(sym, out) {
      var data = this.symbols[sym].data;
      if (data.length) {
        out[sym] = data;
        this.symbols[sym].data = [];
      }
    }
  }, {
    key: "clear",
    value: function clear() {
      this.symbols = {};
    }
  }]);
}();

;// CONCATENATED MODULE: ./src/helpers/datacube.js






function datacube_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = datacube_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function datacube_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return datacube_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return datacube_arrayLikeToArray(o, minLen); }
function datacube_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function datacube_callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, datacube_isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function datacube_isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (datacube_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
// Main DataHelper class. A container for data,
// which works as a proxy and CRUD interface






// Interface methods. Private methods in dc_core.js
var DataCube = /*#__PURE__*/function (_DCCore) {
  function DataCube(data, sett) {
    var _this;
    if (data === void 0) {
      data = {};
    }
    if (sett === void 0) {
      sett = {};
    }
    classCallCheck_classCallCheck(this, DataCube);
    var def_sett = {
      aggregation: 100,
      // Update aggregation interval
      script_depth: 0,
      // 0 === Exec on all data
      auto_scroll: true,
      // Auto scroll to a new candle
      scripts: true,
      // Enable overlays scripts,
      ww_ram_limit: 0,
      // WebWorker RAM limit (MB)
      node_url: null,
      // Use node.js instead of WW
      shift_measure: true // Draw measurment shift+click
    };
    sett = Object.assign(def_sett, sett);
    _this = datacube_callSuper(this, DataCube);
    _this.sett = sett;
    _this.data = data;
    _this.sett = sett_proxy(sett, _this.ww);
    _this.agg = new AggTool(_this, sett.aggregation);
    _this.se_state = {};

    //this.agg.update = this.agg_update.bind(this)
    return _this;
  }

  // Add new overlay
  _inherits(DataCube, _DCCore);
  return createClass_createClass(DataCube, [{
    key: "add",
    value: function add(side, overlay) {
      if (side !== 'onchart' && side !== 'offchart' && side !== 'datasets') {
        return;
      }
      this.data[side].push(overlay);
      this.update_ids();
      return overlay.id;
    }

    // Get all objects matching the query
  }, {
    key: "get",
    value: function get(query) {
      return this.get_by_query(query).map(function (x) {
        return x.v;
      });
    }

    // Get first object matching the query
  }, {
    key: "get_one",
    value: function get_one(query) {
      return this.get_by_query(query).map(function (x) {
        return x.v;
      })[0];
    }

    // Set data (reactively)
  }, {
    key: "set",
    value: function set(query, data) {
      var objects = this.get_by_query(query);
      var _iterator = datacube_createForOfIteratorHelper(objects),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var obj = _step.value;
          var i = obj.i !== undefined ? obj.i : obj.p.indexOf(obj.v);
          if (i !== -1) {
            this.tv.$set(obj.p, i, data);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      this.update_ids();
    }

    // Merge object or array (reactively)
  }, {
    key: "merge",
    value: function merge(query, data) {
      var objects = this.get_by_query(query);
      var _iterator2 = datacube_createForOfIteratorHelper(objects),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var obj = _step2.value;
          if (Array.isArray(obj.v)) {
            if (!Array.isArray(data)) continue;
            // If array is a timeseries, merge it by timestamp
            // else merge by item index
            if (obj.v[0] && obj.v[0].length >= 2) {
              this.merge_ts(obj, data);
            } else {
              this.merge_objects(obj, data, []);
            }
          } else if (typeof_typeof(obj.v) === 'object') {
            this.merge_objects(obj, data);
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      this.update_ids();
    }

    // Remove an overlay by query (id/type/name/...)
  }, {
    key: "del",
    value: function del(query) {
      var objects = this.get_by_query(query);
      var _iterator3 = datacube_createForOfIteratorHelper(objects),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var obj = _step3.value;
          // Find current index of the field (if not defined)
          var i = typeof obj.i !== 'number' ? obj.i : obj.p.indexOf(obj.v);
          if (i !== -1) {
            this.tv.$delete(obj.p, i);
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      this.update_ids();
    }

    // Update/append data point, depending on timestamp
  }, {
    key: "update",
    value: function update(data) {
      if (data['candle']) {
        return this.update_candle(data);
      } else {
        return this.update_tick(data);
      }
    }

    // Lock overlays from being pulled by query_search
    // TODO: subject to review
  }, {
    key: "lock",
    value: function lock(query) {
      var objects = this.get_by_query(query);
      objects.forEach(function (x) {
        if (x.v && x.v.id && x.v.type) {
          x.v.locked = true;
        }
      });
    }

    // Unlock overlays from being pulled by query_search
    //
  }, {
    key: "unlock",
    value: function unlock(query) {
      var objects = this.get_by_query(query, true);
      objects.forEach(function (x) {
        if (x.v && x.v.id && x.v.type) {
          x.v.locked = false;
        }
      });
    }

    // Show indicator
  }, {
    key: "show",
    value: function show(query) {
      if (query === 'offchart' || query === 'onchart') {
        query += '.';
      } else if (query === '.') {
        query = '';
      }
      this.merge(query + '.settings', {
        display: true
      });
    }

    // Hide indicator
  }, {
    key: "hide",
    value: function hide(query) {
      if (query === 'offchart' || query === 'onchart') {
        query += '.';
      } else if (query === '.') {
        query = '';
      }
      this.merge(query + '.settings', {
        display: false
      });
    }

    // Set data loader callback
  }, {
    key: "onrange",
    value: function onrange(callback) {
      var _this2 = this;
      this.loader = callback;
      setTimeout(function () {
        return _this2.tv.set_loader(callback ? _this2 : null);
      }, 0);
    }
  }]);
}(DCCore);

;// CONCATENATED MODULE: ./src/mixins/interface.js
// Html interface, shown on top of the grid.
// Can be static (a tooltip) or interactive,
// e.g. a control panel.

/* harmony default export */ const mixins_interface = ({
  props: ['ux', 'updater', 'colors', 'wrapper'],
  mounted: function mounted() {
    this._$emit = this.$emit;
    this.$emit = this.custom_event;
    if (this.init) this.init();
  },
  methods: {
    close: function close() {
      this.$emit('custom-event', {
        event: 'close-interface',
        args: [this.$props.ux.uuid]
      });
    },
    // TODO: emit all the way to the uxlist
    // add apply the changes there
    modify: function modify(obj) {
      this.$emit('custom-event', {
        event: 'modify-interface',
        args: [this.$props.ux.uuid, obj]
      });
    },
    custom_event: function custom_event(event) {
      if (event.split(':')[0] === 'hook') return;
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      this._$emit('custom-event', {
        event: event,
        args: args
      });
    }
  },
  computed: {
    overlay: function overlay() {
      return this.$props.ux.overlay;
    },
    layout: function layout() {
      return this.overlay.layout;
    },
    uxr: function uxr() {
      return this.$props.ux;
    }
  },
  data: function data() {
    return {};
  }
});
;// CONCATENATED MODULE: ./src/index.js















var primitives = {
  Candle: CandleExt,
  Volbar: VolbarExt,
  Line: Line,
  Pin: Pin,
  Price: Price,
  Ray: Ray,
  Seg: Seg
};
TradingVue.install = function (Vue) {
  Vue.component(TradingVue.name, TradingVue);
};
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(TradingVue);
  window.TradingVueLib = {
    TradingVue: TradingVue,
    Overlay: overlay,
    Utils: utils,
    Constants: constants,
    Candle: CandleExt,
    Volbar: VolbarExt,
    layout_cnv: layout_cnv,
    layout_vol: layout_vol,
    DataCube: DataCube,
    Tool: tool,
    Interface: mixins_interface,
    primitives: primitives
  };
}
/* harmony default export */ const src = (TradingVue);

})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=trading-vue.js.map