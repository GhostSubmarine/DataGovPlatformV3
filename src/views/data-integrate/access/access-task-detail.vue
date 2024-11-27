<template>
	<el-dialog v-model="visible" title="同步结果">
			<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
				<el-form-item>
					<fast-select v-model="state.queryForm.ifSuccess" placeholder="是否成功" dict-type="yes_or_no" clearable></fast-select>
				</el-form-item>
				<el-form-item>
					<el-button @click="getDataList()" type="primary">查询</el-button>
				</el-form-item>
			</el-form>
			<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%" @selection-change="selectionChangeHandle">
				<el-table-column prop="id" label="执行序号" header-align="center" align="center"  width="130px"></el-table-column>
				<el-table-column prop="sourceSchemaName" show-overflow-tooltip="" label="源端库名" header-align="center" align="center" width="150px"></el-table-column>
				<el-table-column prop="targetSchemaName" show-overflow-tooltip label="目的端库名" header-align="center" align="center" width="130px"></el-table-column>
				<el-table-column prop="sourceTableName" show-overflow-tooltip label="源端表名" header-align="center" align="center" width="130px"></el-table-column>
				<el-table-column prop="targetTableName" show-overflow-tooltip label="目的端表名" header-align="center" align="center" width="130px"></el-table-column>
				<el-table-column prop="syncCount" label="同步记录数" header-align="center" align="center" width="150px">
					<template #default="scope">
						<span v-if="scope.row.ifSuccess">{{scope.row.syncCount}}</span>
						<span v-else>-</span>
					</template>
				</el-table-column>
				<el-table-column prop="syncBytes" label="同步数据量" header-align="center" align="center" width="150px">
					<template #default="scope">
						<span v-if="scope.row.ifSuccess">{{scope.row.syncBytes}}</span>
						<span v-else>-</span>
					</template>
				</el-table-column>
				<fast-table-column prop="ifSuccess" label="是否成功" header-align="center" align="center" dict-type="yes_or_no" width="130px"></fast-table-column>
				<el-table-column prop="successMsg" label="成功信息" header-align="center" align="center" width="150px"></el-table-column>
				<!-- <el-table-column type="expand"  label="失败信息"  width="150px">
					 <template #default="props">
								<div style="margin-left: 20px;">
									{{ props.row.errorMsg?props.row.errorMsg:'无信息可查看！'}}
								</div>
					  </template>
				</el-table-column> -->
				<el-table-column show-overflow-tooltip prop="createTime" label="创建时间" header-align="center" align="center" width="130px"></el-table-column>
				<el-table-column label="操作" fixed="right" header-align="center" align="center" width="150">
					<template #default="scope">
						<el-button type="primary" link @click="getErrorLog(scope.row.errorMsg)" v-if="scope.row.errorMsg">错误日志</el-button>
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
			
			<el-dialog v-model="accessErrorLogVisbale" title="错误日志" width="65%">
				<div style="padding: 15px">
					<ReadonlyStudio id="accessErrorLog" ref="accessErrorLogRef" style="height: 500px"></ReadonlyStudio>
				</div>
			</el-dialog>
		</el-dialog>
</template>

<script setup lang="ts" name="SrtAccessTaskDetailIndex">
	import { useCrud } from '@/hooks'
	import { reactive, ref } from 'vue'
	import { IHooksOptions } from '@/hooks/interface'
	import ReadonlyStudio from '../../data-development/production/readonly-studio.vue'
	
	const visible = ref(false)
	const state: IHooksOptions = reactive({
		createdIsNeed: false,
		dataListUrl: '/data-integrate/access/task-detail-page',
		queryForm: {
			ifSuccess: '',
			taskId: ''
		}
	})

	const init = (id?: number) => {
		state.queryForm.taskId = id
		visible.value = true
		getDataList()
	}
	
	const accessErrorLogVisbale = ref(false)
	const accessErrorLogRef = ref()
	const getErrorLog = (errorLog) => {
		accessErrorLogVisbale.value = true
		setTimeout(()=>{
			accessErrorLogRef.value.setEditorValue(errorLog)
		},200)
	}
	
	const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
	
	defineExpose({
		init
	})
	
</script>

<style>
</style>