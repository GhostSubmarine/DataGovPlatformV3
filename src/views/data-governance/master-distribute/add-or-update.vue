<template>
	<el-dialog v-model="visible" :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false">
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
			<el-form-item label="选择主数据(已发布)" prop="masterModelId" label-width="auto">
				<el-tree-select v-model="dataForm.masterModelId" :props="props" :data="masterModelList" clearable @change="masterModelChange">
					<template #default="{ node, data }">
						 <div>
							 <span>
								 <img v-if="data.type==0" src="/src/assets/folder.png"/>
								 <img v-if="data.type==1" src="/src/assets/assets.png"/>
								 <span style="margin-left: 8px;">{{ data.name }}</span>
							 </span>
						 </div>
					</template>
				</el-tree-select>
			</el-form-item>
			<el-form-item label="派发类型" prop="distributeType" label-width="auto">
				<fast-select v-model="dataForm.distributeType" dict-type="distribute_type" placeholder="派发类型" clearable @change="distributeTypeChange"></fast-select>
			</el-form-item>
			<!-- mq或接口 -->
			<el-form-item label="调度类型" prop="taskType" label-width="auto">
				<fast-radio-group v-model="dataForm.taskType" dict-type="distribute_task_type"></fast-radio-group>
			</el-form-item>
			<el-form-item label="cron表达式" prop="cron" v-if="dataForm.taskType=='3'" label-width="auto">
				<el-input v-model="dataForm.cron" placeholder="cron表达式"></el-input>
			</el-form-item>
			<el-form-item label="描述" prop="description" label-width="auto">
				<el-input type="textarea" v-model="dataForm.description" placeholder="描述"></el-input>
			</el-form-item>
			<!-- 数据库相关参数 -->
			<template v-if="dataForm.distributeType == 1">
				<el-divider><span style="font-size: 17px"><b>接入配置</b></span></el-divider>
				<el-form-item label="接入数据库"  prop="distributeJson.distributeDb.databaseId" label-width="auto">
				  <el-select v-model="dataForm.distributeJson.distributeDb.databaseId"
										 clearable
										 filterable
				             placeholder="请选择">
				    <el-option v-for="(item,index) in databases"
				               :key="item.id"
				               :label="`[${item.id}]${item.name}`"
				               :value="item.id"></el-option>
				  </el-select>
				</el-form-item>
				<el-form-item label="只创建表" label-width="auto"
				              prop="distributeJson.distributeDb.onlyCreate">
				  <el-select v-model="dataForm.distributeJson.distributeDb.onlyCreate">
				    <el-option label='是'
				               :value="true"></el-option>
				    <el-option label='否'
				               :value="false"></el-option>
				  </el-select>
					<el-tooltip placement="top"  content="只在目标端创建表，不同步数据内容。">
					   <el-icon><QuestionFilled /></el-icon>
					</el-tooltip>
				</el-form-item>
				<el-form-item label="是否同步已存在的表" label-width="auto"
				              prop="distributeJson.distributeDb.syncExist">
				  <el-select v-model="dataForm.distributeJson.distributeDb.syncExist">
				    <el-option label='是'
				               :value="true"></el-option>
				    <el-option label='否'
				               :value="false"></el-option>
				  </el-select>
				</el-form-item>
				<el-form-item label="同步前是否删除目的表" label-width="auto"
				              prop="distributeJson.distributeDb.targetDrop">
				  <el-select v-model="dataForm.distributeJson.distributeDb.targetDrop">
				    <el-option label='是'
				               :value="true"></el-option>
				    <el-option label='否'
				               :value="false"></el-option>
				  </el-select>
				</el-form-item>
				<el-form-item label="是否启用增量变更同步" label-width="auto"
				              prop="distributeJson.distributeDb.changeDataSync">
				  <el-select v-model="dataForm.distributeJson.distributeDb.changeDataSync">
				    <el-option label='是'
				               :value="true"></el-option>
				    <el-option label='否'
				               :value="false"></el-option>
				  </el-select>
					<el-tooltip placement="top"  content="表不存在时会自动建表">
					   <el-icon><QuestionFilled /></el-icon>
					</el-tooltip>
				</el-form-item>
				<el-form-item label="是否表名字段名转小写" label-width="auto"
											v-if="!dataForm.distributeJson.distributeDb.uppercase"
				              prop="distributeJson.distributeDb.lowercase">
				  <el-select v-model="dataForm.distributeJson.distributeDb.lowercase">
				    <el-option label='是'
				               :value="true"></el-option>
				    <el-option label='否'
				               :value="false"></el-option>
				  </el-select>
					<el-tooltip placement="top"  content="表不存在时建表时才生效">
					   <el-icon><QuestionFilled /></el-icon>
					</el-tooltip>
				</el-form-item>
				<el-form-item label="是否表名字段名转大写" label-width="auto"
											v-if="!dataForm.distributeJson.distributeDb.lowercase"
				              prop="distributeJson.distributeDb.uppercase">
				  <el-select v-model="dataForm.distributeJson.distributeDb.uppercase">
				    <el-option label='是'
				               :value="true"></el-option>
				    <el-option label='否'
				               :value="false"></el-option>
				  </el-select>
					<el-tooltip placement="top"  content="表不存在时建表时才生效">
					   <el-icon><QuestionFilled /></el-icon>
					</el-tooltip>
				</el-form-item>
				<el-form-item label="数据处理批次大小" label-width="auto"
				              prop="distributeJson.distributeDb.fetchSize">
				  <el-select v-model="dataForm.distributeJson.distributeDb.fetchSize">
				    <el-option label="1000"
				               :value="1000"></el-option>
				    <el-option label="2000"
				               :value="2000"></el-option>
				    <el-option label="3000"
				               :value="3000"></el-option>
				    <el-option label="4000"
							  :value="4000"></el-option>
					<el-option label="5000"
							  :value="5000"></el-option>		  
				  </el-select>
					<el-tooltip placement="top"  content="数据同步时单个批次处理的行记录总数，该值越大越占用内存空间。建议：小字段表设置为5000，大字段表设置为1000">
					   <el-icon><QuestionFilled /></el-icon>
					</el-tooltip>
				</el-form-item>
				<el-divider><span style="font-size: 17px"><b>映射配置</b></span></el-divider>
				<div>
					<div class="tip-content">
						<br>
						<p> (1) 支持正则表达式匹配，也可直接填写需要映射的表名。 </p>
						<br>
						<p> (2) 当字段名映射规则记录为空时，代表目标表的字段名与源表名的字段名相同；不为空时，与映射的字段名一致。</p>
						<br>
						<p> (3) 若不想同步某个字段，填写源端字段之后，目标字段名映射留空即可。 </p>
					</div>
					<br>
					<el-button type="success"
					           @click="addTableNameMapperListRow()"
					           round>添加表名映射</el-button>
					<el-button type="primary"
					           @click="previewTableNameMapList()"
					           round>预览表名映射</el-button>
					<el-table :data="dataForm.distributeJson.distributeDb.regexTableMapper"
					          size="small"
					          border
					          height="200"
					          style="width:90%;margin-top: 15px;">
					  <template #empty>
					    <span>请点击"添加表名映射"按钮添加表名映射关系记录</span>
					  </template>
					  <el-table-column label="表名匹配的正则名"	
					                   width="320">
					    <template #default="scope">
					      <el-input v-model="scope.row.fromPattern"
					                type="string"> </el-input>
					    </template>
					  </el-table-column>
					  <el-table-column label="替换的目标值"
					                   width="320">
					    <template #default="scope">
					      <el-input v-model="scope.row.toValue"
					                type="string" ></el-input>
					    </template>
					  </el-table-column>
					  <el-table-column label="操作"
					                   width="220">
					    <template #default="scope">
					      <el-button size="small"
					                 type="danger"
					                 @click="deleteTableNameMapperListItem(scope.$index)">删除</el-button>
					    </template>
					  </el-table-column>
					</el-table>
					<br>
					<el-button type="success"
					           @click="addColumnNameMapperListRow()"
					           round>添加字段名映射</el-button>
					<el-button type="primary"
					           @click="previewColumnNameMapList()"
					           round>预览字段名映射</el-button>
					<el-table :data="dataForm.distributeJson.distributeDb.regexColumnMapper"
					          size="small"
					          border
					          height="200"
					          style="width:90%;margin-top: 15px;">
					  <template #empty>
					    <span>请点击"添加字段名映射"按钮添加字段名映射关系记录</span>
					  </template>
					  <el-table-column label="字段名匹配的正则名"
					                   width="320">
					    <template #default="scope">
					      <el-input v-model="scope.row.fromPattern"
					                type="string"> </el-input>
					    </template>
					  </el-table-column>
					  <el-table-column label="替换的目标值"
					                   width="320">
					    <template #default="scope">
					      <el-input v-model="scope.row.toValue"
					                type="string"></el-input>
					    </template>
					  </el-table-column>
					  <el-table-column label="操作"
					                   width="220">
					    <template #default="scope">
					      <el-button size="small"
					                 type="danger"
					                 @click="deleteColumnNameMapperListItem(scope.$index)">删除</el-button>
					    </template>
					  </el-table-column>
					</el-table>
				</div>
			</template>
			<!-- 接口相关参数 -->
			<template v-if="dataForm.distributeType == 2">
				<el-form-item label="url" prop="distributeJson.distributeApi.url" label-width="auto">
					<el-input v-model="dataForm.distributeJson.distributeApi.url" placeholder="url地址"></el-input>
				</el-form-item>
				<el-form-item label="数据推送批次大小" label-width="auto"
				              prop="distributeJson.distributeApi.fetchSize">
				  <el-select v-model="dataForm.distributeJson.distributeApi.fetchSize">
				    <el-option label="5"
				               :value="5"></el-option>
				    <el-option label="10"
				               :value="10"></el-option>
				    <el-option label="30"
				               :value="30"></el-option>
				    <el-option label="50"
							  :value="50"></el-option>
					<el-option label="100"
							  :value="50"></el-option>		  
				  </el-select>
				</el-form-item>
				<el-divider><span style="font-size: 17px"><b>参数配置</b></span></el-divider>
				<div>
					<el-button type="success"
					           @click="addUrlHeader()"
					           round>添加header</el-button>
					<el-table :data="dataForm.distributeJson.distributeApi.headers"
					          size="small"
					          border
					          height="150"
					          style="width:90%;margin-top: 15px;">
					  <template #empty>
					    <span>请点击"添加header"添加请求头</span>
					  </template>
					  <el-table-column label="key"	
					                   width="320">
					    <template #default="scope">
					      <el-input v-model="scope.row.key"
					                type="string"> </el-input>
					    </template>
					  </el-table-column>
					  <el-table-column label="value"
					                   width="320">
					    <template #default="scope">
					      <el-input v-model="scope.row.value"
					                type="string" ></el-input>
					    </template>
					  </el-table-column>
					  <el-table-column label="操作"
					                   width="220">
					    <template #default="scope">
					      <el-button size="small"
					                 type="danger"
					                 @click="deleteUrlHeader(scope.$index)">删除</el-button>
					    </template>
					  </el-table-column>
					</el-table>
					<br>
					<el-button type="success"
					           @click="addUrlParam()"
					           round>添加param</el-button>
					<el-table :data="dataForm.distributeJson.distributeApi.params"
					          size="small"
					          border
					          height="150"
					          style="width:90%;margin-top: 15px;">
					  <template #empty>
					    <span>请点击"添加param"添加额外参数</span>
					  </template>
					  <el-table-column label="key"	
					                   width="320">
					    <template #default="scope">
					      <el-input v-model="scope.row.key"
					                type="string"> </el-input>
					    </template>
					  </el-table-column>
					  <el-table-column label="value"
					                   width="320">
					    <template #default="scope">
					      <el-input v-model="scope.row.value"
					                type="string" ></el-input>
					    </template>
					  </el-table-column>
					  <el-table-column label="操作"
					                   width="220">
					    <template #default="scope">
					      <el-button size="small"
					                 type="danger"
					                 @click="deleteUrlParam(scope.$index)">删除</el-button>
					    </template>
					  </el-table-column>
					</el-table>
				</div>
			</template>
			<!-- 消息队列相关参数 -->
			<template v-if="dataForm.distributeType == 3">
				<el-form-item label="队列类型" prop="distributeJson.distributeMq.mqType" label-width="auto">
					<fast-radio-group v-model="dataForm.distributeJson.distributeMq.mqType" dict-type="mq_type"></fast-radio-group>
				</el-form-item>
				<el-divider><span style="font-size: 17px"><b>队列参数配置</b></span></el-divider>
				<template v-if="dataForm.distributeJson.distributeMq.mqType == 'rabbitMq'">
					<el-form-item label="host" prop="distributeJson.distributeMq.rabbitMqConfig.host" label-width="auto">
						<el-input v-model="dataForm.distributeJson.distributeMq.rabbitMqConfig.host" placeholder="host地址"></el-input>
					</el-form-item>
					<el-form-item label="port" prop="distributeJson.distributeMq.rabbitMqConfig.port" label-width="auto">
						<el-input v-model="dataForm.distributeJson.distributeMq.rabbitMqConfig.port" placeholder="port"></el-input>
					</el-form-item>
					<el-form-item label="username" prop="distributeJson.distributeMq.rabbitMqConfig.username" label-width="auto">
						<el-input v-model="dataForm.distributeJson.distributeMq.rabbitMqConfig.username" placeholder="username"></el-input>
					</el-form-item>
					<el-form-item label="password" prop="distributeJson.distributeMq.rabbitMqConfig.password" label-width="auto">
						<el-input v-model="dataForm.distributeJson.distributeMq.rabbitMqConfig.password" placeholder="password"></el-input>
					</el-form-item>
					<el-form-item label="virtualHost" prop="distributeJson.distributeMq.rabbitMqConfig.virtualHost" label-width="auto">
						<el-input v-model="dataForm.distributeJson.distributeMq.rabbitMqConfig.virtualHost" placeholder="virtualHost"></el-input>
					</el-form-item>
					<el-form-item label="exchange" prop="distributeJson.distributeMq.rabbitMqConfig.exchange" label-width="auto">
						<el-input v-model="dataForm.distributeJson.distributeMq.rabbitMqConfig.exchange" placeholder="exchange"></el-input>
					</el-form-item>
					<el-form-item label="routingKey" prop="distributeJson.distributeMq.rabbitMqConfig.routingKey" label-width="auto">
						<el-input v-model="dataForm.distributeJson.distributeMq.rabbitMqConfig.routingKey" placeholder="routingKey"></el-input>
					</el-form-item>
				</template>
				<template v-if="dataForm.distributeJson.distributeMq.mqType == 'kafka'">
					<el-form-item label="bootstrap-servers" prop="distributeJson.distributeMq.kafkaConfig.bootstrapServers" label-width="auto">
						<el-input v-model="dataForm.distributeJson.distributeMq.kafkaConfig.bootstrapServers" placeholder="bootstrap-servers"></el-input>
					</el-form-item>
					<el-form-item label="topic" prop="distributeJson.distributeMq.kafkaConfig.topic" label-width="auto">
						<el-input v-model="dataForm.distributeJson.distributeMq.kafkaConfig.topic" placeholder="topic"></el-input>
					</el-form-item>
				</template>
				<el-form-item label="数据推送批次大小" label-width="auto"
				              prop="distributeJson.distributeMq.fetchSize"  v-if="dataForm.distributeJson.distributeMq.mqType">
				  <el-select v-model="dataForm.distributeJson.distributeMq.fetchSize">
				    <el-option label="5"
				               :value="5"></el-option>
				    <el-option label="10"
				               :value="10"></el-option>
				    <el-option label="30"
				               :value="30"></el-option>
				    <el-option label="50"
							  :value="50"></el-option>
					<el-option label="100"
							  :value="50"></el-option>		  
				  </el-select>
				</el-form-item>
			</template>
	    </el-form>
		<template #footer>
			<el-button @click="visible = false">取消</el-button>
			<el-button type="primary" @click="submitHandle()">确定</el-button>
		</template>
		
		<el-dialog
		           title="查看表名映射关系"
		           v-model="tableNameMapperDialogVisible">
		  <el-table :header-cell-style="{background:'#eef1f6',color:'#606266'}"
		            :data="tableNamesMapperData"
		            size="small"
		            border>
		    <el-table-column prop="originalName"
		                     label="源端表名"
		                     min-width="20%"></el-table-column>
		    <el-table-column prop="targetName"
		                     label="目标表名"
		                     min-width="20%"></el-table-column>
		  </el-table>
		</el-dialog>
		
		<el-dialog
		           title="查看字段映射关系"
		           v-model="columnNameMapperDialogVisible">
		  <el-table :header-cell-style="{background:'#eef1f6',color:'#606266'}"
		            :data="columnNamesMapperData"
		            size="small"
		            border>
		    <el-table-column prop="originalName"
		                     label="原始字段名"
		                     min-width="20%"></el-table-column>
		    <el-table-column prop="targetName"
		                     label="目标表字段名"
		                     min-width="20%"></el-table-column>
		  </el-table>
		</el-dialog>
	</el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus/es'
import { listMasterModelTreeApi } from '@/api/data-governance/masterDataCatalog'
import { getMasterModelApiById } from '@/api/data-governance/masterModel'
import { useMasterDistributeApi, useMasterDistributeSubmitApi } from '@/api/data-governance/masterDistribute'
import { listDatabase } from '@/api/data-integrate/database'
import { previewTableNameMap, previewColumnNameMap } from '@/api/data-integrate/access'
import { useOrgListApi } from '@/api/sys/orgs'

onMounted(()=>{
	listMasterModelTreeApi().then(res=>{
		masterModelList.value = res.data
	})
})

const distributeTypeChange = (distributeType: any) => {
	if(distributeType == 1) {
		listDatabase().then(res => {
			databases.value = res.data
		})
	}
}

const masterModel = ref()
const masterModelChange = (masterModelId) => {
	if(masterModelId) {
		//获取masterModel
		getMasterModelApiById(masterModelId).then(res=>{
			masterModel.value = res.data
		})
	} else {
		masterModel.value = null
	}
	
}

const tableNamesMapperData = ref([])
const columnNamesMapperData = ref([])
const tableNameMapperDialogVisible = ref(false)
const columnNameMapperDialogVisible = ref(false)
const orgList = ref([])

//添加表名映射
const addTableNameMapperListRow = () => {
    dataForm.distributeJson.distributeDb.regexTableMapper.push({ "fromPattern": "", "toValue": "" });
}

const deleteTableNameMapperListItem = (index) => {
    dataForm.distributeJson.distributeDb.regexTableMapper.splice(index, 1);
}
const addColumnNameMapperListRow = () => {
   dataForm.distributeJson.distributeDb.regexColumnMapper.push({ "fromPattern": "", "toValue": "" });
}

const deleteColumnNameMapperListItem = (index) => {
   dataForm.distributeJson.distributeDb.regexColumnMapper.splice(index, 1);
}
//预览表名映射
const previewTableNameMapList = () => {
	if (!dataForm.masterModelId) {
		ElMessage({
		   message: '请选择主数据！',
		   type: 'warning',
		 })
	  return;
	}
	
	var sourceSelectedTables = []
	sourceSelectedTables.push(masterModel.value.tableName)
	//调用方法
	previewTableNameMap(JSON.stringify({
		sourceDatabaseId: -1,
		includeOrExclude: 1,
		sourceSelectedTables: sourceSelectedTables,
		tableNameMapper: dataForm.distributeJson.distributeDb.regexTableMapper,
		targetLowerCase: dataForm.distributeJson.distributeDb.lowercase,
		targetUpperCase: dataForm.distributeJson.distributeDb.uppercase,
        })).then( res=> {
		tableNamesMapperData.value = res.data;
		tableNameMapperDialogVisible.value = true;
	})
}

//预览字段名映射
const previewColumnNameMapList = () => {
	if (!dataForm.masterModelId) {
		ElMessage({
		   message: '请选择主数据！',
		   type: 'warning',
		 })
	  return;
	}
	columnNamesMapperData.value = [];
	columnNameMapperDialogVisible.value = true;
	previewColumnNameMap(JSON.stringify({
	      sourceDatabaseId: -1,
	      includeOrExclude: 1,
	      preiveTableName: masterModel.value.tableName,
	      columnNameMapper: dataForm.distributeJson.distributeDb.regexColumnMapper,
		  targetLowerCase: dataForm.distributeJson.distributeDb.lowercase,
		  targetUpperCase: dataForm.distributeJson.distributeDb.uppercase,
	    })).then( res=> {
		  columnNamesMapperData.value = res.data
	})
}

const emit = defineEmits(['refreshDataList'])

const visible = ref(false)
const dataFormRef = ref()
const masterModelList = ref([])
const databases = ref([])

const dataForm = reactive({
	orgId: '',
	name: '',
	taskType: '',
	cron: '',
	masterModelId: '',
	distributeType: '',
	description: '',
	distributeJson: {
		distributeDb: {
			databaseId: '',
			onlyCreate: false,
			syncExist: true,
			targetDrop: false,
			changeDataSync: true,
			fetchSize: 1000,
			lowercase: false,
			uppercase: false,
			regexTableMapper: [],
			regexColumnMapper: []
		},
		distributeMq: {
			mqType: '',
			rabbitMqConfig: {
				host: '',
				port: '',
				username: '',
				password: '',
				virtualHost: '',
				exchange: '',
				routingKey: ''
			},
			kafkaConfig: {
				bootstrapServers: '',
				topic: '',
			},
			fetchSize: 10
		},
		distributeApi: {
			url: '',
			params: [],
			headers: [],
			fetchSize: 10
		}
	}
})

const props = {
  label: 'name',
  children: 'children',
  isLeaf: 'leaf',
  disabled: 'disabled'
}

const init = (id?: number) => {
	visible.value = true
	dataForm.id = ''
	// 重置表单数据
	Object.assign(dataForm, {
		name: '',
		taskType: '',
		cron: '',
		masterModelId: '',
		distributeType: '',
		description: '',
		distributeJson: {
			distributeDb: {
				databaseId: '',
				onlyCreate: false,
				syncExist: true,
				targetDrop: false,
				changeDataSync: true,
				fetchSize: 1000,
				lowercase: false,
				uppercase: false,
				regexTableMapper: [],
				regexColumnMapper: []
			},
			distributeMq: {
				mqType: '',
				rabbitMqConfig: {
					host: '',
					port: '',
					username: '',
					password: '',
					virtualHost: '',
					exchange: '',
					routingKey: ''
				},
				kafkaConfig: {
					bootstrapServers: '',
					topic: '',
				},
				fetchSize: 10
			},
			distributeApi: {
				url: '',
				params: [],
				headers: [],
				fetchSize: 10
			}
		}
	})

	useOrgListApi().then(res => {
		orgList.value = res.data
	})

	if (id) {
		getMasterDistribute(id)
	}
}

const getMasterDistribute = (id: number) => {
	useMasterDistributeApi(id).then(res => {
		let resData = res.data
		dataForm.id = resData.id
		dataForm.status = resData.status
		dataForm.name = resData.name
		dataForm.releaseTime = resData.releaseTime
		dataForm.releaseUserId = resData.releaseUserId
		dataForm.projectId = resData.projectId
		dataForm.version = resData.version
		dataForm.taskType = resData.taskType
		dataForm.cron = resData.cron
		dataForm.masterModelId = resData.masterModelId
		dataForm.distributeType = resData.distributeType
		dataForm.description = resData.description
		//获取masterModel
		getMasterModelApiById(dataForm.masterModelId).then(res=>{
			masterModel.value = res.data
		})
		if(resData.distributeJson.distributeDb) {
			dataForm.distributeJson.distributeDb = resData.distributeJson.distributeDb
			listDatabase().then(res => {
				databases.value = res.data
			})
		} else if(resData.distributeJson.distributeMq) {
			dataForm.distributeJson.distributeMq.mqType = resData.distributeJson.distributeMq.mqType
			dataForm.distributeJson.distributeMq.fetchSize = resData.distributeJson.distributeMq.fetchSize
			if(dataForm.distributeJson.distributeMq.mqType == 'kafka') {
				dataForm.distributeJson.distributeMq.kafkaConfig = resData.distributeJson.distributeMq.kafkaConfig
			} else if(dataForm.distributeJson.distributeMq.mqType == 'rabbitMq') {
				dataForm.distributeJson.distributeMq.rabbitMqConfig = resData.distributeJson.distributeMq.rabbitMqConfig
			}
		} else if(resData.distributeJson.distributeApi) {
			dataForm.distributeJson.distributeApi = resData.distributeJson.distributeApi
		}
		
	})
}

const addUrlParam = () => {
    dataForm.distributeJson.distributeApi.params.push({ "key": "", "value": "" });
}

const deleteUrlParam = (index) => {
    dataForm.distributeJson.distributeApi.params.splice(index, 1);
}

const addUrlHeader = () => {
    dataForm.distributeJson.distributeApi.headers.push({ "key": "", "value": "" });
}

const deleteUrlHeader = (index) => {
    dataForm.distributeJson.distributeApi.headers.splice(index, 1);
}

const dataRules = ref({
	orgId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	name: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	masterModelId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	distributeType: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	taskType: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	cron: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	distributeJson: {
		distributeDb: {
			databaseId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
			onlyCreate: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
			syncExist: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
			targetDrop: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
			changeDataSync: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
			fetchSize: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
		},
		distributeMq: {
			mqType: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
			rabbitMqConfig: {
				host: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
				port: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
				username: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
				password: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
				virtualHost: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
				exchange: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
			},
			kafkaConfig: {
				bootstrapServers: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
				topic: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
			},
			fetchSize: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
		},
		distributeApi: {
			url: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
			headers: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
			params: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
		}
	}
})

// 表单提交
const submitHandle = () => {
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}
		
		var pushData = JSON.parse(JSON.stringify(dataForm))
		
		if(pushData.distributeType == 1 ) {
			pushData.distributeJson.distributeMq = null
			pushData.distributeJson.distributeApi = null
		} else if (pushData.distributeType == 2) {
			pushData.distributeJson.distributeDb = null
			pushData.distributeJson.distributeMq = null
		} else if (pushData.distributeType == 3) {
			pushData.distributeJson.distributeDb = null
			pushData.distributeJson.distributeApi = null
			if(pushData.distributeJson.distributeMq.mqType == 'kafka') {
				pushData.distributeJson.distributeMq.rabbitMqConfig = null
			} else if(pushData.distributeJson.distributeMq.mqType == 'rabbitMq') {
				pushData.distributeJson.distributeMq.kafkaConfig = null
			}
		}
		//如果不是增量调度
		if(pushData.taskType != '3') {
			pushData.cron = null
		}
		useMasterDistributeSubmitApi(pushData).then(() => {
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
