<template>
		<el-card>
			<div class="flowDetailBox" style="height: 100%;" v-loading="boxLoading">
				<div class="flowDetailTopBox">
					<div style="height:100%;width:100%"  id="flowDetailContainer"></div>
				</div>
				<!-- 上下侧边 -->
				<div
				   title="上下侧边栏" 
					 class="flowDetailBottomResize">
				</div>
				<div class="flowDetailBottomBox">
					<el-tabs class="flowDetailBottomTabs">
						<el-tab-pane>
							<template #label>
								<span class="flowDetailCustomTabsLabel">
									<el-icon><Postcard /></el-icon>&nbsp;
									<span>日志信息</span>
								</span>
							</template>
							<read-only-studio id="flowDetailConsoleLog" ref="flowDetailConsoleLogRef" style="height: 100%"></read-only-studio>
						</el-tab-pane>
						<el-tab-pane>
							<template #label>
								<span class="flowDetailCustomTabsLabel">
									<el-icon><Calendar /></el-icon>&nbsp;
									<span>关联作业</span>
								</span>
							</template>
							<el-scrollbar>
								<TaskHistory :ifChild='true' :recordId="scheduleForm.recordId" v-if="!!scheduleForm.recordId"></TaskHistory>
							</el-scrollbar>
						</el-tab-pane>
					</el-tabs>
				</div>
			</div>
		</el-card>
		
		
		<!-- 下载流程图 -->
		<div id="snapshotDownloadId" v-show="false"></div>
		
		<!-- 节点框 -->
		<el-drawer size="45%" v-model="nodeVisable" direction="rtl" :append-to-body="true" :destroy-on-close="true">
			<template #header>
			    <h4>{{nodeDataForm.properties.name}}</h4>
			</template>
			<template #default>
				<el-divider>
				  <span style="font-size: 17px"><b>节点信息</b></span>
				</el-divider>
				<el-descriptions
				    title=""
				    :column="3"
				    size="large"
						border
				  >
				    <el-descriptions-item label="名称">{{nodeDataForm.properties.name}}</el-descriptions-item>
						<el-descriptions-item label="作业类型">{{nodeDataForm.properties.taskTypeVal}}</el-descriptions-item>
						<el-descriptions-item label="权重">{{nodeDataForm.properties.weight}}</el-descriptions-item>
						<el-descriptions-item label="遇错是否继续">{{nodeDataForm.properties.failGoOn?'是':'否'}}</el-descriptions-item>
						<el-descriptions-item label="开始时间">{{nodeDataForm.startTime}}</el-descriptions-item>
						<el-descriptions-item label="结束时间">{{nodeDataForm.endTime}}</el-descriptions-item>
						<el-descriptions-item label="状态">
							<el-tooltip 
							        effect="dark"
							        content="节点状态正常只是代表作业成功提交运行了,若节点类型为 flinkSql,需要留意关联作业中具体的 flink 实例是否运行成功!"
							        placement="top-start"
							      >
								 <span><el-tag v-if="nodeDataForm.properties.runStatus == 3" type="success">正常</el-tag></span>
							</el-tooltip>
							<el-tag v-if="nodeDataForm.properties.runStatus == 1" type="info">未运行</el-tag>
							<el-tag v-if="nodeDataForm.properties.runStatus == 4" type="danger">异常</el-tag>
						</el-descriptions-item>
						<el-descriptions-item label="备注">{{nodeDataForm.properties.note}}</el-descriptions-item>
				</el-descriptions>
				<el-divider>
				  <span style="font-size: 17px"><b>节点日志</b></span>
				</el-divider>
				<read-only-studio v-if="!!nodeDataForm.log" id="flowNodeLogId" :value="nodeDataForm.log" style="height: 300px"></read-only-studio>
				<el-result v-if="!!!nodeDataForm.log" title="暂无数据" sub-title="没有日志信息"></el-result>
				<el-divider>
				  <span style="font-size: 17px"><b>关联作业</b></span>
				</el-divider>
				<TaskHistory v-if="!!nodeDataForm.properties.nodeRecordId" :ifSearch="false" :ifChild='true' :nodeRecordId="nodeDataForm.properties.nodeRecordId"></TaskHistory>
				<el-result v-if="!!!nodeDataForm.properties.nodeRecordId" title="暂无数据" sub-title="无关联作业"></el-result>
			</template>
		</el-drawer>
		
		<!-- 调度任务保存 -->
		<el-dialog v-model="configVisible" title="调度配置" >
			<el-descriptions
			    title=""
			    :column="1"
			    size="large"
					border
			  >
			    <el-descriptions-item label="调度名称">{{scheduleForm.name}}</el-descriptions-item>
					<el-descriptions-item label="周期执行">{{scheduleForm.ifCycle?'是':'否'}}</el-descriptions-item>
					<el-descriptions-item label="cron表达式" v-if="scheduleForm.ifCycle">{{scheduleForm.cron}}</el-descriptions-item>
					<el-descriptions-item label="备注">{{scheduleForm.note}}</el-descriptions-item>
			</el-descriptions>
		</el-dialog>
</template>

<script setup lang="ts" name="Data-developmentScheduleFlow">
	import { reactive, ref, onMounted ,nextTick } from 'vue'
	import LogicFlow from '@logicflow/core'
	import { Menu,Control,SelectionSelect,DndPanel,Snapshot } from '@logicflow/extension';
	import "@logicflow/core/dist/style/index.css"
	import '@logicflow/extension/lib/style/index.css'
	import TaskModel from '../schedule/UserTaskNode.js'
	import FlowLink from "../schedule/FlowLink.js";
	import store from '@/store'
	import { getDictLabel } from '@/utils/tool'
	import ReadOnlyStudio from '../production/readonly-studio.vue'
	import { getNodeRecordApi } from '@/api/data-development/schedule'
	import TaskHistory from '../task-history/index.vue'
	
	//cron表达式，流程配置
	const configVisible = ref(false)
	
	const graphData = {
		nodes: [],
		edges: []
	}
	
	const scheduleForm = reactive({
		id: '',
		recordId: '',
		name: '',
		ifCycle: '',
		cron: '',
		note: '',
		nodes: [],
		edges: []
	})
	
	const boxLoading = ref(true)
	const flowDetailConsoleLogRef  = ref()
	const init = (data) => {
		// 重置表单数据
		Object.assign(scheduleForm, JSON.parse(data.configJson))
		graphData.nodes = scheduleForm.nodes
		graphData.edges = scheduleForm.edges
		//console.log(graphData)
		lf.render(graphData)
		flowDetailConsoleLogRef.value.setEditorValue(data.log)
		boxLoading.value = false
	}
	
	//节点编辑框
	const nodeVisable = ref(false)
	
	const nodeDataForm = reactive({
		id: "",
		log: '',
		startTime: '',
		endTime: '',
		properties: {
			id: '',
			nodeRecordId: '',
			name: '',
			taskType: '',
			taskTypeVal: '',
			taskId: '',
			note: '',
			failGoOn: '',
			weight: 1,
			runStatus: ''
		},
		type: "",
		x: 490,
		y: 230,
	})
	
	let lf = null
	onMounted(()=>{
		nextTick(()=>{
			//初始化上下拖动
			dragControllerUD()
			//加载流程引擎
			lf = new LogicFlow({
			  container: document.querySelector('#flowDetailContainer'),
				grid: {
				  visible: true,
				  type: 'mesh',
				  size: 10,
				  config: {
				    color: '#eeeeee'
				  }
				},
				//只看不编辑
				//isSilentMode: true,
				// 注册组件
				plugins: [ Menu,Control,SelectionSelect,DndPanel,Snapshot ],
			});
			//注册任务节点
			lf.register(TaskModel)
			//注册连线
			lf.register(FlowLink)
			lf.setDefaultEdgeType('flow-link');
			document.getElementById('snapshotDownloadId').addEventListener('click', () => {
			  lf.getSnapshot()
			})
			//左侧面板
			lf.extension.dndPanel.setPatternItems([
				{
				  label: "配置信息",
					className: "dnd-class",
				  icon:
				    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAB+ElEQVR4nO3X3VHCQBSG4XPQe+lAbUDjvY7YgXagHYgWIBSgYAXSgSUQBwoINAAlxHvg+B0kTIBNyIZN1BnfGSfZuHGfMT8in5y/CP2i/kHb+hOgDyLxqZS4RkSX+FpmAElz2H9sUAmdnD83QHiiWE5AXq1VDfx6iF2rCgEB482m0q0Q14NevUMWOQdFGBKqYkgV5jsblFPQOibKBuUaVJWJ+Dj5FMOVsqKcgrRU1D6f4UYPsJuYc5CWgnod9h/usU2sEJBmQjHTeNB7OMZuYrlBWNDDZoxLEGJrDHOOZhMZYXfZtsuWC4SF5k8TC415n6+wQIjDK2GO/oa6+EEehvFSL5s1CAvNMbR4tJkoWEdhjhGDS/bJe1zD3ABDY1YgXQiYUYSJiqN0jgmjZXn0rUCEvIvW7UzkDbsrLVA3MpF3wTQc2owprOzN4QFGmUsFaUmoTOVAbQVpZaIygbSyUJlBGm5iD++aW9xD1zjpEIe+nybieyFpi9ABDpnLiLICxYtwePl1dBEdyxRv6x1RuUGmXKCcgrRdUc5B2i6oQkBaXlRhIC0PqlCQZosqHKTZoDZAeOn5QuyTZcN+vYlNYplQ+Dd+A5Q3fBBjbFJLQ+HkAT5B1EoFaSYUTpxjcA+FpYO0OAonLTH4Fv0ISFMU/ha28bfwOsJoXzX6J5chzPxwAAAAAElFTkSuQmCC",
				  callback: () => {
				    configVisible.value = true
				  }
				},
				{
				  label: "导出",
					className: "dnd-class",
				  icon:
				    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAB2ElEQVR4nO2YwVHCQBSG3yMeRSggjLEDrECsQJnBs1qBdiB2oBXonTjQgbECsQJhoAAIHgnr/6LDJBrYAFm45LvkfxB2v1mWZbNMYNKya4rpDrFG6fCK1l6d670RshZpf8bcZlJllIthvma5GTKvKFeE6weNQQdBi9+yPWI6QdTCq9wcpWDtHe/Xe11ELb5beSZSl5QC9l1b4ToHRb9A1JkpGqFMhJm7aUdHUG2n7E+nt4gh+HwVr54h/iMmhNAvNYYOGeSr7VSDIHhdNJ9iQpjhj8XG8BbRCDoZISakFN2XLoZNMkCSjCIeYxA8pPnXtxWhRTKWZdWC6fScf5acEONCy2TkVzpu2c2tCelkUFJUSN4zJpRGRpAlYRIED+jcwXxqGhFKK5NE5kKbyAiZCm0qI2QqNHbtd8yDKmLIqjJCpkKxttaQETIVmrj2Axq7QfzAbuBqVRkhU6EsyIV05EJJyPo1U8Fhka23nQv5L5UrdPyEKHg7F4r+2wu50F9yIR25kI6lQtjLGH1QTCKyQwiJCWEP0ys1BkeIW2PsVj6xw3Tol5iQIFIFpg7SCKVBuIwDjfOojLD2cYwRFL1tcGCVPazolHENj9wUHtJ2NlIyMui/eDH0vgGOprrAFKCZ3QAAAABJRU5ErkJggg==",
				  callback: () => {
				    document.getElementById('snapshotDownloadId').dispatchEvent(new MouseEvent("click"))
				  }
				}
			])
			
			lf.setTheme({
			  /* rect: {
			    fill: '#fffae1',
			    stroke: '#000000',
			    strokeWidth: 2,
			  }, */
				snapline: {
				    stroke: '#ace2ff', // 对齐线颜色
				    strokeWidth: 1, // 对齐线宽度
				},
			})
			//设置右键菜单
			lf.extension.menu.setMenuConfig({
			    nodeMenu: [
			      {
			        text: '查看',
			        callback(node) {
			         nodeEdit(node)
			        },
			      }
			    ], // 覆盖默认的节点右键菜单
			    edgeMenu: false, // 删除默认的边右键菜单
			    graphMenu: [],  // 覆盖默认的边右键菜单，与false表现一样
			  });
			//渲染
			//lf.render(graphData)
		})
	})
	
	/**
	 * 编辑节点
	 */
	const nodeEdit = (data: any) => {
		console.log(data)
		if(!data.properties.nodeRecordId) {
			Object.assign(nodeDataForm, data)
			nodeDataForm.log = ''
			nodeDataForm.startTime = ''
			nodeDataForm.endTime = ''
			nodeVisable.value = true
			return
		}
		getNodeRecordApi(data.properties.nodeRecordId).then(res=> {
			nodeDataForm.log = res.data.log
			nodeDataForm.startTime = res.data.startTime
			nodeDataForm.endTime = res.data.endTime
			nodeVisable.value = true
			//赋值
			Object.assign(nodeDataForm, data)
		})
	}
	
	// 上下拖动事件
	const dragControllerUD = () => {
		var bottomResize = document.getElementsByClassName('flowDetailBottomResize')
		var topBox = document.getElementsByClassName('flowDetailTopBox')
		var downBox = document.getElementsByClassName('flowDetailBottomBox')
		var box = document.getElementsByClassName('flowDetailBox')
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
	
	defineExpose({
		init
	})
	
</script>

<style>
	#flowDetailContainer {
		height: 100%;
	  width: 100%;
	  /* height: calc(100vh - 200px); */
	}
	.dnd-class {
		padding : 7px;
	}
	/* 主矿体 */
	.flowDetailTopBox {
		height: 70%;
	}
	/* 拖拽区div样式 */
	.flowDetailBottomResize {
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
	/* 底部box */
	.flowDetailBottomBox {
		height: calc(30% - 10px);
	}
	
	.flowDetailBottomTabs {
		height: 100%;
	}
	
	.flowDetailBottomTabs > .el-tabs__content {
		height: calc(100% - 40px);
	  padding: 0;
	}
	/* 每个tab高度设置为100% */
	.flowDetailBottomTabs > .el-tabs__content > .el-tab-pane {
		height: 100%;
	}
	
	.flowDetailBottomTabs .flowCustomTabsLabel {
		font-size: 16px;
	}
	.flowDetailBottomTabs > .el-tabs__header {
	    padding: 0;
	    position: relative;
	    margin: 0 0 0;
	}
</style>