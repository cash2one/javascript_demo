// global
window.Utils = window.Utils || {};

// dingtalkapi
;(function(root, $) {
    'use strict';

    /**
     * check dtjsapi
     */
    if (! 'dd' in window) {
        throw new Error('ddjsapi not available');
    }

    /**
     * HandlerStack
     */
    function HandlerStack() {
        this._state = null;
        this._flatState = null;
        this._stack = [];
        this._defaultOptions = {};
    }

    HandlerStack.prototype = {
        // wrap to normal optionss
        _wrap: function(name, callback, options) {
            if ($.isFunction(name)) {
                options = callback, callback = name, name = undefined;
            }
            if (! $.isFunction(callback)) {
                callback = new Function;
            }
            options = $.extend({}, this._defaultOptions, options || {});
            if (name) {
                options['name'] = name;
            }
            options['func'] = callback;
            return options;
        },
        // set a callback to stack
        set: function(name, callback, options) {
            var name,
                handler = this._wrap.apply(this, arguments);
            if (! $.trim(handler['name']).length) {
                throw new Error('handler.name needed');
            }
            name = handler['name'];
            this._state = name;
            this._stack[name] = handler;
        },
        // push a callback to stack
        push: function(name, callback, options) {
            var handler = this._wrap.apply(this, arguments);
            if (! this._stack.length) {
                this._flatState = this._state;
            }
            this._stack.push(handler);
            this._state = this._stack.length-1;
        },
        // pop stack
        pop: function() {
            if (this._stack.length) {
                this._stack.pop();
                this._state = this._stack.length-1;
                if (! this._stack.length) {
                    this._state = this._flatState;
                    this._flatState = null;
                }
            }
        },
        // replace callback by name, or topstack
        replace: function(name, callback, options) {
            var handler = this._wrap.apply(this, arguments);
            if ($.type(handler['name']) != 'undefined') {
                for (var i in this._stack) {
                    if (this._stack.hasOwnProperty(i)) {
                        var tmpHandler = this._stack[i];
                        if (tmpHandler['name'] == handler['name']) {
                            $.extend(tmpHandler, handler);
                        }
                    }
                }
            } else {
                if (this._stack.length) {
                    $.extend(this._stack[this._stack.length-1], handler);
                }
            }
        },
        // change current state
        stateTo: function(name) {
            this._state = name;
        },
        // get current handler
        currentHandler: function() {
            return this._stack[this._state];
        }
    };

    // DTApi namespace
    root.DTApi = root.DTApi || {};

    // MenuButton
    root.DTApi.MenuButton = root.DTApi.MenuButton || (function() {
        // menu stack
        var stack = new HandlerStack();
        stack._defaultOptions = {
            'show': true, // 默认展示菜单选项
            'control': true // 控制点击事件
        };

        // one menu handler
        function menuHandler() {
            var handler = stack.currentHandler();
            if (handler) {
                handler['func'].call(null);
            }
        };

        // update one menu
        function updateMenu() {
            var options;
            var handler = stack.currentHandler();
            if (handler) {
                if (handler['title']) {
                    dd.ready(function() {
                        dd.biz.navigation.setTitle({ title: handler['title'] });
                    });
                }
                options = { onSuccess: menuHandler };
                $.each(['show', 'text', 'control'], function(i, prop) {
                    if (handler.hasOwnProperty(prop)) {
                        options[prop] = handler[prop];
                    }
                });
            } else {
                // if no handler, hide defautl
                options = { show: false, control: false };
            }
            dd.ready(function() {
                dd.biz.navigation.setRight(options);
            });
        };

        var returnObj = {};
        $.each(['set', 'push', 'pop', 'stateTo'], function(i, method) {
            returnObj[method] = function() {
                stack[method].apply(stack, arguments);
                updateMenu();
            };
        });
        returnObj.reset = function() {
            dd.ready(function() {
                dd.biz.navigation.setRight({show: false, control: false});
            });
        };
        returnObj.start = function() {
            console.log('MenuButton start...');
        };
        return returnObj;
    })();

    // BackButton
    root.DTApi.BackButton = root.DTApi.BackButton || (function() {
        // back stack
        var stack = new HandlerStack();
        stack._defaultOptions = {
            'keep': false // 是否保持在栈中，直到手动出栈
        };

        // back handler
        function backHandler() {
            var handler;

            if (stack._stack.length) {
                handler = stack._stack[stack._stack.length-1];
                if (! handler['keep']) {
                    stack.pop();
                }
                handler['func'].call(null);
            } else {
                // default action, when stack empty
                // FIXME: can't trigger default action, i think, but ```history.back``` ?
                window.history.back();
            }
        };

        var returnObj = {};
        $.each(['push', 'pop', 'replace'], function(i, method) {
            returnObj[method] = stack[method].bind(stack);
        });
        // invoke back
        // FIXME: dd.biz.navigation.back ???
        returnObj.back = function() {
            return backHandler.call(null);
        };
        returnObj.reset = function() {
            dd.ready(function() {
                dd.biz.navigation.setLeft({control: false});
                document.removeEventListener('backbutton');
            });
        };
        // bind to dd backbutton
        returnObj.start = function() {
            dd.ready(function() {
                // if (dd.ios) {
                    dd.biz.navigation.setLeft({
                        control: true,
                        onSuccess: backHandler
                    });
                // } else {
                    document.addEventListener('backbutton', function(e) {
                        e.preventDefault();
                        backHandler();
                    });
                // }
            });
            console.log('BackButton start...');
        };
        return returnObj;
    })();
})(window.Utils, window.Zepto || window.jQuery);
