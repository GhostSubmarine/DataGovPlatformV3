<template>
	<el-dialog v-model="visible" :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false">
		<el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="100px" @keyup.enter="submitHandle()">
			<el-form-item prop="orgId" label="所属机构">
				<el-tree-select
					clearable
					v-model="dataForm.orgId"
					:data="orgList"
					check-strictly
					value-key="id"
					:props="{ label: 'name', children: 'children' }"
					style="width: 100%"
				/>
			</el-form-item>
			<el-form-item label="父级目录" prop="parentPath">
				<el-input disabled v-model="dataForm.parentPath" placeholder=""></el-input>
			</el-form-item>
			<el-form-item label="名称" prop="name">
				<el-input v-model="dataForm.name" placeholder="名称"></el-input>
			</el-form-item>
			<el-form-item label="编码" prop="code">
				<el-input v-model="dataForm.code" placeholder="编码"></el-input>
			</el-form-item>
			<el-form-item label="类型" prop="ifLeaf" v-if="dataForm.parentId != 0">
				<el-select :disabled="!!dataForm.id" v-model="dataForm.ifLeaf" placeholder="类型">
					<el-option :key="1" label="目录" :value="1"/>
					<el-option :key="0" label="元数据" :value="0"/>
				</el-select>
			</el-form-item>
			<el-form-item label="所属元模型" prop="metamodelId" v-if="dataForm.ifLeaf == 0">
				<el-tree-select :disabled="!!dataForm.id" v-model="dataForm.metamodelId" :data="metaModelList" clearable @change="metaModelChange">
					<template #default="{ node, data }">
						 <div>
							 <span>
								 <img v-if="data.icon=='/src/assets/folder.png'" src="/src/assets/folder.png"/>
								 <img v-if="data.icon=='/src/assets/database.png'" src="/src/assets/database.png"/>
								 <img v-if="data.icon=='/src/assets/table.png'" src="/src/assets/table.png"/>
								 <img v-if="data.icon=='/src/assets/column.png'" src="/src/assets/column.png"/>
								 <img v-if="data.icon=='/src/assets/model.png'" src="/src/assets/model.png"/>
								 <span style="margin-left: 8px;">{{ data.name }}</span>
							 </span>
						 </div>
					</template>
				</el-tree-select>
			</el-form-item>
			<el-form-item label="序号" prop="orderNo">
				<el-input-number v-model="dataForm.orderNo" :max='9999' placeholder="序号"></el-input-number>
			</el-form-item>
			<el-form-item label="描述" prop="description">
				<el-input type="textarea" v-model="dataForm.description"></el-input>
			</el-form-item>
		</el-form>
		<el-form v-if="!!dataForm.metamodelId && dataForm.ifLeaf == 0" ref="dataPropertyFormRef" :model="dataPropertyForm" :rules="dataPropertyRules" label-width="100px">
			<el-divider content-position="left">元数据属性</el-divider>
			<div v-show="hasProperty">
				<el-form-item v-for="(item, index) in metaProperties" :label="item.name" :prop="item.code">
					<el-input @change="propertyChange($event,item)" v-model="item.value" :placeholder="item.name"></el-input>
				</el-form-item>
			</div>
			<div v-show="!hasProperty">
				<el-result title="无属性" sub-title="没有需要添加的属性信息"></el-result>
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
import { listTreeApi } from '@/api/data-governance/metamodel'
import { useMetadataApi, useMetadataSubmitApi, listMetamodelPropertyApi } from '@/api/data-governance/metadata'
import { useOrgListApi } from '@/api/sys/orgs'

onMounted(()=>{
	//加载元模型树
	listTreeApi().then(res => {
		metaModelList.value = res.data
	})
})


const emit = defineEmits(['refreshDataList'])

const visible = ref(false)
const dataFormRef = ref()
const dataPropertyFormRef = ref()
const orgList = ref([])



const metaModelList = ref([])

const value = ref()

const dataForm = reactive({
	orgId: '',
	parentId: '',
	parentPath: '',
	path: '',
	name: '',
	code: '',
	ifLeaf: 1,
	metamodelId: '',
	orderNo: 0,
	description: ''
})

const dataPropertyForm = reactive({
})

const init = (id?: number, parentId: any, parentPath: any) => {
	visible.value = true
	
	dataForm.id = ''
	// 重置表单数据
	if (dataFormRef.value) {
		dataFormRef.value.resetFields()
	}
	dataForm.metamodelId = ''
	if (dataPropertyForm.value) {
		dataPropertyForm.value.resetFields()
	}
	dataForm.ifLeaf = dataForm.parentId == 0 ? 1 : dataForm.ifLeaf
	dataForm.parentId = parentId
	dataForm.parentPath = parentPath
	
	if(parentId) {
		useMetadataApi(parentId).then(res => {
			if(res.data) {
				//获取部门列表
				useOrgListApi(res.data.orgId).then(res => {
					orgList.value = res.data
				})
			}
		})
	} else {
		//获取部门列表
		useOrgListApi().then(res => {
			orgList.value = res.data
		})
	}
	
	
	if (id) {
		getMetadata(id)
	}
}

const getMetadata = (id: number) => {
	useMetadataApi(id).then(res => {
		Object.assign(dataForm, res.data)
		metaProperties.value = res.data.properties
		if(metaProperties.value.length > 0) {
			hasProperty.value = true
		} else {
			hasProperty.value = false
		}
		buildPropertyRule()
	})
}

const dataRules = ref({
	orgId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	name: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	code: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	ifLeaf: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	metamodelId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	orderNo: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})

const dataPropertyRules = ref({
})

const metaProperties = ref([])
const hasProperty = ref(false)
const metaModelChange = (metaModelId) => {
	if(metaModelId) {
		//获取元数据属性
		listMetamodelPropertyApi(metaModelId).then(res=>{
			//console.log(res.data)
			metaProperties.value = res.data
			if(metaProperties.value.length > 0) {
				hasProperty.value = true
			} else {
				hasProperty.value = false
			}
			buildPropertyRule()
		})
	}
}

const buildPropertyRule = () => {
	for(var i in metaProperties.value) {
		var property = metaProperties.value[i]
		property.value = property.value ? property.value : ''
		dataPropertyForm[property.code] = property.value ? property.value : ''
		//console.log(property)
		//不可为空，添加校验规则
		if(property.nullable == 0) {
			let ruleList = []
			let checkRule = {}
			checkRule.required = true
			checkRule.message = '必填项不能为空'
			checkRule.trigger = 'blur'
			ruleList.push(checkRule)
			dataPropertyRules.value[property.code] = ruleList
		}
	}
}

//输入框值改变
const propertyChange = (val,item) => {
	dataPropertyForm[item.code] = val
	//console.log(dataPropertyForm[item.code])
}

// 表单提交
const submitHandle = async () => {
	let validate = true
	await dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			validate = false
			return false
		}
	})
	if(dataPropertyFormRef.value) {
		await dataPropertyFormRef.value.validate((valid: boolean) => {
			if (!valid) {
				validate = false
				return false
			}
		})
	}
	if(validate) {
		realSubmit()
	}
}

const realSubmit = () => {
	dataForm.metamodelId = dataForm.ifLeaf == 1? '' : dataForm.metamodelId
	dataForm.properties = metaProperties.value
	useMetadataSubmitApi(dataForm).then(() => {
		ElMessage.success({
			message: '操作成功',
			duration: 500,
			onClose: () => {
				visible.value = false
				emit('refreshDataList')
			}
		})
	})
}


defineExpose({
	init
})
</script>


<style>
	/* .el-tree-select__popper .el-select-dropdown__item {
		
	} */
</style>
