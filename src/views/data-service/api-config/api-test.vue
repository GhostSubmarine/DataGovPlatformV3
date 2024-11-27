<template>
	<el-drawer v-model="visible" title="API 测试" size="100%" :destroy-on-close="true">
		<div>
			<el-tabs
			  tab-position="top"
			>
				<el-tab-pane label="请求测试">
					 <el-form ref="apiTestFormRef" :rules="apiTestFormRules" :model="apiTestForm">
						<div v-if="previlege==1" ><b>token 申请：</b></div><br>
						<el-form-item v-if="previlege==1"  prop="tokenUrl" label-width="auto">
							<el-input v-model="apiTestForm.tokenUrl"></el-input>
						</el-form-item>
						<div v-if="previlege==1">
							<el-button type="primary" @click="requestToken()">获取token</el-button><br><br>
						</div>
						<div><b>请求地址：</b></div><br>
						<el-form-item label="Request Url" prop="url" label-width="auto">
							<el-input v-model="apiTestForm.url"></el-input>
						</el-form-item>	
						<el-form-item label="Request Method" prop="type" label-width="auto">
							<el-input disabled v-model="apiTestForm.type"></el-input>
						</el-form-item>	
						<div><b>请求头：</b></div><br>
						<el-form-item label="Content-Type" prop="contentType" label-width="auto">
							<el-input disabled v-model="apiTestForm.contentType"></el-input>
						</el-form-item>
						<el-form-item v-if="previlege==1" label="apiToken" prop="apiToken" label-width="auto">
							<el-input v-model="apiTestForm.apiToken"></el-input>
						</el-form-item>
						<div><b>请求参数：</b></div><br>
						<el-form-item label-width="auto" prop="jsonParam">
							<ParamStudio id="requestTestParam" ref="requestTestParamRef" style="height: 160px;width: 100%;"></ParamStudio>
						</el-form-item>
						<div>
							<el-button type="primary" @click="clickRequest()">点击请求</el-button>
						</div><br>
						<div><b>响应结果：</b></div><br>
						<el-form-item label-width="auto" prop="responseResult">
							<ParamStudio id="responseTestResult" value='' ref="responseTestResultRef" style="height: 500px;width: 100%;"></ParamStudio>
						</el-form-item>
					 </el-form>
				</el-tab-pane>
			</el-tabs>
		</div>
	</el-drawer>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus/es'
import { getIpPortApi, requestTokenApi } from '@/api/data-service/apiConfig'
import ParamStudio from './param-studio.vue'
import axios from 'axios'

const visible = ref(false)

const apiTestFormRef = ref()
const apiTestForm = reactive({
	ipPort: '',
	tokenUrl: '',
	path: '',
	url: '',
	type: '',
	contentType: '',
	apiToken: '',
	jsonParam: '',
	responseResult: ''
})

const apiTestFormRules = ref({
	url: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	type: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	contentType: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	//apiToken: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})

const previlege = ref()

const requestTestParamRef = ref()
const responseTestResultRef = ref()
const init = (apiConfig: any) => {
	visible.value = true
	//赋值url
	getIpPortApi().then(res=>{
		apiTestForm.ipPort = res.data
		apiTestForm.path = apiConfig.path
		apiTestForm.url = 'http://' + res.data + apiConfig.path
		apiTestForm.tokenUrl = 'http://' + res.data + 'token/generate?appKey=xxx&appSecret=xxx'
	})
	apiTestForm.type = apiConfig.type
	apiTestForm.contentType = apiConfig.contentType
	setApiTestParam(apiConfig.jsonParam)
	setResponseTestResult()
	previlege.value = apiConfig.previlege
}

const setApiTestParam = (jsonParam: any) => {
		if (requestTestParamRef.value) {
			requestTestParamRef.value.setEditorValue(jsonParam)
			return
		}
		setTimeout(() => {setApiTestParam(jsonParam)},500)
	}
	
const setResponseTestResult = () => {
		if (responseTestResultRef.value) {
			responseTestResultRef.value.setEditorValue('')
			return
		}
		setTimeout(() => {setResponseTestResult()}, 500)
	}

// axios实例
const requestClient = axios.create({
	timeout: 600000
})
const clickRequest = () => {
	let jsonParam = requestTestParamRef.value.getEditorValue()
	jsonParam = jsonParam ? JSON.parse(jsonParam) : {} 
	const config = {
	  headers:{
		 apiToken: apiTestForm.apiToken
	  }
	}
	if (apiTestForm.type == 'GET') {
		let requestStr = ''
		let i = 0
		for(let key in jsonParam) {
			if (i==0) {
				requestStr += '?'+ key +'='+jsonParam[key]
			} else {
				requestStr += '&'+ key +'='+jsonParam[key]
			}
			i++
		}
		requestClient.get(apiTestForm.url + requestStr, config).then(res=>{
			responseTestResultRef.value.setEditorValueAndFormat(JSON.stringify(res.data))
		}).catch(err=>{
			responseTestResultRef.value.setEditorValueAndFormat(JSON.stringify(err))
		})
	} else if(apiTestForm.type == 'POST'){
		requestClient.post(apiTestForm.url, jsonParam, config).then(res=>{
			responseTestResultRef.value.setEditorValueAndFormat(JSON.stringify(res.data))
		}).catch(err=> {
			responseTestResultRef.value.setEditorValueAndFormat(JSON.stringify(err))
		})
	} else if(apiTestForm.type == 'PUT'){
		requestClient.put(apiTestForm.url, jsonParam, config).then(res=>{
			responseTestResultRef.value.setEditorValueAndFormat(JSON.stringify(res.data))
		}).catch(err=> {
			responseTestResultRef.value.setEditorValueAndFormat(JSON.stringify(err))
		})
	} else if(apiTestForm.type == 'DELETE'){
		config.data = jsonParam
		requestClient.delete(apiTestForm.url, config).then(res=>{
			responseTestResultRef.value.setEditorValueAndFormat(JSON.stringify(res.data))
		}).catch(err=>{
			responseTestResultRef.value.setEditorValueAndFormat(JSON.stringify(err))
		})
	}
}

const requestToken = () => {
	requestTokenApi(apiTestForm.tokenUrl).then( res=> {
		apiTestForm.apiToken = res.data
	})
}


defineExpose({
	init
})
</script>
