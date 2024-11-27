<template>
	<el-dialog v-model="visible" :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false">
		<el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="100px" @keyup.enter="submitHandle()">
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
			<el-form-item label="名称" prop="name" >
				<el-input v-model="dataForm.name" placeholder="名称"></el-input>
			</el-form-item>
			<el-form-item label="类路径" prop="classPath">
				<el-input v-model="dataForm.classPath" placeholder="类路径"></el-input>
			</el-form-item>
			<el-form-item label="自定义参数" prop="param">
				<el-input type="textarea" rows="3" v-model="dataForm.param" placeholder="自定义参数"></el-input>
			</el-form-item>
			<el-form-item label="描述" prop="description">
				<el-input type="textarea" rows="2" v-model="dataForm.description" placeholder="描述"></el-input>
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
import { useOrgListApi } from '@/api/sys/orgs'
import { useDataPushConfigApi, useDataPushConfigSubmitApi } from '@/api/data-governance/dataPushConfig'

const emit = defineEmits(['refreshDataList'])

const orgList = ref([])
const visible = ref(false)
const dataFormRef = ref()

const dataForm = reactive({
	orgId: '',
	name: '',
	classPath: '',
	param: '',
	description: '',
})

const init = (id?: number) => {
	visible.value = true
	dataForm.id = ''

	// 重置表单数据
	if (dataFormRef.value) {
		dataFormRef.value.resetFields()
	}

	//获取部门列表
	useOrgListApi().then(res => {
		orgList.value = res.data
	})

	if (id) {
		getDataPushConfig(id)
	}
}

const getDataPushConfig = (id: number) => {
	useDataPushConfigApi(id).then(res => {
		Object.assign(dataForm, res.data)
	})
}

const dataRules = ref({
	orgId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	name: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	classPath: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})

// 表单提交
const submitHandle = () => {
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}

		useDataPushConfigSubmitApi(dataForm).then(() => {
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
