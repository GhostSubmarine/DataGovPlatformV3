<template>
	<el-dialog v-model="visible" :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false" >
		<el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="100px" @keyup.enter="submitHandle()">
			<el-divider><span style="font-size: 16px">基础信息</span></el-divider>
			<el-form-item label="名称" prop="name" label-width="auto">
				<el-input v-model="dataForm.name" placeholder="名称"></el-input>
			</el-form-item>
			<el-form-item label="数据提供方" prop="dataProv" label-width="auto">
				<el-input v-model="dataForm.dataProv" placeholder="数据提供方"></el-input>
			</el-form-item>
			<el-form-item label="检测类型" prop="qualityType" label-width="auto">
				<fast-select v-model="dataForm.qualityType" dict-type="quality_type" placeholder="检测类型" clearable></fast-select>
			</el-form-item>
			<el-form-item label="检测表" prop="sourceTableMetaId" label-width="auto">
				<el-tree-select v-model="dataForm.sourceTableMetaId" :props="props" :data="metaTableList" clearable filterable @current-change="sourceTableChange">
					<template #default="{ node, data }">
						 <div>
							 <span>
								 <img v-if="data.icon=='/src/assets/folder.png'" src="/src/assets/folder.png"/>
								 <img v-if="data.icon=='/src/assets/database.png'" src="/src/assets/database.png"/>
								 <img v-if="data.icon=='/src/assets/table.png'" src="/src/assets/table.png"/>
								 <img v-if="data.icon=='/src/assets/column.png'" src="/src/assets/column.png"/>
								 <img v-if="data.icon=='/src/assets/model.png'" src="/src/assets/model.png"/>
								 <span style="margin-left: 8px;">{{ data.name }}&emsp;{{ data.code }}</span>
							 </span>
						 </div>
					</template>
				</el-tree-select>
			</el-form-item>
			<el-form-item label="表主键" prop="sourceTablePk" label-width="auto">
				<el-tree-select v-model="dataForm.sourceTablePk" :props="props" :data="metaColumnList" clearable filterable @current-change="sourcePkChange">
					<template #default="{ node, data }">
						 <div>
							 <span>
								 <img src="/src/assets/column.png"/>
								 <span style="margin-left: 8px;">{{ data.label }}&emsp;{{ data.value }}</span>
							 </span>
						 </div>
					</template>
				</el-tree-select>
			</el-form-item>
			<el-form-item label="任务类型" prop="taskType" label-width="auto">
				<fast-select v-model="dataForm.taskType" dict-type="quality_config_task_type" placeholder="任务类型" clearable></fast-select>
			</el-form-item>
			<el-form-item label="cron表达式" prop="cron" label-width="auto" v-if="dataForm.taskType == 2">
				<el-input v-model="dataForm.cron"  placeholder="cron表达式" clearable></el-input>
			</el-form-item>
			<el-form-item label="负责人" prop="dutyUser" label-width="auto">
				<el-input v-model="dataForm.dutyUser" placeholder="负责人"></el-input>
			</el-form-item>
			<el-form-item label="负责人电话" prop="dutyPhone" label-width="auto">
				<el-input v-model="dataForm.dutyPhone" placeholder="负责人电话"></el-input>
			</el-form-item>
			<el-form-item label="负责人邮箱" prop="dutyEmail" label-width="auto">
				<el-input v-model="dataForm.dutyEmail" placeholder="负责人邮箱"></el-input>
			</el-form-item>
			<el-form-item label="备注" prop="note" label-width="auto">
				<el-input type="textarea" v-model="dataForm.note"></el-input>
			</el-form-item>
			<div v-show="!!dataForm.sourceTableMetaId">
				<el-divider><span style="font-size: 16px">字段检测配置</span></el-divider>
				<el-button type="success" @click="addConfig" size="small">添加配置</el-button>
				<div style="margin-top: 10px;" v-for="(item,index) in dataForm.columnConfig">
					<el-tree-select v-model="item.sourceColumn" :props="props" :data="metaColumnList" clearable filterable @current-change="sourceColumnChange">
						<template #default="{ node, data }">
							 <div>
								 <span>
									 <img src="/src/assets/column.png"/>
									 <span style="margin-left: 8px;">{{ data.label }}&emsp;{{ data.value }}</span>
								 </span>
							 </div>
						</template>
					</el-tree-select>
					<el-select 
							style="margin-left: 8px;"
							v-model="item.ruleId"
							 clearable
							 filterable 
					           placeholder="规则类型">
					  <el-option v-for="(rule,index) in qualityRuleList"
					             :key="rule.id"
					             :label="`${rule.name}`"
					             :value="rule.id"></el-option>
					</el-select>
					<el-date-picker
							 v-if="item.ruleId == 12 && item.sourceColumnType == 'java.sql.Timestamp'"
							 style="margin-left: 8px;"
							 v-model="item.rangeStart"
							 type="datetime"
							 placeholder="开始时间"
							 format="YYYY-MM-DD hh:mm:ss"
							 value-format="YYYY-MM-DD hh:mm:ss"
					     />
					 <el-date-picker
							 v-if="item.ruleId == 12 && item.sourceColumnType == 'java.sql.Timestamp'"
							 style="margin-left: 8px;"
							 v-model="item.rangeEnd"
							 type="datetime"
							 placeholder="结束时间"
							 format="YYYY-MM-DD hh:mm:ss"
							 value-format="YYYY-MM-DD hh:mm:ss"
						  />
					<el-date-picker
							 v-if="item.ruleId == 12 && item.sourceColumnType == 'java.sql.Time'"
							 style="margin-left: 8px;"
							 v-model="item.rangeStart"
							 placeholder="开始时间"
							 type="datetime"
							 format="hh:mm:ss"
							 value-format="hh:mm:ss"
						   />
					<el-date-picker
							 v-if="item.ruleId == 12 && item.sourceColumnType == 'java.sql.Time'"
							 style="margin-left: 8px;"
							 v-model="item.rangeEnd"
							 placeholder="结束时间"
							 type="datetime"
							 format="hh:mm:ss"
							 value-format="hh:mm:ss"
						  />
					<el-date-picker
							 v-if="item.ruleId == 12 && item.sourceColumnType == 'java.sql.Date'"
							 style="margin-left: 8px;"
							 v-model="item.rangeStart"
							 type="date"
							 placeholder="开始时间"
							 format="YYYY-MM-DD"
							 value-format="YYYY-MM-DD"
						   />
					<el-date-picker
							 v-if="item.ruleId == 12 && item.sourceColumnType == 'java.sql.Date'"
							 style="margin-left: 8px;"
							 v-model="item.rangeEnd"
							 type="date"
							 placeholder="结束时间"
							 format="YYYY-MM-DD"
							 value-format="YYYY-MM-DD"
						  />
					<el-input v-if="item.ruleId == 12 && item.sourceColumnType != 'java.sql.Timestamp' && item.sourceColumnType != 'java.sql.Time' && item.sourceColumnType != 'java.sql.Date'"  v-model="item.rangeStart" placeholder="开始值" style="margin-left: 8px;width: 200px;"></el-input>
					<el-input v-if="item.ruleId == 12 && item.sourceColumnType != 'java.sql.Timestamp' && item.sourceColumnType != 'java.sql.Time' && item.sourceColumnType != 'java.sql.Date'"  v-model="item.rangeEnd" placeholder="结束值" style="margin-left: 8px;width: 200px;"></el-input>
					<el-input-number v-if="item.ruleId == 10"  v-model="item.timelyNum" :min="1" :max="9999" style="margin-left: 8px;width: 200px;"></el-input-number>
					<fast-select v-if="item.ruleId == 10" v-model="item.timelyType" dict-type="timely_type" placeholder="及时性类型"></fast-select>
					<el-input-number v-if="item.ruleId == 7"  v-model="item.dataLength" :min="1" :max="9999" style="margin-left: 8px;width: 200px;"></el-input-number>
					<el-input v-if="item.ruleId == 11"  v-model="item.regexVal" placeholder="正则表达式" style="margin-left: 8px;width: 200px;"></el-input>
					<el-button type="danger" size="small" style="margin-left: 8px;" @click="deleteConfig(index)">删除</el-button>
				</div>
			</div>
	    </el-form>
		<template #footer>
			<el-button @click="visible = false">取消</el-button>
			<el-button type="primary" @click="submitHandle()">确定</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus/es'
import { useQualityConfigApi, useQualityConfigSubmitApi, listQualityRuleApi } from '@/api/data-governance/qualityConfig'
import { listChildApi, listDbApi, listColumnApi } from '@/api/data-governance/metadata'

//获取质量规则列表
onMounted(()=>{
	listQualityRuleApi().then(res => {
		qualityRuleList.value = res.data
	})
	listDbApi().then(res=> {
		metaTableList.value = res.data
	})
})

const emit = defineEmits(['refreshDataList'])

const visible = ref(false)
const dataFormRef = ref()

const dataForm = reactive({
	name: '',
	categoryId: '',
	ruleId: '',
	dataProv: '',
	qualityType: '',
	sourceTableMetaId: '',
	sourceTableName: '',
	sourceTableRemark: '',
	sourceTablePk: '',
	sourceTablePkRemark: '',
	sourceTablePkType: '',
	taskType: '',
	cron: '',
	dutyUser: '',
	dutyPhone: '',
	dutyEmail: '',
	note: '',
	columnConfig: []
})

const qualityRuleList = ref([])

const props = {
  label: 'name',
  children: 'children',
  isLeaf: 'leaf',
  disabled: 'disabled'
}
const metaTableList = ref([])
const metaColumnList = ref([])

const init = (id?: number, categoryId: number) => {
	visible.value = true
	dataForm.id = ''
	
	// 重置表单数据
	if (dataFormRef.value) {
		dataFormRef.value.resetFields()
	}
	dataForm.categoryId = categoryId

	if (id) {
		getQualityConfig(id)
	}
}

const getQualityConfig = (id: number) => {
	dataForm.columnConfig = []
	metaColumnList.value = []
	useQualityConfigApi(id).then(res => {
		Object.assign(dataForm, res.data)
		listColumnApi(dataForm.sourceTableMetaId).then(res=>{
			metaColumnList.value = res.data
		})
	})
}

const dataRules = ref({
	name:  [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	qualityType:  [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	sourceTableMetaId:  [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	sourceTablePk:  [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	taskType:  [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	cron:  [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	dutyUser:  [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	dutyPhone:  [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	dutyEmail:  [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})

const sourceTableChange = (data, node) => {
	if(data && data.metamodelId == 3) {
		dataForm.sourceTableName = data.code
		dataForm.sourceTableRemark = data.name
		listColumnApi(data.id).then(res=>{
			metaColumnList.value = res.data
		})
	}
}

const sourcePkChange = (data, node) => {
	if(data) {
		dataForm.sourceTablePk = data.value
		dataForm.sourceTablePkRemark = data.label
		dataForm.sourceTablePkType = data.attributes.filedTypeClassName
	}
}

const sourceColumnChange = (data, node) => {
	if(data) {
		setTimeout(()=>{
			for(var i in dataForm.columnConfig) {
				var column = dataForm.columnConfig[i]
				if(data.value == column.sourceColumn) {
					column.sourceColumnRemark = data.label
					column.sourceColumnType = data.attributes.filedTypeClassName
				}
			}
		},100)
	}
}



const addConfig = () => {
	dataForm.columnConfig.push({
		ruleId: '',
		sourceColumn: '',
		sourceColumnRemark: '',
		sourceColumnType: '',
		rangeStart: '',
		rangeEnd: '',
		timelyNum: 1,
		timelyType: 3,
		regexVal: '',
		dataLength: 1,
	})
}
	
const deleteConfig = (index) => {
	dataForm.columnConfig.splice(index, 1);
}

// 表单提交
const submitHandle = () => {
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}
		dataForm.cron = dataForm.taskType == 2 ? dataForm.cron : null
		for(var i in dataForm.columnConfig) {
			var column = dataForm.columnConfig[i]
			if(!column.sourceColumn) {
				ElMessage.warning("请补全规则配置")
				return
			}
			if(!column.ruleId) {
				ElMessage.warning("请补全规则配置")
				return
			}
			if(column.ruleId == 12 && (!column.rangeStart || !column.rangeEnd)) {
				ElMessage.warning("请补全规则配置")
				return
			}
			if(column.ruleId == 7 && !column.dataLength) {
				ElMessage.warning("请补全规则配置")
				return
			}
			if(column.ruleId == 10 && !column.timelyNum) {
				ElMessage.warning("请补全规则配置")
				return
			}
			if(column.ruleId == 11 && !column.regexVal) {
				ElMessage.warning("请补全规则配置")
				return
			}
		}
		useQualityConfigSubmitApi(dataForm).then(() => {
			ElMessage.success({
				message: '操作成功',
				duration: 500,
				onClose: () => {
					visible.value = false
					emit('refreshDataList')
				}
			})
		})
	})
}


defineExpose({
	init
})
</script>
