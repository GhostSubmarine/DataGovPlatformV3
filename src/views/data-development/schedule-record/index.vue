<template>
	<el-card>
		<div class="scheduleRecordDivClass">
			<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
				<el-form-item>
				  <el-input v-model="state.queryForm.name" placeholder="调度名称"></el-input>
				</el-form-item>
				<el-form-item>
				  <fast-select v-model="state.queryForm.runStatus" dict-type="run_status" placeholder="状态" clearable filterable></fast-select>
				</el-form-item>
				<el-form-item>
				  <fast-select v-model="state.queryForm.executeType" dict-type="execute_type" placeholder="执行方式" clearable filterable></fast-select>
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
					<el-button @click="getDataList()">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button v-auth="'data-development:schedule:record:delete'" type="danger" @click="deleteBatchHandle()">删除</el-button>
				</el-form-item>
			</el-form>
			<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%" @selection-change="selectionChangeHandle">
				<el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
				<el-table-column prop="name" label="名称" header-align="center" align="center"></el-table-column>
				<fast-table-org-column prop="orgId" label="所属机构" header-align="center" align="center"></fast-table-org-column>
				<fast-table-column prop="executeType" label="执行方式" dict-type="execute_type" header-align="center" align="center"></fast-table-column>
				<el-table-column prop="runStatus" label="状态" header-align="center" align="center">
					<template #default="scope">
						<el-tag v-show="scope.row.runStatus==1">等待中</el-tag>
						<el-tag v-show="scope.row.runStatus==2" type="warning">运行中</el-tag>
						<el-tag v-show="scope.row.runStatus==3" type="success">正常结束</el-tag>
						<el-tag v-show="scope.row.runStatus==4" type="danger">异常结束</el-tag>
					</template>
				</el-table-column>
				<el-table-column show-overflow-tooltip prop="startTime" label="开始时间" header-align="center" align="center"></el-table-column>
				<el-table-column show-overflow-tooltip prop="endTime" label="结束时间" header-align="center" align="center"></el-table-column>
				<!-- <el-table-column prop="log" label="运行日志" header-align="center" align="center"></el-table-column> -->
				<el-table-column prop="createTime" label="创建时间" header-align="center" align="center"></el-table-column>
				<el-table-column label="操作" fixed="right" header-align="center" align="center" width="150">
					<template #default="scope">
						<el-button type="primary" link @click="queryDetail(scope.row)">详情</el-button>
						<el-button v-if="scope.row.runStatus==3 || scope.row.runStatus==4" v-auth="'data-development:schedule:record:delete'" type="primary" link @click="deleteBatchHandle(scope.row.id)">删除</el-button>
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
				<el-drawer title="详情" size="100%" v-model="flowVisable" direction="rtl" :modal="false" :close-on-click-modal="false" :destroy-on-close="true">
					<FlowDetail ref="flowDetailRef"></FlowDetail>
				</el-drawer>
			</div>
		</div>
	</el-card>
</template>

<script setup lang="ts" name="Data-developmentSchedule-recordIndex">
import { useCrud } from '@/hooks'
import { reactive, ref } from 'vue'
import { IHooksOptions } from '@/hooks/interface'
import FlowDetail from './flow-detail.vue'
import { ElMessage, ElMessageBox } from 'element-plus/es'

const state: IHooksOptions = reactive({
	dataListUrl: '/data-development/schedule/record/page',
	deleteUrl: '/data-development/schedule/record',
	queryForm: {
		name: '',
		runStatus: '',
		executeType: '',
		startTime: '',
		endTime: ''
	}
})

const flowVisable = ref(false)
const flowDetailRef = ref()
const queryDetail = (row: any) => {
	if(row.runStatus == 1 || row.runStatus == 2) {
		ElMessage.warning("请等待任务运行完毕再查看详情结果！")
		return
	}
	flowVisable.value = true
	initFlowDetailRef(row)
}

const initFlowDetailRef = (row) => {
	if(flowDetailRef.value) {
		flowDetailRef.value.init(row)
		return
	}
	setTimeout(() => {initFlowDetailRef(row)},500)
}


const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
</script>

<style lang="scss">
	.scheduleRecordDivClass {
		height: calc(100vh - 170px );
		/* :deep .el-overlay {
			position: absolute;
		} */
		position: relative;
		overflow: hidden;
	}
	.scheduleRecordDivClass > .drawerClass > div {
		height: 100%;
		position: absolute !important;
		overflow: hidden;
	}
	.scheduleRecordDivClass .drawerClass .el-drawer__header {
		height: 5%;
	}
	.scheduleRecordDivClass .drawerClass .el-drawer__body {
		height: 95%;
		padding: 0;
	}
	/* 占比el-drawer__body的100% */
	.scheduleRecordDivClass .drawerClass .el-drawer__body .el-card{
		height: 100%;
	}
	.scheduleRecordDivClass .drawerClass .el-drawer__body .el-card .el-card__body{
		/* padding: 6px; */
		height: 100%;
	}
</style>
