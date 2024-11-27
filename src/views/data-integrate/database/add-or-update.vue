<template>
	<el-dialog v-model="visible" :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false">
		<el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="120px" @keyup.enter="submitHandle()">
				<el-form-item prop="orgId" label="所属机构">
					<el-tree-select
						clearable
						v-model="dataForm.orgId"
						:data="orgList"
						check-strictly
						value-key="id"
						:props="{ label: 'name', children: 'children' }"
						style="width: 100%"
					/>
				</el-form-item>
				<el-form-item label="名称" prop="name">
					<el-input v-model="dataForm.name" placeholder="名称"></el-input>
				</el-form-item>
				<el-form-item label="数据库类型" prop="databaseType">
					<fast-select v-model="dataForm.databaseType" dict-type="database_type" placeholder="请选择" clearable></fast-select>
				</el-form-item>
				<el-form-item label="主机ip" prop="databaseIp">
					<el-input v-model="dataForm.databaseIp" placeholder="主机ip"></el-input>
				</el-form-item>
				<el-form-item label="端口" prop="databasePort">
					<el-input v-model="dataForm.databasePort" placeholder="端口"></el-input>
				</el-form-item>
				<el-form-item label="库名(服务名)" prop="databaseName">
					<el-input v-model="dataForm.databaseName" placeholder="库名(服务名)"></el-input>
				</el-form-item>
				<el-form-item label="schema" prop="databaseSchema">
					<el-input v-model="dataForm.databaseSchema" placeholder="schema"></el-input>
				</el-form-item>
				<el-form-item label="用户名" prop="userName">
					<el-input v-model="dataForm.userName" placeholder="用户名(注意大小写)"></el-input>
				</el-form-item>
				<el-form-item label="密码" prop="password">
					<el-input v-if="!dataForm.id" v-model="dataForm.password" placeholder="密码"></el-input>
					<el-input v-else v-model="dataForm.newPassword" placeholder="密码" @change="pwdChange"></el-input>
				</el-form-item>
				<el-form-item label="jdbc连接串" prop="jdbcUrl">
					<el-input v-model="dataForm.jdbcUrl" placeholder="jdbc连接串(若填写将以填写的内容连接,否则会后台自动构建连接)"></el-input>
				</el-form-item>
				<!-- <el-form-item label="所属项目" prop="projectId">
					<fast-project-select v-model="dataForm.projectId" placeholder="所属项目" clearable></fast-project-select>
				</el-form-item> -->
		</el-form>
		<template #footer>
			<el-button @click="visible = false">取消</el-button>
			<el-button type="primary" @click="test()">测试</el-button>
			<el-button type="primary" @click="submitHandle()">确定</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus/es'
import { useDatabaseApi, useDatabaseSubmitApi,testOnline } from '@/api/data-integrate/database'
import { useOrgListApi } from '@/api/sys/orgs'

const emit = defineEmits(['refreshDataList'])

const visible = ref(false)
const dataFormRef = ref()
const orgList = ref([])

const dataForm = reactive({
	orgId: '',
	name: '',
	databaseType: '',
	databaseIp: '',
	databasePort: '',
	databaseName: '',
	databaseSchema: '',
	userName: '',
	password: '',
	newPassword: '******',
	jdbcUrl: '',
	projectId: ''
	})

const init = (id?: number) => {
	visible.value = true
	dataForm.id = ''
	dataForm.newPassword = '******'

	// 重置表单数据
	if (dataFormRef.value) {
		dataFormRef.value.resetFields()
	}
	
	//获取部门列表
	useOrgListApi().then(res => {
		orgList.value = res.data
	})

	if (id) {
		getDatabase(id)
	}
}

const pwdChange = (newPwd) => {
	dataForm.password = newPwd
}

const getDatabase = (id: number) => {
	useDatabaseApi(id).then(res => {
		Object.assign(dataForm, res.data)
	})
}

const dataRules = ref({
	orgId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	name: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	databaseType: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	databaseIp: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	databasePort: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	databaseName: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	databaseSchema: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	userName: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	password: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	/* projectId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }] */})

// 表单提交
const submitHandle = () => {
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}

		useDatabaseSubmitApi(dataForm).then(() => {
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

// 测试连接
const test = () => {
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}
		testOnline(dataForm).then(() => {
			ElMessage.success({
				message: '测试连接成功',
				duration: 500,
				onClose: () => {
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
