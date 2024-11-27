<template>
	<el-card class="layout-home" body-style="height: calc(100vh - 170px )">
		<h2>介绍</h2>
		<p>前台基于Vue3、TypeScript、Element Plus、Vue Router、Pinia、Axios、i18n、Vite 等开发</p>
		<p>后台基于SpringCloudAlibaba、Flink、Hadoop，Seatunnel，Dbswtich 等开发</p>
		<p>数睿通2.0数据中台，包含数据集成，数据开发，数据治理，数据资产，数据服务，数据集市六大模块，解决数据孤岛问题，实现数据统一口径标准，自定义数据开发任务，帮助企业，政府等解决数据问题！</p>
		<br>
		<!-- <p>
			系统采用 flink + dbswitch + neo4j + tidb 构建数据仓库，可满足实时计算和离线计算两种使用场景！<br>
			flink 负责数据实时同步，计算，流批一体化处理；dbswitch 负责离线数据的同步计算，支持 MYSQL/ORACLE/SQLSERVER/POSTGRESQL/GREENPLUM/MARIADB/DB2/DM/OSCAR/KINGBASE8/OSCAR/GBASE8A/HIVE/SQLITE3/SYBASE <br>
			tidb 负责存储海量数据，分为 ods，dim，dwd，dws，ads 五层：<br>
			<b>ods</b>：用于接收并处理需要存储至数据仓库系统的原始数据，其数据表的结构与原始数据所在的数据系统中的表结构一致，是数据仓库的数据准备区 <br>
			<b>dim</b>：使用维度构建数据模型 <br>
			<b>dwd</b>：通过企业的业务活动事件构建数据模型。基于具体业务事件的特点，构建最细粒度的明细数据事实表 <br>
			<b>dws</b>：通过分析的主题对象构建数据模型。基于上层应用和产品的指标需求，构建公共粒度的汇总指标表 <br>
			<b>ads</b>：用于存放数据产品个性化的统计指标数据，输出各种报表，提供数据服务 <br>
		</p> 
		<br /> -->
		<h2>交流和反馈</h2>
		<p>技术解答、交流、反馈、建议等，请关注公众号 <b>螺旋编程极客</b>！</p>
		<br>
		<h2>版权声明</h2>
		<p><b>数睿通2.0</b> 知识产权归 <b>天津数睿通科技有限公司</b> 所有，可用于正常的二开商用用途；严禁故意传播，对源码进行二次售卖；版权所有，翻版必究 ！</p>
		<p>COPYRIGHT 2024 天津数睿通科技有限公司. ALL RIGHTS RESERVED</p>
		<br />
	</el-card>
</template>

<style scoped>
.layout-home {
	line-height: 2;
	font-size: 15px;
}

.layout-home h2 {
	margin: 6px 0;
}
</style>
