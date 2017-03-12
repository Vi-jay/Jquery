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
            if(!selector) { return this; }

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
                for (var i = 0; i < elm.length; i++) {
                    this[i] = elm[i];
                }

                this.selector = selector;
                this.length = elm.length;
                return this;
            }
        },
        css : function(attr,val) {//链式测试
            console.log(this.length);
            for(var i = 0;i < this.length; i++) {
                if(arguments.length == 1) {
                    return getComputedStyle(this[i],null)[attr];//getcomputedStyle会返回所有的style包括从父类继承的 第二个参数的伪类
                }
                this[i].style[attr] = val;
            }
            return this;
        },
        hasClass : function(cls) {
            var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');// \\s|^表示 空格或者开头 \\s|$表示空格或者结尾
            for (var i = 0; i < this.length; i++) {//根据当前对象中的dom个数来遍历
                if (this[i].className.match(reg)) return true;//每一个dom的class都匹配一下该cls 有就返回true 没就返回false
                return false;
            }
            return this;
        },
        addClass : function(cls) {
            var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');//因为用的|&所以要把需要|&的地方()起来
            for (var i = 0; i < this.length; i++) {
                if(!this[i].className.match(reg))
                    this[i].classList.add(cls);
            }
            return this;
        },
        removeClass : function(cls) {
            var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
            for (var i = 0; i < this.length; i++) {
                if (this[i].className.match(reg))
                    this[i].classList.remove(cls);
            }
            return this;
        }
    };
    Kodo.prototype.init.prototype = Kodo.prototype;//即init方法生成的对象可以调用Kodo里的所有方法
    Kodo.ajax = function () {
        console.log(this);
    };
    window.$ = Kodo;
})(window, document);