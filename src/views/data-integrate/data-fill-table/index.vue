<template>
	<el-card>
		<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
			<el-form-item>
			  <el-input v-model="state.queryForm.tableEngName" placeholder="表名"></el-input>
			</el-form-item>
			<el-form-item>
			  <el-input v-model="state.queryForm.tableCnName" placeholder="表中文名"></el-input>
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
			<!-- <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column> -->
			<!-- <el-table-column prop="id" label="主键id" header-align="center" align="center"></el-table-column> -->
			<el-table-column prop="tableEngName" show-overflow-tooltip label="表名" header-align="center" align="center"></el-table-column>
			<el-table-column prop="tableCnName" show-overflow-tooltip label="表中文名" header-align="center" align="center"></el-table-column>
			<fast-table-column prop="status" label="发布状态" header-align="center" align="center" dict-type='release_status'></fast-table-column>
			<el-table-column prop="releaseTime" label="发布时间" header-align="center" align="center" width="160" show-overflow-tooltip></el-table-column>
			<fast-creator-column prop="releaseUserId" label="发布人" header-align="center" align="center"></fast-creator-column>
			<el-table-column prop="description" show-overflow-tooltip label="描述" header-align="center" align="center"></el-table-column>
			<fast-table-org-column prop="orgId" label="所属机构" header-align="center" align="center"></fast-table-org-column>
			<fast-creator-column prop="creator" label="创建者" header-align="center" align="center"></fast-creator-column>
			<el-table-column prop="createTime" label="创建时间" header-align="center" align="center"></el-table-column>
			<el-table-column label="操作" fixed="right" header-align="center" align="center" width="350">
				<template #default="scope">
					<el-button type="primary" link @click="columnLook(scope.row)">查看字段</el-button>
					<el-button type="primary" v-if="scope.row.status==0" link @click="columnConfig(scope.row)">字段配置</el-button>
					<el-button type="primary" v-if="scope.row.status==0" link @click="release(scope.row.id)">发布</el-button>
					<el-button type="primary" v-if="scope.row.status==1" link @click="cancel(scope.row.id)">取消发布</el-button>
					<el-button type="primary" v-if="scope.row.status==0" link @click="addOrUpdateHandle(scope.row.id)">修改</el-button>
					<el-button type="primary" link @click="deleteBatchHandle(scope.row.id)">删除</el-button>
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
		
		<!-- 字段配置-->
		<TableColumn ref="tableColumnRef"></TableColumn>
	</el-card>
</template>

<script setup lang="ts" name="Data-integrateData-fill-tableIndex">
import { useCrud } from '@/hooks'
import { reactive, ref } from 'vue'
import { ElMessage,ElMessageBox } from 'element-plus/es'
import AddOrUpdate from './add-or-update.vue'
import TableColumn from '../data-fill-table-column/index.vue'
import { IHooksOptions } from '@/hooks/interface'
import { releaseApi, cancelApi} from '@/api/data-integrate/dataFillTable'

const state: IHooksOptions = reactive({
	dataListUrl: '/data-integrate/dataFillTable/page',
	deleteUrl: '/data-integrate/dataFillTable',
	queryForm: {
		tableEngName: '',
		tableCnName: '',
	}
})

const addOrUpdateRef = ref()
const addOrUpdateHandle = (id?: number) => {
	addOrUpdateRef.value.init(id)
}
const tableColumnRef = ref()
const columnConfig = (table: any) => {
	tableColumnRef.value.init(table)
}
const columnLook = (table: any) => {
	tableColumnRef.value.init(table,true)
}


const release = (id: number) => {
	ElMessageBox.confirm(
	    '确认发布吗？',
	    '警告',
	    {
	      confirmButtonText: '确认',
	      cancelButtonText: '取消',
	      type: 'warning',
	    }
	  ).then(() => {
	      releaseApi(id).then( res => {
	      	ElMessage({
	      	    message: '发布成功',
	      	    type: 'success',
	      	  })
			getDataList()
	      })
	    })
	    .catch(() => {
	    })
}

const cancel = (id: number) => {
	ElMessageBox.confirm(
	    '确认取消发布吗？取消发布会同步删除对应的表！',
	    '警告',
	    {
	      confirmButtonText: '确认',
	      cancelButtonText: '取消',
	      type: 'warning',
	    }
	  ).then(() => {
	      cancelApi(id).then( res => {
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
