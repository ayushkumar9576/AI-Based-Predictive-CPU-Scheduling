from flask import Blueprint,request,jsonify
from Algorithms.fcfs import fcfs
from Algorithms.sjf import sjf
from Algorithms.priority import priority
from Algorithms.round_robin import round_robin
from Algorithms.ai_schedular import ai_schedular
from ML_model.predictor import get_predictor
from Routes.util import parse_process
from Data.store import append_data,load_history
import logging
app_logger = logging.getLogger(__name__)

schedule_bp = Blueprint("schedule", __name__)
@schedule_bp.route("/schedule", methods=["POST"])
def schedule():
    body = request.get_json(silent=True)
    if not body or "processes" not in body:
        return jsonify({"error": "Missing 'processes' in request body"}), 400
    if not isinstance(body["processes"], list) or not body["processes"]:
        return jsonify({"error": "Processes must be a non-empty list"}), 400

    algorithm = request.args.get("algorithm","fcfs").lower()

    try:
        processes = parse_process(body["processes"])
    except Exception as e:
        return jsonify({"error": f"Invalid process data: {str(e)}"}), 400
    
    if not processes:
        return jsonify({"error": "No valid processes after parsing"}), 400

    ALGORITHMS = {
        "fcfs": fcfs,
        "sjf": sjf,
        "ai": ai_schedular,
        "rr": round_robin,
        "priority": priority
    }

    if algorithm not in ALGORITHMS:
        return jsonify({"error": f"Unknown algorithm '{algorithm}'"}), 400

    if algorithm == "rr":
        try:
            quantum = float(body.get("quantum", 2))
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid quantum value"}), 400
        scheduled, avg_wt, avg_tat, gantt = ALGORITHMS[algorithm](processes, quantum=quantum)
    else:
        scheduled, avg_wt, avg_tat, gantt = ALGORITHMS[algorithm](processes)
    
    try:
        append_data(scheduled)
        history = load_history()
        get_predictor().retrain(history)
    except Exception as exc:
        app_logger.warning("History append/retrain failed: %s", exc)

    return jsonify(
        {
            "algorithm": algorithm,
            "processes": [p.to_dict() for p in scheduled],
            "avg_waiting_time": avg_wt,
            "avg_turnaround_time": avg_tat,
            "gantt": gantt,
        }
    )