<template>
	<el-card body-style="height: calc(100vh - 170px )">
		<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
			<el-form-item>
			  <el-input v-model="state.queryForm.name" placeholder="名称"></el-input>
			</el-form-item>
			<el-form-item>
			  <fast-select v-model="state.queryForm.status" dict-type="run_status" placeholder="状态" clearable></fast-select>
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
						 placeholder="结束时间"
						 format="YYYY-MM-DD hh:mm:ss"
						 value-format="YYYY-MM-DD hh:mm:ss"
				     />
			</el-form-item>
			<el-form-item>
				<el-button @click="getDataList()">查询</el-button>
			</el-form-item>
			<el-form-item>
				<el-button type="danger" @click="deleteBatchHandle()">删除</el-button>
			</el-form-item>
		</el-form>
		<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%" max-height="calc(100vh - 400px )" @selection-change="selectionChangeHandle">
			<el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
			<el-table-column prop="name" show-overflow-tooltip label="名称" header-align="center" align="center"></el-table-column>
			<fast-table-org-column prop="orgId" label="所属机构" header-align="center" align="center"></fast-table-org-column>
			<fast-table-column prop="status" show-overflow-tooltip label="状态" header-align="center" align="center" dict-type='run_status'></fast-table-column>
			<el-table-column prop="checkCount" label="检测条数" header-align="center" align="center"></el-table-column>
			<el-table-column prop="passCount" label="通过数" header-align="center" align="center"></el-table-column>
			<el-table-column prop="notPassCount" label="未通过数" header-align="center" align="center"></el-table-column>
			<el-table-column prop="passRate" label="合格率" header-align="center" align="center"></el-table-column>
			<el-table-column prop="startTime" show-overflow-tooltip label="开始时间" header-align="center" align="center"></el-table-column>
			<el-table-column prop="endTime" show-overflow-tooltip label="结束时间" header-align="center" align="center"></el-table-column>
			<el-table-column prop="createTime" show-overflow-tooltip label="创建时间" header-align="center" align="center"></el-table-column>
			<el-table-column label="操作" fixed="right" header-align="center" align="center" width="250">
				<template #default="scope">
					<el-button type="primary" link @click="deleteBatchHandle(scope.row.id)">删除</el-button>
					<el-button type="primary" link @click="pageTaskTable(scope.row.id)">检测记录</el-button>
					<el-button type="primary" v-if="scope.row.status==4" link @click="getErrorLog(scope.row.errorLog)">错误日志</el-button>
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
		
		<el-dialog v-model="errorLogVisable" title="错误日志" width="55%">
			<div style="padding: 15px">
				<ReadonlyStudio id="qualityErrorLog" ref="qualityErrorLogRef" style="height: 500px"></ReadonlyStudio>
			</div>
		</el-dialog>
		
		<TaskTable ref="taskTableRef"></TaskTable>
	</el-card>
</template>

<script setup lang="ts" name="Data-governanceQuality-taskIndex">
import { useCrud } from '@/hooks'
import { reactive, ref } from 'vue'
import ReadonlyStudio from '../../data-development/production/readonly-studio.vue'
import TaskTable from './task-table.vue'
import { IHooksOptions } from '@/hooks/interface'

const state: IHooksOptions = reactive({
	dataListUrl: '/data-governance/quality-task/page',
	deleteUrl: '/data-governance/quality-task',
	queryForm: {
		name: '',
		status: '',
		startTime: '',
		endTime: ''
	}
})

const errorLogVisable = ref(false)
const qualityErrorLogRef = ref()
const getErrorLog = (errorLog: any) => {
	errorLogVisable.value = true
	setTimeout(()=> {
		qualityErrorLogRef.value.setEditorValue(errorLog)
	},500)
}

const taskTableRef = ref()
const pageTaskTable =(id) => {
	taskTableRef.value.init(id)
}

/* const addOrUpdateRef = ref()
const addOrUpdateHandle = (id?: number) => {
	addOrUpdateRef.value.init(id)
} */

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
</script>
