<template>
	<el-card>
		<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
			<el-form-item>
			  <el-input v-model="state.queryForm.name" placeholder="任务名称"></el-input>
			</el-form-item>
			<el-form-item>
			  <fast-select v-model="state.queryForm.pushType" dict-type="data_push_type" placeholder="推送类型" clearable></fast-select>
			</el-form-item>
			<el-form-item>
			  <fast-select v-model="state.queryForm.incrementFlag" dict-type="yes_or_no" placeholder="是否增量推送" clearable></fast-select>
			</el-form-item>
			<el-form-item>
			  <fast-select v-model="state.queryForm.taskType" dict-type="data_push_task_type" placeholder="任务类型" clearable></fast-select>
			</el-form-item>
			<el-form-item>
			  <fast-select v-model="state.queryForm.status" dict-type="release_status" placeholder="发布状态" clearable></fast-select>
			</el-form-item>
			<el-form-item>
				<el-button @click="getDataList()">查询</el-button>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="addOrUpdateHandle()">新增</el-button>
			</el-form-item>
			<el-form-item>
				<el-button type="danger" @click="deleteBatchHandle()">删除</el-button>
			</el-form-item>
		</el-form>
		<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%" @selection-change="selectionChangeHandle">
			<el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
			<!-- <el-table-column prop="id" label="主键id" header-align="center" align="center"></el-table-column> -->
			<!-- <el-table-column prop="dataPushConfigId" label="数据推送配置id" header-align="center" align="center"></el-table-column> -->
			<el-table-column prop="name" show-overflow-tooltip label="任务名称" header-align="center" align="center"></el-table-column>
			<el-table-column prop="pushType" label="推送类型" header-align="center" align="center">
				<template #default="scope">
					<el-tag v-if="scope.row.pushType == 1" type="success"><span>表</span></el-tag>
					<el-tag v-if="scope.row.pushType == 2"><span>自定义sql</span></el-tag>
				</template>
			</el-table-column>
			<!-- <el-table-column prop="tableName" label="表名（类型为1有此字段）" header-align="center" align="center"></el-table-column>
			<el-table-column prop="sqlText" label="推送sql（类型为2有此字段）" header-align="center" align="center"></el-table-column> -->
			<fast-table-column prop="incrementFlag" label="是否增量推送" header-align="center" align="center" dict-type='yes_or_no'></fast-table-column>
			<!-- <el-table-column prop="incrementColumn" label="增量字段" header-align="center" align="center"></el-table-column> -->
			<el-table-column prop="taskType" label="调度" header-align="center" align="center" width="160">
				<template #default="scope">
					<el-tag v-show="scope.row.taskType == 2" ><span>一次性</span></el-tag>
					<el-tag v-show="scope.row.taskType == 3" type="warning"><span>周期性</span></el-tag>
				</template>
			</el-table-column>
			<el-table-column prop="cron" label="cron表达式" header-align="center" align="center"></el-table-column>
			<fast-table-column prop="status" label="发布状态" header-align="center" align="center" dict-type='release_status'></fast-table-column>
			<el-table-column show-overflow-tooltip prop="description" label="描述" header-align="center" align="center"></el-table-column>
			<fast-table-org-column prop="orgId" label="所属机构" header-align="center" align="center" show-overflow-tooltip></fast-table-org-column>
			<el-table-column prop="releaseTime" label="发布时间" header-align="center" align="center" width="160" show-overflow-tooltip></el-table-column>
			<fast-creator-column prop="releaseUserId" label="发布人" header-align="center" align="center"></fast-creator-column>
			<fast-creator-column prop="creator" label="创建者" header-align="center" align="center"></fast-creator-column>
			<el-table-column prop="createTime" label="创建时间" header-align="center" align="center" width="160" show-overflow-tooltip></el-table-column>
			<el-table-column label="操作" fixed="right" header-align="center" align="center" width="350">
				<template #default="scope">
					<el-button type="primary" link @click="addOrUpdateHandle(scope.row.id)">编辑</el-button>
					<el-button v-if="scope.row.status=='0'" type="primary" link @click="taskRelease(scope.row.id)">发布</el-button>
					<el-button v-if="scope.row.status=='1'" type="primary" link @click="taskCancel(scope.row.id)">取消发布</el-button>
					<el-button type="primary" link @click="selfHandler(scope.row.id)">执行</el-button>
					<el-button type="primary" link @click="getAccessHistory(scope.row.id)">执行记录</el-button>
					<el-button type="danger" link @click="deleteBatchHandle(scope.row.id)">删除</el-button>
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

		<!-- 弹窗, 新增 / 修改 -->
		<add-or-update ref="addOrUpdateRef" @refreshDataList="getDataList"></add-or-update>
		
		<!-- 弹窗 记录 -->
		<access-task ref="accessTaskRef"></access-task>
	</el-card>
</template>

<script setup lang="ts" name="Data-governanceData-push-taskIndex">
import { useCrud } from '@/hooks'
import { reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus/es'
import AddOrUpdate from './add-or-update.vue'
import { IHooksOptions } from '@/hooks/interface'
import { release, cancel, handRun } from '@/api/data-governance/dataPushTask'
import AccessTask from './data-push-task-log.vue'

const state: IHooksOptions = reactive({
	dataListUrl: '/data-governance/dataPushTask/page',
	deleteUrl: '/data-governance/dataPushTask',
	queryForm: {
		name: '',
		pushType: '',
		incrementFlag: '',
		taskType: '',
		status: ''
	}
})

const addOrUpdateRef = ref()
const addOrUpdateHandle = (id?: number) => {
	addOrUpdateRef.value.init(id)
}

const accessTaskRef = ref()
const getAccessHistory = (id) => {
	accessTaskRef.value.init(id)
}

const taskRelease = (id) => {
	ElMessageBox.confirm('确定发布吗?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	})
		.then(() => {
			release(id).then( res => {
				ElMessage({
				    message: '发布成功',
				    type: 'success',
				  })
				getDataList()
			})
		})
		.catch(() => {})
}

const taskCancel = (id) => {
	ElMessageBox.confirm(
	    '确认取消发布吗？',
	    '警告',
	    {
	      confirmButtonText: '确认',
	      cancelButtonText: '取消',
	      type: 'warning',
	    }
	  )
	    .then(() => {
	      cancel(id).then( res => {
	      	ElMessage({
	      	    message: '取消发布成功',
	      	    type: 'success',
	      	  })
			getDataList()
	      })
	    })
	    .catch(() => {
	    })
}

const selfHandler = (id) => {
	ElMessageBox.confirm(
		    '确认执行吗，如果有正在执行的任务可能会延迟执行！',
		    '警告',
		    {
		      confirmButtonText: '确认',
		      cancelButtonText: '取消',
		      type: 'warning',
		    }
		  )
		    .then(() => {
		      handRun(id).then( res => {
		      	ElMessage({
		      	    message: '手动调度执行成功，调度器执行完毕后可以去执行记录查看执行结果',
		      	    type: 'success',
		      	  })
						getDataList()
		      })
		    })
		    .catch(() => {
		    })
}

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
</script>
