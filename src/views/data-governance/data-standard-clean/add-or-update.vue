<template>
	<el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="100px" @keyup.enter="submitHandle()">
		<el-divider><span style="font-size: 16px">基础信息</span></el-divider>
		<el-form-item label="名称" prop="name" label-width="auto">
			<el-input :disabled="!editFlag" v-model="dataForm.name" placeholder="名称"></el-input>
		</el-form-item>
		<el-form-item label="任务类型" prop="taskType" label-width="auto">
			<fast-select :disabled="!editFlag" v-model="dataForm.taskType" dict-type="quality_config_task_type" placeholder="任务类型" clearable></fast-select>
		</el-form-item>
		<el-form-item label="cron表达式" prop="cron" label-width="auto" v-if="dataForm.taskType == 2">
			<el-input :disabled="!editFlag" v-model="dataForm.cron"  placeholder="cron表达式" clearable></el-input>
		</el-form-item>
		<el-form-item label="备注" prop="description" label-width="auto">
			<el-input :disabled="!editFlag" type="textarea" v-model="dataForm.description"></el-input>
		</el-form-item>
		<el-divider><span style="font-size: 16px">清洗映射配置</span></el-divider>
		<div v-if="standardCodeValues.length == 0">
			<el-tag type="warning" style="font-size:16px">请在关联配置模块关联数据标准字段，保证标准字段下存在标准数据再进行清洗配置</el-tag>
		</div>
		<el-button v-if="standardCodeValues.length > 0 && editFlag" type="warning" @click="addConfig" size="small">添加配置</el-button>
		<div v-if="standardCodeValues.length > 0" style="margin-top: 10px;" v-for="(item,index) in dataForm.cleanConfig">
			<span>库中值：</span>
			<el-input v-model="item.oldValue" :disabled="!editFlag" placeholder="库中值" style="width: 200px;"></el-input>
			<span>&emsp;&emsp;清洗值：</span>
			<el-input v-if="standardCodeValues.length == 0" :disabled="!editFlag" v-model="item.newValue" placeholder="清洗值" style="width: 200px;"></el-input>
			<el-select
					:disabled="!editFlag"
					v-else
					v-model="item.newValue"
					clearable
					filterable 
			        placeholder="清洗标准值编号">
			  <el-option v-for="(code,index) in standardCodeValues"
			             :key="code.id"
			             :label="`[${code.dataId}]${code.dataName}`"
			             :value="code.dataId"></el-option>
			</el-select>
			<el-button type="danger" size="small" style="margin-left: 8px;" @click="deleteConfig(index)">删除</el-button>
		</div>
		<el-divider></el-divider>
		<el-form-item label-width="auto" style="margin-top: 10px;">
			<el-button v-if="standardCodeValues.length > 0 && dataForm.status==0" type="primary" @click="editFlag=true">编辑</el-button>
			<el-button v-if="standardCodeValues.length > 0" type="success" @click="submitHandle()">保存</el-button>
			<el-button :disabled="standardCodeValues.length == 0" v-if="!editFlag" type="danger" @click="handleRun()">执行</el-button>
			<el-button :disabled="standardCodeValues.length == 0" v-if="dataForm.status==0 && !editFlag" type="warning" @click="release()">发布</el-button>
			<el-button :disabled="standardCodeValues.length == 0" v-if="dataForm.status==1 && !editFlag" type="warning" @click="cancelRelease()">取消发布</el-button>
		</el-form-item>
	</el-form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage,ElMessageBox  } from 'element-plus/es'
import { useStandardCleanApi, useStandardCleanSubmitApi,getCleanConfigApi,getStandardColumnTypeApi,getStandardCodeApi,getMetaStandardRelApi,releaseApi,cancelReleaseApi,handleRunApi } from '@/api/data-governance/standardClean'

const emit = defineEmits(['refreshDataList'])

const visible = ref(false)
const dataFormRef = ref()

const dataForm = reactive({
	name: '',
	taskType: '',
	cron: '',
	description: '',
	cleanConfig: [
	]
})

const editFlag = ref(false)
const standardCodeValues = ref([])
const classType = ref('')
const init = (metadataId?: number) => {
	visible.value = true
	dataForm.id = ''
	dataForm.cleanConfig = []
	standardCodeValues.value = []
	editFlag.value = false

	// 重置表单数据
	if (dataFormRef.value) {
		dataFormRef.value.resetFields()
	}
	//根据metadataId获取清洗配置
	getCleanConfigApi(metadataId).then(res=>{
		if(res.data) {
			Object.assign(dataForm, res.data)
		} else {
			editFlag.value = true
		}
		//获取标准关联配置
		getMetaStandardRelApi(metadataId).then(res=> {
			if(res.data) {
				dataForm.metadataStandardRelId = res.data.id
				dataForm.metadataId = res.data.metadataId
				dataForm.standardId = res.data.standardId
				getStandardColumnTypeApi(metadataId).then(res=> {
					classType.value = res.data
				})
				//获取标准数据
				getStandardCodeApi(metadataId).then(res=>{
					standardCodeValues.value = res.data
					/* if(standardCodeValues.value.length > 0) {
						//根据metadataId获取标准字段的值
						getStandardColumnValuesApi(metadataId).then(res=>{
							dataForm.cleanConfig = res.data
						})
					} */
				})
			}
		})
	})
}

const addConfig = () => {
	dataForm.cleanConfig.push({
		classType: classType.value,
		oldValue: '',
		newValue: ''
	})
}

const deleteConfig = (index) => {
	dataForm.cleanConfig.splice(index, 1);
}

const dataRules = ref({
	name:  [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	taskType:  [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	cron:  [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})

const release = () => {
	ElMessageBox.confirm('确定发布吗?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	})
	.then(() => {
		releaseApi(dataForm.id).then(res=>{
			ElMessage.success("发布成功")
			Object.assign(dataForm, res.data)
		})
	})
	.catch(() => {})
	
}

const cancelRelease = () => {
	
	ElMessageBox.confirm('确定取消发布吗?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	})
	.then(() => {
		cancelReleaseApi(dataForm.id).then(res=>{
			ElMessage.success("取消发布成功")
			Object.assign(dataForm, res.data)
		})
	})
	.catch(() => {})
}

const handleRun = () => {
	ElMessageBox.confirm('确定执行吗?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	})
	.then(() => {
		handleRunApi(dataForm.id).then(res=>{
			ElMessage.success("手动执行成功");
		})
	})
	.catch(() => {})
}

// 表单提交
const submitHandle = () => {
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}
		for(var i in dataForm.cleanConfig) {
			var config = dataForm.cleanConfig[i]
			if(!config.newValue || !config.oldValue) {
				ElMessage.warning("请把清洗映射配置补充完整")
				return
			}
		}
		
		useStandardCleanSubmitApi(dataForm).then((res) => {
			ElMessage.success({
				message: '操作成功',
				duration: 500,
				onClose: () => {
					visible.value = false
					//emit('refreshDataList')
				}
			})
			Object.assign(dataForm, res.data)
			editFlag.value = false
		})
	})
}

defineExpose({
	init
})
</script>
