import service from '@/utils/request'

export const useAppApi = (id: number) => {
	return service.get('/data-service/app/' + id)
}

export const useAppSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-service/app', dataForm)
	} else {
		return service.post('/data-service/app', dataForm)
	}
}

export const authApi = (dataForm: any) => {
	if(dataForm.id) {
		return service.put('/data-service/app/auth', dataForm)
	} else {
		return service.post('/data-service/app/auth', dataForm)
	}
	
}

export const cancelAuthApi = (id: number) => {
	return service.delete('/data-service/app/cancel-auth/'+id)
}

export const getAuthInfoApi = (authId: number) => {
	return service.get('/data-service/api-config/auth-info/'+authId)
}