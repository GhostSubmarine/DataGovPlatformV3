<template>
	<el-dialog v-model="visible" :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false">
		<el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="100px" @keyup.enter="submitHandle()">
			<el-form-item label="属性名称" prop="name">
				<el-input v-model="dataForm.name" placeholder="属性名称"></el-input>
			</el-form-item>
			<el-form-item label="属性代码" prop="code">
				<el-input v-model="dataForm.code" placeholder="属性代码"></el-input>
			</el-form-item>
			<el-form-item label="数据类型" prop="dataType">
				<fast-select v-model="dataForm.dataType" dict-type="model_property_data_type" placeholder="请选择" clearable></fast-select>
			</el-form-item>
			<el-form-item label="输入控件" prop="inputType">
				<fast-select v-model="dataForm.inputType" dict-type="model_property_input_type" placeholder="请选择" clearable></fast-select>
			</el-form-item>
			<el-form-item label="数据长度" prop="dataLength">
				<el-input-number v-model="dataForm.dataLength" :max='9999' placeholder="数据长度"></el-input-number>
			</el-form-item>
			<el-form-item label="允许为空" prop="nullable">
				<fast-select v-model="dataForm.nullable" dict-type="yes_or_no" placeholder="请选择" clearable></fast-select>
			</el-form-item>
			<el-form-item label="序号" prop="orderNo">
				<el-input-number v-model="dataForm.orderNo" :max='9999' placeholder="数据长度"></el-input-number>
			</el-form-item>
			<el-form-item label="说明" prop="comment">
				<el-input type="textarea"  :rows="3" v-model="dataForm.comment" placeholder="说明"></el-input>	
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
import { usePropertyApi, usePropertySubmitApi } from '@/api/data-governance/metamodelProperty'

const emit = defineEmits(['refreshDataList'])

const visible = ref(false)
const dataFormRef = ref()

const dataForm = reactive({
	name: '',
	code: '',
	dataType: '',
	inputType: '',
	dataLength: 10,
	orderNo: 0,
	nullable: '',
	comment: '',
})

const init = (id?: number, metamodelId: number) => {
	visible.value = true
	dataForm.id = ''

	// 重置表单数据
	if (dataFormRef.value) {
		dataFormRef.value.resetFields()
	}
	
	dataForm.metamodelId = metamodelId

	if (id) {
		getProperty(id)
	}
}

const getProperty = (id: number) => {
	usePropertyApi(id).then(res => {
		Object.assign(dataForm, res.data)
	})
}

const dataRules = ref({
	name: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	code: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	dataType: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	inputType: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	dataLength: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	nullable: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})

// 表单提交
const submitHandle = () => {
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}

		usePropertySubmitApi(dataForm).then(() => {
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
