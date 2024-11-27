<template>
	<el-dialog v-model="visible" :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false">
		<el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="100px" @keyup.enter="submitHandle()">
			<el-form-item label="英文名称" prop="engName" label-width="auto">
				<el-input v-model="dataForm.engName" placeholder="英文名称"></el-input>
			</el-form-item>
			<el-form-item label="中文名称" prop="cnName" label-width="auto">
				<el-input v-model="dataForm.cnName" placeholder="中文名称"></el-input>
			</el-form-item>
			<el-form-item label="标准类型" prop="type" label-width="auto">
				<fast-select v-model="dataForm.type" disabled dict-type="standard_type" placeholder="标准类型" clearable></fast-select>
			</el-form-item>
			<el-form-item label="数据类型" prop="dataType" v-if="dataForm.type == 1" label-width="auto">
				<fast-select v-model="dataForm.dataType" dict-type="standard_data_type" placeholder="数据类型" clearable></fast-select>
			</el-form-item>
			<el-form-item label="长度" prop="dataLength" v-if="dataForm.type == 1" label-width="auto">
				<el-input-number v-model="dataForm.dataLength" :max='9999999' placeholder="长度" clearable></el-input-number>
			</el-form-item>
			<el-form-item label="精度(小数位数)" prop="dataPrecision" v-if="dataForm.type == 1" label-width="auto">
				<el-input-number v-model="dataForm.dataPrecision" :max='10' placeholder="精度" clearable></el-input-number>
			</el-form-item>
			<el-form-item label="允许为空" prop="nullable" v-if="dataForm.type == 1" label-width="auto">
				<fast-select v-model="dataForm.nullable" dict-type="yes_or_no" placeholder="请选择" clearable></fast-select>
			</el-form-item>
			<el-form-item label="描述" prop="note" label-width="auto">
				<el-input type="textarea"  :rows="3" v-model="dataForm.note" placeholder="描述"></el-input>
			</el-form-item>
			<!-- <el-form-item label="关联码表" prop="standardCodeId" v-if="dataForm.type == 1" label-width="auto">
				<el-select v-model="dataForm.standardCodeId"
									 clearable
									 filterable 
				           placeholder="请选择">
				  <el-option v-for="(item,index) in standardCodeList"
				             :key="item.id"
				             :label="`[${item.engName}]${item.cnName}`"
				             :value="item.id"></el-option>
				</el-select>
			</el-form-item> -->
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
import { useStandardApi, useStandardSubmitApi } from '@/api/data-governance/dataStandard'

const emit = defineEmits(['refreshDataList'])

const visible = ref(false)
const dataFormRef = ref()

const dataForm = reactive({
	engName: '',
	cnName: '',
	type: '',
	dataType: '',
	dataLength: 0,
	dataPrecision: 0,
	nullable: '',
	note: '',
	standardCodeId: ''
})

const standardCodeList = ref([])
const init = (id,type,categoryId) => {
	visible.value = true
	dataForm.id = ''

	// 重置表单数据
	if (dataFormRef.value) {
		dataFormRef.value.resetFields()
	}
	//标注类型 1-标准字段 2-标准码表
	dataForm.type = type
	dataForm.categoryId = categoryId

	if (id) {
		getStandard(id)
	}
}

const getStandard = (id: number) => {
	useStandardApi(id).then(res => {
		Object.assign(dataForm, res.data)
	})
}

const dataRules = ref({
	engName: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	cnName: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	type: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	dataType: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	nullable: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})

// 表单提交
const submitHandle = () => {
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}
		dataForm.codeNum = dataForm.codeNum?dataForm.codeNum:0
		useStandardSubmitApi(dataForm).then(() => {
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
