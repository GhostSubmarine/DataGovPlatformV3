import service from '@/utils/request'

export const listFileCategoryApi = () => {
	return service.get('/data-integrate/fileCategory')
}

export const deleteFileCategoryApi = (id: number) => {
	return service.delete('/data-integrate/fileCategory?id=' + id)
}


export const useFileCategoryApi = (id: number) => {
	return service.get('/data-integrate/fileCategory/' + id)
}

export const useFileCategorySubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-integrate/fileCategory', dataForm)
	} else {
		return service.post('/data-integrate/fileCategory', dataForm)
	}
}