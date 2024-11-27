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
				<el-date-picker
						 v-model="state.queryForm.checkStartTime"
						 type="datetime"
						 placeholder="检测开始时间"
						 format="YYYY-MM-DD hh:mm:ss"
						 value-format="YYYY-MM-DD hh:mm:ss"
				     />
			</el-form-item>
			<el-form-item>
				<el-date-picker
						 v-model="state.queryForm.checkEndTime"
						 type="datetime"
						 placeholder="检测结束时间"
						 format="YYYY-MM-DD hh:mm:ss"
						 value-format="YYYY-MM-DD hh:mm:ss"
				     />
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
			<el-table-column show-overflow-tooltip prop="sourceTablePk" label="表主键" header-align="center" align="center"></el-table-column>
			<fast-table-column show-overflow-tooltip prop="status" dict-type="quality_log_status" label="状态" header-align="center" align="center"></fast-table-column>
			<el-table-column prop="errorColumnCount" label="错误字段数" header-align="center" align="center"></el-table-column>
			<el-table-column prop="errorDataCount" label="错误行数" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="dutyUser" label="负责人" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="dutyPhone" label="负责人电话" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="dutyEmail" label="负责人邮箱" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="checkStartTime" label="开始时间" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="checkEndTime" label="结束时间" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="createTime" label="创建时间" header-align="center" align="center"></el-table-column>
			<el-table-column label="操作" fixed="right" header-align="center" align="center" width="150">
				<template #default="scope">
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
	</el-card>
</template>

<script setup lang="ts" name="Data-governanceQuality-logIndex">
import { useCrud } from '@/hooks'
import { reactive, ref } from 'vue'
import { IHooksOptions } from '@/hooks/interface'

const state: IHooksOptions = reactive({
	dataListUrl: '/data-governance/quality-log/page',
	deleteUrl: '/data-governance/quality-log',
	queryForm: {
		qualityConfigName: '',
		qualityType: '',
		dataProv: '',
		checkStartTime: '',
		checkEndTime: ''
	}
})

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
</script>
