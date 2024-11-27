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
				<el-form-item label="实例名称" prop="name">
					<el-input v-model="dataForm.name" placeholder="实例名称"></el-input>
				</el-form-item>
				<el-form-item label="别名" prop="alias">
					<el-input v-model="dataForm.alias" placeholder="别名"></el-input>
				</el-form-item>
				<el-form-item label="实例类型" prop="type">
					<fast-select v-model="dataForm.type" dict-type="production_cluster_type" placeholder="请选择" clearable></fast-select>
				</el-form-item>
				<el-form-item label="实例地址" prop="hosts">
					<el-input
					    v-model="dataForm.hosts"
					    :rows="3"
					    type="textarea"
					    placeholder="添加 Flink 集群的 JobManager 的 RestApi 地址。当 HA 模式时，地址间用英文逗号分隔，例如：192.168.40.135:8081,192.168.40.136:8081,192.168.40.137:8081"
					  />
				</el-form-item>
				<el-form-item label="启用" prop="enabled">
					<el-switch
					      v-model="dataForm.enabled"
					      :active-value="true"
					      :inactive-value="false"
					    />
				</el-form-item>
				<el-form-item label="备注" prop="note">
					<el-input v-model="dataForm.note" placeholder="备注"></el-input>
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
import { useClusterApi, useClusterSubmitApi } from '@/api/data-development/cluster'
import { useOrgListApi } from '@/api/sys/orgs'

const emit = defineEmits(['refreshDataList'])

const visible = ref(false)
const dataFormRef = ref()
const orgList = ref([])

const dataForm = reactive({
	orgId: '',
	name: '',
	alias: '',
	type: '',
	hosts: '',
	enabled: true,
	note: ''})

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
		getCluster(id)
	}
}

const getCluster = (id: number) => {
	useClusterApi(id).then(res => {
		Object.assign(dataForm, res.data)
	})
}

const dataRules = ref({
	orgId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	name: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	alias: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	type: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	hosts: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})

// 表单提交
const submitHandle = () => {
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}

		useClusterSubmitApi(dataForm).then(() => {
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
