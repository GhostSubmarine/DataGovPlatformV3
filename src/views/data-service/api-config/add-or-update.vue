<template>
	<el-drawer v-model="visible" :title="!dataForm.id ? '新增' : '修改'" size="100%" :destroy-on-close="true">
		<div>
			<el-tabs
			  tab-position="top"
			>
				<el-tab-pane label="基本信息">
					 <el-form ref="basicDataFormRef" :rules="basicDataFormRules" :model="basicDataForm">
						<el-form-item label="名称" prop="name" label-width="auto">
							<el-input v-model="basicDataForm.name" placeholder="名称"></el-input>
						</el-form-item>
						<el-form-item label="api路径" prop="path" label-width="auto">
							<el-input v-model="basicDataForm.path" placeholder="api路径">
								<template #prepend>{{ipPortAddress}}</template>
							</el-input>
						</el-form-item>
						<el-form-item label="请求方式" prop="type" label-width="auto">
							<fast-select v-model="basicDataForm.type" dict-type="api_type" placeholder="请选择" clearable filterable></fast-select>
						</el-form-item>
						<el-form-item label="描述" prop="note" label-width="auto">
						 <el-input
								v-model="basicDataForm.note"
								:rows="2"
								type="textarea"
								placeholder="描述"
							/>
						</el-form-item>
					 </el-form>
				</el-tab-pane>
				<el-tab-pane label="API SQL 配置">
					 <el-form ref="apiSqlFormRef" :rules="apiSqlFormRules" :model="apiSqlForm">
						<el-form-item label="选择" prop="sqlDbType" label-width="auto">
							<el-radio-group v-model="apiSqlForm.sqlDbType">
								<el-radio :label="1" border>数据库</el-radio>
								<el-radio :label="2" border>中台库</el-radio>
							</el-radio-group>
							<el-button style="margin-left:20px" :icon="Search" type="primary" v-show="!!apiSqlForm.sqlDbType" @click="dbLook()">库表信息</el-button>
						</el-form-item>
						<el-form-item label="选择" prop="databaseId" v-if="apiSqlForm.sqlDbType=='1'" label-width="auto">
							<el-select v-model="apiSqlForm.databaseId"
												 clearable
												 filterable 
												 placeholder="请选择">
								<el-option v-for="(item,index) in apiSqlForm.databaseList"
													 :key="item.id"
													 :label="`[${item.id}]${item.name}`"
													 :value="item.id"></el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="sql分隔符" prop="sqlSeparator" label-width="auto">
							<el-tooltip
									class="box-item"
									effect="dark"
									content="sql 语句将按照填写的 sql 分割符进行分割"
									placement="top-end"
								>
								<el-input v-model="apiSqlForm.sqlSeparator">
									<template #prepend>sql分割符:</template>
								</el-input>
							</el-tooltip>
						</el-form-item>
						<el-form-item label="开启事务" label-width="auto" prop="openTrans">
							<el-tooltip
									effect="dark"
									content="如果数据库本身不支持事务, 则不要开启"
									placement="top-end"
								>
								<el-switch
									v-model="apiSqlForm.openTrans"
									:active-value="1"
									:inactive-value="0"
								/>
							</el-tooltip>
						</el-form-item>
						<el-form-item label="查询最大行数" label-width="auto" prop="sqlMaxRow">
							<el-tooltip
									effect="dark"
									content="select语句查询返回的最大行数,若分页此参数无效"
									placement="top-end"
								>
								<el-input-number v-model="apiSqlForm.sqlMaxRow" :min="1" :max="1000" />
							</el-tooltip>
						</el-form-item>
						<el-form-item label="自动分页" prop="pageAuto" label-width="auto">
							<el-tooltip
									class="box-item"
									effect="dark"
									content="若最后一条 sql 语句为 select 语句,会对其自动进行分页查询"
									placement="top-end"
								>
								<fast-select v-model="apiSqlForm.pageAuto" dict-type="yes_or_no"></fast-select>
							</el-tooltip>
						</el-form-item>
						<el-form-item label="页码参数名" prop="pageParam" label-width="auto" v-if="apiSqlForm.pageAuto == 1">
							<el-tooltip
									class="box-item"
									effect="dark"
									content="页码的参数名称"
									placement="top-end"
								>
								<el-input v-model="apiSqlForm.pageParam"></el-input>
							</el-tooltip>
						</el-form-item>
						<el-form-item label="每页条数参数名" prop="pageSizeParam" label-width="auto" v-if="apiSqlForm.pageAuto == 1">
							<el-tooltip
									class="box-item"
									effect="dark"
									content="查询每页指定条数的参数名称"
									placement="top-end"
								>
								<el-input v-model="apiSqlForm.pageSizeParam"></el-input>
							</el-tooltip>
						</el-form-item>
						<!-- sql 编辑器 -->
						<el-form-item label="sql语句" label-width="auto" prop="sqlText">
							<SqlStudio ref="sqlStudioRef" style="width: 100%;"></SqlStudio>
						</el-form-item>
						<el-form-item label="Content-Type" prop="contentType" label-width="auto">
							<fast-select v-model="apiSqlForm.contentType" dict-type="content_type"></fast-select>
						</el-form-item>
						<el-form-item label="请求参数示例" label-width="auto" prop="jsonParam">
							<ParamStudio id="requestParamStudio" ref="requestParamRef" style="height: 160px;width: 100%;"></ParamStudio>
						</el-form-item>
						<el-form-item label="响应结果示例" label-width="auto" prop="responseResult">	
							<ParamStudio id="responseResultStudio" ref="responseResultRef" style="height: 160px;width: 100%;"></ParamStudio>
						</el-form-item>
						<el-form-item label="权限" prop="previlege" label-width="auto">
							<el-tooltip
									class="box-item"
									effect="dark"
									content="开放接口可以直接访问, 私有接口需要在请求头携带 token 访问, 请前往 API 权限菜单查看"
									placement="top-end"
								>
								<el-radio-group v-model="apiSqlForm.previlege">
									<el-radio :label="0" border>开放</el-radio>
									<el-radio :label="1" border>私有</el-radio>
								</el-radio-group>
							</el-tooltip>
						</el-form-item>
					 </el-form>
				</el-tab-pane>
			</el-tabs>
		</div>
		<template #footer>
			<el-button @click="visible = false">取消</el-button>
			<el-button type="primary" @click="submitHandle()">提交</el-button>
		</template>
	</el-drawer>
	
	<el-dialog v-model="dbLookDialog" title="库表信息">
		<Databases ref="databasesRef" v-if="apiSqlForm.sqlDbType == 1"></Databases>
		<Middledb ref="middledbRef" v-if="apiSqlForm.sqlDbType == 2"></Middledb>
	</el-dialog>
	
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, provide } from 'vue'
import { ElMessage } from 'element-plus/es'
import { Search } from '@element-plus/icons-vue'
import { listDatabase } from '@/api/data-integrate/database'
import { useApiConfigApi, useApiConfigSubmitApi, getIpPortApi } from '@/api/data-service/apiConfig'
import Databases from '../../data-development/production/databases.vue'
import Middledb from '../../data-development/production/middledb.vue'
import SqlStudio from './sql-studio.vue'
import ParamStudio from './param-studio.vue'


onMounted(()=>{
	//获取数据库列表
	getDatabaseList()
	getIpPort()
})


//选择数据源类型
const getDatabaseList = () => {
	listDatabase().then(res => {
		apiSqlForm.databaseList = res.data
	})
}

//打开库表信息查看
const dbLookDialog = ref(false)
const dbLook = () => {
	dbLookDialog.value = true
}

const emit = defineEmits(['refreshDataList'])

const visible = ref(false)

const ipPortAddress = ref('')
const getIpPort = () => {
	getIpPortApi().then(res=>{
		ipPortAddress.value = res.data
	})
}
const dataForm = reactive({
})

//基本信息表
const basicDataFormRef = ref()
const basicDataForm = reactive({
	name: '',
	path: '',
	type: '',
	note: '',
	status: 0
})
const basicDataFormRules = ref({
	name: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	path: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	type: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})
//基本信息表
const apiSqlFormRef = ref()
const apiSqlForm = reactive({
	sqlDbType: '',
	sqlParam: '',
	sqlText: '\\n',
	contentType: 'application/json',
	openTrans: 0,
	pageAuto: 0,
	pageParam: 'page',
	pageSizeParam: 'pageSize',
	jsonParam: '{}',
	responseResult: '{}',
	sqlSeparator: ';\\n',
	sqlMaxRow: 100,
	databaseId: '',
	databaseList: [],
	previlege: ''
})
const apiSqlFormRules = ref({
	sqlSeparator: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	sqlMaxRow: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	contentType: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	sqlDbType: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	databaseId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	sqlText: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	jsonParam: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	responseResult: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	previlege: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	openTrans: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	pageAuto: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	pageParam: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	pageSizeParam: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})

provide("apiSqlForm",apiSqlForm)

//代码编辑器
const sqlStudioRef = ref()


const init = (id?: number, groupId: number) => {
	visible.value = true
	dataForm.id = ''
	dataForm.groupId = groupId

	// 重置表单数据
	if (basicDataFormRef.value) {
		basicDataFormRef.value.resetFields()
	}
	if (apiSqlFormRef.value) {
		apiSqlFormRef.value.resetFields()
		sqlStudioRef.value.setSqlParam('')
		sqlStudioRef.value.setEditorValue('')
		sqlStudioRef.value.closeDebug()
		requestParamRef.value.setEditorValue('{}')
		responseResultRef.value.setEditorValue('{"code":0,"msg":"success","data":[]}')
	}

	if (id) {
		getApiConfig(id)
	}
}

const getApiConfig = (id: number) => {
	useApiConfigApi(id).then(res => {
		const resData = res.data
		Object.assign(dataForm, resData)
		
		basicDataForm.name = resData.name
		basicDataForm.path = resData.path
		basicDataForm.type = resData.type
		basicDataForm.note = resData.note
		basicDataForm.status = resData.status
		
		apiSqlForm.sqlDbType = resData.sqlDbType
		apiSqlForm.sqlParam = resData.sqlParam
		apiSqlForm.sqlText = resData.sqlText
		apiSqlForm.contentType = resData.contentType
		apiSqlForm.openTrans = resData.openTrans
		apiSqlForm.pageAuto = resData.pageAuto
		apiSqlForm.pageParam = resData.pageParam
		apiSqlForm.pageSizeParam = resData.pageSizeParam
		apiSqlForm.jsonParam = resData.jsonParam
		apiSqlForm.responseResult = resData.responseResult
		apiSqlForm.sqlSeparator = resData.sqlSeparator
		apiSqlForm.sqlMaxRow = resData.sqlMaxRow
		apiSqlForm.databaseId = resData.databaseId
		apiSqlForm.previlege = resData.previlege
		
		sqlStudioRef.value.setSqlParam(apiSqlForm.sqlParam)
		sqlStudioRef.value.setEditorValue(apiSqlForm.sqlText)
		requestParamRef.value.setEditorValue(apiSqlForm.jsonParam)
		responseResultRef.value.setEditorValue(apiSqlForm.responseResult)
	})
}

const requestParamRef = ref()
const responseResultRef = ref()

// 表单提交
const submitHandle = async () => {
	let validate = true
	await basicDataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			ElMessage.warning('请把基本信息的必填项补充完整！')
			validate = false
			return false
		}
	})
	if(!validate) {
		return
	}
	apiSqlForm.sqlParam = sqlStudioRef.value.getSqlParam()
	apiSqlForm.sqlText = sqlStudioRef.value.getEditorValue()
	apiSqlForm.jsonParam = requestParamRef.value.getEditorValue()
	apiSqlForm.responseResult = responseResultRef.value.getEditorValue()
	await apiSqlFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			ElMessage.warning('请把 API SQL 配置的必填项补充完整！')
			validate = false
			return false
		}
	})
	if(!validate) {
		return
	}
	
	Object.assign(dataForm, basicDataForm)
	Object.assign(dataForm, apiSqlForm)
	
	await useApiConfigSubmitApi(dataForm)
	ElMessage.success({
		message: '操作成功',
		duration: 500,
		onClose: () => {
			visible.value = false
			emit('refreshDataList')
		}
	})
}

defineExpose({
	init
})
</script>
