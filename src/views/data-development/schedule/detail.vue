<template>
		<el-card>
			<div class="scheduleDetailBox" style="height: 100%;" v-loading="boxLoading">
				<div class="scheduleDetailTopBox">
					<div style="height:100%;width:100%"  id="scheduleDetailContainer"></div>
				</div>
			</div>
		</el-card>
		
		
		<!-- 下载流程图 -->
		<div id="snapshotDownloadId" v-show="false"></div>
		
		<!-- 节点框 -->
		<el-drawer size="45%" v-model="nodeVisable" direction="rtl" :append-to-body="true">
			<template #header>
			    <h4>{{nodeDataForm.properties.name}}</h4>
			</template>
			<template #default>
				<el-descriptions
				    title=""
				    :column="1"
				    size="large"
						border
				  >
				    <el-descriptions-item label="名称">{{nodeDataForm.properties.name}}</el-descriptions-item>
						<el-descriptions-item label="作业类型">{{nodeDataForm.properties.taskTypeVal}}</el-descriptions-item>
						<el-descriptions-item label="权重">{{nodeDataForm.properties.weight}}</el-descriptions-item>
						<el-descriptions-item label="遇错是否继续">{{nodeDataForm.properties.failGoOn?'是':'否'}}</el-descriptions-item>
						<el-descriptions-item label="备注">{{nodeDataForm.properties.note}}</el-descriptions-item>
				</el-descriptions>
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
	import { useScheduleApi } from '@/api/data-development/schedule'
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
	const init = (id) => {
		useScheduleApi(id).then(res=> {
			Object.assign(scheduleForm, res.data)
			graphData.nodes = scheduleForm.nodes
			graphData.edges = scheduleForm.edges
			//渲染
			lf.render(graphData)
			boxLoading.value = false
		})
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
			//加载流程引擎
			lf = new LogicFlow({
			  container: document.querySelector('#scheduleDetailContainer'),
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
		nodeVisable.value = true
		Object.assign(nodeDataForm, data)
	}
	
	defineExpose({
		init
	})
	
</script>

<style>
	#scheduleDetailContainer {
		height: 100%;
	  width: 100%;
	  /* height: calc(100vh - 200px); */
	}
	.dnd-class {
		padding : 7px;
	}
	/* 主矿体 */
	.scheduleDetailTopBox {
		height: 100%;
	}
	
</style>