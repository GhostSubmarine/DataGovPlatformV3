<template>
	<el-dialog v-model="visible" :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false">
		<el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="100px" @keyup.enter="submitHandle()">
	    	<el-form-item label="分层英文名称" prop="name">
					<el-input v-model="dataForm.name" placeholder="分层英文名称" :disabled="true"></el-input>
				</el-form-item>
				<el-form-item label="分层中文名称" prop="cnName">
					<el-input v-model="dataForm.cnName" placeholder="分层中文名称" :disabled="true"></el-input>
				</el-form-item>
				<el-form-item label="分层描述" prop="note">
					<el-input type="textarea" v-model="dataForm.note"></el-input>
				</el-form-item>
				<el-form-item label="表名前缀" prop="tablePrefix">
					<el-input v-model="dataForm.tablePrefix" placeholder="表名前缀" :disabled="true"></el-input>
				</el-form-item>
				<el-form-item label="创建时间" prop="createTime">
					<el-date-picker type="datetime" placeholder="创建时间" v-model="dataForm.createTime" :disabled="true"></el-date-picker>
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
import { useLayerApi, useLayerSubmitApi } from '@/api/data-integrate/layer'

const emit = defineEmits(['refreshDataList'])

const visible = ref(false)
const dataFormRef = ref()

const dataForm = reactive({
	name: '',
	cnName: '',
	note: '',
	tablePrefix: '',
	createTime: ''})

const init = (id?: number) => {
	visible.value = true
	dataForm.id = ''

	// 重置表单数据
	if (dataFormRef.value) {
		dataFormRef.value.resetFields()
	}

	if (id) {
		getLayer(id)
	}
}

const getLayer = (id: number) => {
	useLayerApi(id).then(res => {
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

		useLayerSubmitApi(dataForm).then(() => {
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
