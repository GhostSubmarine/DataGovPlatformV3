<template>
	<el-dialog v-model="visible" :title="!dataForm.id ? '挂载资源' : '修改'" :close-on-click-modal="false" width="70%">
		<el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="100px" @keyup.enter="submitHandle()">
			<el-form-item label="资源类型" prop="mountType" label-width="auto">
				<fast-select v-model="dataForm.mountType" dict-type="mount_type" placeholder="资源类型" clearable ></fast-select>
			</el-form-item>
			<el-form-item label="选择库表" prop="treeId" label-width="auto" v-if="dataForm.mountType == 1">
				<el-tree-select check-strictly v-model="dataForm.treeId" :props="props" :data="metadataList" filterable clearable @node-click="dbClick">
					<template #default="{ node, data }">
						 <div>
							 <span>
								 <!-- 如果是目录-->
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
			<el-form-item label="选择api" prop="treeId" label-width="auto" v-if="dataForm.mountType == 2">
				<el-tree-select v-model="dataForm.treeId" :props="props" :data="apiGroups" filterable clearable @node-click="apiClick">
					<template #default="{ node, data }">
						 <div>
							 <span>
								 <!-- 如果是目录-->
								 <img v-if="data.type=='1'" src="/src/assets/folder.png"/>
								 <img v-if="data.type=='2'" src="/src/assets/api.png"/>
								 <span style="margin-left: 8px;">{{ data.name }}</span>
							 </span>
						 </div>
					</template>
				</el-tree-select>
			</el-form-item>
			<el-form-item label="选择文件" prop="treeId" label-width="auto" v-if="dataForm.mountType == 3">
				<el-tree-select v-model="dataForm.treeId" :props="props" :data="fileCategories" filterable clearable @node-click="fileClick">
					<template #default="{ node, data }">
						 <div>
							 <span>
								 <!-- 如果是目录-->
								 <img v-if="data.type=='0'" src="/src/assets/folder.png"/>
								 <img v-if="data.type=='1'" src="/src/assets/file.png"/>
								 <span style="margin-left: 8px;">{{ data.name }}</span>
							 </span>
						 </div>
					</template>
				</el-tree-select>
			</el-form-item>
	    </el-form>
		<!-- api分页 -->
		<div v-if="dataForm.mountType == 2 && apiPageShow">
			<ApiMount ref="apiMountRef"></ApiMount>
		</div>
		<!-- 文件分页 -->
		<div v-if="dataForm.mountType == 3 && filePageShow">
			<FileMount ref="fileMountRef"></FileMount>
		</div>
		<template #footer>
			<el-button @click="visible = false">取消</el-button>
			<el-button type="primary" @click="submitHandle()">确定</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted,provide } from 'vue'
import { ElMessage } from 'element-plus/es'
import { useResourceMountApi, useResourceMountSubmitApi } from '@/api/data-assets/resourceMount'
import { listDbApi } from '@/api/data-governance/metadata'
import { useCatalogueListApi} from '@/api/data-service/apiGroup'
import { listFileCategoryApi } from '@/api/data-integrate/fileCategory'
import ApiMount from './api-mount.vue'
import FileMount from './file-mount.vue'

onMounted(()=>{
	listDbApi().then(res=> {
		metadataList.value = res.data
	})
	useCatalogueListApi().then(res=>{
		apiGroups.value = res.data
	})
	listFileCategoryApi().then(res => {
		fileCategories.value = res.data
	})
})

const emit = defineEmits(['refreshDataList'])

const visible = ref(false)
const dataFormRef = ref()

const metadataList = ref([])
const apiGroups = ref([])
const fileCategories = ref([])

const props = {
  label: 'name',
  children: 'children',
  isLeaf: 'leaf',
  disabled: 'disabled'
}

const dataForm = reactive({
	mountType: '',
	treeId: '',
	mountId: '',
	mountName: '',
})

const init = (id?: number, resourceId: number) => {
	visible.value = true
	dataForm.id = ''

	// 重置表单数据
	if (dataFormRef.value) {
		dataFormRef.value.resetFields()
	}
	dataForm.resourceId = resourceId
	apiPageShow.value = false
	if (id) {
		getResourceMount(id)
	}
}

const getResourceMount = (id: number) => {
	useResourceMountApi(id).then(res => {
		Object.assign(dataForm, res.data)
	})
}

const dataRules = ref({
	mountType: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	treeId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})

const apiPageShow = ref(false)
const apiMountRef = ref()
const apiMountInfo = ref()
provide("apiMountInfo", apiMountInfo)
const apiClick = (e, data, n, t) => {
	console.log(data.data)
	if(data.data.type == '2') {	
		//显示分页
		apiPageShow.value = true
		setTimeout(()=>{
			apiMountRef.value.init(data.data.id,data.data.path)
		},500)
	} else {
		apiPageShow.value = false
	}
} 

const filePageShow = ref(false)
const fileMountRef = ref()
const fileMountInfo = ref()
provide("fileMountInfo", fileMountInfo)
const fileClick = (e, data, n, t) => {
	console.log(data.data)
	if(data.data.type == '1') {	
		//显示分页
		filePageShow.value = true
		setTimeout(()=>{
			fileMountRef.value.init(data.data.id,data.data.path)
		},500)
	} else {
		filePageShow.value = false
	}
} 

const dbMountInfo = ref()
const dbClick = (e, data, n, t) => {
	console.log(data.data)
	if(!data.data.disabled) {
		dbMountInfo.value = data.data
	}
} 

// 表单提交
const submitHandle = () => {
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}
		if(dataForm.mountType == 1) {
			dataForm.mountId = dataForm.treeId
			dataForm.mountName = dbMountInfo.value.path
		} else if(dataForm.mountType == 2) {
			if(!apiMountInfo.value) {
				ElMessage.warning("请单击列表项选择要挂载的api")
				return false
			} else {
			  dataForm.mountId = apiMountInfo.value.id
			  dataForm.mountName = apiMountInfo.value.parentPath + "/" + apiMountInfo.value.name
			}
		} else if(dataForm.mountType == 3) {
			if(!fileMountInfo.value) {
				ElMessage.warning("请单击列表项选择要挂载的文件")
				return false
			} else {
			  dataForm.mountId = fileMountInfo.value.id
			  dataForm.mountName = fileMountInfo.value.parentPath + "/" + fileMountInfo.value.name
			}
		}
		useResourceMountSubmitApi(dataForm).then(() => {
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
