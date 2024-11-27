<template>
	<el-dialog v-model="visible" :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false">
		<el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="100px" @keyup.enter="submitHandle()">
	    		<el-form-item label="项目名称" prop="name" label-width="auto">
					<el-input v-model="dataForm.name" placeholder="项目名称"></el-input>
				</el-form-item>
				<el-form-item label="英文名称" prop="engName" label-width="auto">
					<el-input v-model="dataForm.engName" placeholder="英文名称"></el-input>
				</el-form-item>
				<el-form-item label="数仓类型" prop="dbType" label-width="auto"> 
					<fast-select v-model="dataForm.dbType" dict-type="data_house_type" placeholder="请选择" clearable></fast-select>
				</el-form-item>
				<el-form-item label="数仓ip" prop="dbIp" label-width="auto">
					<el-input v-model="dataForm.dbIp" placeholder="数仓ip"></el-input>
				</el-form-item>
				<el-form-item label="数仓port" prop="dbPort" label-width="auto">
					<el-input v-model="dataForm.dbPort" placeholder="数仓port"></el-input>
				</el-form-item>
				<el-form-item label="数仓库名" prop="dbName" label-width="auto">
					<el-input v-model="dataForm.dbName" placeholder="数仓库名"></el-input>
				</el-form-item>
				<el-form-item label="数仓schema" prop="dbSchema" label-width="auto">
					<el-input v-model="dataForm.dbSchema" placeholder="数仓schema"></el-input>
				</el-form-item>
				<el-form-item label="数仓用户名" prop="dbUsername" label-width="auto">
					<el-input v-model="dataForm.dbUsername" placeholder="数仓用户名"></el-input>
				</el-form-item>
				<el-form-item label="数仓密码" prop="dbPassword" label-width="auto">
					<el-input v-if="!dataForm.id" v-model="dataForm.dbPassword" placeholder="数仓密码"></el-input>
					<el-input v-else v-model="dataForm.newPassword" placeholder="密码" @change="pwdChange"></el-input>
				</el-form-item>
				<el-form-item label="数仓jdbc连接串" prop="dbUrl" label-width="auto">
					<el-input v-model="dataForm.dbUrl" placeholder="若不填写后台自动生成"></el-input>
				</el-form-item>
				<el-form-item label="描述" prop="description" label-width="auto">
					<el-input type="textarea" v-model="dataForm.description"></el-input>
				</el-form-item>
					<el-form-item label="状态" prop="status" label-width="auto">
						<fast-radio-group v-model="dataForm.status" dict-type="project_status"></fast-radio-group>
					</el-form-item>
				<el-form-item label="负责人" prop="dutyPerson" label-width="auto">
					<el-input v-model="dataForm.dutyPerson" placeholder="负责人"></el-input>
				</el-form-item>
		</el-form>
		<template #footer>
			<el-button @click="visible = false">取消</el-button>
			<el-button type="primary" @click="testOnline()">测试数仓连通性</el-button>
			<el-button type="success" @click="submitHandle()">确定</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus/es'
import { useProjectApi, useProjectSubmitApi, testOnlineApi } from '@/api/data-integrate/project'

const emit = defineEmits(['refreshDataList'])

const visible = ref(false)
const dataFormRef = ref()

const dataForm = reactive({
	name: '',
	engName: '',
	dbType: '',
	dbName: '',
	dbIp: '',
	dbPort: '',
	dbSchema: '',
	dbUrl: '',
	dbUsername: '',
	dbPassword: '',
	newPassword: '******',
	description: '',
	status: '',
	dutyPerson: ''})

const init = (id?: number) => {
	visible.value = true
	dataForm.id = ''
	dataForm.newPassword = '******'

	// 重置表单数据
	if (dataFormRef.value) {
		dataFormRef.value.resetFields()
	}

	if (id) {
		getProject(id)
	}
}

const pwdChange = (newPwd) => {
	dataForm.dbPassword = newPwd
}

const getProject = (id: number) => {
	useProjectApi(id).then(res => {
		Object.assign(dataForm, res.data)
	})
}

const dataRules = ref({
	name: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	engName: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	dbIp: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	dbPort: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	dbType: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	dbName: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	dbSchema: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	dbUsername: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	dbPassword: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	status: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})

// 表单提交
const submitHandle = () => {
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}

		useProjectSubmitApi(dataForm).then(() => {
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

const testOnline = () => {
	testOnlineApi(dataForm).then(()=> {
		ElMessage.success({
			message: '测试成功',
		})
	})
}

defineExpose({
	init
})
</script>
