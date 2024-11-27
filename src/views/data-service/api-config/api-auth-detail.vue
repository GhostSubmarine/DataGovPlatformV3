<template>
	<el-dialog v-model="visible" title="修改授权" :close-on-click-modal="false">
		<el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="100px">
			<el-form-item label="调用次数" prop="limited" label-width="auto">
				<el-radio-group v-model="dataForm.limited">
				  <el-radio :label="false" size="large">不限次数</el-radio>
				  <el-radio :label="true" size="large">指定次数</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item label="次数" prop="requestTimes" label-width="auto" v-if="dataForm.limited">
				<el-input-number v-model="dataForm.requestTimes" placeholder="次数"></el-input-number>
			</el-form-item>
			<el-form-item label="已调用次数" prop="requestedTimes" label-width="auto">
				<span>{{dataForm.requestedTimes}}</span>
			</el-form-item>
			<el-form-item label="调用成功次数" prop="requestedSuccessTimes" label-width="auto">
				<span>{{dataForm.requestedSuccessTimes}}</span>
			</el-form-item>
			<el-form-item label="调用失败次数" prop="requestedFailedTimes" label-width="auto">
				<span>{{dataForm.requestedFailedTimes}}</span>
			</el-form-item>
		</el-form>
		<template #footer>
			<el-button @click="visible = false">取消</el-button>
			<el-button type="warning" @click="resetRequestedTimes()">重置调用次数</el-button>
			<el-button type="primary" @click="submitHandle()">确定</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage,ElMessageBox } from 'element-plus/es'
import { authApi } from '@/api/data-service/app'
import { resetRequestedTimesApi } from '@/api/data-service/apiConfig'

const emit = defineEmits(['refreshAuthList'])

const visible = ref(false)
const dataFormRef = ref()

const dataForm = reactive({
	limited: false,
	requestTimes: 100,
	requestedTimes: 0,
})

const init = (authForm: any) => {
	visible.value = true
	Object.assign(dataForm, authForm)
	dataForm.limited = dataForm.requestTimes == -1 ? false : true
}

const dataRules = ref({
	limited: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	requestTimes: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})

const resetRequestedTimes = () => {
	ElMessageBox.confirm('确定进行重置操作吗，重置后该应用下的 api 的已调用次数将清零！', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	})
	.then(() => {
		resetRequestedTimesApi(dataForm.id).then(res=>{
			ElMessage.success("重置成功")
			dataForm.requestedTimes = 0
			dataForm.requestedSuccessTimes = 0
			dataForm.requestedFailedTimes = 0
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
		dataForm.requestTimes = dataForm.limited ? dataForm.requestTimes : -1
		authApi(dataForm).then(() => {
			ElMessage.success({
				message: '修改授权成功',
				duration: 500,
				onClose: () => {
					visible.value = false
					emit('refreshAuthList')
				}
			})
		})
	})
}

defineExpose({
	init
})
</script>
