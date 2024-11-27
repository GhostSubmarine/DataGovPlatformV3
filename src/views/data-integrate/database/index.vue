<template>
	<el-card>
		<div class="databaseDivClass">
			<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
				<el-form-item>
				  <el-input v-model="state.queryForm.name" placeholder="名称"></el-input>
				</el-form-item>
				<el-form-item>
				  <fast-select v-model="state.queryForm.databaseType" dict-type="database_type" placeholder="数据库类型" clearable></fast-select>
				</el-form-item>
				<el-form-item>
				  <el-input v-model="state.queryForm.databaseName" placeholder="库名(服务名)"></el-input>
				</el-form-item>
				<el-form-item>
				  <el-input v-model="state.queryForm.databaseSchema" placeholder="schema"></el-input>
				</el-form-item>
				<el-form-item>
					<fast-select v-model="state.queryForm.status" dict-type="database_status" placeholder="状态" clearable></fast-select>
				</el-form-item>
				<!-- <el-form-item>
					<fast-select v-model="state.queryForm.isRtApprove" dict-type="yes_or_no" placeholder="是否支持实时接入" clearable></fast-select>
				</el-form-item> -->
				<!-- <el-form-item>
					<fast-project-select v-model="state.queryForm.projectId" placeholder="所属项目" clearable></fast-project-select>
				</el-form-item> -->
				<el-form-item>
					<el-button @click="getDataList()">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button v-auth="'data-integrate:database:save'" type="primary" @click="addOrUpdateHandle()">新增</el-button>
				</el-form-item>
				<el-form-item>
					<el-button v-auth="'data-integrate:database:delete'" type="danger" @click="deleteBatchHandle()">删除</el-button>
				</el-form-item>
			</el-form>
			<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%" max-height="calc(100vh - 400px )" @selection-change="selectionChangeHandle">
				<el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
				<el-table-column prop="name" label="名称" header-align="center" align="center" show-overflow-tooltip></el-table-column>
				<fast-table-column prop="databaseType" label="数据库类型" dict-type="database_type"></fast-table-column>
				<el-table-column prop="databaseIp" label="主机ip" header-align="center" align="center" show-overflow-tooltip></el-table-column>
				<el-table-column prop="databasePort" label="端口" header-align="center" align="center"></el-table-column>
				<el-table-column prop="databaseName" label="库名(服务名)" header-align="center" align="center" show-overflow-tooltip></el-table-column>
				<el-table-column prop="databaseSchema" label="schema" header-align="center" align="center" show-overflow-tooltip></el-table-column>
				<fast-table-column prop="status" label="状态" dict-type="database_status"></fast-table-column>
				<fast-table-org-column prop="orgId" label="所属机构" header-align="center" align="center"></fast-table-org-column>
				<fast-creator-column prop="creator" label="创建者" header-align="center" align="center"></fast-creator-column>
				<el-table-column prop="createTime" label="创建时间" header-align="center" align="center" width="160" show-overflow-tooltip></el-table-column>
				<el-table-column label="操作" fixed="right" header-align="center" align="center" width="200">
					<template #default="scope">
						<el-button v-auth="'data-integrate:database:update'" type="primary" link @click="addOrUpdateHandle(scope.row.id)">编辑</el-button>
						<el-button type="primary" link @click="tables(scope.row.id)">库表</el-button>
						<el-button type="primary" link @click="test(scope.row)">测试</el-button>
						<el-button v-auth="'data-integrate:database:delete'" type="danger" link @click="deleteBatchHandle(scope.row.id)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
			<el-pagination
				:current-page="state.page"
				:page-sizes="state.pageSizes"
				:page-size="state.limit"
				:total="state.total"
				layout="total, sizes, prev, pager, next, jumper"
				@size-change="sizeChangeHandle"
				@current-change="currentChangeHandle"
			>
			</el-pagination>
			
			<div class="drawerClass" style="height:100%">
				<el-drawer
				    v-model="state.drawer"
				    title="查看库表"
						size="100%"
						:before-close="drawerClose"
				    :direction="state.direction"
				  >
					<div class="tableMain">
						<div style="margin-top:10px">
							 <el-input v-model="search" size="large" placeholder="输入表名或注释"/>
							 <el-table :data="filterTableData" style="width: 100%">
								  <el-table-column label="序号" type="index" width="60"/>
							    <el-table-column label="名称" prop="tableName" />
							    <el-table-column label="注释" prop="remarks" />
							  </el-table>
						</div>
						<div style="margin-top:10px;margin-left: 50px;">
							 <el-button type="primary" round @click="runSql()">执行sql</el-button>
							 <br><br>
							 <div style="height:200px;width: 800px;">
							 	<SqlStudio ref="sqlStudioRef" id="dataSourceSelectSql"></SqlStudio>
							 </div>
							 <!-- <el-input
									style="margin-left: 50px; margin-top: 20px; width: 80%;"
							     v-model="sql"
							     :rows="2"
							     type="textarea"
							     placeholder="请输入sql语句"
							   /> -->
							 <p style="margin-top: 20px;">若超过100条，只显示前100条数据！</p>
							 <el-table :data="state.sqlData" style="margin-top: 20px; width: 90%;">
									 <el-table-column
									   :show-overflow-tooltip="true"
										 width="100px"
										 :prop="index"
										 :label="item"
										 v-for="(item, index) in state.sqlDataHeader"
										 :key="index"
									 >
									 </el-table-column>
								</el-table>
						</div>
					</div>
				</el-drawer>
			</div>
		</div>


		<!-- 弹窗, 新增 / 修改 -->
		<add-or-update ref="addOrUpdateRef" @refreshDataList="getDataList"></add-or-update>
	</el-card>
</template>

<script setup lang="ts" name="Data-integrateDatabaseIndex">
import { useCrud } from '@/hooks'
import { reactive, ref, computed } from 'vue'
import AddOrUpdate from './add-or-update.vue'
import { IHooksOptions } from '@/hooks/interface'
import { ElMessage } from 'element-plus/es'
import { testOnline, getTablesById, getTableDataBySql } from '@/api/data-integrate/database'
import SqlStudio from '../access/sql-studio.vue'

const sqlStudioRef = ref() 

const state: IHooksOptions = reactive({
	dataListUrl: '/data-integrate/database/page',
	deleteUrl: '/data-integrate/database',
	queryForm: {
		name: '', 
		databaseType: '', 
		databaseName: '', 
		databaseSchema: '',
		status: '', 
		isRtApprove: '', 
		projectId: ''
	},
	drawer: false,
	direction: 'rtl',
	databaseId: '', 
	sqlDataHeader: {},
	sqlData: [],
	tableData: []
})

const addOrUpdateRef = ref()
const addOrUpdateHandle = (id?: number) => {
	addOrUpdateRef.value.init(id)
}

// 测试连接
const test = (row) => {
	testOnline(row).then(() => {
		ElMessage.success({
			message: '测试连接成功',
			duration: 500,
			onClose: () => {
				getDataList()
			}
		})
	})
}

const tables = (id) => {
	state.drawer = true
	state.databaseId = id
	getTablesById(id).then(res => {
		state.tableData = res.data
	})
}

//const sql = ref('')
const runSql = () => {
	const sql = sqlStudioRef.value.getEditorValue()
	if (!sql) {
		ElMessage.error('请输入sql')
		return
	}
	getTableDataBySql(state.databaseId, {"sql" : sql}).then(res=>{
		state.sqlDataHeader = res.data.columns
		state.sqlData = res.data.rows
	})
}

const search = ref('')
const filterTableData = computed(() =>
  state.tableData.filter(
    (data) =>
      !search.value ||
      data.tableName && data.tableName.toLowerCase().includes(search.value.toLowerCase()) ||
			data.remarks && data.remarks.toLowerCase().includes(search.value.toLowerCase())
  )
)

const drawerClose = (done: () => void) => {
	search.value=''
	sqlStudioRef.value.setEditorValue('')
	state.sqlData = []
	state.sqlDataHeader = []
	state.tableData = []
	done()
}

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
</script>

<style>
	.databaseDivClass {
		height: calc(100vh - 170px );
		position: relative;
		overflow: hidden;
	}
	.databaseDivClass > .drawerClass > div {
		height: 100%;
		position: absolute !important;
		overflow: hidden;
	}
	
	.tableMain {
		display : flex;
		
	}
	.tableMain div:nth-child(1){
		flex : 1;
	}
	.tableMain div:nth-child(2){
		flex : 2;
	}
</style>