<template>
	<div class="common-layout">
		<el-container>
			<!-- 左侧 -->
			<el-aside width="30%">
				<el-card body-style="height: calc(100vh - 170px )">
					<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
						<el-form-item size="small">
							<el-input v-model="state.queryForm.tableName" placeholder="表名"></el-input>
						</el-form-item>
						<el-form-item size="small">
							<el-input v-model="state.queryForm.remarks" placeholder="注释"></el-input>
						</el-form-item>
						<!-- <el-form-item size="small">
							<fast-project-select v-model="state.queryForm.projectId" placeholder="所属项目" clearable></fast-project-select>
						</el-form-item> -->
						<el-form-item size="small">
							<el-button type="primary" @click="getDataList()">查询</el-button>
						</el-form-item>
					</el-form>
					<!-- <el-tag style="margin-bottom:10px"><p>tips：此处显示的是通过数据接入同步的表，手动新增的不在范围内</p></el-tag> -->
					<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%;" max-height="calc(100vh - 400px )" highlight-current-row  @current-change="handleCurrentChange">
						<fast-table-project-column prop="projectId" label="所属项目" header-align="center" align="center"></fast-table-project-column>
						<el-table-column prop="tableName" label="表名" header-align="center" align="center"></el-table-column>
						<el-table-column prop="remarks" label="注释" header-align="center" align="center"></el-table-column>
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
				</el-card>
			</el-aside>
			<!-- 右侧主区域 -->
			<el-container>
				<el-header>
					<el-card body-style="height: calc(100vh - 170px )">
						<el-tabs v-model="activeName" class="demo-tabs" @tab-change="handleClick" :before-leave="tabBeforeLeave">
						    <el-tab-pane label="表信息" name="tableInfo">
									 <el-tag
												size="large"
												effect="dark"
												round
												style="margin-bottom: 15px;"
											>
												表属性
										</el-tag>
									 <el-descriptions
									     :column="1"
									     direction="horizontal"
									     style="blockMargin"
									   >
									     <el-descriptions-item label="表名">{{state.currentRow.tableName}}</el-descriptions-item>
									     <el-descriptions-item label="注释">{{state.currentRow.remarks}}</el-descriptions-item>
											 <el-descriptions-item label="数据接入任务"><el-button type="primary" link @click="getAccessInfoHandler()">查看</el-button></el-descriptions-item>
									     <el-descriptions-item label="最近同步时间">{{state.currentRow.recentlySyncTime?state.currentRow.recentlySyncTime:'暂无'}}</el-descriptions-item>
									   </el-descriptions>
										 <br />
										 <el-tag
										 			size="large"
										      effect="dark"
										      round
										 			style="margin-bottom: 15px;"
										    >
										      字段信息
										  </el-tag>
											<el-table :data="state.tableColumns" height="400" style="width: 100%">
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
						    <el-tab-pane label="数据预览" name="tableData">
									<div>
										 <p>若超过50条，只显示前50条数据！</p>
										 <el-table :data="state.tableData" style="margin-top: 20px; width: 90%;" height="600">
													 <el-table-column
													   :show-overflow-tooltip="true"
														 width="100px"
														 :prop="index"
														 :label="item"
														 v-for="(item, index) in state.tableDataHeader"
														 :key="index"
													 >
													 </el-table-column>
											</el-table>
									</div>
								</el-tab-pane>
						    <el-tab-pane label="接入日志" name="tableLog">
									<!-- 弹窗 同步结果 -->
									<ods-task-detail ref="odsTaskDetailRef"></ods-task-detail>
								</el-tab-pane>
						  </el-tabs>
					</el-card>
				</el-header>
			</el-container>
		</el-container>
	</div>
	
	<!-- 数据接入 详情 -->
	<info ref="infoRef"></info>
	
</template>

<script setup lang="ts" name="Data-integrateOdsIndex">
import { useCrud } from '@/hooks'
import { ElMessage, ElMessageBox } from 'element-plus/es'
import { reactive, ref } from 'vue'
import info from '../access/info.vue'
import { IHooksOptions } from '@/hooks/interface'
import { getColumnInfoApi, getTableDataApi } from '@/api/data-integrate/ods'
import { useAccessApi } from '@/api/data-integrate/access'
import OdsTaskDetail from './ods-task-detail.vue'

const state: IHooksOptions = reactive({
	dataListUrl: '/data-integrate/ods/page',
	queryForm: {
		tableName: '', 
		remarks: '', 
		projectId: ''
	},
	currentRow: {},
	tableColumns: [],
	tableData: [],
	tableDataHeader: {},
})

const activeName = ref('')
const tabBeforeLeave = () => {
	if(!state.currentRow.tableName) {
		ElMessage({
		    message: '请在左侧选择要查看的表',
		    type: 'warning',
		  })
			return false
	} 
}

const odsTaskDetailRef = ref()
/* tab切换 */
const handleClick = (name: TabPaneName) => {
	if (name == 'tableData') {
		//查询选中的表数据
		getTableDataApi(state.currentRow.tableName).then(res => {
			state.tableDataHeader = res.data.columns
			state.tableData = res.data.rows
		}) 
	} else if (name == 'tableLog'){
		odsTaskDetailRef.value.init(state.currentRow.projectId, state.currentRow.tableName)
	}
}
/* 表切换 */
const handleCurrentChange = (row) => {
	if(!row) {
		return
	}
	activeName.value = 'tableInfo'
	state.currentRow = row
	state.tableColumns = []
	state.tableData = []
	state.tableDataHeader = {}
	getColumnInfoApi(row.tableName).then(res => {
		state.tableColumns = res.data
	})
}

const infoRef = ref()
/* 查看表的数据接入任务 */
const getAccessInfoHandler = () =>  {
	if(!state.currentRow.dataAccessId) {
		ElMessage({
		    message: '没有查询到该表对应的数据接入任务',
		    type: 'warning',
		  })
		return
	}
	useAccessApi(state.currentRow.dataAccessId).then(res=> {
		if(!res.data) {
			ElMessage({
			    message: '该任务已被删除，若要恢复，请联系管理员处理',
			    type: 'warning',
			  })
				return
		}
		infoRef.value.init(state.currentRow.dataAccessId)
	})
}

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
</script>

<style>
.demo-tabs > .el-tabs__content {
  padding: 18px;
  color: #6b778c;
}
</style>
