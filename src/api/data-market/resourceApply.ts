import service from '@/utils/request'

export const useApplyApi = (id: number) => {
	return service.get('/data-assets/resource-apply/' + id)
}

export const useApplySubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-assets/resource-apply', dataForm)
	} else {
		return service.post('/data-assets/resource-apply', dataForm)
	}
}

export const checkApi = (dataForm: any) => {
	return service.put('/data-assets/resource-apply/check', dataForm)
}

export const authApi = (id: number, auth: number) => {
	return service.put('/data-assets/resource-apply/auth/'+id + '/' + auth)
}
