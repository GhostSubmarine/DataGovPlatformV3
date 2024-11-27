<template>
	  <el-card>
			<div class="headerBox" @click="OptionCardClose($event)">
				<div class="headLeft">
					<el-breadcrumb separator="/">
					    <el-breadcrumb-item v-for="item in headList">{{item}}</el-breadcrumb-item>
					  </el-breadcrumb>
				</div>
				<div calss="headRight" v-show="editableTabsValue!='0'">
					<el-tooltip
							class="box-item"
							effect="dark"
							content="美化sql"
							placement="top-end"
						>
							<el-button v-show="currentTaskType !='3'" text @click="formatSql()"><img src="@/assets/format.png"/></el-button>
					</el-tooltip>
					<el-tooltip
							class="box-item"
							effect="dark"
							content="保存 (ctrl+s) "
							placement="top-end"
						>
							<el-button @click="saveTask()" text><img src="@/assets/save.png"/></el-button>
					</el-tooltip>
					<el-tooltip
							class="box-item"
							effect="dark"
							content="检查sql有效性"
							placement="top-end"
						>
							<el-button text v-show="currentTaskType !='3'" @click="explainSql()"><img src="@/assets/check.png"/></el-button>
					</el-tooltip>
					<el-tooltip
							class="box-item"
							effect="dark"
							content="同步执行当前作业"
							placement="top-end"
						>
							<el-button v-show="currentTaskType=='1' || currentTaskType=='2'" :loading="executeSqlButton" @click="executeSql()" text><img src="@/assets/run.png"/></el-button>
					</el-tooltip>
					<!-- flinksql下才显示 -->
					<el-tooltip
							class="box-item"
							effect="dark"
							content="异步提交作业到集群"
							placement="top-end"
						>
							<el-button :loading="submitTaskToClusterButton" @click="submitTaskToCluster()" v-show="currentTaskType=='2' || currentTaskType=='3'" text><img src="@/assets/submit.png"/></el-button>
					</el-tooltip>
					<el-tooltip
							class="box-item"
							effect="dark"
							content="清空日志"
							placement="top-end"
						>
							<el-button @click="clearLog" text><img src="@/assets/clear.png"/></el-button>
					</el-tooltip>
				</div>
			</div>
			<div class="box" @click="OptionCardClose($event)">
				<div class="mainBox">
					<div class="left">
						 <el-scrollbar>
							 <el-tabs class="demo-tabs"  v-model="activeCatalogueName">
							     <el-tab-pane label="目录" name="catalogue">
										<!-- 目录
										 <el-button size="small" @click="addTab(editableTabsValue)">
										       add tab
										 </el-button> -->
										 <el-input v-model="filterCatalogueText" placeholder="search" />
										 <br><br>
										 <el-button type="primary" @click="appendCatalogueRoot">添加根目录</el-button><br><br>
										 <el-tree
												  ref="catalogueTreeRef"
												 :data="catalogueTreeList"
												 @node-contextmenu="ckRightOption"
												 @node-click="catalogueTreeNodeCk"
												 node-key="id"
												 :filter-node-method="filterNode"
											 >
												 <template #default="{ node, data }">
													 <span class="custom-tree-node">
														 <img v-show="data.taskType == '2'" :src="FlinkPng"/>
														 <img v-show="data.taskType=='4'" :src="FlinkEnvPng"/>
														 <img v-show="data.taskType=='3'" :src="JarPng"/>
														 <img v-show="data.taskType=='1'" :src="SqlPng"/>
														 <img v-show="data.ifLeaf=='1'" :src="folderPng"/>
														 <span style="margin-left: 8px;">{{ data.name }}</span>
													 </span>
												 </template>
										  </el-tree>
									 </el-tab-pane>
									<el-tab-pane label="数据库" name="database">
										 <Databases ref="databasesRef"></Databases>
									 </el-tab-pane>
									 <el-tab-pane label="中台库" name="middledb">
										 <Middledb ref="middledbRef"></Middledb>
									 </el-tab-pane>
							  </el-tabs>
						 </el-scrollbar>
					</div>
					<div
						class="leftResize"
						title="左右侧边栏"
					></div>
					<!-- 中间 -->
					<div class="midBox">
						<el-tabs
							  class="mid-tabs"
								v-model="editableTabsValue"
								type="card"
								closable
								@tab-remove="removeTab"
								@tab-click="clickTab"
							>
							 <el-tab-pane
										v-for="item in editableTabs"
										:key="item.name"
										:label="item.title"
										:name="item.name"
								>
								</el-tab-pane>
						</el-tabs>
						<el-scrollbar v-show="editableTabsValue=='0'">
							<div class="summaryInfo" style="margin: 30px">
								<el-descriptions
								    title="数睿通数据开发计算平台"
								    :column="1"
								    size="large"
								    direction="horizontal"
								  >
									<el-descriptions-item label="概述"></el-descriptions-item>
								    <el-descriptions-item label="">数睿通数据开发计算平台，支持 Flink 实时开发，SQL 离线开发</el-descriptions-item>
								    <el-descriptions-item label="快捷引导"></el-descriptions-item>
										<el-descriptions-item label="">1. 前往数据开发—注册中心，注册集群</el-descriptions-item>
										<el-descriptions-item label="">2. 左侧目录维护作业目录结构，添加作业</el-descriptions-item>
										<el-descriptions-item label="">3. 编写 Flink SQL 或 SQL 任务代码，保存，运行，提交</el-descriptions-item>
								  </el-descriptions>
							</div>
						</el-scrollbar>
						<div v-show="editableTabsValue!='0' && currentTaskType !='3'" style="height:100%" @keydown.s = "saveTaskCommand($event)">
							<DataStudio v-show="editableTabsValue!='0' && currentTaskType !='3'" ref="dataStudioRef"></DataStudio>
						</div>
						<div v-show="editableTabsValue!='0' && currentTaskType =='3'" style="height:100%;margin: 50px;" @keydown.s = "saveTaskCommand($event)">
							<div class="summaryInfo" style="margin: 30px">
								<el-descriptions
								    title="运行 FlinkJar 任务！"
								    :column="1"
								    size="large"
								    direction="horizontal"
								  >
								    <el-descriptions-item label="快捷引导"></el-descriptions-item>
										<el-descriptions-item label="">1. 在右侧配置 FlinkJar 任务执行参数</el-descriptions-item>
										<el-descriptions-item label="">2. 配置完毕后点击右上方保存按钮保存</el-descriptions-item>
										<el-descriptions-item label="">3. 点击提交按钮提交任务</el-descriptions-item>
								  </el-descriptions>
							</div>
						</div>
					</div>
					<div
						class="rightResize"
						title="左右侧边栏"
					></div>
					<!-- 右侧 -->
					<div class="right">
						<el-scrollbar>
							<div class="summaryInfo" style="margin: 30px" v-show="editableTabsValue=='0'">
								<el-descriptions
								    title="使用帮助"
								    :column="1"
								    size="large"
								    direction="horizontal"
								  >
										<el-descriptions-item label="公众号"></el-descriptions-item>
								    <el-descriptions-item label=""><b>螺旋编程极客</b></el-descriptions-item>
										<el-descriptions-item label="用户手册"></el-descriptions-item>
										<el-descriptions-item label=""><el-button style="font-size: 17px" link type="primary"><a href="http://zrxlh.top" target="_blank">点击前往</a></el-button></el-descriptions-item>
								  </el-descriptions>
							</div>
							<div v-show="editableTabsValue!='0' && currentTaskType=='1'" style="padding: 30px 20px">
								<el-form ref="sqlDataFormRef" :model="sqlDataForm" :rules="sqlDataFormRules">
									<el-form-item label="选择" prop="sqlDbType">
										<el-radio-group v-model="sqlDataForm.sqlDbType">
												<el-radio :label="1" border>数据库</el-radio>
												<el-radio :label="2" border>中台库</el-radio>
										</el-radio-group>
									</el-form-item>
									<el-form-item label="选择" prop="databaseId" v-if="sqlDataForm.sqlDbType=='1'">
										<el-select v-model="sqlDataForm.databaseId"
															 clearable
															 filterable 
										           placeholder="请选择">
										  <el-option v-for="(item,index) in sqlDataForm.databaseList"
										             :key="item.id"
										             :label="`[${item.id}]${item.name}`"
										             :value="item.id"></el-option>
										</el-select>
									</el-form-item>
									<el-form-item label="数据预览最大行数" prop="pvdataNum">
										<el-input-number v-model="sqlDataForm.pvdataNum" :min="1" :max="1000" />
									</el-form-item>
									<el-form-item label="开启事务" prop="openTrans">
										<el-tooltip
												effect="dark"
												content="如果数据库本身不支持事务, 则不要开启"
												placement="top-end"
											>
											<el-switch
												v-model="sqlDataForm.openTrans"
												:active-value="1"
												:inactive-value="0"
											/>
										</el-tooltip>
									</el-form-item>
								</el-form>
							</div>
							<div v-show="editableTabsValue!='0' && (currentTaskType=='2' || currentTaskType=='3' || currentTaskType=='4')" style="padding: 15px 20px">
								<el-form ref="flinkSqlDataFormRef" :model="flinkSqlDataForm" :rules="flinkSqlDataFormRules">
									<el-divider><span style="font-size: 15px">作业配置</span></el-divider>
									<el-form-item label="执行模式" prop="type" v-if="currentTaskType=='2' || currentTaskType=='3'">
										<fast-select v-if="currentTaskType=='2'" v-model="flinkSqlDataForm.type" dict-type="production_cluster_type" placeholder="请选择" clearable></fast-select>
										<fast-select v-else v-model="flinkSqlDataForm.type" dict-type="jar_run_type" placeholder="请选择" clearable @change="jarRunTypeChange"></fast-select>
									</el-form-item>
									<el-form-item label="flink版本" prop="flinkVersion" v-if="currentTaskType=='2' || currentTaskType=='3'">
										<fast-select v-model="flinkSqlDataForm.flinkVersion" dict-type="flink_version" placeholder="请选择" clearable></fast-select>
									</el-form-item>
									<!-- 只有 Standalone 和 Yarn Session ，k8s session 模式选择集群实例，其他非 local 模式需要选择集群配置自动生成 FLink 集群 -->
									<el-form-item label="Flink集群实例" prop="clusterId" v-if="(currentTaskType=='2' || currentTaskType=='3') && (flinkSqlDataForm.type=='1' || flinkSqlDataForm.type=='2' || flinkSqlDataForm.type=='5')">
										<el-select v-model="flinkSqlDataForm.clusterId"
															 clearable
															 filterable 
										           placeholder="请选择">
										  <el-option v-for="(item,index) in flinkSqlDataForm.clusterList"
										             :key="item.id"
										             :label="`[${item.id}]${item.name}`"
										             :value="item.id"></el-option>
										</el-select>
									</el-form-item>
									<el-form-item label="Flink集群配置" prop="clusterConfigurationId" v-if="(currentTaskType=='2' || currentTaskType=='3') && (flinkSqlDataForm.type=='3' || flinkSqlDataForm.type=='4' || flinkSqlDataForm.type=='6')">
										<el-select v-model="flinkSqlDataForm.clusterConfigurationId"
															 clearable
															 filterable 
										           placeholder="请选择">
										  <el-option v-for="(item,index) in flinkSqlDataForm.clusterConfiguratioList"
										             :key="item.id"
										             :label="`[${item.id}]${item.name}`"
										             :value="item.id"></el-option>
										</el-select>
									</el-form-item>
									<el-form-item label="JAR" prop="jarId" v-if="currentTaskType=='3'">
										<el-tooltip content="选择要执行的 JAR 包" placement="top">
										    <el-select v-model="flinkSqlDataForm.jarId"
										    					 clearable
										    					 filterable 
										               placeholder="请选择">
										      <el-option v-for="(item,index) in jarList"
										                 :key="item.id"
										                 :label="`[${item.id}]${item.name}`"
										                 :value="item.id"></el-option>
										    </el-select>
										</el-tooltip>
									</el-form-item>
									<el-form-item label="FlinkSql公共代码块" prop="envId" v-if="currentTaskType=='2'">
										<el-tooltip content="选择代码块之后会前置执行代码块中的内容,主要用于初始化 ddl 操作,定义全局变量等,避免每个作业重复书写" placement="top">
										    <el-select v-model="flinkSqlDataForm.envId"
										    					 clearable
										    					 filterable 
										               placeholder="请选择">
										      <el-option v-for="(item,index) in flinkSqlDataForm.envList"
										                 :key="item.id"
										                 :label="`[${item.id}]${item.name}`"
										                 :value="item.id"></el-option>
										    </el-select>
										</el-tooltip>
									</el-form-item>
									<el-form-item label="任务并行度" prop="parallelism" v-if="(currentTaskType=='2' || currentTaskType=='3')">
										<el-input-number v-model="flinkSqlDataForm.parallelism" :min="1" :max="10" />
									</el-form-item>
									<el-form-item label="insert语句集" prop="statementSet" v-if="currentTaskType=='2'">
										<el-tooltip content="开启insert语句集后会自动过滤掉SELECT,SHOW,DESCRIBE,DESC语句" placement="top">
										    <el-switch
										      v-model="flinkSqlDataForm.statementSet"
										      :active-value="true"
										      :inactive-value="false"
										    />
										  </el-tooltip>
									</el-form-item>
									<el-form-item label="全局变量" prop="fragment" v-if="currentTaskType !='3'">
										<el-tooltip content="开启FlinkSql全局变量,使用“:=”进行定义(以配置中心配置的sql分隔符(默认;)结束),“${}”进行调用" placement="top">
										    <el-switch
										      v-model="flinkSqlDataForm.fragment"
										      :active-value="true"
										      :inactive-value="false"
										    />
										  </el-tooltip>
									</el-form-item>
									<el-form-item label="批处理" prop="batchModel" v-if="currentTaskType=='2'">
										<el-tooltip content="使用批处理模式" placement="top">
										    <el-switch
										      v-model="flinkSqlDataForm.batchModel"
										      :active-value="true"
										      :inactive-value="false"
										    />
										  </el-tooltip>
									</el-form-item>
									<el-form-item label="savepoint策略" prop="savePointStrategy" v-if="(currentTaskType=='2' || currentTaskType=='3')">
										<el-tooltip content="指定savepoint策略,使用savepoint需要在运维中心手动savepoint一次才会有savepoint记录" placement="top">
										    <fast-select v-model="flinkSqlDataForm.savePointStrategy" dict-type="savepoint_strategy"></fast-select>
										</el-tooltip>
									</el-form-item>
									<el-form-item label="savepoint地址" prop="savePointPath" v-if="flinkSqlDataForm.savePointStrategy == 3">
										<el-tooltip content="从指定的savePointPath恢复任务" placement="top">
										    <el-input v-model="flinkSqlDataForm.savePointPath" placeholder="填写 hdfs 地址"></el-input>
										</el-tooltip>
									</el-form-item>
									<el-divider v-if="currentTaskType=='2'">
										<el-tooltip content="执行配置仅在同步运行时有效, 提交作业无效" placement="top"><span style="font-size: 15px">执行配置</span></el-tooltip>
									</el-divider>
									<el-form-item label="预览结果" prop="useResult" v-if="currentTaskType=='2'">
										<el-tooltip content="开启预览结果，将同步运行并返回数据结果" placement="top">
										    <el-switch
										      v-model="flinkSqlDataForm.useResult"
										      :active-value="true"
										      :inactive-value="false"
										    />
										  </el-tooltip>
									</el-form-item>
									<el-form-item label="打印流" prop="useChangeLog" v-if="flinkSqlDataForm.useResult">
										<el-tooltip content="开启打印流，将同步运行并返回ChangeLog" placement="top">
										    <el-switch
										      v-model="flinkSqlDataForm.useChangeLog"
										      :active-value="true"
										      :inactive-value="false"
										    />
										  </el-tooltip>
									</el-form-item>
									<el-form-item label="自动停止" prop="useAutoCancel" v-if="flinkSqlDataForm.useResult">
										<el-tooltip content="开启自动停止，将在捕获最大行数记录后自动停止任务" placement="top">
										    <el-switch
										      v-model="flinkSqlDataForm.useAutoCancel"
										      :active-value="true"
										      :inactive-value="false"
										    />
										  </el-tooltip>
									</el-form-item>
									<el-form-item label="数据预览最大行数" prop="pvdataNum" v-if="flinkSqlDataForm.useResult">
										<el-input-number v-model="flinkSqlDataForm.pvdataNum" :min="1" :max="1000" />
									</el-form-item>
								</el-form>
							</div>
						</el-scrollbar>
					</div>
				</div>
				<div
				   title="上下侧边栏" 
					 class="bottomResize">
				</div>
				<!-- 下方 -->
				<div class="downBox">
					<el-tabs class="buttom-tabs">
						<el-tab-pane>
							<template #label>
								<span class="custom-tabs-label">
									<el-icon><Postcard /></el-icon>&nbsp;
									<span>日志信息</span>
								</span>
							</template>
							<read-only-studio id="consoleLog" ref="consoleLogRef" style="height: 100%"></read-only-studio>
						</el-tab-pane>
						<el-tab-pane>
							<template #label>
								<span class="custom-tabs-label">
									<el-icon><DataLine /></el-icon>&nbsp;
									<span>结果</span>
								</span>
							</template>
							<console-result ref="consoleResultRef"></console-result>
						</el-tab-pane>
						<el-tab-pane>
							<template #label>
								<span class="custom-tabs-label">
									<el-icon><Calendar /></el-icon>&nbsp;
									<span>作业运维</span>
								</span>
							</template>
							<el-scrollbar>
								<TaskHistory ref="taskHistoryRef" :ifChild='true'></TaskHistory>
							</el-scrollbar>
						</el-tab-pane>
					</el-tabs>
				</div>
			</div>
			
			<!-- 右键菜单 -->
			<div :style="{'z-index': 9999, position: 'fixed',left: ckRightOptionData.optionCardX + 'px', 
							top: ckRightOptionData.optionCardY + 'px', width: '100px', background: 'white',
							 'box-shadow': '0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04)'}" 
							 v-show="ckRightOptionData.optionCardShow" id="option-button-group">
				<el-button v-show="ckRightOptionData.optionData.ifLeaf" @click="appendCatalogueChild" class="option-card-button">添加子目录</el-button>
				<el-button v-show="ckRightOptionData.optionData.ifLeaf" @click="appendCatalogueTask" class="option-card-button">创建作业</el-button>
				<el-button @click="renameCatalogue" class="option-card-button">修改</el-button>
				<el-button @click="deleteCatalogue" class="option-card-button">删除</el-button>
			</div>
			<!-- 作业目录 -->
			<catalogue-add-or-update ref="CatalogueAddOrUpdateRef" @refreshDataList="getCatalogueTreeList"></catalogue-add-or-update>
			<explain-sql-dialog ref="explainSqlDialogRef"></explain-sql-dialog>
			
		</el-card>
</template>

<script lang="ts" setup name="Data-developmentProductionIndex">
	
import { onMounted, ref, watch, reactive, provide,nextTick } from 'vue'
import CatalogueAddOrUpdate from './catalogue-add-or-update.vue'
import Databases from './databases.vue'
import Middledb from './middledb.vue'
import explainSqlDialog from './explainSql.vue'
import DataStudio from './data-studio.vue'
import FlinkPng from "../../../assets/flink.png"
import SqlPng from "../../../assets/sql.png"
import folderPng from "../../../assets/folder.png"
import FlinkEnvPng from "../../../assets/flinkenv.png"
import JarPng from "../../../assets/jar.png"
import { useCatalogueListApi,useCatalogueDelApi } from '@/api/data-development/catalogue'
import { listAllClusterApi } from '@/api/data-development/cluster'
import { listAllClusterConfigurationApi } from '@/api/data-development/clusterConfiguration'
import { useTaskSubmitApi, useTaskApi, explainSqlApi, executeSqlApi,submitTaskToClusterApi,getConsoleLogApi,clearConsoleLogApi,endConsoleLogApi,clearConsoleLogWithOutKeyApi, getEnvListApi} from '@/api/data-development/task'
import { getJarListApi } from '@/api/data-development/jar'
import { listDatabase } from '@/api/data-integrate/database'
import { ElMessage, ElMessageBox } from 'element-plus/es'
import { ElNotification } from 'element-plus'
import ReadOnlyStudio from './readonly-studio.vue'
import ConsoleResult from './console-result.vue'
import TaskHistory from '../task-history/index.vue'

/**
 * 初始话加载
 */
const jarList = ref([])
onMounted(()=>{
	dragControllerLeftLR()
	dragControllerRightLR()
	dragControllerUD()
	//加载作业目录树
	getCatalogueTreeList()
	//获取数据库列表
	getDatabaseList()
	//获取集群实例
	getClusterList()
	//获取集群配置
	getClusterConfigurationList()
	//获取flinksql代码块
	getEnvList()
})

const getEnvList = () => {
	getEnvListApi().then(res=> {
		flinkSqlDataForm.envList = res.data
	})
}

const getJarList = (jarRunType: any) => {
	getJarListApi(jarRunType).then(res=>{
		jarList.value = res.data
	})
}

const jarRunTypeChange = (jarRunType: any) => {
	flinkSqlDataForm.jarId = ''
	if(jarRunType) {
		getJarList(jarRunType)
	}
}

//底部控制台
const consoleLogRef = ref()

const clearLog = () => {
	consoleLogRef.value.setEditorValue('')
	clearConsoleLogWithOutKeyApi()
}

const logEnd = ref(false)
//每1s获取一次日志
const getConsoleLog = () => {
	 getConsoleLogApi().then(res=> {
		 //设置log
		 if(res.data.log != consoleLogRef.value.getEditorValue()) {
			 consoleLogRef.value.setEditorValue(res.data.log)
		 }
			//如果没结束，再次调用
		 if(!res.data.end && !logEnd.value) {
			 setTimeout(() => {getConsoleLog()},1000)
		 } else {
			 //清空日志
			 clearConsoleLogApi()
			 logEnd.value = false
		 }
	 })
}


/**
 * 作业目录树引用
 */
const catalogueTreeRef = ref()
const CatalogueAddOrUpdateRef = ref()
//默认选中目录
const activeCatalogueName = ref("catalogue")
/**
 * 作业数目录数据
 */
const catalogueTreeList = ref<Tree[]>([])
const filterCatalogueText = ref('')
watch(filterCatalogueText, (val) => {
  catalogueTreeRef.value!.filter(val)
})
/**
 * 获取目录树
 */
const getCatalogueTreeList = () => {
	useCatalogueListApi().then(res=>{
		catalogueTreeList.value = res.data
	})
}
/**
 * 添加作业目录根目录
 */
const appendCatalogueRoot = () => {
	CatalogueAddOrUpdateRef.value.init(null,0,'',1)
}
/**
 * 添加目录树子菜单
 */
const appendCatalogueChild = () => {
	let nodeData = ckRightOptionData.optionData
	CatalogueAddOrUpdateRef.value.init(null, nodeData.id, nodeData.path, 1)
	OptionCardClose()
}
/**
 * 添加作业
 */
const appendCatalogueTask = () => {
	let nodeData = ckRightOptionData.optionData
	CatalogueAddOrUpdateRef.value.init(null, nodeData.id, nodeData.path, 0)
	OptionCardClose()
}
/**
 * 重命名
 */
const renameCatalogue = () => {
	let nodeData = ckRightOptionData.optionData
	CatalogueAddOrUpdateRef.value.init(nodeData.id, nodeData.parentId, nodeData.parentPath, nodeData.ifLeaf)
	OptionCardClose()
}
/**
 删除目录
 */
const deleteCatalogue = () => {
	OptionCardClose()
	ElMessageBox.confirm('将同步删除任务及其配置，是否继续', '提示', {
		confirmButtonText: '是',
		cancelButtonText: '否',
		type: 'warning'
	}).then(() => {
		let nodeData = ckRightOptionData.optionData
		useCatalogueDelApi(nodeData.id).then(res=> {
			ElMessage.success("删除成功！")
			getCatalogueTreeList()
			//移除tab
			removeTabMethod(nodeData.id+"")
		})
	})
}

/**
 * 节点筛选
 */
const filterNode = (value: string, data: Tree) => {
  if (!value) return true
  return data.label.includes(value) || data.label.includes(value.toUpperCase()) || data.label.includes(value.toLowerCase())
}

/**
 * 右键相关参数
 */
const ckRightOptionData = reactive({
	optionCardShow: false,
  optionCardX: 0,
	optionCardY: 0,
	optionData: {},
	node: '',
	tree: ''
})
/**
 * 右键节点
 */
const ckRightOption = (e, data, n, t) => {
	ckRightOptionData.optionCardShow = false 
	ckRightOptionData.optionCardX = e.x   // 让右键菜单出现在鼠标右键的位置
	ckRightOptionData.optionCardY = e.y
	ckRightOptionData.optionData = data
	ckRightOptionData.node = n // 将当前节点保存
	ckRightOptionData.tree = t
	ckRightOptionData.optionCardShow = true  // 展示右键菜单
}

/**
 * 点击右键菜单以外的地方
 */
const OptionCardClose = (event) => {
	var currentCli = document.getElementById("option-button-group");
	if (currentCli) {
		ckRightOptionData.optionCardShow = false;
		/* if (!currentCli.contains(event.target)) { //点击到了id为option-button-group以外的区域，就隐藏菜单
			ckRightOptionData.optionCardShow = false;
		} */
	}
}
//当前的代码tab
const editableTabsValue = ref('0')
const editableTabs = ref([])
//vscode编辑器
const dataStudioRef = ref()
//存储每个tab的编辑器的value
const editorValues = {}
//提供给子组件
provide("editorValues",editorValues)
provide("editableTabsValue",editableTabsValue)
provide("editableTabs",editableTabs)
//数据库引用
const databasesRef = ref()
//中台库
const middledbRef = ref()
const sqlDataFormRef = ref()
const flinkSqlDataFormRef = ref()
//右侧sql类型作业的表单
const sqlDataForm = reactive({
	statement: '',
	sqlDbType: '',
	databaseId: '',
	databaseList: [],
	pvdataNum: 100,
	openTrans: 0,
	processEnd: true
})
const sqlDataFormRules = ref({
	sqlDbType: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	databaseId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	pvdataNum: [{ required: true, message: '必填项不能为空', trigger: 'blur' }]
})

//右侧flinkSql类型作业的表单
const flinkSqlDataForm = reactive({
	statement: '',
	type: '',
	flinkVersion: '',
	clusterId: '',
	clusterList: [],
	clusterConfigurationId: '',
	envList: [],
	envId: '',
	jarId: '',
	clusterConfiguratioList: [],
	parallelism: 1,
	savePointStrategy: 0,
	savePointPath: '',
	fragment: false,
	statementSet: false,
	batchModel: false,
	useAutoCancel: false,
	useChangeLog: false,
	useResult: false,
	pvdataNum: 100,
	processEnd: true
})
const flinkSqlDataFormRules = ref({
	type: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	flinkVersion: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	clusterId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	jarId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	clusterConfigurationId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	parallelism: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	fragment: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	statementSet: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	batchModel: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	savePointStrategy: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	savePointPath: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	useAutoCancel: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	useChangeLog: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	useResult: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	pvdataNum: [{ required: true, message: '必填项不能为空', trigger: 'blur' }]
})
const getClusterList = () => {
	listAllClusterApi().then(res=>{
		flinkSqlDataForm.clusterList = res.data
	})
}

const getClusterConfigurationList = () => {
	listAllClusterConfigurationApi().then(res=>{
		flinkSqlDataForm.clusterConfiguratioList = res.data
	})
}

//当前选择的作业类型
const currentTaskType=ref('')
//当前操作的节点
const currentNodeData = ref()
provide("currentNodeData",currentNodeData)
//头部索引
const headList = ref(['顶部导航栏'])

//保存作业
const saveTask = () => {
	let data = {}
	//判断作业类型
	if(currentTaskType.value == '1') {
		//如果是sql类型的任务，检查sql参数
		sqlDataFormRef.value.validate((valid: boolean) => {
			if (!valid) {
				ElMessage.warning('请把必填项补充完整再保存！')
				return false
			}
			//如果是中台库，没有databaseId
			if (sqlDataForm.sqlDbType == '2') {
				sqlDataForm.databaseId = ''
			}
			Object.assign(data, sqlDataForm)
			//提交
			sumbitTask(data)
		})
	} else if (currentTaskType.value == '2' ||  currentTaskType.value == '3' || currentTaskType.value == '4') {
		flinkSqlDataFormRef.value.validate((valid: boolean) => {
			if (!valid) {
				ElMessage.warning('请把必填项补充完整再保存！')
				return false
			}
			//如果不是 standalone，yarn session，k8s session 
			if(flinkSqlDataForm.type != '1' && flinkSqlDataForm.type != '2' && flinkSqlDataForm.type != '5' ) {
				flinkSqlDataForm.clusterId = ''
			} else {
				flinkSqlDataForm.clusterConfigurationId = ''
			}
			//如果是local
			if (flinkSqlDataForm.type == '0') {
				flinkSqlDataForm.clusterId = ''
				flinkSqlDataForm.clusterConfigurationId = ''
			}
			if (flinkSqlDataForm.savePointStrategy != '3') {
				flinkSqlDataForm.savePointPath = ''
			}
			if(currentTaskType.value != '2') {
				flinkSqlDataForm.useResult = false
			}
			if(currentTaskType.value != '3') {
				flinkSqlDataForm.jarId = ''
			}
			if (!flinkSqlDataForm.useResult) {
				flinkSqlDataForm.pvdataNum = null
				flinkSqlDataForm.useChangeLog = false
				flinkSqlDataForm.useAutoCancel = false
			}
			Object.assign(data, flinkSqlDataForm)
			//提交
			sumbitTask(data)
		})
  }
}

//请求后台保存任务
const sumbitTask = (data:any) => {
	data.catalogueId = currentNodeData.value.id
	data.name = currentNodeData.value.name
	data.alias = currentNodeData.value.name
	data.dialect = currentTaskType.value
	data.statement = dataStudioRef.value.getEditorValue()
	useTaskSubmitApi(data).then(res=>{
		if(currentTaskType.value == '1') {
			Object.assign(sqlDataForm, res.data)
		} else if (currentTaskType.value == '2' || currentTaskType.value == '3' || currentTaskType.value == '4') {
			//console.log(res.data)
			Object.assign(flinkSqlDataForm, res.data)
			//console.log(flinkSqlDataForm)
		}
		if(!data.id) {
			//如果是新增操作，刷新树节点
			getCatalogueTreeList()
			//给当前节点赋予任务id
			currentNodeData.value.taskId = res.data.id
		}
		ElMessage.success({
			message: '操作成功',
			duration: 500
		})
	})
}

const getTaskInfo = (id: any, targetName: any, setCodeText: any) => {
	sqlDataForm.id = ''
	flinkSqlDataForm.id = ''
	//重置表单数据
	sqlDataFormRef.value.resetFields()
	flinkSqlDataFormRef.value.resetFields()
	sqlDataForm.pvdataNum = null
	flinkSqlDataForm.pvdataNum = null
	flinkSqlDataForm.parallelism = null
	if(targetName) {
		editorValues[targetName]["codeText"] = editorValues[targetName]["codeText"]?editorValues[targetName]["codeText"]:''
		dataStudioRef.value.setEditorValue(editorValues[targetName]["codeText"]?editorValues[targetName]["codeText"]:'')
	}
	if(id) {
		useTaskApi(id).then(res=>{
			//设置编辑器的值
			if(setCodeText) {
				//console.log(res.data)
				dataStudioRef.value.setEditorValue(res.data.statement)
				if(targetName) {
					editorValues[targetName]["codeText"] = res.data.statement
				}
			}
			if(currentTaskType.value == '1') {
				Object.assign(sqlDataForm, res.data)
			} else if (currentTaskType.value == '2' || currentTaskType.value == '3' || currentTaskType.value == '4') {
				Object.assign(flinkSqlDataForm, res.data)
				flinkSqlDataForm.type = (flinkSqlDataForm.type || flinkSqlDataForm.type === 0) ? flinkSqlDataForm.type: ''
				if(flinkSqlDataForm.jarId) {
					getJarList(flinkSqlDataForm.type)
				}
			}
		})
	}
}

const explainSqlDialogRef = ref()
//检查sql有效性
const explainSql = async () => {
	try {
		let validate = true
		//sql
		if(currentTaskType.value == '1') {
			await sqlDataFormRef.value.validate((valid: boolean) => {
				if (!valid) {
					ElMessage.warning('请把必填项补充完整！')
					validate = false
					return false
				}
			})
			if(!validate) {
				return
			}
			if(!sqlDataForm.id) {
				ElMessage.warning('请先保存！')
				return
			}
			//先弹框
			explainSqlDialogRef.value.init()
			sqlDataForm.jobName = sqlDataForm.name
			sqlDataForm.maxRowNum = sqlDataForm.pvdataNum
			sqlDataForm.statement = dataStudioRef.value.getEditorValue()
			await clearConsoleLogApi()
			getConsoleLog()
			const { data } = await explainSqlApi(sqlDataForm)
			explainSqlDialogRef.value.finishExplain(data)
			//flinksql，flinksqlenv
		} else if (currentTaskType.value == '2' || currentTaskType.value == '4') {
			await flinkSqlDataFormRef.value.validate((valid: boolean) => {
				if (!valid) {
					ElMessage.warning('请把必填项补充完整！')
					validate = false
					return false
				}
			})
			if(!validate) {
				return
			}
			if(!flinkSqlDataForm.id) {
				ElMessage.warning('请先保存！')
				return
			}
			//先弹框
			explainSqlDialogRef.value.init()
			flinkSqlDataForm.useRemote = true
			flinkSqlDataForm.useSession = false
			flinkSqlDataForm.jobName = flinkSqlDataForm.name
			flinkSqlDataForm.maxRowNum = flinkSqlDataForm.pvdataNum
			flinkSqlDataForm.statement = dataStudioRef.value.getEditorValue()
			await clearConsoleLogApi()
			getConsoleLog()
			const { data } = await explainSqlApi(flinkSqlDataForm)
			explainSqlDialogRef.value.finishExplain(data)
		}
	} finally {
		logEnd.value = true
	}
}
//按钮是否loading，防止重复点击
const executeSqlButton = ref(false)
const submitTaskToClusterButton = ref(false)
//下方结果
const consoleResultRef = ref()
//执行sql
const executeSql = async () => {
	let validate = true
	executeSqlButton.value = true
	try {
		if(currentTaskType.value == '1') {
			await sqlDataFormRef.value.validate((valid: boolean) => {
				if (!valid) {
					ElMessage.warning('请把必填项补充完整！')
					validate = false
					return false
				}
			})
			if(!validate) {
				return
			}
			if(!sqlDataForm.id) {
				ElMessage.warning('请先保存！')
				return
			}
			sqlDataForm.jobName = sqlDataForm.name
			sqlDataForm.maxRowNum = sqlDataForm.pvdataNum
			sqlDataForm.statement = dataStudioRef.value.getEditorValue()
			//清空日志
			await clearConsoleLogApi()
			//获取日志
			getConsoleLog()
			//提示
			ElNotification({
					title: '提示',
					message: '正在检查sql语句正确性。。。',
					duration: 0,
					zIndex: 9999,
					type: 'success',
			})
			//先检查sql，processEnd 设置为false，避免因为explain结束后获取不到后续日志
			sqlDataForm.processEnd = false
			const { data } = await explainSqlApi(sqlDataForm)
			sqlDataForm.processEnd = true
			const result = explainSqlDialogRef.value.finishExplain(data)
			ElNotification.closeAll()
			//如果检测通过
			if(result) {
				//提示
				ElNotification({
						title: '提示',
						message: '正在执行sql，请耐心等待。。。',
						duration: 0,
						zIndex: 9999,
						type: 'success',
				})
				//执行sql
				const { data } = await executeSqlApi(sqlDataForm)
				ElNotification.closeAll()
				if(!data.success) {
					ElMessage.error('执行失败，请查看日志信息排查原因！')
					consoleResultRef.value.init(data.result, currentTaskType.value)
					return
				}
				ElMessage.success('执行成功，请前往运维中心查看具体信息！')
				consoleResultRef.value.init(data.result, currentTaskType.value)
			} else {
					//弹框
					explainSqlDialogRef.value.showError()
					endConsoleLogApi()
			}
			// flinksql
		} else if (currentTaskType.value == '2') {
			await flinkSqlDataFormRef.value.validate((valid: boolean) => {
				if (!valid) {
					ElMessage.warning('请把必填项补充完整！')
					validate = false
					return false
				}
			})
			if(!validate) {
				return
			}
			if(!flinkSqlDataForm.id) {
				ElMessage.warning('请先保存！')
				return
			}
			flinkSqlDataForm.useRemote = true
			flinkSqlDataForm.useSession = false
			flinkSqlDataForm.jobName = flinkSqlDataForm.name
			flinkSqlDataForm.maxRowNum = flinkSqlDataForm.pvdataNum
			flinkSqlDataForm.statement = dataStudioRef.value.getEditorValue()
			//判断任务类型
			if(flinkSqlDataForm.type != '0' && flinkSqlDataForm.type != '1' && flinkSqlDataForm.type != '2' && flinkSqlDataForm.type != '5' ) {
				ElMessage.warning('该任务执行模式为不支持 SQL 同步执行，请手动保存后使用右侧按钮——作业提交！')
				return
			}
			await clearConsoleLogApi()
			getConsoleLog()
			//提示
			ElNotification({
					title: '提示',
					message: '正在检查sql语句正确性。。。',
					duration: 0,
					zIndex: 9999,
					type: 'success',
			})
			flinkSqlDataForm.processEnd = false
			const { data } = await explainSqlApi(flinkSqlDataForm)
			flinkSqlDataForm.processEnd = true
			const result = explainSqlDialogRef.value.finishExplain(data)
			ElNotification.closeAll()
			if(result) {
				//提示
				ElNotification({
						title: '提示',
						message: '正在执行sql，请耐心等待。。。',
						duration: 0,
						zIndex: 9999,
						type: 'success',
				})
				//执行sql
				const { data } = await executeSqlApi(flinkSqlDataForm)
				ElNotification.closeAll()
				if(data.status == "FAILED") {
					ElMessage.error('执行失败，请查看日志信息排查原因！')
					consoleResultRef.value.init(data.result, currentTaskType.value)
					return
				}
				ElMessage.success('执行成功，请前往运维中心查看具体信息！')
				//如果查询结果为空
				if(!data.result) {
					data.result = {}
					data.result.success = true
					data.result.jobId = data.jobId
				}
				consoleResultRef.value.init(data.result, currentTaskType.value)
			} else {
				//弹框
				explainSqlDialogRef.value.showError()
				endConsoleLogApi()
			}
		}
	} finally {
		executeSqlButton.value = false
		ElNotification.closeAll()
		logEnd.value = true
	}
}
//提交作业到集群
const submitTaskToCluster = async () => {
	await ElMessageBox.confirm('确定提交吗，提交前请确保任务已经保存！', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	})
	let validate = true
	await flinkSqlDataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			ElMessage.warning('请把必填项补充完整！')
			validate = false
			return false
		}
	})
	if(!validate) {
		return
	}
	if(!flinkSqlDataForm.id) {
		ElMessage.warning('请先保存再提交！')
		return
	}
	submitTaskToClusterButton.value = true
	try {
		flinkSqlDataForm.useRemote = true
		flinkSqlDataForm.useSession = false
		flinkSqlDataForm.jobName = flinkSqlDataForm.name
		flinkSqlDataForm.maxRowNum = flinkSqlDataForm.pvdataNum
		flinkSqlDataForm.statement = dataStudioRef.value.getEditorValue()
		//提示
		await clearConsoleLogApi()
		getConsoleLog()
		let result = true
		if (currentTaskType.value != '3') {
			ElNotification({
			    title: '提示',
			    message: '正在检查sql语句正确性。。。',
				  duration: 0,
					zIndex: 9999,
			    type: 'success',
			})
			flinkSqlDataForm.processEnd = false
			const { data } = await explainSqlApi(flinkSqlDataForm)
			flinkSqlDataForm.processEnd = true
			result = explainSqlDialogRef.value.finishExplain(data)
			ElNotification.closeAll()
		} 
		if(result) {
			//提示
			ElNotification({
					title: '提示',
					message: '正在提交作业，请耐心等待。。。',
					duration: 0,
					zIndex: 9999,
					type: 'success',
			})
			//提交
			const { data }  = await submitTaskToClusterApi(flinkSqlDataForm.id)
			ElNotification.closeAll()
			if(data.status == "FAILED") {
				ElMessage.error('提交失败，请查看日志信息排查原因！')
				return
			}
			ElMessage.success('提交成功，请前往运维中心查看具体信息！')
		} else {
			//弹框
			explainSqlDialogRef.value.showError()
			endConsoleLogApi()
		}
	} finally {
		submitTaskToClusterButton.value = false
		ElNotification.closeAll()
		logEnd.value = true
	}
}

//，美化sql
const formatSql = () => {
	dataStudioRef.value!.handleFormat()
}

/**
 * 作业目录树点击触发
 */
const catalogueTreeNodeCk = (e, data, n, t) => {
	headList.value = data.data.path.split("/")
	//关闭右键菜单
	OptionCardClose()
	//如果是作业目录，添加tab
	if(data.data.taskType) {
		addTab(data.data)
	}
} 

const clickTab = (tabsPaneContext) => {
	//console.log(tabsPaneContext.paneName)
	editableTabsValue.value = tabsPaneContext.paneName
	//从缓存中取值
	dataStudioRef.value.setEditorValue(editorValues[tabsPaneContext.paneName]?editorValues[tabsPaneContext.paneName]["codeText"]:'')
	currentTaskType.value = editorValues[tabsPaneContext.paneName]?editorValues[tabsPaneContext.paneName]["taskType"]:''
	currentNodeData.value = editorValues[tabsPaneContext.paneName]?editorValues[tabsPaneContext.paneName]["nodeData"]:{}
	headList.value = editorValues[tabsPaneContext.paneName]?editorValues[tabsPaneContext.paneName]["path"].split("/"):[],
	getTaskInfo(currentNodeData.value.taskId, null , false)
}

/**
 * 添加标签
 */
const addTab = (nodeData: any) => {
	//查看有没有这个tag
	let targetName = nodeData.id + ''
	const tabs = editableTabs.value
	let hasTab = false
	for(let i in tabs) {
		let tab = tabs[i]
		if(tab.name == targetName) {
			hasTab = true
			tab.title = nodeData.name
			break
		}
	}
	//没有这个标签，添加，并且激活标签页
	if(!hasTab) {
		editableTabs.value.push({
		  title: nodeData.name,
		  name: targetName
		})
		editableTabsValue.value = targetName
		//console.log(editableTabs.value)
		//请求接口根据节点id取值
	} else {
		editableTabsValue.value = targetName
		//从缓存中取值
		dataStudioRef.value.setEditorValue(editorValues[targetName]?editorValues[targetName]["codeText"]:'')
	}
	//console.log(editableTabsValue.value)
	if(!hasTab) {
		editorValues[targetName] = {}
	}
	editorValues[targetName]["path"] = nodeData.path
	//赋值当前的作业类型
	editorValues[targetName]["taskType"] = nodeData.taskType
	currentTaskType.value = nodeData.taskType
	//赋值当前的节点数据
	editorValues[targetName]["nodeData"] = nodeData
	currentNodeData.value = nodeData
	if(!hasTab) {
		//请求任务接口，赋值
		getTaskInfo(nodeData.taskId, targetName, true)
	} else {
		getTaskInfo(nodeData.taskId, targetName, false)
	}
}

/**
 * 删除标签
 */
const removeTab = (targetName: any) => {
	//提示是否缓存当前编辑的内容
	ElMessageBox.confirm('确认关闭吗？关闭后未保存的内容会丢失！', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	}).then(() => {
			removeTabMethod(targetName)
	})
}

const removeTabMethod = (targetName: any) => {
	const tabs = editableTabs.value
	let activeName = editableTabsValue.value
	var findActive = false
	var findTarget = false
	for (let i in tabs) {
		let tab = tabs[Number(i)]
		if (tab.name == targetName) {
			findTarget = true
			const nextTab = tabs[Number(i) + 1] || tabs[Number(i) - 1]
			if (nextTab) {
				//console.log(nextTab)
				findActive = true
				activeName = nextTab.name
				break
			}
		}
	}
	//如果没有找到要移除的tab，return
	if (!findTarget) {
		return
	}
	if(findActive) {
		 editableTabsValue.value = activeName
	} else {
		 editableTabsValue.value = '0'
	}
	 editableTabs.value = tabs.filter((tab) => tab.name != targetName)
	 //console.log(editableTabs.value)
	 //清空缓存中的值
	 delete editorValues[targetName]
	 //赋值下一个tab
	 dataStudioRef.value.setEditorValue(editorValues[activeName]?editorValues[activeName]["codeText"]:'')
	 //赋值当前的作业类型
	 currentTaskType.value = editorValues[activeName]?editorValues[activeName]["taskType"]:''
	 currentNodeData.value = editorValues[activeName]?editorValues[activeName]["nodeData"]:{}
	 headList.value = editorValues[activeName]?editorValues[activeName]["path"].split("/"):[],
	 getTaskInfo(currentNodeData.value.taskId, null, false)
}

//右侧选择数据源类型
const getDatabaseList = () => {
	listDatabase().then(res => {
		sqlDataForm.databaseList = res.data
	})
}

/**
 * 监听ctrl+s
 */
const saveTaskCommand = (e) => {
	if(e.ctrlKey == true){
		console.log("键盘触发ctrl+s");
		e.preventDefault()
		saveTask()
		return false;
	}
}


// 左侧左右拖动事件
const dragControllerLeftLR = () => {
	var leftResize = document.getElementsByClassName('leftResize')
	var rightResize = document.getElementsByClassName('rightResize')
	var left = document.getElementsByClassName('left')
	var right = document.getElementsByClassName('right')
	var midBox = document.getElementsByClassName('midBox')
	var box = document.getElementsByClassName('mainBox')
	for (let i = 0; i < leftResize.length; i++) {
		// 鼠标按下事件
		leftResize[i].onmousedown = function(e) {
			//颜色改变提醒
			leftResize[i].style.background = '#818181'
			var startX = e.clientX
			var leftMove = leftResize[i].offsetLeft
			var rightLength = box[i].clientWidth - rightResize[i].offsetWidth - rightResize[i].offsetLeft
			//console.log(rightLength)
			// 鼠标拖动事件
			document.onmousemove = function(e) {
				var endX = e.clientX
				var moveLen = leftMove + (endX - startX) // （endx-startx）=移动的距离。resize[i].left+移动的距离=左边区域最后的宽度
				var maxT = box[i].clientWidth - leftResize[i].offsetWidth - rightResize[i].offsetWidth - rightLength  // 容器宽度 - 左边区域的宽度 - 右边区域的宽度 = 中间区域宽度
				if (moveLen <= 100) moveLen = 100 // 左边区域的最小宽度为50px
				if (moveLen >= maxT - 120) moveLen = maxT - 120 //右边区域最小宽度为150px

				leftResize[i].style.left = moveLen // 设置左侧区域的宽度

				for (let j = 0; j < left.length; j++) {
					left[j].style.width = moveLen + 'px'
					right[j].style.width = rightLength -1 + 'px'
					if(midBox[j]) {
						midBox[j].style.width = maxT - moveLen -36 + 'px'
					}
				}
			}
			// 鼠标松开事件
			// eslint-disable-next-line no-unused-vars
			document.onmouseup = function(evt) {
				//颜色恢复
				leftResize[i].style.background = '#d6d6d6'
				document.onmousemove = null
				document.onmouseup = null
				leftResize[i].releaseCapture && leftResize[i].releaseCapture() //当你不在需要继续获得鼠标消息就要应该调用ReleaseCapture()释放掉
			}
			leftResize[i].setCapture && leftResize[i].setCapture() //该函数在属于当前线程的指定窗口里设置鼠标捕获
			return false
		}
	}
}
// 右侧左右拖动事件
const dragControllerRightLR = () => {
	var leftResize = document.getElementsByClassName('leftResize')
	var rightResize = document.getElementsByClassName('rightResize')
	var left = document.getElementsByClassName('left')
	var right = document.getElementsByClassName('right')
	var midBox = document.getElementsByClassName('midBox')
	var box = document.getElementsByClassName('mainBox')
	for (let i = 0; i < rightResize.length; i++) {
		// 鼠标按下事件
		rightResize[i].onmousedown = function(e) {
			//颜色改变提醒
			rightResize[i].style.background = '#818181'
			var startX = e.clientX
			rightResize[i].left = rightResize[i].offsetLeft
			var leftLength = left[i].offsetWidth
			console.log(leftLength)
			// 鼠标拖动事件
			document.onmousemove = function(e) {
				var endX = e.clientX
				var moveLen = rightResize[i].left + (endX - startX) 
				/* 最大容器宽度 */
				var maxT = box[i].clientWidth - leftResize[i].offsetWidth - rightResize[i].offsetWidth - leftLength

				if (moveLen - leftResize[i].offsetWidth - leftLength <= 120) moveLen = 120 + leftResize[i].offsetWidth + leftLength
				if (moveLen - leftResize[i].offsetWidth - leftLength + 100 >= maxT ) moveLen = maxT - 100 + leftResize[i].offsetWidth + leftLength

				rightResize[i].style.left = moveLen 

				for (let j = 0; j < right.length; j++) {
					if(midBox[j]) {
						midBox[j].style.width = moveLen - leftResize[i].offsetWidth - leftLength + 'px'
					}
					right[j].style.width = box[i].clientWidth - moveLen - rightResize[i].offsetWidth -1 + 'px'
				}
			}
			// 鼠标松开事件
			// eslint-disable-next-line no-unused-vars
			document.onmouseup = function(evt) {
				//颜色恢复
				rightResize[i].style.background = '#d6d6d6'
				document.onmousemove = null
				document.onmouseup = null
				rightResize[i].releaseCapture && rightResize[i].releaseCapture() //当你不在需要继续获得鼠标消息就要应该调用ReleaseCapture()释放掉
			}
			rightResize[i].setCapture && rightResize[i].setCapture() //该函数在属于当前线程的指定窗口里设置鼠标捕获
			return false
		}
	}
}
// 上下拖动事件
const dragControllerUD = () => {
	var bottomResize = document.getElementsByClassName('bottomResize')
	var topBox = document.getElementsByClassName('mainBox')
	var downBox = document.getElementsByClassName('downBox')
	var box = document.getElementsByClassName('box')
	for (let i = 0; i < bottomResize.length; i++) {
		// 鼠标按下事件
		bottomResize[i].onmousedown = function(e) {
			console.log(bottomResize[i].top);
			//颜色改变提醒
			bottomResize[i].style.background = '#818181'
			var startY = e.clientY
			bottomResize[i].top = bottomResize[i].offsetTop
			// 鼠标拖动事件
			document.onmousemove = function(e) {
				var endY = e.clientY
				var moveLen = bottomResize[i].top + (endY - startY) // （endY - startY）=移动的距离。resize[i].top+移动的距离=上边区域最后的高度
				var maxT = box[i].clientHeight - bottomResize[i].offsetHeight // 容器高度 - 上边区域的高度 = 下边区域的高度

				if (moveLen < 100) moveLen = 100 // 上边区域的最小高度为100px
				if (moveLen > maxT - 80) moveLen = maxT - 80 //下边区域最小高度为80px

				bottomResize[i].style.top = moveLen// 设置上边区域的高度

				for (let j = 0; j < topBox.length; j++) {
					topBox[j].style.height = moveLen + 'px'
					downBox[j].style.height = box[i].clientHeight - moveLen - bottomResize[i].offsetHeight + 'px'
				}
			}
			// 鼠标松开事件
			document.onmouseup = function() {
				//颜色恢复
				bottomResize[i].style.background = '#d6d6d6'
				document.onmousemove = null
				document.onmouseup = null
				bottomResize[i].releaseCapture && bottomResize[i].releaseCapture() //当你不在需要继续获得鼠标消息就要应该调用ReleaseCapture()释放掉
			}
			bottomResize[i].setCapture && bottomResize[i].setCapture() //该函数在属于当前线程的指定窗口里设置鼠标捕获
			return false
		}
	}
}


</script>

<style lang="scss">
.headerBox {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	height: 30px;
	/* background-color: #fff; */
}


.box {
	/* background-color: #fff; */
	width: 100%;
	height: calc(100vh - 200px);
	overflow: hidden;
}
/*包围div样式*/
.mainBox {
  width: 100%;
  height: 70%;
  overflow: hidden;
}
/*左侧div样式*/
.left {
  width: calc(15% - 10px); /*左侧初始化宽度*/
  height: 100%;
  float: left;
}
/* 拖拽区div样式 */
.leftResize {
  cursor: w-resize;
  float: left;
  position: relative;
  background-color: #d6d6d6;
  border-radius: 5px;
  margin-top: -10px;
  width: 10px;
  height: 100%;
  background-size: cover;
  background-position: center;
  /*z-index: 99999;*/
  font-size: 32px;
  color: white;
}
/*中间div'样式*/
.midBox {
  float: left;
  width: 65%; /*右侧初始化宽度*/
  height: 100%;
}
/* 拖拽区div样式 */
.rightResize {
  cursor: w-resize;
  float: left;
  position: relative;
  background-color: #d6d6d6;
  border-radius: 5px;
  margin-top: -10px;
  width: 10px;
  height: 100%;
  background-size: cover;
  background-position: center;
  /*z-index: 99999;*/
  font-size: 32px;
  color: white;
}
/* 右侧div */
.right {
  float: left;
  width: calc(20% - 10px); /*右侧初始化宽度*/
  height: 100%;
	overflow: hidden;
}
/* 拖拽区div样式 */
.bottomResize {
	overflow: hidden;
	cursor: s-resize;
	width: 100%;
	height: 10px;
	background-color: #d6d6d6;
	margin: 0 auto;
	border-radius: 5px;
	text-align: center;
	line-height: 3px;
	font-size: 32px;
	color: white;
}
/*下方div'样式*/
.downBox {
	overflow: hidden;
	height: calc(30% - 10px);
}

/*拖拽区鼠标悬停样式*/
.bottomResize:hover {
  color: #444444;
}

.demo-tabs > .el-tabs__content {
  padding: 10px;
}
.midBox > .el-tabs > .el-tabs__header {
    padding: 0;
    position: relative;
    margin: 0 0 0;
}
.midBox > .el-tabs {
    --el-tabs-header-height: 35px;
}
.demo-tabs .el-tree-node__content {
		height: 46px;
	}
.custom-tree-node {
  font-size: 18px;
}
// 右键菜单按钮
.option-card-button {
	width: 100%;
	margin-left: 0 !important;
	padding: 20px 20px;
	font-size: 14px;
	border-radius: 0;
}
.summaryInfo .el-descriptions--large .el-descriptions__header .el-descriptions__title {
	font-size: 28px;
}
.summaryInfo .el-descriptions--large .el-descriptions__body .el-descriptions__table .el-descriptions__cell .el-descriptions__label {
	font-size: 19px;
}
.summaryInfo .el-descriptions--large .el-descriptions__body .el-descriptions__table .el-descriptions__cell .el-descriptions__content {
	font-size: 17px;
}
.el-notification.right {
    height: 100px;
}

.buttom-tabs {
	height: 100%;
}

.buttom-tabs > .el-tabs__content {
	height: calc(100% - 40px);
  padding: 0;
}
/* 每个tab高度设置为100% */
.buttom-tabs > .el-tabs__content > .el-tab-pane {
	height: 100%;
}

.buttom-tabs .custom-tabs-label {	
		font-size: 16px;
}
.buttom-tabs > .el-tabs__header {
    padding: 0;
    position: relative;
    margin: 0 0 0;
}

</style>
