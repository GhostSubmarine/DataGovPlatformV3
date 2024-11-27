import service from '@/utils/request'

export const useClusterApi = (id: number) => {
	return service.get('/data-development/cluster/' + id)
}

export const useClusterSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-development/cluster', dataForm)
	} else {
		return service.post('/data-development/cluster', dataForm)
	}
}

export const heartbeatApi = (idList: any) => {
	return service.post('/data-development/cluster/heartbeat', idList)
} 

export const clearApi = () => {
	return service.get('/data-development/cluster/clear')
} 

export const listAllClusterApi = () => {
	return service.get("/data-development/cluster/list-all")
}