import service from '@/utils/request'

export const useConfigApi = (id: number) => {
	return service.get('/data-development/sys-config/' + id)
}

export const useConfigSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-development/sys-config', dataForm)
	} else {
		return service.post('/data-development/sys-config', dataForm)
	}
}

export const updateSysConfigApi = (dataForm: any) => {
	return service.post('/data-development/sys-config/updateSysConfigByJson', dataForm) 
}

export const getAllApi = () => {
	return service.get('/data-development/sys-config/getAll')
}
