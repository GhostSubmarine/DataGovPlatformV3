import service from '@/utils/request'

export const useResourceApi = (id: number) => {
	return service.get('/data-assets/resource/' + id)
}

export const useResourceSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-assets/resource', dataForm)
	} else {
		return service.post('/data-assets/resource', dataForm)
	}
}

export const onlineApi = (id: number) => {
	return service.put('/data-assets/resource/online/' + id)
}

export const offlineApi = (id: number) => {
	return service.put('/data-assets/resource/offline/' + id)
}

export const deleteApi = (id: number) => {
	return service.delete('/data-assets/resource/' + id)
}