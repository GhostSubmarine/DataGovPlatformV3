<template>
	<el-card :body-style="props.ifChild ? '':'height: calc(100vh - 170px )'">
		<el-form v-show="props.ifSearch" :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
			<el-form-item>
			  <el-input v-model="state.queryForm.jobName" placeholder="作业名称"></el-input>
			</el-form-item>
			<el-form-item>
				<fast-select v-model="state.queryForm.status" dict-type="task_status" placeholder="作业状态" clearable filterable></fast-select>
			</el-form-item>
			<el-form-item>
				<fast-select v-model="state.queryForm.instanceStatus" dict-type="instance_status" placeholder="flink实例状态" clearable filterable></fast-select>
			</el-form-item>
			<el-form-item>
				<fast-select v-model="state.queryForm.dialect" placeholder="作业类型" dict-type="production_task_type" clearable filterable></fast-select>
			</el-form-item>
			<el-form-item>
				<fast-select v-model="state.queryForm.type" dict-type="production_cluster_type" placeholder="flink执行模式" clearable filterable></fast-select>
			</el-form-item>
			<el-form-item>
				<el-select v-model="state.queryForm.clusterId"
									 clearable
									 filterable 
				           placeholder="Flink集群实例">
				  <el-option v-for="(item,index) in state.clusterList"
				             :key="item.id"
				             :label="`[${item.id}]${item.name}`"
				             :value="item.id"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item>
				<el-select v-model="state.queryForm.clusterConfigurationId"
									 clearable
									 filterable 
				           placeholder="Flink集群配置">
				  <el-option v-for="(item,index) in state.clusterConfiguratioList"
				             :key="item.id"
				             :label="`[${item.id}]${item.name}`"
				             :value="item.id"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item>
				<el-select v-model="state.queryForm.sqlDbType" clearable filterable placeholder="sql库类型">
						<el-option :key="1" label="数据库" :value="1"></el-option>
						<el-option :key="2" label="中台库" :value="2"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item>
				<el-select v-model="state.queryForm.databaseId"
									 clearable
									 filterable 
				           placeholder="数据库">
				  <el-option v-for="(item,index) in state.databaseList"
				             :key="item.id"
				             :label="`[${item.id}]${item.name}`"
				             :value="item.id"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item>
				<el-date-picker
						 v-model="state.queryForm.startTime"
						 type="datetime"
						 placeholder="开始时间"
						 format="YYYY-MM-DD hh:mm:ss"
						 value-format="YYYY-MM-DD hh:mm:ss"
				     />
			</el-form-item>
			<el-form-item>
				<el-date-picker
						 v-model="state.queryForm.endTime"
						 type="datetime"
						 placeholder="作业结束时间"
						 format="YYYY-MM-DD hh:mm:ss"
						 value-format="YYYY-MM-DD hh:mm:ss"
				     />
			</el-form-item>
			<el-form-item>
				<el-date-picker
						 v-model="state.queryForm.finishTime"
						 type="datetime"
						 placeholder="flink实例结束时间"
						 format="YYYY-MM-DD hh:mm:ss"
						 value-format="YYYY-MM-DD hh:mm:ss"
				     />
			</el-form-item>
			<el-form-item>
				<el-button @click="pageDataList()">查询</el-button>
			</el-form-item>
			<el-form-item>
				<el-button type="danger" @click="deleteBatchHandle()">删除</el-button>
			</el-form-item>
		</el-form>
		<el-table v-loading="state.dataListLoading" :data="state.dataList" :span-method="objectSpanMethod" border style="width: 100%" @selection-change="selectionChangeHandle">
			<el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
			<el-table-column show-overflow-tooltip prop="executeNo"  label="执行编号" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="jobName" label="作业名称" header-align="center" align="center"></el-table-column>
			<el-table-column prop="dialect" label="作业类型" header-align="center" align="center">
				<template #default="scope">
					<el-tag v-show="scope.row.dialect=='1'">{{ getDictLabel(store.appStore.dictList, "production_task_type",  scope.row.dialect ) }}</el-tag>
					<el-tag v-show="scope.row.dialect=='2'" type="warning">{{ getDictLabel(store.appStore.dictList, "production_task_type",  scope.row.dialect ) }}</el-tag>
					<el-tag v-show="scope.row.dialect=='3'" type="success">{{ getDictLabel(store.appStore.dictList, "production_task_type",  scope.row.dialect ) }}</el-tag>
				</template>
			</el-table-column>
			<el-table-column prop="status" label="作业状态" header-align="center" align="center">
				<template #default="scope">
					<el-tag v-show="scope.row.status=='0' || scope.row.status=='1'">{{ getDictLabel(store.appStore.dictList, "task_status",  scope.row.status ) }}</el-tag>
					<el-tag v-show="scope.row.status=='2'" type="success">{{ getDictLabel(store.appStore.dictList, "task_status",  scope.row.status ) }}</el-tag>
					<el-tag v-show="scope.row.status=='3'" type="danger">{{ getDictLabel(store.appStore.dictList, "task_status",  scope.row.status ) }}</el-tag>
				</template>
			</el-table-column>
			<fast-table-column prop="executeType" label="执行方式" dict-type="execute_type" header-align="center" align="center"></fast-table-column>
			<fast-table-column show-overflow-tooltip prop="type" label="flink执行模式" dict-type="production_cluster_type" header-align="center" align="center"></fast-table-column>
			<!-- <el-table-column prop="jobManagerAddress" label="集群地址" header-align="center" align="center"></el-table-column> -->
			<el-table-column show-overflow-tooltip prop="jid" label="flink实例id" header-align="center" align="center"></el-table-column>
			<el-table-column prop="instanceStatus" label="flink实例状态" header-align="center" align="center">
				<template #default="scope">
					<el-tag v-show="scope.row.instanceStatus=='INITIALIZING' || scope.row.instanceStatus=='CREATED' || scope.row.instanceStatus=='RUNNING'">
						{{ scope.row.instanceStatus }}
					</el-tag>
					<el-tag v-show="scope.row.instanceStatus=='FAILING' || scope.row.instanceStatus=='FAILED'" type="danger">
						{{ scope.row.instanceStatus }}
					</el-tag>
					<el-tag v-show="scope.row.instanceStatus=='CANCELLING' || scope.row.instanceStatus=='CANCELED'" type="info">
						{{ scope.row.instanceStatus }}
					</el-tag>
					<el-tag v-show="scope.row.instanceStatus=='FINISHED'" type="success">
						{{ scope.row.instanceStatus }}
					</el-tag>
					<el-tag v-show="scope.row.instanceStatus=='RESTARTING' || scope.row.instanceStatus=='SUSPENDED' || scope.row.instanceStatus=='RECONCILING' || scope.row.instanceStatus=='UNKNOWN'" type="warning">
						{{ scope.row.instanceStatus }}
					</el-tag>
				</template>
			</el-table-column>
			<!-- <el-table-column prop="statement" label="statement set" header-align="center" align="center"></el-table-column>
			<el-table-column prop="error" label="error message" header-align="center" align="center"></el-table-column>
			<el-table-column prop="result" label="result set" header-align="center" align="center"></el-table-column>
			<el-table-column prop="configJson" label="config json" header-align="center" align="center"></el-table-column> -->
			<el-table-column prop="duration" label="运行时长" header-align="center" align="center" width="160">
				<template #default="scope">
					<el-tag>
						{{ scope.row.duration }}
					</el-tag>
				</template>
			</el-table-column>
			<el-table-column show-overflow-tooltip prop="startTime" label="开始时间" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="endTime" label="作业结束时间" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="finishTime" label="flink实例结束时间" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="createTime" label="创建时间" header-align="center" align="center"></el-table-column>
			<el-table-column label="操作" fixed="right" header-align="center" align="center" width="150">
				<template #default="scope">
					 <el-dropdown>
					    <span class="el-dropdown-link">
					      查看<el-icon class="el-icon--right"><arrow-down /></el-icon>
					    </span>
					    <template #dropdown>
					      <el-dropdown-menu>
					        <el-dropdown-item @click="getInfo(scope.row)">作业信息</el-dropdown-item>
					        <el-dropdown-item @click="getSelectResult(scope.row.dialect,scope.row.result)" :disabled="!!!scope.row.result">select结果</el-dropdown-item>
					        <el-dropdown-item @click="getError(scope.row.error)" :disabled="!!!scope.row.error">作业错误日志</el-dropdown-item>
									<el-dropdown-item @click="getInstanceError(scope.row.id)" :disabled="!!!scope.row.jid">flink实例错误日志</el-dropdown-item>
					      </el-dropdown-menu>
					    </template>
					  </el-dropdown>&nbsp;
						<el-dropdown>
						   <span class="el-dropdown-link">
						     操作<el-icon class="el-icon--right"><arrow-down /></el-icon>
						   </span>
						   <template #dropdown>
						     <el-dropdown-menu>										
										<el-dropdown-item @click="savepoint(scope.row.taskId, scope.row.id, 'trigger')" :disabled="!!!scope.row.jid">savepoint触发</el-dropdown-item>
										<el-dropdown-item @click="savepoint(scope.row.taskId, scope.row.id, 'cancel')" :disabled="!!!scope.row.jid">savepoint停止</el-dropdown-item>
										<el-dropdown-item @click="savepoint(scope.row.taskId, scope.row.id, 'canceljob')" :disabled="!!!scope.row.jid">普通停止</el-dropdown-item>
										<el-dropdown-item @click="deleteBatchHandle(scope.row.id)">删除</el-dropdown-item>
						     </el-dropdown-menu>
						   </template>
						 </el-dropdown>
				</template>
			</el-table-column>
		</el-table>
		<el-pagination
			:current-page="state.page"
			:page-sizes="state.pageSizes"
			:page-size="state.limit"
			:total="state.total"
			layout="total, sizes, prev, pager, next, jumper"
			@size-change="sizeChange"
			@current-change="currentChange"
		>
		</el-pagination>
	</el-card>
	
	<el-dialog v-model="hisInfoDialogVisable" title="作业信息" width="75%" :destroy-on-close="true">
		<div style="padding: 15px">
			<div v-if="dialect != 3">
				<el-divider>
				  <span style="font-size: 17px"><b>作业代码</b></span>
				</el-divider>
				<ReadonlyStudio id="jobStatementId" :value="currentRow.statement" style="height: 300px"></ReadonlyStudio>
			</div>
			
			<div v-if="dialect == 2">
				<el-divider>
					<span style="font-size: 17px"><b>实际执行的sql任务代码</b></span>
				</el-divider>
				<p style="margin-bottom: 10px;"><el-tag>tips：如果是 local，standalone 或 session 模式，没有勾选 insert 语句集，flink 会把每条 DML sql 解析为一个 job 执行，所以存在执行一次作业有多条任务记录的情况，每执行一次作业会产生唯一的执行编号，有些语句不会产生实例（如 desc 等），也就不存在实例 id</el-tag></p>
				<ReadonlyStudio id="jobExecuteSqlId" :value="currentRow.executeSql" style="height: 150px"></ReadonlyStudio>
				<el-divider>
					<span style="font-size: 17px"><b>savepoint保存点列表</b></span>
				</el-divider>
				<Savepoints :taskId="currentRow.taskId" :historyId="currentRow.id"></Savepoints>
			</div>
			
			<el-divider>
			  <span style="font-size: 17px"><b>配置信息</b></span>
			</el-divider>
			<!-- sql -->
			<div v-if="dialect == 1">
				<el-descriptions
				    title="数据来源"
				    :column="1"
				    size="large"
						border
				  >
				    <el-descriptions-item label="来源">{{currentConfig.sqlDbType==1?'外部数据库':'中台库'}}</el-descriptions-item>
				</el-descriptions><br>
				<el-descriptions
				    title="数据库信息"
				    :column="1"
				    size="large"
						border
				  >
				    <el-descriptions-item label="名称">{{currentConfig.database.name}}</el-descriptions-item>
						<el-descriptions-item label="库名">{{currentConfig.database.databaseName}}</el-descriptions-item>
						<el-descriptions-item label="用户名">{{currentConfig.database.userName}}</el-descriptions-item>
						<el-descriptions-item label="密码">******<!-- {{currentConfig.database.password}} --></el-descriptions-item>
						<el-descriptions-item label="jdbc连接串">{{currentConfig.database.jdbcUrl}}</el-descriptions-item>
				</el-descriptions><br>
				<el-descriptions
				    title="配置信息"
				    :column="1"
				    size="large"
						border
				  >
				    <el-descriptions-item label="最大预览行数">{{currentConfig.pvdataNum}}</el-descriptions-item>
				</el-descriptions>
			</div>
			<!-- flinksql -->
			<div v-if="dialect == 2 || dialect == 3">
				<el-descriptions
				    title="作业配置"
				    :column="3"
				    size="large"
						border
				  >
						<el-descriptions-item label="作业名称">{{ currentConfig.jobName }}</el-descriptions-item>
						<el-descriptions-item label="执行模式">{{ currentRow.type  }}</el-descriptions-item>
						<el-descriptions-item v-if="dialect == 2" label="是否开启批模式">{{ currentConfig.useBatchModel }}</el-descriptions-item>
						<el-descriptions-item v-if="dialect == 2" label="是否开启全局变量">{{ currentConfig.useSqlFragment }}</el-descriptions-item>
						<el-descriptions-item v-if="dialect == 2" label="是否开启insert语句集">{{ currentConfig.useStatementSet }}</el-descriptions-item>
						<el-descriptions-item label="任务并行度">{{ currentConfig.parallelism }}</el-descriptions-item>
						<el-descriptions-item label="SavePoint策略">{{ currentConfig.savePointStrategy }}</el-descriptions-item>
						<el-descriptions-item label="SavePoint地址">{{ currentConfig.savePointPath }}</el-descriptions-item>
				</el-descriptions><br>
				<el-descriptions 
					v-if="dialect == 2"
				    title="执行配置"
				    :column="3"
				    size="large"
						border
				  >
						<el-descriptions-item label="预览结果">{{ currentConfig.useResult }}</el-descriptions-item>
						<el-descriptions-item label="打印changeLog">{{ currentConfig.useChangeLog }}</el-descriptions-item>
						<el-descriptions-item label="自动停止">{{ currentConfig.useAutoCancel }}</el-descriptions-item>
						<el-descriptions-item label="最大预览行数">{{ currentConfig.maxRowNum }}</el-descriptions-item>
				</el-descriptions><br>
				<el-descriptions
				    title="集群实例"
				    :column="3"
				    size="large"
						border
				  >
					<div v-if="!!currentClusterInfo.cluster">
						<el-descriptions-item label="名称">{{ currentClusterInfo.cluster.alias }}</el-descriptions-item>
						<el-descriptions-item label="jobManager地址">{{ currentClusterInfo.cluster.jobManagerHost }}</el-descriptions-item>
						<el-descriptions-item label="flink版本">{{ currentClusterInfo.cluster.flinkVersion }}</el-descriptions-item>
						<el-descriptions-item label="实例类型">{{ getDictLabel(store.appStore.dictList, "production_cluster_type",  currentClusterInfo.cluster.type ) }}</el-descriptions-item>
						<el-descriptions-item label="是否自动注册">{{ currentClusterInfo.cluster.autoRegisters }}</el-descriptions-item>
						<el-descriptions-item label="备注">{{ currentClusterInfo.cluster.note }}</el-descriptions-item>
					</div>
				</el-descriptions><br>
				<el-result v-if="!!!currentClusterInfo.cluster" title="暂无数据" sub-title="没有集群实例信息"></el-result>
				
				<el-descriptions
				    title="集群配置"
				    :column="1"
				    size="large"
						border
				  >
					<div v-if="!!currentClusterInfo.clusterConfiguration">
						<el-descriptions-item label="名称">{{  currentClusterInfo.clusterConfiguration.name }}</el-descriptions-item>
						<el-descriptions-item label="类型">{{  getDictLabel(store.appStore.dictList, "production_cluster_configuration_type",  currentClusterInfo.clusterConfiguration.type )  }}</el-descriptions-item>
						<el-descriptions-item label="Hadoop 配置文件路径">{{ currentClusterInfo.clusterConfiguration.configInfo.hadoopConfigPath }}</el-descriptions-item>
						<el-descriptions-item label="flink lib 路径">{{ currentClusterInfo.clusterConfiguration.configInfo.flinkLibPath }}</el-descriptions-item>
						<el-descriptions-item label="Flink 配置文件路径">{{ currentClusterInfo.clusterConfiguration.configInfo.flinkConfigPath }}</el-descriptions-item>
						<el-descriptions-item label="taskmanager.numberOfTaskSlots">{{ currentClusterInfo.clusterConfiguration.configInfo["taskmanager.numberOfTaskSlots"] }}</el-descriptions-item>
						<el-descriptions-item label="state.savepoints.dir">{{ currentClusterInfo.clusterConfiguration.configInfo["state.savepoints.dir"] }}</el-descriptions-item>
						<el-descriptions-item label="state.checkpoints.dir">{{ currentClusterInfo.clusterConfiguration.configInfo["state.checkpoints.dir"] }}</el-descriptions-item>
						<el-descriptions-item label="备注">{{  currentClusterInfo.clusterConfiguration.note }}</el-descriptions-item>
					</div>
				</el-descriptions>
				<el-result v-if="!!!currentClusterInfo.clusterConfiguration" title="暂无数据" sub-title="没有集群配置信息"></el-result>
			</div>
			
			<el-divider>
			  <span style="font-size: 17px"><b>异常信息</b></span>
			</el-divider><br>
			
			<el-divider content-position="left">
			  <span style="font-size: 15px"><b>作业错误日志</b></span>
			</el-divider>
			<ReadonlyStudio v-if="!!currentRow.error" id="jobErrorMsgId" :value="currentRow.error" style="height: 500px"></ReadonlyStudio>
			<el-result v-if="!!!currentRow.error" title="暂无数据" sub-title="无错误日志">
			</el-result>
			
			<div v-if="dialect == 2 || dialect == 3">
				<el-divider content-position="left">
				  <span style="font-size: 15px"><b>flink实例错误日志</b></span>
				</el-divider>
				<div v-if="!!currentRow.jid">
					<p style="margin-bottom: 10px;"><el-tag>tips：如果开启了 checkpoint 并且重启策略不是 none（默认每隔一段时间重启），flink 遇到错误会自行 restart 指定次数的任务，就算最终状态不是 falied，有错误日志也是正常的</el-tag></p>
					<ReadonlyStudio id="jobErrorMsgId" ref="jobErrorMsgRef" style="height: 500px"></ReadonlyStudio>
				</div>
				<el-result v-if="!!!currentRow.jid" title="暂无数据" sub-title="无错误日志">
				</el-result>
			</div>
			
			<el-divider>
			  <span style="font-size: 17px"><b>select结果</b></span>
			</el-divider>
			
			<div v-if="!!!currentRow.result">
				<el-result title="暂无数据" sub-title="注意：flinkSql只有在同步执行模式下，当执行配置勾选了预览结果并且最后一条语句为查询语句时才会有结果！">
				</el-result>
			</div>
			<div v-if="!!currentRow.result">
				<el-scrollbar height="600px">
					<ConsoleResult ref="jobSelectResultRef"></ConsoleResult>
				</el-scrollbar>
			</div>
		</div>
	</el-dialog>
	
	<el-dialog v-model="errorMsgDialogVisable" :title="errorMsgTitle" width="65%">
		<p><el-tag>tips：如果开启了 checkpoint 并且重启策略不是 none（默认每隔一段时间重启），flink 遇到错误会自行 restart 指定次数的任务，就算最终状态不是 falied，有错误日志也是正常的</el-tag></p>
		<div style="padding: 15px">
			<ReadonlyStudio id="hisErrorMsgId" ref="hisErrorMsgRef" style="height: 500px"></ReadonlyStudio>
		</div>
	</el-dialog>
	
	<el-dialog v-model="selectResultDialogVisable" title="select结果" width="65%" :destroy-on-close="true">
		<el-scrollbar height="600px">
			<ConsoleResult ref="selectResultRef"></ConsoleResult>
		</el-scrollbar>
	</el-dialog>
	
</template>

<script setup lang="ts" name="Data-developmentTask-historyIndex">
import { useCrud } from '@/hooks'
import store from '@/store'
import { getDictLabel } from '@/utils/tool'
import { reactive, ref, onMounted } from 'vue'
import { IHooksOptions } from '@/hooks/interface'
import { listAllClusterApi } from '@/api/data-development/cluster'
import { listDatabase } from '@/api/data-integrate/database'
import { listAllClusterConfigurationApi } from '@/api/data-development/clusterConfiguration'
import { ArrowDown } from '@element-plus/icons-vue'
import ReadonlyStudio from '../production/readonly-studio.vue'
import { getInstanceErrorApi, getHisClusterInfoApi, savepointApi } from '@/api/data-development/task'
import ConsoleResult from '../production/console-result.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Savepoints from '../savepoints/index.vue'

const errorMsgDialogVisable = ref(false)
const selectResultDialogVisable = ref(false)
const errorMsgTitle = ref('')
const hisErrorMsgRef = ref()
const selectResultRef = ref()

const props = defineProps({
	ifChild: {
		type: Boolean,
		required: false,
		default: () => false
	},
	ifSearch: {
	  type: Boolean,
		required: false,
	  default: () => true
	},
	nodeRecordId: {
		type: [Number, String],
		required: false,
		default: () => ''
	},
	recordId: {
		type: [Number, String],
		required: false,
		default: () => ''
	}
})	
/**
 * 初始话加载
 */
onMounted(()=>{
	//分页
	getDataList(rowSpanMethod)
	getDatabaseList()
	//获取集群实例
	getClusterList()
	//获取集群配置
	getClusterConfigurationList()
})

const getDatabaseList = () => {
	listDatabase().then(res => {
		state.databaseList = res.data
	})
}

const getClusterList = () => {
	listAllClusterApi().then(res=>{
		state.clusterList = res.data
	})
}

const getClusterConfigurationList = () => {
	listAllClusterConfigurationApi().then(res=>{
		state.clusterConfiguratioList = res.data
	})
}

const state: IHooksOptions = reactive({
	createdIsNeed: false,
	dataListUrl: '/data-development/task/history/page',
	deleteUrl: '/data-development/task/history',
	databaseList: [],
	clusterList: [],
	clusterConfiguratioList: [],
	queryForm: {
		//节点记录id
		nodeRecordId: props.nodeRecordId,
		//调度记录id
		recordId: props.recordId,
		taskId: '',
		jobName: '',
		status: '',
		instanceStatus: '',
		dialect: '',
		type: '',
		sqlDbType: '',
		databaseId: '',
		clusterId: '',
		clusterConfigurationId: '',
		startTime: '',
		endTime: '',
		finishTime: ''
	}
})

const pageDataList = () => {
	getDataList(rowSpanMethod)
}

const sizeChange = (val: number) => {
	sizeChangeHandle(val, rowSpanMethod)
}

const currentChange = (val: number) => {
	currentChangeHandle(val, rowSpanMethod)
}


let rowIndexData = {}
/**
 * 合并行的方法
 */
const rowSpanMethod = (pageList: []) => {
	let executeNoMap = {}
	for(let i in pageList) {
		let rowData = {}
		let executeNo = pageList[i].executeNo
		if(executeNoMap[executeNo]) {
			rowData = executeNoMap[executeNo]
			rowData.rowNum += 1
		} else {
			rowData.rowIndex = i
			rowData.rowNum = 1
			executeNoMap[executeNo] = rowData
		}
	}
	console.log(executeNoMap)
	let rowIndexMap = {}
	for(let key in executeNoMap) {
		let rowData = executeNoMap[key]
		rowIndexMap[rowData.rowIndex] = rowData.rowNum
	}
	rowIndexData = rowIndexMap
	return true
}
	

const objectSpanMethod = ({
  row,
  column,
  rowIndex,
  columnIndex,
}: SpanMethodProps) => {
	if (state.dataList.length != 0) {
		if (Object.keys(rowIndexData).length != 0) {
			//如果是executeNo字段，作业名称字段，作业类型字段
			if (columnIndex === 1 || columnIndex === 2 || columnIndex === 3 || columnIndex === 5	 ) {
				if(rowIndexData[rowIndex]) {
					return {
					  rowspan: rowIndexData[rowIndex],
					  colspan: 1,
					}
				} else {
					return {
					  rowspan: 0,
					  colspan: 0,
					}
				}
			}
		}
	}
}

const getError = (error: any) => {
	errorMsgDialogVisable.value = true
	errorMsgTitle.value = '作业错误日志'
	if(hisErrorMsgRef.value) {
		hisErrorMsgRef.value.setEditorValue(error)
		return
	}
	setTimeout(() => {getError(error)},500)
}

const getInstanceError = (id: number) => {
	getInstanceErrorApi(id).then(res=> {
		errorMsgDialogVisable.value = true
		errorMsgTitle.value = 'flink实例错误日志'
		let errorJson = JSON.parse(res.data)
		if(hisErrorMsgRef.value) {
			if(errorJson && errorJson['root-exception']) {
				hisErrorMsgRef.value.setEditorValue(errorJson['root-exception'])
				return
			}
			hisErrorMsgRef.value.setEditorValue('暂无错误日志\n\n如果是 local 模式下由于 miniCluster 会自动关闭可能导致无法及时获取实例状态，导致失败，可不予理会')
			return
		}
		setTimeout(() => {getInstanceError(id)},500)
	})
}

const getSelectResult = (dialect: any, result: any) => {
	selectResultDialogVisable.value = true
	if(selectResultRef.value) {
		selectResultRef.value.init(JSON.parse(result), dialect, true)
		return
	}
	setTimeout(() => {getSelectResult(dialect, result)},500)
}

const hisInfoDialogVisable = ref(false)
const currentConfig = reactive({})
const currentRow = reactive({})
const currentClusterInfo = reactive({})
const jobErrorMsgRef = ref()
//当前的作业类型
const dialect = ref('')
const jobSelectResultRef = ref()
const getInfo = (rowData: any) => {
	hisInfoDialogVisable.value = true
	dialect.value = rowData.dialect
	Object.assign(currentRow, rowData)
	//赋值historyInfo
	//console.log(JSON.parse(rowData.configJson))
	Object.assign(currentConfig, JSON.parse(rowData.configJson))
	console.log(currentConfig)
	//select结果
	getJobSelectResult(dialect.value,rowData.result)
	//如果是flinkSql，获取集群信息
	if(dialect.value == 2 || dialect.value == 3) {
		//flink实例错误日志
		if(rowData.jid) {
			getJobErrorMsg(rowData.id)
		}
		getHisClusterInfoApi(rowData.id).then(res=> {
			Object.assign(currentClusterInfo, res.data)
			if(currentClusterInfo.clusterJson) {
					currentClusterInfo.cluster = JSON.parse(currentClusterInfo.clusterJson)
			} else {
				currentClusterInfo.cluster = null
			}
			if(currentClusterInfo.clusterConfigurationJson) {
				currentClusterInfo.clusterConfiguration = JSON.parse(currentClusterInfo.clusterConfigurationJson)
				currentClusterInfo.clusterConfiguration.configInfo = JSON.parse(currentClusterInfo.clusterConfiguration.configJson)
			} else {
				currentClusterInfo.clusterConfiguration = null
			}
		})
	}
} 

const getJobErrorMsg = (id) => {
	getInstanceErrorApi(id).then(res=> {
		let errorJson = JSON.parse(res.data)
		if(jobErrorMsgRef.value) {
			if(errorJson && errorJson['root-exception']) {
				jobErrorMsgRef.value.setEditorValue(errorJson['root-exception'])
				return
			}
			jobErrorMsgRef.value.setEditorValue('暂无错误日志\n\n如果是 local 模式下由于 miniCluster 会自动关闭可能导致无法及时获取实例状态，导致失败，可不予理会')
			return
		}
		setTimeout(() => {getJobErrorMsg(id)},500)
	})
}

const getJobSelectResult = (dialect: any, result: any) => {
	if(jobSelectResultRef.value) {
		jobSelectResultRef.value.init(JSON.parse(result), dialect, true)
		return
	}
	setTimeout(() => {getJobSelectResult(dialect, result)},500)
}

const savepoint = (taskId: number, historyId: number, savepointType: any) => {	
	ElMessageBox.confirm('确定进行savepoint操作吗?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	}).then(() => {
			savepointApi(taskId,historyId,savepointType).then(res => {
				ElMessage.success("操作成功")
			})
		})
	}

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
</script>

<style scoped lang="scss">
.el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}
</style>