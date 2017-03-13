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
        extends: function () {//浅拷贝
            var options = arguments[0];
            for (var key in options) {
                this[key] = options[key]
            }
        },
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
        },
        before: function (str) {
            for (var i = 0; i < this.length; i++) {
                doAppend(this[i], 'beforeBegin', str);
            }
            return this;
        },
        append: function (str) {
            for (var i = 0; i < this.length; i++) {
                doAppend(this[i], 'beforeend', str);
            }
            return this;
        },
        after: function (str) {
            for (var i = 0; i < this.length; i++) {
                domAppend(this[i], 'afterEnd', str);
            }
            return this;
        },
        remove: function () {
            for (var i = 0; i < this.length; i++) {
                this[i].parentNode.removeChild(this[i]);
            }
            return this;
        }, html: function (value) {
            var arr = [];
            if (value === undefined && this[0].nodeType === 1) {
                for (var i = 0; i < this.length; i++) {
                    arr.push(this[0].innerHTML);
                }
                return arr;
            } else {
                for (var i = 0; i < this.length; i++) {
                    var node = this[i];
                    if (node.children.length > 0) {
                        for (var c = 0; c < node.children.length; c++) {
                            node.removeChild(node.children[c]);//防止事件引用导致内存泄漏
                        }
                    }
                    node.innerHTML = value;
                }
            }
            return this;
        }, text: function (val) {
            var arr = [];
            if (val === undefined && this[0].nodeType === 1) {
                for (var i = 0; i < this.length; i++) {
                    arr.unshift(this[0].innerText);
                }
                return arr;
            } else {
                for (var i = 0; i < this.length; i++) {
                    this[i].innerText = val;    //以文本形式插入dom元素
                }
            }
        }, on: function (type, selector, fn) {
            if (typeof selector == 'function') {
                fn = selector; //两个参数的情况
                //事件绑定过程
            } else {
                //事件委托过程
                for (var i = 0; i < this.length; i++) {
                    if (!this[i].deleId) {
                        this[i].deleId = ++Kodo.deleId;
                        //同样是判断是否有唯一id

                        Kodo.deleEvents[Kodo.deleId] = {};
                        //没有则创建id对象 也就是f.deleEvents[]新开辟一个新对象

                        Kodo.deleEvents[Kodo.deleId][selector] = {};

                        //构造 selector对象
                        /*
                         *  如 Kodo.deleEvents[1] =
                         *  ｛
                         *       "#box li" : {},
                         *        "#pox" : {}
                         *   ｝
                         */

                        Kodo.deleEvents[Kodo.deleId][selector][type] = [fn];
                        //构造我们的事件数组
                        /*
                         *  如 Kodo.deleEvents["#box li"] =
                         *  {
                         *       "click" : [fn1,fn2...],
                         *        "touchstart" : [fn1,fn2....]
                         *   }
                         */
                        delegate(this[i], type, selector);
                        //用委托的方式进行绑定
                    } else {
                        //如果id存在的情况
                        var id = this[i].deleId,
                            position = Kodo.deleEvents[id];//委托元素的事件存储位置

                        if (!position[selector]) {
                            //先判断如果selector存储的对象不存在
                            position[selector] = {};
                            //新建selector对象 (与上面的selector构造相同)
                            position[selector][type] = [fn];
                            //构造事件数组对象   (与上面的type构造相同)

                            delegate(this[i], type, selector);
                            //因为是新的selector 所以要再绑定
                        } else {
                            //selector 存储对象存在的情况
                            if (position[selector][type]) {
                                //如果事件数组已经有了，则直接push进来
                                position[selector][type].push(fn);

                            } else {
                                //如果事件数组没有，那就构造事件数组
                                position[selector][type] = [fn];

                                //因为是新的绑定的事件，所以要重新绑定
                                delegate(this[i], type, selector);
                            }

                        }
                    }
                }
            }
        }, off: function (type, selector) {
            if (arguments.length == 0) {
                //如果没传参数，清空所有事件

            } else if (arguments.length == 1) {
                //指定一个参数，则清空对应的事件

            } else {
                //直接根据dom上存有的deleId，找到对应的deleEvents里的位置
                //删除委托元素上的type事件数组即可
                for (var i = 0; i < this.length; i++) {
                    var id = this[i].deleId;
                    delete Kodo.deleEvents[id][selector][type];
                }
            }
        }, width: function (w) {
            if (arguments.length == 1) {
                for (var i = 0; i < this.length; i++) {
                    this[i].style.width = w + 'px';
                }
            } else {
                if (this[0].document === doc) {//如果是document 和window
                    return this[0].innerWidth;  //返回内容的宽度
                } else if (this[0].nodeType === 9) {
                    return document.documentElement.clientWidth;
                } else {
                    return parseInt(getComputedStyle(this[0], null)['width']);
                }
            }
        }, height: function (h) {
            if (arguments.length == 1) {
                for (var i = 0; i < this.length; i++) {
                    this[i].style.height = h + 'px';
                }
            } else {
                if (this[0].document === doc) {
                    return this[0].innerHeight;
                } else if (this[0].nodeType === 9) {
                    return document.documentElement.clientHeight;
                } else {
                    return parseInt(getComputedStyle(this[0], null)['height']);
                }
            }
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
    Kodo.deleEvents = []; //事件委托存放的事件
    Kodo.deleId = 0; //事件委托的唯一标识
    Kodo.extends = Kodo.prototype.extends;

    window.$ = Kodo;//在window的$上挂载Kodo构造器方法以便可以调用

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

    function delegate(agent, type, selector) {
        // agent.addEventListener(type, function (e) {//给元素绑定指定事件
        //
        //     var target = e.target;//触发事件的元素
        //     var ctarget = e.currentTarget;//当前执行事件的元素
        //     var bubble = true;//是否冒泡
        //
        //     while (bubble && target != ctarget) {//当冒泡并且当前执行事件的元素不是触发事件的元素是：即冒泡触发事件的元素
        //         if (filiter(agent, selector, target)) {//判断该触发事件的元素是否是绑定元素的”selector“元素
        //             bubble = fn.call(target, e);//如果是指定的子元素触发的事件 则调用回调方法处理事件 并把执行域指向触发事件的元素
        //             return bubble;
        //         }
        //         target = target.parentNode;//把target赋值为它的父级元素  继续循环判断 是否触发冒泡事件 一直到冒泡结束
        //     }
        // }, false);
        var id = agent.deleId; //先获取被委托元素的deleId
        agent.addEventListener(type, function (e) {
            var target = e.target;
            var ctarget = e.currentTarget;
            var bubble = true;

            while (bubble && target != ctarget) {
                if (filiter(agent, selector, target)) {
                    for (var i = 0; i < Kodo.deleEvents[id][selector][type].length; i++) {
                        bubble = Kodo.deleEvents[id][selector][type][i].call(target, e);
                        //循环事件数组 直接call
                    }
                }
                target = target.parentNode;
                return bubble;
            }
        }, false);
        //总结：每次触发事件时 从最底层往上遍历所有节点 查看有没有符合条件的那个节点
        //如果触发事件的元素是 绑定了事件的子元素 中的某一个
        //就触发回调方法 并且把回调的方法的执行域指向触发事件的那个元素
        //如果不是就继续往上找
        //agent相当于一个事件委托人
        //举个例子： <body><agent><a></a></agent></body>
        //当a触发了事件时 会向上冒泡 于是agent也会被执行事件 此时 agent中的 target是a currentTarget是agent
        //判断如果target!=currentTarget就是为了表示该事件是由它的子元素触发的 而不是它
        //然后判断是否是指定的那个子元素触发的  不是的话就向a的上面找元素  比对触发事件的父级元素中有没有匹配的指定元素
        //没有的话一直向上找  直到agent为止 不会向父级元素冒泡 找到后调用回调方法
        //也就是说 指定元素的子元素触发事件 指定元素被冒泡触发的事件 也会算

        function filiter(agent, selector, target) {//过滤判断元素是否为指定元素
            var nodes = agent.querySelectorAll(selector);//查询到指定元素
            for (var i = 0; i < nodes.length; i++) {//遍历指定元素 是否有与target相等的
                if (nodes[i] == target) {
                    return true;
                }
            }
        }
    }

    function doAppend(elm, type, str) {
        elm.insertAdjacentHTML(type, str);
    }
})(window, document);