const GANTT_COLORS = [
  '#00b3ff', '#21f6da', '#825bf6', '#ff4da9',
  '#ff8c2f', '#44f986', '#facc15', '#4c9af9',
  '#e159f6', '#069862', '#ec3f3f', '#ffb700',
];

const pidColorMap = {};
let colorIndex = 0;

function getPidColor(pid) {
  if (pid === 'IDLE') return null;
  if (!pidColorMap[pid]) {
    pidColorMap[pid] = GANTT_COLORS[colorIndex % GANTT_COLORS.length];
    colorIndex++;
  }
  return pidColorMap[pid];
}

function resetGanttColors() {
  Object.keys(pidColorMap).forEach(k => delete pidColorMap[k]);
  colorIndex = 0;
}

/**
    @param {Array}  ganttData
    @param {number} speedMs
*/

function renderGantt(ganttData, speedMs) {
  const container = document.getElementById('gantt-container');
  const timeline = document.getElementById('gantt-timeline');
  container.innerHTML = '';
  if (timeline) timeline.innerHTML = '';

  if (!ganttData || ganttData.length === 0) return;

  const totalDuration = ganttData[ganttData.length - 1].end - ganttData[0].start;
  const MIN_FLEX = 1;

  ganttData.forEach(block => {
    const duration = block.end - block.start;
    const flexGrow = Math.max(MIN_FLEX, (duration / totalDuration) * 40);
    const color    = getPidColor(block.pid);

    const col = document.createElement('div');
    col.className  = 'gantt-col';
    col.style.flexGrow   = flexGrow;
    col.style.flexShrink = 0;

    const blockEl = document.createElement('div');
    blockEl.className = block.pid === 'IDLE' ? 'gantt-block idle' : 'gantt-block';

    if (color) {
      blockEl.style.background = `linear-gradient(135deg, ${color}cc, ${color}88)`;
      blockEl.style.boxShadow  = `0 2px 14px ${color}55, inset 0 1px 0 rgba(255,255,255,0.15)`;
    }
    blockEl.title = `${block.pid}  [${block.start} → ${block.end}]`;

    const pidLabel = document.createElement('span');
    pidLabel.textContent = block.pid;
    blockEl.appendChild(pidLabel);

    const timeLabel = document.createElement('div');
    timeLabel.className   = 'gantt-time-label';
    timeLabel.textContent = block.start;

    col.appendChild(blockEl);
    col.appendChild(timeLabel);
    container.appendChild(col);
  });

  const endCol = document.createElement('div');
  endCol.className  = 'gantt-col gantt-col--end';
  endCol.style.flexGrow   = 0;
  endCol.style.flexShrink = 0;

  const endLabel = document.createElement('div');
  endLabel.className   = 'gantt-time-label';
  endLabel.textContent = ganttData[ganttData.length - 1].end;

  endCol.appendChild(endLabel);
  container.appendChild(endCol);

  const blocks = container.querySelectorAll('.gantt-block');
  blocks.forEach((b, idx) => {
    setTimeout(() => b.classList.add('visible'), idx * speedMs);
  });
}