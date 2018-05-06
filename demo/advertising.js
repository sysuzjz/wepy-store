import {advertisingTypes as types} from './types'
// import api from 'api/advertising'

const actions = {
	[types.GET_ADS] ({setState, dispatch}, param) {
		return new Promise((resolve, reject) => {
			// 此处可直接调用ajax方法
			// api.getAds(param).then((data) => {
			// 	setState(types.AD_DATA, data)
			// 	resolve(data)
			// }, reject)

			// 此处示例使用setTimeout模拟
			setTimeout(() => {
				// 模拟返回对象
				const data = {
					123: [{
						zone_id: 123,
						bannerid: 123001
					}, {
						zone_id: 123,
						bannerid: 123002
					}],
					321: [{
						zone_id: 321,
						bannerid: 321001
					}]
				}
				setState(types.AD_DATA, data)
				resolve(data)
			}, 2000)
		})
		// 可直接请求别的接口
		// dispatch(types.DEMO_TEST, param)
	},
	[types.DEMO_TEST] ({setState, type}, param) {
		console.log(type) // ADVERTISING_DEMO_TEST
		setState(types.DEMO_TEST, {
			name: param.abc,
			data: [
				1234
			]
		})
	}
}

module.exports = actions
