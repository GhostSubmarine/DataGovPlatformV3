<template>
	<el-dialog v-model="visible" :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false" width="60%">
		<el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="100px" @keyup.enter="submitHandle()">
			<el-divider><span style="font-size: 16px">基础信息</span></el-divider>
			<el-form-item label="标签类型" prop="typeId" label-width="auto">
				<el-select v-model="dataForm.typeId"
						  clearable
						  filterable
				          placeholder="请选择">
				  <el-option v-for="(item,index) in labelTypeList"
				             :key="item.id"
				             :label="`[${item.id}]${item.name}`"
				             :value="item.id">
				  </el-option>
				</el-select>
			</el-form-item><br>
			<el-form-item label="标签实体" prop="labelModelId" label-width="auto">
				<el-select v-model="dataForm.labelModelId"
						  clearable
						  filterable
				          placeholder="请选择"
						  @change="modelChange"
						  >
				  <el-option v-for="(item,index) in labelModelList"
				             :key="item.id"
				             :label="`[${item.id}]${item.name}`"
				             :value="item.id">
				  </el-option>
				</el-select>
			</el-form-item><br>
			<el-form-item label="名称" prop="name" label-width="auto">
				<el-input v-model="dataForm.name" placeholder="名称"></el-input>
			</el-form-item><br>
			<el-form-item label="颜色" prop="color" label-width="auto">
				<el-color-picker v-model="dataForm.color" size="large"/>
			</el-form-item><br>
			<el-form-item label="排序号" prop="orderNo" label-width="auto">
				<el-input-number v-model="dataForm.orderNo" :max='9999' placeholder="排序号"></el-input-number>
			</el-form-item><br>
			<el-form-item label="说明" prop="description" label-width="auto">
				<el-input type="textarea" :rows="2" v-model="dataForm.description" placeholder="说明"></el-input>
			</el-form-item><br>
			<div v-show="!!dataForm.labelModelId">
				<el-divider><span style="font-size: 16px">规则配置</span></el-divider>
				<el-button type="success" @click="addConfig" size="small">添加规则</el-button>
				<div style="margin-top: 10px;" v-for="(item,index) in dataForm.conditionConfig">
					<el-select v-model="item.relType"
							  clearable
							  filterable
							  :disabled = "index==0"
					          :placeholder="index==0 ? ' ' : '请选择关联方式'"
							  >
					   <el-option key="1" label="并且" value=" AND "></el-option>
					   <el-option key="1" label="或者" value=" OR "></el-option>
					</el-select>
					<el-select v-model="item.fieldName"
							  clearable
							  filterable
					          placeholder="请选择属性"
							  style="margin-left: 8px;"
							  @change="fieldChange"
							  >
					  <el-option v-for="(item,index) in modelColumns"
					             :key="item.fieldName"
					             :label="item.remarks?`${item.fieldName}(${item.remarks})`:`${item.fieldName}`"
					             :value="item.fieldName">
					  </el-option>
					</el-select>
					<el-select v-model="item.condition"
							  clearable
							  filterable
							  placeholder="请选择条件"
							  style="margin-left: 8px;"
							  >
					   <el-option key="1" label="等于(=)" value="="></el-option>
					   <el-option key="2" label="大于(>)" value=">"></el-option>
					   <el-option key="3" label="大于等于(>=)" value=">="></el-option>
					   <el-option key="4" label="小于(<)" value="<"></el-option>
					   <el-option key="5" label="小于等于(<=)" value="<="></el-option>
					   <el-option key="6" label="包含(LIKE)" value=" LIKE "></el-option>
					   <el-option key="7" label="不包含(NOT LIKE)" value=" NOT LIKE "></el-option>
					   <el-option key="8" label="为空(IS NULL)" value=" IS NULL "></el-option>
					   <el-option key="9" label="不为空(IS NOT NULL)" value=" IS NOT NULL "></el-option>
					</el-select>
					<el-date-picker
							 v-if="item.filedTypeClassName == 'java.sql.Timestamp' && item.condition != ' IS NULL ' && item.condition != ' IS NOT NULL '"	
							 style="margin-left: 8px;"
							 v-model="item.conditionVal"
							 type="datetime"
							 :placeholder="item.remarks?`${item.fieldName}(${item.remarks})`:`${item.fieldName}`"
							 format="YYYY-MM-DD hh:mm:ss"
							 value-format="YYYY-MM-DD hh:mm:ss"
					     />
				   <el-date-picker
						 v-if="item.filedTypeClassName == 'java.sql.Time' && item.condition != ' IS NULL ' && item.condition != ' IS NOT NULL '"	
						 style="margin-left: 8px;"
						 v-model="item.conditionVal"
						 :placeholder="item.remarks?`${item.fieldName}(${item.remarks})`:`${item.fieldName}`"
						 type="datetime"
						 format="hh:mm:ss"
						 value-format="hh:mm:ss"
					  />
					  <el-date-picker
						 v-if="item.filedTypeClassName == 'java.sql.Date' && item.condition != ' IS NULL ' && item.condition != ' IS NOT NULL '"
						 style="margin-left: 8px;"
						 v-model="item.conditionVal"
						 type="date"
						 :placeholder="item.remarks?`${item.fieldName}(${item.remarks})`:`${item.fieldName}`"
						 format="YYYY-MM-DD"
						 value-format="YYYY-MM-DD"
					  />
					<el-input v-if="item.filedTypeClassName != 'java.sql.Timestamp' && item.filedTypeClassName != 'java.sql.Time' && item.filedTypeClassName != 'java.sql.Date' && item.condition != ' IS NULL ' && item.condition != ' IS NOT NULL '" v-model="item.conditionVal" :placeholder="item.remarks?`${item.fieldName}(${item.remarks})`:`${item.fieldName}`" style="margin-left: 8px;width: 260px;"></el-input>
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
import { reactive, ref, inject } from 'vue'
import { ElMessage } from 'element-plus/es'
import { useLabelApi, useLabelSubmitApi, listColumnByModelIdApi } from '@/api/data-governance/label'

const labelTypeList = inject("labelTypeList")
const labelModelList = inject("labelModelList")
const categoryId = inject("categoryId")

const emit = defineEmits(['refreshDataList'])

const visible = ref(false)
const dataFormRef = ref()

const dataForm = reactive({
	name: '',
	orderNo: 0,
	description: '',
	color: '#409EFF',
	categoryId: '',
	typeId: '',
	labelModelId: '',
	conditionConfig: [
	]
})

const init = (id?: number) => {
	visible.value = true
	dataForm.id = ''

	// 重置表单数据
	if (dataFormRef.value) {
		dataFormRef.value.resetFields()
	}

	if (id) {
		getLabel(id)
	}
}



const modelColumns = ref([])

const fieldChange = (fieldName) => {
	setTimeout(()=>{
		for(var i in dataForm.conditionConfig) {
			if(fieldName == dataForm.conditionConfig[i].fieldName) {
				 for(var j in modelColumns.value) {
					if(fieldName == modelColumns.value[j].fieldName) {
						dataForm.conditionConfig[i].remarks = modelColumns.value[j].remarks
						dataForm.conditionConfig[i].filedTypeClassName = modelColumns.value[j].filedTypeClassName
					}
				 }
			}
		}
	},100)
	//console.log(dataForm.conditionConfig)
}

const modelChange = (id: number) => {
	modelColumns.value = []
	dataForm.conditionConfig = []
	if(id) {
		listColumnByModelIdApi(id).then(res=> {
			modelColumns.value = res.data
		})
	}
}

const addConfig = () => {
	dataForm.conditionConfig.push({fieldName:'',remarks:'',condition:'',conditionVal:'',relType: '',filedTypeClassName:''})
}

const deleteConfig = (index) => {
	 dataForm.conditionConfig.splice(index, 1);
}

const getLabel = (id: number) => {
	useLabelApi(id).then(res => {
		Object.assign(dataForm, res.data)
		listColumnByModelIdApi(dataForm.labelModelId).then(res=> {
			modelColumns.value = res.data
		})
	})
}

const dataRules = ref({
	name: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	color: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	typeId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	labelModelId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})

// 表单提交
const submitHandle = () => {
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}

		dataForm.categoryId = categoryId.value
		//判断配置
		for(var i in dataForm.conditionConfig) {
			var config = dataForm.conditionConfig[i]
			if(!config.fieldName || !config.condition || (!config.relType && i!=0)) {
				ElMessage.warning("请补全规则配置")
				return
			}
		}
		useLabelSubmitApi(dataForm).then(() => {
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
