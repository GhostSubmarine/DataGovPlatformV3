import service from '@/utils/request'

export const useDatabaseApi = (id: number) => {
	return service.get('/data-integrate/database/' + id)
}

export const useDatabaseSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-integrate/database', dataForm)
	} else {
		return service.post('/data-integrate/database', dataForm)
	}
}

export const testOnline = (dataForm: any) => {
	return service.post('/data-integrate/database/test-online', dataForm)
}

export const getTablesById = (id: number) => {
	return service.get('/data-integrate/database/tables/' + id)
}

export const getTableDataBySql = (id: number, sqlConsole: any) => {
	return service.post('/data-integrate/database/table-data/' + id, sqlConsole)
}

export const listDatabase = () => {
	return service.get('/data-integrate/database/list-all')
}

export const listTreeByIdApi = (id:any) => {
	return service.get('/data-integrate/database/list-tree/'+id)
}

export const listColumnsByIdAndTableName = (id: any, tableName: any) => {
	return service.get('/data-integrate/database/'+id+'/'+tableName+'/columns')
}

export const listColumnsByIdAndSql = (id: any, sqlConsole: any) => {
	return service.post('/data-integrate/database/'+id+'/sql/columns', sqlConsole)
}

export const getSqlGenerationApi = (id: any, tableName: any, tableRemarks) => {
	return service.get('/data-integrate/database/'+id+'/'+tableName+'/sql-generation?tableRemarks='+tableRemarks)
}

export const listMiddleDbTreeApi = () => {
	return service.get('/data-integrate/database/middle-db/list-tree')
}

export const listMiddleDbTables = () => {
	return service.get('/data-integrate/database/middle-db/list-tables')
}


export const listMiddleDbColumnsApi = (tableName: any) => {
	return service.get('/data-integrate/database/middle-db/'+tableName+'/columns')
}

export const getMiddleDbSqlGenerationApi = (tableName: any, tableRemarks) => {
	return service.get('/data-integrate/database/middle-db/'+tableName+'/sql-generation?tableRemarks='+tableRemarks)
}

export const getTableInfoApi = (tableName: any) => {
	return service.get('/data-integrate/database/middle-db/table-info/'+tableName)
}

export const saveTableInfoApi = (dataForm: any) => {
	return service.post('/data-integrate/database/middle-db/table-info', dataForm)
}

export const deleteTableInfoApi = (tableName: any) => {
	return service.delete('/data-integrate/database/middle-db/table-info/'+tableName)
}

