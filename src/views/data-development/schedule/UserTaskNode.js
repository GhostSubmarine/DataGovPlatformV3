// UserTaskNode.js
import { HtmlNodeModel, HtmlNode  } from "@logicflow/core";
import { createApp, ref, h } from 'vue';
import TaskNode from './TaskNode.vue';

class UserTaskView extends HtmlNode {
  constructor (props) {
    super(props)
    this.isMounted = false
    this.r = h(TaskNode, {
      properties: props.model.getProperties()
    })
    this.app = createApp({
      render: () => this.r
    })
  }
  setHtml(rootEl) {
    if (!this.isMounted) {
      this.isMounted = true
      const node = document.createElement('div')
      rootEl.appendChild(node)
      this.app.mount(node)
    } else {
      this.r.component.props.properties = this.props.model.getProperties()
    }
  }
  getText () {
    return null
  }
}

class UserTaskModel extends HtmlNodeModel {
	setAttributes() {
	  this.width = 220;
	  this.height = 100;
	  this.text.editable = false;
	}
	initNodeData(data) {
	    super.initNodeData(data);
			this.text.draggable = false; // 不允许文本被拖动
			this.text.editable = false; // 不允许文本被编辑
	    const rule = {
	      message: "只允许从右边的锚点连出",
	      validate: (sourceNode, targetNode, sourceAnchor, targetAnchor) => {
					/* console.log(sourceAnchor)
					console.log(targetAnchor) */
	        return sourceAnchor.type === "right" && targetAnchor.type === "left";
	      }
	    };
	    this.sourceRules.push(rule);
	  }
		/* getTextStyle() {
		    const style = super.getTextStyle();
		    style.fontSize = 12;
		    style.color = 'red';
		    return style;
		  } */
		 getAnchorStyle(anchorInfo) {
				const style = super.getAnchorStyle(anchorInfo);
				if (anchorInfo.type === 'left') {
					style.stroke = "transparent";
					style.fill = 'none'
					style.hover.stroke = 'transpanrent'
				} else {
					style.fill = 'green'
				}
				return style;
			}	
			getDefaultAnchor() {
				const { width, height, x, y, id } = this; 
				return [
					{
						x: x - width / 2,
						y,
						type: 'left',
						//edgeAddable: false, // 控制锚点是否可以从此锚点手动创建连线。默认为true。
						id: `${id}_0`
					},
					{
						x: x + width / 2,
						y,
						type: 'right',
						id: `${id}_1`
					},
				]
			}
}

export default {
  type: "UserTask",
  view: UserTaskView,
  model: UserTaskModel
};
