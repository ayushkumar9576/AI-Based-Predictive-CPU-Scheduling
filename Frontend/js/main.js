const API_BASE = '';

let processes = [];

const pidInput = document.getElementById('pid-input');
const arrivalInput = document.getElementById('arrival-input');
const burstInput = document.getElementById('burst-input');
const priorityInput = document.getElementById('priority-input');
const priorityField = document.getElementById('priority-field');
const priorityColHdr = document.getElementById('priority-col-header');
const typeSelect = document.getElementById('type-select');
const prevBurstInput = document.getElementById('prev-burst-input');
const addBtn = document.getElementById('add-process-btn');
const processTbody = document.getElementById('process-tbody');
const emptyHint = document.getElementById('empty-hint');

const algoSelect = document.getElementById('algorithm-select');
const quantumField = document.getElementById('quantum-field');
const quantumInput = document.getElementById('quantum-input');
const speedSelect = document.getElementById('speed-select');
const runBtn = document.getElementById('run-btn');
const compareBtn = document.getElementById('compare-btn');
const resetBtn = document.getElementById('reset-btn');

const statusBar = document.getElementById('status-bar');
const statusText = document.getElementById('status-text');

const resultsSection = document.getElementById('results-section');
const metricAlgoVal = document.getElementById('metric-algo-val');
const metricWt = document.getElementById('metric-wt');
const metricTat = document.getElementById('metric-tat');
const metricCount = document.getElementById('metric-count');
const resultsTbody = document.getElementById('results-tbody');

const compareCard = document.getElementById('compare-card');
const themeToggle = document.getElementById('theme-toggle');


const loadDatasetBtn = document.getElementById('load-dataset-btn');
const viewHistoryBtn = document.getElementById('view-history-btn');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const historyBadge = document.getElementById('history-count-badge');
const dataPreviewWrap = document.getElementById('data-preview-wrap');
const dataPreviewTbody = document.getElementById('data-preview-tbody');
const dataPagination = document.getElementById('data-pagination');

const ALGO_LABELS = {
	fcfs: 'FCFS',
	sjf: 'SJF',
	rr: 'Round Robin',
	priority: 'Priority',
	ai: 'AI Predictive',
};

themeToggle.checked = document.documentElement.getAttribute('data-theme') === 'dark';
themeToggle.addEventListener('change', () => {
	const next = themeToggle.checked ? 'dark' : 'light';
	document.documentElement.setAttribute('data-theme', next);
});

function onAlgoChange() {
	const algo = algoSelect.value;
	const isPriority = algo === 'priority';
	const isRR = algo === 'rr';

	quantumField.style.display = isRR ? '' : 'none';
	priorityField.style.display = isPriority ? '' : 'none';
	priorityColHdr.style.display = isPriority ? '' : 'none';

	renderProcessTable();
}

algoSelect.addEventListener('change', onAlgoChange);

function setButtonsEnabled(hasProcesses) {
	runBtn.disabled = !hasProcesses;
	compareBtn.disabled = !hasProcesses;
}

function isPriorityMode() {
	return algoSelect.value === 'priority';
}

function renderProcessTable() {
	Array.from(processTbody.querySelectorAll('tr:not(#empty-hint)')).forEach(r => r.remove());

	if (processes.length === 0) {
		emptyHint.style.display = '';
		setButtonsEnabled(false);
		return;
	}

	emptyHint.style.display = 'none';
	setButtonsEnabled(true);

	const showPriority = isPriorityMode();
	const TYPE_LABEL = { cpu: 'CPU', io: 'IO', mixed: 'Mix' };

	processes.forEach((p, idx) => {
		const tr = document.createElement('tr');
		tr.className = 'new-row';
		const prevStr = p.prev_burst_times && p.prev_burst_times.length
			? p.prev_burst_times.join(', ')
			: '—';
		tr.innerHTML = `
            <td>${p.pid}</td>
            <td>${p.arrival_time}</td>
            <td>${p.burst_time}</td>
            ${showPriority ? `<td>${p.priority ?? '—'}</td>` : ''}
            <td><span class="badge badge-type badge-${p.process_type}">${TYPE_LABEL[p.process_type] || p.process_type}</span></td>
            <td class="prev-bursts-cell">${prevStr}</td>
            <td><button class="btn-delete" data-idx="${idx}" aria-label="Remove ${p.pid}">✕ Remove</button></td>
        `;
		processTbody.appendChild(tr);
		requestAnimationFrame(() => tr.classList.remove('new-row'));
	});
}

function autoNextPid() {
	if (processes.length === 0) return 'P1';
	const nums = processes.map(p => {
		const m = p.pid.match(/\d+$/);
		return m ? parseInt(m[0]) : 0;
	});
	return `P${Math.max(...nums) + 1}`;
}

addBtn.addEventListener('click', addProcess);
[pidInput, arrivalInput, burstInput, priorityInput, prevBurstInput].forEach(el =>
	el.addEventListener('keydown', e => { if (e.key === 'Enter') addProcess(); })
);

function addProcess() {
	let pid = pidInput.value.trim() || autoNextPid();
	pid = pid.toUpperCase();
	pidInput.value = pid;
	const pidPattern = /^P\d+$/;
	if (!pidPattern.test(pid)) {
		flashInvalid(pidInput, 'PID must be like P1, P2, P12...');
		return;
	}

	const arrival = parseFloat(arrivalInput.value);
	const burst = parseFloat(burstInput.value);
	const priority = isPriorityMode() ? parseInt(priorityInput.value) : 0;
	const ptype = typeSelect.value;

	let prevBursts = [];
	const rawPrev = prevBurstInput.value.trim();
	if (rawPrev) {
		prevBursts = rawPrev.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v) && v > 0);
		if (prevBursts.length === 0) { flashInvalid(prevBurstInput, 'Use comma-separated numbers e.g. 3,5,4'); return; }
	}

	if (!pid) { flashInvalid(pidInput, 'PID required'); return; }
	if (isNaN(arrival) || arrival < 0) { flashInvalid(arrivalInput, 'Invalid arrival time'); return; }
	if (isNaN(burst) || burst <= 0) { flashInvalid(burstInput, 'Burst time must be > 0'); return; }
	if (isPriorityMode() && (isNaN(priority) || priority < 1)) {
		flashInvalid(priorityInput, 'Priority must be ≥ 1'); return;
	}
	if (processes.find(p => p.pid === pid)) { flashInvalid(pidInput, `PID "${pid}" already exists`); return; }

	processes.push({
		pid,
		arrival_time: arrival,
		burst_time: burst,
		priority,
		process_type: ptype,
		prev_burst_times: prevBursts,
	});
	renderProcessTable();

	pidInput.value = '';
	arrivalInput.value = '';
	burstInput.value = '';
	priorityInput.value = '';
	prevBurstInput.value = '';
	pidInput.placeholder = autoNextPid();
	pidInput.focus();
}

processTbody.addEventListener('click', e => {
	const btn = e.target.closest('.btn-delete');
	if (!btn) return;
	const idx = parseInt(btn.dataset.idx);
	processes.splice(idx, 1);
	renderProcessTable();
});

function flashInvalid(input, msg) {
	input.style.borderColor = 'var(--neon-pink)';
	input.style.boxShadow = '0 0 0 3px rgba(244,114,182,0.25)';
	input.title = msg;
	setTimeout(() => {
		input.style.borderColor = '';
		input.style.boxShadow = '';
		input.title = '';
	}, 3000);
	input.focus();
}

function showStatus(msg, visible = true) {
	statusBar.classList.toggle('hidden', !visible);
	statusText.textContent = msg;
}

function updateMetrics(algorithm, avgWt, avgTat, count) {
	metricAlgoVal.textContent = ALGO_LABELS[algorithm] || algorithm.toUpperCase();
	metricWt.textContent = avgWt.toFixed(2);
	metricTat.textContent = avgTat.toFixed(2);
	metricCount.textContent = count;

	document.querySelectorAll('.metric-card').forEach(card => {
		card.classList.remove('pop');
		void card.offsetWidth;
		card.classList.add('pop');
	});
}

function renderResultsTable(scheduled) {
	resultsTbody.innerHTML = '';
	scheduled.forEach(p => {
		const tr = document.createElement('tr');
		tr.innerHTML = `
		<td>${p.pid}</td>
		<td>${p.arrival_time}</td>
		<td>${p.burst_time}</td>
		<td>${p.predicted_burst_time !== null ? p.predicted_burst_time : '—'}</td>
		<td>${p.start_time ?? '—'}</td>
		<td>${p.completion_time}</td>
		<td>${p.waiting_time}</td>
		<td>${p.turnaround_time}</td>
    `;
		resultsTbody.appendChild(tr);
	});
}

function buildRequestBody() {
	const quantum = parseFloat(quantumInput.value) || 2;
	return { processes, quantum };
}

runBtn.addEventListener('click', async () => {
	if (processes.length === 0) return;

	const algorithm = algoSelect.value;
	const speedMs = parseInt(speedSelect.value);
	const label = ALGO_LABELS[algorithm] || algorithm.toUpperCase();

	runBtn.disabled = true;
	compareBtn.disabled = true;
	showStatus(`Running ${label} simulation…`);

	try {
		const res = await fetch(`${API_BASE}/schedule?algorithm=${algorithm}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(buildRequestBody()),
		});

		if (!res.ok) {
			const err = await res.json();
			throw new Error(err.error || `HTTP ${res.status}`);
		}

		const data = await res.json();

		resultsSection.classList.remove('hidden');
		compareCard.style.display = 'none';

		updateMetrics(data.algorithm, data.avg_waiting_time, data.avg_turnaround_time, data.processes.length);
		renderResultsTable(data.processes);

		resetGanttColors();
		renderGantt(data.gantt, speedMs);

		renderWaitingTimeChart(data.processes);
		renderTurnaroundTimeChart(data.processes);

		showStatus(`${label} simulation complete ✓`);
	} catch (err) {
		showStatus(`⚠ Error: ${err.message}`);
		console.error(err);
	} finally {
		runBtn.disabled = false;
		compareBtn.disabled = false;
	}
});

compareBtn.addEventListener('click', async () => {
	if (processes.length === 0) return;

	runBtn.disabled = true;
	compareBtn.disabled = true;
	showStatus('Comparing all 5 algorithms…');

	try {
		const res = await fetch(`${API_BASE}/compare`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(buildRequestBody()),
		});

		if (!res.ok) {
			const err = await res.json();
			throw new Error(err.error || `HTTP ${res.status}`);
		}

		const data = await res.json();

		resultsSection.classList.remove('hidden');
		compareCard.style.display = '';
		compareCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		renderComparisonChart(data.comparison);

		showStatus('Comparison complete ✓');
	} catch (err) {
		showStatus(`⚠ Error: ${err.message}`);
		console.error(err);
	} finally {
		runBtn.disabled = false;
		compareBtn.disabled = false;
	}
});

resetBtn.addEventListener('click', () => {
	processes = [];
	renderProcessTable();
	resultsSection.classList.add('hidden');
	compareCard.style.display = 'none';
	showStatus('', false);
	pidInput.value = '';
	arrivalInput.value = '';
	burstInput.value = '';
	priorityInput.value = '';
	prevBurstInput.value = '';
	pidInput.placeholder = 'e.g. P1';
});

const PT_ENC = { 0: 'CPU-bound', 1: 'IO-bound', 2: 'Mixed' };
const PAGE_SIZE = 20;

let _previewRows = [];
let _previewSource = '';
let _previewPage = 1;

function renderPage(page) {
	_previewPage = page;
	const start = (page - 1) * PAGE_SIZE;
	const slice = _previewRows.slice(start, start + PAGE_SIZE);

	dataPreviewTbody.innerHTML = '';
	if (slice.length === 0) {
		dataPreviewTbody.innerHTML = '<tr><td colspan="5" style="text-align:center">No data available.</td></tr>';
	} else {
		slice.forEach(r => {
			const tr = document.createElement('tr');
			tr.innerHTML = `
        <td>${r.arrival_time ?? '?'}</td>
        <td>${r.prev_burst_avg ?? '?'}</td>
        <td>${r.prev_burst_count ?? '?'}</td>
        <td><span class="badge badge-type badge-${PT_ENC[r.process_type]?.toLowerCase().split('-')[0] ?? 'cpu'}">${PT_ENC[r.process_type] ?? r.process_type}</span></td>
        <td>${r.burst_time ?? '?'}</td>
      	`;
			dataPreviewTbody.appendChild(tr);
		});
	}
	renderPagination();
}

function renderPagination() {
	const totalPages = Math.ceil(_previewRows.length / PAGE_SIZE);
	dataPagination.innerHTML = '';

	if (totalPages <= 1) return;

	const bar = document.createElement('div');
	bar.className = 'pagination-bar';

	const prevBtn = document.createElement('button');
	prevBtn.className = 'pagination-btn';
	prevBtn.textContent = '← Prev';
	prevBtn.disabled = _previewPage <= 1;
	prevBtn.addEventListener('click', () => renderPage(_previewPage - 1));

	const info = document.createElement('span');
	info.className = 'pagination-info';
	info.textContent = `${_previewPage} of ${totalPages}`;

	const nextBtn = document.createElement('button');
	nextBtn.className = 'pagination-btn';
	nextBtn.textContent = 'Next →';
	nextBtn.disabled = _previewPage >= totalPages;
	nextBtn.addEventListener('click', () => renderPage(_previewPage + 1));

	const rowInfo = document.createElement('span');
	rowInfo.className = 'pagination-count';
	const start = (_previewPage - 1) * PAGE_SIZE + 1;
	const end = Math.min(_previewPage * PAGE_SIZE, _previewRows.length);
	// rowInfo.textContent = `Showing ${start}–${end} of ${_previewRows.length} rows`;

	bar.appendChild(prevBtn);
	bar.appendChild(info);
	bar.appendChild(nextBtn);
	bar.appendChild(rowInfo);
	dataPagination.appendChild(bar);
}

function renderDataPreview(rows, source) {
	_previewRows = rows || [];
	_previewSource = source;
	_previewPage = 1;

	dataPreviewWrap.classList.remove('hidden');
	historyBadge.textContent = `${_previewRows.length} row${_previewRows.length !== 1 ? 's' : ''} (${source})`;
	historyBadge.style.display = '';

	renderPage(1);
}

let openDataPanel = null;

function collapseDataPanel() {
	dataPreviewWrap.classList.add('hidden');
	historyBadge.style.display = 'none';
	loadDatasetBtn.classList.remove('btn-active');
	viewHistoryBtn.classList.remove('btn-active');
	openDataPanel = null;
}

loadDatasetBtn.addEventListener('click', async () => {
	if (openDataPanel === 'synthetic') { collapseDataPanel(); showStatus('', false); return; }
	loadDatasetBtn.disabled = true;
	showStatus('Loading synthetic dataset sample…');
	try {
		const res = await fetch(`${API_BASE}/dataset?n=20`);
		const data = await res.json();
		renderDataPreview(data.data, 'synthetic');
		openDataPanel = 'synthetic';
		loadDatasetBtn.classList.add('btn-active');
		viewHistoryBtn.classList.remove('btn-active');
		showStatus(`Synthetic dataset loaded (${data.count} rows) ✓`);
	} catch (err) {
		showStatus(`⚠ Error: ${err.message}`);
	} finally {
		loadDatasetBtn.disabled = false;
	}
});

viewHistoryBtn.addEventListener('click', async () => {
	if (openDataPanel === 'history') { collapseDataPanel(); showStatus('', false); return; }
	viewHistoryBtn.disabled = true;
	showStatus('Loading execution history…');
	try {
		const res = await fetch(`${API_BASE}/history`);
		const data = await res.json();
		renderDataPreview(data.data, 'history');
		openDataPanel = 'history';
		viewHistoryBtn.classList.add('btn-active');
		loadDatasetBtn.classList.remove('btn-active');
		showStatus(data.count === 0 ? 'No history yet — run a simulation first.' : `History loaded (${data.count} rows) ✓`);
	} catch (err) {
		showStatus(`⚠ Error: ${err.message}`);
	} finally {
		viewHistoryBtn.disabled = false;
	}
});

clearHistoryBtn.addEventListener('click', async () => {
	if (!confirm('Clear all execution history and retrain the AI predictor on synthetic data only?')) return;
	clearHistoryBtn.disabled = true;
	showStatus('Clearing history and retraining predictor…');
	try {
		const res = await fetch(`${API_BASE}/history/clear`, { method: 'POST' });
		const data = await res.json();
		collapseDataPanel();
		showStatus(`History cleared (${data.rows_deleted} rows deleted). Predictor reset. ✓`);
	} catch (err) {
		showStatus(`⚠ Error: ${err.message}`);
	} finally {
		clearHistoryBtn.disabled = false;
	}
});

onAlgoChange();
renderProcessTable();
viewHistoryBtn.click();