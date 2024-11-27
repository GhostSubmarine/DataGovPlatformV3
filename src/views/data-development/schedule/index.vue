<template>
	<el-card>
		<div class="scheduleDivClass">
			<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
				<el-form-item>
				  <el-input v-model="state.queryForm.name" placeholder="名称"></el-input>
				</el-form-item>
				<el-form-item>
				  <fast-select v-model="state.queryForm.status" dict-type="release_status" placeholder="发布状态" clearable></fast-select>
				</el-form-item>
				<el-form-item>
					<el-button @click="getDataList()">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button v-auth="'data-development:schedule:save'" type="primary" @click="addOrUpdateHandle()">新增</el-button>
				</el-form-item>
				<el-form-item>
					<el-button v-auth="'data-development:schedule:delete'" type="danger" @click="deleteBatchHandle()">删除</el-button>
				</el-form-item>
			</el-form>
			<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%" @selection-change="selectionChangeHandle">
				<el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
				<el-table-column prop="name" label="名称" header-align="center" align="center"></el-table-column>
				<fast-table-org-column prop="orgId" label="所属机构" header-align="center" align="center"></fast-table-org-column>
				<el-table-column prop="cron" label="cron表达式" header-align="center" align="center">
					<template #default="scope">
						<el-tag v-if="scope.row.cron">{{scope.row.cron}}</el-tag>
					</template>
				</el-table-column>
				<fast-table-column prop="status" label="发布状态" dict-type="release_status" header-align="center" align="center"></fast-table-column>
				<fast-creator-column prop="releaseUserId" label="发布人" header-align="center" align="center"></fast-creator-column>
				<el-table-column show-overflow-tooltip prop="releaseTime" label="发布时间" header-align="center" align="center"></el-table-column>
				<fast-creator-column prop="creator" label="创建人" header-align="center" align="center"></fast-creator-column>
				<el-table-column show-overflow-tooltip prop="createTime" label="创建时间" header-align="center" align="center"></el-table-column>
				<el-table-column show-overflow-tooltip prop="updateTime" label="最近更新时间" header-align="center" align="center"></el-table-column>
				<el-table-column label="操作" fixed="right" header-align="center" align="center" width="280">
					<template #default="scope">
						<el-button type="primary" link @click="getDetail(scope.row.id)">查看</el-button>
						<el-button v-auth="'data-development:schedule:run'" type="primary" link @click="runFlowHandle(scope.row.id)">执行</el-button>
						<el-button v-if="scope.row.status==0" v-auth="'data-development:schedule:release'" type="primary" link @click="release(scope.row.id)">发布</el-button>
						<el-button v-if="scope.row.status==1" v-auth="'data-development:schedule:cancle'" type="primary" link @click="cancle(scope.row.id)">取消发布</el-button>
						<el-button v-if="scope.row.status==0" v-auth="'data-development:schedule:update'" type="primary" link @click="addOrUpdateHandle(scope.row.id)">编辑</el-button>
						<el-button v-auth="'data-development:schedule:delete'" type="primary" link @click="deleteBatchHandle(scope.row.id)">删除</el-button>
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
				<el-drawer title="编辑流程" size="100%" v-model="flowVisable" direction="rtl" :modal="false" :close-on-click-modal="false">
					<Flow ref="flowRef" @refreshDataList="refreshData"></Flow>
				</el-drawer>
			</div>
			
			<!-- 弹窗, 查看 -->
			<div class="drawerClass" style="height:100%">
				<el-drawer title="详情" size="100%" v-model="detailVisable" direction="rtl" :modal="false" :close-on-click-modal="false">
					<Detail ref="detailRef"></Detail>
				</el-drawer>
			</div>
			
		</div>
	</el-card>
</template>

<script setup lang="ts" name="Data-developmentScheduleIndex">
import { useCrud } from '@/hooks'
import { reactive, ref } from 'vue'
import Flow from './flow.vue'
import Detail from './detail.vue'
import { IHooksOptions } from '@/hooks/interface'
import store from '@/store'
import { ElMessage, ElMessageBox } from 'element-plus/es'
import { getDictLabel } from '@/utils/tool'
import { releaseApi,cancleApi } from '@/api/data-development/schedule'

const state: IHooksOptions = reactive({
	dataListUrl: '/data-development/schedule/page',
	deleteUrl: '/data-development/schedule',
	queryForm: {
		name: '',
		status: ''
	}
})

const refreshData = () => {
	flowVisable.value = false
	getDataList()
}

/**
 * 查看详情
 */
const detailVisable = ref(false)
const detailRef = ref()
const getDetail = (id) => {
	detailVisable.value = true
	initDetailRef(id)
}
const initDetailRef = (id) => {
	if(detailRef.value) {
		detailRef.value.init(id)
		return
	}
	setTimeout(() => {initDetailRef(id)},500)
}

/**
 * 编辑流程
 */
const flowVisable = ref(false)
const flowRef = ref()
const addOrUpdateHandle = (id?: number) => {
	flowVisable.value = true
	initFlowRef(id)
}
const initFlowRef = (id, ifRun) => {
	if(flowRef.value) {
		flowRef.value.init(id, ifRun)
		return
	}
	setTimeout(() => {initFlowRef(id, ifRun)},500)
}

/**
 * 执行
 */
const runFlowHandle = (id) => {
	ElMessageBox.confirm('确定执行吗?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	})
		.then(() => {
			flowVisable.value = true
			initFlowRef(id, true)
		})
		.catch(() => {})
}

/**
 * 发布
 */
const release = (id) => {
	ElMessageBox.confirm('确定发布吗?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	})
		.then(() => {
			releaseApi(id).then(res=>{
				ElMessage.success("发布成功")
				getDataList()
			})
		})
		.catch(() => {})
}
/**
 * 取消发布
 */
const cancle = (id) => {
	ElMessageBox.confirm('确定取消发布吗?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	})
		.then(() => {
			cancleApi(id).then(res=>{
				ElMessage.success("取消发布成功")
				getDataList()
			})
		})
		.catch(() => {})
}


/* const handleClose = () => {
  ElMessageBox.confirm('确定关闭吗？','提示' {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	})
    .then(() => {
      //done()
    })
    .catch(() => {
    })
} */

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
</script>

<style lang="scss">
	.scheduleDivClass {
		height: calc(100vh - 170px );
		/* :deep .el-overlay {
			position: absolute;
		} */
		position: relative;
		overflow: hidden;
	}
	.scheduleDivClass > .drawerClass > div {
		height: 100%;
		position: absolute !important;
		overflow: hidden;
	}
	.drawerClass .el-drawer__header {
		height: 5%;
	}
	.drawerClass .el-drawer__body {
		height: 95%;
		padding: 0;
	}
	/* 占比el-drawer__body的100% */
	.drawerClass .el-drawer__body .el-card{
		height: 100%;
	}
	.drawerClass .el-drawer__body .el-card .el-card__body{
		/* padding: 6px; */
		height: 100%;
	}
</style>
