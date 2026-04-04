from flask import Blueprint,request,jsonify
from Data.sample_test import generate_sample
from Data.store import history_dict,delete_history,count_history
from ML_model.predictor import reset_predictor

data_bp = Blueprint("data", __name__)

@data_bp.route("/dataset", methods=["GET"])
def dataset():
    try:
        n = min(int(request.args.get("n", 50)), 500)
        seed = int(request.args.get("seed", 42))
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid query parameters"}), 400
    
    df = generate_sample(n=n,seed=seed)
    rows = df.to_dict(orient="records")

    return jsonify({
        "source": "synthetic",
        "count": len(rows),
        "schema": {
            "features": ["arrival_time", "prev_burst_avg", "prev_burst_count", "process_type"],
            "target": "burst_time",
            "process_type_encoding": {"0": "cpu", "1": "io", "2": "mixed"},
        },
        "data": rows,
    })

@data_bp.route("/history", methods=["GET"])
def history():
    rows = history_dict()
    return jsonify({
        "source": "csv",
        "count": len(rows),
        "schema": {
            "features": ["arrival_time", "prev_burst_avg", "prev_burst_count", "process_type"],
            "target": "burst_time",
            "extras": ["pid", "timestamp"],
        },
        "data": rows,
    })

@data_bp.route("/history/clear", methods=["POST"])
def clear():
    count_before = count_history()
    delete_history()
    reset_predictor()
    return jsonify({
        "message": "Execution history cleared.",
        "rows_deleted": count_before,
        "predictor_status": "reset to synthetic training data",
    })