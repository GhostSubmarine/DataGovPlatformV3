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
			<el-form-item label="任务名称" prop="name" >
				<el-input v-model="dataForm.name" placeholder="任务名称"></el-input>
			</el-form-item>
			<el-form-item label="推送配置" prop="dataPushConfigId">
				<el-select placeholder="请选择"
						   filterable
						   clearable
				           v-model="dataForm.dataPushConfigId">
				  <el-option v-for="(item,index) in dataPushConfigs"
				             :key="item.name"
				             :label="item.name"
				             :value="item.id"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="http参数" prop="httpParams" v-if="dataForm.dataPushConfigId == 1">
				<el-input type="textarea" rows="3" v-model="dataForm.httpParams" placeholder="http参数"></el-input>
			</el-form-item>
			<el-form-item label="推送类型" prop="pushType">
				 <fast-select v-model="dataForm.pushType" dict-type="data_push_type" placeholder="推送类型" clearable></fast-select>
			</el-form-item>
			<el-form-item label="表名" prop="tableName" v-if="dataForm.pushType==1">
				<el-select placeholder="请选择表名"
						   filterable
						   clearable
						    @change="tableChange"
				           v-model="dataForm.tableName">
				  <el-option v-for="(item,index) in middleDbTables"
				             :key="item.tableName"
				             :label="item.tableName"
				             :value="item.tableName"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="推送sql" prop="sqlText" v-if="dataForm.pushType==2">
				<div>
					<div style="padding-bottom: 5px;">
						<el-button type="warning" size="small" @click="getColumnInfo()">解析 SQL</el-button>
						<el-tooltip placement="right"  content="SQL 为单条 SELECT 语句,点击解析 SQL 可以获取字段列表">
						   <el-icon><QuestionFilled /></el-icon>
						</el-tooltip>
					</div>
					<div style="height:150px;width: 800px;">
						<SqlStudio ref="sqlStudioRef" id="pushDataSql"></SqlStudio>
					</div>
				</div>
			</el-form-item>
			<el-form-item label="对象名" prop="objectName">
				<el-input v-model="dataForm.objectName" placeholder="对象名" style="width: 220px"></el-input>
				<el-tooltip placement="right"  content="推送给接收方的对象名">
				   <el-icon><QuestionFilled /></el-icon>
				</el-tooltip>
			</el-form-item>
			<el-form-item label="增量推送" prop="incrementFlag">
				 <fast-select v-model="dataForm.incrementFlag" dict-type="yes_or_no" placeholder="启用增量推送" clearable></fast-select>
			</el-form-item>
			<el-form-item label="增量字段" prop="incrementColumn" v-if="dataForm.incrementFlag == 1">
				<el-select v-model="dataForm.incrementColumn"
							 clearable
							 filterable
				           placeholder="请选择">
				  <el-option v-for="(item,index) in sqlColumns"
				             :key="item.fieldName"
				             :label="`${item.fieldName}`"
				             :value="item.fieldName"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="批次数据量" prop="batchSize">
			  <el-select v-model="dataForm.batchSize">
				<el-option label="1"
				           :value="1"></el-option>
			    <el-option label="10"
			               :value="10"></el-option>
			    <el-option label="50"
			               :value="50"></el-option>
			    <el-option label="100"
			               :value="100"></el-option>
			    <el-option label="200"
						  :value="200"></el-option>
				<el-option label="300"
						  :value="300"></el-option>
				<el-option label="500"
						  :value="500"></el-option>
			  </el-select>
			</el-form-item>
			<el-form-item label="调度类型" prop="taskType">
				<fast-radio-group v-model="dataForm.taskType" dict-type="data_push_task_type"></fast-radio-group>
			</el-form-item>
			<el-form-item label="cron表达式" prop="cron" v-if="dataForm.taskType=='3'">
				<el-input v-model="dataForm.cron" placeholder="cron表达式"></el-input>
			</el-form-item>
			<el-form-item label="描述" prop="description">
				<el-input type="textarea" rows="2" v-model="dataForm.description" placeholder="描述"></el-input>
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
import { useOrgListApi } from '@/api/sys/orgs'
import { listMiddleDbTables,listColumnsByIdAndSql,listMiddleDbColumnsApi } from '@/api/data-integrate/database'
import { useDataPushTaskApi, useDataPushTaskSubmitApi,listDataPushConfigs } from '@/api/data-governance/dataPushTask'
import SqlStudio from '../../data-integrate/access/sql-studio.vue'


onMounted(() => {
	listMiddleDbTables().then( res => {
		middleDbTables.value = res.data
	})
	listDataPushConfigs().then(res=>{
		dataPushConfigs.value = res.data.list
	})
})

const emit = defineEmits(['refreshDataList'])

const dataPushConfigs = ref([])
const orgList = ref([])
const visible = ref(false)
const dataFormRef = ref()
const sqlStudioRef = ref() 
const middleDbTables = ref()
const sqlColumns = ref([])

const dataForm = reactive({
	orgId: '',
	name: '',
	dataPushConfigId: '',
	httpParams: '{\"url\":\"xxx\",\"headers\":{\"header1\":\"xxx1\",\"header2\":\"xxx2\"},\"params\":{\"param1\":\"xxx1\",\"param2\":\"xxx2\"}}',
	pushType: '',
	tableName: '',
	objectName: '',
	sqlText: '',
	taskType: '',
	cron: '',
	description: '',
	incrementFlag: '',
	incrementColumn: '',
	batchSize: 10,
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
		getDataPushTask(id)
	}
}

const getColumnInfo = () => {
	const sourceSql = sqlStudioRef.value.getEditorValue()
	if (!sourceSql) {
		ElMessage.warning("请填写 SQL 语句（单条 SELECT）！");
		return
	}
	//获取字段
	listColumnsByIdAndSql(-1, {sql: sourceSql}).then(res=>{
		sqlColumns.value = res.data
		ElMessage.success("解析成功！");
	})
}

const tableChange = (tableName: any) => {
	if(tableName) {
		listMiddleDbColumnsApi(tableName).then(res=>{
			sqlColumns.value = res.data
		})
	}
}

const getDataPushTask = (id: number) => {
	useDataPushTaskApi(id).then(res => {
		Object.assign(dataForm, res.data)
		if(dataForm.pushType == '2') {
			setTimeout(()=>{
				sqlStudioRef.value.setEditorValue(dataForm.sqlText)
			},300)
		}
		if(dataForm.tableName) {
			listMiddleDbColumnsApi(dataForm.tableName).then(res=>{
				sqlColumns.value = res.data
			})
		}
		if(dataForm.sqlText) {
			listColumnsByIdAndSql(-1, {sql: dataForm.sqlText}).then(res=>{
				sqlColumns.value = res.data
			})
		}
	})
}

const dataRules = ref({
	orgId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	name: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	dataPushConfigId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	httpParams: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	pushType:  [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	tableName:  [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	objectName:  [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	sqlText:  [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	taskType:  [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	cron:  [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	incrementFlag:  [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	incrementColumn:  [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	batchSize:  [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})

// 表单提交
const submitHandle = () => {
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}
		if(dataForm.dataPushConfigId != 1) {
			dataForm.httpParams = null
		}
		//如果不是周期性增量同步
		if(dataForm.taskType != '3') {
			dataForm.cron = null
		}
		if(dataForm.pushType == '1') {
			dataForm.sqlText = null
		} else {
			dataForm.sqlText = sqlStudioRef.value.getEditorValue()
		}
		if(dataForm.incrementFlag == 0) {
			dataForm.incrementColumn = null
		}
		useDataPushTaskSubmitApi(dataForm).then(() => {
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
