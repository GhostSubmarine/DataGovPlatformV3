<template>
	<div :id="id" class="codeEditBox"></div>
</template>

<script lang="ts" setup name="DataStudioIndex">
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import * as monaco from 'monaco-editor';
import { format } from 'sql-formatter'
import { language as sqlLanguage } from 'monaco-editor/esm/vs/basic-languages/sql/sql.js';
import { nextTick,ref,onBeforeUnmount,onMounted,inject } from 'vue'
 
import {ElMessage} from 'element-plus'
const text=ref('')
const language=ref('sql')
const editorTheme = ref("vs-dark")

const props = defineProps({
	id: {
		type: String,
		required: false,
		default: () => 'codeEditBox'
	},
})
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
const editorValues = inject("editorValues")
const editableTabsValue = inject("editableTabsValue")

const editorInit = () => {
		nextTick(()=>{	
				!editor ? editor = monaco.editor.create(document.getElementById(props.id) as HTMLElement, {
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
				editor.onDidChangeModelContent((val:any) => {
					  //editor.trigger('', 'editor.action.triggerSuggest', {});
						text.value = editor.getValue();
						//把当前最新的数据放入缓存
						if(editorValues[editableTabsValue.value]) {
							editorValues[editableTabsValue.value]["codeText"] = text.value
						}
						//console.log(editorValues)
				})
				//sql提醒
				sqlCompletion
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
	handleTheme
})
</script>

<style scoped>
.codeEditBox {
	margin-top: 0;
	width: 100%;
	height: calc(100% - 35px);
}
</style>