<template>
	<el-card>
		<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
			<el-form-item>
			  <el-input v-model="state.queryForm.name" placeholder="名称"></el-input>
			</el-form-item>
			<el-form-item>
			  <el-input v-model="state.queryForm.engName" placeholder="英文名称"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="getDataList()">查询</el-button>
			</el-form-item>
			<!-- <el-form-item>
				<el-button type="primary" @click="addOrUpdateHandle()">新增</el-button>
			</el-form-item>
			<el-form-item>
				<el-button  type="danger" @click="deleteBatchHandle()">删除</el-button>
			</el-form-item> -->
		</el-form>
		<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%">
			<!-- <el-table-column prop="id" label="id" header-align="center" align="center"></el-table-column> -->
			<el-table-column prop="name" label="名称" header-align="center" align="center"></el-table-column>
			<el-table-column prop="engName" label="英文名称" header-align="center" align="center"></el-table-column>
			<fast-table-column dict-type="quality_rule_type" prop="type" label="类型" header-align="center" align="center"></fast-table-column>
			<el-table-column show-overflow-tooltip prop="description" label="说明" header-align="center" align="center"></el-table-column>
			<!-- <el-table-column prop="builtIn" label="来源 1-内置" header-align="center" align="center"></el-table-column> -->
			<!-- <el-table-column prop="param" label="个性化参数" header-align="center" align="center"></el-table-column> -->
			<!-- <el-table-column label="操作" fixed="right" header-align="center" align="center" width="150">
				<template #default="scope">
					<el-button v-auth="'srt:qualityRule:update'" type="primary" link @click="addOrUpdateHandle(scope.row.id)">修改</el-button>
					<el-button v-auth="'srt:qualityRule:delete'" type="primary" link @click="deleteBatchHandle(scope.row.id)">删除</el-button>
				</template>
			</el-table-column> -->
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

<script setup lang="ts" name="Data-governanceQuality-ruleIndex">
import { useCrud } from '@/hooks'
import { reactive, ref } from 'vue'
import { IHooksOptions } from '@/hooks/interface'

const state: IHooksOptions = reactive({
	dataListUrl: '/data-governance/quality-rule/page',
	deleteUrl: '/data-governance/quality-rule',
	queryForm: {
		name: '',
		engName: ''
	}
})

const addOrUpdateRef = ref()
const addOrUpdateHandle = (id?: number) => {
	addOrUpdateRef.value.init(id)
}

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
</script>
