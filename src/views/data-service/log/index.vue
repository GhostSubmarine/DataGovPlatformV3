<template>
	<el-card>
		<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
			<el-form-item>
				<el-input v-model="state.queryForm.ip" placeholder="ip"></el-input>
			</el-form-item>
			<el-form-item>
				<el-input v-model="state.queryForm.apiName" placeholder="api名称"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button @click="getDataList()">查询</el-button>
			</el-form-item>
			<el-form-item>
				<el-button v-auth="'data-service:log:delete'" type="danger" @click="deleteBatchHandle()">删除</el-button>
			</el-form-item>
		</el-form>
		<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%" @selection-change="selectionChangeHandle">
			<el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
			<el-table-column prop="ip" label="IP地址" header-align="center" align="center" width="200"></el-table-column>
			<el-table-column prop="url" label="uri地址" header-align="center" align="center" width="200" show-overflow-tooltip></el-table-column>
			<fast-table-org-column prop="orgId" label="所属机构" header-align="center" align="center"></fast-table-org-column>
			<el-table-column prop="status" label="状态码" header-align="center" align="center">
				<template #default="scope">
					<el-tag type="success" v-if="scope.row.status == 200">{{scope.row.status}}</el-tag>
					<el-tag v-else type="danger">{{scope.row.status}}</el-tag>
				</template>
			</el-table-column>
			<el-table-column prop="duration" label="时长(ms)" header-align="center" align="center"></el-table-column>
			<el-table-column prop="apiName" label="api名称" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="error" label="错误信息" header-align="center" align="center"></el-table-column>
			<el-table-column prop="createTime" label="创建时间" header-align="center" align="center"></el-table-column>
			<el-table-column label="操作" fixed="right" header-align="center" align="center" width="150">
				<template #default="scope">
					<el-button v-auth="'data-service:log:delete'" type="primary" link @click="deleteBatchHandle(scope.row.id)">删除</el-button>
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

	</el-card>
</template>

<script setup lang="ts" name="Data-serviceLogIndex">
import { useCrud } from '@/hooks'
import { reactive, ref } from 'vue'
import { IHooksOptions } from '@/hooks/interface'

const state: IHooksOptions = reactive({
	dataListUrl: '/data-service/log/page',
	deleteUrl: '/data-service/log',
	queryForm: {
		ip: '',
		apiName: ''
	}
})

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
</script>
