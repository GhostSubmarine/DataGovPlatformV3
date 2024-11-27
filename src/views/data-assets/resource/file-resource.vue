<template>
	<el-card>
		<div class="fileResourceDiv">
			<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
				<el-form-item>
					<el-input v-model="state.queryForm.name" placeholder="名称"></el-input>
				</el-form-item>
				<el-form-item>
					<el-input v-model="state.queryForm.type" placeholder="文件类型"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="getDataList()">查询</el-button>
				</el-form-item>
			</el-form>
			<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%" >
				<el-table-column show-overflow-tooltip prop="name" label="名称" header-align="center" align="center"></el-table-column>
				<el-table-column prop="group" show-overflow-tooltip label="所属分组" header-align="center" align="center"></el-table-column>
				<el-table-column prop="type" label="文件类型" header-align="center" align="center"></el-table-column>
				<el-table-column prop="fileUrl" label="文件地址" header-align="center" align="center">
					<template #default="scope">
						<el-button type="primary" link><a :href="scope.row.fileUrl" target="_blank">点击前往</a></el-button>
					</template>
				</el-table-column>
				<el-table-column prop="size" label="文件大小" header-align="center" align="center">
					<template #default="scope">
						{{ scope.row.size?convertSizeFormat(scope.row.size):'' }}
					</template>
				</el-table-column>
				<el-table-column type="expand"  label="描述" width="80">
					 <template #default="props">
								<div style="margin-left: 20px;">
									{{ props.row.description?props.row.description:'无描述信息！'}}
								</div>
					  </template>
				</el-table-column>
				<fast-creator-column prop="creator" label="创建者" header-align="center" align="center"></fast-creator-column>
				<el-table-column prop="createTime" label="创建时间" header-align="center" align="center"></el-table-column>
				<el-table-column label="操作" fixed="right" header-align="center" align="center" width="180">
					<template #default="scope">
						<el-button type="primary" link @click="downloadHandle(scope.row.fileUrl, scope.row.name)">下载</el-button>
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
		</div>
	</el-card>
</template>

<script setup lang="ts" name="DataAssetsFileResource">
import { useCrud } from '@/hooks'
import { convertSizeFormat } from '@/utils/tool'
import { reactive, ref, onMounted } from 'vue'
import { IHooksOptions } from '@/hooks/interface'

const state: IHooksOptions = reactive({
	createdIsNeed: false,
	projectId: '',
	path: '',
	fileCategoryId: '',
	dataListUrl: '/data-integrate/file/page-resource',
	deleteUrl: '/data-integrate/file',
	queryForm: {
		name: '', 
		fileCategoryId: '',
		type: ''
	}
})

onMounted(()=>{
	const fileResourceId = sessionStorage.getItem("fileResourceId")
	const queryApply = sessionStorage.getItem("queryApply")
	state.queryForm.resourceId = fileResourceId
	state.queryForm.queryApply = queryApply?queryApply:0
	getDataList()
})

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle,downloadHandle } = useCrud(state)

</script>

<style>
	.fileResourceDiv {
		height: calc(100vh - 170px );
	}
</style>
