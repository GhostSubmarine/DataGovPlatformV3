import service from '@/utils/request'

export const getMiddleDbColumnsApi = (tableName: nay) => {
	return service.get('/data-governance/master-column/middle-db/'+ tableName +'/columns')
}