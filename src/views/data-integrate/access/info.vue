<template>
	<el-dialog v-model="visible" title="详情">
		<!-- 基本信息-->
		<el-descriptions size="default"
										 :column="1"
										 label-class-name="el-descriptions-item-label-class"
										 border>
			<el-descriptions-item label="任务名称">{{dataForm.taskName}}</el-descriptions-item>
			<el-descriptions-item label="任务描述">{{dataForm.description}}</el-descriptions-item>
			<el-descriptions-item label="接入类型">
				<span v-if="dataForm.accessMode == '1'">
					接入ods贴源层
				</span>
				<span v-if="dataForm.accessMode == '2'">
					自定义接入
				</span>
			</el-descriptions-item>
			<el-descriptions-item label="调度类型">
				<span v-if="dataForm.taskType == '1'">
					实时同步
				</span>
				<span v-if="dataForm.taskType == '2'">
					一次性全量同步
				</span>
				<span v-if="dataForm.taskType == '3'">
					一次性全量周期性增量
				</span>
			</el-descriptions-item>
			<el-descriptions-item v-if="dataForm.taskType == '3'"
														label="cron表达式">{{dataForm.cron}}</el-descriptions-item>
			<el-descriptions-item label="源端数据库">[{{dataForm.sourceDatabaseId}}]{{dataForm.sourceDatabase.name}}</el-descriptions-item>
			<el-descriptions-item label="源端SQL" v-if="dataForm.sourceType == '2'">{{dataForm.sourceSql}}</el-descriptions-item>
			<el-descriptions-item label="源端表选择方式" v-if="dataForm.sourceType == '1'">
				<span v-if="dataForm.includeOrExclude == '1'">
					包含表
				</span>
				<span v-if="dataForm.includeOrExclude == '0'">
					排除表
				</span>
			</el-descriptions-item>
			<el-descriptions-item label="源端表名列表" v-if="dataForm.sourceType == '1'">
				<span v-show="dataForm.includeOrExclude == '1' && (!dataForm.sourceSelectedTables || dataForm.sourceSelectedTables.length==0)"><b>所有物理表</b></span>
				<p v-for="item in dataForm.sourceSelectedTables"
					 v-bind:key="item">{{item}}</p>
			</el-descriptions-item>
			<el-descriptions-item label="目的端数据源" v-if="dataForm.accessMode =='2'">[{{dataForm.targetDatabaseId}}]{{dataForm.targetDatabase.name}}</el-descriptions-item>
			<el-descriptions-item label="目的表" v-if="dataForm.sourceType =='2'">{{dataForm.targetTable}}</el-descriptions-item>
			<el-descriptions-item label="只创建表" v-if="dataForm.sourceType == '1'">{{dataForm.targetOnlyCreate}}</el-descriptions-item>
			<el-descriptions-item label="是否同步已存在的表">{{dataForm.targetSyncExit}}</el-descriptions-item>
			<el-descriptions-item label="同步前是否先删除目的表">{{dataForm.targetDropTable}}</el-descriptions-item>
			<el-descriptions-item label="是否启用增量变更同步">{{dataForm.targetDataSync}}</el-descriptions-item>
			<el-descriptions-item label="增量变更同步类型" v-if="dataForm.targetDataSync">{{dataForm.changeDataSyncType == 'PK_ORDER_COMPARE'?'主键排序比对':'增量字段'}}</el-descriptions-item>
			<el-descriptions-item label="是否创建索引" v-if="dataForm.sourceType == '1'">{{dataForm.targetIndexCreate}}</el-descriptions-item>
			<el-descriptions-item label="是否表名字段名转小写" v-if="dataForm.accessMode =='2'">{{dataForm.targetLowerCase}}</el-descriptions-item>
			<el-descriptions-item label="是否表名字段名转大写" v-if="dataForm.accessMode =='2'">{{dataForm.targetUpperCase}}</el-descriptions-item>
			<el-descriptions-item label="是否主键自动递增">{{dataForm.targetAutoIncrement}}</el-descriptions-item>
			<el-descriptions-item label="数据处理批次量">{{dataForm.batchSize}}</el-descriptions-item>
			<!-- <el-descriptions-item label="表名映射规则" v-if="dataForm.sourceType == '1'">
				<span v-show="dataForm.tableNameMapper.length==0">[映射关系为空]</span>
				<table v-if="dataForm.tableNameMapper.length>0"
							 class="name-mapper-table">
					<tr>
						<th>表名匹配的正则名</th>
						<th>替换的目标值</th>
					</tr>
					<tr v-for='(item,index) in dataForm.tableNameMapper'
							:key="index">
						<td>{{item['fromPattern']}}</td>
						<td>{{item['toValue']}}</td>
					</tr>
				</table>
			</el-descriptions-item>
			<el-descriptions-item label="字段名映射规则">
				<span v-show="dataForm.columnNameMapper.length==0">[映射关系为空]</span>
				<table v-if="dataForm.columnNameMapper.length>0"
							 class="name-mapper-table">
					<tr>
						<th>字段名匹配的正则名</th>
						<th>替换的目标值</th>
					</tr>
					<tr v-for='(item,index) in dataForm.columnNameMapper'
							:key="index">
						<td>{{item['fromPattern']}}</td>
						<td>{{item['toValue']}}</td>
					</tr>
				</table>
			</el-descriptions-item> -->
		</el-descriptions>
	</el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useAccessApi } from '@/api/data-integrate/access'
import { listDatabase } from '@/api/data-integrate/database'

const visible = ref(false)
const dataForm = reactive({
	orgId: '',
	taskName: '',
	description: '',
	projectId: '',
	sourceDatabaseId: '',
	sourceDatabase: {},
	sourceType: '',
	sourceSql: '',
	sourcePrimaryKeys: [],
	taskType: '',
	cron: '',
	databases: [],
	includeOrExclude: 1,
	sourceTables: [],
	sourceSelectedTables: [],
	accessMode: 1,
	targetDatabaseId: '', 
	targetDatabase: {},
	targetTable: '',
	targetOnlyCreate: false,
	targetSyncExit: true,
	targetDropTable: true,
	targetDataSync: false,
	targetIndexCreate: false,
	targetLowerCase: false,
	targetUpperCase: false,
	targetAutoIncrement: false,
	batchSize: 1000,
	tableNameMapper: [],
	columnNameMapper: [],
	})

onMounted(() => {
	listDatabase().then(res => {
		dataForm.databases = res.data
	})
})

const init = (id?: number) => {
	visible.value = true
	dataForm.id = ''

	if (id) {
		getAccess(id)
	}
}

const getAccess = (id: number) => {
	useAccessApi(id).then(res => {
		
		Object.assign(dataForm, res.data)
		
		if (dataForm.sourceDatabaseId) {
			dataForm.sourceDatabase = dataForm.databases.find((item) => {
				return item.id == dataForm.sourceDatabaseId
			})
		}
		if (dataForm.targetDatabaseId) {
			dataForm.targetDatabase = dataForm.databases.find((item) => {
				return item.id == dataForm.targetDatabaseId
			})
		}
	})
}

defineExpose({
	init
})
</script>

<style scoped>
	.tip-content {
	  font-size: 14px;
	}
</style>