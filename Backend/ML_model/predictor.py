import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error

from Data.sample_test import generate_sample, getFeature, Process_Types, getBurst

MIN_REAL_ROWS = 50

FEATURE_NAMES = ["arrival_time","prev_burst_avg","prev_burst_count","is_cpu","is_io","is_mixed"]

class BurstPredictor:
    def __init__(self):
        self.model = GradientBoostingRegressor(n_estimators=120,learning_rate=0.08,max_depth=3,random_state=42)
        self._trained = False
        self.last_mae: float|None=None
        self.feature_importances_:dict[str, float] | None = None

        self._train_initial()
    
    def _train_initial(self):
        df = generate_sample(500)
        x = getFeature(df)
        y = getBurst(df)
        self.model.fit(x,y)
        self._trained = True
        self._evaluate(x,y)
        self._report_importances()
    
    def _build_training_data(self,history_df=None)->tuple[np.ndarray,np.ndarray]:
        sample_df = generate_sample(500)

        if history_df is None or len(history_df)==0:
            return getFeature(sample_df),getBurst(sample_df)
        
        needed = ["arrival_time","prev_burst_avg","prev_burst_count","process_type","burst_time"]
        hist = history_df[needed].copy()
        hist = hist.fillna(0)
        if len(hist)>=MIN_REAL_ROWS:
            x = getFeature(hist)
            y = hist["burst_time"].values
        else:
            combined = pd.concat([hist,sample_df],ignore_index=True)
            x = getFeature(combined)
            y = combined["burst_time"].values

        return x,y
    
    def _evaluate(self,x :np.ndarray,y : np.ndarray)->None:
        prediction = self.model.predict(x)
        self.last_mae = float(mean_absolute_error(y,prediction))
        print(f"[BurstPredictor] Training MAE: {self.last_mae:.4f}")
    
    def _report_importances(self)->None:
        importance = self.model.feature_importances_
        ranked = sorted(zip(FEATURE_NAMES, importance),key=lambda x: x[1],reverse=True,)
        self.feature_importances_ = dict(ranked)
        print("[BurstPredictor] Feature importances:")
        for name, score in ranked:
            print(f"  {name:20s}: {score:.4f}")

    def retrain(self,history_df=None)->None:
        x,y = self._build_training_data(history_df)

        x = np.nan_to_num(x)
        
        self.model.fit(x,y)
        self._evaluate(x,y)
        self._report_importances()

    def predict(self,arrival_time: float,prev_burst_avg: float,prev_burst_count: int,process_type: str | int = "cpu",) -> float:
        if isinstance(process_type,str):
            pt_int = Process_Types.get(process_type.lower(),0)
        else:
            pt_int = int(process_type)
        
        is_cpu   = 1 if pt_int == 0 else 0
        is_io    = 1 if pt_int == 1 else 0
        is_mixed = 1 if pt_int == 2 else 0

        X = np.array([[arrival_time, prev_burst_avg, prev_burst_count,
                       is_cpu, is_io, is_mixed]])
        
        prediction = self.model.predict(X)[0]
        return max(1.0, round(float(prediction), 4))

_predictor_instance: BurstPredictor|None = None

def get_predictor() ->BurstPredictor:
    global _predictor_instance
    if _predictor_instance is None:
        _predictor_instance = BurstPredictor()
    return _predictor_instance

def reset_predictor()->None:
    global _predictor_instance
    _predictor_instance=None

