<template>
	<el-card body-style="height: calc(100vh - 170px )" @click="OptionCardClose($event)">
		<div>
		  <SideLayout class="fp-content" left-title="主数据目录" right-title="主数据模型">
			<div slot="left-title" class="rm-left-title">
			  <span>主数据目录</span>
			</div>
			<template #left>
				<div>
				  <el-scrollbar style="height: calc(100vh - 220px )">
				  	<div style="height: 100%;" class="masterDataTreeDiv">
				  		<div>
				  			<el-input v-model="filterNodeText" placeholder="search" />
				  			<br><br>
				  		</div>
				  		<div>
				  			<el-button type="primary" @click="appendRoot">添加根目录</el-button><br><br>
				  		</div>
				  		<el-tree
				  		 ref="treeRef"
				  		 :data="treeList"
				  		 @node-contextmenu="ckRightOption"
				  		 @node-click="treeNodeCk"
				  		 default-expand-all
				  		 node-key="id"
				  		 :filter-node-method="filterNode"
				  	 >
				  			 <template #default="{ node, data }">
				  				 <div class="masterData-tree-node">
				  					 <span>
				  						 <img v-if="data.type==0" src="/src/assets/folder.png"/>
				  						 <img v-if="data.type==1" src="/src/assets/assets.png"/>
				  						 <span style="margin-left: 8px;">{{ data.name }}</span>
				  					 </span>
				  				 </div>
				  			 </template>
				  		</el-tree>
				  	</div>
				  </el-scrollbar>
				</div>
			</template>
			<template #right>
				<div v-show="infoView" class="master-data-right" v-loading="detailLoading">
				  <div class="action_part">
				    <el-button v-if="!isDetail" type="primary" @click="toSave">保存</el-button>
				    <template v-if="isDetail">
				      <el-button v-if="!tableInfo.status" type="primary" @click="toUpdate">编辑</el-button>
				      <el-button v-if="!tableInfo.status" type="danger" @click="toDelete">删除</el-button>
				      <el-button v-if="!tableInfo.status" type="primary" @click="toRelease">发布</el-button>
				      <el-button v-else type="primary" @click="toCancelRelease">取消发布</el-button>
				    </template>
					<el-button type="primary" @click="toCancel">取消</el-button>
				  </div>
				  <div class="dsr-part">
				    <div class="info-part">
				      <h6>表信息</h6>
					  <el-form :model="tableInfo" label-width="100px" :rules="tableInfoRules" ref="tableInfoRef">
						<el-row>
							<el-col :span="2"></el-col>
							<el-col :span="7">
							  <el-form-item label="表名" prop="tableName">
								<el-input v-if="!isDetail" v-model="tableInfo.tableName" placeholder="表名"></el-input>
								<span v-else>{{tableInfo.tableName}}</span>
							  </el-form-item>
							</el-col>
							<el-col :span="7">
							  <el-form-item label="中文名称" prop="tableCn">
								<el-input v-if="!isDetail" v-model="tableInfo.tableCn" placeholder="中文名称"></el-input>
								<span v-else>{{tableInfo.tableCn}}</span>
							  </el-form-item>
							</el-col>
					  	</el-row>
						<el-row v-if="tableInfo.status && isDetail">
							<el-col :span="2"></el-col>
							<el-col :span="7">
								<el-form-item label="发布人" prop="releaseUserId">
									<span>{{getNameByUserId(store.appStore.sysUserList, tableInfo.releaseUserId)}}</span>
								</el-form-item>
							</el-col>
							<el-col :span="7">
								<el-form-item label="发布时间" prop="releaseTime">
									<span>{{tableInfo.releaseTime}}</span>
								</el-form-item>
							</el-col>
						</el-row>
						<el-row>
							<el-col :span="2"></el-col>
							<el-col :span="7">
								<el-form-item label="备注" prop="description">
									<el-input v-if="!isDetail" type="textarea" :rows="3" v-model="tableInfo.description" placeholder="备注"></el-input>
									<span v-else>{{tableInfo.description}}</span>
								</el-form-item>
							</el-col>
						</el-row>
					  </el-form>
				    </div>
				    <div class="info-part field-part">
				      <h6>字段管理</h6>
					  <div class="sheet-field">
						  <el-button v-if="!isDetail" type="text" @click="addField">添加字段</el-button>
						  <el-button v-if="!isDetail" style="margin-left: 10px" type="text" @click="showPickColumns"> 从已有表拾取字段</el-button>
					  </div>
					  <el-table :data="columns"  style="width: '100%'" :height="isDetail?'calc(100vh - 580px )':'calc(100vh - 605px )'" size="small">
					    <el-table-column align="center" show-overflow-tooltip props="name" label="字段名称" width="200">
					      <template #default="scope">
					        <el-input
							  v-if="!isDetail"
					          v-model="scope.row.name"
					          placeholder="字段名称" />
							<span v-else>{{scope.row.name}}</span>
					      </template>
					    </el-table-column>
					    <el-table-column align="center" label="数据类型" width="200">
					      <template #default="scope">
							<fast-select v-if="!isDetail" @change="dataTypeChagne(scope.row)" v-model="scope.row.fieldType" dict-type="field_type" placeholder="请选择"></fast-select>
							<span v-else>{{getDictLabel(store.appStore.dictList, 'field_type', scope.row.fieldType)}}</span>
						  </template>
					    </el-table-column>
					    <el-table-column align="center" label="长度" width="160">
					      <template #default="scope">
							<!-- 如果是3-日期 7-序列 8-大字段 9-日期 10-日期 11-默认 -->
							<div v-if="!isDetail">
								<el-input disabled v-if="scope.row.fieldType == 3 || scope.row.fieldType == 7 || scope.row.fieldType == 8 || scope.row.fieldType == 9 || scope.row.fieldType == 10 || scope.row.fieldType == 11"></el-input>
								<el-input v-else v-model="scope.row.fieldLength" />
							</div>
							<span v-else>{{scope.row.fieldLength}}</span>
					      </template>
					    </el-table-column>
					    <el-table-column align="center" label="小数位数" width="160">
					      <template #default="scope">
							  <div v-if="!isDetail">
								  <el-input v-if="scope.row.fieldType ==1 || scope.row.fieldType ==6" v-model="scope.row.sacle" />
								  <el-input disabled v-else></el-input>
							  </div>
							  <span v-else>{{ (scope.row.fieldType ==1 || scope.row.fieldType ==6) ? scope.row.sacle : '' }}</span>
						  </template>
					    </el-table-column>
					    <el-table-column align="center" label="可空" width="80">
					      <template #default="scope">
					        <el-checkbox v-model="scope.row.nullable" :disabled="isDetail" :true-label="1" :false-label="0" />
					      </template>
					    </el-table-column>
					    <el-table-column align="center" label="主键" width="80">
					      <template #default="scope">
					        <el-checkbox v-model="scope.row.pk" :true-label="1" :false-label="0" :disabled="isDetail" @change="pkChange(scope.row)" />
					      </template>
					    </el-table-column>
					    <el-table-column align="center" label="注释">
					      <template #default="scope">
							  <el-input v-if="!isDetail" v-model="scope.row.comment" placeholder="注释" />
							  <span v-else>{{ scope.row.comment }}</span>
						  </template>
					    </el-table-column>
					    <el-table-column v-if="!isDetail" align="center" label="操作" width="100">
					      <template #default="scope">
					        <el-button type="text" @click="deleteField(scope)">删除</el-button>
					      </template>
					    </el-table-column>
					  </el-table>
				    </div>
				  </div>
			    </div>
				<el-empty description="请选择左侧目录 获取详情" v-if="currentNode.type != 1"/>
			</template>
		  </SideLayout>
		</div>
	  <!-- 右键菜单 -->
	  <div :style="{'z-index': 9999, position: 'fixed',left: ckRightOptionData.optionCardX + 'px', 
	  				top: ckRightOptionData.optionCardY + 'px', width: '100px', background: 'white',
	  				 'box-shadow': '0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04)'}" 
	  				 v-show="ckRightOptionData.optionCardShow" id="option-button-group">
	  	<el-button v-show="ckRightOptionData.optionData.type == 0" @click="appendChild" class="option-card-button">添加子目录</el-button>
	  	<el-button @click="renameItem" class="option-card-button">修改</el-button>
	  	<el-button @click="deleteItem" class="option-card-button">删除</el-button>
	  </div>
	  
	  <add-or-update ref="addOrUpdateRef" @refreshDataList="getTreeList"></add-or-update>
	  
	  <el-dialog
	    :close-on-click-modal="false"
	    title="从已有表拾取字段"
	    v-model="pickField"
	    width="1000px"
	    append-to-body
	    class="sheet_field_column"
	    @close="chooseColumnCancel">
	    <div v-loading="pickColunmsLoading" style="height: 400px; overflow-y: auto; padding: 10px">
	      <div class="select_box">
	        <el-tag v-for="(item, i) in pickColumns" :key="i" closable @close="deleteTagColumns(i)">{{ item.name }}</el-tag>
	      </div>
	      <div>
	        <el-cascader
	          v-model="pickTableValue"
	          style="width: 100%"
	          clearable
	          :show-all-levels="true"
	          :props="{ ...defaultPickTableProps }"
	          :options="pickTableList"
	          @change="pickTableChange">
	          <template #default="{ node, data }">
	            <span>{{ data.name }}</span>
	          </template>
	        </el-cascader>
	      </div>
	      <el-table :data="pickTableColumns" style="width: 100%; margin-top: 10px" size="small" height="200px" @selection-change="pickColumnsSelectChange">
	        <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
	        <el-table-column align="center" props="name" label="字段名称">
	          <template #default="scope">{{ scope.row.name }}</template>
	        </el-table-column>
	        <el-table-column align="center" props="fieldType" label="类型">
	          <template #default="scope">{{ getDictLabel(store.appStore.dictList, 'field_type', scope.row.fieldType) }}</template>
	        </el-table-column>
	        <el-table-column align="center" props="fieldLength" label="长度">
	          <template #default="scope">{{ scope.row.fieldLength }}</template>
	        </el-table-column>
	        <el-table-column align="center" props="sacle" label="小数位数">
	          <template #default="scope">{{ (scope.row.fieldType ==1 || scope.row.fieldType ==6) ? scope.row.sacle : ''}}</template>
	        </el-table-column>
	        <el-table-column align="center" props="nullable" label="可空">
	          <template #default="scope">{{ scope.row.nullable ? '是' : '否' }}</template>
	        </el-table-column>
	        <el-table-column align="center" props="pk" label="主键">
	          <template #default="scope">{{ scope.row.pk ? '是' : '否' }}</template>
	        </el-table-column>
	        <el-table-column align="center" show-overflow-tooltip props="comment" label="注释">
	          <template #default="scope">{{ scope.row.comment }}</template>
	        </el-table-column>
	      </el-table>
	    </div>
		<template #footer>
			<div>
				<el-button @click="chooseColumnCancel">取 消</el-button>
				<el-button type="primary" @click="chooseColumnEnter">确 定</el-button>
			</div>
		</template>
	  </el-dialog>
	</el-card>
</template>

<script setup lang="ts" name="Data-governanceMaster-dataIndex">
import { useCrud } from '@/hooks'
import SideLayout from '@/components/side-layout/index.vue'
import AddOrUpdate from './add-or-update.vue'
import { reactive, ref, onMounted, watch } from 'vue'
import { listTreeApi,delTreeNodeApi } from '@/api/data-governance/masterDataCatalog'
import { getMiddleDbColumnsApi } from '@/api/data-governance/masterColumn'
import { saveMasterModelApi,updateMasterModelApi,getMasterModelApi,deleteMasterModelApi,releaseMasterModelApi,cancelReleaseMasterModelApi } from '@/api/data-governance/masterModel'
import { IHooksOptions } from '@/hooks/interface'
import { ElMessage, ElMessageBox } from 'element-plus/es'
import { listMiddleDbTreeApi } from '@/api/data-integrate/database'
import store from '@/store'
import { getDictLabel,getNameByUserId } from '@/utils/tool'

onMounted(()=>{
	getTreeList()
})

const addOrUpdateRef = ref()
const treeRef = ref()
const treeList = ref([])
const filterNodeText = ref('')
const detailLoading = ref(false)
const pickColunmsLoading = ref(false)
const isDetail = ref(false)

const tableInfoRef = ref()
const tableInfo = reactive({
	id: '',
	tableName: '',
	tableCn: '',
	description: ''
})

const tableInfoRules = ref({
	tableName: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	tableCn: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})

/**
 * 获取目录树
 */
const getTreeList = () => {
	listTreeApi().then(res=>{
		treeList.value = res.data
	})
}

watch(filterNodeText, (val) => {
	treeRef.value!.filter(val)
})

/**
 * 节点筛选
 */
const filterNode = (value: string, data: Tree) => {
	if (!value) return true
	return data.label.includes(value) || data.label.includes(value.toUpperCase()) || data.label.includes(value.toLowerCase())
}

/**
 * 添加作业目录根目录
 */
const appendRoot = () => {
	addOrUpdateRef.value.init(null,0,'')
}

/**
 * 添加目录树子菜单
 */
const appendChild = () => {
	let nodeData = ckRightOptionData.optionData
	addOrUpdateRef.value.init(null, nodeData.id, nodeData.path)
	OptionCardClose()
}
/**
 * 重命名
 */
const renameItem = () => {
	let nodeData = ckRightOptionData.optionData
	addOrUpdateRef.value.init(nodeData.id, nodeData.parentId, nodeData.parentPath)
	OptionCardClose()
}

/**
 删除目录
 */
const deleteItem = () => {
	let nodeData = ckRightOptionData.optionData
	OptionCardClose()
	ElMessageBox.confirm('确认删除吗?','提示', {
		confirmButtonText: '是',
		cancelButtonText: '否',
		type: 'warning'
	}).then(() => {
		delTreeNodeApi(nodeData.id).then(res=> {
			ElMessage.success("删除成功！")
			getTreeList()
		})
	})
}

const infoView = ref(false)
const currentNode = ref({})
const treeNodeCk = (e, data, n, t) => {
	//关闭右键菜单
	OptionCardClose()
	//如果是元模型
	console.log(data.data)
	if(data.data.type != 0) {
		infoView.value = true
		currentNode.value = data.data
		tableInfo.id = ''
		tableInfoRef.value.resetFields()
		columns.value = []
		//获取模型信息
		getMasterModelApi(data.data.id).then(res => {
			if(res.data) {
				Object.assign(tableInfo, res.data)
				columns.value = res.data.columns
				isDetail.value = true
			} else {
				isDetail.value = false
			}
		})
		
	} else {
		infoView.value = false
		currentNode.value = data.data
		//置空模型信息
		tableInfo.id = ''
		tableInfoRef.value.resetFields()
		columns.value = []
	}
} 

//字段模板
const fieldForm = {
  name: '',
  comment: '',
  fieldType: '2',
  fieldLength: '',
  sacle: '',
  nullable: 1,
  pk: 0
}

//模型的字段
const columns = ref([])

const pickField = ref(false)
//被拾取的字段
const pickColumns = ref([])
const pickTableValue = ref([])
const defaultPickTableProps = ref({
  value: 'name',
  children: 'children',
  label: 'name'
}) 
const pickTableList = ref([])
const pickTableColumns = ref([])


const dataTypeChagne = (row: any)=> {
	if(row.fieldType == 'dateTime' ) {
		row.fieldLength = null
		row.sacle = null
	}
}

const pkChange = (row: any) => {
	if (row.pk == '1' ) {
		row.nullable = 0
	}
}

const addField = () => {
	 columns.value.push(JSON.parse(JSON.stringify(fieldForm)))
}

const deleteField = (scope: any) =>{
	columns.value.splice(scope.$index, 1)
}

const showPickColumns = () => {
	pickField.value = true
	//获取表级联数据
	listMiddleDbTreeApi().then(res=>{
		pickTableList.value = res.data[0].children
	})
}

const pickTableChange = () => {
	if(pickTableValue.value) {
		const currentTable = pickTableValue.value[pickTableValue.value.length-1]
		//根据表名获取字段列表
		getMiddleDbColumnsApi(currentTable).then(res=>{
			pickTableColumns.value = res.data
		})
	}
}

const deleteTagColumns = (index) => {
	pickColumns.value.splice(index, 1)
}

const pickColumnsSelectChange = (selections: any[]) => {
	for(var i in selections) {
		if(pickColumns.value.length == 0) {
			pickColumns.value.push(selections[i])
		} else {
			var exist = false
			for(var j in pickColumns.value) {
				if(selections[i].name == pickColumns.value[j].name) {
					pickColumns.value[j] = selections[i]
					exist = true
					break
				}
			}
			if(!exist) {
				pickColumns.value.push(selections[i])
			}
		}
	}
}

const chooseColumnCancel = () => {
	//清空选择的字段
	pickTableValue.value = []
	pickColumns.value = []
	pickTableColumns.value = []
	pickField.value = false
}

const chooseColumnEnter = () => {
	if(pickColumns.value.length == 0) {
		ElMessage.warning("请选择需要提取的字段")
		return
	}
	for(var i in pickColumns.value) {
		if(columns.value.length == 0) {
			columns.value.push(pickColumns.value[i])
		} else {
			var exist = false
			for(var j in columns.value) {
				if(pickColumns.value[i].name == columns.value[j].name) {
					columns.value[j] = pickColumns.value[i]
					exist = true
					break
				}
			}
			if(!exist) {	
				columns.value.push(pickColumns.value[i])
			}
		}
	}
	//清空选择的字段
	ElMessage.success("提取完毕，已自动过滤替换重复字段")
	chooseColumnCancel()
}


const toUpdate = () => {
	isDetail.value = false
}

const toCancel = () => {
	infoView.value = false
}

const toDelete = () => {
	ElMessageBox.confirm('确定删除吗?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	})
	.then(() => {
		deleteMasterModelApi(tableInfo.id).then(res=>{
			ElMessage.success("删除成功")
			infoView.value = false
		})
	})
	.catch(() => {})
}

/**
 * 保存主数据模型
 */
const toSave = () => {
	tableInfoRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}
		var dataForm = {}
		dataForm.id = tableInfo.id
		dataForm.catalogId = currentNode.value.id
		dataForm.tableName = tableInfo.tableName
		dataForm.tableCn = tableInfo.tableCn
		dataForm.description = tableInfo.description
		dataForm.columns = columns.value
		if(dataForm.columns.length == 0) {
			ElMessage.warning("字段列表不可为空")
			return
		}
		var columnNames = []
		console.log(dataForm.columns)
		for (var i in dataForm.columns) {
			var columnName = dataForm.columns[i].name
			if(columnNames.indexOf(columnName) != -1) {
				ElMessage.warning("字段名称【"+columnName+"】不可重复，请检查")
				return
			} else {
				columnNames.push(columnName)
			}
		}
		if(dataForm.id) {
			updateMasterModelApi(dataForm).then((res) => {
				ElMessage.success({
					message: '保存成功',
					duration: 500,
					onClose: () => {
						Object.assign(tableInfo, res.data)
						columns.value = res.data.columns
						isDetail.value = true
					}
				})
			})
		} else {
			saveMasterModelApi(dataForm).then((res) => {
				ElMessage.success({
					message: '保存成功',
					duration: 500,
					onClose: () => {
						Object.assign(tableInfo, res.data)
						columns.value = res.data.columns
						isDetail.value = true
					}
				})
			})
		}
		
	})
}

const toRelease = () => {
	ElMessageBox.confirm('确定发布吗，发布后将同步生成物理表?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	})
	.then(() => {
		releaseMasterModelApi(tableInfo.id).then(res=>{
			ElMessage.success("发布成功")
			Object.assign(tableInfo, res.data)
		})
	})
	.catch(() => {})
}

const toCancelRelease = () => {
	ElMessageBox.confirm('确定取消发布吗，取消后将同步删除物理表！', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	})
	.then(() => {
		cancelReleaseMasterModelApi(tableInfo.id).then(res=>{
			ElMessage.success("取消发布成功")
			Object.assign(tableInfo, res.data)
		})
	})
	.catch(() => {})
}

/**
 * 右键相关参数
 */
const ckRightOptionData = reactive({
	optionCardShow: false,
	optionCardX: 0,
	optionCardY: 0,
	optionData: {},
	node: '',
	tree: ''
})
/**
 * 右键节点
 */
const ckRightOption = (e, data, n, t) => {
	ckRightOptionData.optionCardShow = false 
	ckRightOptionData.optionCardX = e.x   // 让右键菜单出现在鼠标右键的位置
	ckRightOptionData.optionCardY = e.y
	ckRightOptionData.optionData = data
	ckRightOptionData.node = n // 将当前节点保存
	ckRightOptionData.tree = t
	ckRightOptionData.optionCardShow = true  // 展示右键菜单
}

/**
 * 点击右键菜单以外的地方
 */
const OptionCardClose = (event) => {
	var currentCli = document.getElementById("option-button-group");
	if (currentCli) {
		ckRightOptionData.optionCardShow = false;
		/* if (!currentCli.contains(event.target)) { //点击到了id为option-button-group以外的区域，就隐藏菜单
			ckRightOptionData.optionCardShow = false;
		} */
	}
}

</script>

<style lang="scss">
	/* 树节点相关属性 */
	.masterDataTreeDiv .el-tree-node__content {
			height: 35px;
		}
	.masterData-tree-node {
		 font-size: 16px;
		-webkit-user-select: none;
		-khtml-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}
	.option-card-button {
		width: 100%;
		margin-left: 0 !important;
		padding: 20px 20px;
		font-size: 14px;
		border-radius: 0;
	}
	
	.master-data-right {
	  padding: 0 !important;
	
	  .dsr-part {
	    /* height: calc(100vh - 250px);
	    overflow: auto; */
	  }
	
	  .action_part {
	    background-color: #fff;
	    padding: 12px;
	    border-bottom: 1px solid #ebeef5;
	    box-sizing: border-box;
	  }
	
	  .info-part {
	    background-color: #eef3fd;
	    width: calc(100% - 20px);
	    margin: 12px auto 0;
	    border: 1px solid #ebeef5;
	    padding: 12px;
	    box-sizing: border-box;
	    border-radius: 8px;
	
	    h6 {
	      padding: 12px 0;
	      padding-left: 20px;
	      position: relative;
	      font-size: 16px;
	      font-family: Alibaba-PuHuiTi-M, Alibaba-PuHuiTi;
	      font-weight: normal;
	      color: #020e19;
	
	      &::after {
	        content: '';
	        height: 12px;
	        width: 4px;
	        position: absolute;
	        left: 6px;
	        top: 50%;
	        transform: translateY(-50%);
	        // background-color: $--color-primary;
	        background: linear-gradient(180deg, #10b0f9 0%, rgba(25, 104, 249, 0.3) 100%);
	      }
	    }
	  }
	}
	
	.sheet-field {
	  .error_tips .el-input__inner {
	    border-color: #f56c6c;
	  }
	}
	.sheet_field_column {
	  .no_check {
	    .el-table-column--selection .cell {
	      display: none;
	    }
	  }
	  .select_box {
	    border: 1px solid #ebeef5;
	    height: 100px;
	    overflow-x: hidden;
	    overflow-y: auto;
	    padding: 10px;
	    border-radius: 4px;
	    margin-bottom: 16px;
	    .el-tag {
	      margin-bottom: 10px;
	      margin-right: 10px;
	    }
	  }
	}
	
</style>