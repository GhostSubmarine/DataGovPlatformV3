<template>
	<el-container>
		<el-aside width="22%">
			<el-card body-style="height: calc(100vh - 170px )">
				<el-button type="primary" @click="appendRoot()">添加根节点</el-button>
				<br><br>
				<div class="dataFileDiv">
					<el-tree
							:data="categoryData"
							node-key="id"
							:expand-on-click-node="false"
							default-expand-all
							@node-click="nodeClick"
							>
							<template #default="{ node, data }">
								<span class="dataFile-tree-node">
									<span v-if="data.type==0"><img src="/src/assets/folder.png"/>&nbsp;&nbsp;{{ node.label }}</span>
									<span v-if="data.type==1"><img src="/src/assets/file.png"/>&nbsp;&nbsp;{{ node.label }}</span>
									<span>
										<a v-if="data.type==0" style="margin-left: 8px" v-auth="'data-integrate:fileCategory:save'" @click="append(data)"><el-icon><CirclePlus /></el-icon></a>
										<a style="margin-left: 8px" v-auth="'data-integrate:fileCategory:update'" @click="edit(node, data)"><el-icon><Edit /></el-icon></a>
										<a style="margin-left: 8px" v-auth="'data-integrate:fileCategory:delete'" @click="remove(node, data)"><el-icon><Delete /></el-icon></a>
									</span>
								</span>
							</template>
						</el-tree>
				</div>
			</el-card>
		</el-aside>
		<el-container>
			<el-header>
				<el-card body-style="height: calc(100vh - 170px )">
					<file-index ref="fileIndexRef" v-if="fileIndexView"></file-index>
				</el-card>
			</el-header>
		</el-container>
	</el-container>
	<!-- 弹窗, 新增 / 修改 -->
	<add-or-update ref="addOrUpdateRef" @refreshDataList="getTreeList"></add-or-update>
</template>

<script setup lang="ts" name="Data-integrateFile-categoryIndex">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus/es'
import AddOrUpdate from './add-or-update.vue'
import FileIndex from '../file/index.vue'
import { listFileCategoryApi, deleteFileCategoryApi } from '@/api/data-integrate/fileCategory'

interface Tree {
  id: number
  label: string
	path: string
	parentPath: string
	projectId: number
	orderNo: number
  children?: Tree[]
}

const categoryData = ref<Tree[]>([
])

/* 初始化数据 */
onMounted(()=>{
	listFileCategoryApi().then(res => {
		categoryData.value = res.data
	})
})

const getTreeList = () => {
	listFileCategoryApi().then(res => {
		categoryData.value = res.data
	})
}

const fileIndexRef = ref()
const fileIndexView = ref(false)
const nodeClick = (data) => {
	if(data.type == 0) {
		fileIndexView.value = false
	} else {
		fileIndexView.value = true
		setTimeout(()=>{
			fileIndexRef.value.init(data.id, data.path, data.projectId)
		},100)
		
	}
}

const addOrUpdateRef = ref()
/* 添加根节点 */
const appendRoot = () => {
	addOrUpdateRef.value.init(null, 0, '', null) 
}
//添加
const append = (data) => {
	console.log(data)
	addOrUpdateRef.value.init(null, data.id, data.path, data.projectId) 
}
//编辑
const edit = (node, data) => {
	addOrUpdateRef.value.init(data.id, data.parentId, data.parentPath, data.projectId) 
}
//移除
const remove = (node, data) => {
	ElMessageBox.confirm('确定进行删除操作?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	}).then(() => {
			deleteFileCategoryApi(data.id).then(() => {
					ElMessage.success('删除成功')
					getTreeList()
				})
			})
}
</script>

<style>
	
.dataFileDiv .el-tree-node__content {
  height: 35px;
}
.dataFile-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  padding-right: 8px;
}
</style>