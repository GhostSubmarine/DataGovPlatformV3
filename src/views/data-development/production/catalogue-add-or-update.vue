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
				<el-form-item label="父级目录" prop="parentPath">
					<el-input disabled v-model="dataForm.parentPath" placeholder=""></el-input>
				</el-form-item>
				<el-form-item label="名称" prop="name">
					<el-input v-model="dataForm.name" placeholder="名称"></el-input>
				</el-form-item>
				<el-form-item label="作业类型" prop="taskType" v-if="!!!dataForm.ifLeaf">
					<fast-select :disabled="!!dataForm.id" v-model="dataForm.taskType" placeholder="作业类型" dict-type="production_task_type" clearable></fast-select>
				</el-form-item>
				<el-form-item label="SQL类型" prop="taskSqlType" v-if="dataForm.taskType == '1'">
					<fast-select v-model="dataForm.taskSqlType" placeholder="SQL类型" dict-type="database_type" clearable></fast-select>
				</el-form-item>
				<el-form-item label="序号" prop="orderNo">
					<el-input-number v-model="dataForm.orderNo" :max='9999' placeholder="序号"></el-input-number>
				</el-form-item>
				<el-form-item label="描述" prop="description">
					<el-input type="textarea" v-model="dataForm.description"></el-input>
				</el-form-item>
		</el-form>
		<template #footer>
			<el-button @click="visible = false">取消</el-button>
			<el-button type="primary" @click="submitHandle()">确定</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, inject } from 'vue'
import { ElMessage } from 'element-plus/es'
import { useCatalogueApi, useCatalogueSubmitApi } from '@/api/data-development/catalogue'
import { useOrgListApi } from '@/api/sys/orgs'

const emit = defineEmits(['refreshDataList'])

const visible = ref(false)
const dataFormRef = ref()
const orgList = ref([])
//从父组件获取
const editorValues = inject("editorValues")
const editableTabs = inject("editableTabs")
const currentNodeData = inject("currentNodeData")

const dataForm = reactive({
	orgId: '',
	parentId: '',
	parentPath: '',
	path: '',
	name: '',
	taskType: '',
	taskSqlType: '',
	orderNo: 0,
	ifLeaf: 1,
	description: ''
	})

const init = (id?: number, parentId: any, parentPath: any, ifLeaf: any) => {
	visible.value = true
	
	// 重置表单数据
	if (dataFormRef.value) {
		dataFormRef.value.resetFields()
	}
	
	dataForm.id = ''

	// 重置表单数据
	if (dataFormRef.value) {
		dataFormRef.value.resetFields()
	}
	
	if(parentId) {
		useCatalogueApi(parentId).then(res => {
			if(res.data) {
				useOrgListApi(res.data.orgId).then(res => {
					orgList.value = res.data
				})
			}
		})
	} else {
		//获取部门列表
		useOrgListApi().then(res => {
			orgList.value = res.data
		})
	}
	
	
	dataForm.parentId = parentId
	dataForm.parentPath = parentPath
	dataForm.ifLeaf = ifLeaf

	if (id) {
		getCatalogue(id)
	}
}

const getCatalogue = (id: number) => {
	useCatalogueApi(id).then(res => {
		Object.assign(dataForm, res.data)
	})
}

const dataRules = ref({
	orgId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	name: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	taskType: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	taskSqlType: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	orderNo: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})

// 表单提交
const submitHandle = () => {
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}

		useCatalogueSubmitApi(dataForm).then(() => {
			//console.log(dataForm)
			//修改的时候刷新tab的值
			if (dataForm.id) {
				let targetName = dataForm.id + ''
				if(editorValues[targetName]) {
					editorValues[targetName]["nodeData"] = dataForm
					if (currentNodeData.value.id == dataForm.id) {
						currentNodeData.value = dataForm
					}
					const tabs = editableTabs.value
					for(let i in tabs) {
						let tab = tabs[i]
						if(tab.name == targetName) {
							tab.title = dataForm.name
							break
						}
					}
				}
			}
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
