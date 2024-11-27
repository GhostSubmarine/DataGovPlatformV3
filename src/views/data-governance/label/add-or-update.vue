<template>
	<el-dialog v-model="visible" :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false">
		<el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="100px" @keyup.enter="submitHandle()">
				<el-form-item prop="orgId" label="所属机构" label-width="auto">
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
				<el-form-item label="父级目录" prop="parentPath" label-width="auto">
					<el-input disabled v-model="dataForm.parentPath" placeholder=""></el-input>
				</el-form-item>
				<el-form-item label="名称" prop="name" label-width="auto">
					<el-input v-model="dataForm.name" placeholder="名称"></el-input>
				</el-form-item>
				<el-form-item label="类型" prop="type" v-if="dataForm.parentId != 0" label-width="auto">
					<el-select v-model="dataForm.type" placeholder="类型" :disabled="!!dataForm.id">
						<el-option :key="0" label="普通目录" :value="0"/>
						<el-option :key="1" label="标签目录" :value="1"/>
					</el-select>
				</el-form-item>
				<el-form-item label="序号" prop="orderNo" label-width="auto">
					<el-input-number v-model="dataForm.orderNo" :max='9999' placeholder="序号"></el-input-number>
				</el-form-item>
				<el-form-item label="描述" prop="description" label-width="auto">
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
import { useCategoryApi, useCategorySubmitApi } from '@/api/data-governance/label'
import { useOrgListApi } from '@/api/sys/orgs'

const orgList = ref([])

const emit = defineEmits(['refreshDataList'])

const visible = ref(false)
const dataFormRef = ref()

const dataForm = reactive({
	orgId: '',
	parentId: '',
	parentPath: '',
	path: '',
	name: '',
	type: 0,
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
	
	//获取部门列表
	useOrgListApi().then(res => {
		orgList.value = res.data
	})
	
	if (id) {
		getCategory(id)
	}
}

const getCategory = (id: number) => {
	useCategoryApi(id).then(res => {
		Object.assign(dataForm, res.data)
	})
}

const dataRules = ref({
	orgId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	name: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	type: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	orderNo: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})

// 表单提交
const submitHandle = () => {
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}
		dataForm.type = dataForm.parentId == 0 ? 0 : dataForm.type
		useCategorySubmitApi(dataForm).then(() => {
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
