<template>
	<el-card body-style="height: calc(100vh - 170px )" @click="OptionCardClose($event)">
		<div>
		  <SideLayout class="fp-content" left-title="数据表" right-title="表信息">
			<div slot="left-title" class="rm-left-title">
			  <span>数据表</span>
			</div>
			<template #left>
				<div>
				  <el-scrollbar style="height: calc(100vh - 220px )">
				  	<div style="height: 100%;" class="DataTableTreeDiv">
				  		<div>
				  			<el-input v-model="filterNodeText" placeholder="search" />
				  			<br><br>
				  		</div>
				  		<div>
				  			<el-button type="primary" @click="createTable">建表</el-button><br><br>
				  		</div>
				  		<el-tree
				  		 ref="treeRef"
				  		 :data="treeList"
						 @node-contextmenu="ckRightOption"
				  		 @node-click="treeNodeCk"
				  		 default-expand-all
				  		 node-key="id"
				  		 :filter-node-method="filterNode"
				  	 >
				  			 <template #default="{ node, data }">
				  				 <div class="dataTable-tree-node">
				  					 <span>
										 <!-- layer-->
				  						 <img v-if="data.type==2" src="/src/assets/database.png"/>
										 <!-- table-->
				  						 <img v-if="data.type==3" src="/src/assets/table.png"/>
				  						 <span style="margin-left: 8px;">{{ data.name }}&emsp;{{ data.description }}</span>
				  					 </span>
				  				 </div>
				  			 </template>
				  		</el-tree>
				  	</div>
				  </el-scrollbar>
				</div>
			</template>
			<template #right>
				<div v-show="infoView" class="data-table-right" v-loading="detailLoading">
				  <el-tabs v-model="tabActiveName" class = "data-table-tabs">
				      <el-tab-pane label="表空间" name="tableInfo">
						<div class="action_part">
						  <el-button v-if="!isDetail" type="primary" @click="toSave">保存</el-button>
						  <el-button v-if="isDetail" type="danger" @click="toDelete">删除</el-button>
						  <el-button type="primary" @click="toCancel">取消</el-button>
						</div>
						<div class="dsr-part">
						  <div class="info-part">
						    <h6>表信息</h6>
							  <el-form :model="tableInfo" label-width="100px" :rules="tableInfoRules" ref="tableInfoRef">
								<el-row>
									<el-col :span="2"></el-col>
									<el-col :span="7">
									  <el-form-item label="表名" prop="tableName">
										<el-input v-if="!isDetail" v-model="tableInfo.tableName" placeholder="表名"></el-input>
										<span v-else>{{tableInfo.tableName}}</span>
									  </el-form-item>
									</el-col>
									<el-col :span="7">
									  <el-form-item label="注释" prop="tableCn">
										<el-input v-if="!isDetail" v-model="tableInfo.tableCn" placeholder="中文名称"></el-input>
										<span v-else>{{tableInfo.tableCn}}</span>
									  </el-form-item>
									</el-col>
								</el-row>
							  </el-form>
						  </div>
						  <div class="info-part field-part">
							  <h6>字段管理</h6>
							  <div class="sheet-field">
								  <el-button v-if="!isDetail" type="text" @click="addField">添加字段</el-button>
								  <el-button v-if="!isDetail" style="margin-left: 10px" type="text" @click="showPickColumns"> 从已有表拾取字段</el-button>
							  </div>
							  <el-table :data="columns"  style="width: '100%'" :height="isDetail?'calc(100vh - 520px )':'calc(100vh - 550px )'" size="small">
								<el-table-column align="center" show-overflow-tooltip props="name" label="字段名称" width="200">
								  <template #default="scope">
									<el-input
									  v-if="!isDetail"
									  v-model="scope.row.name"
									  placeholder="字段名称" />
									<span v-else>{{scope.row.name}}</span>
								  </template>
								</el-table-column>
								<el-table-column align="center" label="数据类型" width="200">
								  <template #default="scope">
									<fast-select v-if="!isDetail" @change="dataTypeChagne(scope.row)" v-model="scope.row.fieldType" dict-type="field_type" placeholder="请选择"></fast-select>
									<span v-else>{{getDictLabel(store.appStore.dictList, 'field_type', scope.row.fieldType)}}</span>
								  </template>
								</el-table-column>
								<el-table-column align="center" label="长度" width="160">
								  <template #default="scope">
									<!-- 如果是3-日期 7-序列 8-大字段 9-日期 10-日期 11-默认 -->
									<div v-if="!isDetail">
										<el-input disabled v-if="scope.row.fieldType == 3 || scope.row.fieldType == 7 || scope.row.fieldType == 8 || scope.row.fieldType == 9 || scope.row.fieldType == 10 || scope.row.fieldType == 11"></el-input>
										<el-input v-else v-model="scope.row.fieldLength" />
									</div>
									<span v-else>{{scope.row.fieldLength}}</span>
								  </template>
								</el-table-column>
								<el-table-column align="center" label="小数位数" width="160">
								  <template #default="scope">
									  <div v-if="!isDetail">
										  <el-input v-if="scope.row.fieldType ==1 || scope.row.fieldType ==6" v-model="scope.row.sacle" />
										  <el-input disabled v-else></el-input>
									  </div>
									  <span v-else>{{ (scope.row.fieldType ==1 || scope.row.fieldType ==6) ? scope.row.sacle : '' }}</span>
								  </template>
								</el-table-column>
								<el-table-column align="center" label="可空" width="80">
								  <template #default="scope">
									<el-checkbox v-model="scope.row.nullable" :disabled="isDetail" :true-label="1" :false-label="0" />
								  </template>
								</el-table-column>
								<el-table-column align="center" label="主键" width="80">
								  <template #default="scope">
									<el-checkbox v-model="scope.row.pk" :true-label="1" :false-label="0" :disabled="isDetail" @change="pkChange(scope.row)" />
								  </template>
								</el-table-column>
								<el-table-column align="center" label="注释">
								  <template #default="scope">
									  <el-input v-if="!isDetail" v-model="scope.row.comment" placeholder="注释" />
									  <span v-else>{{ scope.row.comment }}</span>
								  </template>
								</el-table-column>
								<el-table-column v-if="!isDetail" align="center" label="操作" width="100">
								  <template #default="scope">
									<el-button type="text" @click="deleteField(scope)">删除</el-button>
								  </template>
								</el-table-column>
							  </el-table>
						  </div>
						</div>
					  </el-tab-pane>
				      <el-tab-pane label="sql 控制台" name="sqlConsole">
						  <div style="padding-top: 5px;">
							<el-tooltip
									class="box-item"
									effect="dark"
									content="美化sql"
									placement="top-end"
								>
									<el-button text @click="formatSql()"><img src="@/assets/format.png"/></el-button>
							</el-tooltip>
							<el-tooltip
									class="box-item"
									effect="dark"
									content="执行"
									placement="top-end"
								>
									<el-button :loading="executeSqlButton" @click="executeSql()" text><img src="@/assets/run.png"/></el-button>
							</el-tooltip>  
						  </div>
						  <div style="height:calc(100vh - 650px); padding-top: 5px;">
							  <SqlStudio ref="sqlStudioRef" id="dataTableSqlConsoleId" heightAll></SqlStudio>
						  </div>
						  <el-tabs class="data-table-tabs">
							  <el-tab-pane>
								<template #label>
									<span>
										<el-icon><DataLine /></el-icon>&nbsp;
										<span>执行结果</span>
									</span>
								</template>
								<div style="margin-top: 8px;">
									<el-tag>tips：若记录超过100条，只显示前100条记录</el-tag>
								</div>
								<div v-loading="sqlResultLoading" style="height: 320px;">
								  <console-result ref="consoleResultRef"></console-result>
								</div>
							  </el-tab-pane>
						  </el-tabs>
					  </el-tab-pane>
				    </el-tabs>
			    </div>
				<el-empty description="请选择左侧目录 获取详情" v-if="currentNode.type != 3"/>
			</template>
		  </SideLayout>
		</div>
	  <el-dialog
	    :close-on-click-modal="false"
	    title="从已有表拾取字段"
	    v-model="pickField"
	    width="1000px"
	    append-to-body
	    class="sheet_field_column"
	    @close="chooseColumnCancel">
	    <div v-loading="pickColunmsLoading" style="height: 400px; overflow-y: auto; padding: 10px">
	      <div class="select_box">
	        <el-tag v-for="(item, i) in pickColumns" :key="i" closable @close="deleteTagColumns(i)">{{ item.name }}</el-tag>
	      </div>
	      <div>
	        <el-cascader
	          v-model="pickTableValue"
	          style="width: 100%"
	          clearable
	          :show-all-levels="true"
	          :props="{ ...defaultPickTableProps }"
	          :options="pickTableList"
	          @change="pickTableChange">
	          <template #default="{ node, data }">
	            <span>{{ data.name }}</span>
	          </template>
	        </el-cascader>
	      </div>
	      <el-table :data="pickTableColumns" style="width: 100%; margin-top: 10px" size="small" height="200px" @selection-change="pickColumnsSelectChange">
	        <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
	        <el-table-column align="center" props="name" label="字段名称">
	          <template #default="scope">{{ scope.row.name }}</template>
	        </el-table-column>
	        <el-table-column align="center" props="fieldType" label="类型">
	          <template #default="scope">{{ getDictLabel(store.appStore.dictList, 'field_type', scope.row.fieldType) }}</template>
	        </el-table-column>
	        <el-table-column align="center" props="fieldLength" label="长度">
	          <template #default="scope">{{ scope.row.fieldLength }}</template>
	        </el-table-column>
	        <el-table-column align="center" props="sacle" label="小数位数">
	          <template #default="scope">{{ (scope.row.fieldType ==1 || scope.row.fieldType ==6) ? scope.row.sacle : ''}}</template>
	        </el-table-column>
	        <el-table-column align="center" props="nullable" label="可空">
	          <template #default="scope">{{ scope.row.nullable ? '是' : '否' }}</template>
	        </el-table-column>
	        <el-table-column align="center" props="pk" label="主键">
	          <template #default="scope">{{ scope.row.pk ? '是' : '否' }}</template>
	        </el-table-column>
	        <el-table-column align="center" show-overflow-tooltip props="comment" label="注释">
	          <template #default="scope">{{ scope.row.comment }}</template>
	        </el-table-column>
	      </el-table>
	    </div>
		<template #footer>
			<div>
				<el-button @click="chooseColumnCancel">取 消</el-button>
				<el-button type="primary" @click="chooseColumnEnter">确 定</el-button>
			</div>
		</template>
	  </el-dialog>
	  
	  <el-dialog v-model="dbDialogVisible" title="详情">
	  	<el-descriptions size="default"
	  									 :column="1"
	  									 label-class-name="el-descriptions-item-label-class"
	  									 border>
	  		<el-descriptions-item label="名称">{{dbInfo.name}}</el-descriptions-item>
	  		<el-descriptions-item label="库名">{{ dbInfo.databaseName }}</el-descriptions-item>
	  		<el-descriptions-item label="用户名">{{ dbInfo.userName  }}</el-descriptions-item>
	  		<el-descriptions-item label="密码">******<!-- {{ dbInfo.password  }} --></el-descriptions-item>
	  		<el-descriptions-item label="jdbc连接串">{{ dbInfo.jdbcUrl  }}</el-descriptions-item>
	  	</el-descriptions>
	  </el-dialog>
	  
	  <el-dialog v-model="tableDialogVisble" title="详情" width="65%">
	  	<el-tabs class="table-tabs">
	  		<el-tab-pane>
	  			<template #label>
	  				<span class="custom-tabs-label">
	  					<el-icon><Document /></el-icon>
	  					<span>字段信息</span>
	  				</span>
	  			</template>
	  			<el-table :data="tableColumns" height="500" style="width: 100%">
	  			    <el-table-column prop="fieldName" label="名称" header-align="center" align="center"/>
	  					<el-table-column prop="remarks" label="注释" header-align="center" align="center"/>
	  			    <el-table-column prop="fieldTypeName" label="类型" header-align="center" align="center"/>
	  					<el-table-column prop="displaySize" label="长度" header-align="center" align="center"/>
	  					<el-table-column prop="scaleSize" label="小数位数" header-align="center" align="center"/>
	  					<el-table-column prop="defaultValue" label="默认值" header-align="center" align="center"/>
	  					<el-table-column prop="pk" label="是否主键" header-align="center" align="center"/>
	  					<el-table-column prop="autoIncrement" label="是否递增" header-align="center" align="center"/>
	  					<el-table-column prop="nullable" label="是否可为空" header-align="center" align="center"/>
	  			  </el-table>
	  		</el-tab-pane>
	  		<el-tab-pane>
	  			<template #label>
	  				<span class="custom-tabs-label">
	  					<el-icon><DataLine /></el-icon>
	  					<span>SQL 生成</span>
	  				</span>
	  			</template>
	  			<el-tabs tab-position="left" style="height: 500px;" class="sql-tabs">
					<el-tab-pane label="SQL DDL">
						<read-only-studio id="middleTableSQLDDL" ref="SQLDDLRef" style="height: 500px"></read-only-studio>
					</el-tab-pane>
	  			    <el-tab-pane label="SQL SELECT">
	  					<read-only-studio id="middleTableSQLSELECT" ref="SQLSELECTRef" style="height: 500px"></read-only-studio>
	  				</el-tab-pane>
	  			</el-tabs>
	  		</el-tab-pane>
	  	</el-tabs>
	  </el-dialog>
	  
	  
	  <!-- 右键菜单 -->
	  <div :style="{'z-index': 9999, position: 'fixed',left: ckRightOptionData.optionCardX + 'px', 
	  				top: ckRightOptionData.optionCardY + 'px', width: '100px', background: 'white',
	  				 'box-shadow': '0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04)'}" 
	  				 v-show="ckRightOptionData.optionCardShow" id="option-button-group">
	  	<el-button @click="getDbInfo" class="option-card-button">查看</el-button>
	  </div>
	</el-card>
</template>

<script setup lang="ts" name="Data-developmentData-tableIndex">
import { useCrud } from '@/hooks'
import SideLayout from '@/components/side-layout/index.vue'
import { reactive, ref, onMounted, watch } from 'vue'
import { getMiddleDbColumnsApi } from '@/api/data-governance/masterColumn'
import { IHooksOptions } from '@/hooks/interface'
import { ElMessage, ElMessageBox } from 'element-plus/es'
import { listMiddleDbTreeApi,getTableInfoApi,saveTableInfoApi,deleteTableInfoApi,listMiddleDbColumnsApi, getMiddleDbSqlGenerationApi} from '@/api/data-integrate/database'
import store from '@/store'
import { getDictLabel,getNameByUserId } from '@/utils/tool'
import SqlStudio from './sql-studio.vue'
import ReadOnlyStudio from '../production/readonly-studio.vue'
import ConsoleResult from '../production/console-result.vue'
import { justExecuteSqlApi,clearConsoleLogApi } from '@/api/data-development/task'

onMounted(()=>{
	getTreeList()
})

const treeRef = ref()
const treeList = ref([])
const filterNodeText = ref('')
const detailLoading = ref(false)
const pickColunmsLoading = ref(false)
const isDetail = ref(false)
const tabActiveName = ref("tableInfo")
const sqlStudioRef = ref()
const consoleResultRef = ref()
const sqlResultLoading = ref(false)
const executeSqlButton = ref(false)
const dbDialogVisible = ref(false)
const tableDialogVisble = ref(false)
const dbInfo = ref({})
const tableColumns = ref([])
const SQLDDLRef = ref()
const SQLSELECTRef = ref()

/**
	 * 查看数据库或表详情
	 */
const getDbInfo = () => {
	let nodeData = ckRightOptionData.optionData
	OptionCardClose()
	//如果是库
	if(nodeData.ifLeaf) {
		//赋值
		dbInfo.value = nodeData.attributes
		dbDialogVisible.value = true
	} else {
		tableDialogVisble.value = true
		//获取字段信息
		listMiddleDbColumnsApi(nodeData.label).then(res=>{
			tableColumns.value = res.data
		})
		//获取sql信息
		getMiddleDbSqlGenerationApi(nodeData.label, nodeData.description).then(res=>{
			SQLDDLRef.value.setEditorValue(res.data.sqlCreate)
			SQLSELECTRef.value.setEditorValue(res.data.sqlSelect)
		})
	}
}

const tableInfoRef = ref()
const tableInfo = reactive({
	tableName: '',
	tableCn: '',
})

const tableInfoRules = ref({
	tableName: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	tableCn: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})

/**
 * 获取数仓树
 */
const getTreeList = () => {
	listMiddleDbTreeApi().then(res=>{
		treeList.value = res.data[0].children
	})
}

watch(filterNodeText, (val) => {
	treeRef.value!.filter(val)
})

/**
 * 节点筛选
 */
const filterNode = (value: string, data: Tree) => {
	if (!value) return true
	return data.label.includes(value) || data.label.includes(value.toUpperCase()) || data.label.includes(value.toLowerCase())
}

const infoView = ref(false)
const currentNode = ref({})
const treeNodeCk = (e, data, n, t) => {
	//关闭右键菜单
	OptionCardClose()
	//如果是table
	if(data.data.type == 3) {
		tabActiveName.value = "tableInfo"
		infoView.value = true
		currentNode.value = data.data
		tableInfoRef.value.resetFields()
		columns.value = []
		//获取表和字段信息
		getTableInfoApi(data.data.name).then(res => {
			if(res.data) {
				Object.assign(tableInfo, res.data)
				tableInfo.tableName = data.data.name
				tableInfo.tableCn = data.data.description
				columns.value = res.data.columns
				isDetail.value = true
			} else {
				isDetail.value = false
			}
		})
		
	} else {
		currentNode.value = data.data
		infoView.value = false
		//置空模型信息
		tableInfoRef.value.resetFields()
		columns.value = []
	}
} 

const createTable = () => {
	tableInfoRef.value.resetFields()
	columns.value = []
	isDetail.value = false
	tabActiveName.value = "tableInfo"
	infoView.value = true
}

//字段模板
const fieldForm = {
  name: '',
  comment: '',
  fieldType: '2',
  fieldLength: '',
  sacle: '',
  nullable: 1,
  pk: 0
}

//模型的字段
const columns = ref([])

const pickField = ref(false)
//被拾取的字段
const pickColumns = ref([])
const pickTableValue = ref([])
const defaultPickTableProps = ref({
  value: 'name',
  children: 'children',
  label: 'name'
}) 
const pickTableList = ref([])
const pickTableColumns = ref([])


const dataTypeChagne = (row: any)=> {
	if(row.fieldType == 'dateTime' ) {
		row.fieldLength = null
		row.sacle = null
	}
}

const pkChange = (row: any) => {
	if (row.pk == '1' ) {
		row.nullable = 0
	}
}

const addField = () => {
	 columns.value.push(JSON.parse(JSON.stringify(fieldForm)))
}

const deleteField = (scope: any) =>{
	columns.value.splice(scope.$index, 1)
}

const showPickColumns = () => {
	pickField.value = true
	//获取表级联数据
	listMiddleDbTreeApi().then(res=>{
		pickTableList.value = res.data[0].children
	})
}

const pickTableChange = () => {
	if(pickTableValue.value) {
		const currentTable = pickTableValue.value[pickTableValue.value.length-1]
		//根据表名获取字段列表
		getMiddleDbColumnsApi(currentTable).then(res=>{
			pickTableColumns.value = res.data
		})
	}
}

const deleteTagColumns = (index) => {
	pickColumns.value.splice(index, 1)
}

const pickColumnsSelectChange = (selections: any[]) => {
	for(var i in selections) {
		if(pickColumns.value.length == 0) {
			pickColumns.value.push(selections[i])
		} else {
			var exist = false
			for(var j in pickColumns.value) {
				if(selections[i].name == pickColumns.value[j].name) {
					pickColumns.value[j] = selections[i]
					exist = true
					break
				}
			}
			if(!exist) {
				pickColumns.value.push(selections[i])
			}
		}
	}
}

const chooseColumnCancel = () => {
	//清空选择的字段
	pickTableValue.value = []
	pickColumns.value = []
	pickTableColumns.value = []
	pickField.value = false
}

const chooseColumnEnter = () => {
	if(pickColumns.value.length == 0) {
		ElMessage.warning("请选择需要提取的字段")
		return
	}
	for(var i in pickColumns.value) {
		if(columns.value.length == 0) {
			columns.value.push(pickColumns.value[i])
		} else {
			var exist = false
			for(var j in columns.value) {
				if(pickColumns.value[i].name == columns.value[j].name) {
					columns.value[j] = pickColumns.value[i]
					exist = true
					break
				}
			}
			if(!exist) {	
				columns.value.push(pickColumns.value[i])
			}
		}
	}
	//清空选择的字段
	ElMessage.success("提取完毕，已自动过滤替换重复字段")
	chooseColumnCancel()
}


const toCancel = () => {
	infoView.value = false
}

const toDelete = () => {
	ElMessageBox.confirm('确定删除吗，删除后将同步删除物理表，请谨慎操作！', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	})
	.then(() => {
		deleteTableInfoApi(tableInfo.tableName).then(res=>{
			ElMessage.success("删除成功")
			getTreeList()
			infoView.value = false
		})
	})
	.catch(() => {})
}

/**
 * 建表
 */
const toSave = () => {
	tableInfoRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}
		var dataForm = {}
		dataForm.tableName = tableInfo.tableName
		dataForm.tableCn = tableInfo.tableCn
		dataForm.columns = columns.value
		if(dataForm.columns.length == 0) {
			ElMessage.warning("字段列表不可为空")
			return
		}
		var columnNames = []
		//console.log(dataForm.columns)
		for (var i in dataForm.columns) {
			var columnName = dataForm.columns[i].name
			if(columnNames.indexOf(columnName) != -1) {
				ElMessage.warning("字段名称【"+columnName+"】不可重复，请检查")
				return
			} else {
				columnNames.push(columnName)
			}
		}
		ElMessageBox.confirm('确定建表吗，将在中台库中创建相应的物理表！', '提示', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning'
		})
		.then(() => {
			saveTableInfoApi(dataForm).then((res) => {
				ElMessage.success({
					message: '保存成功',
					duration: 500,
					onClose: () => {
						getTreeList()
						Object.assign(tableInfo, res.data)
						columns.value = res.data.columns
						isDetail.value = true
					}
				})
			})
		})
		.catch(() => {})
	})
}

const executeSql = () => {
	sqlResultLoading.value = true
	executeSqlButton.value = true
	const sqlDataForm = {}
	sqlDataForm.sqlDbType = 2
	sqlDataForm.databaseId = null
	sqlDataForm.maxRowNum = 100
	sqlDataForm.statement = sqlStudioRef.value.getEditorValue()
	if(!sqlDataForm.statement) {
		ElMessage.warning('请输入sql！')
		sqlResultLoading.value = false
		executeSqlButton.value = false
		return
	}
	justExecuteSqlApi(sqlDataForm).then(res=>{
		const data = res.data
		if(!data.success) {
			ElMessage.error('执行失败，请查看日志信息排查原因！')
			consoleResultRef.value.init(data.result, 1)
		} else {
			ElMessage.success('执行成功')
			consoleResultRef.value.init(data.result, 1)
		}
		sqlResultLoading.value = false
		executeSqlButton.value = false
		//清空后台产生的日志
		clearConsoleLogApi()
	})
}

//，美化sql
const formatSql = () => {
	sqlStudioRef.value!.handleFormat()
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
	//如果不是分层
	if(data.type != '2') {
		ckRightOptionData.optionCardShow = true  // 展示右键菜单
	}
}

/**
	 * 点击右键菜单以外的地方
	 */
const OptionCardClose = (event) => {
	var currentCli = document.getElementById("option-button-group");
	if (currentCli) {
		ckRightOptionData.optionCardShow = false;
	}
}

</script>

<style lang="scss">
	// 右键菜单按钮
	.option-card-button {
		width: 100%;
		margin-left: 0 !important;
		padding: 20px 20px;
		font-size: 14px;
		border-radius: 0;
	}
	/* 树节点相关属性 */
	.DataTableTreeDiv .el-tree-node__content {
			height: 35px;
		}
	.dataTable-tree-node {
		 font-size: 16px;
		-webkit-user-select: none;
		-khtml-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}
	
	.data-table-right {
	  padding: 0 !important;
	
	  .dsr-part {
	    overflow: hidden
	  }
	
	  .action_part {
	    background-color: #fff;
	    padding: 12px;
	    border-bottom: 1px solid #ebeef5;
	    box-sizing: border-box;
	  }
	
	  .info-part {
	    background-color: #eef3fd;
	    width: calc(100% - 20px);
	    margin: 12px auto 0;
	    border: 1px solid #ebeef5;
	    padding: 12px;
	    box-sizing: border-box;
	    border-radius: 8px;
	
	    h6 {
	      padding: 12px 0;
	      padding-left: 20px;
	      position: relative;
	      font-size: 16px;
	      font-family: Alibaba-PuHuiTi-M, Alibaba-PuHuiTi;
	      font-weight: normal;
	      color: #020e19;
	
	      &::after {
	        content: '';
	        height: 12px;
	        width: 4px;
	        position: absolute;
	        left: 6px;
	        top: 50%;
	        transform: translateY(-50%);
	        // background-color: $--color-primary;
	        background: linear-gradient(180deg, #10b0f9 0%, rgba(25, 104, 249, 0.3) 100%);
	      }
	    }
	  }
	}
	
	.sheet-field {
	  .error_tips .el-input__inner {
	    border-color: #f56c6c;
	  }
	}
	.sheet_field_column {
	  .no_check {
	    .el-table-column--selection .cell {
	      display: none;
	    }
	  }
	  .select_box {
	    border: 1px solid #ebeef5;
	    height: 100px;
	    overflow-x: hidden;
	    overflow-y: auto;
	    padding: 10px;
	    border-radius: 4px;
	    margin-bottom: 16px;
	    .el-tag {
	      margin-bottom: 10px;
	      margin-right: 10px;
	    }
	  }
	}
	
.data-table-tabs > .el-tabs__content {
  padding: 0;
}	
.data-table-tabs > .el-tabs__header {
	margin: 0;
}
</style>