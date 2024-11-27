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
				<el-form-item label="编码" prop="code">
					<el-input v-model="dataForm.code" placeholder="编码"></el-input>
				</el-form-item>
				<el-form-item label="类型" prop="ifLeaf" v-if="dataForm.parentId != 0">
					<el-select v-model="dataForm.ifLeaf" placeholder="类型" :disabled="!!dataForm.id">
						<el-option :key="1" label="目录" :value="1"/>
						<el-option :key="0" label="元模型" :value="0"/>
					</el-select>
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
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus/es'
import { useMetamodelApi, useMetamodelSubmitApi } from '@/api/data-governance/metamodel'
import { useOrgListApi } from '@/api/sys/orgs'

const emit = defineEmits(['refreshDataList'])

const visible = ref(false)
const dataFormRef = ref()
const orgList = ref([])

const dataForm = reactive({
	orgId: '',
	parentId: '',
	parentPath: '',
	path: '',
	name: '',
	code: '',
	ifLeaf: 1,
	orderNo: 0,
	description: ''
})

const init = (id?: number, parentId: any, parentPath: any) => {
	visible.value = true
	
	dataForm.id = ''

	// 重置表单数据
	if (dataFormRef.value) {
		dataFormRef.value.resetFields()
	}
	dataForm.parentId = parentId
	dataForm.parentPath = parentPath
	
	if(parentId) {
		useMetamodelApi(parentId).then(res => {
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
	
	
	if (id) {
		getMetamodel(id)
	}
}

const getMetamodel = (id: number) => {
	useMetamodelApi(id).then(res => {
		Object.assign(dataForm, res.data)
	})
}

const dataRules = ref({
	orgId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	name: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	code: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	ifLeaf: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	orderNo: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})
// 表单提交
const submitHandle = () => {
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}
		dataForm.ifLeaf = dataForm.parentId == 0 ? 1 : dataForm.ifLeaf
		useMetamodelSubmitApi(dataForm).then(() => {
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
