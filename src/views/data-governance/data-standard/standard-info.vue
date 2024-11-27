<template>
	<el-dialog v-model="visible" title="详情" :close-on-click-modal="false">
		<el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="100px">
			<el-form-item label="英文名称" prop="engName" label-width="auto">
				<span>{{dataForm.engName}}</span>
			</el-form-item>
			<el-form-item label="中文名称" prop="cnName" label-width="auto">
				<span>{{dataForm.cnName}}</span>
			</el-form-item>
			<el-form-item label="标准类型" prop="type" label-width="auto">
				<fast-select v-model="dataForm.type" disabled dict-type="standard_type" placeholder="标准类型" clearable></fast-select>
			</el-form-item>
			<el-form-item label="数据类型" prop="dataType" v-if="dataForm.type == 1" label-width="auto">
				<fast-select v-model="dataForm.dataType" disabled dict-type="standard_data_type" placeholder="数据类型" clearable></fast-select>
			</el-form-item>
			<el-form-item label="长度" prop="dataLength" v-if="dataForm.type == 1" label-width="auto">
				<span>{{dataForm.dataLength}}</span>
			</el-form-item>
			<el-form-item label="精度(小数位数)" prop="dataPrecision" v-if="dataForm.type == 1" label-width="auto">
				<span>{{dataForm.dataPrecision}}</span>
			</el-form-item>
			<el-form-item label="允许为空" prop="nullable" v-if="dataForm.type == 1" label-width="auto">
				<fast-select disabled v-model="dataForm.nullable" dict-type="yes_or_no" placeholder="请选择" clearable></fast-select>
			</el-form-item>
			<el-form-item label="描述" prop="note" label-width="auto">
				<span>{{dataForm.note}}</span>
			</el-form-item>
			<!-- <el-form-item label="关联码表" prop="standardCodeId" v-if="dataForm.type == 1" label-width="auto">
				<el-select v-model="dataForm.standardCodeId"
									 disabled
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
const init = (id) => {
	visible.value = true
	dataForm.id = ''

	// 重置表单数据
	if (dataFormRef.value) {
		dataFormRef.value.resetFields()
	}

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
	
})

defineExpose({
	init
})
</script>
