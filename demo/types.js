const types = {
	advertising: [
		'GET_ADS',
		'AD_DATA',
		'DEMO_TEST'
	]
}

// 格式化
const result = {}

Object.keys(types).forEach((key) => {
	// 所有常量加上模块前缀防止命名冲突，如 user:['CLEAR_USER_INFO']变成 USER_CLEAR_USER_INFO
	const constValue = {}
	types[key].forEach((item) => {
		constValue[item] = `${key.toUpperCase()}_${item}`
	})
	result[`${key}Types`] = constValue
})

module.exports = result
