let wtChartInstance = null;
let tatChartInstance = null;
let cmpChartInstance = null;

const PAL = {
    blue: { solid: '#38bdf8', glow: 'rgba(56,189,248,0.55)', fill: 'rgba(56,189,248,0.18)' },
    purple: { solid: '#a78bfa', glow: 'rgba(167,139,250,0.55)', fill: 'rgba(167,139,250,0.18)' },
    teal: { solid: '#2dd4bf', glow: 'rgba(45,212,191,0.55)', fill: 'rgba(45,212,191,0.18)' },
    orange: { solid: '#fb923c', glow: 'rgba(251,146,60,0.55)', fill: 'rgba(251,146,60,0.18)' },
    pink: { solid: '#f472b6', glow: 'rgba(244,114,182,0.55)', fill: 'rgba(244,114,182,0.18)' },
    green: { solid: '#4ade80', glow: 'rgba(74,222,128,0.55)', fill: 'rgba(74,222,128,0.18)' },
};

const PROCESS_COLORS = [
    PAL.blue, PAL.purple, PAL.teal, PAL.orange, PAL.pink, PAL.green,
    PAL.blue, PAL.purple, PAL.teal, PAL.orange,
];

function isDark() {
    return document.documentElement.getAttribute('data-theme') !== 'light';
}
function gridColor() { return isDark() ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'; }
function tickColor() { return isDark() ? '#4a6a8a' : '#7a9ab8'; }
function labelColor() { return isDark() ? '#e2f0ff' : '#0d2040'; }
function tooltipBg() { return isDark() ? 'rgba(8,18,40,0.95)' : 'rgba(255,255,255,0.97)'; }

function makeLinearGradient(ctx, color, horizontal = false) {
    const { width, height } = ctx.canvas;
    const grad = horizontal
        ? ctx.createLinearGradient(0, 0, width, 0)
        : ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, color.solid + 'ff');
    grad.addColorStop(0.6, color.solid + 'cc');
    grad.addColorStop(1, color.solid + '55');
    return grad;
}

function makeAreaGradient(ctx, color) {
    const { height } = ctx.canvas;
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, color.solid + '55');
    grad.addColorStop(0.5, color.solid + '22');
    grad.addColorStop(1, color.solid + '00');
    return grad;
}

function sharedTooltip(extra = {}) {
    return {
        backgroundColor: tooltipBg(),
        titleColor: PAL.blue.solid,
        bodyColor: labelColor(),
        borderColor: PAL.blue.glow,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
        boxPadding: 6,
        displayColors: true,
        ...extra,
    };
}

function destroyChart(inst) { if (inst) inst.destroy(); return null; }

function renderWaitingTimeChart(processes) {
    wtChartInstance = destroyChart(wtChartInstance);

    const labels = processes.map(p => p.pid);
    const data = processes.map(p => p.waiting_time);
    const ctx = document.getElementById('wt-chart').getContext('2d');
    const bgColors = processes.map((_, i) => makeLinearGradient(ctx, PROCESS_COLORS[i % PROCESS_COLORS.length], true));
    const borderColors = processes.map((_, i) => PROCESS_COLORS[i % PROCESS_COLORS.length].solid);

    wtChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Waiting Time (units)',
                data,
                backgroundColor: bgColors,
                borderColor: borderColors,
                borderWidth: 2,
                borderRadius: { topLeft: 0, topRight: 8, bottomLeft: 0, bottomRight: 8 },
                borderSkipped: 'left',
                barThickness: 'flex',
                maxBarThickness: 38,
            }],
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 900,
                easing: 'easeOutExpo',
                delay: (ctx) => ctx.dataIndex * 80,
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    ...sharedTooltip(),
                    callbacks: {
                        label: (item) => `  ⏱  ${item.formattedValue}  time units`,
                    },
                },
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    color: (ctx) => borderColors[ctx.dataIndex],
                    font: { family: "'JetBrains Mono', monospace", size: 11, weight: '700' },
                    formatter: (v) => v === 0 ? '0' : v.toFixed(1),
                    padding: { left: 6 },
                },
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: { color: gridColor(), drawBorder: false },
                    ticks: {
                        color: tickColor(),
                        font: { family: "'JetBrains Mono', monospace", size: 10 },
                    },
                    border: { dash: [4, 4] },
                },
                y: {
                    grid: { display: false },
                    ticks: {
                        color: labelColor(),
                        font: { family: "'Outfit', sans-serif", size: 12, weight: '600' },
                    },
                },
            },
            layout: { padding: { right: 36 } },
        },
        plugins: [ChartDataLabels],
    });
}

function renderTurnaroundTimeChart(processes) {
    tatChartInstance = destroyChart(tatChartInstance);

    const labels = processes.map(p => p.pid);
    const data = processes.map(p => p.turnaround_time);
    const ctx = document.getElementById('tat-chart').getContext('2d');

    const lineColor = PAL.purple.solid;
    const areaFill = makeAreaGradient(ctx, PAL.purple);

    tatChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Turnaround Time (units)',
                data,
                borderColor: lineColor,
                borderWidth: 3,
                pointBackgroundColor: lineColor,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 9,
                pointHoverBackgroundColor: lineColor,
                pointHoverBorderWidth: 3,
                fill: true,
                backgroundColor: areaFill,
                tension: 0.45,
                shadowBlur: 20,
                shadowColor: PAL.purple.glow,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeOutQuart',
            },
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    ...sharedTooltip(),
                    callbacks: {
                        label: (item) => `  ↩  ${item.formattedValue}  time units`,
                    },
                },
                datalabels: {
                    align: 'top',
                    offset: 6,
                    color: lineColor,
                    font: { family: "'JetBrains Mono', monospace", size: 11, weight: '700' },
                    formatter: (v) => v.toFixed(1),
                },
            },
            scales: {
                x: {
                    grid: { color: gridColor(), drawBorder: false },
                    ticks: {
                        color: labelColor(),
                        font: { family: "'Outfit', sans-serif", size: 12, weight: '600' },
                    },
                },
                y: {
                    beginAtZero: true,
                    grid: { color: gridColor(), drawBorder: false },
                    ticks: {
                        color: tickColor(),
                        font: { family: "'JetBrains Mono', monospace", size: 10 },
                    },
                    border: { dash: [4, 4] },
                },
            },
            layout: { padding: { top: 28 } },
        },
        plugins: [ChartDataLabels, glowLinePlugin],
    });
}

const glowLinePlugin = {
    id: 'glowLine',
    beforeDatasetDraw(chart, args) {
        const ds = chart.data.datasets[args.index];
        if (!ds.shadowColor) return;
        const ctx = chart.ctx;
        ctx.save();
        ctx.shadowBlur = ds.shadowBlur || 16;
        ctx.shadowColor = ds.shadowColor || 'transparent';
    },
    afterDatasetDraw(chart) {
        chart.ctx.restore();
    },
};

function renderComparisonChart(comparison) {
    cmpChartInstance = destroyChart(cmpChartInstance);

    const ctx = document.getElementById('compare-chart').getContext('2d');

    const axes = ['Avg Waiting Time', 'Avg Turnaround Time'];

    const algos = [
        { key: 'fcfs', label: 'FCFS', color: PAL.blue },
        { key: 'sjf', label: 'SJF', color: PAL.teal },
        { key: 'rr', label: 'Round Robin', color: PAL.purple },
        { key: 'priority', label: 'Priority', color: PAL.orange },
        { key: 'ai', label: 'AI', color: PAL.pink },
    ];

    const allWt = algos.map(a => comparison[a.key].avg_waiting_time);
    const allTat = algos.map(a => comparison[a.key].avg_turnaround_time);
    const maxWt = Math.max(...allWt) || 1;
    const maxTat = Math.max(...allTat) || 1;

    const datasets = algos.map(a => {
        const rawWt = comparison[a.key].avg_waiting_time;
        const rawTat = comparison[a.key].avg_turnaround_time;

        const normWt = ((maxWt - rawWt) / maxWt) * 100;
        const normTat = ((maxTat - rawTat) / maxTat) * 100;

        return {
            label: a.label,
            data: [normWt, normTat],
            borderColor: a.color.solid,
            backgroundColor: a.color.fill,
            borderWidth: 2.5,
            pointBackgroundColor: a.color.solid,
            pointBorderColor: '#fff',
            pointRadius: 5,
            pointHoverRadius: 8,
            pointBorderWidth: 2,
        };
    });

    cmpChartInstance = new Chart(ctx, {
        type: 'radar',
        data: { labels: axes, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 1000, easing: 'easeOutQuart' },
            interaction: { mode: 'index' },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: labelColor(),
                        font: { family: "'Outfit', sans-serif", size: 12, weight: '500' },
                        boxWidth: 12,
                        boxHeight: 12,
                        borderRadius: 4,
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle',
                    },
                },
                tooltip: {
                    ...sharedTooltip(),
                    callbacks: {
                        title: (items) => items[0].label,
                        label: (item) => {
                            const algo = algos[item.datasetIndex];
                            const key = algo.key;
                            const wt = comparison[key].avg_waiting_time.toFixed(2);
                            const tat = comparison[key].avg_turnaround_time.toFixed(2);
                            return item.dataIndex === 0
                                ? `  ${item.dataset.label}  |  Avg Wait: ${wt}`
                                : `  ${item.dataset.label}  |  Avg TAT: ${tat}`;
                        },
                    },
                },
                datalabels: { display: false },
            },
            scales: {
                r: {
                    min: 0,
                    max: 100,
                    ticks: {
                        display: false,
                        stepSize: 25,
                    },
                    grid: {
                        color: gridColor(),
                        circular: true,
                    },
                    angleLines: { color: gridColor() },
                    pointLabels: {
                        color: labelColor(),
                        font: { family: "'Outfit', sans-serif", size: 13, weight: '700' },
                        padding: 12,
                    },
                },
            },
        },
        plugins: [ChartDataLabels],
    });

    renderComparisonTable(comparison, algos);
}

function renderComparisonTable(comparison, algos) {
  const wrap = document.getElementById('compare-table-wrap');
  if (!wrap) return;

  const bestWt  = Math.min(...algos.map(a => comparison[a.key].avg_waiting_time));
  const bestTat = Math.min(...algos.map(a => comparison[a.key].avg_turnaround_time));

  const rows = algos.map(a => {
    const wt  = comparison[a.key].avg_waiting_time;
    const tat = comparison[a.key].avg_turnaround_time;
    const wtBest  = wt  === bestWt  ? ' cmp-best' : '';
    const tatBest = tat === bestTat ? ' cmp-best' : '';
    return `
      <tr>
        <td><span class="cmp-dot" style="background:${a.color.solid};box-shadow:0 0 6px ${a.color.glow}"></span>${a.label}</td>
        <td class="cmp-num${wtBest}">${wt.toFixed(2)}${wtBest ? ' ★' : ''}</td>
        <td class="cmp-num${tatBest}">${tat.toFixed(2)}${tatBest ? ' ★' : ''}</td>
      </tr>`;
  }).join('');

  wrap.innerHTML = `
    <table class="cmp-table">
      <thead>
        <tr>
          <th>Algorithm</th>
          <th>Avg Waiting Time</th>
          <th>Avg Turnaround Time</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}
