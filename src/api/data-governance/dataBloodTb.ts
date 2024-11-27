import service from '@/utils/request'

export const useDataBloodTbApi = (id: number) => {
	return service.get('/data-governance/dataBloodTb/' + id)
}

export const useDataBloodTbSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-governance/dataBloodTb', dataForm)
	} else {
		return service.post('/data-governance/dataBloodTb', dataForm)
	}
}

export const listCloumnBloodByTbId = (tbId: number) => {
	return service.get('/data-governance/dataBloodTb/blood-cloumn/' + tbId)
}

export const queryBloodApi = (tableName: any) => {
	return service.get('/data-governance/dataBloodTb/blood-structure?tableName='+  tableName)
}
