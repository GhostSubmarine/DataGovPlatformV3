<template>
	<el-scrollbar>
		<div class="databases" @click="OptionCardClose($event)">
			<el-button @click="addDb()"><el-icon><Plus /></el-icon></el-button>
			<el-button @click="refresh()"><el-icon><RefreshLeft /></el-icon></el-button>
			<br>
			<br>
			<el-select v-model="databaseId"
			           @change="changeDatabase"
								 clearable
								 filterable 
			           placeholder="请选择">
			  <el-option v-for="(item,index) in databases"
			             :key="item.id"
			             :label="`[${item.id}]${item.name}`"
			             :value="item.id"></el-option>
			</el-select>
			<br><br>
			<el-input v-model="filterNodeText" placeholder="search" />
			<br><br>
			<el-tree
					ref="databaseTreeRef"
				 :data="databaseTreeList"
				 default-expand-all
				 @node-contextmenu="ckRightOption"
				 @node-click="catalogueTreeNodeCk"
				 node-key="id"
				 :filter-node-method="filterNode"
			 >
				 <template #default="{ node, data }">
					 <span class="custom-tree-node">
						 <img v-show="data.ifLeaf == '1'" :src="databasePng"/>
						 <img v-show="data.ifLeaf=='0'" :src="tablePng"/>
						 <span style="margin-left: 8px;">{{ data.label }}&emsp;{{ data.description }}</span>
					 </span>
				 </template>
			 </el-tree>
		</div>
	</el-scrollbar>
	
	<el-dialog v-model="dbDialogVisible" title="详情">
		<el-descriptions size="default"
										 :column="1"
										 label-class-name="el-descriptions-item-label-class"
										 border>
			<el-descriptions-item label="名称">{{dbInfo.name}}</el-descriptions-item>
			<el-descriptions-item label="数据库类型">{{ getDictLabel(store.appStore.dictList, "database_type",dbInfo.databaseType ) }}</el-descriptions-item>
			<el-descriptions-item label="库名">{{ dbInfo.databaseName }}</el-descriptions-item>
			<el-descriptions-item label="IP地址">{{ dbInfo.databaseIp }}</el-descriptions-item>
			<el-descriptions-item label="端口">{{ dbInfo.databasePort }}</el-descriptions-item>
			<el-descriptions-item label="状态">{{ getDictLabel(store.appStore.dictList, "database_status",dbInfo.status )  }}</el-descriptions-item>
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
				    <el-tab-pane label="Flink DDL">
							<read-only-studio id="FlinkDDL" ref="FlinkDDLRef" style="height: 500px;font-size: 16px"></read-only-studio>
						</el-tab-pane>
						<el-tab-pane label="SQL DDL">
							<read-only-studio id="SQLDDL" ref="SQLDDLRef" style="height: 500px;font-size: 16px"></read-only-studio>
						</el-tab-pane>
				    <el-tab-pane label="SQL SELECT">
							<read-only-studio id="SQLSELECT" ref="SQLSELECTRef" style="height: 500px;font-size: 16px"></read-only-studio>
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
	
	<add-database ref="addDatabaseRef" @refreshDataList="getDataList"></add-database>
	
</template>

<script lang="ts" setup>
	import { reactive, ref, watch, onMounted } from 'vue'
	import store from '@/store'
	import { getDictLabel } from '@/utils/tool'
	import { listDatabase, getTablesById, listTreeByIdApi,listColumnsByIdAndTableName, getSqlGenerationApi } from '@/api/data-integrate/database'
	import databasePng from '@/assets/database.png'
	import tablePng from '@/assets/table.png'
	import ReadOnlyStudio from './readonly-studio.vue'
	import AddDatabase from '../../data-integrate/database/add-or-update.vue'
	
	const databaseId = ref()
	const databases = ref([])
	const filterNodeText = ref('')
	const databaseTreeRef = ref()
	const dbDialogVisible = ref(false)
	const tableDialogVisble = ref(false)
	const dbInfo = ref({})
	const tableColumns = ref([])
	const FlinkDDLRef = ref()
	const SQLDDLRef = ref()
	const SQLSELECTRef = ref()
	watch(filterNodeText, (val) => {
	  databaseTreeRef.value!.filter(val)
	})
	const databaseTreeList = ref([])
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
	 
	const addDatabaseRef = ref()
	const addDb = () => {
		addDatabaseRef.value.init()
	} 
	
	const refresh = () => {
		getDataList()
	}
	
	const getDataList = () => {
		listDatabase().then(res => {
			databases.value = res.data
			databaseTreeList.value = []
		})
	}
	
	/**
	 * 初始化
	 */
	onMounted(() => {
		getDataList()
	})
	
	/**
	 * 节点筛选
	 */
	const filterNode = (value: string, data: Tree) => {
	  if (!value) return true
	  return data.label.includes(value) || data.label.includes(value.toUpperCase()) || data.label.includes(value.toLowerCase())
		|| data.description && data.description.includes(value) || data.description && data.description.includes(value.toUpperCase()) || data.description && data.description.includes(value.toLowerCase())
	}
	
	/**
	 * 数据库变化
	 */
	const changeDatabase = (id) => {
		if(!id) {
			return
		}
		listTreeByIdApi(id).then(res => {
			databaseTreeList.value = res.data
		})
	}
	
	/**
	 * 查看数据库或表详情
	 */
	const getDbInfo = () => {
		let nodeData = ckRightOptionData.optionData
		console.log(nodeData)
		OptionCardClose()
		//如果是库
		if(nodeData.ifLeaf) {
			//赋值
			dbInfo.value = nodeData.attributes
			dbDialogVisible.value = true
		} else {
			tableDialogVisble.value = true
			//获取字段信息
			listColumnsByIdAndTableName(databaseId.value, nodeData.label).then(res=>{
				tableColumns.value = res.data
			})
			//获取sql信息
			getSqlGenerationApi(databaseId.value, nodeData.label, nodeData.description).then(res=>{
				FlinkDDLRef.value.setEditorValue(res.data.flinkSqlCreate)
				SQLDDLRef.value.setEditorValue(res.data.sqlCreate)
				SQLSELECTRef.value.setEditorValue(res.data.sqlSelect)
			})
		}
	}
	
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
	 * 作业目录树点击触发
	 */
	const catalogueTreeNodeCk = (e, data, n, t) => {
		//关闭右键菜单
		OptionCardClose()
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
	.databases .el-tree-node__content {
		height: 35px;
	}
	.databases .custom-tree-node {
	  font-size: 16px;
	}
	.table-tabs > .el-tabs__content {
	  padding: 20px;
	  color: #6b778c;
	  font-size: 32px;
	  font-weight: 600;
	}
	.table-tabs .custom-tabs-label .el-icon {
	  vertical-align: middle;
	}
	.table-tabs .custom-tabs-label {	
		font-size: 18px;
	}
	.table-tabs .custom-tabs-label span {
	  vertical-align: middle;
	  margin-left: 4px;
		font-size: 18px;
	}
	.sql-tabs .el-tabs__item {
		margin-top: 20px;
		margin-left: 0;
		font-size: 16px;
	} 
</style>