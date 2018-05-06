# wepy-store

适用于wepy框架的状态管理器。

力求在使用上向vuex靠拢，功能方面也是模仿vuex的，但内部实现不一致。

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
