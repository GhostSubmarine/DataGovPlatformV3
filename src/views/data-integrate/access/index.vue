<template>
	<el-card>
		<div class="accessDivClass">
			<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
				<el-form-item>
				  <el-input v-model="state.queryForm.taskName" placeholder="任务名称"></el-input>
				</el-form-item>
				<!-- <el-form-item>
				  <fast-project-select v-model="state.queryForm.projectId" placeholder="所属项目" clearable></fast-project-select>
				</el-form-item> -->
				<el-form-item>
				  <fast-select v-model="state.queryForm.status" dict-type="release_status" placeholder="发布状态" clearable></fast-select>
				</el-form-item>
				<el-form-item>
				 <fast-select v-model="state.queryForm.runStatus" dict-type="run_status" placeholder="最近运行状态" clearable></fast-select>
				</el-form-item>
				<el-form-item>
					<el-button @click="getDataList()">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button v-auth="'data-integrate:access:save'" type="primary" @click="addOrUpdateHandle()">新增</el-button>
				</el-form-item>
				<el-form-item>
					<el-button v-auth="'data-integrate:access:delete'" type="danger" @click="deleteBatchHandle()">删除</el-button>
				</el-form-item>
			</el-form>
			<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%" max-height="calc(100vh - 400px )" @selection-change="selectionChangeHandle">
				<el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
				<el-table-column prop="taskName" label="名称" header-align="center" align="center" show-overflow-tooltip></el-table-column>
				<!-- <fast-table-project-column prop="projectId" label="所属项目" header-align="center" align="center" show-overflow-tooltip></fast-table-project-column> -->
				<el-table-column prop="taskType" label="类型" header-align="center" align="center" width="160">
					<template #default="scope">
						<el-tag v-show="scope.row.taskType == 1" type="success">{{ getDictLabel(store.appStore.dictList, "task_type",  scope.row.taskType ) }}</el-tag>
						<el-tag v-show="scope.row.taskType == 2" >{{ getDictLabel(store.appStore.dictList, "task_type",  scope.row.taskType ) }}</el-tag>
						<el-tag v-show="scope.row.taskType == 3" type="warning">{{ getDictLabel(store.appStore.dictList, "task_type",  scope.row.taskType ) }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="cron" label="cron表达式" header-align="center" align="center" width="120">
					<template #default="scope">
						<el-tag>{{scope.row.cron?scope.row.cron:'无'}}</el-tag>
					</template>
				</el-table-column>
				<fast-table-column prop="status" label="发布状态" header-align="center" align="center" dict-type='release_status'></fast-table-column>
				<fast-table-column prop="runStatus" show-overflow-tooltip label="最新状态" header-align="center" align="center" dict-type='run_status'></fast-table-column>
				<el-table-column prop="startTime" label="最近开始时间" header-align="center" align="center" width="160" show-overflow-tooltip></el-table-column>
				<el-table-column prop="endTime" label="最近结束时间" header-align="center" align="center" width="160" show-overflow-tooltip></el-table-column>
				<!-- <el-table-column prop="nextRunTime" label="下次执行时间" header-align="center" align="center" width="160" show-overflow-tooltip></el-table-column> -->
				<el-table-column prop="releaseTime" label="发布时间" header-align="center" align="center" width="160" show-overflow-tooltip></el-table-column>
				<fast-creator-column prop="releaseUserId" label="发布人" header-align="center" align="center"></fast-creator-column>
				<fast-table-org-column prop="orgId" label="所属机构" header-align="center" align="center" show-overflow-tooltip></fast-table-org-column>
				<fast-creator-column prop="creator" label="创建者" header-align="center" align="center"></fast-creator-column>
				<el-table-column prop="createTime" label="创建时间" header-align="center" align="center" width="160" show-overflow-tooltip></el-table-column>
				<el-table-column label="操作" fixed="right" header-align="center" align="center" width="320">
					<template #default="scope">
						<el-button v-auth="'data-integrate:access:info'" type="primary" link @click="getInfoHandler(scope.row.id)">查看</el-button>
						<el-button v-if="scope.row.status=='0'" v-auth="'data-integrate:access:update'" type="primary" link @click="addOrUpdateHandle(scope.row.id)">编辑</el-button>
						<el-button v-if="scope.row.status=='0'" v-auth="'data-integrate:access:release'" type="primary" link @click="release(scope.row.id)">发布</el-button>
						<el-button v-if="scope.row.status=='1'" v-auth="'data-integrate:access:cancle'" type="primary" link @click="cancle(scope.row.id)">取消发布</el-button>
						<el-button v-auth="'data-integrate:access:selfhandler'" type="primary" link @click="selfHandler(scope.row.id)">执行</el-button>
						<el-button type="primary" link @click="getAccessHistory(scope.row.id)">执行记录</el-button>
						<el-button v-if="scope.row.status=='0'" v-auth="'data-integrate:access:delete'" type="primary" link @click="deleteBatchHandle(scope.row.id)">删除</el-button>
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
			<div class="drawerClass" style="height:100%">
				<add-or-update ref="addOrUpdateRef" @refreshDataList="getDataList"></add-or-update>
			</div>
			<!-- 弹窗 详情 -->
			<info ref="infoRef"></info>
			<!-- 弹窗 记录 -->
			<access-task ref="accessTaskRef"></access-task>
		</div>
	</el-card>
</template>

<script setup lang="ts" name="Data-integrateAccessIndex">
import { useCrud } from '@/hooks'
import { reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus/es'
import AddOrUpdate from './add-or-update.vue'
import info from './info.vue'
import AccessTask from './access-task.vue'
import { IHooksOptions } from '@/hooks/interface'
import { accessRelease, accessCancle, handRun } from '@/api/data-integrate/access'
import store from '@/store'
import { getDictLabel } from '@/utils/tool'

const state: IHooksOptions = reactive({
	dataListUrl: '/data-integrate/access/page',
	deleteUrl: '/data-integrate/access',
	queryForm: {
		taskName: '', 
		projectId: '', 
		dataDatabaseId: '', 
		status: '', 
		runStatus: ''
	}
})

const addOrUpdateRef = ref()
const addOrUpdateHandle = (id?: number) => {
	addOrUpdateRef.value.init(id)
}

const infoRef = ref()
const getInfoHandler = (id) => {
	infoRef.value.init(id)
}

const accessTaskRef = ref()
const getAccessHistory = (id) => {
	accessTaskRef.value.init(id)
}

const release = (id) => {
	ElMessageBox.confirm('确定发布吗?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	})
		.then(() => {
			accessRelease(id).then( res => {
				ElMessage({
				    message: '发布成功',
				    type: 'success',
				  })
				getDataList()
			})
		})
		.catch(() => {})
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

const cancle = (id) => {
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
	      accessCancle(id).then( res => {
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

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
</script>

<style>
	.accessDivClass {
		height: calc(100vh - 170px );
		position: relative;
		overflow: hidden;
	}
	.accessDivClass > .drawerClass > div {
		height: 100%;
		position: absolute !important;
		overflow: hidden;
	}
</style>
