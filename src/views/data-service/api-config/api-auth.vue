<template>
	<el-dialog v-model="visible" title="授权" :close-on-click-modal="false">
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
			<!-- <el-form-item label="已调用次数" prop="requestedTimes" label-width="auto">
				<el-input v-model="dataForm.requestedTimes" disabled></el-input>
			</el-form-item> -->
		</el-form>
		<template #footer>
			<el-button @click="visible = false">取消</el-button>
			<el-button type="primary" @click="submitHandle()">确定</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus/es'
import { authApi } from '@/api/data-service/app'

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
	dataForm.limited = false
	dataForm.requestTimes = 100
}

const dataRules = ref({
	limited: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	requestTimes: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})

// 表单提交
const submitHandle = () => {
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}
		dataForm.requestTimes = dataForm.limited ? dataForm.requestTimes : -1
		dataForm.requestedTimes = null
		authApi(dataForm).then(() => {
			ElMessage.success({
				message: '授权成功',
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
