import service from '@/utils/request'

export const useJarApi = (id: number) => {
	return service.get('/data-development/jar/' + id)
}

export const useJarSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-development/jar', dataForm)
	} else {
		return service.post('/data-development/jar', dataForm)
	}
}

export const getJarListApi = (jarRunType: any) => {
	return service.get('/data-development/jar/list/'+jarRunType)
}