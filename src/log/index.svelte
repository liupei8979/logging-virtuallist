<script>
	import { onMount } from 'svelte';
	import { Content } from 'carbon-components-svelte';
	import axios from 'axios';

	// 로그 데이터와 현재 보이는 로그 목록을 저장할 반응형 변수를 선언합니다.
	let logs = [];
	let visibleLogs = [];
	let startIndex = 0; // 현재 보이는 로그 목록의 시작 인덱스를 저장할 변수입니다.

	const itemHeight = 30; // 각 로그 항목의 높이입니다.
	const containerHeight = 300; // 로그 목록을 담을 컨테이너의 높이입니다.
	const numItemsVisible = Math.ceil(containerHeight / itemHeight); // 한 번에 보여줄 수 있는 로그 항목의 수입니다.

	// 컴포넌트가 마운트될 때 실행될 함수입니다.
	onMount(async () => {
		try {
			// axios를 사용하여 로그 데이터를 비동기적으로 불러옵니다.
			const response = await axios.get('/src/lib/logs.json');
			logs = response.data; // 응답으로 받은 데이터를 logs 배열에 저장합니다.
			updateVisibleLogs(0); // 초기 로그 목록을 설정합니다.
		} catch (error) {
			// 데이터 로딩에 실패한 경우, 콘솔에 오류 메시지를 출력합니다.
			console.error('Failed to fetch logs:', error);
		}
	});

	// 스크롤 위치에 따라 보여줄 로그 목록을 업데이트하는 함수입니다.
	function updateVisibleLogs(scrollTop) {
		startIndex = Math.floor(scrollTop / itemHeight); // 스크롤 위치를 기반으로 시작 인덱스를 계산합니다.
		const endIndex = startIndex + numItemsVisible; // 보여줄 로그 목록의 끝 인덱스를 계산합니다.
		visibleLogs = logs.slice(startIndex, endIndex); // 시작 인덱스와 끝 인덱스를 사용하여 현재 보이는 로그 목록을 업데이트합니다.
	}

	// 사용자가 스크롤할 때 실행될 이벤트 핸들러 함수입니다.
	function onScroll(event) {
		const scrollTop = event.target.scrollTop; // 현재 스크롤 위치를 가져옵니다.
		updateVisibleLogs(scrollTop); // 스크롤 위치에 따라 보이는 로그 목록을 업데이트합니다.
	}
</script>

<Content>
	<div style="height: {containerHeight}px; overflow-y: auto;" on:scroll={onScroll}>
		<div style="position: relative; height: {logs.length * itemHeight}px;">
			{#each visibleLogs as log, index (`${log.timestamp}-${index}`)}
				<div
					class="log-item"
					style="position: absolute; top: {startIndex * itemHeight +
						index * itemHeight}px; left: 0; right: 0;"
				>
					Timestamp: {log.timestamp}, Type: {log.type}, Status: {log.status}, Message: {log.message}
				</div>
			{/each}
		</div>
	</div>
</Content>

<style>
	.log-item {
		color: white; /* 텍스트 색상을 흰색으로 설정 */
		background-color: #333; /* 배경색을 어두운 회색으로 설정 */
		padding: 10px;
		margin-bottom: 2px;
	}
</style>
