<template>
	<el-dialog v-model="visible" :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false">
		<el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="100px" @keyup.enter="submitHandle()">
			<el-form-item label="appKey" prop="appKey" v-show="!!dataForm.id">
				<el-input disabled v-model="dataForm.appKey" placeholder="appKey"></el-input>
			</el-form-item>
			<el-form-item label="appSecret" prop="appSecret" v-show="!!dataForm.id">
				<el-input disabled v-model="dataForm.appSecret" placeholder="appSecret"></el-input>
			</el-form-item>
			<el-form-item label="名称" prop="name">
				<el-input v-model="dataForm.name" placeholder="名称"></el-input>
			</el-form-item>
			<el-form-item label="描述" prop="note">
				<el-input type="textarea" rows="2" v-model="dataForm.note" placeholder="描述"></el-input>
			</el-form-item>
			<el-form-item label="token有效期" prop="expireDesc">
				<fast-select v-model="dataForm.expireDesc" placeholder="有效期" dict-type="api_expire_desc" clearable></fast-select>
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
import { useAppApi, useAppSubmitApi } from '@/api/data-service/app'

const emit = defineEmits(['refreshDataList'])

const visible = ref(false)
const dataFormRef = ref()

const dataForm = reactive({
	appKey: '',
	appSecret: '',
	name: '',
	note: '',
	expireDesc: '',
	ifMarket: 1
})

const dataRules = ref({
	name: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	expireDesc: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})

const init = (id?: number) => {
	visible.value = true
	dataForm.id = ''

	// 重置表单数据
	if (dataFormRef.value) {
		dataFormRef.value.resetFields()
	}

	if (id) {
		getApp(id)
	}
}

const getApp = (id: number) => {
	useAppApi(id).then(res => {
		Object.assign(dataForm, res.data)
	})
}

// 表单提交
const submitHandle = () => {
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}

		useAppSubmitApi(dataForm).then(() => {
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
