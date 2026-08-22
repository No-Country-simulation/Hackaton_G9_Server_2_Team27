import os
import urllib.request
from dotenv import load_dotenv

load_dotenv()

def descargar_desde_oci():
    os.makedirs("modelos", exist_ok=True)
    
    # Mapeo de la variable del .env hacia el nombre de archivo que espera FastAPI
    # Incluimos las URLs por defecto para que funcione en Railway sin necesidad de configurar variables de entorno manuales.
    modelos_urls = {
        "energia_pipeline_mvp.pkl": os.getenv("OCI_URL_XGBOOST"),
        "modelo_clasificacion_pipeline_mvp.pkl": os.getenv("OCI_URL_LOGREG"),
        "modelo_knn_pipeline.pkl": os.getenv("OCI_URL_KNN"),
        "modelo_random_forest.joblib": os.getenv("OCI_URL_RF")
    }
    
    todas_existen = True
    for nombre_archivo, url in modelos_urls.items():
        ruta_local = os.path.join("modelos", nombre_archivo)
        
        if not os.path.exists(ruta_local):
            todas_existen = False
            if not url:
                print(f"⚠️ ERROR: No se encontró la URL para {nombre_archivo} en el .env")
                continue
                
            print(f"Descargando {nombre_archivo} desde OCI...")
            try:
                urllib.request.urlretrieve(url, ruta_local)
                print(f"✔️ {nombre_archivo} descargado con éxito.")
            except Exception as e:
                print(f"❌ Error al descargar {nombre_archivo}: {e}")
        else:
            print(f"✅ {nombre_archivo} ya existe localmente.")
            
    if todas_existen:
        print("✅ Todos los modelos están listos.")

if __name__ == "__main__":
    descargar_desde_oci()
