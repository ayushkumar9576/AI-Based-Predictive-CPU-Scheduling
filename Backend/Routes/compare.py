from flask import Blueprint,request,jsonify
from coreLogic.process import Process
from Algorithms.fcfs import fcfs
from Algorithms.sjf import sjf
from Algorithms.priority import priority as run_priority
from Algorithms.round_robin import round_robin
from Algorithms.ai_schedular import ai_schedular
from util import parse_process
import copy

compare_bp = Blueprint("compare",__name__)

@compare_bp.route("/compare",methods = ["POST"])

def compare():
    body = request.get_json(silent=True)
    if not body or "processes" not in body:
        return jsonify({"error": "Missing 'processes' in request body"}), 400
    try:
        processes = parse_process(body["processes"])
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    
    if not processes:
        return jsonify({"error": "No processes provided"}), 400
    
    try:
        quant = float(body.get("quantum", 2))
    except (ValueError, TypeError):
        return jsonify({"error": "Quantum must be a number"}), 400
    if quant <= 0:
        return jsonify({"error": "Quantum must be positive"}), 400
    
    _, fcfs_wt,  fcfs_tat,  _ = fcfs(copy.deepcopy(processes))
    _, sjf_wt,   sjf_tat,   _ = sjf(copy.deepcopy(processes))
    _, ai_wt,    ai_tat,    _ = ai_schedular(copy.deepcopy(processes))
    _, rr_wt,    rr_tat,    _ = round_robin(copy.deepcopy(processes), quantum=quant)
    _, prio_wt,  prio_tat,  _ = run_priority(copy.deepcopy(processes))

    return jsonify(
        {
            "comparison": {
                "fcfs":     {"avg_waiting_time": fcfs_wt,  "avg_turnaround_time": fcfs_tat},
                "sjf":      {"avg_waiting_time": sjf_wt,   "avg_turnaround_time": sjf_tat},
                "ai":       {"avg_waiting_time": ai_wt,    "avg_turnaround_time": ai_tat},
                "rr":       {"avg_waiting_time": rr_wt,    "avg_turnaround_time": rr_tat},
                "priority": {"avg_waiting_time": prio_wt,  "avg_turnaround_time": prio_tat},
            }
        }
    )