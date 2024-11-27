<template>
	<el-dialog v-model="visible" title="数据填报" :close-on-click-modal="false" width="80%">
		<el-form :inline="true">
			<el-form-item v-for="(item,index) in columns">
				<el-date-picker
					 v-if="item.fieldType == 9 && item.ifQuery == 1"	
					 style="margin-left: 8px;"
					 v-model="item.conditionVal"
					 type="datetime"
					 :placeholder="item.cnName"
					 format="YYYY-MM-DD hh:mm:ss"
					 value-format="YYYY-MM-DD hh:mm:ss"
				 />
				<el-date-picker
				 v-if="item.fieldType == 10 && item.ifQuery == 1"	
				 style="margin-left: 8px;"
				 v-model="item.conditionVal"
				 type="datetime"
				 :placeholder="item.cnName"
				 format="hh:mm:ss"
				 value-format="hh:mm:ss"
			  />
				  <el-date-picker
					 v-if="item.fieldType == 3 && item.ifQuery == 1"
					 style="margin-left: 8px;"
					 v-model="item.conditionVal"
					 type="datetime"
					 :placeholder="item.cnName"
					 format="YYYY-MM-DD"
					 value-format="YYYY-MM-DD"
				  />
				<el-input v-if="item.fieldType != 3 && item.fieldType != 9 && item.fieldType != 10 && item.ifQuery == 1" v-model="item.conditionVal" :placeholder="item.cnName"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button @click="adHocQuery()" type="primary">查询</el-button>
			</el-form-item>
			<el-form-item>
				<el-button @click="getImportModel()" type="success">获取导入模板</el-button>
			</el-form-item>
			<el-form-item>
				<el-button @click="importData()" type="warning">导入数据</el-button>
			</el-form-item>
		</el-form>
		<!-- 表格数据 -->
		<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%">
			 <el-table-column
				 show-overflow-tooltip
				 :prop="column.name"
				 :label="column.cnName"
				 v-for="(column, index) in columns"
				 :key="index"
			 >
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
	</el-dialog>
	
	<el-dialog v-model="uploadVisible" title="文件上传" :close-on-click-modal="false" width="40%">
		<el-upload
		    v-loading="upLoading"
		    drag
		    :action="uploadUrl"
			:before-upload="beforeUpload" :on-success="handleSuccess"
		  >
		    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
		    <div class="el-upload__text">
		      Drop file here or <em>click to upload</em>
		    </div>
		    <template #tip>
		      <div class="el-upload__tip">
		        jpg/png files with a size less than 10mb
		      </div>
		    </template>
		</el-upload>
	</el-dialog>
</template>

<script setup lang="ts" name="Data-governanceLabel-queryIndex">
import { useCrud } from '@/hooks'
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus/es'
import { getColumnsByTableIdApi, getImportModelApi} from '@/api/data-integrate/dataFillTable'
import { IHooksOptions } from '@/hooks/interface'
import constant from '@/utils/constant'
import cache from '@/utils/cache'

const visible = ref(false)
const columns = ref([])
const upLoading = ref(false)
const tableName = ref()

const uploadUrl = ref('')
const init = (table?: any) => {
	visible.value = true
	state.queryForm.tableId = table.id
	tableName.value = table.tableEngName
	uploadUrl.value = constant.apiUrl + "/data-integrate/dataFillTable/import-data/"+table.id +"?access_token="+cache.getToken()
	getColumnsByTableIdApi(table.id).then(res=>{
		columns.value = res.data
		adHocQuery()
	})
}



const state: IHooksOptions = reactive({
	requestMethod: 'post',
	createdIsNeed: false,
	dataListUrl: '/data-integrate/dataFillTable/table-data',
	queryForm: {
		tableId: '',
		conditionConfigs: [],
	},
})

const adHocQuery = () => {
	state.queryForm.conditionConfigs = columns
	state.dataList = []
	getDataList()
}

const getImportModel = () => {
	downloadHandle(constant.apiUrl + "/data-integrate/dataFillTable/import-model/"+state.queryForm.tableId+"?access_token="+cache.getToken(), tableName.value + ".xlsx")
}
const uploadVisible = ref(false)
const importData = () => {
	uploadVisible.value = true
}
const beforeUpload = () => {
	upLoading.value = true
}

const handleSuccess: UploadProps['onSuccess'] = (res, file) => {
	if (res.code !== 0) {
		ElMessage.error('导入失败：' + res.msg)
		upLoading.value = false
		return false
	}
	upLoading.value = false
	uploadVisible.value = false
	ElMessage.success('导入成功')
	adHocQuery()

}

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle, downloadHandle } = useCrud(state)
 
defineExpose({
	init
})

</script>

<style scoped>

</style>