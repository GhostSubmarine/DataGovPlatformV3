<template>
	<el-dialog v-model="visible" :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false">
		<el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="100px" @keyup.enter="submitHandle()">
			<el-form-item label="字段名称" prop="name" label-width="auto">
				<el-input v-model="dataForm.name" placeholder="字段名称"></el-input>
			</el-form-item>
			<el-form-item label="中文名称" prop="cnName" label-width="auto">
				<el-input v-model="dataForm.cnName" placeholder="中文名称"></el-input>
			</el-form-item>
			<el-form-item label="注释" prop="comment" label-width="auto">
				<el-input v-model="dataForm.comment" placeholder="注释"></el-input>
			</el-form-item>
			<el-form-item label="主键" prop="pk" label-width="auto">
				<fast-select v-model="dataForm.pk" dict-type="yes_or_no" placeholder="请选择"></fast-select>
			</el-form-item>
			<el-form-item label="主键类型" prop="pkType" v-if="dataForm.pk==1" label-width="auto">
				<fast-select v-model="dataForm.pkType" dict-type="fill_table_pk_type" placeholder="请选择"></fast-select>
			</el-form-item>
			<el-form-item label="数据类型" prop="fieldType" label-width="auto">
				<fast-select v-model="dataForm.fieldType" dict-type="fill_table_column_type" placeholder="请选择"></fast-select>
			</el-form-item>
			<el-form-item label="录入类型" prop="fillType" label-width="auto">
				<fast-select v-model="dataForm.fillType" dict-type="fill_table_column_fill_type" placeholder="请选择"></fast-select>
			</el-form-item>
			<el-form-item label="选择的值" prop="fillValues" v-if="dataForm.fillType == 2" label-width="auto">
				<el-input v-model="dataForm.fillValues" placeholder="多个值之前使用英文逗号分隔,例如1,2"></el-input>
			</el-form-item>
			<el-form-item label="字段长度" prop="fieldLength" label-width="auto">
				 <el-input-number v-model="dataForm.fieldLength" :min="1" :max="999999" label="字段长度"></el-input-number>
			</el-form-item>
			<el-form-item label="小数位数" prop="sacle" v-if="dataForm.fieldType == 1" label-width="auto">
				 <el-input-number v-model="dataForm.sacle" :min="1" :max="20" label="小数位数"></el-input-number>
			</el-form-item>
			<el-form-item label="是否可为空" prop="nullable" label-width="auto">
				<fast-select v-model="dataForm.nullable" dict-type="yes_or_no" placeholder="请选择"></fast-select>
			</el-form-item>
			<el-form-item label="录入是否隐藏" prop="fillHide" label-width="auto">
				<fast-select v-model="dataForm.fillHide" dict-type="yes_or_no" placeholder="请选择"></fast-select>
			</el-form-item>
			<el-form-item label="是否查询条件" prop="ifQuery" label-width="auto">
				<fast-select v-model="dataForm.ifQuery" dict-type="yes_or_no" placeholder="请选择"></fast-select>
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
import { useDataFillTableColumnApi, useDataFillTableColumnSubmitApi } from '@/api/data-integrate/dataFillTableColumn'

const emit = defineEmits(['refreshDataList'])

const visible = ref(false)
const dataFormRef = ref()

const dataForm = reactive({
	tableId: '',
	name: '',
	cnName: '',
	comment: '',
	pk: '',
	pkType: '',
	fieldType: '',
	fillType: '',
	fillValues: '',
	fieldLength: 10,
	sacle: 0,
	nullable: '',
	fillHide: '',
	ifQuery: '',
})

const init = (id?: number, tableId: number) => {
	visible.value = true
	dataForm.id = ''

	// 重置表单数据
	if (dataFormRef.value) {
		dataFormRef.value.resetFields()
	}
	
	dataForm.tableId = tableId
	if (id) {
		getDataFillTableColumn(id)
	}
}

const getDataFillTableColumn = (id: number) => {
	useDataFillTableColumnApi(id).then(res => {
		Object.assign(dataForm, res.data)
	})
}

const dataRules = ref({
	name: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	cnName: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	pk: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	pkType: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	fieldType: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	fillType: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	fillValues: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	fieldLength: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	sacle: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	nullable: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	fillHide: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	ifQuery: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})

// 表单提交
const submitHandle = () => {
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}

		useDataFillTableColumnSubmitApi(dataForm).then(() => {
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
