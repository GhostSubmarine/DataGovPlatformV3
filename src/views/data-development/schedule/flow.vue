<template>
		<el-card>
			<div class="flowBox" style="height: 100%;">
				<div class="flowTopBox" v-loading="saveLoading">
					<div class="leftFlowBox">
						<el-scrollbar>
							<div style="height: 100%;" class="flowdiv">
								<el-input v-model="filterCatalogueText" placeholder="search" /><br><br>
								<el-tree
									ref="catalogueTreeRef"
								 :data="catalogueTreeList"
								 default-expand-all
								 node-key="id"
								 :filter-node-method="filterNode"
							 >
									 <template #default="{ node, data }">
										 <div v-if="data.ifLeaf=='1'" class="flow-tree-node">
											 <span>
												 <img v-show="data.ifLeaf=='1'" :src="folderPng"/>
												 <span style="margin-left: 8px;">{{ data.name }}</span>
											 </span>
										 </div>
										 <div v-else @mousedown="startDrag(data)" class="flow-tree-drag—node">
											 <span>
												 <img v-show="data.taskType=='4'" :src="FlinkEnvPng"/>
												 <img v-show="data.taskType == '3'" :src="JarPng"/>
												 <img v-show="data.taskType == '2'" :src="FlinkPng"/>
												 <img v-show="data.taskType=='1'" :src="SqlPng"/>
												 <span style="margin-left: 8px;">{{ data.name }}</span>
											 </span>
										 </div>
									 </template>
								</el-tree>
							</div>
						</el-scrollbar>
					</div>
					<div class="rightFlowBox">
						<div style="height:100%;width:100%" @dragover="allowDropOver" ref="flowContainer" id="flowContainer"></div>
					</div>
				</div>
				<!-- 上下侧边 -->
				<div
					 v-show="runFlag"
				   title="上下侧边栏" 
					 class="flowBottomResize">
				</div>
				<div class="flowBottomBox" v-show="runFlag">
					<el-tabs class="flowBottomTabs">
						<el-tab-pane>
							<template #label>
								<span class="flowCustomTabsLabel">
									<el-icon><Postcard /></el-icon>&nbsp;
									<span>日志信息</span>
								</span>
							</template>
							<read-only-studio id="flowConsoleLog" ref="flowConsoleLogRef" style="height: 100%"></read-only-studio>
						</el-tab-pane>
					</el-tabs>
				</div>
			</div>
		</el-card>
		
		
		<!-- 下载流程图 -->
		<div id="snapshotDownloadId" v-show="false"></div>
		
		<!-- 节点框 -->
		<el-drawer v-model="nodeVisable" direction="rtl" :append-to-body="true">
			<template #header>
			    <h4>编辑调度</h4>
			</template>
			<template #default>
				<el-form ref="nodeDataFormRef" :model="nodeDataForm" :rules="nodeDataRules" label-width="100px" @keyup.enter="nodeSubmit()">
					<el-form-item label="名称" prop="properties.name" label-width="auto">
						<el-input v-model="nodeDataForm.properties.name" placeholder="名称"></el-input>
					</el-form-item>
					<el-form-item label="作业类型" prop="properties.taskTypeVal" label-width="auto">
						<el-input disabled v-model="nodeDataForm.properties.taskTypeVal" placeholder="作业类型"></el-input>
					</el-form-item>
					<el-form-item label="权重" prop="properties.weight" label-width="auto">
						<el-input-number v-model="nodeDataForm.properties.weight" :min="1" :max="100"></el-input-number>
					</el-form-item>
					<el-form-item label="遇错是否继续" prop="properties.failGoOn" label-width="auto">
						<fast-select v-model="nodeDataForm.properties.failGoOn" dict-type="yes_or_no"  placeholder="请选择"></fast-select>
					</el-form-item>
					<el-form-item label="备注" prop="properties.note" label-width="auto">
						<el-input  :rows="2" type="textarea" v-model="nodeDataForm.properties.note" placeholder="备注"></el-input>
					</el-form-item>
				</el-form>
			</template>
			<template #footer>
				<el-button @click="nodeVisable = false">取消</el-button>
				<el-button type="primary" @click="nodeSubmit()">确定</el-button>
			</template>
		</el-drawer>
		
		<!-- 调度任务保存 -->
		<el-dialog v-model="configVisible" title="调度配置"  @keyup.enter="scheduleSubmit(false)">
			<el-form ref="scheduleFormRef" :model="scheduleForm" :rules="scheduleRules" label-width="100px">
				<el-form-item prop="orgId" label="所属机构" label-width="auto">
					<el-tree-select
						clearable
						v-model="scheduleForm.orgId"
						:data="orgList"
						check-strictly
						value-key="id"
						:props="{ label: 'name', children: 'children' }"
						style="width: 100%"
					/>
				</el-form-item>
				<el-form-item label="调度名称" prop="name" label-width="auto">
					<el-input v-model="scheduleForm.name" placeholder="调度名称"></el-input>
				</el-form-item>
				<el-form-item label="周期执行" prop="ifCycle" label-width="auto">
					<fast-select v-model="scheduleForm.ifCycle" dict-type="yes_or_no" placeholder="请选择" clearable filterable></fast-select>
				</el-form-item>
				<el-form-item label="cron表达式" prop="cron" label-width="auto" v-if="scheduleForm.ifCycle=='1'">
					<el-input v-model="scheduleForm.cron" placeholder="cron表达式"></el-input>
					<!-- <el-popover ref="cronPopover" :width="550" trigger="click">
						<Cron @submit="changeCron" @close="cronPopover.hide()"></Cron>
						<template #reference>
							<el-input v-model="scheduleForm.cron" placeholder="cron表达式"></el-input>
						</template>
					</el-popover> -->
				</el-form-item>
				<el-form-item label="备注" prop="note" label-width="auto">
					<el-input  :rows="2" type="textarea" v-model="scheduleForm.note" placeholder="备注"></el-input>
				</el-form-item>
		  </el-form>
			<template #footer>
				<el-button @click="configVisible = false">取消</el-button>
				<el-button type="primary" @click="scheduleSubmit(false)">确定</el-button>
			</template>
		</el-dialog>
</template>

<script setup lang="ts" name="Data-developmentScheduleFlow">
	import { reactive, ref, onMounted,watch,nextTick } from 'vue'
	import LogicFlow from '@logicflow/core'
	import { Menu,Control,SelectionSelect,DndPanel,Snapshot } from '@logicflow/extension';
	import "@logicflow/core/dist/style/index.css"
	import '@logicflow/extension/lib/style/index.css'
	import TaskModel from './UserTaskNode.js'
	import FlowLink from "./FlowLink.js";
	import FlinkPng from "../../../assets/flink.png"
	import SqlPng from "../../../assets/sql.png"
	import JarPng from "../../../assets/jar.png"
	import FlinkEnvPng from "../../../assets/flinkenv.png"
	import folderPng from "../../../assets/folder.png"
	import { useCatalogueListApi } from '@/api/data-development/catalogue'
	import { ElMessage, ElMessageBox } from 'element-plus/es'
	import store from '@/store'
	import { getDictLabel } from '@/utils/tool'
	import Cron from '@/components/fast-cron/index'
	import { useScheduleSubmitApi,useScheduleApi,runFlowApi,getConsoleLogApi,getNodeInfoApi } from '@/api/data-development/schedule'
	import ReadOnlyStudio from '../production/readonly-studio.vue'
	import { ElNotification } from 'element-plus'
	import { useOrgListApi } from '@/api/sys/orgs'
	
	//cron表达式，流程配置
	const emit = defineEmits(['refreshDataList'])
	const configVisible = ref(false)
	const cronPopover = ref()
	const scheduleFormRef = ref()
	const orgList = ref([])
	
	const graphData = {
		nodes: [],
		edges: []
	}
	const runFlag = ref(false)
	const init = (id: number, ifRun: any) => {
		// 重置表单数据
		scheduleForm.id = ''
		scheduleForm.orgId = ''
		scheduleForm.name = ''
		scheduleForm.ifCycle = ''
		scheduleForm.cron = ''
		scheduleForm.note = ''
		scheduleForm.status = ''
		scheduleForm.releaseTime = ''
		scheduleForm.releaseUserId = ''
		scheduleForm.nodes = []
		scheduleForm.edges = []
		flowConsoleLogRef.value.setEditorValue('')
		flowEnd.value = false
		var bottomResize = document.getElementsByClassName('flowBottomResize')
		var topBox = document.getElementsByClassName('flowTopBox')
		var downBox = document.getElementsByClassName('flowBottomBox')
		bottomResize[0].style.height = "0"
		topBox[0].style.height = "100%"
		downBox[0].style.height = "0"
		
		//获取部门列表
		useOrgListApi().then(res => {
			orgList.value = res.data
		})
		
		//如果id不为空，给scheduleForm赋值
		if(id) {
			useScheduleApi(id).then(res=> {
				Object.assign(scheduleForm, res.data)
				graphData.nodes = scheduleForm.nodes
				graphData.edges = scheduleForm.edges
				//渲染
				lf.render(graphData)
				if(ifRun) {
					bottomResize[0].style.height = "10px"
					topBox[0].style.height = "70%"
					downBox[0].style.height = "calc(30% - 10px)"
					runFlag.value = true
					runFlow(id)
				}
			})
		} else {
			//渲染
			graphData.nodes = []
			graphData.edges = []
			lf.render(graphData)
		}
	}
	
	const changeCron = (val: any) => {
		scheduleForm.cron = val
	}
	
	const scheduleForm = reactive({
		orgId: '',
		id: '',
		name: '',
		ifCycle: '',
		cron: '',
		note: '',
		nodes: [],
		edges: []
	})
	
	const scheduleRules = ref({
		orgId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
		name: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
		ifCycle: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
		cron: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	})
	
	const saveLoading = ref(false)
	//保存流程
	const scheduleSubmit = (submit: any) => {
		if(submit) {
			//校验
			if(!scheduleForm.name || scheduleForm.ifCycle === '' || (scheduleForm.ifCycle == '1' && !scheduleForm.cron)) {
				ElMessage.warning("请点击配置，配置完调度信息再保存！")
				return
			}
			saveLoading.value = true
			let graphData =  lf.getGraphData()
			scheduleForm.nodes = graphData.nodes
			scheduleForm.edges = graphData.edges
			scheduleForm.cron = scheduleForm.ifCycle == '1' ? scheduleForm.cron : ''
					
			useScheduleSubmitApi(scheduleForm).then(() => {
				ElMessage.success({
					message: '保存成功',
					duration: 500,
					onClose: () => {
						//刷新分页
						emit('refreshDataList')
					}
				})
			}).finally(() => {
				saveLoading.value = false
			})
		} else {
			scheduleFormRef.value.validate((valid: boolean) => {
				if (!valid) {
					return false
				}
				ElMessage.success({
					message: '操作成功',
					duration: 500,
					onClose: () => {
						configVisible.value = false
					}
				})
			})
		}
	}
	
	
	//节点编辑框
	const nodeVisable = ref(false)
	const nodeDataFormRef = ref()
	
	const nodeDataForm = reactive({
		id: "",
		properties: {
			name: '',
			taskType: '',
			taskTypeVal: '',
			taskId: '',
			note: '',
			failGoOn: '',
			weight: 1
		},
		type: "",
		x: 490,
		y: 230,
	})
	
	const nodeDataRules = ref({
		properties: {
			name: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
			taskTypeVal: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
			failGoOn: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
			weight: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
		},
	})
	
	let lf = null
	onMounted(()=>{
		nextTick(()=>{
			//初始化上下拖动
			dragControllerUD()
			//加载作业目录树
			getCatalogueTreeList()
			//加载流程引擎
			lf = new LogicFlow({
			  container: document.querySelector('#flowContainer'),
				grid: {
				  visible: true,
				  type: 'mesh',
				  size: 10,
				  config: {
				    color: '#eeeeee'
				  }
				},
				keyboard: {
				  enabled: true,
				},
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
			    label: "开启选区",
					className: "dnd-class",
			    icon:
			      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAApxJREFUWEftmM1u00AQx2eMJbjhOtwBKY7EifIG8ASUJ6Ac4xxo3sB5gqSH2kfCE8AjlCcgN6Q4UsOduO6tElYGzeaja9exvXI2oVL24jhez/zyn8zO7qDth9cAYMFixJHrHC0/a7mo+kPbD0kmiVwH5XvbD/sEcCx9FxMm3bj9airPs4JfL5DMvvRjAQFGket0M/YK/WVVKQcMJgMkWgPOEWKC5CwXEMyBQetoACGOonbzrC5gDABPl0ZuItdZhVtXiJX8pcKphaim0QNgTQE50f7vIQDtYDLgazbjdKGr+BOADT+85OvMdd7qgpLtqvg7AOZFRFnBoyD8zoau287JLkKs4k+EmOuo2Clk6qsuWBV/D2OZ0aXUNuweFKyr4sNIEpW0r6sIv6/i71BJtlJJVEqPaoiti/Fx3GmN5PeeBaHYlPxpO2KTUjS0b7cWp0aaIhjezG1+LQPKPte+Dtr+eAiAH9kxAVw+QuhVUW4Fqh2QQ2wg/pSVYVDC5FOV2o9sABAXx06im+z/RTUkefNtP+T/4Ot7zxCHc/jbKwItPbhvA7BxMT4lxC8bbMWAMJjfmudx9yWfmVOjFDDTSxEvz4neZJW+F0qCXtRxvJU32w/lA3seawxEXtRpncsPSwHZsWlgqtuQ3Jqj7K+1+leW+SRZt0gSSKZy6MRBiehzeUTSGY/84qr3ktdLKTdYbQZvUg0yr6rNvst47VksA3ENRoL3VSER4MdOARv+5ISAvlUA/I1E3qzTGu4UkMFsP+S+4vM8SKEYgicv5PsA5H4hNzrTywngh5nbFKfLVBZXkHurUzjbjccJt53Xg5Xb1NXYuYKLMN/VZ743EN5tqs97AZQX9SL1GH4vgMtkEfW5SL29AnJ9BsTTso7aP9GfT0LnGEEPAAAAAElFTkSuQmCC",
			    callback: () => {
			      lf.openSelectionSelect()
			      /* lf.once("selection:selected", () => {
			        lf.closeSelectionSelect();
			      }); */
			    }
			  },
				{
				  label: "关闭选区",
					className: "dnd-class",
				  icon:
				    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAD70lEQVR4nN2XX1LTQBjAv63yZKP1Bs6gM75Zn9Xp9gTiCagnsJyg4QTUE1BPIJygYZRn4zNwBoHA+AB0/W1I2vzpkhTKDONvpvBld/t9v+wm20TJA+P/EDK63YquzjrKSFuMtMjSppkOCYmPjZLQe9TcU0F4TOtCLCR0+mF1DYl1Cq9xWI2SHf589X4eBlKTWkLR+5daRAZijJYsSu0hd0yWkCM7Q23iFuM6HM1QKhCRzTpilULIWBFfUpAwygy9R17gWhK7pOdX52vGmB7fncop1eg3fx58JXTiFLJJo4toiwE9iVG/Gd2vc5ZZOCEtRoYi5g2HhDLyVrwN18lQbz6n71a36ewJkOTb0/2jntwB8o3It05o843I95mwhOJTgrPymeqBgGo0Pjd/HIxkCeTyitpo7h8OCXOUhPiS5ktjQnsmd56ZItmZ4qLqFi8B+vIgNEZI0/Xb2z9syz0QvXsZcrpvEAoQ6tI0RfGZEu8zE/lOSE/ZHllNoi/qcWOzGRyQ1M1f/frF5eXFFolK+1CcJ1mFYp2cEOY7IuYjg/YYpKVAOt2G3bjxuNF1SZ3pV+3J5WTMJtqixC4zvUZzDqQCpDrFfvJfY2/zs4voD6GYhnx6+uNohzBHUiig0DOXVDImlmHMCWN0cYzl7MOrnplMtgmlueI9T7eBqVB2ubIDiiQF50olfZUyFtcETIWYQp8pHLiWK0tSOCdFs9BWSyaFmgE1O9TcpKYvoPjERO9Xh9znX2jKramLohRNQlxbxjITEi78oz5NhAmzzpltFVkpDmURGQs1fWoOqLlHTS2wDKF4mTi0QvHyLUlo9TZLFssgckKTEMfLV1cKoQChDhZzl8ync5C1dVGUQUAL0BbQVluKmgE1O9TcpKYvMBVa8LbPyaSFk75aUpW3vWtAlqTgXJmUZEylVOXGaMn8dJR+9CxpP4XmyqRkpSgx95pkudIf8Vy/4jMlu2xIdZEKJANJNBd+X60o3yWTYqXMpRkaHneLs32dx4wJS3VyQhYGBwzu0BVi/pampcNM/xIxvBCUb6B5QhqhMSGT4X7UvC08MWyr5NEYoS5CgWSgrwxSPlIDgTpvCnUh74C8vkDtR9gUzmRE5zqhmCXMFPmmM0M+56MxY+ZjtwFeg4YMWOcQVMjojeIUV8GsaAy2xF4zYJDhNaif3uZFqHczJPSZ5oGksCUoY0ZPVrxdV1J7MucXEduD6vFdLQmuZcpSKWRBSouIT/IO/2cgJ9cEco0WS0YihruJv36d2VV8ahOLsQ8JmyOHNVC7VBjWEUlZSCjFLkl0FWllVJujFmnaNIMJiY/ZDMOb3v1v4lZC98mDE/oHyhq3Q9XngUAAAAAASUVORK5CYII=",
				  callback: () => {
				    lf.closeSelectionSelect()
				  }
				},
				{
				  label: "清空画布",
					className: "dnd-class",
				  icon:
				    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAEnklEQVR4nLWY21XbQBCGR1yeERVEqQC5AkQFERUgKsA5h8tjzCOXc0wqwFQQUYHlCiwqsFIB4pmL842sVdaOZGxivnOG2R2tdv7dWck2jnwC3W7Xe3l5ORiPxzndwenpaYpfiJULQoz7/Pw8oulihhyLNzc3v4O2G1m5oKurqzY703UcZ29jYyNFXEg7IBZyecRutfCNrFzQ5eVljPNJ7InFxcVFB2E/iM/NOffiR0DQI4nvT05OIrEgXit0lpUKolxamj7NQxL3xAJBtUJnWakgUxYO71cObyYl84TOslJB7MIQQQ674NOtaBJax1KCrq+vw7e3twOaIZaQJGHl96w6LR/3R+I/6bfxFU1C61hYEJNGInKL/cYyEfFE5Aum5FgmHNq1tbX94+PjmHbBPKF1ONi7mDPAIh94twRse05Yk3kkC4jr9ZCQkNTFVZS7+mtWaBPvCmJnfJyK+W2LWRTuv8Edcf8NomMED+g34mCNMJmP62MOB9JHTCZLorsrIipmB29IZPJRcsecOe2KRkGUQ2s/oqljAlaW4j+Mzvf6+lqUFgtkcv5SRO3ZojRZLaysx40Hi9Z+Wcz8NKcO+7uCaGbUP8YnnKGBvZr/hRwpOcYIqj5wGwUp3NBmfJemTaoCiSdMNKD/YTijN7gj5nHwBVWjDuquj/UIAXcqAB/gA5nU3xBjiSz5RUwxrwTm3eOlmQjMFWTtUMtOxsp8JjHiAhHZwpQcizl3yfr6upY3kzmYBY/H4/Ozs7OOwFxBJB7ithHjyRwQHrDSQEWKyC5myIjF+MbzR45MOAbkCPHNgjQJyvtjS/0isOri8TYCuX+HsCElFhOrzh+CYtwu/W18syAGDnFfeU94dStbFARqWQKEqLiQ0BZmiDFP+AxEkIOX4o8NE+gL8ZZmyFlY+TuIhfqWuF1MuUeQ9qcFMfgI15HJL4ZDBvXkkzDfkWi2yJPiCypBnJk2qrs0B1jbHmRAsE8Jc0qYyX9iBJHHoVtRdUj2iHtgQCA1cD0Svg8xyR3vjEhKKLGesUyWhPli3DfyVRqUqsMANqj+iTIvMJqCoD0EJQLc08f5TFo8IcvAvYkA9wZiYQvKcSMGtPAVxH2cJnaxAdcDAeK3uEismEI8ksnK9/GNMG6Mu2dciK+wBUVCSbAci3nCEhF5Ymc09oDtmt2xxs7umI8bYk8kcvEFlFWf3ANiP+kWMJaC/FuRSpBSliYSVogVkPCBGzMR2eFAt/gnwhH9ThnPSRIIlElHNF3iU4lI3scF3FOI5wHSx15jh9zfE4spQTZ6ExO4+h5iwpzQFlbAZOcOTwhWJOC6T/gXto0JwvWg5zSFa7e4SPhxQHJPoFz41IeqoVGQja7efBwIr38EeUz2g7YmTYTVy2QuvZaY3WFRXfptmsohgnoC5pFH+Pb3UrhBJ1kaFUh5QiYNSBgSEs5chGDdJT1/Me1ARPYZkzHGRYwnJQjtEQuJuXSn+JCgOkqRPfl7/p4QVohEVIfSnBPTEvq4PrHa3/kOtnLYgYCvGxkCXbpDzJBiPvZEuXzKlckMnyLIRnfOOn8qJkVMBzE57X/4A1G40kNYd7HYAAAAAElFTkSuQmCC",
				  callback: () => {
				    lf.clearData()
				  }
				},
				{
				  label: "配置",
					className: "dnd-class",
				  icon:
				    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAB+ElEQVR4nO3X3VHCQBSG4XPQe+lAbUDjvY7YgXagHYgWIBSgYAXSgSUQBwoINAAlxHvg+B0kTIBNyIZN1BnfGSfZuHGfMT8in5y/CP2i/kHb+hOgDyLxqZS4RkSX+FpmAElz2H9sUAmdnD83QHiiWE5AXq1VDfx6iF2rCgEB482m0q0Q14NevUMWOQdFGBKqYkgV5jsblFPQOibKBuUaVJWJ+Dj5FMOVsqKcgrRU1D6f4UYPsJuYc5CWgnod9h/usU2sEJBmQjHTeNB7OMZuYrlBWNDDZoxLEGJrDHOOZhMZYXfZtsuWC4SF5k8TC415n6+wQIjDK2GO/oa6+EEehvFSL5s1CAvNMbR4tJkoWEdhjhGDS/bJe1zD3ABDY1YgXQiYUYSJiqN0jgmjZXn0rUCEvIvW7UzkDbsrLVA3MpF3wTQc2owprOzN4QFGmUsFaUmoTOVAbQVpZaIygbSyUJlBGm5iD++aW9xD1zjpEIe+nybieyFpi9ABDpnLiLICxYtwePl1dBEdyxRv6x1RuUGmXKCcgrRdUc5B2i6oQkBaXlRhIC0PqlCQZosqHKTZoDZAeOn5QuyTZcN+vYlNYplQ+Dd+A5Q3fBBjbFJLQ+HkAT5B1EoFaSYUTpxjcA+FpYO0OAonLTH4Fv0ISFMU/ha28bfwOsJoXzX6J5chzPxwAAAAAElFTkSuQmCC",
				  callback: () => {
				    configVisible.value = true
				  }
				},
				{
				  label: "保存",
					className: "dnd-class",
				  icon:
				    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAACTklEQVR4nO2YQW7aQBSG/2ck0u7SEzQ9QZxlqi6cFbSbkhMU0wPEPUGTG9ALgHsDd9OSVV2pgmV8g3CD0lUKavP6PwsoQQSMcBGK/G1mxthvPlnz5g0W7BhTIa9dPRhCz6BwOdwegmQP8iH2O32QVMhkRqpXCvkpihAzqOh73vaN12PMoYI6CH8LkYFxrI+8v48xjOEJ9LAscmRSqdDzVqWpkFqv0TnAHMetCuPIRfdt5xxzHLeqMQif85ABi1USOfnud2LMwPkjNv1u4zJIhSwwrePFk/5/oeP2yxpUA4uzE0Iv2lXvj+Lc4hRChdAyLNbGQkzJhA13BYnY3kFV6wwwKMEJOFzKb7llJiEQKR11/c8JL01ZT6j9ylW9jTj9Uw43Q5x3Pf9Lk707rCW0DR6ukNeu7Y/w64xryQLtc50lZeDCahLWIBchkxnqzRUXhvDZUB0ZcJXXrFA6IqfzmbSMXIT4TMjJ3bI89mI/GvBSCrMyUuCw17h8xmEmchKqcCtwTpk1EYdT7CgzVL1elN73sbHQZNJFm5xhsvf9toiNhQyblKvH7/qdEDNMZLf6hgyulSabN5DSyWRiW+gjvfnKrvCw5bLNRC5C48lj5QLmMIZgwBgex8K3400ks5CL0ASe9gJLd3ZhMcrOo+Zs1mUhV6E8KIRWUQitohBaRSG0Cm6uNW6u//5KW13ilv96nTNMnrBQXwvwifUvYGt1Ka3QCbs/WIhCbBEef+sAnuyJuHb0TYUMk+I3okAhLodbg6fOhN+GmiYDMhXaFf4CTcCPQ+zhcRQAAAAASUVORK5CYII=",
				  callback: () => {
						let graphData =  lf.getGraphData()
						scheduleForm.nodes = graphData.nodes
						scheduleForm.edges = graphData.edges
						scheduleSubmit(true)
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
			      },
						{
						  text: '删除',
						  callback(node) {
						    lf.deleteNode(node.id);
						  },
						},
			    ], // 覆盖默认的节点右键菜单
			    //edgeMenu: false, // 删除默认的边右键菜单
			    graphMenu: [],  // 覆盖默认的边右键菜单，与false表现一样
			  });
			//监听新增的拖拽节点
			lf.on('node:dnd-add', (data) => {
				//console.log(data)
				nodeEdit(data.data)
			})
			//渲染
			//lf.render(graphData)
		})
	})
	
	const catalogueTreeRef = ref()
	const catalogueTreeList = ref<Tree[]>([])
	const filterCatalogueText = ref('')
	const NodeAddOrUpdateRef = ref()
	/**
	 * 获取目录树
	 */
	const getCatalogueTreeList = () => {
		useCatalogueListApi().then(res=>{
			catalogueTreeList.value = res.data
		})
	}
	
	watch(filterCatalogueText, (val) => {
	  catalogueTreeRef.value!.filter(val)
	})
	
	/**
	 * 节点筛选
	 */
	const filterNode = (value: string, data: Tree) => {
	  if (!value) return true
	  return data.label.includes(value) || data.label.includes(value.toUpperCase()) || data.label.includes(value.toLowerCase())
	}
	
	const allowDropOver = (ev) => {
	  ev.preventDefault()
	}
	//添加呗拖拽的节点
	const startDrag = (item) => {
		if(item.taskType == '1' || item.taskType == '2' || item.taskType == '3') {
			lf.dnd.startDrag({
			  type: "UserTask",
			  properties: {
					name: item.name,
					taskType: item.taskType,
					taskTypeVal: getDictLabel(store.appStore.dictList, "production_task_type",  item.taskType ),
					taskId: item.taskId,
					note: '',
					weight: 1,
					failGoOn: 0,
					/* ,
					style: { border: '3px solid #e30000'} */
			  }
			})
		} else {
			ElMessage.warning("只能拖动 sql 或 flinkSql 类型的节点")
		}
	}
	
	/**
	 * 编辑节点
	 */
	const nodeEdit = (data: any) => {
		nodeVisable.value = true
		nodeDataForm.id = ''
	
		// 重置表单数据
		if (nodeDataFormRef.value) {
			nodeDataFormRef.value.resetFields()
		}
		
		console.log(data)
		
		//赋值
		Object.assign(nodeDataForm, data)
	}
	
	/**
	 *  保存节点到lf
	 */
	const nodeSubmit = () => {
		nodeDataFormRef.value.validate((valid: boolean) => {
			if (!valid) {
				return false
			}
			lf.getNodeModelById(nodeDataForm.id).setProperties(nodeDataForm.properties)
			ElMessage.success("操作成功")
			nodeVisable.value = false
		})
	}
	
	/**
	 * 运行流程
	 */
	const flowConsoleLogRef = ref()
	const runFlow = async (id) => {
		//提示
		ElNotification({
				title: '提示',
				message: '正在提交流程。。。',
				duration: 0,
				zIndex: 9999,
				type: 'success',
		})
		//获取recordId
		const { data } = await runFlowApi(id)
		//console.log(data)
		ElNotification.closeAll()
		//提示
		ElNotification({
				title: '提示',
				message: '正在执行流程，请耐心等待。。。',
				duration: 0,
				zIndex: 9999,
				type: 'success',
		})
		//获取日志
		getConsoleLog(data)
		//设置节点状态
		setNodeStatus(data)
	}
	
	//流程结束标识
	const flowEnd = ref(false)
	//每1s获取一次日志
	const getConsoleLog = (recordId: any) => {
		 getConsoleLogApi(recordId).then(res=> {
			 //设置log
			 if(res.data.log != flowConsoleLogRef.value.getEditorValue()) {
				 flowConsoleLogRef.value.setEditorValue(res.data.log)
			 }
				//如果没结束，再次调用
			 if(!res.data.end) {
				 setTimeout(() => {getConsoleLog(recordId)},1500)
			 } else {
				 flowEnd.value = true
			 }
		 })
	}
	
	//设置每个节点的状态，成功-绿色 失败-红色
	const setNodeStatus = (recordId: any) => {
		if(!flowEnd.value) {
			setNodeInfo(recordId)
			//递归
			setTimeout(() => {setNodeStatus(recordId)},1500)
		} else {
			setNodeInfo(recordId)
			ElMessage.success("调度流程执行完毕，请前往调度记录查看具体执行情况！")
			ElNotification.closeAll()
		}
	}
	
	const setNodeInfo = (recordId: any) => {
		getNodeInfoApi(recordId).then(res=>{
			let nodeList = res.data
			for(let i in nodeList) {
				const nodeInfo = nodeList[i]
				const nodeModel = lf.getNodeModelById(nodeInfo.scheduleNodeNo)
				if(nodeModel) {
					const properties = nodeModel.getProperties();
					if (nodeInfo.runStatus == 3) {
						properties.style = {"border": "3px solid #06c733"}
						//关闭动画
						if(nodeInfo.edgeId) {
							lf.closeEdgeAnimation(nodeInfo.edgeId)
						}
					} else if (nodeInfo.runStatus == 4) {
						properties.style = {"border": "3px solid #e30000"}
						//关闭动画
						if(nodeInfo.edgeId) {
							lf.closeEdgeAnimation(nodeInfo.edgeId)
						}
					} else {
						//开启边的动画效果
						if(nodeInfo.edgeId) {
							lf.openEdgeAnimation(nodeInfo.edgeId)
						}
					}
					nodeModel.setProperties(properties)
				}
			}
		})
	}
	
	// 上下拖动事件
	const dragControllerUD = () => {
		var bottomResize = document.getElementsByClassName('flowBottomResize')
		var topBox = document.getElementsByClassName('flowTopBox')
		var downBox = document.getElementsByClassName('flowBottomBox')
		var box = document.getElementsByClassName('flowBox')
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
		init,
		runFlow
	})
	
</script>

<style>
	#flowContainer {
		height: 100%;
	  width: 100%;
	  /* height: calc(100vh - 200px); */
	}
	.dnd-class {
		padding : 7px;
	}
	/* 主矿体 */
	.flowTopBox {
		height: 70%;
		display: flex;
	}
	/* 左侧布局 */
	.leftFlowBox {
		height: 100%;
		flex: 1;
	}
	/* 右侧布局 */
	.rightFlowBox {
		height: 100%;
		flex: 5;
	}
	/* 拖拽区div样式 */
	.flowBottomResize {
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
	.flowBottomBox {
		height: calc(30% - 10px);
	}
	/* 树节点相关属性 */
	.flowdiv .el-tree-node__content {
			height: 35px;
		}
	.flow-tree-node {
		 font-size: 16px;
		-webkit-user-select: none;
		-khtml-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}
	.flow-tree-drag—node {
		font-size: 16px;
		cursor: move;
		-webkit-user-select: none;
		-khtml-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}
	
	.flowBottomTabs {
		height: 100%;
	}
	
	.flowBottomTabs > .el-tabs__content {
		height: calc(100% - 40px);
	  padding: 0;
	}
	/* 每个tab高度设置为100% */
	.flowBottomTabs > .el-tabs__content > .el-tab-pane {
		height: 100%;
	}
	
	.flowBottomTabs .flowCustomTabsLabel {
			font-size: 16px;
	}
	.flowBottomTabs > .el-tabs__header {
	    padding: 0;
	    position: relative;
	    margin: 0 0 0;
	}
	.el-notification.right {
	    height: 100px;
	}
</style>