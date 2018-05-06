# wepy-store

适用于wepy框架的状态管理器。

## 为何要用状态管理器
1. 提供了一个状态管理机制，开发者在开发页面的时候，不需要过多的去关注数据是怎么来的，怎么变化的，而是可以相信请求结束的时候，页面就会自动刷新。
2. 进入页面再请求接口，将会使页面有一段时间的空白。而本状态管理器利用小程序页面常驻后台的特点，将数据保存在内存中。只要前一个页面请求过相应接口，进入下一个页面时就有会初始数据（不一定准确）
3. API和Vuex非常相近，可以很轻松的把项目从使用vue的web版迁移到小程序中来。

## 和Vuex的异同
本状态管理器在使用上力求向vuex靠拢，功能方面也是模仿vuex的，但内部实现不一致。  
1. vuex的mapGetters是基于getter和computed的，实际上将相应的getter绑定到了一个新的vue实例的computed，复用其变化检测逻辑。但wepy的computed是基于脏检测，而不是getter & setter机制，所以用了另一个相对取巧的方式——缓存实例，在值变动的时候手动调用脏检测，来达到实时更新的目的。  
2. vuex的状态有做命名空间区分，而本状态管理器主要通过type名称来实现命名空间区别。相对来说更依赖于开发者自身的模块划分。具体划分方式可以参照demo里的type.js文件。
3. vuex的action包括 getter、mutation、action三部分，但是我在使用的过程中发现mutation并不是十分必要。所以本状态管理器去掉了mutation这一部分，开发者可以直接在action第一个参数里获取setState方法，直接设置getter。至于getter的获取，也没有专门独立出来，而是根据setState，即getState和setState是对应的。
4. vuex的action可以直接获取整个store树，但本状态管理器没有，因为没有做写权限限制，万一开发者误操作，将使整颗store树被污染。我只暴露出来getState方法和setState方法，都是只能操作单个state，避免全局污染。

## 兼容性
本状态管理器使用ES6语法编写。因此需要在wepy.config.js中配置好相应的babel插件

## API
提供了四个开放API和一个内置API，分别是：
1. getState
    开放API。作用是获取单个state，支持传入默认state，不传则为undefined。
    函数定义如下：
    ```
    getState(type [, defaultState])
    ```
    ***注意***：此方法为同步方法，如需在实例中异步请使用mapGetters
2. setState
    内置API。设置单个state，在action中使用。如果type已在mapGetters中定义将会触发wepy的相应实例的脏检测。
    函数定义如下：
    ```
    setState(type, data)
    ```
3. mapGetters
    开放API。作用是生成computed函数，支持多个type，支持设置默认值，支持异步请求同步刷新
    ```
    mapGetters(getters)
    ```
    getters为对象，key为type，value有两种形式
    ```
    computed = {
        ...mapGetters({
            key1: 'value1_is_a_string',
            key2: {
                type: 'value2_is_an_object_and_can_set_a_defaultState',
                defaultState: 'defaultState can be any thing'
            }
        }),
        key3 () {

        }
    }
    ```
    解析之后相当于（**但并不相等于**！！以下写法将没法自动刷新！！）：
    ```
    computed = {
        key1 () {
            return getState('value1_is_a_string')
        }，
        key2 () {
           return getState('value2_is_an_object_and_can_set_a_defaultState', 'defaultState') 
        },
        key3 () {
            
        }
    }
    ```
    ***注意***：mapGetters只能在component或page实例的computed对象中使用，否则将不会达到异步请求实时更新的效果
4. dispatch
    开放API。作用是调用单个action，支持多参数，并可在action中使用公共参数（公共参数中含有公共API）
    函数定义如下：
    ```
    dispatch(type [, data [, data2 [, data3...]]])
    ```
    可传任意数量的data，需在action中接收
    示例如下：
    ```
    /* 页面中调用 */
    dispatch(type, data1, data2)

    /* action定义 */
    const action = {
        type ({getState, setState, dispatch, type}, data1, data2) {
            
        }
    }
    ```
    getState、setState、dispatch即上面已列三个方法。type为当前的函数名

    ***注意***：传入的参数在action中是从第二个参数起算的
5. mapActions
    开放API。作用是定义多个action，不含参数。建议写在实例的methods中。具体调用则是在示例中使用```this.methods[type](data)```来调用
    函数定义如下：
    ```
    mapActions([
        type1,
        type2,
        ...
    ])
    ```
    使用示例：
    ```
    methods = {
        ...mapActions([
            type1,
            type2
        ]),
        type3 () {

        }
    }
    /* 实例中使用 */
    this.methods[type1](data1, data2)
    ```
    解析后相当于（也相等于）：
    ```
    methods = {
        type1 (...data) {
            return dispatch(type1, ...data)
        },
        type2 (...data) {
            return dispatch(type2, ...data)
        },
        type3 () {

        }
    }
    ```
    和dispatch的区别仅仅是此方法支持多个函数同时定义。页面中直接调用dispatch也是可以的，但建议把所用到的函数统一放到methods里，后续维护方便一点。

## 请求示例
详见demo

***注意***：demo是从整个项目中剥离的，原项目将源码划分为api（负责请求）、page（页面）、components（组件）、store（状态管理器）等多个模块。因此剥离出来的部分可能会部分报错，但使用方法不变。

## 谁在使用
小程序：

【花海仓-分销版】（以后可能去除横杆）

【品仓优选】（有可能胎死腹中，因为目前还没发版囧）

以及后续花海仓所有的小程序，都将使用同一套技术架构，使用本状态管理器。
