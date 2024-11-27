<template>
	<el-dialog v-model="visible" :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false">
		<el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="100px" @keyup.enter="submitHandle()">
			<el-form-item label="错误数据值" prop="errorValue" label-width="auto">
				<el-input disabled v-model="dataForm.errorValue" placeholder="错误数据值"></el-input>
			</el-form-item>
			<el-form-item label="修正数据值" prop="correctValue" label-width="auto">
				<el-input v-if="dataForm.errorColumnType != 'java.sql.Timestamp' && dataForm.errorColumnType != 'java.sql.Time' && dataForm.errorColumnType != 'java.sql.Date'" v-model="dataForm.correctValue" placeholder="修正数据值"></el-input>
				<el-date-picker
						 v-if="dataForm.errorColumnType == 'java.sql.Timestamp'"
						 v-model="dataForm.correctValue"
						 type="datetime"
						 placeholder="修正数据值"
						 format="YYYY-MM-DD hh:mm:ss"
						 value-format="YYYY-MM-DD hh:mm:ss"
				     />
				 <el-date-picker
						 v-if="dataForm.errorColumnType == 'java.sql.Time'"
						 v-model="dataForm.correctValue"
						 type="datetime"
						 placeholder="修正数据值"
						 format="hh:mm:ss"
						 value-format="hh:mm:ss"
					  />
				<el-date-picker
					 v-if="dataForm.errorColumnType == 'java.sql.Date'"
					 v-model="dataForm.correctValue"
					 type="date"
					 placeholder="修正数据值"
					 format="YYYY-MM-DD"
					 value-format="YYYY-MM-DD"
				  />
			</el-form-item>
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
import { useQualityTopicApi, correctTopicApi } from '@/api/data-governance/qualityTopic'

const emit = defineEmits(['refreshDataList'])

const visible = ref(false)
const dataFormRef = ref()

const dataForm = reactive({
	id: '',
	errorValue: '',
	correctValue: '',
	errorColumnType: ''
})

const init = (id?: number) => {
	visible.value = true
	dataForm.id = ''

	// 重置表单数据
	if (dataFormRef.value) {
		dataFormRef.value.resetFields()
	}

	if (id) {
		getQualityTopic(id)
	}
}

const getQualityTopic = (id: number) => {
	useQualityTopicApi(id).then(res => {
		Object.assign(dataForm, res.data)
	})
}

const dataRules = ref({
})

// 表单提交
const submitHandle = () => {
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}

		correctTopicApi(dataForm).then(() => {
			ElMessage.success({
				message: '操作成功',
				duration: 500,
				onClose: () => {
					visible.value = false
					emit('refreshDataList')
				}
			})
		})
	})
}

defineExpose({
	init
})
</script>
