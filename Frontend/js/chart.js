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

const ALGO_META = [
    { key: 'fcfs', label: 'FCFS', color: PAL.blue },
    { key: 'sjf', label: 'SJF', color: PAL.teal },
    { key: 'rr', label: 'Round Robin', color: PAL.purple },
    { key: 'priority', label: 'Priority', color: PAL.orange },
    { key: 'ai', label: 'AI', color: PAL.pink },
];

function isDark() { return document.documentElement.getAttribute('data-theme') !== 'light'; }
function gridColor() { return isDark() ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.09)'; }
function tickColor() { return isDark() ? '#7da8d8' : '#2a5080'; }   // visible in both themes
function labelColor() { return isDark() ? '#e2f0ff' : '#0d2040'; }
function mutedColor() { return isDark() ? '#4a6a8a' : '#5a7a9a'; }
function tooltipBg() { return isDark() ? 'rgba(8,18,40,0.97)' : 'rgba(255,255,255,0.97)'; }
function tooltipTitle() { return isDark() ? '#38bdf8' : '#1565c0'; }
function tooltipBody() { return isDark() ? '#e2f0ff' : '#0d2040'; }
function tooltipBorder() { return isDark() ? 'rgba(56,189,248,0.4)' : 'rgba(21,101,192,0.35)'; }

function makeHorizGradient(ctx, color) {
    const w = ctx.canvas.offsetWidth || ctx.canvas.width || 400;
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, color.solid + 'ff');
    g.addColorStop(0.7, color.solid + 'cc');
    g.addColorStop(1, color.solid + '77');
    return g;
}

function makeAreaGradient(ctx, color) {
    const h = ctx.canvas.offsetHeight || ctx.canvas.height || 280;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, color.solid + '60');
    g.addColorStop(0.5, color.solid + '28');
    g.addColorStop(1, color.solid + '00');
    return g;
}

function makeVertGradient(ctx, color) {
    const h = ctx.canvas.offsetHeight || ctx.canvas.height || 280;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, color.solid + 'ff');
    g.addColorStop(1, color.solid + '88');
    return g;
}

function sharedTooltip(extra = {}) {
    return {
        backgroundColor: tooltipBg(),
        titleColor: tooltipTitle(),
        bodyColor: tooltipBody(),
        borderColor: tooltipBorder(),
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
        boxPadding: 6,
        displayColors: true,
        ...extra,
    };
}

function xScale(extra = {}) {
    return {
        grid: { color: gridColor(), drawBorder: false },
        ticks: { color: tickColor(), font: { family: "'JetBrains Mono',monospace", size: 10 } },
        border: { dash: [4, 4] },
        ...extra,
    };
}
function yScale(extra = {}) {
    return {
        grid: { color: gridColor(), drawBorder: false },
        ticks: { color: tickColor(), font: { family: "'JetBrains Mono',monospace", size: 10 } },
        border: { dash: [4, 4] },
        beginAtZero: true,
        ...extra,
    };
}

function destroyChart(inst) { if (inst) inst.destroy(); return null; }

const glowLinePlugin = {
    id: 'glowLine',
    beforeDatasetDraw(chart, args) {
        const ds = chart.data.datasets[args.index];
        if (!ds.shadowColor) return;
        const ctx = chart.ctx;
        ctx.save();
        ctx.shadowBlur = ds.shadowBlur || 18;
        ctx.shadowColor = ds.shadowColor || 'transparent';
    },
    afterDatasetDraw(chart) { chart.ctx.restore(); },
};

function renderWaitingTimeChart(processes) {
    wtChartInstance = destroyChart(wtChartInstance);

    const labels = processes.map(p => p.pid);
    const data = processes.map(p => p.waiting_time);
    const ctx = document.getElementById('wt-chart').getContext('2d');

    const bgColors = processes.map((_, i) => makeHorizGradient(ctx, PROCESS_COLORS[i % PROCESS_COLORS.length]));
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
                    callbacks: { label: (i) => `  ⏱  ${i.formattedValue} units` },
                },
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    color: (ctx) => borderColors[ctx.dataIndex],
                    font: { family: "'JetBrains Mono',monospace", size: 11, weight: '700' },
                    formatter: (v) => v === 0 ? '0' : v.toFixed(1),
                    padding: { left: 6 },
                },
            },
            scales: {
                x: xScale({ grid: { color: gridColor() } }),
                y: {
                    grid: { display: false },
                    ticks: {
                        color: labelColor(),
                        font: { family: "'Outfit',sans-serif", size: 12, weight: '600' },
                    },
                },
            },
            layout: { padding: { right: 40 } },
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
                pointBorderColor: isDark() ? '#0a1628' : '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 10,
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
            animation: { duration: 1000, easing: 'easeOutQuart' },
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    ...sharedTooltip(),
                    callbacks: { label: (i) => `  ↩  ${i.formattedValue} units` },
                },
                datalabels: {
                    align: 'top',
                    offset: 8,
                    color: lineColor,
                    font: { family: "'JetBrains Mono',monospace", size: 11, weight: '700' },
                    formatter: (v) => v.toFixed(1),
                },
            },
            scales: {
                x: {
                    grid: { color: gridColor(), drawBorder: false },
                    ticks: {
                        color: labelColor(),
                        font: { family: "'Outfit',sans-serif", size: 12, weight: '600' },
                    },
                },
                y: yScale(),
            },
            layout: { padding: { top: 30 } },
        },
        plugins: [ChartDataLabels, glowLinePlugin],
    });
}

function renderComparisonChart(comparison) {
    cmpChartInstance = destroyChart(cmpChartInstance);

    const ctx = document.getElementById('compare-chart').getContext('2d');

    const datasets = ALGO_META.map((a, i) => {
        const wt = comparison[a.key].avg_waiting_time;
        const tat = comparison[a.key].avg_turnaround_time;

        const barGrad = makeVertGradient(ctx, a.color);

        return {
            label: a.label,
            data: [wt, tat],
            backgroundColor: barGrad,
            borderColor: a.color.solid,
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
            hoverBackgroundColor: a.color.solid,
            hoverBorderWidth: 3,
        };
    });

    cmpChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Avg Waiting Time', 'Avg Turnaround Time'],
            datasets,
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 900,
                easing: 'easeOutExpo',
                delay: (ctx) => ctx.datasetIndex * 100,
            },
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: labelColor(),
                        font: { family: "'Outfit',sans-serif", size: 12, weight: '500' },
                        boxWidth: 12,
                        boxHeight: 12,
                        borderRadius: 4,
                        padding: 18,
                        usePointStyle: true,
                        pointStyle: 'rectRounded',
                    },
                },
                tooltip: {
                    ...sharedTooltip(),
                    callbacks: {
                        label: (item) => {
                            const a = ALGO_META[item.datasetIndex];
                            const wt = comparison[a.key].avg_waiting_time.toFixed(2);
                            const tat = comparison[a.key].avg_turnaround_time.toFixed(2);
                            return `  ${a.label}  →  WT: ${wt}  |  TAT: ${tat}`;
                        },
                    },
                },
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    color: (ctx) => ALGO_META[ctx.datasetIndex].color.solid,
                    font: { family: "'JetBrains Mono',monospace", size: 9, weight: '700' },
                    formatter: (v) => v.toFixed(1),
                    rotation: -45,
                    padding: { bottom: 4 },
                    display: (ctx) => ctx.chart.chartArea && ctx.chart.chartArea.width > 420,
                },
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        color: labelColor(),
                        font: { family: "'Outfit',sans-serif", size: 13, weight: '700' },
                    },
                },
                y: yScale({
                    ticks: {
                        color: tickColor(),
                        font: { family: "'JetBrains Mono',monospace", size: 10 },
                    },
                }),
            },
            layout: { padding: { top: 20 } },
        },
        plugins: [ChartDataLabels],
    });

    renderComparisonTable(comparison);
}

function renderComparisonTable(comparison) {
    const wrap = document.getElementById('compare-table-wrap');
    if (!wrap) return;

    const bestWt = Math.min(...ALGO_META.map(a => comparison[a.key].avg_waiting_time));
    const bestTat = Math.min(...ALGO_META.map(a => comparison[a.key].avg_turnaround_time));

    const rows = ALGO_META.map(a => {
        const wt = comparison[a.key].avg_waiting_time;
        const tat = comparison[a.key].avg_turnaround_time;
        const wtBest = wt === bestWt ? ' cmp-best' : '';
        const tatBest = tat === bestTat ? ' cmp-best' : '';
        return `
        <tr>
            <td>
                <span class="cmp-dot" style="background:${a.color.solid};box-shadow:0 0 6px ${a.color.glow}"></span>
                ${a.label}
            </td>
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
