import service from '@/utils/request'

export const useConfigurationApi = (id: number) => {
	return service.get('/data-development/cluster-configuration/' + id)
}

export const useConfigurationSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-development/cluster-configuration', dataForm)
	} else {
		return service.post('/data-development/cluster-configuration', dataForm)
	}
}

export const testConnectApi = (dataForm: any) => {
	return service.post('/data-development/cluster-configuration/test-connect', dataForm)
}

export const listAllClusterConfigurationApi = () => {
	return service.get("/data-development/cluster-configuration/list-all")
}