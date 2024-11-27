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
			<el-form-item label="名称" prop="name" label-width="auto">
				<el-input v-model="dataForm.name" placeholder="名称"></el-input>
			</el-form-item>
			<el-form-item label="提交方式" prop="submitType" label-width="auto">
				<fast-select v-model="dataForm.submitType" dict-type="submit_type" placeholder="请选择" clearable></fast-select>
			</el-form-item>
			<el-form-item label="文件地址" prop="path" label-width="auto">
				<el-input v-model="dataForm.path" placeholder="文件地址(选择 standalone 填写程序能访问到的文件绝对路径; 选择 hdfs 填写 hdfs 的文件地址)"></el-input>
			</el-form-item>
			<el-form-item label="主类(启动类)" prop="mainClass" label-width="auto">
				<el-input v-model="dataForm.mainClass" placeholder="jar包的主类,如 net.srt.AppJar"></el-input>
			</el-form-item>
			<el-form-item label="主类参数" prop="params" label-width="auto">
				<el-input v-model="dataForm.params" placeholder="格式:--key1 value1 --key2 value2, 比如 --id 2 --name xxx"></el-input>
			</el-form-item>
			<el-form-item label="备注" prop="note" label-width="auto">
				<el-input type="textarea" rrows="3" v-model="dataForm.note" placeholder="备注"></el-input>
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
import { useJarApi, useJarSubmitApi } from '@/api/data-development/jar'
import { useOrgListApi } from '@/api/sys/orgs'

const emit = defineEmits(['refreshDataList'])

const visible = ref(false)
const dataFormRef = ref()
const orgList = ref([])

const dataForm = reactive({
	orgId: '',
	name: '',
	submitType: '',
	path: '',
	mainClass: '',
	params: '',
	note: ''
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
		getJar(id)
	}
}

const getJar = (id: number) => {
	useJarApi(id).then(res => {
		Object.assign(dataForm, res.data)
	})
}

const dataRules = ref({
	orgId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	name: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	submitType: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	path: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	mainClass: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})

// 表单提交
const submitHandle = () => {
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}

		useJarSubmitApi(dataForm).then(() => {
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
