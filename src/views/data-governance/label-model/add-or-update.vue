<template>
	<el-dialog v-model="visible" :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false" width="60%">
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
			<el-form-item label="类型" prop="type" label-width="auto">
				<fast-select v-model="dataForm.type" dict-type="label_model_type" placeholder="类型" clearable filterable></fast-select>
			</el-form-item>
			<el-form-item label="选择表" prop="type" v-if="dataForm.type == 1" label-width="auto">
				<el-cascader
				  v-model="dataForm.tableNameAll"
				  style="width: 100%"
				  clearable
				  :show-all-levels="true"
				  :props="pickTableProps"
				  :options="pickTableList">
				  <template #default="{ node, data }">
				    <span>{{ data.name }}</span>
				  </template>
				</el-cascader>
			</el-form-item>
			<el-form-item label="SQL" prop="sqlText" v-if="dataForm.type == 2" label-width="auto">
				<div>
					<div style="padding-bottom: 5px;">
						<el-button type="warning" size="small" @click="checkSql()">检查sql</el-button>
					</div>
					<div style="height:150px;width: 600px;">
						<SqlStudio ref="sqlStudioRef" id="labelModelSql"></SqlStudio>
					</div>
				</div>
			</el-form-item>
			<el-form-item label="说明" prop="description" label-width="auto">
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
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus/es'
import { useLabelModelApi, useLabelModelSubmitApi } from '@/api/data-governance/labelModel'
import { checkSqlApi } from '@/api/data-governance/labelModel'
import { useOrgListApi } from '@/api/sys/orgs'
import { listMiddleDbTreeApi } from '@/api/data-integrate/database'
import SqlStudio from './sql-studio.vue'

onMounted(()=>{
	//获取表级联数据
	listMiddleDbTreeApi().then(res=>{
		pickTableList.value = res.data[0].children
	})
})

const emit = defineEmits(['refreshDataList'])

const pickTableProps = ref({
  value: 'name',
  children: 'children',
  label: 'name'
}) 

const pickTableList = ref([])

const visible = ref(false)
const dataFormRef = ref()
const orgList = ref([])
const sqlStudioRef = ref()

const dataForm = reactive({
	orgId: '',
	name: '',
	description: '',
	type: '',
	tableNameAll: [],
	tableName: '',
	sqlText: '',
})

const init = (id?: number) => {
	visible.value = true
	dataForm.id = ''

	// 重置表单数据
	if (dataFormRef.value) {
		dataFormRef.value.resetFields()
	}

	useOrgListApi().then(res => {
		orgList.value = res.data
	})

	if (id) {
		getLabelModel(id)
	}
}

const getLabelModel = (id: number) => {
	useLabelModelApi(id).then(res => {
		Object.assign(dataForm, res.data)
		//如果有sql
		if(dataForm.sqlText) {
			//获取sql
			setTimeout(()=>{
				sqlStudioRef.value.setEditorValue(dataForm.sqlText)
			},300)
		}
	})
}

const dataRules = ref({
	orgId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	name: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	type: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	tableNameAll: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	sqlText: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})

const checkSql = () => {
	const sourceSql = sqlStudioRef.value.getEditorValue()
	if (!sourceSql) {
		ElMessage.warning("请填写 SQL 语句（单条 SELECT）！");
	}
	//检查sql
	checkSqlApi(sourceSql).then(res=> {
		if(res.data.success) {
			ElMessage.success("SQL检测成功，可以正常执行")
		} else {
			ElMessage.error("SQL检测有误："+res.data.errorMsg)
		}
	})
	
}

// 表单提交
const submitHandle = () => {
	if(dataForm.type == 2) {
		dataForm.sqlText = sqlStudioRef.value.getEditorValue()
	}	
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}

		if(dataForm.type == 1) {
			dataForm.tableName = dataForm.tableNameAll[1]
			dataForm.sqlText = null
		} 
		if(dataForm.type == 2) {
			dataForm.tableName = null
			dataForm.tableNameAll = null
		} 

		useLabelModelSubmitApi(dataForm).then(() => {
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
