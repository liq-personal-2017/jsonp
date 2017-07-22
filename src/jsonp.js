(function (root,factory) {
    'use strict'
    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define('jsonp', factory)
    } else if (typeof exports === 'object') {
        exports = module.exports = factory()
    } else {
        root.jsonp = factory()
    }
})(this,function factory(global) {
    'use strict'
    var seed = new Date().valueOf();
    var count = 0;
    var slice = [].slice;
    function jsonp(opt) {
        var url = opt.url || null,
            data = opt.data || null,
            callback = opt.callback;
        if (url && callback) {
            return get(url, callback, data);
        }
    }
    function get(url, callback, data) {
        var script = document.createElement('script')
        var returnMethods = ['then', 'catch', 'always']
        var promiseMethods = returnMethods.reduce(function (promise, method) {
            promise[method] = function (callback) {
                promise[method] = callback
                return promise
            }
            return promise
        }, {})
        var callbackmethod = createCallbackMethod(promiseMethods,script)
        script.onerror = function (event) {
            promiseMethods.catch && promiseMethods.catch.apply(promiseMethods, [event]);
            clear(script, callbackmethod)
        }
        // script.onload = function () {

        // }
        script.src = makeUrl(url, callback, callbackmethod, data);
        document.body.appendChild(script)
        return promiseMethods;
    }

    function createCallbackMethod(promiseMethods, script) {
        var name = 'jsonp_callback_' + seed + '_' + count++;
        window[name] = function () {
            promiseMethods.then && promiseMethods.then.apply(promiseMethods, slice.call(arguments))
            clear(script, name);
        }
        return name;
    }

    function clear(script, name) {
        document.body.removeChild(script);
        delete window[name];
    }

    function makeUrl(url, callback, callbackmethod, data) {
        return url += [
            (url.indexOf('?') > -1 ? '&' : '?')
            , callback
            , '='
            , callbackmethod
            , data ? '&' + objectToQueryString(data) : ''
        ].join('')
    }

    function objectToQueryString(data) {
        return isObject(data) ? getQueryString(data) : data
    }

    function isObject(data) {
        return Object.prototype.toString.call(data) === '[object Object]'
    }

    function getQueryString(object) {
        return Object.keys(object).map(function (item) {
            return [encode(item), '=', encode(object[item])].join('')
        }).join('&')
    }
    function encode(str) {
        return encodeURIComponent(str);
    }
    return jsonp;
});