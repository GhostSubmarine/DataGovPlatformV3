<template>
	  <el-card @click="OptionCardClose($event)">
			<div class="headerBox">
				<!-- <div class="headLeft">
					<el-breadcrumb separator="/">
					    <el-breadcrumb-item v-for="item in headList">{{item}}</el-breadcrumb-item>
					  </el-breadcrumb>
				</div> -->
				<div calss="headRight" v-show="editableTabsValue!='0'">
					<el-tooltip
							class="box-item"
							effect="dark"
							content="美化sql"
							placement="top-end"
						>
							<el-button text @click="formatSql()"><img src="@/assets/format.png"/></el-button>
					</el-tooltip>
					<el-tooltip
							class="box-item"
							effect="dark"
							content="检查sql有效性"
							placement="top-end"
						>
							<el-button text @click="explainSql()"><img src="@/assets/check.png"/></el-button>
					</el-tooltip>
					<el-tooltip
							class="box-item"
							effect="dark"
							content="执行"
							placement="top-end"
						>
							<el-button :loading="executeSqlButton" @click="executeSql()" text><img src="@/assets/run.png"/></el-button>
					</el-tooltip>
					<el-tooltip
							class="box-item"
							effect="dark"
							content="清空日志"
							placement="top-end"
						>
							<el-button @click="clearLog" text><img src="@/assets/clear.png"/></el-button>
					</el-tooltip>
				</div>
			</div>
			<div class="box">
				<div class="mainBox">
					<div class="left">
						<el-scrollbar>
							<el-tabs class="demo-tabs" v-model="activeTabName">
								<el-tab-pane label="数据库" name="database" v-if="hasDb">
									<Db ref="dbRef" @setCodeText="setEditorValue"></Db>
								</el-tab-pane>
								 <el-tab-pane label="中台库" name="middledb" v-if="hasMiddledb">
									<Middledb ref="middledbRef" @setCodeText="setEditorValue"></Middledb>
								 </el-tab-pane>
							 </el-tabs>
						</el-scrollbar>
					</div>
					<div
						class="leftResize"
						title="左右侧边栏"
					></div>
					<!-- 中间 -->
					<div class="midBox">
						<el-tabs
							  class="mid-tabs"
								v-model="editableTabsValue"
								type="card"
								closable
								@tab-remove="removeTab"
								@tab-click="clickTab"
							>
							 <el-tab-pane
										v-for="item in editableTabs"
										:key="item.name"
										:label="item.title"
										:name="item.name"
								>
								</el-tab-pane>
						</el-tabs>
						<div v-show="editableTabsValue!='0'" style="height:100%">
							<DataStudio id="dbResourceStudio" v-show="editableTabsValue!='0'" ref="dataStudioRef"></DataStudio>
						</div>
					</div>
					<div
						class="rightResize"
						title="左右侧边栏"
					></div>
					<!-- 右侧 -->
					<div class="right">
						<el-scrollbar>
							<div v-show="editableTabsValue!='0'" style="padding: 30px 20px">
								<el-form ref="sqlDataFormRef" :model="sqlDataForm" :rules="sqlDataFormRules">
									<el-form-item label="数据预览最大行数" prop="pvdataNum">
										<el-input-number v-model="sqlDataForm.pvdataNum" :min="1" :max="1000" />
									</el-form-item>
									<el-form-item label="开启事务" prop="openTrans">
										<el-tooltip
												effect="dark"
												content="如果数据库本身不支持事务, 则不要开启"
												placement="top-end"
											>
											<el-switch
												v-model="sqlDataForm.openTrans"
												:active-value="1"
												:inactive-value="0"
											/>
										</el-tooltip>
									</el-form-item>
								</el-form>
							</div>
						</el-scrollbar>
					</div>
				</div>
				<div
				   title="上下侧边栏" 
					 class="bottomResize">
				</div>
				<!-- 下方 -->
				<div class="downBox">
					<el-tabs class="buttom-tabs">
						<el-tab-pane>
							<template #label>
								<span class="custom-tabs-label">
									<el-icon><Postcard /></el-icon>&nbsp;
									<span>日志信息</span>
								</span>
							</template>
							<read-only-studio id="resourceConsoleLog" ref="consoleLogRef" style="height: 100%"></read-only-studio>
						</el-tab-pane>
						<el-tab-pane>
							<template #label>
								<span class="custom-tabs-label">
									<el-icon><DataLine /></el-icon>&nbsp;
									<span>结果</span>
								</span>
							</template>
							<console-result ref="consoleResultRef"></console-result>
						</el-tab-pane>
					</el-tabs>
				</div>
			</div>
			
			<explain-sql-dialog ref="explainSqlDialogRef"></explain-sql-dialog>
			
		</el-card>
</template>

<script lang="ts" setup name="DataAssetsDbResource">
	
import { useRouter  } from 'vue-router'
import { onMounted, ref, watch, reactive, provide,nextTick } from 'vue'
import Db from './db.vue'
import Middledb from './middle-db.vue'
import explainSqlDialog from '../../data-development/production/explainSql.vue'
import ConsoleResult from '../../data-development/production/console-result.vue'
import DataStudio from '../../data-development/production/data-studio.vue'
import ReadOnlyStudio from '../../data-development/production/readonly-studio.vue'
/* import { listDatabase } from '@/api/data-integrate/database' */
import { ElMessage, ElMessageBox } from 'element-plus/es'
import { ElNotification } from 'element-plus'
import { explainSqlApi, justExecuteSqlApi, getConsoleLogApi,clearConsoleLogApi,endConsoleLogApi,clearConsoleLogWithOutKeyApi } from '@/api/data-development/task'
import { listDbInfoById, sqlCheckApi } from '@/api/data-assets/resourceMount'

/**
 * 初始话加载
 */
const activeTabName = ref("database")
const dbRef = ref()
const middledbRef = ref()
const router = useRouter();

const resourceIdRef = ref()
const resData = ref()
watch(() =>router.currentRoute.value.query.id,(newValue,oldValue)=> {
	/* console.log(oldValue)
	console.log(newValue) */
	if(!newValue) {
		return
	}
	let resourceId = sessionStorage.getItem("resourceId")
	if( resourceId != resourceIdRef.value && resourceIdRef.value) {
		resetVal()
	} 
	resourceIdRef.value = resourceId
	//重新加载数据库表
	let queryApply =  sessionStorage.getItem("queryApply")
	listDbInfoById(resourceIdRef.value, queryApply).then(res=> {
		if (resData.value && JSON.stringify(resData.value) != JSON.stringify(res.data)) {
			resetVal()
		}
		resData.value = res.data
		if(res.data.DATABASE.length) {
			hasDb.value = true
			setTimeout(()=>{
				dbRef.value.init(sessionStorage.getItem("resourceId"), res.data.DATABASE)
			},300)
		} else {
			//如果没有数据库，设置生效的tab为middledb
			hasDb.value = false
			activeTabName.value = 'middledb'
		}
		if(res.data['MIDDLE_DB'].length) {
			hasMiddledb.value = true
			setTimeout(()=>{
				middledbRef.value.init(sessionStorage.getItem("resourceId"), res.data['MIDDLE_DB'])
			},300)
		} else {
			hasMiddledb.value = false
		}
		if(!hasDb.value && !hasMiddledb.value) {
			ElMessage.warning("没有可以查看的有效库表资源！")
		}
	})
},{ immediate: true })

onMounted(()=>{
	dragControllerLeftLR()
	dragControllerRightLR()
	dragControllerUD()
	resourceIdRef.value = sessionStorage.getItem("resourceId")
	let queryApply =  sessionStorage.getItem("queryApply")
	resetVal()
	listDbInfoById(resourceIdRef.value, queryApply).then(res=> {
		if(res.data.DATABASE.length) {
			hasDb.value = true
			setTimeout(()=>{
				dbRef.value.init(sessionStorage.getItem("resourceId"), res.data.DATABASE)
			},300)
		} else {
			hasDb.value = false
		}
		if(res.data['MIDDLE_DB'].length) {
			hasMiddledb.value = true
			setTimeout(()=>{
				middledbRef.value.init(sessionStorage.getItem("resourceId"), res.data['MIDDLE_DB'])
			},300)
		} else {
			hasMiddledb.value = false
		}
		//dbResourceLoading.value = false
	})
})

/**
 * 重置数据
 */
const resetVal = () => {
	filterNodeText.value = ''
	for(let i in editorValues) {
		delete editorValues[i]
	}
	editableTabs.value = []
	editableTabsValue.value = '0'
	setTimeout(()=>{
		consoleLogRef.value.setEditorValue('');
		consoleResultRef.value.clear()
	},200)
}

const filterNodeText = ref('')
const editableTabsValue = ref('0')
const editableTabs = ref([])
const dataStudioRef = ref()
const currentNodeData = ref()
//存储每个tab的编辑器的value
const editorValues = {}
const hasDb = ref(false)
const hasMiddledb = ref(false)
//提供给子组件
provide("filterNodeText",filterNodeText)
provide("editorValues",editorValues)
provide("editableTabsValue",editableTabsValue)
provide("editableTabs",editableTabs)
provide("currentNodeData",currentNodeData)
provide("hasDb",hasDb)
provide("hasMiddledb",hasMiddledb)

const setEditorValue = () => {
	//console.log(editableTabsValue.value)
	//console.log(editorValues[editableTabsValue.value])
	dataStudioRef.value.setEditorValue(editorValues[editableTabsValue.value]?editorValues[editableTabsValue.value]["codeText"]:'')
}

/**
 * 点击标签
 */
const clickTab = (tabsPaneContext) => {
	editableTabsValue.value = tabsPaneContext.paneName
	//console.log(editorValues[tabsPaneContext.paneName])
	//从缓存中取值
	currentNodeData.value = editorValues[tabsPaneContext.paneName]?editorValues[tabsPaneContext.paneName]["nodeData"]:{}
	dataStudioRef.value.setEditorValue(editorValues[tabsPaneContext.paneName]?editorValues[tabsPaneContext.paneName]["codeText"]:'')
}

/**
 * 删除标签
 */
const removeTab = (targetName: any) => {
	//提示是否缓存当前编辑的内容
	ElMessageBox.confirm('确认关闭吗？', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	}).then(() => {
		removeTabMethod(targetName)
	})
}

const removeTabMethod = (targetName: any) => {
	const tabs = editableTabs.value
	let activeName = editableTabsValue.value
	var findActive = false
	var findTarget = false
	for (let i in tabs) {
		let tab = tabs[Number(i)]
		if (tab.name == targetName) {
			findTarget = true
			const nextTab = tabs[Number(i) + 1] || tabs[Number(i) - 1]
			if (nextTab) {
				//console.log(nextTab)
				findActive = true
				activeName = nextTab.name
				break
			}
		}
	}
	//如果没有找到要移除的tab，return
	if (!findTarget) {
		return
	}
	if(findActive) {
		 editableTabsValue.value = activeName
	} else {
		 editableTabsValue.value = '0'
	}
	 editableTabs.value = tabs.filter((tab) => tab.name != targetName)
	 //console.log(editableTabs.value)
	 //清空缓存中的值
	 delete editorValues[targetName]
	 //赋值下一个tab
	 dataStudioRef.value.setEditorValue(editorValues[activeName]?editorValues[activeName]["codeText"]:'')
	 currentNodeData.value = editorValues[activeName]?editorValues[activeName]["nodeData"]:{}
}

//，美化sql
const formatSql = () => {
	dataStudioRef.value!.handleFormat()
}

const sqlDataForm = reactive({
	saveHistory: 0,
	statement: '',
	dialect: 1,
	sqlDbType: 1,
	databaseId: '',
	pvdataNum: 100,
	openTrans: 0,
	processEnd: true
})
const sqlDataFormRules = ref({
	pvdataNum: [{ required: true, message: '必填项不能为空', trigger: 'blur' }]
})
const sqlDataFormRef = ref()
const explainSqlDialogRef = ref()
const explainSql = async () => {
	let validate = true
	await sqlDataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			ElMessage.warning('请把必填项补充完整！')
			validate = false
			return false
		}
	})
	if(!validate) {
		return
	}
	if(currentNodeData.value.type == 1) {
		sqlDataForm.sqlDbType = 2
		sqlDataForm.databaseId = null
	} else {
		sqlDataForm.sqlDbType = 1
		sqlDataForm.databaseId = currentNodeData.value.id
	}
	//先弹框
	explainSqlDialogRef.value.init()
	sqlDataForm.jobName = sqlDataForm.name
	sqlDataForm.maxRowNum = sqlDataForm.pvdataNum
	sqlDataForm.statement = dataStudioRef.value.getEditorValue()
	await clearConsoleLogApi()
	getConsoleLog()
	const { data } = await explainSqlApi(sqlDataForm)
	explainSqlDialogRef.value.finishExplain(data)
}

const executeSqlButton = ref()
const consoleResultRef = ref()
const executeSql = async () => {
	let validate = true
	executeSqlButton.value = true
	try {
		await sqlDataFormRef.value.validate((valid: boolean) => {
			if (!valid) {
				ElMessage.warning('请把必填项补充完整！')
				validate = false
				return false
			}
		})
		if(!validate) {
			return
		}
		if(currentNodeData.value.type == 1) {
			sqlDataForm.sqlDbType = 2
			sqlDataForm.databaseId = null
		} else {
			sqlDataForm.sqlDbType = 1
			sqlDataForm.databaseId = currentNodeData.value.id
		}
		sqlDataForm.jobName = sqlDataForm.name
		sqlDataForm.maxRowNum = sqlDataForm.pvdataNum
		sqlDataForm.statement = dataStudioRef.value.getEditorValue()
		//清空日志
		await clearConsoleLogApi()
		//获取日志
		getConsoleLog()
		//提示
		ElNotification({
				title: '提示',
				message: '正在检查sql语句正确性。。。',
				duration: 0,
				zIndex: 9999,
				type: 'success',
		})
		//先检查sql，processEnd 设置为false，避免因为explain结束后获取不到后续日志
		sqlDataForm.processEnd = false
		const { data } = await explainSqlApi(sqlDataForm)
		sqlDataForm.processEnd = true
		const result = explainSqlDialogRef.value.finishExplain(data)
		ElNotification.closeAll()
		//如果检测通过
		if(result) {
			//提示
			ElNotification({
					title: '提示',
					message: '正在执行sql，请耐心等待。。。',
					duration: 0,
					zIndex: 9999,
					type: 'success',
			})
			//判断权限
			sqlDataForm.resourceId = resourceIdRef.value
			const res = await sqlCheckApi(sqlDataForm)
			//console.log(res)
			if (!res.data.pass) {
				ElMessage.error(res.data.msg)
				endConsoleLogApi()
				return
			}
			//执行sql
			const { data } = await justExecuteSqlApi(sqlDataForm)
			ElNotification.closeAll()
			if(!data.success) {
				ElMessage.error('执行失败，请查看日志信息排查原因！')
				consoleResultRef.value.init(data.result, 1)
				return
			}
			ElMessage.success('执行成功')
			consoleResultRef.value.init(data.result, 1)
		} else {
			//弹框
			explainSqlDialogRef.value.showError()
			endConsoleLogApi()
		}
	} finally {
		executeSqlButton.value = false
		ElNotification.closeAll()
	}
}

const consoleLogRef = ref()

provide("consoleLogRef",consoleLogRef)
provide("consoleResultRef",consoleResultRef)
//每1s获取一次日志
const getConsoleLog = () => {
	 getConsoleLogApi().then(res=> {
		 //设置log
		 if(res.data.log != consoleLogRef.value.getEditorValue()) {
			 consoleLogRef.value.setEditorValue(res.data.log)
		 }
			//如果没结束，再次调用
		 if(!res.data.end) {
			 setTimeout(() => {getConsoleLog()},1000)
		 } else {
			 //清空日志
			 clearConsoleLogApi()
		 }
	 })
}

const clearLog = () => {
	consoleLogRef.value.setEditorValue('')
	clearConsoleLogWithOutKeyApi()
}

/**
 * 点击右键菜单以外的地方
 */
const OptionCardClose = (event) => {
	if(dbRef.value) {
		dbRef.value.OptionCardClose()
	}
	if(middledbRef.value) {
		middledbRef.value.OptionCardClose()
	}
}

// 左侧左右拖动事件
const dragControllerLeftLR = () => {
	var leftResize = document.getElementsByClassName('leftResize')
	var rightResize = document.getElementsByClassName('rightResize')
	var left = document.getElementsByClassName('left')
	var right = document.getElementsByClassName('right')
	var midBox = document.getElementsByClassName('midBox')
	var box = document.getElementsByClassName('mainBox')
	for (let i = 0; i < leftResize.length; i++) {
		// 鼠标按下事件
		leftResize[i].onmousedown = function(e) {
			//颜色改变提醒
			leftResize[i].style.background = '#818181'
			var startX = e.clientX
			var leftMove = leftResize[i].offsetLeft
			var rightLength = box[i].clientWidth - rightResize[i].offsetWidth - rightResize[i].offsetLeft
			//console.log(rightLength)
			// 鼠标拖动事件
			document.onmousemove = function(e) {
				var endX = e.clientX
				var moveLen = leftMove + (endX - startX) // （endx-startx）=移动的距离。resize[i].left+移动的距离=左边区域最后的宽度
				var maxT = box[i].clientWidth - leftResize[i].offsetWidth - rightResize[i].offsetWidth - rightLength  // 容器宽度 - 左边区域的宽度 - 右边区域的宽度 = 中间区域宽度
				if (moveLen <= 100) moveLen = 100 // 左边区域的最小宽度为50px
				if (moveLen >= maxT - 120) moveLen = maxT - 120 //右边区域最小宽度为150px

				leftResize[i].style.left = moveLen // 设置左侧区域的宽度

				for (let j = 0; j < left.length; j++) {
					left[j].style.width = moveLen + 'px'
					right[j].style.width = rightLength -1 + 'px'
					if(midBox[j]) {
						midBox[j].style.width = maxT - moveLen -36 + 'px'
					}
				}
			}
			// 鼠标松开事件
			// eslint-disable-next-line no-unused-vars
			document.onmouseup = function(evt) {
				//颜色恢复
				leftResize[i].style.background = '#d6d6d6'
				document.onmousemove = null
				document.onmouseup = null
				leftResize[i].releaseCapture && leftResize[i].releaseCapture() //当你不在需要继续获得鼠标消息就要应该调用ReleaseCapture()释放掉
			}
			leftResize[i].setCapture && leftResize[i].setCapture() //该函数在属于当前线程的指定窗口里设置鼠标捕获
			return false
		}
	}
}
// 右侧左右拖动事件
const dragControllerRightLR = () => {
	var leftResize = document.getElementsByClassName('leftResize')
	var rightResize = document.getElementsByClassName('rightResize')
	var left = document.getElementsByClassName('left')
	var right = document.getElementsByClassName('right')
	var midBox = document.getElementsByClassName('midBox')
	var box = document.getElementsByClassName('mainBox')
	for (let i = 0; i < rightResize.length; i++) {
		// 鼠标按下事件
		rightResize[i].onmousedown = function(e) {
			//颜色改变提醒
			rightResize[i].style.background = '#818181'
			var startX = e.clientX
			rightResize[i].left = rightResize[i].offsetLeft
			var leftLength = left[i].offsetWidth
			console.log(leftLength)
			// 鼠标拖动事件
			document.onmousemove = function(e) {
				var endX = e.clientX
				var moveLen = rightResize[i].left + (endX - startX) 
				/* 最大容器宽度 */
				var maxT = box[i].clientWidth - leftResize[i].offsetWidth - rightResize[i].offsetWidth - leftLength

				if (moveLen - leftResize[i].offsetWidth - leftLength <= 120) moveLen = 120 + leftResize[i].offsetWidth + leftLength
				if (moveLen - leftResize[i].offsetWidth - leftLength + 100 >= maxT ) moveLen = maxT - 100 + leftResize[i].offsetWidth + leftLength

				rightResize[i].style.left = moveLen 

				for (let j = 0; j < right.length; j++) {
					if(midBox[j]) {
						midBox[j].style.width = moveLen - leftResize[i].offsetWidth - leftLength + 'px'
					}
					right[j].style.width = box[i].clientWidth - moveLen - rightResize[i].offsetWidth -1 + 'px'
				}
			}
			// 鼠标松开事件
			// eslint-disable-next-line no-unused-vars
			document.onmouseup = function(evt) {
				//颜色恢复
				rightResize[i].style.background = '#d6d6d6'
				document.onmousemove = null
				document.onmouseup = null
				rightResize[i].releaseCapture && rightResize[i].releaseCapture() //当你不在需要继续获得鼠标消息就要应该调用ReleaseCapture()释放掉
			}
			rightResize[i].setCapture && rightResize[i].setCapture() //该函数在属于当前线程的指定窗口里设置鼠标捕获
			return false
		}
	}
}
// 上下拖动事件
const dragControllerUD = () => {
	var bottomResize = document.getElementsByClassName('bottomResize')
	var topBox = document.getElementsByClassName('mainBox')
	var downBox = document.getElementsByClassName('downBox')
	var box = document.getElementsByClassName('box')
	for (let i = 0; i < bottomResize.length; i++) {
		// 鼠标按下事件
		bottomResize[i].onmousedown = function(e) {
			console.log(bottomResize[i].top);
			//颜色改变提醒
			bottomResize[i].style.background = '#818181'
			var startY = e.clientY
			bottomResize[i].top = bottomResize[i].offsetTop
			// 鼠标拖动事件
			document.onmousemove = function(e) {
				var endY = e.clientY
				var moveLen = bottomResize[i].top + (endY - startY) // （endY - startY）=移动的距离。resize[i].top+移动的距离=上边区域最后的高度
				var maxT = box[i].clientHeight - bottomResize[i].offsetHeight // 容器高度 - 上边区域的高度 = 下边区域的高度

				if (moveLen < 100) moveLen = 100 // 上边区域的最小高度为100px
				if (moveLen > maxT - 80) moveLen = maxT - 80 //下边区域最小高度为80px

				bottomResize[i].style.top = moveLen// 设置上边区域的高度

				for (let j = 0; j < topBox.length; j++) {
					topBox[j].style.height = moveLen + 'px'
					downBox[j].style.height = box[i].clientHeight - moveLen - bottomResize[i].offsetHeight + 'px'
				}
			}
			// 鼠标松开事件
			document.onmouseup = function() {
				//颜色恢复
				bottomResize[i].style.background = '#d6d6d6'
				document.onmousemove = null
				document.onmouseup = null
				bottomResize[i].releaseCapture && bottomResize[i].releaseCapture() //当你不在需要继续获得鼠标消息就要应该调用ReleaseCapture()释放掉
			}
			bottomResize[i].setCapture && bottomResize[i].setCapture() //该函数在属于当前线程的指定窗口里设置鼠标捕获
			return false
		}
	}
}


</script>

<style lang="scss">
.headerBox {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	height: 30px;
	/* background-color: #fff; */
}


.box {
	/* background-color: #fff; */
	width: 100%;
	height: calc(100vh - 200px);
	overflow: hidden;
}
/*包围div样式*/
.mainBox {
  width: 100%;
  height: 70%;
  overflow: hidden;
}
/*左侧div样式*/
.left {
  width: calc(15% - 10px); /*左侧初始化宽度*/
  height: 100%;
  float: left;
}
/* 拖拽区div样式 */
.leftResize {
  cursor: w-resize;
  float: left;
  position: relative;
  background-color: #d6d6d6;
  border-radius: 5px;
  margin-top: -10px;
  width: 10px;
  height: 100%;
  background-size: cover;
  background-position: center;
  /*z-index: 99999;*/
  font-size: 32px;
  color: white;
}
/*中间div'样式*/
.midBox {
  float: left;
  width: 65%; /*右侧初始化宽度*/
  height: 100%;
}
/* 拖拽区div样式 */
.rightResize {
  cursor: w-resize;
  float: left;
  position: relative;
  background-color: #d6d6d6;
  border-radius: 5px;
  margin-top: -10px;
  width: 10px;
  height: 100%;
  background-size: cover;
  background-position: center;
  /*z-index: 99999;*/
  font-size: 32px;
  color: white;
}
/* 右侧div */
.right {
  float: left;
  width: calc(20% - 10px); /*右侧初始化宽度*/
  height: 100%;
	overflow: hidden;
}
/* 拖拽区div样式 */
.bottomResize {
	overflow: hidden;
	cursor: s-resize;
	width: 100%;
	height: 10px;
	background-color: #d6d6d6;
	margin: 0 auto;
	border-radius: 5px;
	text-align: center;
	line-height: 3px;
	font-size: 32px;
	color: white;
}
/*下方div'样式*/
.downBox {
	overflow: hidden;
	height: calc(30% - 10px);
}

/*拖拽区鼠标悬停样式*/
.bottomResize:hover {
  color: #444444;
}

.demo-tabs > .el-tabs__content {
  padding: 10px;
}
.midBox > .el-tabs > .el-tabs__header {
    padding: 0;
    position: relative;
    margin: 0 0 0;
}
.midBox > .el-tabs {
    --el-tabs-header-height: 35px;
}
.demo-tabs .el-tree-node__content {
		height: 46px;
	}
.custom-tree-node {
  font-size: 18px;
}
// 右键菜单按钮
.option-card-button {
	width: 100%;
	margin-left: 0 !important;
	padding: 20px 20px;
	font-size: 14px;
	border-radius: 0;
}
.summaryInfo .el-descriptions--large .el-descriptions__header .el-descriptions__title {
	font-size: 28px;
}
.summaryInfo .el-descriptions--large .el-descriptions__body .el-descriptions__table .el-descriptions__cell .el-descriptions__label {
	font-size: 19px;
}
.summaryInfo .el-descriptions--large .el-descriptions__body .el-descriptions__table .el-descriptions__cell .el-descriptions__content {
	font-size: 17px;
}
.el-notification.right {
    height: 100px;
}

.buttom-tabs {
	height: 100%;
}

.buttom-tabs > .el-tabs__content {
	height: calc(100% - 40px);
  padding: 0;
}
/* 每个tab高度设置为100% */
.buttom-tabs > .el-tabs__content > .el-tab-pane {
	height: 100%;
}

.buttom-tabs .custom-tabs-label {	
		font-size: 16px;
}
.buttom-tabs > .el-tabs__header {
    padding: 0;
    position: relative;
    margin: 0 0 0;
}

</style>
