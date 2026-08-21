import os
import urllib.request
from dotenv import load_dotenv

load_dotenv()

def descargar_desde_oci():
    os.makedirs("modelos", exist_ok=True)
    
    # Mapeo de la variable del .env hacia el nombre de archivo que espera FastAPI
    # Incluimos las URLs por defecto para que funcione en Railway sin necesidad de configurar variables de entorno manuales.
    modelos_urls = {
        "energia_pipeline_mvp.pkl": os.getenv("OCI_URL_XGBOOST", "https://objectstorage.us-chicago-1.oraclecloud.com/p/33VTEJz-EPMp6u0S6PCsKBhjj-QXluQLUTSIAuxzZlntzC8Gzc3Io-OmtMCdK27W/n/ax6qxftcbhy0/b/energiai-modelos/o/modelsenergia_pipeline_mvp.pkl"),
        "modelo_clasificacion_pipeline_mvp.pkl": os.getenv("OCI_URL_LOGREG", "https://objectstorage.us-chicago-1.oraclecloud.com/p/aYcaJaq9kOJbRqokHF-qV2ZUE0AO1spv0idZm6letY9TjsvYZk0-51f5TUAttz2H/n/ax6qxftcbhy0/b/energiai-modelos/o/modelsmodelo_clasificacion_pipeline_mvp.pkl"),
        "modelo_knn_pipeline.pkl": os.getenv("OCI_URL_KNN", "https://objectstorage.us-chicago-1.oraclecloud.com/p/_QtseE4JkAAJmM6jbUSiCn88kNf1eLBFB7xekxEQyxNya0BsMzj4HMyi6J8l6VNv/n/ax6qxftcbhy0/b/energiai-modelos/o/modelsmodelo_knn_pipeline.pkl"),
        "modelo_random_forest.joblib": os.getenv("OCI_URL_RF", "https://objectstorage.us-chicago-1.oraclecloud.com/p/wXLhkQzfRhS3LC6SZ8qxpqqPbI9hiRiqcilwhwEDSvv_qx-rpUi81D6kmxlHv4hH/n/ax6qxftcbhy0/b/energiai-modelos/o/modelsmodelo_random_forest.joblib")
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
