<template>
	<el-dialog v-model="visible" :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false">
		<el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="100px" @keyup.enter="submitHandle()">
			<el-form-item label="所属目录" prop="parentPath" label-width="auto">
				<el-input v-model="dataForm.parentPath" placeholder="所属目录" disabled></el-input>
			</el-form-item>
			<el-form-item label="名称" prop="name" label-width="auto">
				<el-input v-model="dataForm.name" placeholder="名称"></el-input>
			</el-form-item>
			<el-form-item label="编码" prop="code" label-width="auto">
				<el-input v-model="dataForm.code" placeholder="编码"></el-input>
			</el-form-item>
			<el-form-item label="版本号" prop="versionNo" label-width="auto">
				<el-input v-model="dataForm.versionNo" placeholder="版本号"></el-input>
			</el-form-item>
			<el-form-item label="开放类型" prop="openType" label-width="auto">
				<fast-select v-model="dataForm.openType" dict-type="open_type" placeholder="开放类型" clearable></fast-select>
			</el-form-item>
			<el-form-item label="开放角色" prop="openRoles" label-width="auto" v-if="dataForm.openType == 2">
				<el-select v-model="dataForm.openRoles"
						   multiple
						   clearable
						   filterable
				           placeholder="请选择">
				  <el-option v-for="(item,index) in roles"
				             :key="item.id"
				             :label="`[${item.id}]${item.name}`"
				             :value="item.id"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="开放用户" prop="openUsers" label-width="auto" v-if="dataForm.openType == 3">
				<el-select v-model="dataForm.openUsers"
						   multiple
						   clearable
						   filterable
				           placeholder="请选择">
				  <el-option v-for="(item,index) in users"
				             :key="item.id"
				             :label="`[${item.id}]${item.username}`"
				             :value="item.id"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="负责人" prop="dutyUser" label-width="auto">
				<el-input v-model="dataForm.dutyUser" placeholder="负责人"></el-input>
			</el-form-item>
			<el-form-item label="摘要" prop="summary" label-width="auto">
				<el-input type="textarea" v-model="dataForm.summary" placeholder="编码"></el-input>
			</el-form-item>
	    </el-form>
		<template #footer>
			<el-button @click="visible = false">取消</el-button>
			<el-button type="primary" @click="submitHandle()">确定</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus/es'
import { useResourceApi, useResourceSubmitApi } from '@/api/data-assets/resource'
import { useRoleListApi } from '@/api/sys/role'
import { listUserApi } from '@/api/sys/user'

const roles = ref([])
const users = ref([])

onMounted(()=>{
	useRoleListApi().then(res => {
		roles.value = res.data
	})
	listUserApi().then(res=> {
		users.value = res.data
	})
})

const emit = defineEmits(['refreshDataList'])

const visible = ref(false)
const dataFormRef = ref()

const dataForm = reactive({
	parentPath: '',
	catalogId: '',
	name:'',
	code:'',
	summary:'',
	openType:'',
	openRoles:[],
	openUsers:[],
	versionNo: '',
	dutyUser: '',
	dutyPhone: '',
})

const init = (id?: number, catalogId: number, parentPath: any) => {
	visible.value = true
	dataForm.id = ''

	// 重置表单数据
	if (dataFormRef.value) {
		dataFormRef.value.resetFields()
	}

    dataForm.catalogId = catalogId
	dataForm.parentPath = parentPath
	if (id) {
		getResource(id)
	}
}

const getResource = (id: number) => {
	useResourceApi(id).then(res => {
		Object.assign(dataForm, res.data)
	})
}

const dataRules = ref({
	catalogId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	name:  [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	code:  [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	openType:  [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	openRoles:  [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	openUsers:  [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	versionNo:  [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})

// 表单提交
const submitHandle = () => {
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}
		if(dataForm.openType == 1) {
			dataForm.openRoles = null
			dataForm.openUsers = null
		} else if(dataForm.openType == 2) {
			dataForm.openUsers = null
		} else if(dataForm.openType == 3) {
			dataForm.openRoles = null
		}
		useResourceSubmitApi(dataForm).then(() => {
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
