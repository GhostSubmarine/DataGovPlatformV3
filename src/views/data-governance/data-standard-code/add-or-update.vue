<template>
	<el-dialog v-model="visible" :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false" width="30%">
		<el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="100px" @keyup.enter="submitHandle()">
			<el-form-item label="标准编号" prop="dataId">
				<el-input v-model="dataForm.dataId" placeholder="标准编号"></el-input>
			</el-form-item>
			<el-form-item label="标准名称" prop="dataName">
				<el-input v-model="dataForm.dataName" placeholder="标准名称"></el-input>
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
import { useStandardCodeApi, useStandardCodeSubmitApi } from '@/api/data-governance/dataStandardCode'

const emit = defineEmits(['refreshDataList'])

const visible = ref(false)
const dataFormRef = ref()

const dataForm = reactive({
	dataId: '',
	dataName: ''
})

const init = (id?: number, standardId) => {
	visible.value = true
	dataForm.id = ''

	// 重置表单数据
	if (dataFormRef.value) {
		dataFormRef.value.resetFields()
	}
	dataForm.standardId = standardId

	if (id) {
		getStandardCode(id)
	}
}

const getStandardCode = (id: number) => {
	useStandardCodeApi(id).then(res => {
		Object.assign(dataForm, res.data)
	})
}

const dataRules = ref({
	dataId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	dataName: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})

// 表单提交
const submitHandle = () => {
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}

		useStandardCodeSubmitApi(dataForm).then(() => {
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
