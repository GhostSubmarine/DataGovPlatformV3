import service from '@/utils/request'

export const useSeatunnelAccessApi = (id: number) => {
	return service.get('/data-integrate/seatunnel-access/' + id)
}

export const useSeatunnelAccessSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-integrate/seatunnel-access', dataForm)
	} else {
		return service.post('/data-integrate/seatunnel-access', dataForm)
	}
}

export const accessRelease = (id: number) => {
	return service.post('/data-integrate/seatunnel-access/release/' + id)
}

export const accessCancle = (id: number) => {
	return service.post('/data-integrate/seatunnel-access/cancle/' + id)
}

export const handRun = (id: number) => {
	return service.post('/data-integrate/seatunnel-access/hand-run/' + id)
}