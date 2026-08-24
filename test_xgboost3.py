import joblib
import xgboost as xgb
from sklearn.base import BaseEstimator

if hasattr(xgb.XGBClassifier, '__sklearn_tags__'):
    _old_tags = xgb.XGBClassifier.__sklearn_tags__
    def _safe_tags(self):
        try:
            return _old_tags(self)
        except AttributeError as e:
            if "'super' object has no attribute '__sklearn_tags__'" in str(e):
                tags = BaseEstimator.__sklearn_tags__(self)
                return tags
            raise
    xgb.XGBClassifier.__sklearn_tags__ = _safe_tags

try:
    model = joblib.load('ml-service/energia_pipeline_mvp.pkl')
    print("Model loaded successfully")
except Exception as e:
    print("Error:", e)
