(function (window, document) {
    var w = window,
        doc = document;
    var Kodo = function (selector) {//调用该方法时会调用它的prototype中的init构造器生成一个对象返回
        return new Kodo.prototype.init(selector);
    };
    Kodo.prototype = {
        constructor: Kodo,
        length: 0,
        splice: new Array().splice,//相当于掉此处调用了数组的splice方法可以把kodo对象当作数组进行splice操作但是不会切割掉原型属性
        selector: '',
        init: function (selector) {
            if (!selector) {
                return this;
            }
            if (typeof selector == 'object') {//如果是 selector个对象
                var selector = [selector];//把对象放入数组中
                for (var i = 0; i < selector.length; i++) {
                    this[i] = selector[i];//把数组中的每个对象放入当前jquery对象中
                }
                this.length = selector.length;
                return this;//返回数组
            } else if (typeof selector == 'function') {//如果传入的是个函数
                Kodo.ready(selector);//调用ready方法
                return;
            }
            var selector = selector.trim();
            var elm;

            if (selector.charAt(0) == '#' && !selector.match('\\s')) {//表示选择器不为空
                selector = selector.substring(1);
                this.selector = selector;
                elm = document.getElementById(selector);

                this[0] = elm;
                this.length = 1;
                return this;
            } else {
                elm = document.querySelectorAll(selector);
                if (!elm.length) {
                    throw new Error('傻吊！ 你写的格式有问题 或者不存在该元素');
                }
                for (var i = 0; i < elm.length; i++) {
                    this[i] = elm[i];
                }

                this.selector = selector;
                this.length = elm.length;
                return this;
            }
        },
        css: function (attr, val) {//链式测试
            var kodo = new Array();
            for (var i = 0; i < this.length; i++) {
                if (typeof attr == 'string') {//如果传入的参数是字符串
                    if (arguments.length == 1) {//并且参数的长度为1 即只有一个参数 val没有传入
                        kodo[i] = getComputedStyle(this[0], null)[attr];//返回它们对应的style
                    }
                    this[i].style[attr] = val;//如果有两个参数 则给该属性赋值
                } else {//如果传入的第一个参数不是字符串
                    var _this = this[i];//获取到当前jquery对象中的第i个角标上的dom对象
                    $.each(attr, function (attr, val) {//遍历attr参数 并在回调中传入每一个attr参数和他的值
                        _this.style[attr] = val;
                        //给每一个的dom元素增加css为传入的attr对象的key和value
                    });
                }
            }
            if (typeof attr == 'string' && arguments.length == 1) {
                return kodo;
            }
            return this;
        },
        hasClass: function (cls) {
            var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');// \\s|^表示 空格或者开头 \\s|$表示空格或者结尾
            for (var i = 0; i < this.length; i++) {//根据当前对象中的dom个数来遍历
                if (this[i].className.match(reg)) return true;//每一个dom的class都匹配一下该cls 有就返回true 没就返回false
                return false;
            }
            return this;
        },
        addClass: function (cls) {
            var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');//因为用的|&所以要把需要|&的地方()起来
            for (var i = 0; i < this.length; i++) {
                if (!this[i].className.match(reg))
                    this[i].classList.add(cls);
            }
            return this;
        },
        removeClass: function (cls) {
            var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
            for (var i = 0; i < this.length; i++) {
                if (this[i].className.match(reg))
                    this[i].classList.remove(cls);
            }
            return this;
        },
        next: function () {
            return sibling(this[0], "nextSibling");//dom.nextSibling返回下一个兄弟节点
        },
        prev: function () {
            return sibling(this[0], "previousSibling");//dom.previousSibling返回上一个兄弟节点
        },
        parent: function () {
            var parent = this[0].parentNode;//获取到父节点
            parent = parent && parent.nodeType !== 11 ? parent : null;//如果父元素存在并且不是documentFragment元素的话就为parent不然就为null
            var a = Kodo();//创建自己的jquery对象 此处没给选择器 所以对象是null
            a[0] = parent;//把父节点放入0号角标
            a.selector = parent.tagName.toLocaleLowerCase();//selector属性为父节点的标签名称
            a.length = 1;//设置数组长度为1
            return a;
        },
        parents: function () {
            var a = Kodo(),
                i = 0;
            while ((this[0] = this[0]['parentNode']) && this[0].nodeType !== 9) {//如果父节点存在并且父节点不是document树
                //并把当前jquery对象的0角标替换成父元素
                if (this[0].nodeType === 1) {//父节点的是个dom元素
                    a[i] = this[0];//给我们定义的jquery对象的i号角标添加该父节点
                    i++;
                }
            }
            a.length = i;//给我们的jquery对象赋值长度属性
            return a;
        },
        find: function (selector) {
            if (!selector) return;
            var context = this.selector;//因为我们每次创建jquery对象都会有一个selector属性 此处可以获取到当前对象的selector
            return new Kodo(context + ' ' + selector);//然后组成(原来的selector 传入的selector)创建jquery对象
        },
        first: function () {
            return new Kodo(this[0])//直接返回当前数组中第一个元素jquery对象
        },
        last: function () {
            var num = this.length - 1;
            return new Kodo(this[num]);//返回最后一个元素；注意因为是数组 从0开始 所以length需要减一
        },
        eq: function (num) {
            var num = num < 0 ? (this.length - 1) : num;//如果num小于0则为length-1否则为num
            return new Kodo(this[num]);//返回指定角标的jquery对象
        },
        get: function (num) {
            var num = num < 0 ? (this.length - 1) : num;//同上 但是返回的是dom对象
            return this[num];
        },
        attr: function (attr, val) {//与css实现方式相同
            var arr = [];
            for (var i = 0; i < this.length; i++) {
                if (typeof attr == 'string') {
                    if (arguments.length == 1) {
                        arr[i] = this[i].getAttribute(attr);
                    }
                    this[i].setAttribute(attr, val);
                } else {
                    var _this = this[i];
                    $.each(attr, function (attr, val) {
                        _this.setAttribute(attr, val);
                    });
                }
            }
            if (typeof attr == 'string' && arguments.length == 1) {
                return arr;
            }
            return this;
        },
        data: function (attr, val) {
            var arr = [];
            for (var i = 0; i < this.length; i++) {
                if (typeof attr == 'string') {
                    if (arguments.length == 1) {
                        return this[i].getAttribute('data-' + attr);
                    }
                    this[i].setAttribute('data-' + attr, val);
                } else {
                    var _this = this[i];
                    f.each(attr, function (attr, val) {
                        _this.setAttribute('data-' + attr, val);
                    });
                }
            }
            if (typeof attr == 'string' && arguments.length == 1) {
                return arr;
            }
            return this;
        }
    };
    Kodo.prototype.init.prototype = Kodo.prototype;//即init方法生成的对象可以调用Kodo里的所有方法
    Kodo.get = function (url, sucBack, complete) {//添加get静态方法
        var options = {
            url: url,//设置url
            success: sucBack,//设置成功的回调方法
            complete: complete//设置一个属性表示是否完成
        };
        ajax(options);//调用ajax方法
    };
    Kodo.post = function (url, data, sucback, complete) {
        var options = {
            url: url,//设置url
            type: "POST",//如果发送post请求需要设置post因为下面的open方法需要这个参数 并且设置对象请求头
            data: data,//写入参数
            sucback: sucback,//回调方法
            complete: complete//设置一个属性表示是否完成
        };
        ajax(options);
    };
    Kodo.ready = function (fn) {

        doc.addEventListener('DOMContentLoaded', fn, false);//在事件冒泡阶段触发
        doc.removeEventListener('DOMContentLoaded', fn, true);//事件捕获阶段移除

    };
    Kodo.each = function (obj, callback) {
        var len = obj.length,
            constru = obj.constructor,
            i = 0;

        if (constru === window.$) {//判断该对象的构造器是否是Kodo函数
            for (; i < len; i++) {
                var val = callback.call(obj[i], i, obj[i]);//如果是Kodo函数 则让回调方法的执行域指向该对象（该对象为一个数组:Kodo数组）
                if (val === false) break;//如果返回调回值为空 则跳出循环
            }                           //！！！！！call方法的第一个参数是改变方法中的this指向后面方法都是传入的参数
                                        //apply方法第一个参数也是改变this的指针 第二个方法是一个list可以传入参数为数组形态
        } else if (isArray(obj)) {//如果是数组
            for (; i < len; i++) {
                var val = callback.call(obj[i], i, obj[i]);//同上
                if (val === false) break;
            }
        } else {
            for (i in obj) {//如果是对象 则for in遍历出每个属性给回调方法遍历
                var val = callback.call(obj[i], i, obj[i]);
                if (val === false) break;
            }
        }

    };
    window.$ = Kodo;//在window的$上挂载Kodo方法以便可以调用

    function sibling(cur, dir) {
        while ((cur = cur[dir]) && cur.nodeType !== 1) {
        } //当cur不为空并且不nodetype!=1（即不是DOM元素）的时候什么都不做
        return cur;//返回该子元素
    }

    function isArray(obj) {
        return Array.isArray(obj);
    }

    function ajax(options) {
        var defaultOptions = {
            url: false, //ajax 请求地址
            type: "GET",
            data: false,
            success: false, //数据成功返回后的回调方法
            complete: false //ajax完成后的回调方法
        };
        for (var i in defaultOptions) {
            if (options[i] === undefined) {//如果传入的option中有些默认配置为定义的话
                options[i] = defaultOptions[i];//就设为默认配置
            }
        }
        var xhr = new XMLHttpRequest();
        var url = options.url;
        xhr.open(options.type, url);//打开该链接
        xhr.onreadystatechange = onStateChange;
        if (options.type === 'POST') {
            //如果是发送post要设置请求头
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }
        xhr.send(options.data ? options.data : null);//如果data有参数则发送参数 否则发送null

        function onStateChange() {
            if (xhr.readyState == 4) {//当请求完成时
                var result,
                    status = xhr.status;

                if ((status >= 200 && status < 300) || status == 304) {//当响应头为成功接收到响应
                    result = xhr.responseText;//获取返回内容
                    if (window.JSON) {//如果浏览器支持json方法
                        result = JSON.parse(result);//把返回内容转为json
                    } else {
                        result = eval('(' + result + ')');//否则转为对象
                    }
                    ajaxSuccess(result, xhr)//使用ajax成功处理方法
                } else {
                    console.log("ERR", xhr.status);//否则的话报错
                }
            }
        }

        function ajaxSuccess(data, xhr) {//设置成功响应时的方法
            var status = 'success';
            options.success && options.success(data, options, status, xhr)//给回调的方法赋值参数
            ajaxComplete(status)//响应方法表示ajax彻底完成
        }

        function ajaxComplete(status) {
            options.complete && options.complete(status);
        }
    }
})(window, document);