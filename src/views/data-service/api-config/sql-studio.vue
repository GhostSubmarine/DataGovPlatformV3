<template>
	<div class="sqlBox">
		<div>
			<el-switch
				v-model="debuged"
				:active-value="true"
				:inactive-value="false"
				inline-prompt
				style="--el-switch-on-color: #8aa0ff; --el-switch-off-color: #cec5be"
				active-text="关闭调试"
				inactive-text="打开调试"
					/>
		</div>
		<div class="sqlTopBox" v-if="debuged">
			<div>
				<el-button text @click="handleFormat()"><img src="@/assets/format.png"/></el-button>
				<el-button :loading="executeSqlButton" @click="executeSql()" text><img src="@/assets/run.png"/></el-button>
			</div>
			<div style="margin:auto">
				<el-button size="small" type="warning" round @click="addTag('trim')">trim</el-button>
				<el-button size="small" type="warning" round @click="addTag('if')">if</el-button>
				<el-button size="small" type="warning" round @click="addTag('where')">where</el-button>
				<el-button size="small" type="warning" round @click="addTag('foreach')">foreach</el-button>
			</div>
		</div>
		<div class="sqlMiddleBox">
			<div class="sqlLeftBox">
				<div id="sqlCodeEditBox"></div>
			</div>
			<div class="rightResize"></div>
			<div class="sqlRightBox">
				<JsonStudio ref='JsonStudioRef'></JsonStudio>
			</div>
		</div>
		<div class="sqlBottomBox" v-if="debuged">
			<el-tabs class="sqlBottomTabs">
				<el-tab-pane>
					<template #label>
						<span class="sqlCustomTabsLabel">
							<el-icon><Postcard /></el-icon>&nbsp;
							<span>执行结果</span>
						</span>
					</template>
					<ConsoleResult ref="consoleResultRef"></ConsoleResult>
				</el-tab-pane>
			</el-tabs>
			<el-divider></el-divider>
		</div>
	</div>
</template>

<script lang="ts" setup>
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import * as monaco from 'monaco-editor';
import { format } from 'sql-formatter'
import { language as sqlLanguage } from 'monaco-editor/esm/vs/basic-languages/sql/sql.js';
import { nextTick,ref,onBeforeUnmount,onMounted,inject } from 'vue'
import JsonStudio from './json-studio.vue'
import ConsoleResult from '../../data-development/production/console-result.vue'
import { ElMessage } from 'element-plus/es'
import { executeSqlApi } from '@/api/data-service/apiConfig'


const text=ref('')
const language=ref('sql')
const editorTheme = ref("vs-dark")
const executeSqlButton = ref(false)

const debuged = ref(false)
const apiSqlForm = inject("apiSqlForm")
// 
// MonacoEditor start
//
onBeforeUnmount(()=>{
	 editor.dispose() 
	 sqlCompletion.dispose()
	 console.log("editor dispose")
 })
 
onMounted(()=>{
 editorInit()
 console.log("editor init")
})
 
const sqlCompletion = monaco.languages.registerCompletionItemProvider('sql', {
     provideCompletionItems: function () {
         let suggestions = [];
         sqlLanguage.keywords.forEach(item => {
             suggestions.push({
                 label: item,
                 kind: monaco.languages.CompletionItemKind.Keyword,
                 insertText: item
             });
         })
         sqlLanguage.operators.forEach(item => {
             suggestions.push({
                 label: item,
                 kind: monaco.languages.CompletionItemKind.Operator,
                 insertText: item
             });
         })
         sqlLanguage.builtinFunctions.forEach(item => {
             suggestions.push({
                 label: item,
                 kind: monaco.languages.CompletionItemKind.Function,
                 insertText: item
             });
         })
         sqlLanguage.builtinVariables.forEach(item => {
             suggestions.push({
                 label: item,
                 kind: monaco.languages.CompletionItemKind.Variable,
                 insertText: item
             });
         })
         return {
             suggestions:suggestions
         };
     },
 });
 
 
// @ts-ignore
self.MonacoEnvironment = {
	getWorker(_: string, label: string) {
		if (label === 'json') {
			return new jsonWorker()
		}
		if (label === 'css' || label === 'scss' || label === 'less') {
			return new cssWorker()
		}
		if (label === 'html' || label === 'handlebars' || label === 'razor') {
			return new htmlWorker()
		}
		if (['typescript', 'javascript'].includes(label)) {
			return new tsWorker()
		}
		return new EditorWorker()
	},
}
let editor = null;
//从父组件获取当前每个tab对应的值和编辑的tab名称
/* const editorValues = inject("editorValues")
const editableTabsValue = inject("editableTabsValue") */

const editorInit = () => {
		nextTick(()=>{	
				!editor ? editor = monaco.editor.create(document.getElementById('sqlCodeEditBox') as HTMLElement, {
						value:text.value, // 编辑器初始显示文字
						language: language.value, // 语言支持自行查阅demo
						automaticLayout: true, // 自适应布局  
						theme: editorTheme.value,  // 官方自带三种主题vs, hc-black, or vs-dark
						foldingStrategy: 'indentation',
						renderLineHighlight: 'all', // 行亮
						selectOnLineNumbers: true, // 显示行号
						minimap:{
								enabled: true,
						},
						cursorStyle: 'line', //光标样式
						readOnly: false, // 只读
						fontSize: 16, // 字体大小
						autoIndent: true, //自动布局
						useTabStops: false,
						quickSuggestionsDelay: 100, //代码提示延时
						scrollBeyondLastLine: false, // 取消代码后面一大段空白 
						overviewRulerBorder: false, // 不要滚动条的边框  
				}) : 
				editor.setValue("");
				// console.log(editor)
				// 监听值的变化
				/* editor.onDidChangeModelContent((val:any) => {
					  //editor.trigger('', 'editor.action.triggerSuggest', {});
						text.value = editor.getValue();
						//把当前最新的数据放入缓存
						if(editorValues[editableTabsValue.value]) {
							editorValues[editableTabsValue.value]["codeText"] = text.value
						}
						//console.log(editorValues)
				}) */
				//sql提醒
				sqlCompletion
		})
}

const addTag = (tagVal: any) => {
	let editorVal = getEditorValue()
	editorVal = editorVal ? editorVal + '\n' : ''
	if(tagVal == 'trim') {
		setEditorValue(editorVal + '<trim prefix="" suffix="" suffixesToOverride="" prefixesToOverride=""></trim>')
	} else if(tagVal == 'if') {
		setEditorValue(editorVal + '<if test="" ></if>')
	} else if(tagVal == 'where') {
		setEditorValue(editorVal + '<where></where>')
	} else if(tagVal == 'foreach') {
		setEditorValue(editorVal + '<foreach open="(" close=")" collection="" separator="," item="item" index="index">#{item}</foreach>')
	}
}

const consoleResultRef = ref()
const JsonStudioRef = ref()
const executeSql = () => {
	const sqlDto = {}
	sqlDto.openTrans = apiSqlForm.openTrans
	sqlDto.pageAuto = apiSqlForm.pageAuto
	sqlDto.pageParam = apiSqlForm.pageParam
	sqlDto.pageSizeParam = apiSqlForm.pageSizeParam
	sqlDto.sqlDbType = apiSqlForm.sqlDbType
	sqlDto.databaseId = apiSqlForm.databaseId
	sqlDto.statement = getEditorValue()
	sqlDto.sqlSeparator = apiSqlForm.sqlSeparator
	sqlDto.sqlMaxRow = apiSqlForm.sqlMaxRow
	if(!sqlDto.sqlDbType) {
		ElMessage.warning("请选择数据库类别")
		return
	}
	if(!sqlDto.sqlSeparator) {
		ElMessage.warning("sql分隔符不能为空")
		return
	}
	if(!sqlDto.sqlDbType) {
		ElMessage.warning("请选择数据库类型")
		return
	}
	if(!sqlDto.databaseId && sqlDto.sqlDbType == 1) {
		ElMessage.warning("请选择数据库")
		return
	}
	if(!sqlDto.statement) {
		ElMessage.warning("请输入sql语句")
		return
	}
	if(!sqlDto.sqlMaxRow) {
		ElMessage.warning("请输入最大查询条数")
		return
	}
	sqlDto.jsonParams = JsonStudioRef.value.getEditorValue()
	executeSqlButton.value = true
	executeSqlApi(sqlDto).then(res=>{
		consoleResultRef.value.init(res.data,'1',false)
	}).finally(() => {
		executeSqlButton.value = false
	})
}




// @ts-ignore
//切换语言
const changeLanguage=()=>{
	 monaco.editor.setModelLanguage(editor.getModel(), language.value)
	//  editor.updateOptions({
	//           language: "objective-c"
	//       });
}
//切换主题
const handleTheme = () => {
  monaco.editor.setTheme(editorTheme.value)
}
//格式化sql
const handleFormat = () => {
	editor.setValue(format(editor.getValue()))
}

const setEditorValue = (value: any) => {
	editor.setValue(value)
}

const getEditorValue = () => {
	return editor.getValue()
}

const getSqlParam = () => {
	return JsonStudioRef.value.getEditorValue()
}

const setSqlParam = (value: any) => {
	JsonStudioRef.value.setEditorValue(value)
}

const closeDebug = () => {
	debuged.value = false
}

/***
 * editor.setValue(newValue)

editor.getValue()

editor.onDidChangeModelContent((val)=>{ //监听值的变化  })

editor.getAction('editor.action.formatDocument').run()    //格式化代码

editor.dispose()    //销毁实例

editor.onDidChangeOptions　　//配置改变事件

editor.onDidChangeLanguage　　//语言改变事件
 */
defineExpose({
	setEditorValue,
	getEditorValue,
	handleFormat,
	getSqlParam,
	setSqlParam,
	closeDebug
})
</script>

<style scoped>
#sqlCodeEditBox {
	margin-top: 0;
	width: 100%;
  height: 360px;
}
.sqlTopBox {
	display: flex;
	margin-bottom: 8px;
}
.sqlMiddleBox {
	display: flex;
}
.sqlMiddleBox .rightResize {
  position: relative;
  background-color: #d6d6d6;
  border-radius: 5px;
  width: 5px;
  height: 360px;
  background-size: cover;
  background-position: center;
  /*z-index: 99999;*/
  font-size: 32px;
  color: white;
}
.sqlLeftBox {
	width: 75%;
}
.sqlRightBox {
	width: calc(25% - 5px);
	height: 360px;
}
/* .sqlBottomBox {
	height: 200px;
} */
.sqlBottomTabs {
		height: 100%;
	}
	
.sqlBottomTabs > .el-tabs__content {
	height: calc(100% - 40px);
	padding: 0;
}
/* 每个tab高度设置为100% */
.sqlBottomTabs > .el-tabs__content > .el-tab-pane {
	height: 100%;
}

.sqlBottomTabs .sqlCustomTabsLabel {
		font-size: 16px;
}
.sqlBottomTabs > .el-tabs__header {
		padding: 0;
		position: relative;
		margin: 0 0 0;
}
</style>