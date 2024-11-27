<template>
	<el-drawer v-model="visible" title="详情" size="100%" :destroy-on-close="true">
		<div>
			<el-tabs
			  tab-position="top"
			>
				<el-tab-pane label="基本信息">
					 <el-form ref="basicDataFormRef" :model="basicDataForm">
						<el-form-item label="名称" prop="name" label-width="auto">
							<span>{{basicDataForm.name}}</span>
						</el-form-item>
						<el-form-item label="api路径" prop="path" label-width="auto">
							<span>{{ipPortAddress}}{{basicDataForm.path}}</span>
						</el-form-item>
						<el-form-item label="请求方式" prop="type" label-width="auto">
							<span>{{basicDataForm.type}}</span>
						</el-form-item>
						<el-form-item label="总调用次数" prop="type" label-width="auto">
							<span>{{basicDataForm.requestedTimes}}</span>
						</el-form-item>
						<el-form-item label="调用成功次数" prop="type" label-width="auto">
							<span>{{basicDataForm.requestedSuccessTimes}}</span>
						</el-form-item>
						<el-form-item label="调用失败次数" prop="type" label-width="auto">
							<span>{{basicDataForm.requestedFailedTimes}}</span>
						</el-form-item>
						<el-form-item label="描述" prop="note" label-width="auto">
							<p>{{basicDataForm.note}}</p>
						</el-form-item>
					 </el-form>
				</el-tab-pane>
				<el-tab-pane label="API SQL 配置">
					 <el-form ref="apiSqlFormRef" :model="apiSqlForm">
						<el-form-item label="库类型" prop="sqlDbType"  label-width="auto">
							<el-radio-group v-model="apiSqlForm.sqlDbType" disabled>
								<el-radio :label="1" border>数据库</el-radio>
								<el-radio :label="2" border>中台库</el-radio>
							</el-radio-group>
							<!-- <el-button style="margin-left:20px" :icon="Search" type="primary" v-show="!!apiSqlForm.sqlDbType" @click="dbLook()">库表信息</el-button> -->
						</el-form-item>
						<el-form-item label="数据库" prop="databaseId" v-if="apiSqlForm.sqlDbType=='1'" label-width="auto">
							<el-select disabled v-model="apiSqlForm.databaseId"
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
							<span>{{apiSqlForm.sqlSeparator}}</span>
						</el-form-item>
						<el-form-item label="开启事务" label-width="auto" prop="openTrans">
							<span>{{apiSqlForm.openTrans == 1?'是':'否'}}</span>
						</el-form-item>
						<el-form-item label="查询最大行数" label-width="auto" prop="sqlMaxRow">
							<span>{{apiSqlForm.sqlMaxRow}}</span>
						</el-form-item>
						<el-form-item label="自动分页" label-width="auto" prop="pageAuto">
							<span>{{apiSqlForm.pageAuto == 0? '否': '是'}}</span>
						</el-form-item>
						<el-form-item label="页码参数名" label-width="auto" prop="pageParam" v-if="apiSqlForm.pageAuto == 1">
							<span>{{apiSqlForm.pageParam}}</span>
						</el-form-item>
						<el-form-item label="每页条数参数名" label-width="auto" prop="pageSizeParam" v-if="apiSqlForm.pageAuto == 1">
							<span>{{apiSqlForm.pageSizeParam}}</span>
						</el-form-item>
						<!-- sql 编辑器 -->
						<el-form-item label="sql语句" label-width="auto" prop="sqlText">
							<ReadOnlyStudio id="apiSqlId" ref="sqlStudioRef" style="height:260px;width: 100%;"></ReadOnlyStudio>
						</el-form-item>
						<el-form-item label="Content-Type" prop="contentType" label-width="auto">
							<span>{{apiSqlForm.contentType}}</span>
						</el-form-item>
						<el-form-item label="权限" prop="previlege" label-width="auto">
							<span>{{apiSqlForm.previlege == 1?'私有':'开放'}}</span>
						</el-form-item>
					 </el-form>
				</el-tab-pane>
				<el-tab-pane label="授权信息" v-if="ifAuth">
					 <el-form ref="authDataFormRef" :model="authDataForm">
						<el-form-item label="调用次数" prop="limited" label-width="auto">
							<el-radio-group v-model="authDataForm.limited" disabled>
							  <el-radio :label="false" size="large">不限次数</el-radio>
							  <el-radio :label="true" size="large">指定次数</el-radio>
							</el-radio-group>
						</el-form-item>
						<el-form-item label="授权次数" prop="requestTimes" label-width="auto" v-if="authDataForm.limited">
							<span>{{authDataForm.requestTimes}}</span>
						</el-form-item>
						<el-form-item>
							<el-tag>tips:这里的调用次数指的是该应用下被授权的api的调用次数，并非总次数</el-tag>
						</el-form-item>
						<el-form-item label="已调用次数" prop="requestedTimes" label-width="auto">
							<span>{{authDataForm.requestedTimes}}</span>
						</el-form-item>
						<el-form-item label="调用成功次数" prop="requestedSuccessTimes" label-width="auto">
							<span>{{authDataForm.requestedSuccessTimes}}</span>
						</el-form-item>
						<el-form-item label="调用失败次数" prop="requestedFailedTimes" label-width="auto">
							<span>{{authDataForm.requestedFailedTimes}}</span>
						</el-form-item>
						<!-- <el-form-item label="调用失败次数" prop="requestedFailedTimes" label-width="auto">
							<span>{{authDataForm.requestedFailedTimes}}</span>
						</el-form-item> -->
						<el-form-item label="申请开始时间" prop="startTime" label-width="auto" v-if="authDataForm.startTime">
							<span>{{authDataForm.startTime}}</span>
						</el-form-item>
						<el-form-item label="申请结束时间" prop="endTime" label-width="auto" v-if="authDataForm.endTime">
							<span>{{authDataForm.endTime}}</span>
						</el-form-item>
					 </el-form>
				</el-tab-pane>
			</el-tabs>
		</div>
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
import { useApiConfigApi, useApiConfigSubmitApi, getIpPortApi, getAuthInfoApi } from '@/api/data-service/apiConfig'
import Databases from '../../data-development/production/databases.vue'
import Middledb from '../../data-development/production/middledb.vue'
import ReadOnlyStudio from '../../data-development/production/readonly-studio.vue'


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
		ipPortAddress.value = 'http://' + res.data
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
	requestedTimes: ''
})
const apiSqlFormRef = ref()
const apiSqlForm = reactive({
	sqlDbType: '',
	sqlParam: '',
	sqlText: '',
	contentType: 'application/json',
	openTrans: 0,
	jsonParam: '',
	responseResult: '',
	sqlSeparator: ';\\n',
	databaseId: '',
	databaseList: [],
	previlege: ''
})
const authDataFormRef = ref()
const authDataForm = reactive({
	limited: '',
	requestTimes: '',
	requestedTimes: ''
})

//代码编辑器
const sqlStudioRef = ref()


const init = (id?: number, authId: any) => {
	visible.value = true
	dataForm.id = ''

	// 重置表单数据
	if (basicDataFormRef.value) {
		basicDataFormRef.value.resetFields()
	}
	if (apiSqlFormRef.value) {
		sqlStudioRef.value.setEditorValue('')
	}

	if (id) {
		getApiConfig(id, authId)
	}
}

const ifAuth = ref(false)
const getApiConfig = (id: number, authId: any) => {
	useApiConfigApi(id).then(res => {
		Object.assign(dataForm, res.data)
		Object.assign(basicDataForm, res.data)
		Object.assign(apiSqlForm, res.data)
		sqlStudioRef.value.setEditorValue(apiSqlForm.sqlText)
	})
	if (authId) {
		//获取授权信息
		getAuthInfoApi(authId).then(res=> {
			authDataForm.id = authId
			authDataForm.limited = res.data.requestTimes == -1? false : true
			authDataForm.requestTimes = res.data.requestTimes
			authDataForm.requestedTimes = res.data.requestedTimes
			authDataForm.requestedSuccessTimes = res.data.requestedSuccessTimes
			authDataForm.requestedFailedTimes = res.data.requestedFailedTimes
			authDataForm.startTime = res.data.startTime
			authDataForm.endTime = res.data.endTime
			ifAuth.value = true
		})
	} else {
		ifAuth.value = false
	}
}

defineExpose({
	init
})
</script>
