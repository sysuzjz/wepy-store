import testModule from './modules/address'

// import相关模块后添加进actions对象，也可以用Object.assign
// 最理想的是使用遍历方式，没法实现只能用这种替代方案
const actions = {
	...testModule
}

// 挂载在app实例上更方便调试
const app = getApp()
const store = app.store = app.store || {}

// 缓存使用 mapGetters的component实例，当setState时只更新相应实例
const computedInstanceMap = {}
const addInstance = (type, instance) => {
	computedInstanceMap[type] = computedInstanceMap[type] || []
	if (!computedInstanceMap[type].includes(instance)) {
		computedInstanceMap[type].push(instance)
	}
}

// 获取某个state。支持传入默认state
const getState = (type, defaultState) => {
	return store[type] || defaultState
}

// 设置某个state
const setState = (type, val) => {
	store[type] = val
	// wepy的坑，异步请求改变组件变量 需要手动调用实例的$apply
	computedInstanceMap[type] && computedInstanceMap[type].forEach((instance) => {
		instance.$apply()
	})
	return true
}

// 获取相应action，不存在则弹出错误
const getAction = (type) => {
	const action = actions[type]
	if (!action || Object.prototype.toString.call(action) !== '[object Function]') {
		throw new Error(`action - ${type} not found`)
	}
	return action
}

// 任务派发。提供多个内置函数。传参支持多个参数
const dispatch = (type, ...data) => {
	const action = getAction(type)
	return action({
		type,
		getState,
		dispatch,
		setState
	}, ...data)
}
/*
 * computed里使用
 * @method mapGetters
 * @param getters {Object}  key-val对象， val可为对象，含type和defaultState两个属性
 * @returns {Object} value为函数的对象
 */
const mapGetters = (getters) => {
	if (Object.prototype.toString.call(getters) !== '[object Object]') {
		throw new Error('getters must be a object')
	}
	const result = {}
	Object.keys(getters).forEach((key) => {
		const val = getters[key]
		if (Object.prototype.toString.call(val) === '[object Object]') {
			if (!val.type) {
				throw new Error('type is required in a getter')
			}
			result[key] = function() {
				// 将实例存储起来
				addInstance(val.type, this)
				return getState(val.type, val.defaultState)
			}
		}
		else {
			result[key] = function () {
				addInstance(val, this)
				return getState(val)
			}
		}
	})
	return result
}

/*
 * methods里使用
 * @method mapActions
 * @param actionArr {Array} 数组元素为type名
 * @returns {Object} value为函数的对象
 */
const mapActions = (actionArr) => {
	if (Object.prototype.toString.call(actionArr) !== '[object Array]') {
		throw new Error('actions must be an array')
	}
	const result = {}
	actionArr.forEach((type) => {
		result[type] = (...data) => {
			return dispatch(type, ...data)
		}
	})
	return result
}

module.exports = {
	dispatch,
	getState,
	mapGetters,
	mapActions
}
