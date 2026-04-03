from flask import Blueprint,request,jsonify
from coreLogic.process import Process
from Algorithms.fcfs import fcfs
from Algorithms.sjf import sjf
from Algorithms.priority import priority
from Algorithms.round_robin import round_robin
from Algorithms.ai_schedular import ai_schedular
import copy

compare_bp = Blueprint("compare",__name__)

def parse_process(data):
    processes = []

    valid_types = {"cpu", "io", "mixed"}
    required = ["pid", "arrival_time", "burst_time"]
    
    for item in data:
        
        ptype = str(item.get("process_type", "cpu")).lower()
        if ptype not in valid_types:
            raise ValueError(f"Invalid process_type: {ptype}")
        
        for field in required:
            if field not in item:
                raise ValueError(f"Missing field '{field}' in {item}")
            
        try:

            arrival_time = float(item["arrival_time"])
            burst_time = float(item["burst_time"])
            priority = int(item.get("priority", 0))
            if arrival_time < 0 or burst_time <= 0:
                raise ValueError("Invalid arrival/burst time")
            if priority < 0:
                raise ValueError("priority must be >= 0")

            raw_pbt = item.get("prev_burst_times",[])
            if isinstance(raw_pbt,str):
                raw_pbt = [float(x.strip()) for x in raw_pbt.split(",") if x.strip()]
            else:
                raw_pbt = [float(v) for v in raw_pbt]

            if any(v < 0 for v in raw_pbt):
                raise ValueError("prev_burst_times must be non-negative")

            p = Process(pid=item["pid"],arrival_time=arrival_time,burst_time=burst_time,priority=priority,process_type=ptype,prev_burst_times=raw_pbt)
        except Exception as e:
            raise ValueError(f"{item} -> {str(e)}")
        
        processes.append(p)
    return processes

@compare_bp.route("/compare",methods = ["POST"])

def compare():
    body = request.get_json()
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
    _, prio_wt,  prio_tat,  _ = priority(copy.deepcopy(processes))

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