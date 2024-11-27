<template>
	<el-card>
		<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
			<el-form-item>
			  <el-input v-model="state.queryForm.name" placeholder="名称"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button @click="getDataList()">查询</el-button>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="addOrUpdateHandle()">新增</el-button>
			</el-form-item>
			<!-- <el-form-item>
				<el-button  type="danger" @click="deleteBatchHandle()">删除</el-button>
			</el-form-item> -->
		</el-form>
		<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%" @selection-change="selectionChangeHandle">
			<!-- <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
			<el-table-column prop="id" label="主键id" header-align="center" align="center"></el-table-column> -->
			<el-table-column prop="name" label="配置名称" header-align="center" align="center"></el-table-column>
			<el-table-column prop="classPath" label="类路径" header-align="center" align="center"></el-table-column>
			<el-table-column prop="builtIn" label="类型" header-align="center" align="center">
				<template #default="scope">
					<el-tag v-if="scope.row.builtIn == 0" type="success"><span>自定义</span></el-tag>
					<el-tag v-if="scope.row.builtIn == 1"><span>内置</span></el-tag>
				</template>
			</el-table-column>
			<el-table-column prop="param" show-overflow-tooltip="" label="自定义参数" header-align="center" align="center"></el-table-column>
			<el-table-column prop="description" show-overflow-tooltip="" label="描述" header-align="center" align="center"></el-table-column>
			<fast-table-org-column prop="orgId" label="所属机构" header-align="center" align="center" show-overflow-tooltip></fast-table-org-column>
			<el-table-column prop="createTime" show-overflow-tooltip label="创建时间" header-align="center" align="center"></el-table-column>
			<el-table-column label="操作" fixed="right" header-align="center" align="center" width="150">
				<template #default="scope">
					<el-button v-if="scope.row.builtIn==0" type="primary" link @click="addOrUpdateHandle(scope.row.id)">修改</el-button>
					<el-button v-if="scope.row.builtIn==0" type="primary" link @click="deleteBatchHandle(scope.row.id)">删除</el-button>
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
	</el-card>
</template>

<script setup lang="ts" name="Data-governanceData-push-configIndex">
import { useCrud } from '@/hooks'
import { reactive, ref } from 'vue'
import AddOrUpdate from './add-or-update.vue'
import { IHooksOptions } from '@/hooks/interface'

const state: IHooksOptions = reactive({
	dataListUrl: '/data-governance/dataPushConfig/page',
	deleteUrl: '/data-governance/dataPushConfig',
	queryForm: {
		name: '',
	}
})

const addOrUpdateRef = ref()
const addOrUpdateHandle = (id?: number) => {
	addOrUpdateRef.value.init(id)
}

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
</script>
