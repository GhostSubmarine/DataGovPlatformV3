<template>
	<el-card body-style="height: calc(100vh - 170px )">
		<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
			<el-form-item>
			  <el-input v-model="state.queryForm.qualityConfigName" placeholder="规则名称"></el-input>
			</el-form-item>
			<el-form-item>
			  <fast-select v-model="state.queryForm.qualityType" dict-type="quality_type" placeholder="检测类型" clearable></fast-select>
			</el-form-item>
			<el-form-item>
			  <el-input v-model="state.queryForm.dataProv" placeholder="数据提供方"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button @click="getDataList()">查询</el-button>
			</el-form-item>
			<el-form-item>
				<el-button type="danger" @click="deleteBatchHandle()">删除</el-button>
			</el-form-item>
		</el-form>
		<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%" @selection-change="selectionChangeHandle">
			<el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
			<el-table-column show-overflow-tooltip prop="qualityConfigName" label="规则名称" header-align="center" align="center"></el-table-column>
			<fast-table-column show-overflow-tooltip prop="qualityType" dict-type="quality_type" label="检测类型" header-align="center" align="center"></fast-table-column>
			<el-table-column show-overflow-tooltip prop="dataProv" label="数据提供方" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="sourceTableName" label="表名称" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="sourceTableRemark" label="表注释" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="dataRow" label="数据行" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="sourceTablePk" label="表主键" header-align="center" align="center"></el-table-column>
			<el-table-column prop="dataPk" label="主键值" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="errorColumn" label="错误字段" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="errorValue" label="错误数据值" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="correctValue" label="修正数据值" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="causeReason" label="发生原因" header-align="center" align="center"></el-table-column>
			<el-table-column prop="correctUser" label="修正人" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="correctTime" label="修正时间" header-align="center" align="center"></el-table-column>
			<fast-table-column prop="correctStatus" dict-type="correct_status" label="修正状态" header-align="center" align="center"></fast-table-column>
			<el-table-column show-overflow-tooltip prop="createTime" label="创建时间" header-align="center" align="center"></el-table-column>
			<el-table-column label="操作" fixed="right" header-align="center" align="center" width="150">
				<template #default="scope">
					<el-button type="primary" link @click="correctHandle(scope.row.id)">修正</el-button>
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
	</el-card>
</template>

<script setup lang="ts" name="Data-governanceQuality-topicIndex">
import { useCrud } from '@/hooks'
import { reactive, ref } from 'vue'
import AddOrUpdate from './add-or-update.vue'
import { IHooksOptions } from '@/hooks/interface'

const state: IHooksOptions = reactive({
	dataListUrl: '/data-governance/quality-topic/page',
	deleteUrl: '/data-governance/quality-topic',
	queryForm: {
		qualityCofnfigName: '',
		qualityType: '',
		dataProv: '',
	}
})

const addOrUpdateRef = ref()
const correctHandle = (id?: number) => {
	addOrUpdateRef.value.init(id)
}

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
</script>
