import service from '@/utils/request'

export const useResourceCommentApi = (id: number) => {
	return service.get('/data-assets/resource-comment/' + id)
}

export const useResourceCommentSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-assets/resource-comment', dataForm)
	} else {
		return service.post('/data-assets/resource-comment', dataForm)
	}
}