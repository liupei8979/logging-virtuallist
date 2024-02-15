import io from 'socket.io-client';
import { writable } from 'svelte/store';

function createWebSocketStore() {
	const { subscribe, set, update } = writable(null);

	let socket: any = null;
	function connect() {
		socket = io(`${import.meta.env.VITE_HOST_URL}:${import.meta.env.VITE_HOST_WS_PORT}/ws`, {
			transports: ['websocket']
		});

		// 이벤트 핸들러
		socket.on('connectResponse', handleConnectResponse);
		socket.on('queryLogResponse', handleQueryLogResponse);
		// 기존에 등록된 이벤트 핸들러를 제거하고, 새로운 핸들러를 등록합니다.

		socket.connect();
		set(socket);
	}

	function disconnect() {
		if (socket) {
			socket.off('connectResponse', handleConnectResponse);
			socket.off('reloadTaskLogResponse', handleReloadTaskLogResponse);
			socket.off('queryLogResponse', handleQueryLogResponse);
			socket.off('newTaskLogResponse', handleNewTaskLogResponse); // 추가 이벤트

			socket.disconnect();
			socket = null;
			set(null);
		}
	}

	// 각 이벤트 타입에 대한 핸들러 함수를 정의.
	function handleConnectResponse(data) {
		console.log('Connect Response:', data.payload.taskStates);

		// 필요한 경우 상태 업데이트
		// 향후에는 서버에서 전달하는 데이터를 어떻게 처리할지 결정해야 함.
	}
	// socketStore에서 reloadTaskLog 수정
	function reloadTaskLog(domain, task, taskType) {
		return new Promise((resolve, reject) => {
			if (socket) {
				socket.emit('reloadTaskLog', { domain, task, taskType });

				// 익명 함수를 사용하여 이벤트 핸들러를 등록
				const onReloadTaskLogResponse = (data) => {
					handleReloadTaskLogResponse(data);
					resolve(data); // 프로미스 해결
					// 프로미스가 해결된 후에 이벤트 핸들러를 제거
					socket.off('reloadTaskLogResponse', onReloadTaskLogResponse);
				};

				// 이벤트 핸들러를 한 번만 실행하도록 설정
				socket.on('reloadTaskLogResponse', onReloadTaskLogResponse);
			} else {
				reject(new Error('Socket not connected'));
			}
		});
	}

	let intervalId;

	function handleReloadTaskLogResponse(data) {
		console.log('Reload Task Log Response:', data.payload);
		// taskStore.set(data.payload);

		const { lastLogSeq, domain, task, taskType, status } = data.payload;

		// 반복 호출 및 이벤트 리스너 중복 등록을 방지하기 위해 기존에 설정된 intervalId와 리스너를 제거합니다.
		clearInterval(intervalId);
		socket.off('newTaskLogResponse', handleNewTaskLogResponse);

		if (socket && status === 'PROGRESS') {
			intervalId = setInterval(() => {
				console.log('Emit newTaskLog:', { domain, task, taskType, startLogSeq: lastLogSeq });
				socket.emit('newTaskLog', { domain, task, taskType, startLogSeq: lastLogSeq });
			}, 800); // 1초마다 반복

			// newTaskLogResponse 이벤트 핸들러를 다시 설정합니다.
			socket.on('newTaskLogResponse', handleNewTaskLogResponse);
		}
	}

	function handleNewTaskLogResponse(data) {
		console.log('New Task Log Response:', data);
		// taskStore.set(data.payload);
		const { domain, task, taskType } = data.payload;

		// 'TERMINATED' 또는 'WAITING' 상태일 때 반복 호출 및 이벤트 리스너를 중단합니다.
		if (
			data.payload &&
			(data.payload.status === 'TERMINATED' || data.payload.status === 'WAITING')
		) {
			console.log(
				`Task status is ${data.payload.status}. Stopping interval and removing event listener...`
			);
			clearInterval(intervalId);
			socket.off('newTaskLogResponse', handleNewTaskLogResponse);

			// 여기서 reloadTaskLog를 다시 호출합니다.
			// 이 호출은 조건에 따라 제한되어야 하며, 무한 루프를 방지하기 위한 추가 로직이 필요할 수 있습니다.
			socketStore
				.reloadTaskLog(domain, task, taskType)
				.then(() => {
					console.log('Reload Task Log initiated after task ended.');
				})
				.catch((error) => {
					console.error('Failed to reload task log:', error);
				});
		}
	}

	function handleQueryLogResponse(data) {
		console.log('Query Log Response:', data);
		// 필요한 경우 상태 업데이트
		// 향후에는 서버에서 전달하는 데이터를 어떻게 처리할지 결정해야 함.
	}

	// 서버에 log 검색 요청을 보내는 함수
	function queryLog(requestId, query) {
		if (socket) {
			socket.emit('queryLog', { requestId, query });
		}
	}

	return {
		subscribe,
		connect,
		disconnect,
		queryLog,
		reloadTaskLog,
		handleNewTaskLogResponse
	};
}

export const socketStore = createWebSocketStore();
