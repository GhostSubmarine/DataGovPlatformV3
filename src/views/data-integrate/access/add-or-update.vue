<template>
	<el-drawer v-model="visible" :title="!dataForm.id ? '新增' : '修改'" size="100%">
		<br>
		<el-steps :active="active">
		  <el-step title="基本信息配置" />
		  <el-step title="同步源端配置" />
		  <el-step title="目标端(ods)配置" />
		  <el-step title="映射转换配置" />
		  <el-step title="配置确认提交" />
		</el-steps>
		<br/>
		<el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="100px">
			<!-- 基本信息配置 -->
			<div v-show="active == 1">
				<el-form-item prop="orgId" label="所属机构">
					<el-tree-select
						clearable
						v-model="dataForm.orgId"
						:data="orgList"
						check-strictly
						value-key="id"
						:props="{ label: 'name', children: 'children' }"
						style="width: 100%"
					/>
				</el-form-item>
				<el-form-item label="任务名称" prop="taskName" >
					<el-input v-model="dataForm.taskName" placeholder="任务名称"></el-input>
				</el-form-item>
				<el-form-item label="描述" prop="description">
					<el-input v-model="dataForm.description" placeholder="描述"></el-input>
				</el-form-item>
				<!-- <el-form-item label="所属项目" prop="projectId">
					<fast-project-select v-model="dataForm.projectId" placeholder="所属项目"></fast-project-select>
				</el-form-item> -->
				<el-form-item label="调度类型" prop="taskType">
					<fast-radio-group v-model="dataForm.taskType" dict-type="task_type"></fast-radio-group>
				</el-form-item>
				<el-form-item label="cron表达式" prop="cron" v-if="dataForm.taskType=='3'">
					<el-input v-model="dataForm.cron" placeholder="cron表达式"></el-input>
					<!-- <el-popover ref="cronPopover" :width="550" trigger="click">
						<Cron @submit="changeCron" @close="cronPopover.hide()"></Cron>
						<template #reference>
							<el-input v-model="dataForm.cron" placeholder="cron表达式"></el-input>
						</template>
					</el-popover> -->
				</el-form-item>
			</div>
			<!-- 同步源端配置 -->
			<div v-show="active == 2">
				<el-form-item label="源端数据库" prop="sourceDatabaseId" label-width="auto">
					<el-select v-model="dataForm.sourceDatabaseId"
					           @change="selectChangedSourceDatabase"
										 clearable
										 filterable 
					           placeholder="请选择">
					  <el-option v-for="(item,index) in dataForm.databases"
					             :key="item.id"
					             :label="`[${item.id}]${item.name}`"
					             :value="item.id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="源端类型" prop="sourceType" label-width="auto">
					<fast-select v-model="dataForm.sourceType" dict-type="source_type" placeholder="请选择"  @change="sourceTypeChange"></fast-select>
				</el-form-item>
				<el-form-item v-if="dataForm.sourceType == 1"  label="配置方式" prop="includeOrExclude" label-width="auto">
				  <el-select placeholder="请选择配置方式"
				             v-model="dataForm.includeOrExclude"
							 @change="configTypeChange">
				    <el-option label="包含表"
				               :value="1"></el-option>
				    <el-option label="排除表"
				               :value="0"></el-option>
				  </el-select>
				</el-form-item>
				<el-form-item v-if="dataForm.sourceType == 1" label="表名配置" prop="sourceSelectedTables" label-width="auto">
				  <el-select placeholder="请选择表名"
				             multiple
							 filterable
							 clearable
							  @change="selectedTablesChange"
				             v-model="dataForm.sourceSelectedTables">
				    <el-option v-for="(item,index) in dataForm.sourceTables"
				               :key="item.tableName"
				               :label="item.tableName"
				               :value="item.tableName"></el-option>
				  </el-select>
					<el-tooltip v-if="dataForm.sourceType == 1" placement="top"  content="当为包含表时，选择所要精确包含的表名，如果不选则代表选择所有；当为排除表时，选择需要精确排除的表名。">
					   <el-icon><QuestionFilled /></el-icon>
					</el-tooltip>
				</el-form-item>
				<el-form-item label="SQL" prop="sourceSql" v-if="dataForm.sourceType == 2" label-width="auto">
					<div>
						<div style="padding-bottom: 5px;">
							<el-button type="warning" size="small" @click="getColumnInfo()">解析 SQL</el-button>
							<el-tooltip placement="right"  content="SQL 为单条 SELECT 语句,点击解析 SQL 可以获取字段列表, 选择唯一键">
							   <el-icon><QuestionFilled /></el-icon>
							</el-tooltip>
						</div>
						<div style="height:150px;width: 1000px;">
							<SqlStudio ref="sqlStudioRef" id="accessSourceSql"></SqlStudio>
						</div>
					</div>
				</el-form-item>
				<el-form-item label="主键" prop="sourcePrimaryKeys" v-if="dataForm.sourceType == 2" label-width="auto">
					<el-select v-model="dataForm.sourcePrimaryKeys"
								 multiple
								 clearable
								 filterable 
					           placeholder="请选择">
					  <el-option v-for="(item,index) in sqlColumns"
					             :key="item.fieldName"
					             :label="`${item.fieldName}`"
					             :value="item.fieldName"></el-option>
					</el-select>
					<el-tooltip placement="right"  content="如果要根据主键增量同步,则选择的主键必须与目标表的主键保持一致,若目标表不存在,创建目标表会以当前选择的字段作为主键!">
					   <el-icon><QuestionFilled /></el-icon>
					</el-tooltip>
				</el-form-item>
				<el-form-item label="增量字段" prop="increaseColumnName" v-if="dataForm.sourceType == 2" label-width="auto">
					<el-select v-model="dataForm.increaseColumnName"
								 clearable
								 filterable 
					           placeholder="请选择">
					  <el-option v-for="(item,index) in sqlColumns"
					             :key="item.fieldName"
					             :label="`${item.fieldName}`"
					             :value="item.fieldName"></el-option>
					</el-select>
					<el-tooltip placement="right"  content="如果要根据增量字段增量同步,请选择增量字段">
					   <el-icon><QuestionFilled /></el-icon>
					</el-tooltip>
				</el-form-item>
			</div>
			<!-- 目标端配置 -->
			<div v-show="active == 3">
				<el-form-item label="接入方式" label-width="auto"
				              prop="accessMode">
				  <el-select placeholder="请选择接入方式"
				             v-model="dataForm.accessMode"
							 @change="accessModeChange">
				    <el-option label="接入到ods层"
				               :value="1"></el-option>
				    <el-option label="自定义接入"
				               :value="2"></el-option>
				  </el-select>
				</el-form-item>
				<el-form-item label="接入数据库" v-if="dataForm.accessMode=='2'" label-width="auto"
				              prop="targetDatabaseId">
				  <el-select v-model="dataForm.targetDatabaseId"
										 @change="selectChangedTargetDatabase"
										 clearable
										 filterable
				             placeholder="请选择">
				    <el-option v-for="(item,index) in dataForm.databases"
				               :key="item.id"
				               :label="`[${item.id}]${item.name}`"
				               :value="item.id"></el-option>
				  </el-select>
				</el-form-item>
				<el-form-item v-if="dataForm.sourceType == 2" label="接入表"
				              prop="targetTable" label-width="auto">
				  <el-input style="width: 300px;" v-model="dataForm.targetTable" placeholder="接入表"></el-input>
				  <el-tooltip placement="top"  content="若目的端没有该表,则会自动创建">
				     <el-icon><QuestionFilled /></el-icon>
				  </el-tooltip>
				  <!-- <el-select placeholder="请选择表名"
							 filterable
							 clearable
				             v-model="dataForm.targetTable">
				    <el-option v-for="(item,index) in targetTables"
				               :key="item.tableName"
				               :label="item.tableName"
				               :value="item.tableName"></el-option>
				  </el-select> -->
				</el-form-item>
				<el-form-item v-if="dataForm.sourceType == 1 && !ifMongoDB" label="只创建表" label-width="auto"
				              prop="targetOnlyCreate">
				  <el-select v-model="dataForm.targetOnlyCreate">
				    <el-option label='是'
				               :value="true"></el-option>
				    <el-option label='否'
				               :value="false"></el-option>
				  </el-select>
					<el-tooltip placement="top"  content="只在目标端创建表，不同步数据内容。">
					   <el-icon><QuestionFilled /></el-icon>
					</el-tooltip>
				</el-form-item>
				<el-form-item label="是否同步已存在的表" label-width="auto"
				              prop="targetSyncExit">
				  <el-select v-model="dataForm.targetSyncExit">
				    <el-option label='是'
				               :value="true"></el-option>
				    <el-option label='否'
				               :value="false"></el-option>
				  </el-select>
				</el-form-item>
				<el-form-item label="同步前是否删除目的表" v-if="!ifMongoDB" label-width="auto"
				              prop="targetDropTable">
				  <el-select v-model="dataForm.targetDropTable">
				    <el-option label='是'
				               :value="true"></el-option>
				    <el-option label='否'
				               :value="false"></el-option>
				  </el-select>
				</el-form-item>
				<el-form-item label="是否启用增量变更同步" v-if="!ifMongoDB" label-width="auto"
				              prop="targetDataSync" >
				  <el-select v-model="dataForm.targetDataSync" @change="dataSyncChange">
				    <el-option label='是'
				               :value="true"></el-option>
				    <el-option label='否'
				               :value="false"></el-option>
				  </el-select>
					<el-tooltip placement="top"  content="表不存在时会自动建表,根据主键排序比对同步">
					   <el-icon><QuestionFilled /></el-icon>
					</el-tooltip>
				</el-form-item>
				<el-form-item label="增量变更同步类型" v-if="!ifMongoDB && dataForm.targetDataSync" label-width="auto"
				              prop="changeDataSyncType">
					<fast-select v-model="dataForm.changeDataSyncType" dict-type="change_data_sync_type" placeholder="增量变更同步类型" clearable></fast-select>
				</el-form-item>
				<el-form-item v-if="dataForm.sourceType == 1 && !ifMongoDB" label="是否同步索引" label-width="auto"
				              prop="targetIndexCreate">
				  <el-select v-model="dataForm.targetIndexCreate">
				    <el-option label='是'
				               :value="true"></el-option>
				    <el-option label='否'
				               :value="false"></el-option>
				  </el-select>
					<el-tooltip placement="top"  content="仅生效于部分数据库,表不存在时建表时才生效">
					   <el-icon><QuestionFilled /></el-icon>
					</el-tooltip>
				</el-form-item>
				<el-form-item v-if="dataForm.sourceType == 1 && !ifMongoDB" label="是否同步默认值" label-width="auto"
				              prop="syncDefaultVal">
				  <el-select v-model="dataForm.syncDefaultVal">
				    <el-option label='是'
				               :value="true"></el-option>
				    <el-option label='否'
				               :value="false"></el-option>
				  </el-select>
					<el-tooltip placement="top"  content="仅生效于部分数据库,表不存在时建表时才生效">
					   <el-icon><QuestionFilled /></el-icon>
					</el-tooltip>
				</el-form-item>
				<el-form-item label="是否表名字段名转小写" label-width="auto"
											v-if="!dataForm.targetUpperCase && dataForm.accessMode =='2' && !ifMongoDB"
				              prop="targetLowerCase">
				  <el-select v-model="dataForm.targetLowerCase">
				    <el-option label='是'
				               :value="true"></el-option>
				    <el-option label='否'
				               :value="false"></el-option>
				  </el-select>
					<el-tooltip placement="top"  content="表不存在时建表时才生效">
					   <el-icon><QuestionFilled /></el-icon>
					</el-tooltip>
				</el-form-item>
				<el-form-item label="是否表名字段名转大写" label-width="auto"
											v-if="!dataForm.targetLowerCase && dataForm.accessMode =='2' && !ifMongoDB"
				              prop="targetUpperCase">
				  <el-select v-model="dataForm.targetUpperCase">
				    <el-option label='是'
				               :value="true"></el-option>
				    <el-option label='否'
				               :value="false"></el-option>
				  </el-select>
					<el-tooltip placement="top"  content="表不存在时建表时才生效">
					   <el-icon><QuestionFilled /></el-icon>
					</el-tooltip>
				</el-form-item>
				<el-form-item label="是否主键自动递增" label-width="auto" prop="targetAutoIncrement" v-if="!ifMongoDB">
				  <el-select v-model="dataForm.targetAutoIncrement">
				    <el-option label='是'
				               :value="true"></el-option>
				    <el-option label='否'
				               :value="false"></el-option>
				  </el-select>
					<el-tooltip placement="top"  content="仅生效于部分数据库,表不存在时生效,不支持复合主键">
					   <el-icon><QuestionFilled /></el-icon>
					</el-tooltip>
				</el-form-item>
				<el-form-item label="数据处理批次大小" label-width="auto" prop="batchSize">
				  <el-select v-model="dataForm.batchSize">
				    <el-option label="1000"
				               :value="1000"></el-option>
				    <el-option label="2000"
				               :value="2000"></el-option>
				    <el-option label="3000"
				               :value="3000"></el-option>
				    <el-option label="4000"
							  :value="4000"></el-option>
					<el-option label="5000"
							  :value="5000"></el-option>
					<el-option label="10000"
							  :value="10000"></el-option>
				  </el-select>
					<el-tooltip placement="top"  content="数据同步时单个批次处理的行记录总数，该值越大越占用内存空间。建议：小字段表设置为5000，大字段表设置为1000">
					   <el-icon><QuestionFilled /></el-icon>
					</el-tooltip>
				</el-form-item>
			</div>
			<!-- 映射转换配置 -->
			<div v-show="active == 4">
				<el-form-item label="映射类型" prop="mapperType" label-width="auto" v-if="dataForm.sourceType == 1">
					<fast-select @change="mapperTypeChange" v-model="dataForm.mapperType" dict-type="mapper_type" placeholder="映射类型" clearable></fast-select>
					<el-tooltip placement="right"  content="统一映射:统一配置映射关系;单独映射:单独配置每张表的映射关系.">
					   <el-icon><QuestionFilled /></el-icon>
					</el-tooltip>
				</el-form-item>
				<div v-if="!!dataForm.mapperType || dataForm.sourceType == 2">
					<div v-if="dataForm.mapperType == 'ALL' || dataForm.sourceType == 2">
						<div class="tip-content" v-if="dataForm.sourceType == 1">
							<p>说明：</p>
							<br>
							<p> (1) 支持正则表达式匹配，也可直接填写需要映射的表名。 </p>
							<br>
						  <p> (2) 当表名映射规则为空时，若接入方式为接入到ods层，会自动给表名添加ods_前缀，否则代表目标表名与源表名的名称相同; 不为空时，若接入方式为接入到ods层，会自动给映射的表名添加ods_前缀，否则与映射的表名一致。</p>
						  <br>
							<p> (3) 当字段名映射规则记录为空时，代表目标表的字段名与源表名的字段名相同；不为空时，以映射的字段名为准。</p>
							<br>
							<p> (4) 若不想同步某个字段，填写源端字段之后，目标字段名映射留空即可。 </p>
						</div>
						<div class="tip-content" v-if="dataForm.sourceType == 2">
							<p>说明：</p>
							<br>
							<p> (1) 支持正则表达式匹配，也可直接填写需要映射的字段名。 </p>
							<br>
							<p> (2) 当字段名映射规则记录为空时，代表目标表的字段名与源 SQL 查询的字段名相同；不为空时，以映射的字段名为准。</p>
							<br>
							<p> (3) 需保证 sql 查询出来的字段与目标表的字段个数一致，类型兼容。</p>
						</div>
						<div v-if="dataForm.sourceType == 1">
							<br>
							<el-button type="success"
							           @click="addTableNameMapperListRow()"
							           round>添加表名映射</el-button>
							<el-button type="primary"
							           @click="previewTableNameMapList()"
							           round>预览表名映射</el-button>
							<el-table :data="dataForm.tableNameMapper"
							          size="small"
							          border
							          height="110"
							          style="margin-top: 15px;">
							  <template #empty>
							    <span>请点击"添加表名映射"按钮添加表名映射关系记录</span>
							  </template>
							  <el-table-column label="表名匹配的正则名"
							                   width="320">
							    <template #default="scope">
							      <el-input v-model="scope.row.fromPattern"
							                type="string"> </el-input>
							    </template>
							  </el-table-column>
							  <el-table-column label="替换的目标值"
							                   width="320">
							    <template #default="scope">
							      <el-input v-model="scope.row.toValue"
							                type="string" ></el-input>
							    </template>
							  </el-table-column>
							  <el-table-column label="操作"
							                   width="220">
							    <template #default="scope">
							      <el-button size="small"
							                 type="danger"
							                 @click="deleteTableNameMapperListItem(scope.$index)">删除</el-button>
							    </template>
							  </el-table-column>
							</el-table>
						</div>
						<div>
							<br>
							<el-button type="success"
							           @click="addColumnNameMapperListRow()"
							           round>添加字段名映射</el-button>
							<el-button type="primary"
							           @click="previewColumnNameMapList()"
							           round>预览字段名映射</el-button>
							<el-table :data="dataForm.columnNameMapper"
							          size="small"
							          border
							          height="110"
							          style="margin-top: 15px;">
							  <template #empty>
							    <span>请点击"添加字段名映射"按钮添加字段名映射关系记录</span>
							  </template>
							  <el-table-column label="字段名匹配的正则名"
							                   width="320">
							    <template #default="scope">
							      <el-input v-model="scope.row.fromPattern"
							                type="string"> </el-input>
							    </template>
							  </el-table-column>
							  <el-table-column label="替换的目标值"
							                   width="320">
							    <template #default="scope">
							      <el-input v-model="scope.row.toValue"
							                type="string"></el-input>
							    </template>
							  </el-table-column>
							  <el-table-column label="操作"
							                   width="220">
							    <template #default="scope">
							      <el-button size="small"
							                 type="danger"
							                 @click="deleteColumnNameMapperListItem(scope.$index)">删除</el-button>
							    </template>
							  </el-table-column>
							</el-table>
						</div>
						<br>
						<div v-if="dataForm.sourceType == 1">
							<el-form-item label="表主键(唯一字段)" prop="pks" label-width="auto">
								<el-input style="width: 300px;" v-model="dataForm.pks" placeholder="填写表的主键" clearable></el-input>
								<el-tooltip placement="right"  content="非必填,不填程序会自行获取表主键;多个用英文逗号隔开,适用于所有表主键一致的情况">
								   <el-icon><QuestionFilled /></el-icon>
								</el-tooltip>
							</el-form-item>
							<el-form-item label="增量字段" prop="increaseColumnName" v-if="dataForm.changeDataSyncType == 'INCREASE_COLUMN'" label-width="auto">
								<el-input style="width: 300px;" v-model="dataForm.increaseColumnName" placeholder="填写表的增量字段" clearable></el-input>
								<el-tooltip placement="right"  content="统一设置表的增量字段,确保被同步的表都有此字段">
								   <el-icon><QuestionFilled /></el-icon>
								</el-tooltip>
							</el-form-item>
						</div>
					</div>
					<div v-else>
						<el-form-item label="选择表名" label-width="auto">
							<el-select placeholder="请选择需要配置的表名"
									   filterable
									   clearable
									   @change="mapperTableNameChange"
							           v-model="mapperTableName">
							  <el-option v-for="(item,index) in mapperTableList"
							             :key="index"
							             :label="item"
							             :value="item"></el-option>
							</el-select>
							<el-tooltip placement="right"  content="选择指定的表进行配置">
							   <el-icon><QuestionFilled /></el-icon>
							</el-tooltip>
						</el-form-item>
						<div v-if="!!mapperTableName">
							<el-tag type="success" effect="dark" size="large" round>表名映射</el-tag>
							<el-table :data="configMap[mapperTableName].regexTableMapper"
							          size="small"
							          border
							          height="75"
							          style="margin-top: 15px;">
							  <el-table-column label="表名匹配的正则名"
							                   width="320">
							    <template #default="scope">
							      <el-input v-model="scope.row.fromPattern"
							                type="string"> </el-input>
							    </template>
							  </el-table-column>
							  <el-table-column label="替换的目标值"
							                   width="320">
							    <template #default="scope">
							      <el-input v-model="scope.row.toValue"
							                type="string" ></el-input>
							    </template>
							  </el-table-column>
							</el-table>
						</div>
						<div v-if="!!mapperTableName">
							<br>
							<el-button type="success"
							           @click="addSingleColumnNameMapper()"
							           round>添加字段名映射</el-button>
							<el-button type="primary"
							           @click="previewSingleColumnName()"
							           round>预览字段名映射</el-button>
							<el-table :data="configMap[mapperTableName].regexColumnMapper"
							          size="small"
							          border
							          height="110"
							          style="margin-top: 15px;">
							  <template #empty>
							    <span>请点击"添加字段名映射"按钮添加字段名映射关系记录</span>
							  </template>
							  <el-table-column label="字段名匹配的正则名"
							                   width="320">
							    <template #default="scope">
							      <el-input v-model="scope.row.fromPattern"
							                type="string"> </el-input>
							    </template>
							  </el-table-column>
							  <el-table-column label="替换的目标值"
							                   width="320">
							    <template #default="scope">
							      <el-input v-model="scope.row.toValue"
							                type="string"></el-input>
							    </template>
							  </el-table-column>
							  <el-table-column label="操作"
							                   width="220">
							    <template #default="scope">
							      <el-button size="small"
							                 type="danger"
							                 @click="deleteSingleColumnName(scope.$index)">删除</el-button>
							    </template>
							  </el-table-column>
							</el-table>
						</div>
						<br>
						<div v-if="!!mapperTableName">
							<el-form-item label="表主键(唯一字段)" label-width="auto">
								<el-select v-model="configMap[mapperTableName].sourcePrimaryKeys" placeholder="请选择" clearable multiple>
									<el-option v-for="(item,index) in mapperTableColumns"
									           :key="item.fieldName"
									           :label="item.fieldName"
									           :value="item.fieldName"></el-option>
								</el-select>
								<el-tooltip placement="right"  content="若不选择系统会自动获取表主键">
								   <el-icon><QuestionFilled /></el-icon>
								</el-tooltip>
							</el-form-item>
							<el-form-item label="增量字段" v-if="dataForm.changeDataSyncType == 'INCREASE_COLUMN'" label-width="auto">
								<el-select v-model="configMap[mapperTableName].increaseColumnName" placeholder="请选择" clearable >
									<el-option v-for="(item,index) in mapperTableColumns"
									           :key="item.fieldName"
									           :label="item.fieldName"
									           :value="item.fieldName"></el-option>
								</el-select>
							</el-form-item>
						</div>
					</div>
				</div>
			</div>
			
			<div v-show="active == 5">
				<el-descriptions size="default"
				                 :column="1"
				                 label-class-name="el-descriptions-item-label-class"
				                 border>
				  <el-descriptions-item label="任务名称">{{dataForm.taskName}}</el-descriptions-item>
				  <el-descriptions-item label="任务描述">{{dataForm.description}}</el-descriptions-item>
				  <el-descriptions-item label="接入类型">
				  	<span v-if="dataForm.accessMode == '1'">
				  		接入ods贴源层
				  	</span>
				  	<span v-if="dataForm.accessMode == '2'">
				  		自定义接入
				  	</span>
				  </el-descriptions-item>
				  <el-descriptions-item label="调度类型">
				    <span v-if="dataForm.taskType == '1'">
				      实时同步
				    </span>
				    <span v-if="dataForm.taskType == '2'">
				      一次性
				    </span>
					<span v-if="dataForm.taskType == '3'">
					  周期性
					</span>
				  </el-descriptions-item>
				  <el-descriptions-item v-if="dataForm.taskType == '3'"
				                        label="cron表达式">{{dataForm.cron}}</el-descriptions-item>
				  <el-descriptions-item label="源端类型">
					  <span v-if="dataForm.sourceType == '1'">
						指定表
					  </span>
					  <span v-if="dataForm.sourceType == '2'">
						自定义 SQL
					  </span>
				  </el-descriptions-item>						
				  <el-descriptions-item label="源端数据库">[{{dataForm.sourceDatabaseId}}]{{dataForm.sourceDatabase.name}}</el-descriptions-item>
				  <el-descriptions-item label="源端SQL" v-if="dataForm.sourceType == '2'">{{dataForm.sourceSql}}</el-descriptions-item>
				  <el-descriptions-item label="源端表选择方式" v-if="dataForm.sourceType == '1'">
				    <span v-if="dataForm.includeOrExclude == '1'">
				      包含表
				    </span>
				    <span v-if="dataForm.includeOrExclude == '0'">
				      排除表
				    </span>
				  </el-descriptions-item>
				  <el-descriptions-item label="源端表名列表" v-if="dataForm.sourceType == '1'">
				    <span v-show="dataForm.includeOrExclude == '1' && (!dataForm.sourceSelectedTables || dataForm.sourceSelectedTables.length==0)"><b>所有物理表</b></span>
				    <p v-for="item in dataForm.sourceSelectedTables"
				       v-bind:key="item">{{item}}</p>
				  </el-descriptions-item>
				  <el-descriptions-item label="目的端数据源" v-if="dataForm.accessMode =='2'">[{{dataForm.targetDatabaseId}}]{{dataForm.targetDatabase.name}}</el-descriptions-item>
				  <el-descriptions-item label="目的表" v-if="dataForm.sourceType =='2'">{{dataForm.targetTable}}</el-descriptions-item>
				  <el-descriptions-item label="只创建表" v-if="dataForm.sourceType == '1'">{{dataForm.targetOnlyCreate}}</el-descriptions-item>
					<el-descriptions-item label="是否同步已存在的表">{{dataForm.targetSyncExit}}</el-descriptions-item>
					<el-descriptions-item label="同步前是否先删除目的表">{{dataForm.targetDropTable}}</el-descriptions-item>
					<el-descriptions-item label="是否启用增量变更同步">{{dataForm.targetDataSync}}</el-descriptions-item>
					<el-descriptions-item label="增量变更同步类型" v-if="dataForm.targetDataSync">{{dataForm.changeDataSyncType == 'PK_ORDER_COMPARE'?'主键排序比对':'增量字段'}}</el-descriptions-item>
					<el-descriptions-item label="是否创建索引" v-if="dataForm.sourceType == '1'">{{dataForm.targetIndexCreate}}</el-descriptions-item>
					<el-descriptions-item label="是否表名字段名转小写" v-if="dataForm.accessMode =='2'">{{dataForm.targetLowerCase}}</el-descriptions-item>
					<el-descriptions-item label="是否表名字段名转大写" v-if="dataForm.accessMode =='2'">{{dataForm.targetUpperCase}}</el-descriptions-item>
					<el-descriptions-item label="是否主键自动递增">{{dataForm.targetAutoIncrement}}</el-descriptions-item>
				  <el-descriptions-item label="数据处理批次量">{{dataForm.batchSize}}</el-descriptions-item>
				  <!-- <el-descriptions-item label="表名统一映射规则" v-if="dataForm.sourceType == '1'">
				    <span v-show="dataForm.tableNameMapper.length==0">[映射关系为空]</span>
				    <table v-if="dataForm.tableNameMapper.length>0"
				           class="name-mapper-table">
				      <tr>
				        <th>表名匹配的正则名</th>
				        <th>替换的目标值</th>
				      </tr>
				      <tr v-for='(item,index) in dataForm.tableNameMapper'
				          :key="index">
				        <td>{{item['fromPattern']}}</td>
				        <td>{{item['toValue']}}</td>
				      </tr>
				    </table>
				  </el-descriptions-item>
				  <el-descriptions-item label="字段名统一映射规则">
				    <span v-show="dataForm.columnNameMapper.length==0">[映射关系为空]</span>
				    <table v-if="dataForm.columnNameMapper.length>0"
				           class="name-mapper-table">
				      <tr>
				        <th>字段名匹配的正则名</th>
				        <th>替换的目标值</th>
				      </tr>
				      <tr v-for='(item,index) in dataForm.columnNameMapper'
				          :key="index">
				        <td>{{item['fromPattern']}}</td>
				        <td>{{item['toValue']}}</td>
				      </tr>
				    </table>
				  </el-descriptions-item> -->
				</el-descriptions>
			</div>
		</el-form>
		<template #footer>
			<el-button round size="large"
			           v-if="active > 1"
			           @click="pre()">
			  上一步
			</el-button>
			<el-button round size="large"
			           @click="next()"
			           v-if="active > 0 && active < 5">
			  下一步
			</el-button>
			<el-button type="primary" round size="large"
			           @click="submitHandle()"
			           v-if="active == 5">
			  提交
			</el-button>
		</template>
		
		<el-dialog v-if="active == 4"
		           title="查看表名映射关系"
		           v-model="tableNameMapperDialogVisible">
		  <el-table :header-cell-style="{background:'#eef1f6',color:'#606266'}"
		            :data="tableNamesMapperData"
		            size="small"
		            border>
		    <el-table-column prop="originalName"
		                     label="源端表名"
		                     min-width="20%"></el-table-column>
		    <el-table-column prop="targetName"
		                     label="目标表名"
		                     min-width="20%"></el-table-column>
		  </el-table>
		</el-dialog>
		
		<el-dialog v-if="active == 4"
		           title="查看字段映射关系"
		           v-model="columnNameMapperDialogVisible">
		  <div v-if="dataForm.sourceType == 1 && dataForm.mapperType=='ALL'" >
			 <el-select @change="queryPreviewColumnNameMapperList"
			            v-model="preiveTableName"
			 					 clearable
			 					 filterable
			            placeholder="请选择">
			   <el-option v-for="(item,index) in preiveSeeTableNameList"
			              :key="index"
			              :label="item"
			              :value="item"></el-option>
			 </el-select>
			<br >
			<br > 
		  </div>
		  <el-table :header-cell-style="{background:'#eef1f6',color:'#606266'}"
		            :data="columnNamesMapperData"
		            size="small"
		            border>
		    <el-table-column prop="originalName"
		                     label="原始字段名"
		                     min-width="20%"></el-table-column>
		    <el-table-column prop="targetName"
		                     label="目标表字段名"
		                     min-width="20%"></el-table-column>
		  </el-table>
		</el-dialog>
	</el-drawer>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus/es'
import { useAccessApi, useAccessSubmitApi, previewTableNameMap, previewColumnNameMap } from '@/api/data-integrate/access'
import { listDatabase, getTablesById, listColumnsByIdAndTableName, listColumnsByIdAndSql } from '@/api/data-integrate/database'
import Cron from '@/components/fast-cron/index'
import { useOrgListApi } from '@/api/sys/orgs'
import SqlStudio from './sql-studio.vue'

const emit = defineEmits(['refreshDataList'])

const visible = ref(false)
const dataFormRef = ref()
const orgList = ref([])
const sqlStudioRef = ref() 
const targetTables = ref([])

const active = ref(1)
const dataForm = reactive({
	orgId: '',
	taskName: '',
	description: '',
	projectId: '',
	sourceDatabaseId: '',
	sourceDatabase: {},
	sourceType: '1',
	sourceSql: '',
	sourcePrimaryKeys: [],
	taskType: '',
	cron: '',
	databases: [],
	includeOrExclude: 1,
	sourceTables: [],
	sourceSelectedTables: [],
	accessMode: 1,
	targetDatabaseId: '', 
	targetDatabase: {},
	targetTable: '',
	targetOnlyCreate: false,
	targetSyncExit: true,
	targetDropTable: true,
	targetDataSync: false,
	targetIndexCreate: false,
	syncDefaultVal: false,
	targetLowerCase: false,
	targetUpperCase: false,
	targetAutoIncrement: false,
	batchSize: 1000,
	mapperType: 'ALL',
	pks: '',
	increaseColumnName: '',
	tableNameMapper: [],
	columnNameMapper: [],
	changeDataSyncType: '',
	})

const cronPopover = ref()
const changeCron = (val: any) => {
	dataForm.cron = val
}

onMounted(() => {
	listDatabase().then(res => {
		dataForm.databases = res.data
	})
})

const init = (id?: number) => {
	active.value = 1
	visible.value = true
	dataForm.id = ''

	// 重置表单数据
	if (dataFormRef.value) {
		dataFormRef.value.resetFields()
	}

	//获取部门列表
	useOrgListApi().then(res => {
		orgList.value = res.data
	})
	
	if (id) {
		getAccess(id)
	}
}

//每个表的配置
const configMap = reactive({})
const mapperTableName = ref()
const mapperTableList = ref([])
const mapperTypeChange = (typeVal: any) => {
	mapperTableName.value = ''
	if (typeVal == 'SINGLE') {
		console.log(dataForm.sourceTables)
		buildConfigMap()
		console.log("configMap:"+JSON.stringify(configMap) )
	}
}

const configTypeChange = () => {
	//如果是单独映射
	if(dataForm.mapperType = 'SINGLE') {
		buildConfigMap()
	}
}

const selectedTablesChange = () => {
	//如果是单独映射
	if(dataForm.mapperType = 'SINGLE') {
		buildConfigMap()
		if(mapperTableName.value) {
			//查询表的字段列表
			listColumnsByIdAndTableName(dataForm.sourceDatabaseId, mapperTableName.value).then(res=>{
				 mapperTableColumns.value = res.data
			})
		}
	}
}

const buildConfigMap = () => {
	if(!dataForm.sourceSelectedTables || dataForm.sourceSelectedTables.length == 0) {
		mapperTableList.value = []
		for(var i in dataForm.sourceTables) {
			mapperTableList.value.push(dataForm.sourceTables[i].tableName)
		}
	}
	//构建选择的表
	else if(dataForm.includeOrExclude == 1) {
		//如果是包含表
		mapperTableList.value = [...dataForm.sourceSelectedTables]
	} else {
		var sourceTableNames = []
		for(var i in dataForm.sourceTables) {
			sourceTableNames.push(dataForm.sourceTables[i].tableName)
		}
		//如果是排除表
		mapperTableList.value = sourceTableNames.filter(item => {
			return !dataForm.sourceSelectedTables.includes(item);
		});
	}
	console.log("mapperTableList:"+mapperTableList.value)
	mapperTableName.value = ''
	resetConfigMap(mapperTableList.value)
	for (var i in mapperTableList.value) {
		let tableName = mapperTableList.value[i]
		if(!configMap[tableName]) {
			configMap[tableName] = {}
			configMap[tableName].regexTableMapper = [{"fromPattern":tableName,"toValue":tableName}]
			configMap[tableName].regexColumnMapper = []
			configMap[tableName].sourcePrimaryKeys = []
			configMap[tableName].increaseColumnName = ''
		} else {
			if(configMap[tableName].regexTableMapper.length == 0) {
				configMap[tableName].regexTableMapper = [{"fromPattern":tableName,"toValue":tableName}]
			}
		}
	}
	console.log(configMap)
	mapperTableName.value = mapperTableList.value[0]
}

const resetConfigMap = (tableList: any) => {
	for (var key in configMap) {
		if(!tableList.includes(key)) {
			 delete configMap[key];
		} 
	}
}

const mapperTableColumns = ref([])
const mapperTableNameChange = (tableName: any) => {
 if(!tableName) {
	 return
 }
 if(configMap[tableName].regexTableMapper.length == 0) {
	 //设置表名映射
	 configMap[tableName].regexTableMapper = [{"fromPattern":tableName,"toValue":tableName}]
 }
 //查询表的字段列表
 listColumnsByIdAndTableName(dataForm.sourceDatabaseId, tableName).then(res=>{
	 mapperTableColumns.value = res.data
 })
}

const dataSyncChange = (syncVal) => {
	if(!syncVal) {
		dataForm.changeDataSyncType = null
	}
}

const getAccess = (id: number) => {
	useAccessApi(id).then(res => {
		Object.assign(dataForm, res.data)
		if(res.data.configMap) {
			mapperTableList.value = []
			for(var tableName in res.data.configMap) {
				mapperTableList.value.push(tableName)
			}
			//console.log(mapperTableList.value)
			mapperTableName.value = mapperTableList.value[0]
			Object.assign(configMap, res.data.configMap)
			console.log(configMap)
			//查询表字段
			listColumnsByIdAndTableName(dataForm.sourceDatabaseId, tableName).then(res=>{
				 mapperTableColumns.value = res.data
			})
		}
		
		if(dataForm.sourcePrimaryKeys && dataForm.sourcePrimaryKeys.length > 0) {
			var str = "";
			for (var i = 0; i < dataForm.sourcePrimaryKeys.length; i++) {
				str += dataForm.sourcePrimaryKeys[i] + ","
			}
		    if (str.length > 0) {
				str = str.substr(0, str.length - 1);
			}
			dataForm.pks = str
		}
		
		if (dataForm.sourceDatabaseId) {
			dataForm.sourceDatabase = dataForm.databases.find((item) => {
				return item.id == dataForm.sourceDatabaseId
			})
			//获取库所包含的表
			getTablesById(dataForm.sourceDatabaseId).then( res => {
				dataForm.sourceTables = res.data
			})
		}
		if (dataForm.targetDatabaseId) {
			dataForm.targetDatabase = dataForm.databases.find((item) => {
				return item.id == dataForm.targetDatabaseId
			})
			if(dataForm.targetDatabase && dataForm.targetDatabase.databaseType == 18) {
				ifMongoDB.value = true
			} else {
				ifMongoDB.value = false
			}
			/* if(dataForm.sourceType == 2) {
				getTablesById(targetDatabaseId).then( res => {
					targetTables.value = res.data
				})
			} */
		} else {
			/* if(dataForm.sourceType == 2) {
				getTablesById(0).then( res => {
					targetTables.value = res.data
				})
			} */
		}
		if(dataForm.sourceType == 2) {
			listColumnsByIdAndSql(dataForm.sourceDatabaseId, {sql: dataForm.sourceSql}).then(res=>{
				sqlColumns.value = res.data
			})
			//获取sql
			setTimeout(()=>{
				sqlStudioRef.value.setEditorValue(dataForm.sourceSql)
			},300)
		}
	})
}

const sourceTypeChange = (sourceType: any) => {
	if(sourceType == 2) {
		setTimeout(()=>{
			sqlStudioRef.value.setEditorValue(dataForm.sourceSql)
		},300)
	}
}

const dataRules = ref({
	orgId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	taskName: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	/* projectId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }], */
	sourceDatabaseId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	sourceSql: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	sourceType: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	taskType: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	cron: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	includeOrExclude: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	accessMode: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	targetOnlyCreate: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	targetSyncExit: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	targetDropTable: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	targetDataSync: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	syncDefaultVal: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	targetIndexCreate: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	targetLowerCase: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	targetUpperCase: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	targetDatabaseId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	targetTable: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	targetAutoIncrement: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	batchSize: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	mapperType: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	changeDataSyncType: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})

const pre = () => {
	 if (active.value-- < 2) active.value = 1
}

const next = () => {
	if (active.value++ > 4) active.value = 5
}

//源端数据库变化
const selectChangedSourceDatabase = (id) => {
	if (!id) {
		return
	}
	dataForm.sourceDatabase = dataForm.databases.find((item) => {
		return item.id == id
	})
	dataForm.sourceSelectedTables = []
	//获取库所包含的表
	getTablesById(id).then( res => {
		dataForm.sourceTables = res.data
	})
}
const accessModeChange = (value) => {
	if(value == 1 && dataForm.sourceType == 2) {
		dataForm.targetTable = ''
		//获取中台库的表
		/* getTablesById(0).then( res => {
			targetTables.value = res.data
		}) */
	}
}

const ifMongoDB = ref(false)
//目的端数据库变化
const selectChangedTargetDatabase = (id) => {
	if(!id) {
		return
	}
	dataForm.targetDatabase = dataForm.databases.find((item) => {
		return item.id == id
	})
	if(dataForm.targetDatabase.databaseType == 18) {
		ifMongoDB.value = true
	} else {
		ifMongoDB.value = false
	}
	//获取表名列表
	if(dataForm.sourceType == 2) {
		dataForm.targetTable = ''
		/* getTablesById(id).then( res => {
			targetTables.value = res.data
		}) */
	}
}

const sqlColumns = ref([])
const getColumnInfo = () => {
	const sourceSql = sqlStudioRef.value.getEditorValue()
	if (!sourceSql) {
		ElMessage.warning("请填写 SQL 语句（单条 SELECT）！");
		return
	}
	if(!dataForm.sourceDatabaseId) {
		ElMessage.warning("请选择源端数据库！");
		return
	}
	//获取字段
	listColumnsByIdAndSql(dataForm.sourceDatabaseId, {sql: sourceSql}).then(res=>{
		sqlColumns.value = res.data
		ElMessage.success("解析成功！");
	})
}

//添加表名映射
const addTableNameMapperListRow = () => {
  dataForm.tableNameMapper.push({ "fromPattern": "", "toValue": "" });
}

const deleteTableNameMapperListItem = (index) => {
	 dataForm.tableNameMapper.splice(index, 1);
}

const addColumnNameMapperListRow = () => {
   dataForm.columnNameMapper.push({ "fromPattern": "", "toValue": "" });
}

const deleteColumnNameMapperListItem = (index) => {
	 dataForm.columnNameMapper.splice(index, 1);
}

const addSingleColumnNameMapper = () => {
	configMap[mapperTableName.value].regexColumnMapper.push({ "fromPattern": "", "toValue": "" });
}

const deleteSingleColumnName = (index) => {
	configMap[mapperTableName.value].regexColumnMapper.splice(index, 1);
}

const tableNamesMapperData = ref([])
const tableNameMapperDialogVisible = ref(false)
//预览表名映射
const previewTableNameMapList = () => {
	if (!dataForm.sourceDatabaseId) {
		ElMessage({
		   message: '请选择【源端数据库】！',
		   type: 'warning',
		 })
	  return;
	}
	
	//调用方法
	previewTableNameMap(JSON.stringify({
			sourceDatabaseId: dataForm.sourceDatabaseId,
			includeOrExclude: dataForm.includeOrExclude,
			sourceSelectedTables: dataForm.sourceSelectedTables,
			tableNameMapper: dataForm.tableNameMapper,
			targetLowerCase: dataForm.accessMode == '1' ? true : dataForm.targetLowerCase,
			targetUpperCase: dataForm.accessMode == '1' ? false : dataForm.targetUpperCase,
			tablePrefix: dataForm.accessMode == '1' ? 'ods_' : '',
        })).then( res=> {
			tableNamesMapperData.value = res.data;
			tableNameMapperDialogVisible.value = true;
	})
}

const preiveSeeTableNameList = ref([])
const preiveTableName = ref("")
const columnNamesMapperData = ref([])
const columnNameMapperDialogVisible = ref(false)
//预览字段名映射
const previewColumnNameMapList = () => {
	if (dataForm.sourceType == 1) {
		if (!dataForm.sourceDatabaseId) {
			ElMessage({
			   message: '请选择【源端数据库】！',
			   type: 'warning',
			 })
		  return;
		}
		if (dataForm.includeOrExclude == "1") {
			if (dataForm.sourceSelectedTables.length == 0) {
				preiveSeeTableNameList.value = dataForm.sourceTables.map(item => {
					return item.tableName
				})
			} else {
				preiveSeeTableNameList.value = dataForm.sourceSelectedTables
			}
		} else {
			preiveSeeTableNameList.value = dataForm.sourceTables.map(item => {
				return item.tableName
			})
			// 去除排除的表
			 for (var i = 0; i < dataForm.sourceSelectedTables.length; i++) {
				 var exclude = dataForm.sourceSelectedTables[i];
				 preiveSeeTableNameList.value.some((item, index) => {
					 if (item == exclude) {
						 preiveSeeTableNameList.value.splice(index, 1)
						 return true;
					 }
				 })
			 }
		}
		preiveTableName.value = "";
		columnNamesMapperData.value = [];
		columnNameMapperDialogVisible.value = true;
	} else {
		//查询映射字段名列表
		if (!dataForm.sourceDatabaseId) {
			ElMessage({
			   message: '请选择【源端数据库】！',
			   type: 'warning',
			 })
		  return;
		}
		dataForm.sourceSql = sqlStudioRef.value.getEditorValue()
		if (!dataForm.sourceSql) {
			ElMessage({
			   message: '请填写源端 SQL 语句（单条 SELECT）',
			   type: 'warning',
			 })
		  return;
		}
		//调用映射接口
		previewColumnNameMap(JSON.stringify({
			  sourceType: dataForm.sourceType,
		      sourceDatabaseId: dataForm.sourceDatabaseId,
		      columnNameMapper: dataForm.columnNameMapper,
			  sourceSql: dataForm.sourceSql
		    })).then( res=> {
				columnNamesMapperData.value = res.data
				columnNameMapperDialogVisible.value = true;
		})
	}
}

//根据选择的表名查看映射的字段
const queryPreviewColumnNameMapperList = () => {
	if (!dataForm.sourceDatabaseId) {
		ElMessage({
		   message: '请选择【源端数据库】！',
		   type: 'warning',
		 })
	  return;
	}
	if (!preiveTableName.value) {
	  ElMessage({
	     message: '请选择一个表名！',
	     type: 'warning',
	   })
	  return;
	}
	previewColumnNameMap(JSON.stringify({
          sourceDatabaseId: dataForm.sourceDatabaseId,
          includeOrExclude:dataForm.includeOrExclude,
          preiveTableName: preiveTableName.value,
          columnNameMapper: dataForm.columnNameMapper,
			targetLowerCase: dataForm.accessMode == '1' ? true : dataForm.targetLowerCase,
			targetUpperCase: dataForm.accessMode == '1' ? false : dataForm.targetUpperCase,
			tablePrefix: dataForm.accessMode == '1' ? 'ods_' : '',
        })).then( res=> {
			columnNamesMapperData.value = res.data
	})
}

const previewSingleColumnName = () => {
	if (!dataForm.sourceDatabaseId) {
		ElMessage({
		   message: '请选择【源端数据库】！',
		   type: 'warning',
		 })
	  return;
	}
	previewColumnNameMap(JSON.stringify({
	      sourceDatabaseId: dataForm.sourceDatabaseId,
	      includeOrExclude:dataForm.includeOrExclude,
	      preiveTableName: mapperTableName.value,
	      columnNameMapper: configMap[mapperTableName.value].regexColumnMapper,
			targetLowerCase: dataForm.accessMode == '1' ? true : dataForm.targetLowerCase,
			targetUpperCase: dataForm.accessMode == '1' ? false : dataForm.targetUpperCase,
			tablePrefix: dataForm.accessMode == '1' ? 'ods_' : '',
	    })).then( res=> {
			columnNamesMapperData.value = res.data
			columnNameMapperDialogVisible.value = true;
	})
}

// 表单提交
const submitHandle = () => {
	if(dataForm.sourceType == 2) {
		dataForm.sourceSql = sqlStudioRef.value.getEditorValue()
	}	
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			 ElMessage({
			    message: '请将每一步的参数必填项填写完毕后再提交！',
			    type: 'warning',
			  })
			return false
		}

	  //如果不是周期性增量同步
		if(dataForm.taskType != '3') {
			dataForm.cron = ''
		}
		if(!dataForm.targetDataSync) {
			dataForm.changeDataSyncType = null
		}
		//ods接入
		if(dataForm.accessMode == '1') {
			dataForm.targetDatabaseId = ''
			dataForm.targetLowerCase = true
			dataForm.targetUpperCase = false
			dataForm.targetDatabase = {}
		}
		if(dataForm.sourceType == 2) {
			dataForm.mapperType = "ALL"
			//获取sql
			dataForm.sourceSql = sqlStudioRef.value.getEditorValue()
			if(!dataForm.sourceSql) {
				ElMessage.warning("请将每一步的参数必填项填写完毕后再提交！")
				return false
			}
			dataForm.targetOnlyCreate = false
			dataForm.targetIndexCreate = false
			dataForm.syncDefaultVal = false
			if(dataForm.changeDataSyncType == 'INCREASE_COLUMN') {
				if(!dataForm.increaseColumnName) {
					ElMessage.warning("请填写增量字段");
					return false
				}
			} 
		} else {
			if(dataForm.mapperType == "ALL") {
				dataForm.configMap = null
				if(dataForm.pks) {
					if(dataForm.pks.trim() != "") {
						dataForm.sourcePrimaryKeys = dataForm.pks.split(",")
					}
				} else {
					dataForm.sourcePrimaryKeys = []
				}
				if(dataForm.changeDataSyncType == 'INCREASE_COLUMN') {
					if(!dataForm.increaseColumnName) {
						ElMessage.warning("请填写增量字段");
						return false
					}
				}
			} else {
				dataForm.sourcePrimaryKeys = []
				dataForm.increaseColumnName = ''
				dataForm.regexTableMapper = []
				dataForm.regexColumnMapper = []
				dataForm.configMap = configMap
				if(dataForm.changeDataSyncType == 'INCREASE_COLUMN') {
					//判断是否增量字段都已填写
					for(var tableName in configMap) {
						if(!configMap[tableName].increaseColumnName) {
							ElMessage.warning("请选择表【"+ tableName+ "】的增量字段");
							return false
						}
					}
				}
			}
			dataForm.sourceSql = ''
		}
		if(ifMongoDB.value) {
			dataForm.targetOnlyCreate = false
			dataForm.targetDropTable = true
			dataForm.targetDataSync = false
			dataForm.targetIndexCreate = false
			dataForm.syncDefaultVal = false
			dataForm.targetLowerCase = false
			dataForm.targetUpperCase = false
			dataForm.targetAutoIncrement = false
		}
		
		useAccessSubmitApi(dataForm).then(() => {
			ElMessage.success({
				message: '操作成功',
				duration: 500,
				onClose: () => {
					visible.value = false
					emit('refreshDataList')
				}
			})
		})
	})
}

defineExpose({
	init
})
</script>

<style scoped>
	.tip-content {
	  font-size: 12px;
	}
</style>